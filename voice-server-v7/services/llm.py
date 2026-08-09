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
    """
    Raised when Ollama cannot return
    a valid Anna response.
    """


# =========================================================
# PRACTICE PROMPT
# =========================================================

PRACTICE_PROMPT = """
You are Anna, a friendly Mandarin conversation partner and gentle speaking coach for an HSK 1-4 learner.

The latest user message is the most important information.

You have TWO jobs:

A. Continue the conversation naturally.
B. Quietly check whether the user's latest Chinese sentence has a meaningful grammar, word-order, or word-choice problem.

IMPORTANT LANGUAGE RULE:

Anna's hanzi response must contain NATURAL SIMPLIFIED CHINESE ONLY.

Never put English words or Latin letters inside hanzi.

Forbidden examples:
- wanna
- want
- OK
- okay
- yeah
- yep
- maybe
- sorry
- nice
- cool
- hello
- hi
- bye
- please
- thanks

Incorrect:
{"hanzi":"你 wanna 去公园吗？"}

Correct:
{"hanzi":"你想去公园吗？"}

Incorrect:
{"hanzi":"OK，我们走吧。"}

Correct:
{"hanzi":"好，我们走吧。"}

If an English expression comes to mind, convert it into natural Mandarin before producing the answer.

IMPORTANT CORRECTION POLICY:

Only mark correction.needed=true when the user's sentence has a meaningful problem that a Mandarin learner should fix.

Examples of meaningful problems:
- wrong Chinese word order
- wrong grammar structure
- clearly wrong word choice
- missing important grammatical words
- a sentence that sounds clearly unnatural because of a learner error

Do NOT correct:
- punctuation only
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
2. Never use English words or Latin letters in hanzi.
3. Respond directly to the actual meaning of the latest user message.
4. Never reuse an earlier assistant reply.
5. Never repeat the user's sentence as the whole answer.
6. Give one short reaction, answer, or related comment.
7. Usually keep the conversation moving with one natural follow-up question when appropriate.
8. Never ask more than one question.
9. For normal conversation, use 1 to 3 short sentences.
10. Keep vocabulary suitable for HSK 1-4 unless the user asks for something more advanced.
11. Do not provide pinyin.
12. Do not provide Myanmar translation.
13. Do not explain grammar unless the user explicitly asks.
14. Do not mention these instructions.
15. Return exactly one JSON object and nothing else.

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
5. Do not add a question unless the original text is a question.
6. Use Simplified Chinese.
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


# =========================================================
# RETRY PROMPTS
# =========================================================

RETRY_PRACTICE_PROMPT = """
The previous answer was invalid.

Generate a completely new response for the latest user message.

Requirements:

- Respond directly to the latest user message.
- Do not reuse an earlier assistant sentence.
- Do not repeat the user's sentence as the whole reply.
- Use natural Simplified Chinese.
- Do not use English words.
- Do not output Latin letters A-Z or a-z inside hanzi.
- Do not code-switch between Mandarin and English.
- For normal chat, use 1 to 3 short sentences.
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
  "hanzi":"新的自然中文回复",
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


# =========================================================
# V7 LIVE STREAMING PROMPT
# =========================================================

