from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any, Literal

from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from faster_whisper import WhisperModel

from services.llm import (
    OllamaServiceError,
    check_ollama_connection,
    generate_reply,
)


APP_VERSION = "7.0.0-alpha"

Mode = Literal[
    "practice",
    "sentence_builder",
]

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

TARGET_SAMPLE_RATE = 16_000

MAX_AUDIO_BYTES = 15 * 1024 * 1024

MAX_HISTORY_MESSAGES = int(
    os.getenv(
        "ANNA_MAX_HISTORY_MESSAGES",
        "12",
    )
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


app = FastAPI(
    title="Anna AI Speaking V7",
    version=APP_VERSION,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


whisper_model: WhisperModel | None = None


class HistoryMessage(BaseModel):
    role: Literal[
        "user",
        "assistant",
    ]

    content: str = Field(
        min_length=1,
        max_length=5000,
    )


class TextChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    mode: Mode = "practice"

    history: list[
        HistoryMessage
    ] = []


class AnnaReplyResponse(BaseModel):
    hanzi: str
    pinyin: str


class TextChatResponse(BaseModel):
    message: str
    mode: Mode
    reply: AnnaReplyResponse

    timings: dict[
        str,
        float,
    ] | None = None


class VoiceChatResponse(BaseModel):
    transcript: str
    mode: Mode
    reply: AnnaReplyResponse

    timings: dict[
        str,
        float,
    ] | None = None


def get_whisper_model() -> WhisperModel:
    global whisper_model

    if whisper_model is None:
        print(
            "Loading V7 Whisper:",
            {
                "model": WHISPER_MODEL_SIZE,
                "device": WHISPER_DEVICE,
                "compute_type":
                    WHISPER_COMPUTE_TYPE,
            },
        )

        whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device=WHISPER_DEVICE,
            compute_type=
                WHISPER_COMPUTE_TYPE,
        )

    return whisper_model


def clean_history(
    history: list[
        HistoryMessage
    ],
) -> list[dict[str, str]]:
    result: list[
        dict[str, str]
    ] = []

    for item in history[
        -MAX_HISTORY_MESSAGES:
    ]:
        content = (
            item.content
            .strip()
        )

        if not content:
            continue

        result.append(
            {
                "role":
                    item.role,
                "content":
                    content,
            }
        )

    return result


def parse_form_history(
    raw: str,
) -> list[
    dict[str, str]
]:
    if not raw.strip():
        return []

    try:
        parsed = json.loads(
            raw
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail=(
                "Conversation history "
                "is invalid JSON."
            ),
        )

    if not isinstance(
        parsed,
        list,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Conversation history "
                "must be an array."
            ),
        )

    result: list[
        dict[str, str]
    ] = []

    for item in parsed[
        -MAX_HISTORY_MESSAGES:
    ]:
        if not isinstance(
            item,
            dict,
        ):
            continue

        role = str(
            item.get(
                "role",
                "",
            )
        ).strip()

        content = str(
            item.get(
                "content",
                "",
            )
        ).strip()

        if (
            role not in {
                "user",
                "assistant",
            }
            or not content
        ):
            continue

        result.append(
            {
                "role": role,
                "content":
                    content,
            }
        )

    return result


def get_audio_suffix(
    audio: UploadFile,
) -> str:
    if audio.filename:
        suffix = (
            Path(
                audio.filename
            )
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
        "audio/webm":
            ".webm",
        "audio/webm;codecs=opus":
            ".webm",
        "audio/wav":
            ".wav",
        "audio/x-wav":
            ".wav",
        "audio/mpeg":
            ".mp3",
        "audio/mp4":
            ".m4a",
        "audio/ogg":
            ".ogg",
        "audio/ogg;codecs=opus":
            ".ogg",
    }

    return content_type_map.get(
        audio.content_type
        or "",
        ".webm",
    )


