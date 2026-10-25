# Spicy

Describe a voice agent, talk to it, refine it, ship it.

## Run
1. `npm install`
2. Create `.env.local` (see below)
3. `npm run dev` and open http://localhost:3000

## Demo mode (no keys)

DEMO_MODE=true

UI works end to end. Live calls, real knowledge uploads and real call data need keys.

## Real mode

DEMO_MODE=false
ELEVENLABS_API_KEY=...
ANTHROPIC_API_KEY=... # or OPENAI_API_KEY

Restart `npm run dev` after editing `.env.local`.

## What works
Landing, templates, build flow, workspace with chat refine, versions, Config, Knowledge (local), Tests (keyword checks), Deploy (link, QR, widget snippet), Insights (sample data).

## Not built yet
Database, auth, real knowledge base sync, LLM-based test simulation, phone automation.