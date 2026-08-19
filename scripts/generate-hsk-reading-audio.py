from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Any

import edge_tts


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

READING_DATA_DIR = (
    PROJECT_ROOT
    / "data"
    / "hsk-reading"
)

AUDIO_ROOT = (
    PROJECT_ROOT
    / "public"
    / "audio"
    / "hsk-reading"
)


# ============================================================
# DEFAULT TTS SETTINGS
# ============================================================

DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"

DEFAULT_RATE = "-10%"

DEFAULT_VOLUME = "+0%"

DEFAULT_PITCH = "+0Hz"


# ============================================================
# HELPERS
# ============================================================

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate static Chinese MP3 audio "
            "for Anna AI HSK Reading stories."
        )
    )

    parser.add_argument(
        "--level",
        type=int,
        choices=range(1, 10),
        default=None,
        help=(
            "Generate only one HSK level. "
            "Example: --level 1. "
            "Omit to generate HSK 1-9."
        ),
    )

    parser.add_argument(
        "--voice",
        default=DEFAULT_VOICE,
        help=(
            "Edge TTS Mandarin voice. "
            f"Default: {DEFAULT_VOICE}"
        ),
    )

    parser.add_argument(
        "--rate",
        default=DEFAULT_RATE,
        help=(
            "Speech rate. "
            f"Default: {DEFAULT_RATE}"
        ),
    )

    parser.add_argument(
        "--volume",
        default=DEFAULT_VOLUME,
        help=(
            "Speech volume. "
            f"Default: {DEFAULT_VOLUME}"
        ),
    )

    parser.add_argument(
        "--pitch",
        default=DEFAULT_PITCH,
        help=(
            "Speech pitch. "
            f"Default: {DEFAULT_PITCH}"
        ),
    )

    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Regenerate MP3 files that already exist.",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help=(
            "Show what would be generated "
            "without creating audio."
        ),
    )

    return parser.parse_args()


def load_json(
    path: Path,
) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(
            f"Reading JSON not found: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(
            f"{path} must contain a JSON array."
        )

    return data


def clean_text(
    value: Any,
) -> str:
    if value is None:
        return ""

    return str(value).strip()


def normalize_audio_text(
    text: str,
) -> str:
    """
    Normalize story text before TTS.

    Keep Chinese punctuation because it helps
    Edge TTS create natural pauses.
    """

    text = text.strip()

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text


def get_story_text(
    story: dict[str, Any],
) -> str:
    """
    Priority:

    1. audioText
    2. paragraphs joined together
    """

    audio_text = clean_text(
        story.get("audioText")
    )

    if audio_text:
        return normalize_audio_text(
            audio_text
        )

    paragraphs = story.get(
        "paragraphs",
        [],
    )

    if not isinstance(
        paragraphs,
        list,
    ):
        return ""

    paragraph_texts = [
        clean_text(item)
        for item in paragraphs
        if clean_text(item)
    ]

    return normalize_audio_text(
        "\n".join(
            paragraph_texts
        )
    )


def get_story_id(
    story: dict[str, Any],
) -> str:
    return clean_text(
        story.get("id")
    )


def get_output_path(
    level: int,
    story_id: str,
) -> Path:
    level_dir = (
        AUDIO_ROOT
        / f"hsk{level}"
    )

    level_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    return (
        level_dir
        / f"{story_id}.mp3"
    )


def get_public_audio_url(
    level: int,
    story_id: str,
) -> str:
    return (
        f"/audio/hsk-reading/"
        f"hsk{level}/"
        f"{story_id}.mp3"
    )


# ============================================================
# AUDIO GENERATION
# ============================================================

async def generate_mp3(
    *,
    text: str,
    output_path: Path,
    voice: str,
    rate: str,
    volume: str,
    pitch: str,
) -> None:
    communicator = (
        edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate,
            volume=volume,
            pitch=pitch,
        )
    )

    await communicator.save(
        str(output_path)
    )


# ============================================================
# LEVEL PROCESSING
# ============================================================