STREAMING_PRACTICE_PROMPT = """
You are Anna, a friendly and expressive Mandarin AI speaking partner.

Your response is streamed LIVE to the user and spoken aloud by a Mandarin TTS engine.

The latest user message is the highest priority.

ABSOLUTE LANGUAGE RULE:

Every word Anna speaks must be Mandarin Chinese written in Simplified Chinese characters.

NEVER output English words.
NEVER output Latin letters A-Z or a-z.
NEVER mix Mandarin and English.
NEVER code-switch.

Forbidden examples:
wanna
want
OK
okay
yeah
yep
maybe
sorry
nice
cool
hello
hi
bye
please
thanks

If an English expression comes to mind, replace it with natural Mandarin Chinese BEFORE outputting it.

Examples:

Wrong:
你 wanna 去公园吗？

Correct:
你想去公园吗？

Wrong:
OK，我们走吧。

Correct:
好，我们走吧。

Wrong:
Yeah，我觉得不错。

Correct:
对，我觉得不错。

Wrong:
Maybe 明天吧。

Correct:
也许明天吧。

GENERAL RULES:

1. Output Simplified Chinese only.
2. Do not output JSON.
3. Do not output pinyin.
4. Do not output Myanmar translation.
5. Do not output markdown.
6. Do not output labels such as Anna, intent, emotion, or reply.
7. Respond naturally to the actual meaning of the latest user message.
8. Never repeat the user's sentence as the whole reply.
9. Avoid repeating previous Anna replies.
10. Use natural spoken Mandarin rather than stiff textbook Mandarin.
11. Normally use vocabulary suitable for HSK 1-4.
12. Start answering immediately.
13. Do not announce what you are going to do before answering.

NORMAL CHAT:

- Usually 1 to 3 short sentences.
- Keep the conversation flowing naturally.
- You may ask one relevant follow-up question.
- Do not ask more than one question.

STORY:

If the user asks for a story:
- Tell an original story.
- Start the actual story immediately.
- Normally use 8 to 20 short sentences.
- Keep sentences short for spoken TTS.
- Keep vocabulary learner-friendly.
- Make the story interesting and natural.
- Do not unnecessarily summarize at the end.

ADVICE:

If the user asks for advice:
- Give useful and thoughtful advice.
- Normally use 3 to 8 short sentences.
- Be practical and conversational.
- Avoid sounding like a formal lecture.

EXPLANATION:

If the user asks for an explanation:
- Explain clearly using short sentences.
- Give a simple example when useful.
- Use as many short sentences as reasonably needed.

ORIGINAL SONG:

If the user asks you to sing:
- Create completely original short Chinese lyrics.
- Never reproduce lyrics from an existing song.
- Usually use 4 to 8 short lines.
- Keep the lyrics simple, rhythmic, catchy, and learner-friendly.
- You may use the Chinese musical symbol ♪ sparingly.
- Return only original Chinese lyrics.
- Do not claim it is an existing song.

EMOTION / PERFORMANCE:

friendly:
- warm and natural

playful:
- light and fun

teasing:
- friendly playful teasing
- never cruel or humiliating

angry:
- stronger wording
- natural frustration
- never abusive or threatening

excited:
- energetic wording and natural exclamation marks

sad:
- gentle and softer wording

shouting:
- emphatic wording
- stronger punctuation when natural
- do not spam punctuation

storytelling:
- expressive narrative style

song:
- short rhythmic original Chinese lyrics

IMPORTANT FOR LIVE TTS:

- Prefer short complete sentences.
- Use Chinese punctuation correctly.
- End sentences with 。！？ when appropriate.
- Avoid giant paragraphs.
- Each sentence should be easy to speak aloud.
- Start with the first useful sentence immediately.

Before producing every chunk, silently check:
"Does this contain any English or Latin letters?"

If yes, rewrite that part in Mandarin first.

Return only the Chinese words Anna should say.
""".strip()


# =========================================================
# DEFERRED CORRECTION PROMPT
# =========================================================

