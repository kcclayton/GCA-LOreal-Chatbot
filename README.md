# L'Oréal Beauty Assistant 💄

A branded chatbot that helps customers navigate L'Oréal's product catalog and get tailored beauty recommendations, powered by the OpenAI API and deployed securely through a Cloudflare Worker.

## Features checklist

| Requirement | How it's met |
|---|---|
| **L'Oréal branding** | Logo in header (with elegant text-logotype fallback), black/white/gold palette, Didot-style display type, "Because You're Worth It" tagline |
| **Chatbot configuration** | `SYSTEM_PROMPT` in `script.js`; input captured on form submit, sent to OpenAI, reply rendered in the chat |
| **AI relevance** | System prompt strictly limits answers to L'Oréal products, routines, and beauty advice, with a polite refusal for anything else |
| **Secure deployment** | Browser → Cloudflare Worker → OpenAI. The API key lives only in the Worker's encrypted secret, never in front-end code |
| **Conversation history** | Full `messages` array (system + all turns) is sent on every request, so the bot remembers earlier details |
| **User question above response** | Black "You asked" strip above the chat window shows the latest question and resets on each new input |
| **Chat conversation UI** | User messages in black bubbles (right), assistant in white/gold bubbles (left), with a typing indicator |

## Project structure

```
loreal-chatbot/
├── index.html    # Page structure & branding
├── style.css     # L'Oréal visual identity + chat UI
├── script.js     # Chat logic, history, Worker fetch
├── worker.js     # Cloudflare Worker (deploy separately)
└── img/
    └── loreal-logo.png   # Add your provided logo asset here
```

## Setup

### 1. Deploy the Cloudflare Worker

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create Worker**.
2. Replace the default code with the contents of `worker.js` and deploy.
3. Go to the Worker's **Settings → Variables and Secrets** → add a secret:
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
4. Copy your Worker URL (e.g. `https://loreal-chatbot.yourname.workers.dev`).

### 2. Connect the front end

In `script.js`, set:

```js
const WORKER_URL = "https://loreal-chatbot.yourname.workers.dev";
```

### 3. Add the logo

Place the provided L'Oréal logo image at `img/loreal-logo.png`. If the file is missing, the page automatically falls back to a styled text logotype, so nothing breaks.

### 4. Run it

Open `index.html` locally (e.g. VS Code Live Server) or deploy with GitHub Pages.

## Security notes

- The OpenAI key is stored **only** as a Cloudflare Worker secret — it never appears in HTML, CSS, or JS shipped to the browser.
- For production, tighten CORS in `worker.js` by replacing `"*"` with your exact site origin.

## Try asking

- "What's a good routine for oily, acne-prone skin?"
- "I have dry, color-treated hair — which shampoo should I use?"
- "Recommend a red lipstick for fair skin." → then: "What about a matching blush?" (tests memory)
- "What's the capital of France?" → should politely refuse 🙂