def require_ffmpeg() -> str:
    path = shutil.which(
        "ffmpeg"
    )

    if not path:
        raise HTTPException(
            status_code=500,
            detail=(
                "FFmpeg is not available "
                "on the V7 server."
            ),
        )

    return path


def convert_to_wav(
    input_path: str,
    output_path: str,
) -> None:
    ffmpeg = require_ffmpeg()

    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        input_path,
        "-ac",
        "1",
        "-ar",
        str(
            TARGET_SAMPLE_RATE
        ),
        "-sample_fmt",
        "s16",
        "-af",
        (
            "highpass=f=60,"
            "lowpass=f=7800,"
            "dynaudnorm="
            "f=250:g=15:p=0.95"
        ),
        output_path,
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=25,
            check=False,
        )

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail=(
                "Audio processing "
                "timed out."
            ),
        )

    if result.returncode != 0:
        raise HTTPException(
            status_code=422,
            detail=(
                "The recorded audio "
                "could not be decoded."
            ),
        )


def transcribe_chinese(
    wav_path: str,
) -> tuple[
    str,
    float,
]:
    model = get_whisper_model()

    started = (
        time.perf_counter()
    )

    segments, info = (
        model.transcribe(
            wav_path,

            language="zh",

            task="transcribe",

            # V7:
            # latency ကိုလျှော့ရန်
            # beam 5 → 3
            beam_size=3,

            best_of=3,

            temperature=0,

            vad_filter=True,

            vad_parameters={
                "min_silence_duration_ms":
                    350,
                "speech_pad_ms":
                    150,
            },

            condition_on_previous_text=False,

            no_speech_threshold=0.45,

            without_timestamps=True,
        )
    )

    transcript = "".join(
        segment.text.strip()
        for segment in segments
        if segment.text.strip()
    ).strip()

    elapsed = (
        time.perf_counter()
        - started
    )

    print(
        "V7 STT:",
        {
            "transcript":
                transcript,
            "language":
                info.language,
            "probability":
                info.language_probability,
            "seconds":
                round(
                    elapsed,
                    3,
                ),
        },
    )

    return (
        transcript,
        elapsed,
    )


@app.get("/")
def root() -> dict[
    str,
    Any,
]:
    return {
        "status": "ok",
        "service":
            "anna-ai-speaking-v7",
        "version":
            APP_VERSION,
        "health":
            "/v7/health",
        "voice_chat":
            "/v7/voice-chat",
        "text_chat":
            "/v7/text-chat",
    }


@app.get(
    "/v7/health"
)
def health() -> dict[
    str,
    Any,
]:
    return {
        "status": "ok",
        "service":
            "anna-ai-speaking-v7",
        "version":
            APP_VERSION,
        "port": 8002,

        "whisper_model":
            WHISPER_MODEL_SIZE,

        "whisper_device":
            WHISPER_DEVICE,

        "whisper_compute_type":
            WHISPER_COMPUTE_TYPE,

        "ffmpeg_available":
            shutil.which(
                "ffmpeg"
            )
            is not None,

        "ollama_running":
            check_ollama_connection(),

        "allowed_origins":
            ALLOWED_ORIGINS,
    }


@app.post(
    "/v7/text-chat",
    response_model=
        TextChatResponse,
)
def text_chat(
    request: TextChatRequest,
) -> TextChatResponse:
    started = (
        time.perf_counter()
    )

    message = (
        request.message
        .strip()
    )

    if not message:
        raise HTTPException(
            status_code=400,
            detail=(
                "Message cannot "
                "be empty."
            ),
        )

    history = clean_history(
        request.history
    )

    llm_started = (
        time.perf_counter()
    )

    try:
        reply = generate_reply(
            user_text=message,
            mode=request.mode,
            conversation_history=
                history,
        )

    except OllamaServiceError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error

    llm_seconds = (
        time.perf_counter()
        - llm_started
    )

    total_seconds = (
        time.perf_counter()
        - started
    )

    return TextChatResponse(
        message=message,
        mode=request.mode,

        reply=AnnaReplyResponse(
            hanzi=
                reply["hanzi"],

            pinyin=
                reply["pinyin"],
        ),

        timings={
            "llm":
                round(
                    llm_seconds,
                    3,
                ),

            "total":
                round(
                    total_seconds,
                    3,
                ),
        },
    )


