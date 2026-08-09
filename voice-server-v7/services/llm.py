from __future__ import annotations

import json
import logging
import os
import re
from collections.abc import Iterator
from typing import Any, Literal, TypedDict

import requests
from opencc import OpenCC
from pypinyin import Style, lazy_pinyin


Mode = Literal[
    "practice",
    "sentence_builder",
]

logger = logging.getLogger(
    "anna.llm"
)


# =========================================================
# OLLAMA SETTINGS
# =========================================================

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://127.0.0.1:11434",
).rstrip("/")

OLLAMA_CHAT_URL = (
    f"{OLLAMA_BASE_URL}/api/chat"
)

OLLAMA_TAGS_URL = (
    f"{OLLAMA_BASE_URL}/api/tags"
)

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
        "10",
    )
)

MAX_REPLY_ATTEMPTS = int(
    os.getenv(
        "ANNA_MAX_REPLY_ATTEMPTS",
        "4",
    )
)

TRADITIONAL_TO_SIMPLIFIED = OpenCC(
    "t2s"
)


# =========================================================
# TYPES
# =========================================================

class AnnaCorrection(
    TypedDict
):
    needed: bool
    original: str
    corrected: str
    pinyin: str


class AnnaReply(
    TypedDict
):
    hanzi: str
    pinyin: str
    correction: AnnaCorrection


class StreamEvent(
    TypedDict,
    total=False,
):
    type: str
    text: str
    sentence: str
    hanzi: str
    pinyin: str


class OllamaServiceError(
    RuntimeError
):
    """Raised when Ollama cannot return a valid Anna response."""


# =========================================================
# CONTINUATION INTENT
# =========================================================

CONTINUATION_PHRASES = {
    "继续",
    "继续说",
    "继续说吧",
    "继续讲",
    "继续讲吧",
    "继续讲故事",
    "接着说",
    "接着说吧",
    "接着讲",
    "接着讲吧",
    "然后呢",
    "后来呢",
    "之后呢",
    "再说一点",
    "再讲一点",
    "多说一点",
    "说下去",
    "讲下去",
    "继续下去",
    "再继续",
}


def _normalize_command_text(
    text: str,
) -> str:
    cleaned = (
        text.strip()
        .lower()
    )

    cleaned = re.sub(
        r"[。！？!?，,；;：:\s\"'“”‘’]",
        "",
        cleaned,
    )

    return cleaned


def _is_continuation_request(
    text: str,
) -> bool:
    normalized = (
        _normalize_command_text(
            text
        )
    )

    if not normalized:
        return False

    normalized_phrases = {
        _normalize_command_text(
            phrase
        )
        for phrase in
        CONTINUATION_PHRASES
    }

    if normalized in normalized_phrases:
        return True

    continuation_patterns = [
        r"^继续.*$",
        r"^接着.*$",
        r"^然后呢$",
        r"^后来呢$",
        r"^之后呢$",
        r"^再说.*$",
        r"^再讲.*$",
        r"^说下去$",
        r"^讲下去$",
    ]

    return any(
        re.match(
            pattern,
            normalized,
        )
        for pattern in
        continuation_patterns
    )


def _latest_assistant_message(
    history: list[
        dict[str, str]
    ],
) -> str:
    for item in reversed(
        history
    ):
        if (
            item.get("role")
            == "assistant"
        ):
            content = str(
                item.get(
                    "content",
                    "",
                )
            ).strip()

            if content:
                return content

    return ""


# =========================================================
# PRACTICE PROMPT
# =========================================================

