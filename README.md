# Jem AI — All-in-One Assistant

A responsive, installable AI chat app powered by Groq. It includes general chat, writing, coding, translation, summaries, learning, business ideas, and creative tools.

## Correct Vercel deployment layout

This project intentionally keeps the serverless API in the root `api/` directory and places all browser files in `public/`:

- `public/index.html` — app entry point
- `public/app.js` and `public/style.css` — browser app
- `public/icons/` — app icons
- `api/chat.js` — private server-side Groq request
- `api/health.js` — safe deployment/API configuration check
- `vercel.json` — explicitly sets `public` as the static output directory

Do not move `api/` inside `public/`.

## Deploy on Vercel

1. Upload **the contents** of this ZIP to the root of the GitHub repository. The repository root should show `api`, `public`, `package.json`, and `vercel.json`.
2. In Vercel, set Framework Preset to **Other** and Root Directory to `./`.
3. In Build & Development Settings, leave Build Command and Install Command disabled/default. Set Output Directory to `public` (or turn its dashboard override off so `vercel.json` controls it). Do not set it to `dist`.
4. In Project Settings → Environment Variables, add `GROQ_API_KEY` with your private key. Select Production (and Preview too if you test preview deployments).
5. Save and redeploy the latest commit.
6. Test `https://YOUR-DOMAIN.vercel.app/` for the app and `https://YOUR-DOMAIN.vercel.app/api/health` for deployment status.

The health endpoint never returns the API key. It reports only whether the key is configured and which model name is selected.

## Groq model

The default is `openai/gpt-oss-120b`, listed by Groq as a production model. You normally do not need to create a `GROQ_MODEL` variable. If you set it, use an active model ID available to your Groq account.

## Security

- Never put your real API key in `public/`, `app.js`, or `index.html`.
- The key is read only by the server-side function from `process.env.GROQ_API_KEY`.
- Do not share screenshots that reveal the key.
- AI requests need an internet connection and an active Groq account/quota.

## Local development

Install the Vercel CLI, set `GROQ_API_KEY` in your private environment, and run `vercel dev` from the project root.