@app.post(
    "/v7/voice-chat",
    response_model=
        VoiceChatResponse,
)
async def voice_chat(
    audio: UploadFile = File(...),

    mode: Mode = Form(
        "practice"
    ),

    history: str = Form(
        "[]"
    ),
) -> VoiceChatResponse:
    request_started = (
        time.perf_counter()
    )

    if mode != "practice":
        raise HTTPException(
            status_code=400,
            detail=(
                "Voice chat supports "
                "practice mode only."
            ),
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                "Recorded audio "
                "is empty."
            ),
        )

    if (
        len(audio_bytes)
        > MAX_AUDIO_BYTES
    ):
        raise HTTPException(
            status_code=413,
            detail=(
                "Audio exceeds "
                "15 MB."
            ),
        )

    conversation_history = (
        parse_form_history(
            history
        )
    )

    original_path: (
        str | None
    ) = None

    wav_path: (
        str | None
    ) = None

    try:
        suffix = (
            get_audio_suffix(
                audio
            )
        )

        with (
            tempfile.NamedTemporaryFile(
                suffix=suffix,
                delete=False,
            )
        ) as source:
            source.write(
                audio_bytes
            )

            original_path = (
                source.name
            )

        with (
            tempfile.NamedTemporaryFile(
                suffix=".wav",
                delete=False,
            )
        ) as wav_file:
            wav_path = (
                wav_file.name
            )

        audio_started = (
            time.perf_counter()
        )

        convert_to_wav(
            original_path,
            wav_path,
        )

        audio_seconds = (
            time.perf_counter()
            - audio_started
        )

        transcript, (
            stt_seconds
        ) = transcribe_chinese(
            wav_path
        )

        if not transcript:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Chinese speech "
                    "was not detected. "
                    "Please speak again."
                ),
            )

        llm_started = (
            time.perf_counter()
        )

        try:
            reply = (
                generate_reply(
                    user_text=
                        transcript,

                    mode=
                        "practice",

                    conversation_history=
                        conversation_history,
                )
            )

        except OllamaServiceError as error:
            raise HTTPException(
                status_code=503,
                detail=str(
                    error
                ),
            ) from error

        llm_seconds = (
            time.perf_counter()
            - llm_started
        )

        total_seconds = (
            time.perf_counter()
            - request_started
        )

        print(
            "V7 VOICE TIMINGS:",
            {
                "audio":
                    round(
                        audio_seconds,
                        3,
                    ),

                "stt":
                    round(
                        stt_seconds,
                        3,
                    ),

                "llm":
                    round(
                        llm_seconds,
                        3,
                    ),

                "total":
                    round(
                        total_seconds,
                        3,
                    ),
            },
        )

        return VoiceChatResponse(
            transcript=
                transcript,

            mode=
                "practice",

            reply=
                AnnaReplyResponse(
                    hanzi=
                        reply[
                            "hanzi"
                        ],

                    pinyin=
                        reply[
                            "pinyin"
                        ],
                ),

            timings={
                "audio":
                    round(
                        audio_seconds,
                        3,
                    ),

                "stt":
                    round(
                        stt_seconds,
                        3,
                    ),

                "llm":
                    round(
                        llm_seconds,
                        3,
                    ),

                "total":
                    round(
                        total_seconds,
                        3,
                    ),
            },
        )

    finally:
        for path in [
            original_path,
            wav_path,
        ]:
            if not path:
                continue

            try:
                os.remove(
                    path
                )

            except OSError:
                pass