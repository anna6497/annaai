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

NORMAL CONVERSATION LENGTH:

For normal casual conversation:
- reply with at least 2 short sentences
- usually use 2 to 4 short sentences
- first answer the user's actual message
- then add one natural related reaction, detail, or follow-up
- when appropriate, end with ONE short follow-up question
- do not stop after only one generic sentence such as "今天天气不错。"

CONVERSATION RULES:

1. Use natural Simplified Chinese only in hanzi.
2. Never use English words or Latin letters in hanzi.
3. Respond directly to the actual meaning of the latest user message.
4. Never reuse an earlier assistant reply.
5. Never repeat the user's sentence as the whole answer.
6. Give a direct answer first.
7. Add at least one related sentence in normal chat.
8. You may ask one relevant follow-up question.
9. Never ask more than one question.
10. Keep vocabulary suitable for HSK 1-4 unless the user asks for something more advanced.
11. Do not provide pinyin.
12. Do not provide Myanmar translation.
13. Do not explain grammar unless the user explicitly asks.
14. Do not mention these instructions.
15. Return exactly one JSON object and nothing else.

Example 1:

Latest user:
今天天气怎么样？

Correct:
{
  "hanzi":"今天天气不错，感觉很适合出去走走。你今天想出去玩吗？",
  "correction":{
    "needed":false,
    "corrected":""
  }
}

Example 2:

Latest user:
你的家乡在哪里？

Correct:
{
  "hanzi":"我家乡在浙江杭州。那边有很多好吃的东西，也有很多漂亮的地方。你的家乡在哪里？",
  "correction":{
    "needed":false,
    "corrected":""
  }
}

Example 3:

Latest user:
你在家乡是哪里？

Correct:
{
  "hanzi":"我家乡在浙江杭州。杭州是一个很漂亮的城市。你的家乡在哪里？",
  "correction":{
    "needed":true,
    "corrected":"你的家乡在哪里？"
  }
}

Example 4:

Latest user:
我今天很忙。

