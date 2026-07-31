from __future__ import annotations

import argparse
import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


DEFAULT_MODEL = "gpt-4o-mini-tts"
DEFAULT_VOICE = "coral"


def load_rows(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise SystemExit(f"Dataset not found: {path}")

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("Dataset root must be a JSON array.")

    return [row for row in data if isinstance(row, dict)]


def numeric_suffix(value: str, fallback: int) -> int:
    match = re.search(r"(\d+)$", value)
    return int(match.group(1)) if match else fallback


def migrate(input_path: Path, output_path: Path) -> None:
    rows = load_rows(input_path)
    migrated: list[dict[str, Any]] = []

    for index, row in enumerate(rows, start=1):
        number = numeric_suffix(str(row.get("id", "")), index)
        file_number = f"{number:06d}"
        hanzi = str(row.get("hanzi", "")).strip()

        migrated.append(
            {
                "id": f"SPK-HSK1-{file_number}",
                "level": int(row.get("level", 1)),
                "lesson": ((number - 1) // 20) + 1,
                "category": str(row.get("category", "general")).strip(),
                "hanzi": hanzi,
                "pinyin": str(row.get("pinyin", "")).strip(),
                "pinyinNumbered": str(row.get("pinyinNumbered", "")).strip(),
                "myanmar": str(row.get("myanmar", "")).strip(),
                "english": str(row.get("english", "")).strip(),
                "difficulty": 1,
                "keywords": [],
                "grammar": [],
                "tones": [],
                "targetDuration": round(max(1.2, len(hanzi) * 0.45), 2),
                "audio": {
                    "normal": f"/audio/speaking-practice/hsk1/{file_number}.mp3",
                    "slow": f"/audio/speaking-practice/hsk1/{file_number}_slow.mp3",
                },
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(migrated, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Created {output_path} with {len(migrated)} records.")


def validate(path: Path) -> int:
    rows = load_rows(path)
    errors: list[str] = []
    seen_ids: set[str] = set()
    seen_hanzi: dict[str, str] = {}

    required_strings = (
        "id",
        "category",
        "hanzi",
        "pinyin",
        "pinyinNumbered",
        "myanmar",
        "english",
    )

    for index, row in enumerate(rows, start=1):
        prefix = f"row {index}"

        for field in required_strings:
            value = row.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{prefix}: missing or empty {field}")

        sentence_id = str(row.get("id", "")).strip()
        hanzi = str(row.get("hanzi", "")).strip()

        if sentence_id in seen_ids:
            errors.append(f"{prefix}: duplicate id {sentence_id}")
        seen_ids.add(sentence_id)

        if hanzi:
            if hanzi in seen_hanzi:
                errors.append(
                    f"{prefix}: duplicate Hanzi with {seen_hanzi[hanzi]}: {hanzi}"
                )
            else:
                seen_hanzi[hanzi] = sentence_id or prefix

        level = row.get("level")
        if not isinstance(level, int) or not 1 <= level <= 9:
            errors.append(f"{prefix}: level must be 1 to 9")

        lesson = row.get("lesson")
        if not isinstance(lesson, int) or lesson < 1:
            errors.append(f"{prefix}: lesson must be a positive integer")

        difficulty = row.get("difficulty")
        if not isinstance(difficulty, int) or not 1 <= difficulty <= 5:
            errors.append(f"{prefix}: difficulty must be 1 to 5")

        audio = row.get("audio")
        if not isinstance(audio, dict):
            errors.append(f"{prefix}: audio must be an object")
        else:
            for mode in ("normal", "slow"):
                value = audio.get(mode)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"{prefix}: audio.{mode} is required")

    print(f"Checked {len(rows)} records.")

    if errors:
        print(f"Validation failed with {len(errors)} issue(s):")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Validation passed.")
    return 0


def build_search(input_path: Path, output_path: Path) -> None:
    rows = load_rows(input_path)
    index: list[dict[str, Any]] = []

    for row in rows:
        index.append(
            {
                "id": row["id"],
                "level": row["level"],
                "lesson": row["lesson"],
                "category": row["category"],
                "hanzi": row["hanzi"],
                "pinyin": row["pinyin"],
                "myanmar": row["myanmar"],
                "english": row["english"],
                "searchText": " ".join(
                    [
                        str(row.get("hanzi", "")),
                        str(row.get("pinyin", "")),
                        str(row.get("pinyinNumbered", "")),
                        str(row.get("myanmar", "")),
                        str(row.get("english", "")),
                        str(row.get("category", "")),
                        " ".join(row.get("keywords", [])),
                        " ".join(row.get("grammar", [])),
                    ]
                ).lower(),
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Created {output_path} with {len(index)} records.")


def public_url_to_path(url: str) -> Path:
    normalized = url.strip().replace("\\", "/")
    if not normalized.startswith("/"):
        raise ValueError(f"Audio URL must start with '/': {url}")
    return Path("public") / normalized.lstrip("/")


def tts_instructions(mode: str) -> str:
    if mode == "slow":
        return (
            "Speak in clear standard Mandarin Chinese at a slow teaching pace. "
            "Pronounce every syllable distinctly, keep tones natural, and do not add words."
        )

    return (
        "Speak in clear, warm, natural standard Mandarin Chinese. "
        "Use a friendly female tutor tone, natural pacing, accurate tones, and do not add words."
    )


def generate_one(
    client: OpenAI,
    *,
    model: str,
    voice: str,
    text: str,
    output_path: Path,
    mode: str,
    max_retries: int,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for attempt in range(1, max_retries + 1):
        temporary_path = output_path.with_suffix(output_path.suffix + ".part")

        try:
            with client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=text,
                instructions=tts_instructions(mode),
                response_format="mp3",
            ) as response:
                response.stream_to_file(temporary_path)

            if not temporary_path.exists() or temporary_path.stat().st_size == 0:
                raise RuntimeError("Generated file is empty.")

            temporary_path.replace(output_path)
            return
        except Exception:
            temporary_path.unlink(missing_ok=True)
            if attempt >= max_retries:
                raise
            time.sleep(min(2**attempt, 10))


def generate_audio(args: argparse.Namespace) -> int:
    load_dotenv(".env.local")
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("OPENAI_API_KEY is missing from .env.local")

    rows = load_rows(Path(args.input))
    end = args.end if args.end > 0 else len(rows)
    selected = rows[max(args.start - 1, 0) : end]
    modes = ("normal", "slow") if args.mode == "both" else (args.mode,)

    Path("logs").mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("logs/openai-tts-generation.log", encoding="utf-8"),
        ],
    )

    client = OpenAI(api_key=api_key)
    total = len(selected) * len(modes)
    current = 0
    failed = 0

    for row in selected:
        sentence_id = str(row.get("id", "unknown"))
        hanzi = str(row.get("hanzi", "")).strip()
        audio = row.get("audio", {})

        for mode in modes:
            current += 1
            output_path = public_url_to_path(str(audio.get(mode, "")))

            if output_path.exists() and output_path.stat().st_size > 0 and not args.overwrite:
                logging.info("[%s/%s] Skip %s", current, total, output_path)
                continue

            try:
                logging.info(
                    "[%s/%s] Generate %s %s: %s",
                    current,
                    total,
                    sentence_id,
                    mode,
                    hanzi,
                )
                generate_one(
                    client,
                    model=args.model,
                    voice=args.voice,
                    text=hanzi,
                    output_path=output_path,
                    mode=mode,
                    max_retries=args.max_retries,
                )
            except Exception as error:
                failed += 1
                logging.exception("Failed %s %s: %s", sentence_id, mode, error)

    print(f"Finished. Targets={total}, failures={failed}")
    return 0 if failed == 0 else 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Anna AI V6 Sprint 1 dataset/audio tool")
    subparsers = parser.add_subparsers(dest="command", required=True)

    migrate_parser = subparsers.add_parser("migrate")
    migrate_parser.add_argument("--input", default="data/speaking-practice/level-1.json")
    migrate_parser.add_argument("--output", default="data/speaking-practice/hsk1.json")

    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("--input", default="data/speaking-practice/hsk1.json")

    search_parser = subparsers.add_parser("build-search")
    search_parser.add_argument("--input", default="data/speaking-practice/hsk1.json")
    search_parser.add_argument(
        "--output",
        default="public/data/speaking-practice/search-index.json",
    )

    audio_parser = subparsers.add_parser("generate-audio")
    audio_parser.add_argument("--input", default="data/speaking-practice/hsk1.json")
    audio_parser.add_argument("--mode", choices=("normal", "slow", "both"), default="both")
    audio_parser.add_argument("--start", type=int, default=1)
    audio_parser.add_argument("--end", type=int, default=0)
    audio_parser.add_argument("--model", default=DEFAULT_MODEL)
    audio_parser.add_argument("--voice", default=DEFAULT_VOICE)
    audio_parser.add_argument("--overwrite", action="store_true")
    audio_parser.add_argument("--max-retries", type=int, default=3)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "migrate":
        migrate(Path(args.input), Path(args.output))
        return 0
    if args.command == "validate":
        return validate(Path(args.input))
    if args.command == "build-search":
        build_search(Path(args.input), Path(args.output))
        return 0
    if args.command == "generate-audio":
        return generate_audio(args)

    parser.error("Unknown command")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
