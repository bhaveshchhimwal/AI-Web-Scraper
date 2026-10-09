import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
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
        <div className="brand">✦ PAGEBRIEF</div>
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
              onChange={(e) => setUrl(e.target.value)}
            />
            <button disabled={loading}>{loading ? 'Reading…' : 'Summarize →'}</button>
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
              {result.summary.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
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