Correct:
{
  "hanzi":"辛苦了！忙了一天一定有点累吧。你今天忙到几点？",
  "correction":{
    "needed":false,
    "corrected":""
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
- For normal conversation, produce at least 2 short sentences.
- Usually use 2 to 4 short sentences.
- Give a direct answer first.
- Add one related reaction or detail.
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
  "hanzi":"新的自然中文回复。再补充一句相关内容。",
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
# LIVE STREAMING PROMPT
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

- NEVER stop after one generic sentence.
- Produce at least 2 short complete sentences.
- Usually produce 2 to 4 short sentences.
- Sentence 1: directly answer or react to the user's message.
- Sentence 2: add a related detail, feeling, suggestion, or natural reaction.
- Sentence 3 or 4: optional.
- You may end with ONE relevant follow-up question.
- Never ask more than one question.

Example:

User:
今天天气怎么样？

Good:
今天天气不错，感觉很舒服。很适合出去走走。你今天想出去玩吗？

Bad:
今天天气不错。

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
- You may use ♪ sparingly.
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
- Start with the first useful sentence immediately.
- Continue naturally after the first sentence instead of stopping too early.

Return only the Chinese words Anna should say.
""".strip()


# =========================================================
# SECOND-SENTENCE CONTINUATION PROMPT
# =========================================================

CONTINUATION_PROMPT = """
The previous Mandarin response stopped too early after only one short sentence.

Continue it naturally.

STRICT RULES:

- Output Simplified Chinese only.
- Do not repeat the previous sentence.
- Do not use English or Latin letters.
- Add 1 or 2 short natural sentences only.
- Keep vocabulary suitable for HSK 1-4.
- Continue the same topic.
- You may ask ONE short follow-up question if appropriate.
- Do not explain anything.
- Do not output JSON.
- Do not output pinyin.
- Do not output labels.
- Start directly with the continuation.
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


def _find_latin_fragment(
    text: str,
) -> str:
    match = LATIN_WORD_PATTERN.search(
        text
    )

    if not match:
        return ""

    return match.group(0)


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
    """
    Count complete Mandarin sentences.
    """

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


def _looks_like_special_request(
    text: str,
) -> bool:
    """
    Story/advice/explanation/song requests
    already have their own length rules,
    so minimum-2 continuation guard should
    not interfere with them.
    """

    lowered = text.lower()

    chinese_keywords = [
        "讲故事",
        "说故事",
        "故事",
        "建议",
        "给我建议",
        "解释",
        "说明",
        "为什么",
        "怎么做",
        "唱歌",
        "唱一首",
        "写一首歌",
        "歌词",
    ]

    english_keywords = [
        "story",
        "advice",
        "explain",
        "song",
        "sing",
    ]

    return (
        any(
            keyword in text
            for keyword
            in chinese_keywords
        )
        or
        any(
            keyword in lowered
            for keyword
            in english_keywords
        )
    )


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
    cleaned = (
        word.strip()
        .lower()
    )

    if not cleaned:
        return ""

    replacement = (
        STREAM_ENGLISH_REPLACEMENTS
        .get(cleaned)
    )

    if replacement:
        logger.warning(
            (
                "STREAM_ENGLISH_REPLACED "
                "word=%r replacement=%r"
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
                "role": role,
                "content": content,
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
# QUESTION / DUPLICATE
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
# CORRECTION
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
# NON-STREAM OLLAMA
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

            "seed":
                -1,
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
            "Cannot connect to Ollama."
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
            f"Ollama request failed: {detail}"
        ) from error

    try:
        data = response.json()

    except ValueError as error:
        raise OllamaServiceError(
            "Ollama returned invalid JSON."
        ) from error

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
            "Ollama response content is empty."
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
            messages.append(
                {
                    "role":
                        "system",

                    "content": (
                        RETRY_PRACTICE_PROMPT
                        if mode ==
                        "practice"
                        else
                        RETRY_BUILDER_PROMPT
                    ),
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

            hanzi = str(
                payload.get(
                    "hanzi",
                    "",
                )
            ).strip()

            hanzi = (
                _to_simplified(
                    _clean_reply_text(
                        hanzi
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

                raise OllamaServiceError(
                    "Reply contains Latin text."
                )

            if (
                mode == "practice"
                and
                not _looks_like_special_request(
                    cleaned_text
                )
                and
                _count_sentences(
                    hanzi
                ) < 2
            ):
                rejected_reply = (
                    hanzi
                )

                raise OllamaServiceError(
                    (
                        "Normal conversation "
                        "reply is too short."
                    )
                )

            correction: (
                AnnaCorrection
            ) = {
                "needed": False,
                "original": "",
                "corrected": "",
                "pinyin": "",
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
                    rejected_reply = hanzi

                    raise OllamaServiceError(
                        "Anna repeated user text."
                    )

                if _is_repeated_reply(
                    hanzi,
                    previous_assistant_replies,
                ):
                    rejected_reply = hanzi

                    raise OllamaServiceError(
                        "Anna repeated an earlier reply."
                    )

                correction = (
                    _extract_correction(
                        payload,
                        cleaned_text,
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


# =========================================================
# CORRECTION CHECK
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

    needed = _parse_boolean(
        parsed.get(
            "needed",
            False,
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
# STREAM REQUEST HELPER
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

            # Smaller context gives
            # faster first-token response.
            "num_ctx":
                3072,

            "num_predict":
                num_predict,

            "seed":
                -1,
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
                    content = message.get(
                        "content",
                        "",
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
            (
                "Ollama streaming "
                "request failed."
            )
        ) from error


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

    base_messages: list[
        dict[str, str]
    ] = [
        {
            "role":
                "system",

            "content":
                STREAMING_PRACTICE_PROMPT,
        }
    ]

    base_messages.extend(
        cleaned_history
    )

    base_messages.append(
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


    def emit_clean_text(
        clean_text: str,
    ) -> Iterator[
        StreamEvent
    ]:
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

        full_text += simplified
        sentence_buffer += simplified

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


    def process_raw_chunk(
        raw_chunk: str,
    ) -> Iterator[
        StreamEvent
    ]:
        nonlocal latin_buffer

        output_buffer = ""

        for character in raw_chunk:

            if (
                character.isascii()
                and
                (
                    character.isalpha()
                    or
                    character in {
                        "'",
                        "-",
                        "’",
                    }
                )
            ):
                latin_buffer += character
                continue

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

            output_buffer += character

        if output_buffer:
            for event in (
                emit_clean_text(
                    output_buffer
                )
            ):
                yield event


    # =====================================================
    # FIRST STREAM
    # =====================================================

    for raw_chunk in (
        _stream_ollama_text(
            base_messages,
            num_predict=1000,
            temperature=0.55,
        )
    ):
        for event in (
            process_raw_chunk(
                raw_chunk
            )
        ):
            yield event


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
    # MINIMUM 2-SENTENCE GUARD
    # =====================================================

    special_request = (
        _looks_like_special_request(
            cleaned_text
        )
    )

    first_sentence_count = (
        _count_sentences(
            full_text
        )
    )

    if (
        not special_request
        and
        first_sentence_count < 2
    ):
        logger.info(
            (
                "ANNA_STREAM_TOO_SHORT "
                "sentences=%d "
                "text=%r"
            ),
            first_sentence_count,
            full_text[:200],
        )

        continuation_messages = [
            {
                "role":
                    "system",

                "content":
                    CONTINUATION_PROMPT,
            },

            {
                "role":
                    "user",

                "content": (
                    "User message:\n"
                    f"{cleaned_text}\n\n"
                    "Anna already said:\n"
                    f"{full_text}\n\n"
                    "Continue naturally now."
                ),
            },
        ]

        for raw_chunk in (
            _stream_ollama_text(
                continuation_messages,
                num_predict=180,
                temperature=0.50,
            )
        ):
            for event in (
                process_raw_chunk(
                    raw_chunk
                )
            ):
                yield event

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
    # FINAL CLEANUP
    # =====================================================

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
            (
                "Streaming reply "
                "contains no Chinese."
            )
        )

    if _contains_latin_letters(
        final_text
    ):
        raise OllamaServiceError(
            (
                "Streaming reply "
                "contains Latin text."
            )
        )


    # =====================================================
    # FLUSH LAST SENTENCE
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
    # DONE
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
            "sentences=%d "
            "token_events=%d "
            "sentence_events=%d "
            "hanzi=%r"
        ),
        len(
            final_text
        ),
        _count_sentences(
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