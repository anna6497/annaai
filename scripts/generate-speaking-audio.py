from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

import edge_tts


DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate static MP3 files for Anna AI HSK 1 speaking practice."
    )
    parser.add_argument(
        "--input",
        default="data/speaking-practice/level-1.json",
        help="Path to the speaking-practice JSON file.",
    )
    parser.add_argument(
        "--output",
        default="public/audio/speaking-practice/level-1",
        help="Directory where MP3 files will be saved.",
    )
    parser.add_argument(
        "--voice",
        default=DEFAULT_VOICE,
        help="Edge TTS voice name.",
    )
    parser.add_argument(
        "--rate",
        default="-5%",
        help='Speech rate, for example "-10%%", "+0%%", or "+10%%".',
    )
    parser.add_argument(
        "--volume",
        default="+0%",
        help='Speech volume, for example "+0%%".',
    )
    parser.add_argument(
        "--pitch",
        default="+0Hz",
        help='Speech pitch, for example "+0Hz".',
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Regenerate files that already exist.",
    )
    parser.add_argument(
        "--start",
        type=int,
        default=1,
        help="First sentence number to generate.",
    )
    parser.add_argument(
        "--end",
        type=int,
        default=0,
        help="Last sentence number to generate. Use 0 for all.",
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
    communicator = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        volume=volume,
        pitch=pitch,
    )
    await communicator.save(str(output_file))


async def main() -> int:
    args = parse_args()

    input_path = Path(args.input).resolve()
    output_dir = Path(args.output).resolve()

    if not input_path.exists():
        print(f"ERROR: JSON file not found: {input_path}", file=sys.stderr)
        return 1

    try:
        sentences = json.loads(input_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"ERROR: Could not read JSON: {error}", file=sys.stderr)
        return 1

    if not isinstance(sentences, list):
        print("ERROR: JSON root must be an array.", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    end = args.end if args.end > 0 else len(sentences)
    selected = sentences[max(args.start - 1, 0):end]

    if not selected:
        print("No sentences selected.")
        return 0

    print(f"Voice: {args.voice}")
    print(f"Generating {len(selected)} audio files in: {output_dir}")

    succeeded = 0
    failed = 0

    for sentence in selected:
        sentence_id = str(sentence.get("id", "")).strip()
        hanzi = str(sentence.get("hanzi", "")).strip()
        audio_url = str(sentence.get("audioUrl", "")).strip()

        if not sentence_id or not hanzi or not audio_url:
            print(f"SKIP: Invalid row: {sentence!r}")
            failed += 1
            continue

        filename = Path(audio_url).name
        output_file = output_dir / filename

        if output_file.exists() and output_file.stat().st_size > 0 and not args.overwrite:
            print(f"SKIP: {filename} already exists")
            succeeded += 1
            continue

        try:
            print(f"GENERATE: {filename}  {hanzi}")
            await generate_one(
                text=hanzi,
                output_file=output_file,
                voice=args.voice,
                rate=args.rate,
                volume=args.volume,
                pitch=args.pitch,
            )

            if not output_file.exists() or output_file.stat().st_size == 0:
                raise RuntimeError("Generated file is empty.")

            succeeded += 1
        except Exception as error:
            failed += 1
            print(f"FAILED: {filename}: {error}", file=sys.stderr)

        # Small delay reduces the chance of temporary service throttling.
        await asyncio.sleep(0.25)

    print()
    print(f"Completed. Success: {succeeded}, Failed: {failed}")
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
