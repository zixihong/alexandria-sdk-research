## Alexandria Research Assistant

AI-powered in-page research assistant for the browser. It highlights difficult words with definitions, annotates selected text in context, and includes a minimal analytics tracker and a chatbot.

### Features
- **Annotate selection**: Press Shift+A to get context-aware explanations for highlighted text.
- **Difficult-word scanner**: One-click scan button underlines complex words with click-to-see definitions.
- **Chatbot widget**: Toggle a lightweight chatbot to ask questions about the page.
- **Analytics hooks**: Tracks interactions (clicks, keyboard events) and can beacon to a backend.
- **Configurable max_tokens**: Control response size/cost via configuration.

### Tech stack
- **TypeScript** + **Webpack**
- **LlamaAI** client (`llamaai`)
- `.env` for `API_KEY`

### Getting started
1) Install
```bash
npm install
```

2) Configure environment
Create a `.env` at the repo root:
```bash
API_KEY=your_llama_api_key
```

3) Build
```bash
npm run build
```
This outputs `dist/index.js` (and `dist/index.d.ts`).

### Usage

- As a module (bundler)
```ts
import AlexandriaResearch from 'alexandria-research';

new AlexandriaResearch({
  maxTokens: 750 // optional, default ~500
});
```

- As a bundled script (after running build)
Include `dist/index.js` in your page/app bundle and instantiate:
```js
new AlexandriaResearch({ maxTokens: 750 });
```

After initialization:
- Press Shift+A with text selected to open the annotation popup.
- Click “Scan for Difficult Words” (fixed top-right) to underline complex terms.
- Use the chatbot button to open a small panel, type, and press Enter.

### Configuration
- **maxTokens**: number (optional). Caps LLM response length, balancing cost/latency.
- **aiApiKey**: string (optional here; the code loads `API_KEY` from `.env` by default via `dotenv`).

Example:
```ts
new AlexandriaResearch({
  maxTokens: 500
});
```

### Analytics
- Tracks clicks and key events; sends via `navigator.sendBeacon` to the endpoint you pass if you wire up analytics directly (see `research-assistant/analytics.ts`).
- Extend or disable as needed.

### Project structure
- `research-assistant/index.ts`: Main entry; UI glue (keybinds, scan button, DOM integration).
- `research-assistant/ai-service.ts`: Llama request shaping and token-limit handling.
- `research-assistant/analytics.ts`: Minimal client-side analytics and chatbot UI.
- `research-assistant/types/*.d.ts`: Type definitions (no runtime code).
- `webpack.config.js`, `tsconfig.json`: Build tooling.

### Troubleshooting
- **Missing API key**: Ensure `.env` has `API_KEY` and rebuild.
- **Large/slow responses**: Lower `maxTokens`.
- **DOM conflicts**: The assistant injects elements with high z-index; adjust styles if needed.

### Roadmap ideas
- Streaming UI for generation
- Model selection and per-feature token budgets
- Improved popup styling and accessibility
- Pluggable analytics transports
