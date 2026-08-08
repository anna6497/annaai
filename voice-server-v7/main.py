from __future__ import annotations

import hashlib
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
from fastapi.responses import (
    FileResponse,
    StreamingResponse,
)
from faster_whisper import WhisperModel
from pydantic import BaseModel, Field

from services.llm import (
    OllamaServiceError,
    check_ollama_connection,
    generate_reply,
    stream_reply_text,
)


APP_VERSION = "7.3.1-live-voice-streaming"

Mode = Literal[
    "practice",
    "sentence_builder",
]

TtsSpeed = Literal[
    "normal",
    "slow",
]


# =========================================================
# PATHS / SETTINGS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

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

MAX_AUDIO_BYTES = (
    15 * 1024 * 1024
)

MAX_HISTORY_MESSAGES = int(
    os.getenv(
        "ANNA_MAX_HISTORY_MESSAGES",
        "12",
    )
)

MAX_TTS_CHARACTERS = int(
    os.getenv(
        "ANNA_MAX_TTS_CHARACTERS",
        "500",
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


# =========================================================
# PIPER TTS
# =========================================================

PIPER_MODEL_PATH = Path(
    os.getenv(
        "PIPER_MODEL_PATH",
        str(
            BASE_DIR
            / "models"
            / "piper"
            / "zh_CN-huayan-medium.onnx"
        ),
    )
)

PIPER_CONFIG_PATH = Path(
    os.getenv(
        "PIPER_CONFIG_PATH",
        str(
            BASE_DIR
            / "models"
            / "piper"
            / "zh_CN-huayan-medium.onnx.json"
        ),
    )
)

TTS_CACHE_DIR = Path(
    os.getenv(
        "TTS_CACHE_DIR",
        str(
            BASE_DIR
            / "cache"
            / "tts"
        ),
    )
)

TTS_CACHE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Anna AI Speaking V7",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=(
        r"^https://.*\.vercel\.app$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


whisper_model: (
    WhisperModel | None
) = None


# =========================================================
# PYDANTIC MODELS
# =========================================================

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
    ] = Field(
        default_factory=list,
    )


class StreamChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    history: list[
        HistoryMessage
    ] = Field(
        default_factory=list,
    )


class TtsRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=
            MAX_TTS_CHARACTERS,
    )

    speed: TtsSpeed = (
        "normal"
    )


class CorrectionResponse(BaseModel):
    needed: bool = False
    original: str = ""
    corrected: str = ""
    pinyin: str = ""


class AnnaReplyResponse(BaseModel):
    hanzi: str
    pinyin: str

    correction: (
        CorrectionResponse
    ) = Field(
        default_factory=
            CorrectionResponse,
    )


class TextChatResponse(BaseModel):
    message: str
    mode: Mode

    reply: (
        AnnaReplyResponse
    )

    timings: (
        dict[str, float]
        | None
    ) = None


class VoiceChatResponse(BaseModel):
    transcript: str
    mode: Mode

    reply: (
        AnnaReplyResponse
    )

    timings: (
        dict[str, float]
        | None
    ) = None


# =========================================================
# WHISPER
# =========================================================

def get_whisper_model() -> WhisperModel:
    global whisper_model

    if whisper_model is None:
        print(
            "Loading V7 Whisper:",
            {
                "model":
                    WHISPER_MODEL_SIZE,

                "device":
                    WHISPER_DEVICE,

                "compute_type":
                    WHISPER_COMPUTE_TYPE,
            },
        )

        whisper_model = (
            WhisperModel(
                WHISPER_MODEL_SIZE,
                device=
                    WHISPER_DEVICE,
                compute_type=
                    WHISPER_COMPUTE_TYPE,
            )
        )

    return whisper_model


# =========================================================
# HISTORY
# =========================================================

def clean_history(
    history: list[
        HistoryMessage
    ],
) -> list[
    dict[str, str]
]:
    result: list[
        dict[str, str]
    ] = []

    for item in history[
        -MAX_HISTORY_MESSAGES:
    ]:
        content = (
            item.content.strip()
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

    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=400,
            detail=(
                "Conversation history "
                "is invalid JSON."
            ),
        ) from error

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
            role
            not in {
                "user",
                "assistant",
            }
            or not content
        ):
            continue

        result.append(
            {
                "role":
                    role,

                "content":
                    content,
            }
        )

    return result


