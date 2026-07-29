from __future__ import annotations

import logging
import os
from functools import lru_cache
from pathlib import Path

from faster_whisper import WhisperModel

logger = logging.getLogger("anna.stt")

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
WHISPER_CPU_THREADS = int(os.getenv("WHISPER_CPU_THREADS", "4"))


class SpeechToTextError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def get_whisper_model() -> WhisperModel:
    logger.info(
        "Loading Whisper model=%s device=%s compute=%s",
        WHISPER_MODEL,
        WHISPER_DEVICE,
        WHISPER_COMPUTE_TYPE,
    )

    try:
        model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
            cpu_threads=WHISPER_CPU_THREADS,
            num_workers=1,
        )
    except Exception as error:
        raise SpeechToTextError(
            f"Whisper model could not load: {error}"
        ) from error

    logger.info("Whisper model loaded.")
    return model


def transcribe_audio(audio_path: Path) -> str:
    if not audio_path.exists():
        raise SpeechToTextError("Audio file does not exist.")

    try:
        model = get_whisper_model()

        segments, _ = model.transcribe(
            str(audio_path),
            language="zh",
            beam_size=1,
            best_of=1,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            condition_on_previous_text=False,
            temperature=0.0,
        )

        parts = [
            segment.text.strip()
            for segment in segments
            if segment.text.strip()
        ]

        return "".join(parts).strip()

    except SpeechToTextError:
        raise

    except Exception as error:
        raise SpeechToTextError(
            f"Audio transcription failed: {error}"
        ) from error
