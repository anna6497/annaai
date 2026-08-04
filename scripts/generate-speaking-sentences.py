from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from pathlib import Path
from typing import Any

from openai import OpenAI


CHINESE_RE = re.compile(r"[\u3400-\u9fff]")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Anna AI low-cost speaking sentence generator. "
            "Keeps existing JSON rows and continues from the next ID."
        )
    )
    parser.add_argument(
        "--plan",
        default="generation-plan.json",
    )
    parser.add_argument(
        "--data-dir",
        default="data/speaking-practice",
    )
    parser.add_argument(
        "--level",
        type=int,
        choices=range(1, 7),
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
    )
    parser.add_argument(
        "--model",
        default="gpt-4.1-mini",
    )
    parser.add_argument(
        "--max-batches",
        type=int,
        default=0,
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=5,
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
    )
    return parser.parse_args()


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default

    return json.loads(
        path.read_text(
            encoding="utf-8"
        )
    )


def save_json_atomic(
    path: Path,
    value: Any,
) -> None:
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    temporary = path.with_suffix(
        path.suffix + ".tmp"
    )

    temporary.write_text(
        json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    temporary.replace(path)


def normalize_hanzi(
    value: str,
) -> str:
    return re.sub(
        r"[\s。！？!?，,；;：:“”\"'（）()、…]",
        "",
        value,
    )


def calculate_lesson(
    index: int,
    target: int,
    lesson_count: int,
) -> int:
    per_lesson = max(
        1,
        (
            target
            + lesson_count
            - 1
        )
        // lesson_count,
    )

    return min(
        lesson_count,
        (
            (index - 1)
            // per_lesson
        )
        + 1,
    )


def audio_paths(
    level: int,
    number: int,
) -> dict[str, str]:
    stem = f"{number:06d}"

    return {
        "normal": (
            f"/audio/speaking-practice/"
            f"hsk{level}/{stem}.mp3"
        ),
        "slow": (
            f"/audio/speaking-practice/"
            f"hsk{level}/{stem}_slow.mp3"
        ),
    }


TONE_MARKS = {
    "ā": ("a", 1),
    "á": ("a", 2),
    "ǎ": ("a", 3),
    "à": ("a", 4),
    "ē": ("e", 1),
    "é": ("e", 2),
    "ě": ("e", 3),
    "è": ("e", 4),
    "ī": ("i", 1),
    "í": ("i", 2),
    "ǐ": ("i", 3),
    "ì": ("i", 4),
    "ō": ("o", 1),
    "ó": ("o", 2),
    "ǒ": ("o", 3),
    "ò": ("o", 4),
    "ū": ("u", 1),
    "ú": ("u", 2),
    "ǔ": ("u", 3),
    "ù": ("u", 4),
    "ǖ": ("v", 1),
    "ǘ": ("v", 2),
    "ǚ": ("v", 3),
    "ǜ": ("v", 4),
    "ü": ("v", 5),
}


def pinyin_to_numbered(
    pinyin: str,
) -> str:
    tokens = re.findall(
        r"[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+|[^\w\s]",
        pinyin,
    )

    converted: list[str] = []

    for token in tokens:
        if not re.search(
            r"[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]",
            token,
        ):
            continue

        tone = 5
        letters: list[str] = []

        for char in token.lower():
            if char in TONE_MARKS:
                base, detected_tone = TONE_MARKS[char]
                letters.append(base)
                tone = detected_tone
            else:
                decomposed = unicodedata.normalize(
                    "NFD",
                    char,
                )

                base = "".join(
                    item
                    for item in decomposed
                    if unicodedata.category(item)
                    != "Mn"
                )

                letters.append(
                    base.replace("ü", "v")
                )

        syllable = "".join(letters).strip()

        if syllable:
            converted.append(
                f"{syllable}{tone}"
            )

    return " ".join(converted)


def extract_tones(
    pinyin_numbered: str,
) -> list[int]:
    tones: list[int] = []

    for token in pinyin_numbered.split():
        match = re.search(
            r"([1-5])$",
            token,
        )

        tones.append(
            int(match.group(1))
            if match
            else 5
        )

    return tones


def estimate_target_duration(
    pinyin_numbered: str,
) -> float:
    syllable_count = len(
        pinyin_numbered.split()
    )

    duration = max(
        1.2,
        syllable_count * 0.45,
    )

    return round(
        min(duration, 12.0),
        2,
    )


def extract_keywords(
    hanzi: str,
    level: int,
) -> list[str]:
    unique: list[str] = []

    for character in hanzi:
        if (
            CHINESE_RE.match(character)
            and character not in unique
        ):
            unique.append(character)

        if len(unique) >= min(
            6,
            level + 2,
        ):
            break

    return unique


def infer_grammar(
    hanzi: str,
) -> list[str]:
    grammar: list[str] = []

    patterns = [
        ("吗", "吗 question"),
        ("呢", "呢 question"),
        ("正在", "正在"),
        ("了", "了"),
        ("过", "过"),
        ("把", "把"),
        ("被", "被"),
        ("比", "比"),
        ("如果", "如果…就…"),
        ("因为", "因为…所以…"),
        ("虽然", "虽然…但是…"),
        ("一边", "一边…一边…"),
    ]

    for marker, label in patterns:
        if marker in hanzi:
            grammar.append(label)

        if len(grammar) >= 4:
            break

    return grammar


def response_schema(
    count: int,
) -> dict[str, Any]:
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
                        "hanzi": {
                            "type": "string",
                        },
                        "pinyin": {
                            "type": "string",
                        },
                        "myanmar": {
                            "type": "string",
                        },
                    },
                    "required": [
                        "hanzi",
                        "pinyin",
                        "myanmar",
                    ],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["sentences"],
        "additionalProperties": False,
    }


