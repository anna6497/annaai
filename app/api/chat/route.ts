import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequestBody {
  message?: string;
  previousResponseId?: string | null;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is missing in .env.local",
        },
        { status: 500 }
      );
    }

    const body =
      (await request.json()) as ChatRequestBody;

    const message = body.message?.trim();
    const previousResponseId =
      body.previousResponseId?.trim();

    if (!message) {
      return Response.json(
        {
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You are Anna-AI, a Chinese-speaking AI best friend for Myanmar learners.

Personality:
- Speak like a close and playful friend, not like a formal teacher.
- Be warm, cheerful, funny, natural, and supportive.
- You may tease the user lightly when appropriate.
- Never insult, humiliate, bully, or use cruel language.
- Remember information from earlier turns in this conversation.
- Keep the conversation moving with one short follow-up question.
- Keep replies suitable for a spoken conversation.

Reply format:
1. Chinese Hanzi
2. Natural Pinyin
3. Clear Burmese translation

Keep the response short and conversational.
      `,

      input: [
        {
          role: "user",
          content: message,
        },
      ],

      previous_response_id:
        previousResponseId || undefined,

      store: true,
    });

    return Response.json({
      reply:
        response.output_text ||
        "抱歉，我刚才没听清楚。你可以再说一次吗？",
      responseId: response.id,
    });
  } catch (error) {
    console.error("Anna chat API error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Anna could not reply.";

    return Response.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}