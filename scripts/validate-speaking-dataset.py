from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path


ID_RE = re.compile(r"^SPK-HSK([1-6])-(\d{6})$")
CHINESE_RE = re.compile(r"[\u3400-\u9fff]")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
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
        "--expected-total",
        type=int,
        default=0,
    )
    return parser.parse_args()


def normalize_hanzi(value: str) -> str:
    return re.sub(
        r"[\sã€‚ï¼ï¼Ÿ!?ï¼Œ,ï¼›;ï¼š:â€œâ€\"'ï¼ˆï¼‰()ã€â€¦]",
        "",
        value,
    )


def main() -> int:
    args = parse_args()
    data_dir = Path(args.data_dir).resolve()

    levels = [args.level] if args.level else list(range(1, 7))

    total = 0
    errors: list[str] = []
    all_hanzi: list[str] = []
    all_ids: list[str] = []

    for level in levels:
        path = data_dir / f"hsk{level}.json"

        if not path.exists():
            errors.append(f"Missing file: {path}")
            continue

        rows = json.loads(path.read_text(encoding="utf-8"))

        if not isinstance(rows, list):
            errors.append(f"{path}: root must be an array")
            continue

        print(f"HSK {level}: {len(rows)} sentences")
        total += len(rows)

        for index, row in enumerate(rows, start=1):
            prefix = f"{path.name}[{index}]"
            sentence_id = str(row.get("id", ""))
            match = ID_RE.fullmatch(sentence_id)

            if not match:
                errors.append(f"{prefix}: invalid id {sentence_id!r}")
            else:
                if int(match.group(1)) != level:
                    errors.append(f"{prefix}: ID level mismatch")
                if int(match.group(2)) != index:
                    errors.append(
                        f"{prefix}: expected number {index:06d}, "
                        f"got {int(match.group(2)):06d}"
                    )

            if row.get("level") != level:
                errors.append(f"{prefix}: level mismatch")

            hanzi = str(row.get("hanzi", "")).strip()

            if not hanzi or not CHINESE_RE.search(hanzi):
                errors.append(f"{prefix}: invalid hanzi")

            for key in (
                "pinyin", "pinyinNumbered", "myanmar", "category",
            ):
                if not str(row.get(key, "")).strip():
                    errors.append(f"{prefix}: empty {key}")

            tones = row.get("tones")

            if (
                not isinstance(tones, list)
                or not tones
                or any(
                    not isinstance(tone, int)
                    or tone < 1
                    or tone > 5
                    for tone in tones
                )
            ):
                errors.append(f"{prefix}: invalid tones")

            all_ids.append(sentence_id)
            all_hanzi.append(normalize_hanzi(hanzi))

    duplicate_ids = [
        value
        for value, count in Counter(all_ids).items()
        if value and count > 1
    ]

    duplicate_hanzi = [
        value
        for value, count in Counter(all_hanzi).items()
        if value and count > 1
    ]

    if duplicate_ids:
        errors.append(f"Duplicate IDs: {duplicate_ids[:20]}")

    if duplicate_hanzi:
        errors.append(
            f"Duplicate Hanzi count: {len(duplicate_hanzi)}; "
            f"examples: {duplicate_hanzi[:20]}"
        )

    print(f"Total sentences: {total}")

    if args.expected_total and total != args.expected_total:
        errors.append(
            f"Expected {args.expected_total} total sentences, found {total}"
        )

    if errors:
        print("\nVALIDATION FAILED", file=sys.stderr)
        for error in errors[:200]:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
