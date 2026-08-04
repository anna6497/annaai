from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Any

from openai import OpenAI

CHINESE_RE = re.compile(r"[\u3400-\u9fff]")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replace duplicate Hanzi across HSK 1-6 while keeping IDs and metadata."
    )
    parser.add_argument("--data-dir", default="data/speaking-practice")
    parser.add_argument("--model", default="gpt-4.1-mini")
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument("--max-retries", type=int, default=5)
    parser.add_argument("--sleep", type=float, default=1.0)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def normalize_hanzi(value: str) -> str:
    return re.sub(r"[\s。！？!?，,；;：:“”\"'（）()、…]", "", value)


TONE_MARKS = {
    "ā": ("a", 1), "á": ("a", 2), "ǎ": ("a", 3), "à": ("a", 4),
    "ē": ("e", 1), "é": ("e", 2), "ě": ("e", 3), "è": ("e", 4),
    "ī": ("i", 1), "í": ("i", 2), "ǐ": ("i", 3), "ì": ("i", 4),
    "ō": ("o", 1), "ó": ("o", 2), "ǒ": ("o", 3), "ò": ("o", 4),
    "ū": ("u", 1), "ú": ("u", 2), "ǔ": ("u", 3), "ù": ("u", 4),
    "ǖ": ("v", 1), "ǘ": ("v", 2), "ǚ": ("v", 3), "ǜ": ("v", 4),
    "ü": ("v", 5),
}


def pinyin_to_numbered(pinyin: str) -> str:
    tokens = re.findall(
        r"[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+|[^\w\s]",
        pinyin,
    )
    converted: list[str] = []

    for token in tokens:
        if not re.search(r"[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]", token):
            continue

        tone = 5
        letters: list[str] = []

        for character in token.lower():
            if character in TONE_MARKS:
                base, detected_tone = TONE_MARKS[character]
                letters.append(base)
                tone = detected_tone
            else:
                decomposed = unicodedata.normalize("NFD", character)
                base = "".join(
                    part
                    for part in decomposed
                    if unicodedata.category(part) != "Mn"
                )
                letters.append(base.replace("ü", "v"))

        syllable = "".join(letters).strip()
        if syllable:
            converted.append(f"{syllable}{tone}")

    return " ".join(converted)


def extract_tones(pinyin_numbered: str) -> list[int]:
    tones: list[int] = []
    for token in pinyin_numbered.split():
        match = re.search(r"([1-5])$", token)
        tones.append(int(match.group(1)) if match else 5)
    return tones


def estimate_target_duration(pinyin_numbered: str) -> float:
    syllable_count = len(pinyin_numbered.split())
    return round(max(1.2, min(12.0, syllable_count * 0.45)), 2)


def extract_keywords(hanzi: str, level: int) -> list[str]:
    unique: list[str] = []
    for character in hanzi:
        if CHINESE_RE.match(character) and character not in unique:
            unique.append(character)
        if len(unique) >= min(6, level + 2):
            break
    return unique


def infer_grammar(hanzi: str) -> list[str]:
    grammar: list[str] = []
    patterns = [
        ("吗", "吗 question"), ("呢", "呢 question"), ("正在", "正在"),
        ("了", "了"), ("过", "过"), ("把", "把"), ("被", "被"),
        ("比", "比"), ("如果", "如果…就…"), ("因为", "因为…所以…"),
        ("虽然", "虽然…但是…"), ("一边", "一边…一边…"),
    ]
    for marker, label in patterns:
        if marker in hanzi:
            grammar.append(label)
        if len(grammar) >= 4:
            break
    return grammar


def save_json_atomic(path: Path, value: Any) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(path)


def response_schema(count: int) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "sentences": {
                "type": "array",
                "minItems": count,
                "maxItems": count,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "hanzi": {"type": "string"},
                        "pinyin": {"type": "string"},
                        "myanmar": {"type": "string"},
                    },
                    "required": ["id", "hanzi", "pinyin", "myanmar"],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["sentences"],
        "additionalProperties": False,
    }


