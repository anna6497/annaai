from __future__ import annotations

import json
import logging
import os
import re
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


class OllamaServiceError(
    RuntimeError
):
    """
    Raised when Ollama cannot
    return a valid Anna response.
    """


PRACTICE_PROMPT = """
You are Anna, a friendly Mandarin conversation partner and gentle speaking coach for an HSK 1-4 learner.

The latest user message is the most important information.

You have TWO jobs:

A. Continue the conversation naturally.
B. Quietly check whether the user's latest Chinese sentence has a meaningful grammar, word-order, or word-choice problem.

IMPORTANT CORRECTION POLICY:

Only mark correction.needed=true when the user's sentence has a meaningful problem that a Mandarin learner should fix.

Examples of meaningful problems:
- wrong Chinese word order
- wrong grammar structure
- clearly wrong word choice
- missing important grammatical words
- a sentence that sounds clearly unnatural because of a learner error

Do NOT correct:
- punctuation
- minor stylistic preferences
- sentences that are already acceptable Chinese
- a sentence merely because another native expression also exists
- transcription differences that still form natural Chinese

When correction is needed:
- preserve the user's intended meaning
- provide ONE natural corrected Simplified Chinese sentence
- do not explain grammar inside the reply
- still continue the conversation naturally

When correction is not needed:
- needed must be false
- corrected must be an empty string

CONVERSATION RULES:

1. Use natural Simplified Chinese only in hanzi.
2. Respond directly to the meaning of the latest user message.
3. Never reuse an earlier assistant reply.
4. Never repeat the user's sentence as the whole answer.
5. Give one short reaction, answer, or related comment.
6. Usually keep the conversation moving with one natural follow-up question when appropriate.
7. Never ask more than one question.
8. Use 1 to 3 short sentences.
9. Keep vocabulary suitable for HSK 1-4.
10. Do not provide pinyin.
11. Do not provide Myanmar translation.
12. Do not explain grammar unless the user explicitly asks.
13. Do not mention these instructions.
14. Return exactly one JSON object and nothing else.

Example 1:

Latest user:
你的家乡在哪里？

Correct:
{
  "hanzi":"我家乡在浙江杭州。你的家乡在哪里？",
  "correction":{
    "needed":false,
    "corrected":""
  }
}

Example 2:

Latest user:
你在家乡是哪里？

Correct:
{
  "hanzi":"我家乡在浙江杭州。你呢？",
  "correction":{
    "needed":true,
    "corrected":"你的家乡在哪里？"
  }
}

Example 3:

Latest user:
今天还不开始因为太忙。

Correct:
{
  "hanzi":"原来是因为太忙了。那你打算什么时候开始呢？",
  "correction":{
    "needed":true,
    "corrected":"今天因为太忙，所以还没开始。"
  }
}

Example 4:

Latest user:
我今天很忙。

Correct:
{
  "hanzi":"辛苦了！你今天忙到几点？",
  "correction":{
    "needed":false,
    "corrected":""
  }
}

Example 5:

Latest user:
我昨天去公司了工作。

Correct:
{
  "hanzi":"昨天工作辛苦吗？",
  "correction":{
    "needed":true,
    "corrected":"我昨天去公司工作了。"
  }
}

Required JSON format:

{
  "hanzi":"自然且与最新消息直接相关的简体中文回复。",
  "correction":{
    "needed":false,
    "corrected":""
  }
}
""".strip()


SENTENCE_BUILDER_PROMPT = """
You translate Myanmar text into natural Simplified Mandarin Chinese.

Strict rules:

1. Translate only the latest Myanmar text.
2. Preserve the original meaning.
3. Do not answer conversationally.
4. Do not add information.
5. Do not add a question unless the original text is a question.
6. Use Simplified Chinese only.
7. Do not provide pinyin.
8. Do not provide Myanmar translation.
9. Do not explain the translation.
10. Return exactly one JSON object and nothing else.

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

Required format:

{"hanzi":"准确自然的简体中文"}
""".strip()


