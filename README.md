# PageBrief — AI Web Scraper

Paste a public webpage URL to extract its readable content and generate a concise AI summary through the free Groq API.

## Setup in VS Code

1. Open this `pagebrief-ai-web-scraper` folder in VS Code.
2. In the integrated terminal run:

   ```bash
   npm install
   npm run install:all
   cp server/.env.example server/.env
   ```

3. Open `server/.env` and add a free API key from https://console.groq.com/keys:

   ```env
   GROQ_API_KEY=your_key_here
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:5173`.

## Project structure

```text
pagebrief-ai-web-scraper/
├── client/                 # React + Vite user interface
│   └── src/
├── server/                 # Express scraper and Groq API integration
│   ├── src/index.js
│   └── .env                # Create locally; never commit it
├── package.json            # Root scripts to run both apps
└── README.md
```

## API

`POST /api/summarize` with `{ "url": "https://example.com" }` returns the title, source URL, scraped word count, and summary.

## Deployment

Set `GROQ_API_KEY` as an environment variable on your Node host (Render, Railway, Fly.io, etc.). Build the frontend using `npm run build --prefix client`; deploy it separately or configure your host to serve `client/dist`. Set `CLIENT_ORIGIN` to the deployed frontend URL when the two are hosted separately.
# AI-Web-Scraper
