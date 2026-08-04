from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

import edge_tts


DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate normal and slow MP3 files for Anna AI speaking practice."
    )
    parser.add_argument("--input", required=True)
    parser.add_argument(
        "--public-dir",
        default="public",
        help="Next.js public directory.",
    )
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--normal-rate", default="-5%")
    parser.add_argument("--slow-rate", default="-28%")
    parser.add_argument("--volume", default="+0%")
    parser.add_argument("--pitch", default="+0Hz")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=0)
    parser.add_argument(
        "--delay",
        type=float,
        default=0.25,
    )
    return parser.parse_args()


async def generate_one(
    text: str,
    output_file: Path,
    voice: str,
    rate: str,
    volume: str,
    pitch: str,
) -> None:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    communicator = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        volume=volume,
        pitch=pitch,
    )
    await communicator.save(str(output_file))


def public_output_path(public_dir: Path, url: str) -> Path:
    cleaned = url.strip().replace("\\", "/").lstrip("/")
    if not cleaned:
        raise ValueError("Audio URL is empty.")
    return public_dir / cleaned


async def main() -> int:
    args = parse_args()
    input_path = Path(args.input).resolve()
    public_dir = Path(args.public_dir).resolve()

    if not input_path.exists():
        print(f"ERROR: JSON not found: {input_path}", file=sys.stderr)
        return 1

    try:
        rows: Any = json.loads(
            input_path.read_text(encoding="utf-8")
        )
    except Exception as error:
        print(f"ERROR: Could not read JSON: {error}", file=sys.stderr)
        return 1

    if not isinstance(rows, list):
        print("ERROR: JSON root must be an array.", file=sys.stderr)
        return 1

    end = args.end if args.end > 0 else len(rows)
    selected = rows[max(0, args.start - 1):end]

    succeeded = 0
    skipped = 0
    failed = 0

    print(f"Voice: {args.voice}")
    print(f"Sentences selected: {len(selected)}")

    for row in selected:
        sentence_id = str(row.get("id", "")).strip()
        hanzi = str(row.get("hanzi", "")).strip()
        audio = row.get("audio")

        if not sentence_id or not hanzi or not isinstance(audio, dict):
            print(f"FAILED invalid row: {sentence_id or '<no id>'}")
            failed += 1
            continue

        variants = [
            ("normal", str(audio.get("normal", "")), args.normal_rate),
            ("slow", str(audio.get("slow", "")), args.slow_rate),
        ]

        for label, url, rate in variants:
            try:
                output_file = public_output_path(public_dir, url)
            except ValueError as error:
                print(f"FAILED {sentence_id} {label}: {error}")
                failed += 1
                continue

            if (
                output_file.exists()
                and output_file.stat().st_size > 0
                and not args.overwrite
            ):
                skipped += 1
                continue

            try:
                print(
                    f"GENERATE {sentence_id} {label}: "
                    f"{output_file.name} | {hanzi}"
                )
                await generate_one(
                    text=hanzi,
                    output_file=output_file,
                    voice=args.voice,
                    rate=rate,
                    volume=args.volume,
                    pitch=args.pitch,
                )

                if (
                    not output_file.exists()
                    or output_file.stat().st_size == 0
                ):
                    raise RuntimeError("Generated file is empty.")

                succeeded += 1
            except Exception as error:
                failed += 1
                print(
                    f"FAILED {sentence_id} {label}: {error}",
                    file=sys.stderr,
                )

            await asyncio.sleep(max(0, args.delay))

    print(
        f"Completed. Generated: {succeeded}, "
        f"Skipped: {skipped}, Failed: {failed}"
    )
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