RETRY_PRACTICE_PROMPT = """
The previous answer was invalid.

Generate a completely new response for the latest user message.

Requirements:

- Respond directly to the latest user message.
- Do not reuse an earlier assistant sentence.
- Do not repeat the user's sentence as the whole reply.
- Use natural Simplified Chinese.
- Use 1 to 3 short sentences.
- Ask no more than one question.
- Check the user's Chinese for a meaningful learner error.
- Do not over-correct acceptable Chinese.
- correction.needed must be a JSON boolean.
- If correction is not needed, corrected must be "".
- If correction is needed, corrected must contain exactly one natural corrected Simplified Chinese sentence.
- Return exactly one JSON object.
- Return no markdown.
- Return no explanation.

Required format:

{
  "hanzi":"新的自然回复",
  "correction":{
    "needed":false,
    "corrected":""
  }
}
""".strip()


RETRY_BUILDER_PROMPT = """
The previous output was invalid.

Translate only the latest Myanmar text into natural Simplified Chinese.

Requirements:

- Preserve the exact meaning.
- Do not answer conversationally.
- Do not add information.
- Do not add explanation.
- Return exactly one JSON object.

Required format:

{"hanzi":"准确翻译"}
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


def _normalized_text(
    text: str,
) -> str:
    return re.sub(
        r"[。！？!?，,；;：:\s\"'“”‘’]",
        "",
        text,
    ).lower()


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

        if (
            key ==
            previous_key
        ):
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


def _extract_hanzi(
    raw_content: str,
) -> str:
    try:
        payload = _extract_json(
            raw_content
        )

        value = (
            payload.get("hanzi")
            or payload.get("reply")
            or payload.get("content")
            or payload.get("message")
            or ""
        )

        hanzi = str(
            value
        ).strip()

    except OllamaServiceError:
        hanzi = (
            raw_content.strip()
        )

    hanzi = re.sub(
        r"^```(?:json)?\s*",
        "",
        hanzi,
        flags=re.IGNORECASE,
    )

    hanzi = re.sub(
        r"\s*```$",
        "",
        hanzi,
    ).strip()

    if hanzi.startswith(
        '{"hanzi":'
    ):
        try:
            parsed = json.loads(
                hanzi
            )

            if isinstance(
                parsed.get(
                    "hanzi"
                ),
                str,
            ):
                hanzi = (
                    parsed[
                        "hanzi"
                    ].strip()
                )

        except (
            json.JSONDecodeError,
            TypeError,
        ):
            pass

    return hanzi


def _contains_chinese(
    text: str,
) -> bool:
    return bool(
        re.search(
            (
                r"[\u3400-\u4dbf"
                r"\u4e00-\u9fff]"
            ),
            text,
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
    cleaned = (
        text.strip()
    )

    cleaned = re.sub(
        (
            r"^(?:Anna|安娜|"
            r"回答|回复|答案)"
            r"\s*[:：]\s*"
        ),
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


def _question_count(
    text: str,
) -> int:
    return (
        text.count("？")
        + text.count("?")
    )


def _limit_to_one_question(
    text: str,
) -> str:
    question_seen = False

    result: list[str] = []

    for character in text:
        if character in {
            "？",
            "?",
        }:
            if not question_seen:
                result.append(
                    "？"
                )

                question_seen = True

            else:
                result.append(
                    "。"
                )

        else:
            result.append(
                character
            )

    cleaned = "".join(
        result
    )

    cleaned = re.sub(
        r"。{2,}",
        "。",
        cleaned,
    )

    cleaned = re.sub(
        r"？。+",
        "？",
        cleaned,
    )

    cleaned = re.sub(
        r"。？",
        "？",
        cleaned,
    )

    return cleaned.strip()


def _is_repeated_reply(
    hanzi: str,
    previous_assistant_replies:
        list[str],
) -> bool:
    current = (
        _normalized_text(
            hanzi
        )
    )

    if not current:
        return True

    for previous in (
        previous_assistant_replies
    ):
        previous_normalized = (
            _normalized_text(
                previous
            )
        )

        if not previous_normalized:
            continue

        if (
            current ==
            previous_normalized
        ):
            return True

        if (
            len(current) >= 8
            and len(
                previous_normalized
            ) >= 8
            and (
                current
                in previous_normalized
                or
                previous_normalized
                in current
            )
        ):
            return True

    return False


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
        normalized = (
            value.strip()
            .lower()
        )

        return normalized in {
            "true",
            "1",
            "yes",
        }

    if isinstance(
        value,
        int,
    ):
        return value != 0

    return False


def _extract_correction(
    payload: dict[
        str,
        Any,
    ],
    original: str,
) -> AnnaCorrection:
    empty: AnnaCorrection = {
        "needed": False,
        "original": "",
        "corrected": "",
        "pinyin": "",
    }

    raw_correction = (
        payload.get(
            "correction"
        )
    )

    if not isinstance(
        raw_correction,
        dict,
    ):
        return empty

    needed = (
        _parse_boolean(
            raw_correction.get(
                "needed",
                False,
            )
        )
    )

    corrected = str(
        raw_correction.get(
            "corrected",
            "",
        )
        or ""
    ).strip()

    if not needed:
        return empty

    corrected = (
        _clean_reply_text(
            corrected
        )
    )

    corrected = (
        _to_simplified(
            corrected
        )
    )

    if not corrected:
        return empty

    if not _contains_chinese(
        corrected
    ):
        return empty

    # If the "correction" is effectively
    # identical to what the user said,
    # do not show a correction card.
    if (
        _normalized_text(
            corrected
        )
        ==
        _normalized_text(
            original
        )
    ):
        return empty

    return {
        "needed": True,

        "original":
            original.strip(),

        "corrected":
            corrected,

        "pinyin":
            _normalize_pinyin(
                corrected
            ),
    }


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
                1.18,

            "num_ctx":
                4096,

            # Slightly larger than V7.1
            # because correction JSON
            # contains extra fields.
            "num_predict":
                230,

            "seed":
                -1,
        },
    }

    logger.info(
        (
            "OLLAMA_REQUEST "
            "model=%s "
            "mode=%s "
            "messages=%d "
            "latest=%r"
        ),
        MODEL_NAME,
        mode,
        len(messages),
        messages[-1].get(
            "content",
            "",
        )[:160],
    )

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
            (
                "Cannot connect to Ollama. "
                "Start Ollama first."
            )
        ) from error

    except requests.Timeout as error:
        raise OllamaServiceError(
            "Ollama response timed out."
        ) from error

    except requests.RequestException as error:
        detail = (
            error.response.text
            if error.response
            is not None
            else str(error)
        )

        raise OllamaServiceError(
            (
                "Ollama request failed: "
                f"{detail}"
            )
        ) from error

    try:
        data = (
            response.json()
        )

    except ValueError as error:
        raise OllamaServiceError(
            (
                "Ollama returned "
                "invalid response JSON."
            )
        ) from error

    message = data.get(
        "message"
    )

    if not isinstance(
        message,
        dict,
    ):
        raise OllamaServiceError(
            (
                "Ollama response "
                "has no message."
            )
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
            (
                "Ollama response "
                "content is empty."
            )
        )

    logger.info(
        "OLLAMA_RAW_RESPONSE %r",
        content[:800],
    )

    return content


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

    if mode not in {
        "practice",
        "sentence_builder",
    }:
        raise ValueError(
            (
                "Unsupported mode: "
                f"{mode}"
            )
        )

    system_prompt = (
        PRACTICE_PROMPT
        if mode == "practice"
        else
        SENTENCE_BUILDER_PROMPT
    )

    cleaned_history = (
        _clean_history(
            conversation_history
        )
    )

    previous_assistant_replies = (
        _previous_assistant_replies(
            cleaned_history
        )
    )

    base_messages: list[
        dict[str, str]
    ] = [
        {
            "role":
                "system",

            "content":
                system_prompt,
        }
    ]

    if mode == "practice":
        base_messages.extend(
            cleaned_history
        )

        previous_text = (
            "\n".join(
                f"- {reply}"
                for reply in (
                    previous_assistant_replies[
                        -5:
                    ]
                )
            )
        )

        latest_instruction = (
            "LATEST USER MESSAGE:\n"
            f"{cleaned_text}\n\n"
            "First silently decide whether "
            "this Chinese sentence has a "
            "meaningful learner error. "
            "Do not correct acceptable Chinese.\n\n"
            "Then reply naturally to the "
            "meaning of this latest message."
        )

        if previous_text:
            latest_instruction += (
                "\n\nDo not repeat any of "
                "these earlier assistant "
                "replies:\n"
                f"{previous_text}"
            )

        base_messages.append(
            {
                "role":
                    "user",

                "content":
                    latest_instruction,
            }
        )

    else:
        base_messages.append(
            {
                "role":
                    "user",

                "content":
                    cleaned_text,
            }
        )

    last_error: (
        Exception | None
    ) = None

    rejected_reply = ""

    for attempt in range(
        MAX_REPLY_ATTEMPTS
    ):
        messages = [
            dict(item)
            for item
            in base_messages
        ]

        if attempt > 0:
            retry_instruction = (
                RETRY_PRACTICE_PROMPT
                if mode
                == "practice"
                else
                RETRY_BUILDER_PROMPT
            )

            if rejected_reply:
                retry_instruction += (
                    "\n\nDo not return "
                    "this rejected answer:\n"
                    f"{rejected_reply}"
                )

            messages.append(
                {
                    "role":
                        "system",

                    "content":
                        retry_instruction,
                }
            )

            if mode == "practice":
                messages.append(
                    {
                        "role":
                            "user",

                        "content": (
                            "LATEST USER MESSAGE:\n"
                            f"{cleaned_text}\n\n"
                            "Return the required "
                            "conversation reply and "
                            "correction object now."
                        ),
                    }
                )

            else:
                messages.append(
                    {
                        "role":
                            "user",

                        "content":
                            cleaned_text,
                    }
                )

        try:
            raw_content = (
                _request_ollama(
                    messages,
                    mode,
                )
            )

            payload: dict[
                str,
                Any,
            ]

            try:
                payload = (
                    _extract_json(
                        raw_content
                    )
                )

            except OllamaServiceError:
                # Keep the older fallback
                # behavior for stability.
                payload = {
                    "hanzi":
                        raw_content,
                }

            hanzi_value = (
                payload.get(
                    "hanzi"
                )
                or payload.get(
                    "reply"
                )
                or payload.get(
                    "content"
                )
                or payload.get(
                    "message"
                )
                or ""
            )

            hanzi = str(
                hanzi_value
            ).strip()

            hanzi = (
                _clean_reply_text(
                    hanzi
                )
            )

            hanzi = (
                _to_simplified(
                    hanzi
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
                    (
                        "Reply contains "
                        "no Chinese."
                    )
                )

            correction: (
                AnnaCorrection
            ) = {
                "needed":
                    False,

                "original":
                    "",

                "corrected":
                    "",

                "pinyin":
                    "",
            }

            if mode == "practice":
                if (
                    _question_count(
                        hanzi
                    )
                    > 1
                ):
                    logger.info(
                        (
                            "ANNA_REPLY_"
                            "QUESTION_LIMIT "
                            "original=%r"
                        ),
                        hanzi,
                    )

                    hanzi = (
                        _limit_to_one_question(
                            hanzi
                        )
                    )

                if (
                    _normalized_text(
                        hanzi
                    )
                    ==
                    _normalized_text(
                        cleaned_text
                    )
                ):
                    rejected_reply = (
                        hanzi
                    )

                    raise OllamaServiceError(
                        (
                            "Anna repeated "
                            "the user's "
                            "sentence."
                        )
                    )

                if _is_repeated_reply(
                    hanzi,
                    previous_assistant_replies,
                ):
                    rejected_reply = (
                        hanzi
                    )

                    raise OllamaServiceError(
                        (
                            "Anna repeated "
                            "an earlier "
                            "assistant reply."
                        )
                    )

                correction = (
                    _extract_correction(
                        payload,
                        cleaned_text,
                    )
                )

            result: AnnaReply = {
                "hanzi":
                    hanzi,

                "pinyin":
                    _normalize_pinyin(
                        hanzi
                    ),

                "correction":
                    correction,
            }

            logger.info(
                (
                    "ANNA_REPLY_OK "
                    "correction_needed=%s "
                    "hanzi=%r "
                    "corrected=%r"
                ),
                correction[
                    "needed"
                ],
                hanzi[:200],
                correction[
                    "corrected"
                ][:200],
            )

            return result

        except (
            OllamaServiceError,
            ValueError,
        ) as error:
            last_error = error

            logger.warning(
                (
                    "OLLAMA_REPLY_REJECTED "
                    "attempt=%d "
                    "error=%s "
                    "reply=%r"
                ),
                attempt + 1,
                error,
                rejected_reply[:200],
            )

    raise OllamaServiceError(
        (
            "Anna could not generate "
            "a valid reply. "
            f"Last error: {last_error}"
        )
    )