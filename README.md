# Jem AI — All-in-One Assistant

English-language general-purpose AI web app / PWA.

## Features
- General-purpose AI chat
- Writing and email assistance
- Coding and debugging help
- Translation
- Text summarization
- Study and learning help
- Business planning and ideas
- Creative brainstorming
- Responsive iPhone/mobile layout
- Copy response, new chat, and in-session conversation context
- Vercel serverless API; API key is server-side only

## Deploy to Vercel
1. Upload the contents of this ZIP to the root of a GitHub repository. Keep `api/chat.js` inside the `api` folder.
2. Import the repository into Vercel.
3. Set Framework Preset to **Other**. Leave Build Command and Output Directory empty (or use `.` as output directory if Vercel requires it).
4. In Vercel Project → Settings → Environment Variables, add `OPENAI_API_KEY` with your OpenAI API key. Select Production and Preview as needed.
5. Save and redeploy. Open the deployment URL and try a prompt.

## Important
- The AI requires an active API key and available provider usage/billing quota. Hosting on Vercel does not make AI API usage free.
- Never paste your secret API key into `index.html`, `app.js`, or any public file.
- This starter does not include user accounts, cloud-synced chat history, payments/Telebirr, image generation, voice, or file uploads. Those require additional integrations and backend work.
- The PWA shell can load offline, but AI replies require an internet connection.