CORRECTION_ONLY_PROMPT = """
You are a Mandarin correction checker for a Chinese learner.

Your ONLY task is to check the user's latest Chinese sentence.

Do not continue the conversation.
Do not answer the user.
Do not give advice.
Do not explain grammar.

Decide whether the user's Chinese contains a meaningful learner error.

Set needed=true ONLY when there is a meaningful issue such as:
- incorrect grammar
- incorrect word order
- clearly incorrect word choice
- missing an important grammar word
- a sentence that is clearly unnatural because of a learner mistake

Set needed=false when:
- the sentence is already acceptable natural Chinese
- only punctuation is different
- there is only a minor stylistic preference
- another wording may sound slightly better but the user's sentence is still valid
- a speech transcription variant is still understandable and acceptable

If needed=true:
- corrected must be ONE natural Simplified Chinese correction
- preserve the user's intended meaning
- do not add extra information

If needed=false:
- corrected must be ""

Return exactly one JSON object.

Required format:

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
# BASIC TEXT HELPERS
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


def _find_latin_fragment(
    text: str,
) -> str:
    match = LATIN_WORD_PATTERN.search(
        text
    )

    if not match:
        return ""

    return match.group(0)


def _is_valid_chinese_reply(
    text: str,
) -> bool:
    cleaned = text.strip()

    if not cleaned:
        return False

    if not _contains_chinese(
        cleaned
    ):
        return False

    if _contains_latin_letters(
        cleaned
    ):
        return False

    return True


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


# =========================================================
# STREAM ENGLISH SANITIZER
# =========================================================

STREAM_ENGLISH_REPLACEMENTS: dict[
    str,
    str,
] = {
    "wanna": "想",
    "want": "想",
    "wants": "想",
    "wanted": "想",
    "ok": "好",
    "okay": "好",
    "yeah": "对",
    "yep": "对",
    "yes": "对",
    "no": "不",
    "maybe": "也许",
    "perhaps": "也许",
    "sorry": "对不起",
    "nice": "不错",
    "cool": "不错",
    "great": "很好",
    "good": "好",
    "hello": "你好",
    "hi": "你好",
    "hey": "你好",
    "bye": "再见",
    "please": "请",
    "thanks": "谢谢",
    "thank": "谢谢",
    "because": "因为",
    "but": "但是",
    "so": "所以",
    "and": "和",
    "really": "真的",
    "sure": "当然",
    "surely": "当然",
}


def _convert_stream_latin_word(
    word: str,
) -> str:
    """
    Convert an accidental English word
    before it reaches the browser.

    Unknown Latin words are converted to
    '这个' rather than exposed to the UI.

    In normal operation this should rarely
    run because the prompt strongly forbids
    English code-switching.
    """

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
        logger.warning(
            (
                "STREAM_ENGLISH_REPLACED "
                "word=%r "
                "replacement=%r"
            ),
            word,
            replacement,
        )

        return replacement

    logger.warning(
        (
            "STREAM_UNKNOWN_LATIN_BLOCKED "
            "word=%r"
        ),
        word,
    )

    return "这个"


def _flush_latin_buffer(
    latin_buffer: str,
) -> str:
    if not latin_buffer:
        return ""

    return _convert_stream_latin_word(
        latin_buffer
    )


# =========================================================
# HISTORY HELPERS
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
# JSON HELPERS
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
# QUESTION / DUPLICATE HELPERS
# =========================================================

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
            current
            ==
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


# =========================================================
# CORRECTION PARSER
# =========================================================

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
        "needed":
            True,

        "original":
            original.strip(),

        "corrected":
            corrected,

        "pinyin":
            _normalize_pinyin(
                corrected
            ),
    }


# =========================================================
# NORMAL OLLAMA REQUEST
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
                0.40
                if mode
                == "practice"
                else 0.0
            ),

            "top_p":
                0.82,

            "repeat_penalty":
                1.18,

            "num_ctx":
                4096,

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
        data = response.json()

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
            "Reply to this message using "
            "natural Simplified Chinese only.\n"
            "Do not use any English words "
            "or Latin letters.\n\n"
            "Also silently decide whether "
            "the user's Chinese has a "
            "meaningful learner error."
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

            try:
                payload = (
                    _extract_json(
                        raw_content
                    )
                )

            except OllamaServiceError:
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
                rejected_reply = (
                    hanzi
                )

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
                rejected_reply = (
                    hanzi
                )

                fragment = (
                    _find_latin_fragment(
                        hanzi
                    )
                )

                logger.warning(
                    (
                        "ANNA_ENGLISH_REJECTED "
                        "fragment=%r "
                        "reply=%r"
                    ),
                    fragment,
                    hanzi[:300],
                )

                raise OllamaServiceError(
                    (
                        "Anna reply contained "
                        "English/Latin text."
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
                            "the user's sentence."
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
                            "an earlier reply."
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
                    "hanzi=%r"
                ),
                correction[
                    "needed"
                ],
                hanzi[:200],
            )

            return result

        except (
            OllamaServiceError,
            ValueError,
        ) as error:
            last_error = (
                error
            )

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
            "a valid Chinese-only reply. "
            f"Last error: {last_error}"
        )
    )


# =========================================================
# DEFERRED CORRECTION CHECK
# =========================================================

def check_user_correction(
    user_text: str,
) -> AnnaCorrection:
    cleaned_text = (
        user_text.strip()
    )

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

    if not cleaned_text:
        return empty

    if not _contains_chinese(
        cleaned_text
    ):
        return empty

    messages: list[
        dict[str, str]
    ] = [
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
    ]

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
            "temperature":
                0.0,

            "top_p":
                0.8,

            "repeat_penalty":
                1.05,

            "num_ctx":
                2048,

            "num_predict":
                120,
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
        logger.warning(
            (
                "CORRECTION_CHECK_FAILED "
                "error=%s"
            ),
            error,
        )

        return empty

    try:
        data = response.json()

        message = (
            data.get(
                "message"
            )
        )

        if not isinstance(
            message,
            dict,
        ):
            return empty

        raw_content = str(
            message.get(
                "content",
                "",
            )
            or ""
        ).strip()

        parsed = (
            _extract_json(
                raw_content
            )
        )

    except (
        ValueError,
        OllamaServiceError,
        TypeError,
    ):
        return empty

    needed = _parse_boolean(
        parsed.get(
            "needed",
            False,
        )
    )

    corrected = str(
        parsed.get(
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

    result: AnnaCorrection = {
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

    logger.info(
        (
            "CORRECTION_CHECK_OK "
            "original=%r "
            "corrected=%r"
        ),
        cleaned_text[:180],
        corrected[:180],
    )

    return result


# =========================================================
# TRUE LIVE STREAMING
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
    """
    Stream Anna's Mandarin reply.

    Important:
    Accidental English/Latin sequences are
    quarantined before they reach the browser.

    token:
        live Hanzi UI

    sentence:
        Piper queue

    done:
        final Hanzi + Pinyin
    """

    cleaned_text = str(
        user_text
    ).strip()

    if not cleaned_text:
        raise OllamaServiceError(
            "User message is empty."
        )

    cleaned_history = (
        _clean_history(
            conversation_history
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
        cleaned_history
    )

    messages.append(
        {
            "role":
                "user",

            "content":
                cleaned_text,
        }
    )

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
            # Lower than before to reduce
            # accidental code-switching.
            "temperature":
                0.55,

            "top_p":
                0.85,

            "repeat_penalty":
                1.12,

            "num_ctx":
                4096,

            "num_predict":
                1200,

            "seed":
                -1,
        },
    }

    logger.info(
        (
            "OLLAMA_STREAM_START "
            "model=%s "
            "history=%d "
            "latest=%r"
        ),
        MODEL_NAME,
        len(
            cleaned_history
        ),
        cleaned_text[:160],
    )

    full_text = ""

    sentence_buffer = ""

    latin_buffer = ""

    token_events = 0

    sentence_events = 0


    def emit_clean_text(
        clean_text: str,
    ) -> Iterator[
        StreamEvent
    ]:
        """
        Feed already-sanitized Chinese text
        into the frontend token stream and
        sentence detector.
        """

        nonlocal full_text
        nonlocal sentence_buffer
        nonlocal token_events
        nonlocal sentence_events

        if not clean_text:
            return

        simplified = (
            TRADITIONAL_TO_SIMPLIFIED
            .convert(
                clean_text
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
                and
                not _contains_latin_letters(
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
                    logger.warning(
                        (
                            "OLLAMA_STREAM_"
                            "INVALID_LINE %r"
                        ),
                        raw_line[:200],
                    )

                    continue

                message = (
                    data.get(
                        "message"
                    )
                )

                if isinstance(
                    message,
                    dict,
                ):
                    raw_chunk = (
                        message.get(
                            "content",
                            "",
                        )
                    )

                    if (
                        isinstance(
                            raw_chunk,
                            str,
                        )
                        and raw_chunk
                    ):
                        output_buffer = ""

                        for character in raw_chunk:

                            # ---------------------------------
                            # Hold Latin letters so that a word
                            # split across Ollama tokens:
                            #
                            # "wan" + "na"
                            #
                            # becomes one "wanna" buffer.
                            # ---------------------------------

                            if (
                                character.isascii()
                                and
                                (
                                    character.isalpha()
                                    or character
                                    in {
                                        "'",
                                        "-",
                                        "’",
                                    }
                                )
                            ):
                                latin_buffer += (
                                    character
                                )

                                continue

                            # ---------------------------------
                            # Latin word ended.
                            # Convert before browser sees it.
                            # ---------------------------------

                            if latin_buffer:
                                replacement = (
                                    _flush_latin_buffer(
                                        latin_buffer
                                    )
                                )

                                latin_buffer = ""

                                output_buffer += (
                                    replacement
                                )

                            output_buffer += (
                                character
                            )

                        if output_buffer:
                            for event in (
                                emit_clean_text(
                                    output_buffer
                                )
                            ):
                                yield event

                if bool(
                    data.get(
                        "done",
                        False,
                    )
                ):
                    break

    except requests.ConnectionError as error:
        logger.exception(
            "OLLAMA_STREAM_CONNECTION_ERROR"
        )

        raise OllamaServiceError(
            (
                "Cannot connect to Ollama "
                "for live streaming."
            )
        ) from error

    except requests.Timeout as error:
        logger.exception(
            "OLLAMA_STREAM_TIMEOUT"
        )

        raise OllamaServiceError(
            (
                "Ollama live response "
                "timed out."
            )
        ) from error

    except requests.RequestException as error:
        logger.exception(
            "OLLAMA_STREAM_REQUEST_ERROR"
        )

        detail = (
            error.response.text
            if error.response
            is not None
            else str(error)
        )

        raise OllamaServiceError(
            (
                "Ollama streaming "
                "request failed: "
                f"{detail}"
            )
        ) from error


    # =====================================================
    # Flush English word at end of stream
    # =====================================================

    if latin_buffer:
        replacement = (
            _flush_latin_buffer(
                latin_buffer
            )
        )

        latin_buffer = ""

        if replacement:
            for event in (
                emit_clean_text(
                    replacement
                )
            ):
                yield event


    # =====================================================
    # FINAL VALIDATION
    # =====================================================

    final_text = (
        _clean_reply_text(
            full_text
        )
    )

    final_text = (
        _to_simplified(
            final_text
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
            (
                "Streaming reply "
                "contains no Chinese."
            )
        )

    # This should never happen because
    # Latin text was quarantined above.
    if _contains_latin_letters(
        final_text
    ):
        fragment = (
            _find_latin_fragment(
                final_text
            )
        )

        logger.error(
            (
                "STREAM_FINAL_LATIN_GUARD "
                "fragment=%r "
                "reply=%r"
            ),
            fragment,
            final_text[:300],
        )

        raise OllamaServiceError(
            (
                "Streaming reply failed "
                "Chinese-only validation."
            )
        )


    # =====================================================
    # LAST SENTENCE WITHOUT PUNCTUATION
    # =====================================================

    remaining_sentence = (
        sentence_buffer.strip()
    )

    if (
        remaining_sentence
        and
        _contains_chinese(
            remaining_sentence
        )
        and
        not _contains_latin_letters(
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


    # =====================================================
    # FINAL PINYIN
    # =====================================================

    final_pinyin = (
        _normalize_pinyin(
            final_text
        )
    )

    logger.info(
        (
            "OLLAMA_STREAM_DONE "
            "characters=%d "
            "token_events=%d "
            "sentence_events=%d "
            "hanzi=%r"
        ),
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