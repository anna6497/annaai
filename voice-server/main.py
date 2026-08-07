from __future__ import annotations

import os
import re
import tempfile
import time
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel


APP_VERSION = "6.0.0-pronunciation-alpha"

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")


app = FastAPI(
    title="Anna AI Voice V6",
    version=APP_VERSION,
)

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

EXTRA_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "",
    ).split(",")
    if origin.strip()
]

ALLOWED_ORIGINS = list(
    dict.fromkeys(
        [
            *DEFAULT_ALLOWED_ORIGINS,
            *EXTRA_ALLOWED_ORIGINS,
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


whisper_model: WhisperModel | None = None


def get_whisper_model() -> WhisperModel:
    global whisper_model

    if whisper_model is None:
        whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )

    return whisper_model


def clamp_score(value: float) -> int:
    return max(0, min(100, round(value)))


def normalize_chinese_text(text: str) -> str:
    return re.sub(
        r"""[\s，。！？、,.!?;；:“”"'（）()【】《》<>…—\-]""",
        "",
        text.strip(),
    )


def levenshtein_operations(
    target: list[str],
    recognized: list[str],
) -> list[dict[str, str]]:
    rows = len(target) + 1
    columns = len(recognized) + 1

    matrix = [
        [0 for _ in range(columns)]
        for _ in range(rows)
    ]

    for row in range(rows):
        matrix[row][0] = row

    for column in range(columns):
        matrix[0][column] = column

    for row in range(1, rows):
        for column in range(1, columns):
            substitution_cost = (
                0
                if target[row - 1] == recognized[column - 1]
                else 1
            )

            matrix[row][column] = min(
                matrix[row - 1][column] + 1,
                matrix[row][column - 1] + 1,
                matrix[row - 1][column - 1] + substitution_cost,
            )

    operations: list[dict[str, str]] = []

    row = len(target)
    column = len(recognized)

    while row > 0 or column > 0:
        if (
            row > 0
            and column > 0
            and target[row - 1] == recognized[column - 1]
        ):
            operations.append(
                {
                    "type": "equal",
                    "expected": target[row - 1],
                    "recognized": recognized[column - 1],
                }
            )

            row -= 1
            column -= 1
            continue

        if (
            row > 0
            and column > 0
            and matrix[row][column]
            == matrix[row - 1][column - 1] + 1
        ):
            operations.append(
                {
                    "type": "replace",
                    "expected": target[row - 1],
                    "recognized": recognized[column - 1],
                }
            )

            row -= 1
            column -= 1
            continue

        if (
            row > 0
            and matrix[row][column]
            == matrix[row - 1][column] + 1
        ):
            operations.append(
                {
                    "type": "delete",
                    "expected": target[row - 1],
                    "recognized": "",
                }
            )

            row -= 1
            continue

        if column > 0:
            operations.append(
                {
                    "type": "insert",
                    "expected": "",
                    "recognized": recognized[column - 1],
                }
            )

            column -= 1

    operations.reverse()

    return operations


def calculate_scores(
    target_text: str,
    recognized_text: str,
    duration_seconds: float,
) -> dict[str, Any]:
    target = list(normalize_chinese_text(target_text))
    recognized = list(normalize_chinese_text(recognized_text))

    operations = levenshtein_operations(
        target,
        recognized,
    )

    correct_count = sum(
        1
        for item in operations
        if item["type"] == "equal"
    )

    incorrect_characters = [
        {
            "expected": item["expected"],
            "recognized": item["recognized"],
        }
        for item in operations
        if item["type"] == "replace"
    ]

    missing_characters = [
        item["expected"]
        for item in operations
        if item["type"] == "delete"
    ]

    extra_characters = [
        item["recognized"]
        for item in operations
        if item["type"] == "insert"
    ]

    target_length = max(len(target), 1)
    comparison_length = max(
        len(target),
        len(recognized),
        1,
    )

    accuracy = clamp_score(
        correct_count / comparison_length * 100
    )

    spoken_count = correct_count + len(incorrect_characters)

    completeness = clamp_score(
        min(spoken_count, target_length)
        / target_length
        * 100
    )

    ideal_duration = max(
        1.2,
        len(target) * 0.45,
    )

    duration_difference = abs(
        duration_seconds - ideal_duration
    )

    fluency = clamp_score(
        100
        - (
            duration_difference
            / ideal_duration
            * 35
        )
    )

    overall = clamp_score(
        accuracy * 0.60
        + completeness * 0.25
        + fluency * 0.15
    )

    return {
        "overall": overall,
        "accuracy": accuracy,
        "completeness": completeness,
        "fluency": fluency,
        "missing_characters": missing_characters,
        "extra_characters": extra_characters,
        "incorrect_characters": incorrect_characters,
    }


def get_audio_suffix(audio: UploadFile) -> str:
    if audio.filename:
        suffix = Path(audio.filename).suffix.lower()

        if suffix in {
            ".webm",
            ".wav",
            ".mp3",
            ".m4a",
            ".mp4",
            ".ogg",
        }:
            return suffix

    content_type_map = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "audio/ogg": ".ogg",
    }

    return content_type_map.get(
        audio.content_type or "",
        ".webm",
    )


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "anna-ai-voice-v6-local",
        "version": APP_VERSION,
        "health": "/health",
        "pronunciation_check": "/v6/pronunciation/check",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "version": APP_VERSION,
        "service": "anna-ai-voice-v6-local",
        "port": 8001,
        "whisper_model": WHISPER_MODEL_SIZE,
        "whisper_device": WHISPER_DEVICE,
        "whisper_compute_type": WHISPER_COMPUTE_TYPE,
        "allowed_origins": ALLOWED_ORIGINS,
    }


