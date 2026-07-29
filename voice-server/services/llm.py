from __future__ import annotations

import json
import os
import re
from typing import Any, Literal, TypedDict

import requests
from opencc import OpenCC
from pypinyin import Style, lazy_pinyin

Mode = Literal["practice", "sentence_builder"]

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://127.0.0.1:11434",
).rstrip("/")

OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"

MODEL_NAME = os.getenv(
    "OLLAMA_MODEL",
    "qwen3:1.7b",
)

REQUEST_TIMEOUT = int(
    os.getenv(
        "OLLAMA_REQUEST_TIMEOUT",
        "90",
    )
)

MAX_HISTORY_MESSAGES = int(
    os.getenv(
        "ANNA_MAX_HISTORY_MESSAGES",
        "20",
    )
)

TRADITIONAL_TO_SIMPLIFIED = OpenCC("t2s")


class AnnaReply(TypedDict):
    hanzi: str
    pinyin: str


class OllamaServiceError(RuntimeError):
    """Raised when Ollama cannot return a valid Anna response."""


PRACTICE_PROMPT = """
You are Anna, the learner's friendly Mandarin Chinese conversation partner.

Important language requirement:
- Always use Mandarin Chinese.
- Always use Simplified Chinese characters only.
- Never use Traditional Chinese characters.

Conversation behavior:
1. Understand the user's latest message using the conversation history.
2. Respond directly to what the user actually said.
3. Never merely repeat or paraphrase the user's sentence.
4. Give a meaningful reaction, answer, opinion, or related comment first.
5. End with exactly ONE relevant follow-up question.
6. Use 2 to 4 short and natural sentences.
7. Keep the language suitable for HSK 1-4 learners.
8. Do not provide Myanmar translation.
9. Do not provide pinyin.
10. Return JSON only, with no Markdown and no extra explanation.

Context examples:
- If the user says where they live, ask which city they live in.
- If the user says what they like, react to that preference and ask one related question.
- If the user talks about work or study, respond to that topic and ask one related question.
- Do not invent facts about the user.

Required JSON:
{
  "hanzi": "自然的简体中文回复。最后只问一个相关问题。"
}
""".strip()


SENTENCE_BUILDER_PROMPT = """
You convert Myanmar text into natural Mandarin Chinese.

Important language requirement:
- Always use Mandarin Chinese.
- Always use Simplified Chinese characters only.
- Never use Traditional Chinese characters.

Translation rules:
1. Translate only the Myanmar text provided by the user.
2. Preserve the original meaning exactly.
3. Do not answer the user conversationally.
4. Do not add new information.
5. Do not add a follow-up question unless the original Myanmar text is a question.
6. A single Myanmar word or phrase must become the matching Chinese word or phrase.
7. A Myanmar sentence must become a natural Chinese sentence.
8. Do not provide Myanmar translation.
9. Do not provide pinyin.
10. Return JSON only, with no Markdown and no explanation.

Examples:

User:
နိုင်ငံကူးလက်မှတ်

Assistant:
{"hanzi":"护照"}

User:
မနက်ဖြန် ကျွန်မ အလုပ်သွားမယ်။

Assistant:
{"hanzi":"明天我要去上班。"}

User:
နင် ဘယ်လမှာ အလုပ်စမလဲ။

Assistant:
{"hanzi":"你几月份开始工作？"}

Required JSON:
{
  "hanzi": "准确自然的简体中文"
}
""".strip()


RETRY_PRACTICE_PROMPT = """
Your previous output was invalid.

Return exactly one valid JSON object with a non-empty hanzi field.

Rules:
- Simplified Chinese only.
- React naturally to the user's latest message.
- Do not repeat the user's sentence.
- End with exactly one relevant question.
- No Markdown.
- No pinyin.
- No translation.
""".strip()


RETRY_BUILDER_PROMPT = """
Your previous output was invalid.

Return exactly one valid JSON object with a non-empty hanzi field.

Rules:
- Translate only the user's Myanmar text.
- Preserve the exact meaning.
- Simplified Chinese only.
- Do not answer conversationally.
- Do not add a question unless the original text is a question.
- No Markdown.
- No pinyin.
- No explanation.
""".strip()


def check_ollama_connection() -> bool:
    try:
        response = requests.get(
            OLLAMA_TAGS_URL,
            timeout=5,
        )
        return response.ok
    except requests.RequestException:
        return False


def _clean_history(
    history: list[dict[str, str]] | None,
) -> list[dict[str, str]]:
    if not history:
        return []

    cleaned: list[dict[str, str]] = []

    for item in history[-MAX_HISTORY_MESSAGES:]:
        if not isinstance(item, dict):
            continue

        role = str(
            item.get("role", "")
        ).strip()

        content = str(
            item.get("content", "")
        ).strip()

        if (
            role in {"user", "assistant"}
            and content
        ):
            cleaned.append(
                {
                    "role": role,
                    "content": content,
                }
            )

    return cleaned


def _extract_json(
    text: str,
) -> dict[str, Any]:
    cleaned = text.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    ).strip()

    try:
        parsed = json.loads(cleaned)

        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if (
        start == -1
        or end == -1
        or end <= start
    ):
        raise OllamaServiceError(
            "Ollama did not return valid JSON."
        )

    try:
        parsed = json.loads(
            cleaned[start : end + 1]
        )
    except json.JSONDecodeError as error:
        raise OllamaServiceError(
            "Ollama returned invalid JSON."
        ) from error

    if not isinstance(parsed, dict):
        raise OllamaServiceError(
            "Ollama JSON must be an object."
        )

    return parsed