PRACTICE_PROMPT = """
You are Anna, a friendly Mandarin conversation partner and gentle speaking coach for an HSK 1-4 learner.

The latest user message is the most important information.

You have TWO jobs:

A. Continue the conversation naturally.
B. Quietly check whether the user's latest Chinese sentence has a meaningful grammar, word-order, or word-choice problem.

LANGUAGE RULE:

Anna's hanzi response must contain natural Simplified Chinese only.

Never use English words or Latin letters inside hanzi.

Examples:

Wrong:
你 wanna 去公园吗？

Correct:
你想去公园吗？

Wrong:
OK，我们走吧。

Correct:
好，我们走吧。

CORRECTION POLICY:

Only mark correction.needed=true when the user's sentence has a meaningful learner error.

Examples:
- wrong word order
- wrong grammar
- clearly wrong word choice
- missing an important grammar word
- obviously unnatural learner Chinese

Do NOT correct:
- punctuation only
- minor style differences
- already acceptable Chinese
- transcription differences that remain natural

NORMAL CONVERSATION:

- Answer the user's actual message first.
- Use at least 2 short sentences.
- Usually use 2 to 4 short sentences.
- Add a related reaction, detail, or suggestion.
- You may ask one relevant follow-up question.
- Never ask more than one question.
- Keep vocabulary suitable for HSK 1-4.

IMPORTANT CONTINUATION RULE:

If the user says things such as:

继续
继续说吧
接着说
接着讲
然后呢
后来呢
再说一点
说下去

then you MUST continue directly from your most recent assistant message.

When continuing:
- keep the same topic
- keep the same story, advice, explanation, or discussion
- do not restart from the beginning
- do not introduce a new unrelated story
- do not ask what the user wants to hear
- do not summarize what you already said
- continue from the exact logical next point

Return exactly one JSON object.

Required format:

{
  "hanzi":"自然的简体中文回复。",
  "correction":{
    "needed":false,
    "corrected":""
  }
}
""".strip()


# =========================================================
# SENTENCE BUILDER
# =========================================================

SENTENCE_BUILDER_PROMPT = """
You translate Myanmar text into natural Simplified Mandarin Chinese.

Strict rules:

1. Translate only the latest Myanmar text.
2. Preserve the original meaning.
3. Do not answer conversationally.
4. Do not add information.
5. Do not add a question unless the original is a question.
6. Use Simplified Chinese only.
7. Do not provide pinyin.
8. Do not provide Myanmar translation.
9. Do not explain the translation.
10. Return exactly one JSON object.

Required format:

{"hanzi":"准确自然的简体中文"}
""".strip()


# =========================================================
# RETRY PROMPTS
# =========================================================

RETRY_PRACTICE_PROMPT = """
The previous answer was invalid.

Generate a new natural Simplified Chinese reply.

Rules:

- Use Chinese only.
- Do not use Latin letters.
- Answer the latest message directly.
- Normal chat should contain at least 2 short sentences.
- Never ask more than one question.
- Do not repeat an earlier Anna reply.
- If the user asked to continue, continue from the latest assistant message.
- Do not restart the topic.
- Return JSON only.

Required format:

{
  "hanzi":"新的自然中文回复。",
  "correction":{
    "needed":false,
    "corrected":""
  }
}
""".strip()


RETRY_BUILDER_PROMPT = """
Translate only the latest Myanmar text into natural Simplified Chinese.

Return exactly one JSON object.

Required format:

{"hanzi":"准确翻译"}
""".strip()


# =========================================================
# LIVE STREAMING PROMPT
# =========================================================

