# Jem AI Mobile App

A mobile-first installable web app (PWA) with an iPhone app-style interface.

## Included
- Mobile-first app layout with Home, Chat, Settings bottom navigation
- Jem AI branding and app icons
- General AI, writing, coding, translation, learning, business and creative modes
- Chat session context, copy answer, new chat
- PWA manifest and service worker
- Vercel API endpoint for OpenAI (secret key stays server-side)

## Important: GitHub Pages vs Vercel
GitHub Pages hosts static files only. It cannot execute the `/api/chat.js` backend, so the screen may load but AI replies will not work from GitHub Pages by itself.
For the complete working app, import this GitHub repository into Vercel and deploy it there:
1. Framework preset: Other
2. Build command: leave empty
3. Output directory: leave empty
4. Add `OPENAI_API_KEY` in Vercel → Project → Settings → Environment Variables
5. Redeploy.

## Install on iPhone
Open the deployed site in Safari → Share → Add to Home Screen → Add. It will open in a standalone app-style window. This is a PWA, not a native App Store app.

## Current limitations
This starter does not yet include accounts, cloud-synced chat history, payments, voice conversations, file attachments or image generation. Those need separate integrations. AI use requires an API key and available provider quota/billing.
