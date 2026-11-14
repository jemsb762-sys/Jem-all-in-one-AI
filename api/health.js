export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  return res.status(200).json({
    ok: true,
    app: "Jem AI",
    apiKeyConfigured: Boolean(process.env.GROQ_API_KEY),
    model: (process.env.GROQ_MODEL || "openai/gpt-oss-120b").trim()
  });
}
