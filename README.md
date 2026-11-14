# Jem AI — All-in-One Assistant

A responsive installable AI chat app powered by the Groq API. Includes chat, writing, coding, translation, summaries, learning, business ideas, and creative tools.

## Deploy on Vercel

1. Upload the contents of this ZIP to a GitHub repository. Keep `api/chat.js` in the `api` folder.
2. Import the repository into [Vercel](https://vercel.com/). Set Framework Preset to **Other**.
3. In **Project → Settings → Environment Variables**, add:
   - Name: `GROQ_API_KEY`
   - Value: your secret key from [Groq Console](https://console.groq.com/keys)
   - Environments: Production (and Preview/Development if needed)
4. Save, then redeploy. Open the deployment URL and send a test message.

Optional: set `GROQ_MODEL` to a model available to your Groq account. The default is `llama-3.3-70b-versatile`.

## Run locally

Install the Vercel CLI, set `GROQ_API_KEY` in your local environment (or a private `.env` file), then run `vercel dev`.

## Security and notes

- Never put your real API key in `app.js`, `index.html`, or any browser-visible file. The key is read only by the serverless API.
- AI requests require internet access and an active Groq account/API quota.
- Chat history is held in the current browser session only; there are no user accounts or cloud-synced conversations.
- The PWA shell can be cached for offline loading, but AI replies require internet access.
