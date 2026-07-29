from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.llm import OllamaServiceError, check_ollama_connection, generate_reply
from services.stt import SpeechToTextError, transcribe_audio

Mode = Literal["practice", "sentence_builder"]

APP_NAME = "Anna AI Voice Server"
APP_VERSION = "5.0.0"

VOICE_REQUEST_TIMEOUT = int(os.getenv("VOICE_REQUEST_TIMEOUT", "180"))
TEXT_REQUEST_TIMEOUT = int(os.getenv("TEXT_REQUEST_TIMEOUT", "120"))
MAX_AUDIO_MB = int(os.getenv("MAX_AUDIO_MB", "20"))

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("anna.voice")

app = FastAPI(title=APP_NAME, version=APP_VERSION)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=5000)


class TextChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    mode: Mode = "practice"
    history: list[HistoryMessage] = Field(default_factory=list)


class AnnaReplyResponse(BaseModel):
    hanzi: str
    pinyin: str


class TextChatResponse(BaseModel):
    message: str
    mode: Mode
    reply: AnnaReplyResponse


class VoiceChatResponse(BaseModel):
    transcript: str
    mode: Mode
    reply: AnnaReplyResponse


def parse_mode(value: str) -> Mode:
    if value not in {"practice", "sentence_builder"}:
        raise HTTPException(status_code=422, detail=f"Unsupported mode: {value}")
    return value  # type: ignore[return-value]


def parse_history(value: str) -> list[dict[str, str]]:
    if not value.strip():
        return []

    try:
        raw = json.loads(value)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=422, detail="History must be valid JSON.") from error

    if not isinstance(raw, list):
        raise HTTPException(status_code=422, detail="History must be a JSON array.")

    cleaned: list[dict[str, str]] = []

    for item in raw:
        if not isinstance(item, dict):
            continue

        role = str(item.get("role", "")).strip()
        content = str(item.get("content", "")).strip()

        if role in {"user", "assistant"} and content:
            cleaned.append({"role": role, "content": content})

    return cleaned[-20:]


async def run_blocking(func, *args, timeout_seconds: int):
    return await asyncio.wait_for(
        asyncio.to_thread(func, *args),
        timeout=timeout_seconds,
    )


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "running",
        "app": APP_NAME,
        "version": APP_VERSION,
    }


@app.get("/health")
def health() -> dict[str, object]:
    ollama_running = check_ollama_connection()

    return {
        "status": "ok" if ollama_running else "degraded",
        "ollama_running": ollama_running,
        "version": APP_VERSION,
    }


@app.post("/text-chat", response_model=TextChatResponse)
async def text_chat(request: TextChatRequest) -> TextChatResponse:
    started = time.perf_counter()

    logger.info(
        "TEXT_CHAT_START mode=%s history=%d",
        request.mode,
        len(request.history),
    )

    try:
        reply = await run_blocking(
            generate_reply,
            request.message,
            request.mode,
            [message.model_dump() for message in request.history],
            timeout_seconds=TEXT_REQUEST_TIMEOUT,
        )

        logger.info(
            "TEXT_CHAT_DONE elapsed=%.2fs",
            time.perf_counter() - started,
        )

        return TextChatResponse(
            message=request.message.strip(),
            mode=request.mode,
            reply=AnnaReplyResponse(**reply),
        )

    except asyncio.TimeoutError as error:
        logger.exception("TEXT_CHAT_TIMEOUT")
        raise HTTPException(
            status_code=504,
            detail="Anna took too long to answer. Please try again.",
        ) from error

    except ValueError as error:
        logger.exception("TEXT_CHAT_VALIDATION_ERROR")
        raise HTTPException(status_code=422, detail=str(error)) from error

    except OllamaServiceError as error:
        logger.exception("TEXT_CHAT_OLLAMA_ERROR")
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post("/voice-chat", response_model=VoiceChatResponse)
async def voice_chat(
    audio: UploadFile = File(...),
    mode: str = Form("practice"),
    history: str = Form("[]"),
) -> VoiceChatResponse:
    parsed_mode = parse_mode(mode)

    if parsed_mode != "practice":
        raise HTTPException(
            status_code=422,
            detail="Voice recording is available only in Chinese Practice mode.",
        )

    parsed_history = parse_history(history)
    started = time.perf_counter()
    suffix = Path(audio.filename or "recording.webm").suffix or ".webm"
    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = Path(temp_file.name)
            total = 0

            while True:
                chunk = await audio.read(1024 * 1024)
                if not chunk:
                    break

                total += len(chunk)

                if total > MAX_AUDIO_MB * 1024 * 1024:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Audio is larger than {MAX_AUDIO_MB} MB.",
                    )

                temp_file.write(chunk)

        if temp_path.stat().st_size == 0:
            raise HTTPException(status_code=422, detail="Uploaded audio is empty.")

        logger.info(
            "VOICE_CHAT_START bytes=%d history=%d",
            temp_path.stat().st_size,
            len(parsed_history),
        )

        logger.info("STT_START")

        transcript = await run_blocking(
            transcribe_audio,
            temp_path,
            timeout_seconds=VOICE_REQUEST_TIMEOUT,
        )

        logger.info("STT_DONE transcript=%r", transcript[:100])

        if not transcript.strip():
            raise HTTPException(
                status_code=422,
                detail="No Chinese speech was detected. Please try again.",
            )

        logger.info("LLM_START")

        elapsed = int(time.perf_counter() - started)
        remaining = max(20, VOICE_REQUEST_TIMEOUT - elapsed)

        reply = await run_blocking(
            generate_reply,
            transcript,
            "practice",
            parsed_history,
            timeout_seconds=remaining,
        )

        logger.info(
            "VOICE_CHAT_DONE elapsed=%.2fs",
            time.perf_counter() - started,
        )

        return VoiceChatResponse(
            transcript=transcript.strip(),
            mode="practice",
            reply=AnnaReplyResponse(**reply),
        )

    except asyncio.TimeoutError as error:
        logger.exception("VOICE_CHAT_TIMEOUT")
        raise HTTPException(
            status_code=504,
            detail="Voice processing timed out. Please record a shorter sentence.",
        ) from error

    except SpeechToTextError as error:
        logger.exception("VOICE_CHAT_STT_ERROR")
        raise HTTPException(status_code=503, detail=str(error)) from error

    except OllamaServiceError as error:
        logger.exception("VOICE_CHAT_OLLAMA_ERROR")
        raise HTTPException(status_code=503, detail=str(error)) from error

    finally:
        await audio.close()

        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except OSError:
                logger.warning("Could not delete temporary file: %s", temp_path)


@app.post("/chat", response_model=TextChatResponse)
async def chat(request: TextChatRequest) -> TextChatResponse:
    return await text_chat(request)


@app.post("/api/chat", response_model=TextChatResponse)
async def api_chat(request: TextChatRequest) -> TextChatResponse:
    return await text_chat(request)
