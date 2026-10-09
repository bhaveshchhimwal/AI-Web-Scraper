import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

function validateUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid full URL, for example https://example.com.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  const host = url.hostname.toLowerCase();

  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    /^127\.|^0\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host === '::1'
  ) {
    throw new Error('Private or local network URLs are not allowed.');
  }

  return url;
}

async function scrape(url) {
  const response = await axios.get(url.href, {
    timeout: 12000,
    maxContentLength: 2_000_000,
    headers: {
      'User-Agent': 'PageBrief/1.0',
    },
  });

  if (!String(response.headers['content-type']).includes('text/html')) {
    throw new Error('This URL did not return an HTML webpage.');
  }

  const $ = cheerio.load(response.data);

  $('script, style, noscript, svg, nav, footer, header, aside, form, iframe').remove();

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    url.hostname;

  const preferredContent = $('article, main, [role="main"]').first();

  const text = (preferredContent.length ? preferredContent : $('body'))
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length < 120) {
    throw new Error('Not enough readable text was found on that page.');
  }

  return {
    title: title.slice(0, 300),
    text: text.slice(0, 18000),
  };
}

app.post('/api/summarize', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Server setup is incomplete: add GROQ_API_KEY to server/.env.');
    }

    const url = validateUrl(req.body?.url);
    const page = await scrape(url);

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      temperature: 0.5,
      max_completion_tokens: 1200,
      reasoning_effort: 'low',
      include_reasoning: false,
      messages: [
        {
          role: 'user',
          content: `Create a useful, accurate summary of the webpage below. Write 180–260 words. Your response is incomplete unless it contains both required sections. Use this exact plain-text structure: first write "Overview:" on its own line, followed by a 3–4 sentence paragraph. Then write "Key takeaways:" on its own line, followed by exactly 4 short lines that each begin with "- ". Never end after the Overview section. Do not use Markdown syntax, asterisks, or bold formatting. Do not invent facts.

Page title: ${page.title}

Page text:
${page.text}`,
        },
      ],
    });

    res.json({
      title: page.title,
      url: url.href,
      wordCount: page.text.split(/\s+/).length,
      summary: completion.choices[0]?.message?.content || 'No summary was returned.',
    });
  } catch (error) {
    const status = error.status === 401 ? 500 : error.status || 400;

    console.error(error.message);

    res.status(status).json({
      error: error.message || 'Unable to summarize this page.',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`PageBrief API listening on http://localhost:${port}`);
});