def _contains_chinese(
    text: str,
) -> bool:
    return bool(
        re.search(
            r"[\u3400-\u4dbf\u4e00-\u9fff]",
            text,
        )
    )


def _to_simplified(
    text: str,
) -> str:
    return TRADITIONAL_TO_SIMPLIFIED.convert(
        text
    ).strip()


def _normalize_pinyin(
    hanzi: str,
) -> str:
    tokens = lazy_pinyin(
        hanzi,
        style=Style.TONE,
        neutral_tone_with_five=False,
        errors=lambda value: list(value),
    )

    punctuation = {
        "，": ",",
        "。": ".",
        "！": "!",
        "？": "?",
        "；": ";",
        "：": ":",
        "、": ",",
    }

    result = ""

    for raw in tokens:
        token = punctuation.get(
            raw,
            raw,
        ).strip()

        if not token:
            continue

        if token in {
            ",",
            ".",
            "!",
            "?",
            ";",
            ":",
        }:
            result = (
                result.rstrip()
                + token
                + " "
            )
        else:
            if (
                result
                and not result.endswith(" ")
            ):
                result += " "

            result += token

    return re.sub(
        r"\s+",
        " ",
        result,
    ).strip()


def _question_count(
    text: str,
) -> int:
    return (
        text.count("？")
        + text.count("?")
    )


def _normalized_text(
    text: str,
) -> str:
    return re.sub(
        r"[。！？!?，,\s]",
        "",
        text,
    )


def _request_ollama(
    messages: list[dict[str, str]],
    mode: Mode,
) -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json",
        "think": False,
        "keep_alive": "30m",
        "options": {
            "temperature": (
                0.55
                if mode == "practice"
                else 0.0
            ),
            "top_p": 0.85,
            "repeat_penalty": 1.08,
            "num_ctx": 4096,
            "num_predict": 180,
        },
    }

    try:
        response = requests.post(
            OLLAMA_CHAT_URL,
            json=payload,
            timeout=(
                10,
                REQUEST_TIMEOUT,
            ),
        )

        response.raise_for_status()

    except requests.ConnectionError as error:
        raise OllamaServiceError(
            "Cannot connect to Ollama. Start Ollama first."
        ) from error

    except requests.Timeout as error:
        raise OllamaServiceError(
            "Ollama response timed out."
        ) from error

    except requests.RequestException as error:
        detail = (
            error.response.text
            if error.response is not None
            else str(error)
        )

        raise OllamaServiceError(
            f"Ollama request failed: {detail}"
        ) from error

    try:
        data = response.json()
    except ValueError as error:
        raise OllamaServiceError(
            "Ollama returned invalid response JSON."
        ) from error

    message = data.get("message")

    if not isinstance(message, dict):
        raise OllamaServiceError(
            "Ollama response has no message."
        )

    content = message.get("content")

    if (
        not isinstance(content, str)
        or not content.strip()
    ):
        raise OllamaServiceError(
            "Ollama response content is empty."
        )

    return content


def generate_reply(
    user_text: str,
    mode: Mode = "practice",
    conversation_history: list[dict[str, str]] | None = None,
) -> AnnaReply:
    cleaned_text = user_text.strip()

    if not cleaned_text:
        raise ValueError(
            "User text cannot be empty."
        )

    if mode not in {
        "practice",
        "sentence_builder",
    }:
        raise ValueError(
            f"Unsupported mode: {mode}"
        )

    system_prompt = (
        PRACTICE_PROMPT
        if mode == "practice"
        else SENTENCE_BUILDER_PROMPT
    )

    base_messages: list[
        dict[str, str]
    ] = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    if mode == "practice":
        base_messages.extend(
            _clean_history(
                conversation_history
            )
        )

    base_messages.append(
        {
            "role": "user",
            "content": cleaned_text,
        }
    )

    last_error: Exception | None = None

    for attempt in range(2):
        messages = [
            dict(item)
            for item in base_messages
        ]

        if attempt:
            messages.append(
                {
                    "role": "user",
                    "content": (
                        RETRY_PRACTICE_PROMPT
                        if mode == "practice"
                        else RETRY_BUILDER_PROMPT
                    ),
                }
            )

        try:
            raw_content = _request_ollama(
                messages,
                mode,
            )

            payload = _extract_json(
                raw_content
            )

            hanzi = str(
                payload.get(
                    "hanzi",
                    "",
                )
            ).strip()

            hanzi = _to_simplified(
                hanzi
            )

            if not hanzi:
                raise OllamaServiceError(
                    "Chinese reply is empty."
                )

            if not _contains_chinese(
                hanzi
            ):
                raise OllamaServiceError(
                    "Reply contains no Chinese."
                )

            if mode == "practice":
                if (
                    _normalized_text(hanzi)
                    == _normalized_text(
                        cleaned_text
                    )
                ):
                    raise OllamaServiceError(
                        "Anna repeated the user's sentence."
                    )

                if (
                    _question_count(hanzi)
                    != 1
                ):
                    raise OllamaServiceError(
                        "Anna must ask exactly one question."
                    )

            return {
                "hanzi": hanzi,
                "pinyin": _normalize_pinyin(
                    hanzi
                ),
            }

        except (
            OllamaServiceError,
            ValueError,
        ) as error:
            last_error = error

    raise OllamaServiceError(
        "Anna could not generate a valid reply. "
        f"Last error: {last_error}"
    )