STREAMING_PRACTICE_PROMPT = """
You are Anna, a friendly and expressive Mandarin AI speaking partner.

Your reply is streamed live and spoken aloud by Mandarin TTS.

LANGUAGE:

- Output Simplified Chinese only.
- Never output English.
- Never output Latin letters.
- Never mix Chinese and English.
- Do not output JSON.
- Do not output pinyin.
- Do not output Myanmar translation.
- Do not output markdown.
- Do not output labels.

NORMAL CHAT:

- Answer the user's actual meaning immediately.
- Use at least 2 short sentences.
- Usually use 2 to 4 short sentences.
- Sentence 1 should directly answer or react.
- Add a natural related detail or reaction.
- You may ask one short follow-up question.
- Never ask more than one question.
- Keep vocabulary suitable for HSK 1-4.

CONTINUATION:

If the user says:
继续
继续说吧
继续讲
接着说
接着讲
然后呢
后来呢
之后呢
再说一点
再讲一点
说下去
讲下去

you MUST continue from your latest assistant response in conversation history.

When continuing:
- continue the same story, advice, explanation, topic, or discussion
- do not restart from the beginning
- do not tell a new unrelated story
- do not repeat the previous assistant message
- do not ask "你想听什么？"
- move directly to the next logical part
- remember names, characters, events, and details already mentioned

STORY:

If the current topic is a story:
- continue the existing story
- preserve the same characters and events
- add the next events naturally
- normally add 4 to 10 short sentences when the user asks to continue
- do not restart with a new "今天有一只..." story unless there was no previous story

ADVICE:

If the user asks to continue advice:
- continue with the next useful suggestions
- do not repeat earlier suggestions

EXPLANATION:

If the user asks to continue an explanation:
- continue from the next point
- do not repeat the beginning

ORIGINAL SONG:

If the user asks you to sing:
- create completely original Chinese lyrics
- never reproduce existing song lyrics
- keep it short and learner-friendly

LIVE TTS:

- use short complete sentences
- use Chinese punctuation
- start immediately
- avoid giant paragraphs

Return only the Chinese words Anna should say.
""".strip()


# =========================================================
# CONTINUATION SYSTEM PROMPT
# =========================================================

CONTINUATION_SYSTEM_PROMPT = """
The user explicitly asked you to continue.

This is NOT a request to start a new topic.

Continue directly from the most recent assistant response.

STRICT RULES:

1. Keep exactly the same topic.
2. If it is a story, preserve the same characters, setting, and events.
3. If it is advice, give the next advice points.
4. If it is an explanation, continue the next logical part.
5. Do not repeat the previous assistant response.
6. Do not restart from the beginning.
7. Do not create an unrelated example or story.
8. Do not ask what the user wants to hear.
9. Use Simplified Chinese only.
10. Never use English or Latin letters.
11. Continue naturally and immediately.
""".strip()


# =========================================================
# DEFERRED CORRECTION
# =========================================================

CORRECTION_ONLY_PROMPT = """
You are a Mandarin correction checker.

Only check the user's latest Chinese sentence.

Do not answer the user.
Do not continue the conversation.
Do not explain grammar.

Set needed=true only for a meaningful learner error.

If needed=true:
- return one natural corrected Simplified Chinese sentence

If needed=false:
- corrected must be ""

Return exactly one JSON object.

Format:

{
  "needed":false,
  "corrected":""
}
""".strip()


# =========================================================
# CONNECTION
# =========================================================

def check_ollama_connection() -> bool:
    try:
        response = requests.get(
            OLLAMA_TAGS_URL,
            timeout=5,
        )

        return response.ok

    except requests.RequestException:
        return False


# =========================================================
# TEXT HELPERS
# =========================================================

def _normalized_text(
    text: str,
) -> str:
    return re.sub(
        r"[。！？!?，,；;：:\s\"'“”‘’]",
        "",
        text,
    ).lower()


def _contains_chinese(
    text: str,
) -> bool:
    return bool(
        re.search(
            r"[\u3400-\u4dbf\u4e00-\u9fff]",
            text,
        )
    )


LATIN_LETTER_PATTERN = re.compile(
    r"[A-Za-z]"
)

LATIN_WORD_PATTERN = re.compile(
    r"[A-Za-z]+(?:['’-][A-Za-z]+)*"
)


def _contains_latin_letters(
    text: str,
) -> bool:
    return bool(
        LATIN_LETTER_PATTERN.search(
            text
        )
    )


def _to_simplified(
    text: str,
) -> str:
    return (
        TRADITIONAL_TO_SIMPLIFIED
        .convert(text)
        .strip()
    )


