from __future__ import annotations

import math
import os
import re
import shutil
import subprocess
import tempfile
import time
import wave
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from opencc import OpenCC


APP_VERSION = "6.3.0-opencc-normalized"

WHISPER_MODEL_SIZE = os.getenv(
    "WHISPER_MODEL_SIZE",
    "small",
)

WHISPER_DEVICE = os.getenv(
    "WHISPER_DEVICE",
    "cpu",
)

WHISPER_COMPUTE_TYPE = os.getenv(
    "WHISPER_COMPUTE_TYPE",
    "int8",
)

MAX_AUDIO_BYTES = 15 * 1024 * 1024
MIN_AUDIO_BYTES = 1
MIN_DURATION_SECONDS = 0.8
TARGET_SAMPLE_RATE = 16_000

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

HALLUCINATION_PATTERNS = [
    r"字幕",
    r"谢谢观看",
    r"感谢观看",
    r"请订阅",
    r"欢迎订阅",
    r"词曲",
    r"编曲",
    r"作词",
    r"作曲",
    r"\bby\b",
]

app = FastAPI(
    title="Anna AI Voice V6",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
        allow_origins=[
        "https://annaai.online",
        "https://www.annaai.online",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=(
        r"^https://annaai-[a-zA-Z0-9-]+-anna-ai"
        r"\.vercel\.app$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

whisper_model: WhisperModel | None = None
traditional_to_simplified = OpenCC("t2s")


def get_whisper_model() -> WhisperModel:
    global whisper_model

    if whisper_model is None:
        print(
            "Loading Whisper model:",
            {
                "model": WHISPER_MODEL_SIZE,
                "device": WHISPER_DEVICE,
                "compute_type": WHISPER_COMPUTE_TYPE,
            },
        )

        whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )

    return whisper_model


def clamp_score(value: float) -> int:
    return max(
        0,
        min(
            100,
            round(value),
        ),
    )


def normalize_chinese_text(text: str) -> str:
    simplified_text = (
        traditional_to_simplified.convert(
            text
        )
    )

    return re.sub(
        r"""[\s，。！？、,.!?;；:“”"'（）()【】《》<>…—\-]""",
        "",
        simplified_text.strip(),
    )


def contains_chinese(text: str) -> bool:
    return bool(
        re.search(
            r"[\u3400-\u9fff]",
            text,
        )
    )


def contains_hallucination(text: str) -> bool:
    lowered = text.lower()

    return any(
        re.search(
            pattern,
            lowered,
            flags=re.IGNORECASE,
        )
        for pattern in HALLUCINATION_PATTERNS
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
                matrix[row - 1][column - 1]
                + substitution_cost,
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



def build_coach_feedback(
    scores: dict[str, Any],
) -> dict[str, Any]:
    focus_characters = list(
        dict.fromkeys(
            [
                *scores["missing_characters"],
                *[
                    item["expected"]
                    for item in scores[
                        "incorrect_characters"
                    ]
                    if item["expected"]
                ],
            ]
        )
    )[:5]

    overall = int(scores["overall"])

    if overall >= 90:
        title = "Excellent!"
        message = (
            "အသံထွက်အရမ်းကောင်းပါတယ်။ "
            "ပိုသဘာဝကျအောင် ပုံမှန်နှုန်းနဲ့ ထပ်လေ့ကျင့်ပါ။"
        )
    elif overall >= 75:
        title = "Very good!"
        message = (
            "အများစုမှန်ပါတယ်။ Highlight လုပ်ထားတဲ့ "
            "စာလုံးတွေကို Slow audio နဲ့ ထပ်လေ့ကျင့်ပါ။"
        )
    elif overall >= 60:
        title = "Good try!"
        message = (
            "စာကြောင်းကို ဖြည်းဖြည်းနားထောင်ပြီး "
            "ခက်တဲ့စာလုံးတွေကို တစ်လုံးချင်းရှင်းရှင်းပြောပါ။"
        )
    else:
        title = "Keep practicing!"
        message = (
            "Slow audio ကို အရင်နားထောင်ပြီး "
            "စာကြောင်းကို အပိုင်းခွဲကာ ထပ်ပြောပါ။"
        )

    return {
        "title": title,
        "message": message,
        "focus_characters": focus_characters,
        "tone_scoring_available": False,
        "tone_note": (
            "Tone score is not calculated in V6 because "
            "Whisper does not provide reliable pitch contours."
        ),
    }


def calculate_scores(
    target_text: str,
    recognized_text: str,
    duration_seconds: float,
) -> dict[str, Any]:
    target = list(
        normalize_chinese_text(
            target_text
        )
    )

    recognized = list(
        normalize_chinese_text(
            recognized_text
        )
    )

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

    target_length = max(
        len(target),
        1,
    )

    comparison_length = max(
        len(target),
        len(recognized),
        1,
    )

    accuracy = clamp_score(
        correct_count
        / comparison_length
        * 100
    )

    spoken_count = (
        correct_count
        + len(incorrect_characters)
    )

    completeness = clamp_score(
        min(
            spoken_count,
            target_length,
        )
        / target_length
        * 100
    )

    ideal_duration = max(
        1.2,
        len(target) * 0.45,
    )

    duration_difference = abs(
        duration_seconds
        - ideal_duration
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
        accuracy * 0.75
        + completeness * 0.20
        + fluency * 0.05
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


def get_audio_suffix(
    audio: UploadFile,
) -> str:
    if audio.filename:
        suffix = (
            Path(audio.filename)
            .suffix
            .lower()
        )

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
        "audio/webm;codecs=opus": ".webm",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "audio/ogg": ".ogg",
        "audio/ogg;codecs=opus": ".ogg",
    }

    return content_type_map.get(
        audio.content_type or "",
        ".webm",
    )


def require_ffmpeg() -> str:
    ffmpeg_path = shutil.which(
        "ffmpeg"
    )

    if not ffmpeg_path:
        raise HTTPException(
            status_code=500,
            detail=(
                "FFmpeg was not found. "
                "Install FFmpeg and make sure "
                "ffmpeg is available in PATH."
            ),
        )

    return ffmpeg_path


def normalize_audio_with_ffmpeg(
    input_path: str,
    output_path: str,
) -> None:
    ffmpeg_path = require_ffmpeg()

    command = [
        ffmpeg_path,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        input_path,
        "-ac",
        "1",
        "-ar",
        str(TARGET_SAMPLE_RATE),
        "-sample_fmt",
        "s16",
        "-af",
(
    "highpass=f=60,"
    "lowpass=f=7800,"
    "volume=8,"
    "dynaudnorm=f=250:g=31:p=0.95"
),
        output_path,
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )

    if result.returncode != 0:
        raise HTTPException(
            status_code=422,
            detail=(
                "The recorded audio could not be decoded. "
                "Please record again. "
                f"FFmpeg: {result.stderr.strip()}"
            ),
        )

    if not os.path.exists(output_path):
        raise HTTPException(
            status_code=422,
            detail=(
                "Audio normalization failed. "
                "Please record again."
            ),
        )

    if os.path.getsize(output_path) < 1_000:
        raise HTTPException(
            status_code=422,
            detail=(
                "The normalized audio was empty or too quiet. "
                "Please speak closer to the microphone."
            ),
        )


def inspect_wav(
    wav_path: str,
) -> dict[str, float | int]:
    try:
        with wave.open(
            wav_path,
            "rb",
        ) as wav_file:
            frame_count = (
                wav_file.getnframes()
            )

            frame_rate = (
                wav_file.getframerate()
            )

            channels = (
                wav_file.getnchannels()
            )

            sample_width = (
                wav_file.getsampwidth()
            )

            duration = (
                frame_count
                / frame_rate
                if frame_rate > 0
                else 0
            )

            frames = wav_file.readframes(
                frame_count
            )
    except (
        wave.Error,
        OSError,
    ) as error:
        raise HTTPException(
            status_code=422,
            detail=(
                "The normalized WAV file could not be read. "
                f"{error}"
            ),
        ) from error

    if sample_width != 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "Unsupported WAV sample width."
            ),
        )

    if channels != 1:
        raise HTTPException(
            status_code=422,
            detail=(
                "The normalized audio must be mono."
            ),
        )

    sample_count = (
        len(frames) // 2
    )

    if sample_count == 0:
        rms = 0.0
    else:
        total_square = 0.0

        for index in range(
            0,
            len(frames),
            2,
        ):
            sample = int.from_bytes(
                frames[
                    index:index + 2
                ],
                byteorder="little",
                signed=True,
            )

            normalized = (
                sample / 32768.0
            )

            total_square += (
                normalized
                * normalized
            )

        rms = math.sqrt(
            total_square
            / sample_count
        )

    return {
        "duration_seconds": round(
            duration,
            3,
        ),
        "sample_rate": frame_rate,
        "channels": channels,
        "sample_width": sample_width,
        "rms": round(
            rms,
            6,
        ),
    }


def validate_audio_quality(
    info: dict[str, float | int],
) -> None:
    duration = float(
        info["duration_seconds"]
    )

    rms = float(
        info["rms"]
    )

    print(
        "Audio quality:",
        {
            "duration_seconds": duration,
            "rms": rms,
            "sample_rate": info["sample_rate"],
            "channels": info["channels"],
        },
    )

    if duration < MIN_DURATION_SECONDS:
        raise HTTPException(
            status_code=422,
            detail=(
                "The recording is too short. "
                "Please speak for at least one second."
            ),
        )

    # Do not reject quiet audio based only on RMS.
    # FFmpeg has already amplified and normalized it.
    # Whisper plus the hallucination filters below
    # will decide whether usable Chinese speech exists.


def transcribe_chinese(
    wav_path: str,
    target_text: str,
) -> tuple[str, str, float]:
    model = get_whisper_model()

    segments, info = model.transcribe(
        wav_path,
        language="zh",
        task="transcribe",
        beam_size=5,
        best_of=5,
        patience=1.0,
        vad_filter=False,
        condition_on_previous_text=False,
        temperature=0,
        no_speech_threshold=0.4,
        log_prob_threshold=-1.0,
        compression_ratio_threshold=2.4,
        without_timestamps=True,
        word_timestamps=False,
    )

    recognized_text = "".join(
        segment.text.strip()
        for segment in segments
        if segment.text.strip()
    )

    return (
        recognized_text,
        info.language,
        float(info.language_probability),
    )


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "anna-ai-voice-v6",
        "version": APP_VERSION,
        "health": "/health",
        "pronunciation_check": (
            "/v6/pronunciation/check"
        ),
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "version": APP_VERSION,
        "service": "anna-ai-voice-v6",
        "port": 8001,
        "whisper_model": (
            WHISPER_MODEL_SIZE
        ),
        "whisper_device": (
            WHISPER_DEVICE
        ),
        "whisper_compute_type": (
            WHISPER_COMPUTE_TYPE
        ),
        "target_sample_rate": (
            TARGET_SAMPLE_RATE
        ),
        "ffmpeg_available": (
            shutil.which("ffmpeg")
            is not None
        ),
        "allowed_origins": (
            ALLOWED_ORIGINS
        ),
    }


