# Study Spark

Study Spark is a React study assistant that turns free-form notes into structured, interactive study tools. It is not a chatbot: the backend asks the model for JSON, the frontend validates the shape, and only then renders flashcards, a quiz, and a drill checklist.

## Features

- Free-form notes/topic input
- Real LLM call through an Express backend so the API key is never shipped to the browser
- Structured JSON parsing and frontend schema validation
- Loading, empty, error, retry, malformed-output, timeout, and stale-response handling
- Flip-through flashcards with hints
- Quiz mode with scoring, explanations, reset, and retest-wrong flow
- Checklist drill plan
- Save and reload session with localStorage
- Responsive mobile layout and dark/light mode

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
copy .env.example .env
```

3. Add your free Gemini API key to `.env`:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

4. Run the app:

```bash
npm start
```

Open `http://127.0.0.1:8787`.

## Free Tier Provider

The default provider is Gemini. Create a free Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey), paste it into `.env`, then restart the server.

Gemini's official pricing page lists a Free tier for developers and small projects getting started with the Gemini API. The Gemini REST API docs show requests authenticated with the `x-goog-api-key` header, which is what this backend uses.

OpenAI is still supported as an optional fallback:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Usage

Paste notes, a syllabus topic, or a rough paragraph into the text area and click **Generate set**. The app sends the text to the backend, receives structured JSON, validates it, then renders the study tools. If the model returns invalid JSON, the wrong shape, an empty response, or times out, the app shows a recoverable error instead of crashing.

If you do not have an API key available while reviewing the UI, click **Try demo**.

## AI Usage Note

I used AI assistance to plan the implementation, generate parts of the React/CSS structure, and review the assignment requirements. I kept the code understandable and intentionally small enough to explain in an interview: the main behavior lives in `src/main.jsx`, styling in `src/styles.css`, and the model proxy in `server/index.js`.

## Known Limitations

- The app defaults to Gemini and also supports OpenAI through the included backend route.
- It does not stream partial output.
- Saved sessions are browser-local only.
- The validation is practical and defensive, but not a full TypeScript/Zod schema.

## Time Spent

Approximately 6 hours including assignment review, UI design, implementation, validation logic, and local verification.
