import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnnaMode =
  | "friend"
  | "translation"
  | "tutor";

interface ChatRequestBody {
  message?: unknown;
  previousResponseId?: unknown;
  inputLanguage?: unknown;
}

const BURMESE_PATTERN =
  /[\u1000-\u109f\uaa60-\uaa7f]/u;

const TUTOR_PATTERNS: RegExp[] = [
  /ရှင်းပြ/u,
  /အသေးစိတ်/u,
  /ဥပမာ/u,
  /ဘယ်လိုသုံး/u,
  /အသုံးပြုပုံ/u,
  /သင်ပေး/u,
  /ပြင်ပေး/u,
  /စစ်ပေး/u,
  /ဘာကွာ/u,
  /ဘာကြောင့်/u,
  /grammar/i,
  /explain/i,
  /example/i,
  /examples/i,
  /how to use/i,
  /difference/i,
  /compare/i,
  /怎么用/u,
  /为什么/u,
  /解释/u,
  /例子/u,
  /举例/u,
  /区别/u,
  /语法/u,
];

function detectMode(
  message: string,
  inputLanguage: string
): AnnaMode {
  const tutorRequested =
    TUTOR_PATTERNS.some((pattern) =>
      pattern.test(message)
    );

  if (tutorRequested) {
    return "tutor";
  }

  if (
    inputLanguage === "my-MM" ||
    BURMESE_PATTERN.test(message)
  ) {
    return "translation";
  }

  return "friend";
}

const BASE_INSTRUCTIONS = `
You are Anna, a friendly Chinese-speaking friend and Chinese tutor for Burmese learners.

General rules:
- Use natural everyday Mandarin.
- Use complete pinyin with tone marks.
- Give clear and natural Burmese meanings.
- Never say “作为AI”.
- Do not sound like customer service, a robot or a formal textbook.
- The first line beginning with 中文：will be read aloud.
- Do not place Burmese or pinyin on the 中文：line.
`.trim();

const FRIEND_INSTRUCTIONS = `
MODE: FRIEND CONVERSATION

The user is speaking Chinese and wants a natural conversation.

Reply like a warm Chinese friend:
- React naturally to what the user said.
- Use 2 to 4 short spoken Chinese sentences.
- Ask one short follow-up question when suitable.
- Do not explain grammar unless the user asks.
- Do not always answer with only one sentence.

Return exactly:

中文：<complete natural Chinese reply including the question>
拼音：<complete pinyin for everything on the 中文 line>
မြန်မာ：<complete Burmese translation>
`.trim();

const TRANSLATION_INSTRUCTIONS = `
MODE: BURMESE TO CHINESE SENTENCE BUILDER

The user spoke Burmese because they do not know how to form the Chinese sentence.

IMPORTANT:
- Do not reply to the Burmese message as a conversation.
- Do not answer the user's question or continue chatting.
- Translate the Burmese meaning into natural spoken Mandarin.
- Begin by confirming what the user wants to say.
- Preserve the user's original intended meaning.
- Give an easy version first.
- Give one more natural native-style version when useful.
- Briefly explain the sentence order in Burmese.
- Do not ask a follow-up conversation question.

Return in this format:

中文：你想说的是：“<best simple Chinese translation>”，对吗？
拼音：<complete pinyin for the entire 中文 line>
မြန်မာ：နင်ပြောချင်တာ “<original Burmese meaning>” ဒီလိုလား။

အဓိကစာကြောင်း：
<best simple Chinese sentence>

拼音：
<complete pinyin>

မြန်မာ：
<complete Burmese meaning>

ပိုသဘာဝကျတဲ့ပြောပုံ：
<more conversational Chinese version>

拼音：
<complete pinyin>

စာကြောင်းဖွဲ့ပုံ：
<brief Burmese explanation of word order and key vocabulary>
`.trim();

