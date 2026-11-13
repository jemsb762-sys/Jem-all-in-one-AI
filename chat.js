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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is missing from Vercel Environment Variables." });

  try {
    const mode = typeof req.body?.mode === "string" ? req.body.mode : "chat";
    const instruction = MODES[mode] || MODES.chat;
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const safeMessages = messages.slice(-20).filter(m =>
      m && ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" && m.content.length <= 10000
    );
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 1800,
        messages: [{ role: "system", content: `You are Jem AI, an all-in-one general-purpose AI assistant.\n${instruction}\nBe honest about uncertainty. Do not claim to have performed actions you cannot perform. Use readable formatting.` }, ...safeMessages]
      })
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      const message = result?.error?.message || "The AI provider request failed.";
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: message });
    }
    const reply = result?.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: "The AI provider returned an empty response." });
    return res.status(200).json({ reply });
  } catch {
    return res.status(500).json({ error: "Unexpected server error. Please try again." });
  }
}