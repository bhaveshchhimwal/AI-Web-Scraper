import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function SummaryContent({ summary }) {
  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const elements = [];
  let bulletItems = [];

  const addBullets = () => {
    if (bulletItems.length) {
      elements.push(
        <ul key={`list-${elements.length}`}>
          {bulletItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

      bulletItems = [];
    }
  };

  lines.forEach((line) => {
    if (/^(overview|key takeaways):$/i.test(line)) {
      addBullets();
      elements.push(<h3 key={`heading-${elements.length}`}>{line.replace(':', '')}</h3>);
    } else if (line.startsWith('- ')) {
      bulletItems.push(line.slice(2));
    } else {
      addBullets();
      elements.push(<p key={`paragraph-${elements.length}`}>{line.replace(/\*\*/g, '')}</p>);
    }
  });

  addBullets();

  return elements;
}

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="brand">PAGEBRIEF</div>

        <h1>
          Turn any page into
          <br />
          <em>a clear brief.</em>
        </h1>

        <p>Paste a public webpage. We’ll extract the essentials and let AI do the reading.</p>
      </section>

      <section className="panel">
        <form onSubmit={submit}>
          <label htmlFor="url">Webpage URL</label>

          <div className="input-row">
            <input
              id="url"
              type="url"
              required
              placeholder="https://example.com/article"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />

            <button disabled={loading}>
              {loading ? 'Reading…' : 'Summarize →'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading">
            <span /> Fetching page content and crafting your summary…
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {result && (
          <article>
            <div className="meta">
              <span>AI SUMMARY</span>
              <span>{result.wordCount.toLocaleString()} words read</span>
            </div>

            <h2>{result.title}</h2>

            <a href={result.url} target="_blank" rel="noreferrer">
              {result.url}
            </a>

            <div className="summary">
              <SummaryContent summary={result.summary} />
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);