def build_prompt(
    level: int,
    category: str,
    lesson: int,
    count: int,
    recent_hanzi: list[str],
) -> str:
    recent = "\n".join(
        f"- {item}"
        for item in recent_hanzi[-20:]
    )

    return f"""
Create exactly {count} unique Mandarin speaking-practice sentences.

Learners: Myanmar users
HSK level: {level}
Lesson: {lesson}
Category: {category}

Return only:
- hanzi
- pinyin with tone marks
- natural Myanmar translation

Rules:
1. Use natural spoken Mandarin.
2. Match HSK level {level}.
3. Every sentence must be useful in real conversation.
4. Do not create near-duplicates by changing only names, numbers, or dates.
5. Burmese must be accurate and natural.
6. Use normal Chinese punctuation.
7. Avoid these recent sentences:

{recent if recent else "- none"}
""".strip()


def validate_generated(
    item: dict[str, Any],
) -> list[str]:
    errors: list[str] = []

    hanzi = str(
        item.get("hanzi", "")
    ).strip()

    pinyin = str(
        item.get("pinyin", "")
    ).strip()

    myanmar = str(
        item.get("myanmar", "")
    ).strip()

    if (
        not hanzi
        or not CHINESE_RE.search(hanzi)
    ):
        errors.append(
            "invalid hanzi"
        )

    if not pinyin:
        errors.append(
            "empty pinyin"
        )

    if not myanmar:
        errors.append(
            "empty myanmar"
        )

    return errors


