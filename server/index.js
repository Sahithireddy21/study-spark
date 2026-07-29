import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8787;
const AI_PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(distPath));

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  next(error);
});

function extractJson(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '';
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

function providerErrorMessage(statusCode, rawBody) {
  try {
    const providerPayload = JSON.parse(rawBody);
    const providerMessage = String(providerPayload.error?.message || providerPayload.error?.status || '');
    const lowerMessage = providerMessage.toLowerCase();
    if (lowerMessage.includes('incorrect api key') || lowerMessage.includes('invalid api key') || lowerMessage.includes('api key not valid')) {
      return 'The AI provider rejected the API key. Add a valid key to .env, then restart npm start.';
    }
    if (statusCode === 429) {
      return 'The AI provider rate-limited the request or the account has no available quota. Check usage limits, then retry.';
    }
    if (statusCode === 400 && lowerMessage.includes('free tier is not available')) {
      return 'Gemini free tier is not available in your region. Use another free provider such as Groq, or enable billing in Google AI Studio.';
    }
    if (statusCode === 404 || lowerMessage.includes('not found')) {
      return `Gemini could not find the configured model. Try GEMINI_MODEL=gemini-3.6-flash in .env, then restart npm start.`;
    }
    if (providerMessage) {
      return `Gemini error: ${providerMessage.slice(0, 180)}`;
    }
  } catch {
    // Fall through to the generic provider message.
  }
  return 'The AI provider returned an error. Please retry, or check your API key and model name.';
}

function studyPrompt(notes) {
  return `Create a study set as JSON with this exact shape:
{
  "title": "short title",
  "summary": "2 sentence summary",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "cards": [{"id":"c1","term":"...","answer":"...","hint":"..."}],
  "quiz": [{"id":"q1","question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}],
  "checklist": [{"id":"t1","text":"..."}]
}
Rules: Return only valid JSON. No markdown. 6 to 10 cards, 5 to 8 quiz questions, exactly 4 options each, answerIndex from 0 to 3, concise strings, no duplicate ids.

User notes/topic:
${notes}`;
}

async function generateWithOpenAI(notes, signal) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
    throw new Error('Missing OPENAI_API_KEY. Add it to .env, then restart npm start.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.45,
      messages: [
        {
          role: 'system',
          content: 'Return only valid JSON. No markdown. Create compact, accurate study material from the user input.'
        },
        {
          role: 'user',
          content: studyPrompt(notes)
        }
      ]
    })
  });

  const raw = await response.text();
  if (!response.ok) {
    const error = new Error(providerErrorMessage(response.status, raw));
    error.statusCode = response.status;
    throw error;
  }

  const payload = JSON.parse(raw);
  return payload.choices?.[0]?.message?.content;
}

async function generateWithGemini(notes, signal) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
    throw new Error('Missing GEMINI_API_KEY. Add your free Gemini key to .env, then restart npm start.');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: 'Return only valid JSON. No markdown. Create compact, accurate study material from the user input.' }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: studyPrompt(notes) }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 3000,
        responseMimeType: 'application/json'
      }
    })
  });

  const raw = await response.text();
  if (!response.ok) {
    const error = new Error(providerErrorMessage(response.status, raw));
    error.statusCode = response.status;
    throw error;
  }

  const payload = JSON.parse(raw);
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
}

app.post('/api/generate-study-set', async (req, res) => {
  const notes = String(req.body?.notes || '').trim();
  if (notes.length < 12) {
    return res.status(400).json({ error: 'Add a little more detail so the AI can build a useful study set.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const content = AI_PROVIDER === 'openai'
      ? await generateWithOpenAI(notes, controller.signal)
      : await generateWithGemini(notes, controller.signal);
    const parsed = JSON.parse(extractJson(content));
    res.json(parsed);
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The AI request took too long. Please retry with shorter notes.'
      : error.message || 'The AI returned output that could not be parsed. Please retry.';
    res.status(error.statusCode || 502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Study Spark running at http://127.0.0.1:${PORT}`);
});
