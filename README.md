# DE-PDP-Tool

A personal development coach for GIBS employees and alumni. The user works through three steps, with an AI coach helping at each one:

1. **Your PDP** — strengths, areas to develop, skills gap, aspirations.
2. **Your Charter** — role, purpose, goals, with SMART measures drafted for them.
3. **My Next** — a personalised path of LinkedIn Learning style courses and reading.

Built on the GIBS `.gibs-interactive` standard: WCAG 2.1 AA, keyboard navigable, responsive to 320px. Nothing is stored server-side; the user downloads their plan to keep it.

## What is in here

```
de-pdp-tool/
  index.html                     the whole front end, one self-contained file
  netlify/functions/chat.js      serverless proxy that calls OpenAI and hides the key
  netlify.toml                   Netlify build and function config
  .env.example                   template for local development
  .gitignore                     keeps node_modules and your real key out of Git
  README.md                      this file
```

The front end never calls OpenAI directly. It calls `/.netlify/functions/chat`, which holds the key and makes the call. That is what keeps your API key safe on a public site.

## Before you start

You need an OpenAI API key. Create one at platform.openai.com under API keys. Keep it somewhere private; you will paste it into Netlify, not into any file here.

## Deploy to Netlify

### Quickest: drag and drop
1. Sign in at app.netlify.com and choose "Add new site" then "Deploy manually".
2. Drag the whole `de-pdp-tool` folder onto the upload area.
3. Once it deploys, go to Site configuration then Environment variables and add:
   - `OPENAI_API_KEY` = your key
   - `OPENAI_MODEL` = `gpt-5.4-mini` (optional; confirm the exact ID in your OpenAI dashboard)
4. Trigger a redeploy so the function picks up the variables. Done.

### Better for ongoing work: connect Git
See the Git section below, then in Netlify choose "Import from Git", pick the repo, and add the same environment variables. Every push then deploys automatically.

## Put it under Git and open in VS Code

```bash
cd de-pdp-tool
git init
git add .
git commit -m "DE-PDP-Tool: deploy-ready prototype"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/your-name/de-pdp-tool.git
git push -u origin main
```

Open the folder in VS Code. Because you have Claude Code installed, you can now hand it tasks directly in the editor, for example:

- "Make the coach reply auto-populate the PDP fields instead of only advising."
- "Carry the Step 1 answers into Step 2 so the user does not retype."
- "Add a paste-CV box and a LinkedIn-summary box, both client-side, feeding the coach."
- "Turn this into a workspace hub with stubbed tabs for a CV generator, a LinkedIn post builder and an interview prepper."

Claude Code edits the files in place and can run Git for you, so you iterate without copying and pasting from a chat window.

## Run it locally (optional)

```bash
npm install -g netlify-cli
cp .env.example .env        # then put your real key in .env
netlify dev                 # serves the site and the function together
```

`netlify dev` is the only way to test the AI locally, because the function needs to run. Opening `index.html` on its own will show the interface but the coach buttons will not respond.

## Cost and model notes

- `gpt-5.4-mini` is a low-cost workhorse, well suited to coaching text and the recommendation JSON.
- `gpt-5.4-nano` or `gpt-4.1-nano` are cheaper still if you want to stretch the wallet further.
- The model is set by the `OPENAI_MODEL` environment variable, so you can change it in Netlify without editing code.
- If a model ever returns empty replies, it is usually a reasoning model spending the token budget before answering. Raise `max_completion_tokens` in `chat.js` or pick a non-reasoning model.

## Switching to Anthropic later

Change only `netlify/functions/chat.js`: point the URL at the Anthropic messages endpoint, send `system` plus a `messages` array, read the reply from `content`, and swap the environment variable to your Anthropic key. The front end does not change at all.

## A note on data and POPIA

This prototype stores nothing. As you add features that hold personal data (saved plans, uploaded CVs, profiles), that becomes a deliberate step that should arrive together with a login and clear consent. Keep work on the user's side by default; let data cross to the server only when the user chooses to submit.