async def process_level(
    *,
    level: int,
    args: argparse.Namespace,
) -> tuple[int, int, int]:
    json_path = (
        READING_DATA_DIR
        / f"hsk{level}.json"
    )

    stories = load_json(
        json_path
    )

    print()
    print(
        f"========== HSK {level} =========="
    )

    print(
        f"Stories found: {len(stories)}"
    )

    generated = 0
    skipped = 0
    failed = 0

    for index, story in enumerate(
        stories,
        start=1,
    ):
        story_id = get_story_id(
            story
        )

        if not story_id:
            print(
                f"[{index}/{len(stories)}] "
                "SKIP - missing story id"
            )

            skipped += 1
            continue

        text = get_story_text(
            story
        )

        if not text:
            print(
                f"[{index}/{len(stories)}] "
                f"SKIP {story_id} "
                "- no audio text"
            )

            skipped += 1
            continue

        output_path = (
            get_output_path(
                level,
                story_id,
            )
        )

        public_url = (
            get_public_audio_url(
                level,
                story_id,
            )
        )

        if (
            output_path.exists()
            and not args.overwrite
        ):
            print(
                f"[{index}/{len(stories)}] "
                f"EXISTS {story_id}"
            )

            skipped += 1
            continue

        print(
            f"[{index}/{len(stories)}] "
            f"Generating {story_id}"
        )

        print(
            f"  -> {public_url}"
        )

        if args.dry_run:
            generated += 1
            continue

        try:
            await generate_mp3(
                text=text,
                output_path=output_path,
                voice=args.voice,
                rate=args.rate,
                volume=args.volume,
                pitch=args.pitch,
            )

            if (
                not output_path.exists()
                or output_path.stat().st_size
                <= 0
            ):
                raise RuntimeError(
                    "Generated audio file is empty."
                )

            size_kb = (
                output_path.stat().st_size
                / 1024
            )

            print(
                f"  OK ({size_kb:.1f} KB)"
            )

            generated += 1

        except Exception as error:
            failed += 1

            print(
                f"  ERROR: {error}"
            )

    return (
        generated,
        skipped,
        failed,
    )


# ============================================================
# UPDATE JSON AUDIO URL
# ============================================================

def update_audio_urls(
    level: int,
) -> int:
    json_path = (
        READING_DATA_DIR
        / f"hsk{level}.json"
    )

    stories = load_json(
        json_path
    )

    changed = 0

    for story in stories:
        story_id = get_story_id(
            story
        )

        if not story_id:
            continue

        audio_path = (
            get_output_path(
                level,
                story_id,
            )
        )

        if not audio_path.exists():
            continue

        expected_url = (
            get_public_audio_url(
                level,
                story_id,
            )
        )

        if (
            story.get("audioUrl")
            != expected_url
        ):
            story["audioUrl"] = (
                expected_url
            )

            changed += 1

    if changed > 0:
        with json_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                stories,
                file,
                ensure_ascii=False,
                indent=2,
            )

            file.write("\n")

    return changed


# ============================================================
# MAIN
# ============================================================

async def main() -> int:
    args = parse_args()

    levels = (
        [args.level]
        if args.level
        else list(
            range(1, 10)
        )
    )

    print(
        "Anna AI HSK Reading Audio Generator"
    )

    print(
        "===================================="
    )

    print(
        f"Voice: {args.voice}"
    )

    print(
        f"Rate: {args.rate}"
    )

    print(
        f"Volume: {args.volume}"
    )

    print(
        f"Pitch: {args.pitch}"
    )

    print(
        "Levels: "
        + ", ".join(
            str(level)
            for level in levels
        )
    )

    if args.overwrite:
        print(
            "Overwrite: YES"
        )
    else:
        print(
            "Overwrite: NO"
        )

    if args.dry_run:
        print(
            "DRY RUN MODE"
        )

    total_generated = 0
    total_skipped = 0
    total_failed = 0
    total_updated = 0

    for level in levels:
        try:
            (
                generated,
                skipped,
                failed,
            ) = await process_level(
                level=level,
                args=args,
            )

            total_generated += (
                generated
            )

            total_skipped += (
                skipped
            )

            total_failed += (
                failed
            )

            if not args.dry_run:
                updated = (
                    update_audio_urls(
                        level
                    )
                )

                total_updated += (
                    updated
                )

                print(
                    f"HSK {level} audioUrl "
                    f"updated: {updated}"
                )

        except Exception as error:
            total_failed += 1

            print()
            print(
                f"HSK {level} FAILED:"
            )

            print(error)

    print()
    print(
        "===================================="
    )

    print(
        "Generation complete"
    )

    print(
        "===================================="
    )

    print(
        f"Generated : {total_generated}"
    )

    print(
        f"Skipped   : {total_skipped}"
    )

    print(
        f"Failed    : {total_failed}"
    )

    print(
        f"JSON URLs : {total_updated}"
    )

    if total_failed > 0:
        return 1

    return 0


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(
            main()
        )

        sys.exit(
            exit_code
        )

    except KeyboardInterrupt:
        print()
        print(
            "Generation cancelled."
        )

        sys.exit(130)