@app.post(
    "/v6/pronunciation/check"
)
async def check_pronunciation(
    audio: UploadFile = File(...),
    target_text: str = Form(...),
    sentence_id: str = Form(...),
    duration_seconds: float = Form(0),
) -> dict[str, Any]:
    target_text = target_text.strip()
    sentence_id = sentence_id.strip()

    if not target_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "target_text is required."
            ),
        )

    if not sentence_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "sentence_id is required."
            ),
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded audio is empty."
            ),
        )

    print(
        "Uploaded audio:",
        {
            "filename": audio.filename,
            "content_type": audio.content_type,
            "size_bytes": len(audio_bytes),
            "client_duration": duration_seconds,
        },
    )

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                "Audio file exceeds "
                "the 15 MB limit."
            ),
        )

    original_path: str | None = None
    normalized_path: str | None = None

    started_at = (
        time.perf_counter()
    )

    try:
        original_suffix = (
            get_audio_suffix(audio)
        )

        with tempfile.NamedTemporaryFile(
            suffix=original_suffix,
            delete=False,
        ) as original_file:
            original_file.write(
                audio_bytes
            )

            original_path = (
                original_file.name
            )

        with tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        ) as normalized_file:
            normalized_path = (
                normalized_file.name
            )

        normalize_audio_with_ffmpeg(
            original_path,
            normalized_path,
        )

        audio_info = inspect_wav(
            normalized_path
        )

        validate_audio_quality(
            audio_info
        )

        recognized_text, (
            detected_language
        ), language_probability = (
            transcribe_chinese(
                normalized_path,
                target_text,
            )
        )

        print("=" * 72)
        print(
            "Sentence ID:",
            sentence_id,
        )
        print(
            "Target:",
            repr(target_text),
        )
        print(
            "Filename:",
            audio.filename,
        )
        print(
            "Content-Type:",
            audio.content_type,
        )
        print(
            "Original Size:",
            len(audio_bytes),
        )
        print(
            "Client Duration:",
            duration_seconds,
        )
        print(
            "Normalized Audio:",
            audio_info,
        )
        print(
            "Recognized:",
            repr(recognized_text),
        )
        print(
            "Language:",
            detected_language,
        )
        print(
            "Probability:",
            language_probability,
        )
        print("=" * 72)

        simplified_recognized_text = (
            traditional_to_simplified.convert(
                recognized_text
            )
        )

        normalized_recognized = (
            normalize_chinese_text(
                simplified_recognized_text
            )
        )

        if not normalized_recognized:
            raise HTTPException(
                status_code=422,
                detail=(
                    "No Chinese speech was detected. "
                    "Please speak again."
                ),
            )

        if (
            not contains_chinese(
                recognized_text
            )
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    "The recording did not contain "
                    "clear Chinese speech."
                ),
            )

        if contains_hallucination(
            recognized_text
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    "The microphone audio was unclear "
                    "and produced an invalid transcription. "
                    "Please speak closer to the microphone."
                ),
            )

        normalized_duration = float(
            audio_info[
                "duration_seconds"
            ]
        )

        score_duration = (
            normalized_duration
            if normalized_duration > 0
            else max(
                duration_seconds,
                0,
            )
        )

        scores = calculate_scores(
            target_text=target_text,
            recognized_text=recognized_text,
            duration_seconds=(
                score_duration
            ),
        )

        coach = build_coach_feedback(
            scores
        )

        return {
            "sentence_id": sentence_id,
            "target_text": target_text,
            "recognized_text": (
                simplified_recognized_text
            ),
            "detected_language": (
                detected_language
            ),
            "language_probability": round(
                language_probability,
                4,
            ),
            "duration_seconds": round(
                score_duration,
                2,
            ),
            "processing_seconds": round(
                time.perf_counter()
                - started_at,
                3,
            ),
            "audio": {
                "sample_rate": (
                    audio_info[
                        "sample_rate"
                    ]
                ),
                "channels": (
                    audio_info[
                        "channels"
                    ]
                ),
                "rms": (
                    audio_info[
                        "rms"
                    ]
                ),
            },
            "scores": {
                "overall": (
                    scores["overall"]
                ),
                "accuracy": (
                    scores["accuracy"]
                ),
                "completeness": (
                    scores[
                        "completeness"
                    ]
                ),
                "fluency": (
                    scores["fluency"]
                ),
            },
            "feedback": {
                "missing_characters": (
                    scores[
                        "missing_characters"
                    ]
                ),
                "extra_characters": (
                    scores[
                        "extra_characters"
                    ]
                ),
                "incorrect_characters": (
                    scores[
                        "incorrect_characters"
                    ]
                ),
            },
            "coach": coach,
        }

    except HTTPException:
        raise

    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status_code=504,
            detail=(
                "Audio processing timed out. "
                "Please try again."
            ),
        ) from error

    except Exception as error:
        print(
            "Pronunciation processing failed:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Pronunciation processing failed: "
                f"{type(error).__name__}: "
                f"{error}"
            ),
        ) from error

    finally:
        for temporary_path in (
            original_path,
            normalized_path,
        ):
            if temporary_path:
                try:
                    os.remove(
                        temporary_path
                    )
                except OSError:
                    pass