const TUTOR_INSTRUCTIONS = `
MODE: DETAILED CHINESE TUTOR

The user asked for explanation, usage, grammar, correction or examples.

Requirements:
- Explain clearly in Burmese.
- Do not answer with only one sentence.
- Give at least 4 examples.
- Every example must include Chinese, complete pinyin and Burmese meaning.
- Mention a common mistake when useful.
- End with one short practice exercise.

Return in this structure:

中文：好呀，我来给你详细解释一下！
拼音：Hǎo ya, wǒ lái gěi nǐ xiángxì jiěshì yíxià!
မြန်မာ：ကောင်းပြီ၊ အသေးစိတ်ရှင်းပြပေးမယ်နော်။

ရှင်းလင်းချက်：
<detailed Burmese explanation>

ဖွဲ့စည်းပုံ：
<Chinese formula or pattern>

ဥပမာများ：

1. 中文：...
   拼音：...
   မြန်မာ：...

2. 中文：...
   拼音：...
   မြန်မာ：...

3. 中文：...
   拼音：...
   မြန်မာ：...

4. 中文：...
   拼音：...
   မြန်မာ：...

မကြာခဏမှားတတ်တာ：
<common mistake when relevant>

လေ့ကျင့်ရန်：
<one short practice>
`.trim();

function buildInstructions(
  mode: AnnaMode
) {
  if (mode === "translation") {
    return `${BASE_INSTRUCTIONS}\n\n${TRANSLATION_INSTRUCTIONS}`;
  }

  if (mode === "tutor") {
    return `${BASE_INSTRUCTIONS}\n\n${TUTOR_INSTRUCTIONS}`;
  }

  return `${BASE_INSTRUCTIONS}\n\n${FRIEND_INSTRUCTIONS}`;
}

function getMaxOutputTokens(
  mode: AnnaMode
) {
  if (mode === "tutor") {
    return 1200;
  }

  if (mode === "translation") {
    return 700;
  }

  return 350;
}

function getErrorMessage(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return `OpenAI error (${error.status ?? "unknown"}): ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Anna က အခုမဖြေနိုင်သေးပါ။ ပြန်စမ်းကြည့်ပါ။";
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY ကို .env.local သို့မဟုတ် Vercel Environment Variables မှာ မတွေ့ပါ။",
        },
        {
          status: 500,
        }
      );
    }

    let body: ChatRequestBody;

    try {
      body =
        (await request.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Request body format မှားနေပါတယ်။",
        },
        {
          status: 400,
        }
      );
    }

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const inputLanguage =
      typeof body.inputLanguage ===
      "string"
        ? body.inputLanguage
        : "";

    const previousResponseId =
      typeof body.previousResponseId ===
        "string" &&
      body.previousResponseId.trim()
        ? body.previousResponseId.trim()
        : undefined;

    if (!message) {
      return NextResponse.json(
        {
          error:
            "ပြောထားတဲ့စာ မရှိပါ။",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Message က ရှည်လွန်းပါတယ်။ စာလုံး 2000 အောက်ထားပါ။",
        },
        {
          status: 400,
        }
      );
    }

    const mode = detectMode(
      message,
      inputLanguage
    );

    const openai = new OpenAI({
      apiKey,
    });

    const requestOptions = {
      model: "gpt-4.1-mini",
      instructions:
        buildInstructions(mode),
      input: message,
      max_output_tokens:
        getMaxOutputTokens(mode),
      store: true,
    } as const;

    let response;

    try {
      response =
        await openai.responses.create({
          ...requestOptions,

          /*
           * Translation mode မှာ previous
           * conversation က meaning ကို
           * မရောစေဖို့ history မချိတ်ပါ။
           */
          previous_response_id:
            mode === "friend"
              ? previousResponseId
              : undefined,
        });
    } catch (firstError) {
      /*
       * Previous response ID expired,
       * invalid or unavailable ဖြစ်ရင်
       * history မပါဘဲ တစ်ကြိမ်ပြန်စမ်းမယ်။
       */
      if (
        mode === "friend" &&
        previousResponseId
      ) {
        console.warn(
          "Retrying without previousResponseId:",
          getErrorMessage(firstError)
        );

        response =
          await openai.responses.create({
            ...requestOptions,
          });
      } else {
        throw firstError;
      }
    }

    const reply =
      response.output_text?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "OpenAI က စာသားအဖြေမပေးပါ။ နောက်တစ်ကြိမ် ပြန်စမ်းပါ။",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        reply,
        responseId: response.id,
        mode,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const message =
      getErrorMessage(error);

    console.error(
      "Chat API error:",
      error
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          error instanceof OpenAI.APIError &&
          typeof error.status === "number"
            ? error.status
            : 500,
      }
    );
  }
}