def _clean_reply_text(
    text: str,
) -> str:
    cleaned = text.strip()

    cleaned = re.sub(
        r"^(?:Anna|安娜|回答|回复|答案)\s*[:：]\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = cleaned.strip(
        "\"'“”‘’"
    )

    cleaned = re.sub(
        r"\s+",
        " ",
        cleaned,
    )

    return cleaned.strip()


def _count_sentences(
    text: str,
) -> int:
    count = len(
        re.findall(
            r"[。！？!?]",
            text,
        )
    )

    if (
        count == 0
        and text.strip()
    ):
        return 1

    return count


# =========================================================
# HISTORY
# =========================================================

def _clean_history(
    history: (
        list[dict[str, str]]
        | None
    ),
) -> list[
    dict[str, str]
]:
    if not history:
        return []

    cleaned: list[
        dict[str, str]
    ] = []

    previous_key = ""

    for item in history[
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

        key = (
            f"{role}:"
            f"{_normalized_text(content)}"
        )

        if key == previous_key:
            continue

        cleaned.append(
            {
                "role":
                    role,

                "content":
                    content,
            }
        )

        previous_key = key

    return cleaned


def _previous_assistant_replies(
    history: list[
        dict[str, str]
    ],
) -> list[str]:
    return [
        item["content"].strip()
        for item in history
        if (
            item.get("role")
            == "assistant"
            and item.get(
                "content",
                "",
            ).strip()
        )
    ]


# =========================================================
# JSON
# =========================================================

def _extract_json(
    text: str,
) -> dict[
    str,
    Any,
]:
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
        parsed = json.loads(
            cleaned
        )

        if isinstance(
            parsed,
            dict,
        ):
            return parsed

    except json.JSONDecodeError:
        pass

    start = cleaned.find(
        "{"
    )

    end = cleaned.rfind(
        "}"
    )

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
            cleaned[
                start:
                end + 1
            ]
        )

    except json.JSONDecodeError as error:
        raise OllamaServiceError(
            "Ollama returned invalid JSON."
        ) from error

    if not isinstance(
        parsed,
        dict,
    ):
        raise OllamaServiceError(
            "Ollama JSON must be an object."
        )

    return parsed


# =========================================================
# PINYIN
# =========================================================

def _normalize_pinyin(
    hanzi: str,
) -> str:
    if not hanzi.strip():
        return ""

    tokens = lazy_pinyin(
        hanzi,
        style=Style.TONE,
        neutral_tone_with_five=False,
        errors=lambda value:
            list(value),
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
                and not result.endswith(
                    " "
                )
            ):
                result += " "

            result += token

    return re.sub(
        r"\s+",
        " ",
        result,
    ).strip()


# =========================================================
# ENGLISH SANITIZER
# =========================================================

STREAM_ENGLISH_REPLACEMENTS: dict[
    str,
    str,
] = {
    "wanna": "想",
    "want": "想",
    "ok": "好",
    "okay": "好",
    "yeah": "对",
    "yes": "对",
    "maybe": "也许",
    "sorry": "对不起",
    "nice": "不错",
    "cool": "不错",
    "good": "好",
    "hello": "你好",
    "hi": "你好",
    "bye": "再见",
    "please": "请",
    "thanks": "谢谢",
}


def _convert_stream_latin_word(
    word: str,
) -> str:
    cleaned = (
        word.strip()
        .lower()
    )

    if not cleaned:
        return ""

    replacement = (
        STREAM_ENGLISH_REPLACEMENTS
        .get(
            cleaned
        )
    )

    if replacement:
        return replacement

    logger.warning(
        "Unknown Latin word blocked: %r",
        word,
    )

    return "这个"


# =========================================================
# CORRECTION
# =========================================================

def _parse_boolean(
    value: Any,
) -> bool:
    if isinstance(
        value,
        bool,
    ):
        return value

    if isinstance(
        value,
        str,
    ):
        return (
            value.strip()
            .lower()
            in {
                "true",
                "1",
                "yes",
            }
        )

    return False