# =========================================================
# CORRECTION
# =========================================================

def build_correction_response(
    reply: dict[
        str,
        Any,
    ],
) -> CorrectionResponse:
    raw = reply.get(
        "correction"
    )

    if not isinstance(
        raw,
        dict,
    ):
        return (
            CorrectionResponse()
        )

    return CorrectionResponse(
        needed=bool(
            raw.get(
                "needed",
                False,
            )
        ),

        original=str(
            raw.get(
                "original",
                "",
            )
            or ""
        ).strip(),

        corrected=str(
            raw.get(
                "corrected",
                "",
            )
            or ""
        ).strip(),

        pinyin=str(
            raw.get(
                "pinyin",
                "",
            )
            or ""
        ).strip(),
    )


# =========================================================
# STREAM ENCODING
# =========================================================

def encode_ndjson(
    payload: dict[
        str,
        Any,
    ],
) -> bytes:
    return (
        json.dumps(
            payload,
            ensure_ascii=False,
            separators=(
                ",",
                ":",
            ),
        )
        + "\n"
    ).encode(
        "utf-8"
    )


# =========================================================
# AUDIO
# =========================================================

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

    return (
        content_type_map.get(
            audio.content_type
            or "",
            ".webm",
        )
    )


def require_ffmpeg() -> str:
    path = shutil.which(
        "ffmpeg"
    )

    if not path:
        raise HTTPException(
            status_code=500,
            detail=(
                "FFmpeg is not "
                "available on the "
                "V7 server."
            ),
        )

    return path


def convert_to_wav(
    input_path: str,
    output_path: str,
) -> None:
    ffmpeg = (
        require_ffmpeg()
    )

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
        result = (
            subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=25,
                check=False,
            )
        )

    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status_code=504,
            detail=(
                "Audio processing "
                "timed out."
            ),
        ) from error

    if (
        result.returncode != 0
    ):
        print(
            "FFmpeg error:",
            result.stderr,
        )

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
    model = (
        get_whisper_model()
    )

    started = (
        time.perf_counter()
    )

    segments, info = (
        model.transcribe(
            wav_path,

            language="zh",

            task="transcribe",

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

            no_speech_threshold=
                0.45,

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


def prepare_uploaded_audio(
    audio: UploadFile,
    audio_bytes: bytes,
) -> tuple[
    str,
    str,
]:
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

    return (
        original_path,
        wav_path,
    )


def delete_temporary_files(
    *paths: str | None,
) -> None:
    for path in paths:
        if not path:
            continue

        try:
            os.remove(
                path
            )
        except OSError:
            pass


# =========================================================
# PIPER
# =========================================================

def get_piper_binary() -> Path:
    binary_path = (
        BASE_DIR
        / ".venv"
        / "bin"
        / "piper"
    )

    if not binary_path.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                "Piper TTS executable "
                "was not found."
            ),
        )

    return binary_path


def check_piper_ready() -> bool:
    try:
        binary_path = (
            BASE_DIR
            / ".venv"
            / "bin"
            / "piper"
        )

        return (
            binary_path.exists()
            and
            PIPER_MODEL_PATH.exists()
            and
            PIPER_CONFIG_PATH.exists()
        )

    except OSError:
        return False


def create_tts_cache_key(
    text: str,
    speed: TtsSpeed,
) -> str:
    payload = (
        "piper-huayan-v1:"
        f"{speed}:"
        f"{text.strip()}"
    )

    return (
        hashlib.sha256(
            payload.encode(
                "utf-8"
            )
        ).hexdigest()
    )


