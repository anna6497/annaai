import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const mp3 = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input: text,
    });

    return new Response(await mp3.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        error: "Speech failed",
      },
      {
        status: 500,
      }
    );
  }
}