def main() -> int:
    args = parse_args()

    if (
        not os.getenv("OPENAI_API_KEY")
        and not args.dry_run
    ):
        print(
            "ERROR: OPENAI_API_KEY is not set.",
            file=sys.stderr,
        )
        return 1

    plan_path = Path(
        args.plan
    ).resolve()

    data_dir = Path(
        args.data_dir
    ).resolve()

    plan = load_json(
        plan_path,
        None,
    )

    if not isinstance(plan, dict):
        print(
            f"ERROR: Invalid plan file: "
            f"{plan_path}",
            file=sys.stderr,
        )
        return 1

    selected_levels = [
        item
        for item in plan["levels"]
        if (
            args.level is None
            or int(item["level"])
            == args.level
        )
    ]

    print(
        f"Model: {args.model}"
    )

    print(
        f"Batch size: "
        f"{args.batch_size}"
    )

    print(
        f"Data directory: "
        f"{data_dir}"
    )

    if args.dry_run:
        for level_plan in selected_levels:
            level = int(
                level_plan["level"]
            )

            path = (
                data_dir
                / f"hsk{level}.json"
            )

            existing = load_json(
                path,
                [],
            )

            print(
                f"HSK {level}: "
                f"existing={len(existing)}, "
                f"target={level_plan['target']}, "
                f"remaining="
                f"{max(0, int(level_plan['target']) - len(existing))}"
            )

        return 0

    client = OpenAI()
    successful_batches = 0

    for level_plan in selected_levels:
        level = int(
            level_plan["level"]
        )

        target = int(
            level_plan["target"]
        )

        difficulty = int(
            level_plan["difficulty"]
        )

        lesson_count = int(
            level_plan["lessons"]
        )

        categories = list(
            level_plan["categories"]
        )

        output_path = (
            data_dir
            / f"hsk{level}.json"
        )

        sentences = load_json(
            output_path,
            [],
        )

        if not isinstance(
            sentences,
            list,
        ):
            print(
                f"ERROR: {output_path} "
                "must contain a JSON array.",
                file=sys.stderr,
            )
            return 1

        seen_hanzi = {
            normalize_hanzi(
                str(
                    item.get(
                        "hanzi",
                        "",
                    )
                )
            )
            for item in sentences
            if str(
                item.get(
                    "hanzi",
                    "",
                )
            ).strip()
        }

        print(
            f"\nHSK {level}: "
            f"{len(sentences)} / "
            f"{target}"
        )

        while len(sentences) < target:
            remaining = (
                target
                - len(sentences)
            )

            requested = min(
                args.batch_size,
                remaining,
            )

            starting_number = (
                len(sentences) + 1
            )

            lesson = calculate_lesson(
                starting_number,
                target,
                lesson_count,
            )

            category = categories[
                (lesson - 1)
                % len(categories)
            ]

            accepted: list[
                dict[str, Any]
            ] = []

            for retry in range(
                1,
                args.max_retries + 1,
            ):
                still_needed = (
                    requested
                    - len(accepted)
                )

                if still_needed <= 0:
                    break

                print(
                    f"Generate HSK {level}: "
                    f"{starting_number + len(accepted):06d}-"
                    f"{starting_number + requested - 1:06d} "
                    f"| lesson {lesson} "
                    f"| {category} "
                    f"| try {retry}"
                )

                response = client.chat.completions.create(
                    model=args.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "Create concise, accurate Mandarin "
                                "learning content for Myanmar learners."
                            ),
                        },
                        {
                            "role": "user",
                            "content": build_prompt(
                                level=level,
                                category=category,
                                lesson=lesson,
                                count=still_needed,
                                recent_hanzi=[
                                    str(
                                        item.get(
                                            "hanzi",
                                            "",
                                        )
                                    )
                                    for item in sentences
                                ]
                                + [
                                    item["hanzi"]
                                    for item in accepted
                                ],
                            ),
                        },
                    ],
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": (
                                "speaking_sentence_batch"
                            ),
                            "strict": True,
                            "schema": response_schema(
                                still_needed
                            ),
                        },
                    },
                )

                content = (
                    response
                    .choices[0]
                    .message
                    .content
                )

                if not content:
                    raise RuntimeError(
                        "The API returned empty content."
                    )

                generated = json.loads(
                    content
                )["sentences"]

                current_batch_seen: set[
                    str
                ] = set()

                for raw in generated:
                    errors = validate_generated(
                        raw
                    )

                    normalized = normalize_hanzi(
                        str(
                            raw.get(
                                "hanzi",
                                "",
                            )
                        )
                    )

                    if (
                        normalized in seen_hanzi
                        or normalized
                        in current_batch_seen
                    ):
                        errors.append(
                            "duplicate hanzi"
                        )

                    if errors:
                        print(
                            "  REJECT:",
                            raw.get(
                                "hanzi",
                                "",
                            ),
                            "|",
                            "; ".join(errors),
                        )
                        continue

                    number = (
                        len(sentences)
                        + len(accepted)
                        + 1
                    )

                    hanzi = str(
                        raw["hanzi"]
                    ).strip()

                    pinyin = str(
                        raw["pinyin"]
                    ).strip()

                    pinyin_numbered = (
                        pinyin_to_numbered(
                            pinyin
                        )
                    )

                    accepted.append(
                        {
                            "id": (
                                f"SPK-HSK{level}-"
                                f"{number:06d}"
                            ),
                            "level": level,
                            "lesson": lesson,
                            "category": category,
                            "hanzi": hanzi,
                            "pinyin": pinyin,
                            "pinyinNumbered": (
                                pinyin_numbered
                            ),
                            "myanmar": str(
                                raw["myanmar"]
                            ).strip(),
                            "english": "",
                            "difficulty": difficulty,
                            "keywords": (
                                extract_keywords(
                                    hanzi,
                                    level,
                                )
                            ),
                            "grammar": (
                                infer_grammar(
                                    hanzi
                                )
                            ),
                            "tones": (
                                extract_tones(
                                    pinyin_numbered
                                )
                            ),
                            "targetDuration": (
                                estimate_target_duration(
                                    pinyin_numbered
                                )
                            ),
                            "audio": audio_paths(
                                level,
                                number,
                            ),
                        }
                    )

                    current_batch_seen.add(
                        normalized
                    )

                seen_hanzi.update(
                    current_batch_seen
                )

                if len(accepted) < requested:
                    time.sleep(
                        max(
                            0,
                            args.sleep,
                        )
                    )

            if not accepted:
                print(
                    "ERROR: No unique sentences "
                    "were accepted.",
                    file=sys.stderr,
                )
                return 2

            sentences.extend(
                accepted
            )

            save_json_atomic(
                output_path,
                sentences,
            )

            successful_batches += 1

            print(
                f"Saved {len(accepted)}. "
                f"Total HSK {level}: "
                f"{len(sentences)} / "
                f"{target}"
            )

            if (
                args.max_batches > 0
                and successful_batches
                >= args.max_batches
            ):
                print(
                    "Stopped because "
                    "--max-batches was reached."
                )
                return 0

            time.sleep(
                max(
                    0,
                    args.sleep,
                )
            )

    print(
        "\nAll requested levels "
        "reached their targets."
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())