def generate_piper_audio(
    text: str,
    speed: TtsSpeed,
) -> tuple[
    Path,
    bool,
]:
    cleaned_text = (
        text.strip()
    )

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "TTS text is empty."
            ),
        )

    if (
        len(cleaned_text)
        > MAX_TTS_CHARACTERS
    ):
        raise HTTPException(
            status_code=413,
            detail=(
                "TTS text is "
                "too long."
            ),
        )

    if not (
        PIPER_MODEL_PATH
        .exists()
    ):
        raise HTTPException(
            status_code=503,
            detail=(
                "Piper Mandarin model "
                "was not found."
            ),
        )

    if not (
        PIPER_CONFIG_PATH
        .exists()
    ):
        raise HTTPException(
            status_code=503,
            detail=(
                "Piper Mandarin config "
                "was not found."
            ),
        )

    piper_binary = (
        get_piper_binary()
    )

    cache_key = (
        create_tts_cache_key(
            cleaned_text,
            speed,
        )
    )

    output_path = (
        TTS_CACHE_DIR
        / f"{cache_key}.wav"
    )

    if (
        output_path.exists()
        and
        output_path.stat()
        .st_size > 1000
    ):
        return (
            output_path,
            True,
        )

    length_scale = (
        "1.25"
        if speed == "slow"
        else "1.0"
    )

    temporary_output = (
        TTS_CACHE_DIR
        / (
            f"{cache_key}."
            f"{os.getpid()}."
            "tmp.wav"
        )
    )

    command = [
        str(
            piper_binary
        ),

        "--model",
        str(
            PIPER_MODEL_PATH
        ),

        "--config",
        str(
            PIPER_CONFIG_PATH
        ),

        "--output-file",
        str(
            temporary_output
        ),

        "--length-scale",
        length_scale,

        "--sentence-silence",
        "0.12",

        "--volume",
        "1.0",
    ]

    try:
        result = (
            subprocess.run(
                command,
                input=
                    cleaned_text,
                text=True,
                capture_output=True,
                timeout=30,
                check=False,
            )
        )

    except subprocess.TimeoutExpired as error:
        if (
            temporary_output
            .exists()
        ):
            try:
                temporary_output.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=504,
            detail=(
                "TTS generation "
                "timed out."
            ),
        ) from error

    if (
        result.returncode != 0
    ):
        if (
            temporary_output
            .exists()
        ):
            try:
                temporary_output.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Piper TTS failed: "
                f"{result.stderr.strip()}"
            ),
        )

    if (
        not temporary_output
        .exists()
        or
        temporary_output.stat()
        .st_size < 1000
    ):
        if (
            temporary_output
            .exists()
        ):
            try:
                temporary_output.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Piper returned "
                "invalid audio."
            ),
        )

    try:
        temporary_output.replace(
            output_path
        )

    except OSError:
        shutil.copyfile(
            temporary_output,
            output_path,
        )

        try:
            temporary_output.unlink()
        except OSError:
            pass

    return (
        output_path,
        False,
    )


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root() -> dict[
    str,
    Any,
]:
    return {
        "status":
            "ok",

        "service":
            "anna-ai-speaking-v7",

        "version":
            APP_VERSION,

        "health":
            "/v7/health",

        "voice_chat":
            "/v7/voice-chat",

        "voice_stream":
            "/v7/voice-stream",

        "text_chat":
            "/v7/text-chat",

        "stream_chat":
            "/v7/stream-chat",

        "tts":
            "/v7/tts",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get(
    "/v7/health"
)
def health() -> dict[
    str,
    Any,
]:
    return {
        "status":
            "ok",

        "service":
            "anna-ai-speaking-v7",

        "version":
            APP_VERSION,

        "port":
            8002,

        "whisper_model":
            WHISPER_MODEL_SIZE,

        "whisper_device":
            WHISPER_DEVICE,

        "whisper_compute_type":
            WHISPER_COMPUTE_TYPE,

        "ffmpeg_available":
            (
                shutil.which(
                    "ffmpeg"
                )
                is not None
            ),

        "ollama_running":
            check_ollama_connection(),

        "piper_ready":
            check_piper_ready(),

        "piper_model":
            str(
                PIPER_MODEL_PATH
            ),

        "tts_cache_dir":
            str(
                TTS_CACHE_DIR
            ),

        "correction_enabled":
            True,

        "streaming_enabled":
            True,

        "voice_streaming_enabled":
            True,

        "stream_endpoint":
            "/v7/stream-chat",

        "voice_stream_endpoint":
            "/v7/voice-stream",

        "allowed_origins":
            ALLOWED_ORIGINS,
    }


# =========================================================
# TTS
# =========================================================

@app.post(
    "/v7/tts"
)
def text_to_speech(
    request: TtsRequest,
) -> FileResponse:
    started = (
        time.perf_counter()
    )

    output_path, cached = (
        generate_piper_audio(
            request.text,
            request.speed,
        )
    )

    elapsed = (
        time.perf_counter()
        - started
    )

    print(
        "V7 TTS:",
        {
            "characters":
                len(
                    request.text
                ),

            "speed":
                request.speed,

            "cached":
                cached,

            "seconds":
                round(
                    elapsed,
                    3,
                ),

            "file":
                output_path.name,
        },
    )

    return FileResponse(
        path=str(
            output_path
        ),

        media_type=
            "audio/wav",

        filename=
            "anna-v7.wav",

        headers={
            "Cache-Control":
                (
                    "public, "
                    "max-age=86400"
                ),

            "X-Anna-TTS-Cache":
                (
                    "HIT"
                    if cached
                    else "MISS"
                ),

            "X-Anna-TTS-Time":
                str(
                    round(
                        elapsed,
                        3,
                    )
                ),
        },
    )


# =========================================================
# TEXT LIVE STREAM
# =========================================================

@app.post(
    "/v7/stream-chat"
)
def stream_chat(
    request: StreamChatRequest,
) -> StreamingResponse:
    message = (
        request.message.strip()
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

    def event_stream():
        started = (
            time.perf_counter()
        )

        token_count = 0
        sentence_count = 0

        try:
            yield encode_ndjson(
                {
                    "type":
                        "start",

                    "message":
                        message,
                }
            )

            for event in (
                stream_reply_text(
                    user_text=
                        message,

                    conversation_history=
                        history,
                )
            ):
                event_type = str(
                    event.get(
                        "type",
                        "",
                    )
                )

                if (
                    event_type
                    == "token"
                ):
                    token_count += 1

                elif (
                    event_type
                    == "sentence"
                ):
                    sentence_count += 1

                yield encode_ndjson(
                    event
                )

            elapsed = (
                time.perf_counter()
                - started
            )

            print(
                "V7 TEXT STREAM:",
                {
                    "seconds":
                        round(
                            elapsed,
                            3,
                        ),

                    "token_events":
                        token_count,

                    "sentences":
                        sentence_count,
                },
            )

            yield encode_ndjson(
                {
                    "type":
                        "complete",

                    "seconds":
                        round(
                            elapsed,
                            3,
                        ),

                    "token_events":
                        token_count,

                    "sentences":
                        sentence_count,
                }
            )

        except GeneratorExit:
            print(
                "V7 TEXT STREAM "
                "CLIENT DISCONNECTED"
            )

            return

        except OllamaServiceError as error:
            yield encode_ndjson(
                {
                    "type":
                        "error",

                    "error":
                        str(
                            error
                        ),
                }
            )

        except Exception as error:
            print(
                "V7 TEXT STREAM ERROR:",
                repr(
                    error
                ),
            )

            yield encode_ndjson(
                {
                    "type":
                        "error",

                    "error":
                        (
                            "Unexpected "
                            "streaming error."
                        ),
                }
            )

    return StreamingResponse(
        event_stream(),

        media_type=
            "application/x-ndjson",

        headers={
            "Cache-Control":
                "no-cache, no-transform",

            "X-Accel-Buffering":
                "no",
        },
    )


# =========================================================
# VOICE LIVE STREAM
# =========================================================

@app.post(
    "/v7/voice-stream"
)
async def voice_stream(
    audio: UploadFile = File(...),

    history: str = Form(
        "[]"
    ),
) -> StreamingResponse:
    request_started = (
        time.perf_counter()
    )

    audio_bytes = (
        await audio.read()
    )

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
        (
            original_path,
            wav_path,
        ) = prepare_uploaded_audio(
            audio,
            audio_bytes,
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

        (
            transcript,
            stt_seconds,
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

    finally:
        delete_temporary_files(
            original_path,
            wav_path,
        )

    def event_stream():
        llm_started = (
            time.perf_counter()
        )

        token_count = 0
        sentence_count = 0

        try:
            yield encode_ndjson(
                {
                    "type":
                        "start",
                }
            )

            # Transcript is available
            # before LLM starts.
            yield encode_ndjson(
                {
                    "type":
                        "transcript",

                    "transcript":
                        transcript,

                    "timings": {
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
                    },
                }
            )

            # Hanzi tokens begin streaming.
            # Sentence events are used by
            # frontend Piper TTS queue.
            for event in (
                stream_reply_text(
                    user_text=
                        transcript,

                    conversation_history=
                        conversation_history,
                )
            ):
                event_type = str(
                    event.get(
                        "type",
                        "",
                    )
                )

                if (
                    event_type
                    == "token"
                ):
                    token_count += 1

                elif (
                    event_type
                    == "sentence"
                ):
                    sentence_count += 1

                yield encode_ndjson(
                    event
                )

            llm_seconds = (
                time.perf_counter()
                - llm_started
            )

            total_seconds = (
                time.perf_counter()
                - request_started
            )

            print(
                "V7 VOICE STREAM:",
                {
                    "transcript":
                        transcript,

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

                    "llm_stream":
                        round(
                            llm_seconds,
                            3,
                        ),

                    "total":
                        round(
                            total_seconds,
                            3,
                        ),

                    "token_events":
                        token_count,

                    "sentences":
                        sentence_count,
                },
            )

            yield encode_ndjson(
                {
                    "type":
                        "complete",

                    "seconds":
                        round(
                            total_seconds,
                            3,
                        ),

                    "audio_seconds":
                        round(
                            audio_seconds,
                            3,
                        ),

                    "stt_seconds":
                        round(
                            stt_seconds,
                            3,
                        ),

                    "llm_seconds":
                        round(
                            llm_seconds,
                            3,
                        ),

                    "token_events":
                        token_count,

                    "sentences":
                        sentence_count,
                }
            )

        except GeneratorExit:
            print(
                "V7 VOICE STREAM "
                "CLIENT DISCONNECTED"
            )

            return

        except OllamaServiceError as error:
            print(
                "V7 VOICE STREAM "
                "OLLAMA ERROR:",
                str(
                    error
                ),
            )

            yield encode_ndjson(
                {
                    "type":
                        "error",

                    "error":
                        str(
                            error
                        ),
                }
            )

        except Exception as error:
            print(
                "V7 VOICE STREAM ERROR:",
                repr(
                    error
                ),
            )

            yield encode_ndjson(
                {
                    "type":
                        "error",

                    "error":
                        (
                            "Unexpected "
                            "voice streaming error."
                        ),
                }
            )

    return StreamingResponse(
        event_stream(),

        media_type=
            "application/x-ndjson",

        headers={
            "Cache-Control":
                "no-cache, no-transform",

            "X-Accel-Buffering":
                "no",
        },
    )


# =========================================================
# NORMAL TEXT CHAT — V7.2 FALLBACK
# =========================================================

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
        request.message.strip()
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
            user_text=
                message,

            mode=
                request.mode,

            conversation_history=
                history,
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
        - started
    )

    correction = (
        build_correction_response(
            reply
        )
    )

    return TextChatResponse(
        message=
            message,

        mode=
            request.mode,

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

                correction=
                    correction,
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


# =========================================================
# NORMAL VOICE CHAT — V7.2 FALLBACK
# =========================================================

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

    audio_bytes = (
        await audio.read()
    )

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
        (
            original_path,
            wav_path,
        ) = prepare_uploaded_audio(
            audio,
            audio_bytes,
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

        (
            transcript,
            stt_seconds,
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
            reply = generate_reply(
                user_text=
                    transcript,

                mode=
                    "practice",

                conversation_history=
                    conversation_history,
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

        correction = (
            build_correction_response(
                reply
            )
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

                "correction_needed":
                    correction.needed,
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

                    correction=
                        correction,
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
        delete_temporary_files(
            original_path,
            wav_path,
        )