@app.post("/v6/pronunciation/check")
async def check_pronunciation(
    audio: UploadFile = File(...),
    target_text: str = Form(...),
    sentence_id: str = Form(...),
    duration_seconds: float = Form(0),
) -> dict[str, Any]:
    if not target_text.strip():
        raise HTTPException(
            status_code=400,
            detail="target_text is required.",
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded audio is empty.",
        )

    if len(audio_bytes) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Audio file exceeds the 15 MB limit.",
        )

    temporary_path: str | None = None
    started_at = time.perf_counter()

    try:
        suffix = get_audio_suffix(audio)

        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temporary_file:
            temporary_file.write(audio_bytes)
            temporary_path = temporary_file.name

        model = get_whisper_model()

        print("=" * 60)
        print("Filename:", audio.filename)
        print("Content-Type:", audio.content_type)
        print("Audio Size:", len(audio_bytes))
        print("Duration:", duration_seconds)
        print("Temporary Path:", temporary_path)
        print("=" * 60)

        segments, info = model.transcribe(
            temporary_path,
            language="zh",
            beam_size=5,
            vad_filter=False,
            condition_on_previous_text=False,
            temperature=0,
        )

        recognized_text = "".join(
            segment.text.strip()
            for segment in segments
            if segment.text.strip()
        )

        print("Recognized:", repr(recognized_text))
        print("Language:", info.language)
        print("Probability:", info.language_probability)
        print("=" * 60)

        if not recognized_text:
            raise HTTPException(
                status_code=422,
                detail=(
                    "No Chinese speech was detected. "
                    "Please speak again."
                ),
            )

        scores = calculate_scores(
            target_text=target_text,
            recognized_text=recognized_text,
            duration_seconds=max(duration_seconds, 0),
        )

        return {
            "sentence_id": sentence_id,
            "target_text": target_text,
            "recognized_text": recognized_text,
            "detected_language": info.language,
            "language_probability": round(
                info.language_probability,
                4,
            ),
            "duration_seconds": round(
                max(duration_seconds, 0),
                2,
            ),
            "processing_seconds": round(
                time.perf_counter() - started_at,
                3,
            ),
            "scores": {
                "overall": scores["overall"],
                "accuracy": scores["accuracy"],
                "completeness": scores["completeness"],
                "fluency": scores["fluency"],
            },
            "feedback": {
                "missing_characters": scores[
                    "missing_characters"
                ],
                "extra_characters": scores[
                    "extra_characters"
                ],
                "incorrect_characters": scores[
                    "incorrect_characters"
                ],
            },
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Pronunciation processing failed:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Pronunciation processing failed: "
                f"{type(error).__name__}: {error}"
            ),
        ) from error

    finally:
        if temporary_path:
            try:
                os.remove(temporary_path)
            except OSError:
                pass