def check_user_correction(
    user_text: str,
) -> AnnaCorrection:
    empty: AnnaCorrection = {
        "needed":
            False,

        "original":
            "",

        "corrected":
            "",

        "pinyin":
            "",
    }

    cleaned_text = (
        user_text.strip()
    )

    if not cleaned_text:
        return empty

    if (
        _is_continuation_request(
            cleaned_text
        )
    ):
        return empty

    if not _contains_chinese(
        cleaned_text
    ):
        return empty

    payload = {
        "model":
            MODEL_NAME,

        "messages": [
            {
                "role":
                    "system",

                "content":
                    CORRECTION_ONLY_PROMPT,
            },

            {
                "role":
                    "user",

                "content":
                    cleaned_text,
            },
        ],

        "stream":
            False,

        "format":
            "json",

        "think":
            False,

        "keep_alive":
            "30m",

        "options": {
            "temperature":
                0.0,

            "num_ctx":
                1536,

            "num_predict":
                100,
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

        data = response.json()

        message = data.get(
            "message"
        )

        if not isinstance(
            message,
            dict,
        ):
            return empty

        parsed = _extract_json(
            str(
                message.get(
                    "content",
                    "",
                )
            )
        )

    except Exception:
        return empty

    needed = (
        _parse_boolean(
            parsed.get(
                "needed",
                False,
            )
        )
    )

    if not needed:
        return empty

    corrected = (
        _to_simplified(
            _clean_reply_text(
                str(
                    parsed.get(
                        "corrected",
                        "",
                    )
                )
            )
        )
    )

    if (
        not corrected
        or
        not _contains_chinese(
            corrected
        )
    ):
        return empty

    if (
        _normalized_text(
            corrected
        )
        ==
        _normalized_text(
            cleaned_text
        )
    ):
        return empty

    return {
        "needed":
            True,

        "original":
            cleaned_text,

        "corrected":
            corrected,

        "pinyin":
            _normalize_pinyin(
                corrected
            ),
    }


# =========================================================
# NON-STREAM REQUEST
# =========================================================

def _request_ollama(
    messages: list[
        dict[str, str]
    ],
    mode: Mode,
) -> str:
    payload = {
        "model":
            MODEL_NAME,

        "messages":
            messages,

        "stream":
            False,

        "format":
            "json",

        "think":
            False,

        "keep_alive":
            "30m",

        "options": {
            "temperature": (
                0.45
                if mode
                == "practice"
                else 0.0
            ),

            "top_p":
                0.85,

            "repeat_penalty":
                1.15,

            "num_ctx":
                3072,

            "num_predict":
                320,
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

    except requests.RequestException as error:
        raise OllamaServiceError(
            "Ollama request failed."
        ) from error

    data = response.json()

    message = data.get(
        "message"
    )

    if not isinstance(
        message,
        dict,
    ):
        raise OllamaServiceError(
            "Ollama response has no message."
        )

    content = message.get(
        "content"
    )

    if (
        not isinstance(
            content,
            str,
        )
        or not content.strip()
    ):
        raise OllamaServiceError(
            "Ollama response is empty."
        )

    return content


# =========================================================
# STRUCTURED REPLY
# =========================================================

def generate_reply(
    user_text: str,
    mode: Mode =
        "practice",
    conversation_history: (
        list[
            dict[str, str]
        ]
        | None
    ) = None,
) -> AnnaReply:
    cleaned_text = (
        user_text.strip()
    )

    if not cleaned_text:
        raise ValueError(
            "User text cannot be empty."
        )

    history = (
        _clean_history(
            conversation_history
        )
    )

    continuation = (
        mode == "practice"
        and
        _is_continuation_request(
            cleaned_text
        )
    )

    messages: list[
        dict[str, str]
    ] = [
        {
            "role":
                "system",

            "content": (
                PRACTICE_PROMPT
                if mode ==
                "practice"
                else
                SENTENCE_BUILDER_PROMPT
            ),
        }
    ]

    messages.extend(
        history
    )

    if continuation:
        previous_assistant = (
            _latest_assistant_message(
                history
            )
        )

        messages.append(
            {
                "role":
                    "system",

                "content":
                    CONTINUATION_SYSTEM_PROMPT,
            }
        )

        if previous_assistant:
            messages.append(
                {
                    "role":
                        "system",

                    "content": (
                        "Most recent Anna message:\n"
                        f"{previous_assistant}\n\n"
                        "Continue from this exact point."
                    ),
                }
            )

    messages.append(
        {
            "role":
                "user",

            "content":
                cleaned_text,
        }
    )

    raw = _request_ollama(
        messages,
        mode,
    )

    try:
        payload = (
            _extract_json(
                raw
            )
        )
    except OllamaServiceError:
        payload = {
            "hanzi":
                raw,
        }

    hanzi = (
        _to_simplified(
            _clean_reply_text(
                str(
                    payload.get(
                        "hanzi",
                        "",
                    )
                )
            )
        )
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

    if (
        mode == "practice"
        and
        _contains_latin_letters(
            hanzi
        )
    ):
        raise OllamaServiceError(
            "Reply contains Latin text."
        )

    correction: AnnaCorrection = {
        "needed":
            False,

        "original":
            "",

        "corrected":
            "",

        "pinyin":
            "",
    }

    if (
        mode == "practice"
        and
        not continuation
    ):
        correction = (
            check_user_correction(
                cleaned_text
            )
        )

    return {
        "hanzi":
            hanzi,

        "pinyin":
            _normalize_pinyin(
                hanzi
            ),

        "correction":
            correction,
    }


# =========================================================
# STREAM REQUEST
# =========================================================

def _stream_ollama_text(
    messages: list[
        dict[str, str]
    ],
    num_predict: int,
    temperature: float,
) -> Iterator[str]:
    payload = {
        "model":
            MODEL_NAME,

        "messages":
            messages,

        "stream":
            True,

        "think":
            False,

        "keep_alive":
            "30m",

        "options": {
            "temperature":
                temperature,

            "top_p":
                0.85,

            "repeat_penalty":
                1.12,

            "num_ctx":
                3072,

            "num_predict":
                num_predict,
        },
    }

    try:
        with requests.post(
            OLLAMA_CHAT_URL,
            json=payload,
            stream=True,
            timeout=(
                10,
                REQUEST_TIMEOUT,
            ),
        ) as response:

            response.raise_for_status()

            for raw_line in (
                response.iter_lines(
                    decode_unicode=True,
                    chunk_size=1,
                )
            ):
                if not raw_line:
                    continue

                try:
                    data = json.loads(
                        raw_line
                    )

                except json.JSONDecodeError:
                    continue

                message = data.get(
                    "message"
                )

                if isinstance(
                    message,
                    dict,
                ):
                    content = (
                        message.get(
                            "content",
                            "",
                        )
                    )

                    if (
                        isinstance(
                            content,
                            str,
                        )
                        and content
                    ):
                        yield content

                if data.get(
                    "done",
                    False,
                ):
                    break

    except requests.RequestException as error:
        raise OllamaServiceError(
            "Ollama streaming request failed."
        ) from error


# =========================================================
# TRUE LIVE STREAM
# =========================================================

def stream_reply_text(
    user_text: str,
    conversation_history: (
        list[
            dict[str, str]
        ]
        | None
    ) = None,
) -> Iterator[
    StreamEvent
]:
    cleaned_text = (
        user_text.strip()
    )

    if not cleaned_text:
        raise OllamaServiceError(
            "User message is empty."
        )

    history = (
        _clean_history(
            conversation_history
        )
    )

    continuation = (
        _is_continuation_request(
            cleaned_text
        )
    )

    messages: list[
        dict[str, str]
    ] = [
        {
            "role":
                "system",

            "content":
                STREAMING_PRACTICE_PROMPT,
        }
    ]

    messages.extend(
        history
    )

    if continuation:
        previous_assistant = (
            _latest_assistant_message(
                history
            )
        )

        messages.append(
            {
                "role":
                    "system",

                "content":
                    CONTINUATION_SYSTEM_PROMPT,
            }
        )

        if previous_assistant:
            messages.append(
                {
                    "role":
                        "system",

                    "content": (
                        "The exact most recent Anna response was:\n\n"
                        f"{previous_assistant}\n\n"
                        "Continue directly from this exact response. "
                        "Do not restart it."
                    ),
                }
            )

    messages.append(
        {
            "role":
                "user",

            "content":
                cleaned_text,
        }
    )

    full_text = ""
    sentence_buffer = ""
    latin_buffer = ""

    token_events = 0
    sentence_events = 0


    def emit_text(
        text: str,
    ) -> Iterator[
        StreamEvent
    ]:
        nonlocal full_text
        nonlocal sentence_buffer
        nonlocal token_events
        nonlocal sentence_events

        simplified = (
            TRADITIONAL_TO_SIMPLIFIED
            .convert(
                text
            )
        )

        if not simplified:
            return

        full_text += (
            simplified
        )

        sentence_buffer += (
            simplified
        )

        token_events += 1

        yield {
            "type":
                "token",

            "text":
                simplified,
        }

        while True:
            match = re.search(
                r"[。！？!?]",
                sentence_buffer,
            )

            if not match:
                break

            end_index = (
                match.end()
            )

            sentence = (
                sentence_buffer[
                    :end_index
                ]
                .strip()
            )

            sentence_buffer = (
                sentence_buffer[
                    end_index:
                ]
            )

            if (
                sentence
                and
                _contains_chinese(
                    sentence
                )
            ):
                sentence_events += 1

                yield {
                    "type":
                        "sentence",

                    "sentence":
                        sentence,
                }


    for raw_chunk in (
        _stream_ollama_text(
            messages,
            num_predict=(
                700
                if continuation
                else 1000
            ),
            temperature=0.52,
        )
    ):
        output_buffer = ""

        for character in raw_chunk:
            if (
                character.isascii()
                and
                character.isalpha()
            ):
                latin_buffer += (
                    character
                )

                continue

            if latin_buffer:
                output_buffer += (
                    _convert_stream_latin_word(
                        latin_buffer
                    )
                )

                latin_buffer = ""

            output_buffer += (
                character
            )

        if output_buffer:
            for event in (
                emit_text(
                    output_buffer
                )
            ):
                yield event


    if latin_buffer:
        replacement = (
            _convert_stream_latin_word(
                latin_buffer
            )
        )

        latin_buffer = ""

        if replacement:
            for event in (
                emit_text(
                    replacement
                )
            ):
                yield event


    final_text = (
        _to_simplified(
            _clean_reply_text(
                full_text
            )
        )
    )

    if not final_text:
        raise OllamaServiceError(
            "Streaming reply was empty."
        )

    if not _contains_chinese(
        final_text
    ):
        raise OllamaServiceError(
            "Streaming reply contains no Chinese."
        )

    if _contains_latin_letters(
        final_text
    ):
        raise OllamaServiceError(
            "Streaming reply contains Latin text."
        )


    remaining_sentence = (
        sentence_buffer.strip()
    )

    if (
        remaining_sentence
        and
        _contains_chinese(
            remaining_sentence
        )
    ):
        sentence_events += 1

        yield {
            "type":
                "sentence",

            "sentence":
                remaining_sentence,
        }


    final_pinyin = (
        _normalize_pinyin(
            final_text
        )
    )

    logger.info(
        (
            "OLLAMA_STREAM_DONE "
            "continuation=%s "
            "characters=%d "
            "token_events=%d "
            "sentence_events=%d "
            "hanzi=%r"
        ),
        continuation,
        len(
            final_text
        ),
        token_events,
        sentence_events,
        final_text[:300],
    )

    yield {
        "type":
            "done",

        "hanzi":
            final_text,

        "pinyin":
            final_pinyin,
    }