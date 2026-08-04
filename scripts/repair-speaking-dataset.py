from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

from openai import OpenAI


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Repair blank English fields and duplicate Hanzi without changing IDs."
    )
    parser.add_argument(
        "--input",
        default="data/speaking-practice/hsk1.json",
    )
    parser.add_argument(
        "--model",
        default="gpt-5.6",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=25,
    )
    return parser.parse_args()


def save_json_atomic(path: Path, value: Any) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(path)


def normalize_hanzi(value: str) -> str:
    return re.sub(
        r"[\s。！？!?，,；;：:“”\"'（）()、…]",
        "",
        value,
    )


def response_schema(count: int) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "repairs": {
                "type": "array",
                "minItems": count,
                "maxItems": count,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "hanzi": {"type": "string"},
                        "pinyin": {"type": "string"},
                        "pinyinNumbered": {"type": "string"},
                        "myanmar": {"type": "string"},
                        "english": {"type": "string"},
                        "keywords": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "grammar": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "tones": {
                            "type": "array",
                            "items": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 5,
                            },
                        },
                        "targetDuration": {
                            "type": "number",
                            "minimum": 0.8,
                            "maximum": 15,
                        },
                    },
                    "required": [
                        "id",
                        "hanzi",
                        "pinyin",
                        "pinyinNumbered",
                        "myanmar",
                        "english",
                        "keywords",
                        "grammar",
                        "tones",
                        "targetDuration",
                    ],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["repairs"],
        "additionalProperties": False,
    }


def main() -> int:
    args = parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY is not set.", file=sys.stderr)
        return 1

    path = Path(args.input).resolve()

    if not path.exists():
        print(f"ERROR: File not found: {path}", file=sys.stderr)
        return 1

    rows = json.loads(path.read_text(encoding="utf-8"))

    if not isinstance(rows, list):
        print("ERROR: JSON root must be an array.", file=sys.stderr)
        return 1

    normalized_to_indexes: dict[str, list[int]] = defaultdict(list)

    for index, row in enumerate(rows):
        normalized_to_indexes[
            normalize_hanzi(str(row.get("hanzi", "")))
        ].append(index)

    duplicate_indexes: set[int] = set()

    for indexes in normalized_to_indexes.values():
        if len(indexes) > 1:
            duplicate_indexes.update(indexes[1:])

    repair_indexes = [
        index
        for index, row in enumerate(rows)
        if not str(row.get("english", "")).strip()
        or index in duplicate_indexes
        or not row.get("tones")
        or not row.get("keywords")
    ]

    if not repair_indexes:
        print("No repairs needed.")
        return 0

    print(f"Rows needing repair: {len(repair_indexes)}")

    client = OpenAI()

    for offset in range(0, len(repair_indexes), args.batch_size):
        batch_indexes = repair_indexes[
            offset : offset + args.batch_size
        ]

        batch = [
            {
                "id": rows[index]["id"],
                "level": rows[index]["level"],
                "lesson": rows[index]["lesson"],
                "category": rows[index]["category"],
                "hanzi": rows[index]["hanzi"],
                "pinyin": rows[index]["pinyin"],
                "pinyinNumbered": rows[index]["pinyinNumbered"],
                "myanmar": rows[index]["myanmar"],
                "english": rows[index].get("english", ""),
                "isDuplicate": index in duplicate_indexes,
            }
            for index in batch_indexes
        ]

        prompt = f"""
Repair exactly these {len(batch)} Anna AI speaking-practice rows.

Rules:
1. Preserve every ID exactly.
2. Preserve level, lesson, category, difficulty, and audio paths.
3. For normal rows, keep Hanzi, pinyin, and Myanmar unchanged and fill accurate English.
4. For rows marked isDuplicate=true, replace the sentence with a new unique,
   natural sentence appropriate for the same HSK level, lesson, and category.
5. Supply accurate tone-mark pinyin, numbered pinyin, Myanmar translation,
   English translation, keywords, grammar, tones, and targetDuration.
6. Burmese must be natural and accurate.

Rows:
{json.dumps(batch, ensure_ascii=False, indent=2)}
""".strip()

        response = client.chat.completions.create(
            model=args.model,
            messages=[
                {
                    "role": "system",
                    "content": "You repair structured Mandarin-learning data accurately.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "speaking_data_repairs",
                    "strict": True,
                    "schema": response_schema(len(batch)),
                },
            },
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("API returned empty content.")

        repairs = json.loads(content)["repairs"]
        repair_by_id = {item["id"]: item for item in repairs}

        for index in batch_indexes:
            row = rows[index]
            repaired = repair_by_id.get(row["id"])

            if not repaired:
                raise RuntimeError(f"Missing repair for {row['id']}")

            if index in duplicate_indexes:
                row["hanzi"] = repaired["hanzi"]
                row["pinyin"] = repaired["pinyin"]
                row["pinyinNumbered"] = repaired["pinyinNumbered"]
                row["myanmar"] = repaired["myanmar"]

            row["english"] = repaired["english"]
            row["keywords"] = repaired["keywords"]
            row["grammar"] = repaired["grammar"]
            row["tones"] = repaired["tones"]
            row["targetDuration"] = round(
                float(repaired["targetDuration"]),
                2,
            )

        save_json_atomic(path, rows)

        print(
            f"Saved repairs {offset + 1}-"
            f"{offset + len(batch_indexes)}"
        )

    print("Repair complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())