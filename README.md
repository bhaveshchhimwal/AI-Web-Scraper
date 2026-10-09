# PageBrief

PageBrief is a full-stack web application that converts public webpages into concise, AI-generated summaries. It accepts a URL, extracts readable HTML content on the server, and uses the Groq API to produce a structured summary for the user.

## Features

- Clean React interface for submitting a webpage URL
- Loading, success, and error states for a clear user experience
- Express API for server-side scraping and summarization
- Main-content extraction from standard HTML pages
- Groq-powered summaries using `openai/gpt-oss-20b`
- URL validation and blocking for localhost and private-network addresses
- Responsive layout for desktop and mobile screens

## Technology Stack

| Area                | Technology             |
| ------------------- | ---------------------- |
| Frontend            | React 19, Vite, CSS    |
| Backend             | Node.js, Express       |
| Scraping            | Axios, Cheerio         |
| AI provider         | Groq API               |
| Development tooling | Concurrently, Prettier |

## Project Structure

```text
.
├── client/
│   ├── src/
│   │   ├── main.jsx          # React application
│   │   └── styles.css        # Application styles
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── src/
│   │   └── index.js          # Express API and scraper
│   ├── .env.example          # Environment-variable template
│   └── package.json
├── package.json              # Root development scripts
└── README.md
```

## Prerequisites

- Node.js 20 or later
- A Groq API key. Create one in the [Groq Console](https://console.groq.com/keys).

## Local Setup

1. Clone the repository and open the project folder in VS Code.

   ```bash
   git clone <your-repository-url>
   cd pagebrief-ai-web-scraper
   ```

2. Install the root, backend, and frontend dependencies.

   ```bash
   npm install
   npm run install:all
   ```

3. Create the backend environment file.

   ```bash
   cp server/.env.example server/.env
   ```

4. Add your API key to `server/.env`.

   ```env
   GROQ_API_KEY=your_groq_api_key
   CLIENT_ORIGIN=http://localhost:5173
   PORT=3001
   ```

5. Start the frontend and backend from the project root.

   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.


## Available Scripts

| Command                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `npm run dev`                   | Starts the React frontend and Express backend together |
| `npm run install:all`           | Installs frontend and backend dependencies             |
| `npm run build --prefix client` | Creates a production frontend build                    |
| `npm start`                     | Starts the backend in production mode                  |

## API Reference

### `POST /api/summarize`

Scrapes a public HTML webpage and returns an AI-generated summary.

**Request body**

```json
{
  "url": "https://example.com/article"
}
```

**Successful response**

```json
{
  "title": "Example Article",
  "url": "https://example.com/article",
  "wordCount": 1240,
  "summary": "A concise summary of the page content."
}
```

**Error response**

```json
{
  "error": "A description of what prevented the summary from being created."
}
```
## Deployment on Render

Deploy the backend first as a Render **Web Service**:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Set these environment variables in the backend service:

```env
GROQ_API_KEY=your_groq_api_key
CLIENT_ORIGIN=https://your-pagebrief.onrender.com
```

After it deploys, copy the backend URL. Then create a Render **Static Site** for the frontend:

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Set this frontend environment variable before deploying, using your backend's real URL:

```env
VITE_API_URL=https://your-pagebrief-api.onrender.com
```

After the static site deploys, set the backend's `CLIENT_ORIGIN` to its exact public URL, then choose **Save, rebuild, and deploy**. Do not commit `.env` files or API keys.

## License

This project is provided for educational and assessment purposes.