def main() -> int:
    args = parse_args()
    data_dir = Path(args.data_dir).resolve()

    if not os.getenv("OPENAI_API_KEY") and not args.dry_run:
        print("ERROR: OPENAI_API_KEY is not set.", file=sys.stderr)
        return 1

    files: dict[int, Path] = {}
    datasets: dict[int, list[dict[str, Any]]] = {}

    for level in range(1, 7):
        path = data_dir / f"hsk{level}.json"
        if not path.exists():
            print(f"ERROR: Missing file: {path}", file=sys.stderr)
            return 1

        rows = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(rows, list):
            print(f"ERROR: {path} must contain a JSON array.", file=sys.stderr)
            return 1

        files[level] = path
        datasets[level] = rows

    occurrences: dict[str, list[tuple[int, int]]] = defaultdict(list)

    for level, rows in datasets.items():
        for index, row in enumerate(rows):
            normalized = normalize_hanzi(str(row.get("hanzi", "")))
            if normalized:
                occurrences[normalized].append((level, index))

    duplicate_targets: list[tuple[int, int]] = []
    for locations in occurrences.values():
        if len(locations) > 1:
            duplicate_targets.extend(locations[1:])

    duplicate_targets.sort()

    print(f"Duplicate rows to replace: {len(duplicate_targets)}")
    for level, index in duplicate_targets:
        row = datasets[level][index]
        print(
            f"- {row.get('id')} | HSK {level} | "
            f"{row.get('category')} | {row.get('hanzi')}"
        )

    if args.dry_run or not duplicate_targets:
        return 0

    client = OpenAI()

    all_unique_hanzi = {
        normalize_hanzi(str(row.get("hanzi", "")))
        for rows in datasets.values()
        for row in rows
        if str(row.get("hanzi", "")).strip()
    }

    for offset in range(0, len(duplicate_targets), args.batch_size):
        batch_locations = duplicate_targets[offset : offset + args.batch_size]

        pending = [
            {
                "id": datasets[level][index]["id"],
                "level": level,
                "lesson": datasets[level][index]["lesson"],
                "category": datasets[level][index]["category"],
                "oldHanzi": datasets[level][index]["hanzi"],
            }
            for level, index in batch_locations
        ]

        replacements: dict[str, dict[str, str]] = {}

        for retry in range(1, args.max_retries + 1):
            missing = [item for item in pending if item["id"] not in replacements]
            if not missing:
                break

            prompt = f"""
Replace exactly these {len(missing)} duplicate Anna AI speaking sentences.

Return for every supplied ID:
- id unchanged
- new unique hanzi
- pinyin with tone marks
- natural Myanmar translation

Rules:
1. Preserve the exact ID.
2. Match each row's HSK level, lesson, and category.
3. Use natural spoken Mandarin.
4. The new sentence must be meaningfully different from the old one.
5. Do not create generic repeated sentences.
6. Burmese must be accurate and natural.

Rows:
{json.dumps(missing, ensure_ascii=False, indent=2)}
""".strip()

            response = client.chat.completions.create(
                model=args.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Create concise, unique Mandarin learning content "
                            "for Myanmar learners."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "duplicate_replacements",
                        "strict": True,
                        "schema": response_schema(len(missing)),
                    },
                },
            )

            content = response.choices[0].message.content
            if not content:
                raise RuntimeError("API returned empty content.")

            generated = json.loads(content)["sentences"]

            for item in generated:
                sentence_id = str(item["id"]).strip()
                hanzi = str(item["hanzi"]).strip()
                normalized = normalize_hanzi(hanzi)

                if (
                    not hanzi
                    or not CHINESE_RE.search(hanzi)
                    or normalized in all_unique_hanzi
                ):
                    print(
                        f"REJECT {sentence_id}: duplicate or invalid Hanzi "
                        f"{hanzi!r}"
                    )
                    continue

                replacements[sentence_id] = {
                    "hanzi": hanzi,
                    "pinyin": str(item["pinyin"]).strip(),
                    "myanmar": str(item["myanmar"]).strip(),
                }
                all_unique_hanzi.add(normalized)

            if len(replacements) < len(pending):
                print(
                    f"Retry {retry}: "
                    f"{len(pending) - len(replacements)} still missing"
                )
                time.sleep(max(0, args.sleep))

        missing_ids = [
            item["id"]
            for item in pending
            if item["id"] not in replacements
        ]

        if missing_ids:
            print(
                f"ERROR: Could not replace: {missing_ids}",
                file=sys.stderr,
            )
            return 2

        changed_levels: set[int] = set()

        for level, index in batch_locations:
            row = datasets[level][index]
            replacement = replacements[row["id"]]

            hanzi = replacement["hanzi"]
            pinyin = replacement["pinyin"]
            pinyin_numbered = pinyin_to_numbered(pinyin)

            row["hanzi"] = hanzi
            row["pinyin"] = pinyin
            row["pinyinNumbered"] = pinyin_numbered
            row["myanmar"] = replacement["myanmar"]
            row["english"] = ""
            row["keywords"] = extract_keywords(hanzi, level)
            row["grammar"] = infer_grammar(hanzi)
            row["tones"] = extract_tones(pinyin_numbered)
            row["targetDuration"] = estimate_target_duration(pinyin_numbered)

            changed_levels.add(level)

        for level in changed_levels:
            save_json_atomic(files[level], datasets[level])

        print(
            f"Saved duplicate-repair batch "
            f"{offset + 1}-{offset + len(batch_locations)}"
        )

    print("Duplicate repair complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())