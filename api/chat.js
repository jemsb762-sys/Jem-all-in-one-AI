const DEFAULT_MODEL = "openai/gpt-oss-120b";

const MODES = {
  chat: "Be a helpful, accurate, versatile AI assistant. Answer the user's request directly.",
  write: "Help write, edit, rewrite, and proofread practical content. Match the requested tone.",
  code: "Act as an expert software engineer. Explain clearly and provide complete working code when requested.",
  translate: "Translate accurately and preserve meaning, tone, and formatting. Ask for the target language if unclear.",
  summarize: "Summarize clearly while preserving important facts, figures, and caveats. Never invent missing information.",
  learn: "Teach step by step with clear examples, adapting to the learner's level.",
  business: "Help with business planning, marketing, operations, budgeting, and practical ideas. State assumptions.",
  creative: "Be imaginative and original when helping with stories, scripts, names, concepts, and creative projects."
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Send a POST request." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server setup error: GROQ_API_KEY is not configured in Vercel Project Environment Variables. Add it for Production and redeploy."
    });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const mode = typeof body.mode === "string" ? body.mode : "chat";
  const instruction = MODES[mode] || MODES.chat;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const safeMessages = messages.slice(-20).filter((message) =>
    message &&
    ["user", "assistant"].includes(message.role) &&
    typeof message.content === "string" &&
    message.content.length > 0 &&
    message.content.length <= 10000
  );

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Please enter a message and try again." });
  }

  const model = (process.env.GROQ_MODEL || DEFAULT_MODEL).trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let upstream;
    try {
      upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          max_completion_tokens: 2048,
          messages: [
            {
              role: "system",
              content: `You are Jem AI, an all-in-one general-purpose AI assistant.\n${instruction}\nBe honest about uncertainty. Do not claim to have performed actions you cannot perform. Use readable formatting.`
            },
            ...safeMessages
          ]
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const upstreamMessage = result?.error?.message || result?.message;
      let message = upstreamMessage || `Groq returned HTTP ${upstream.status}.`;
      if (upstream.status === 401 || upstream.status === 403) {
        message = "Groq rejected the API key or the key does not have permission. Check GROQ_API_KEY in Vercel.";
      } else if (upstream.status === 404) {
        message = `Groq could not find model '${model}'. Check GROQ_MODEL or remove it to use the supported default model.`;
      } else if (upstream.status === 429) {
        message = "Groq rate limit or account quota reached. Wait a little and try again, or check your Groq Console limits.";
      }
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: message });
    }

    const reply = result?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: "Groq returned an empty response. Please try again." });
    }

    return res.status(200).json({ reply, model });
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ error: "The AI request took too long. Please try again." });
    }
    return res.status(500).json({ error: "Unexpected server error while contacting Groq. Please try again." });
  }
}
