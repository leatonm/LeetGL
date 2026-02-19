'use client';

import { useState } from 'react';
import { checkSyntax, checkDuplicates } from '../lib/analyze';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function fetchJson() {
    if (!url.trim()) {
      setError('Please enter a JSON URL.');
      setResult(null);
      return null;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(url.trim(), { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      setLoading(false);
      return { text, data: null };
    } catch (e) {
      setLoading(false);
      setError(e.message || 'Failed to fetch URL.');
      return null;
    }
  }

  async function handleCheckErrors() {
    const out = await fetchJson();
    if (!out) return;
    const { text } = out;
    const syntax = checkSyntax(text);
    setResult({
      mode: 'errors',
      syntax,
      note: 'The JSON was downloaded, analyzed, then discarded—nothing is saved or kept.',
    });
  }

  async function handleCheckDuplicates() {
    const out = await fetchJson();
    if (!out) return;
    const { text } = out;
    const syntax = checkSyntax(text);
    if (!syntax.ok) {
      setResult({
        mode: 'duplicates',
        error: 'Cannot check duplicates: JSON has syntax errors.',
        syntax,
      });
      return;
    }
    const dupes = checkDuplicates(syntax.data);
    setResult({
      mode: 'duplicates',
      duplicates: dupes,
      note: 'The JSON was downloaded, analyzed, then discarded—nothing is saved or kept.',
    });
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>
        JSON URL Checker
      </h1>
      <p style={{ color: '#a1a1aa', marginBottom: 24 }}>
        Enter a URL to a JSON file. It is downloaded when you run a check, analyzed in your browser, then discarded—nothing is saved or kept.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="url" style={{ display: 'block', marginBottom: 8, color: '#a1a1aa' }}>
          JSON URL
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com/data.json"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 16,
            border: '1px solid #3f3f46',
            borderRadius: 8,
            background: '#18181b',
            color: '#e4e4e7',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          type="button"
          onClick={handleCheckErrors}
          disabled={loading}
          style={{
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            background: '#3b82f6',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Fetching…' : 'Check for error'}
        </button>
        <button
          type="button"
          onClick={handleCheckDuplicates}
          disabled={loading}
          style={{
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 600,
            border: '1px solid #3f3f46',
            borderRadius: 8,
            background: 'transparent',
            color: '#e4e4e7',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Fetching…' : 'Check for duplicated'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 14,
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <section
          style={{
            padding: 20,
            borderRadius: 12,
            background: '#18181b',
            border: '1px solid #27272a',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>
            {result.mode === 'errors' ? 'Syntax check' : 'Duplicate check'}
          </h2>

          {result.mode === 'errors' && result.syntax && (
            <>
              {result.syntax.ok ? (
                <p style={{ color: '#86efac' }}>✓ {result.syntax.message}</p>
              ) : (
                <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
                  <p style={{ color: '#fca5a5' }}>{result.syntax.message}</p>
                  {(result.syntax.position != null || result.syntax.line != null) && (
                    <p style={{ color: '#a1a1aa' }}>
                      {result.syntax.line != null && `Line: ${result.syntax.line}`}
                      {result.syntax.line != null && result.syntax.position != null && ' · '}
                      {result.syntax.position != null && `Position: ${result.syntax.position}`}
                    </p>
                  )}
                  {result.syntax.context && (
                    <pre
                      style={{
                        overflow: 'auto',
                        padding: 12,
                        background: '#0f0f12',
                        borderRadius: 6,
                        marginTop: 8,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {result.syntax.context}
                    </pre>
                  )}
                  {result.syntax.charAt && (
                    <p style={{ color: '#a1a1aa', marginTop: 8 }}>Char at error: {result.syntax.charAt}</p>
                  )}
                </div>
              )}
            </>
          )}

          {result.mode === 'duplicates' && (
            <>
              {result.error && <p style={{ color: '#fca5a5' }}>{result.error}</p>}
              {result.duplicates && !result.duplicates.ok && (
                <p style={{ color: '#fca5a5' }}>{result.duplicates.message}</p>
              )}
              {result.duplicates && result.duplicates.ok && (
                <>
                  <p style={{ color: '#e4e4e7' }}>
                    Total entries: <strong>{result.duplicates.total}</strong>
                    {result.duplicates.duplicateCount === 0 ? (
                      <span style={{ color: '#86efac', marginLeft: 8 }}>— No duplicates.</span>
                    ) : (
                      <span style={{ color: '#fca5a5', marginLeft: 8 }}>
                        — {result.duplicates.duplicateCount} duplicate(s) found.
                      </span>
                    )}
                  </p>
                  {result.duplicates.duplicates.length > 0 && (
                    <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                      {result.duplicates.duplicates.map((d, i) => (
                        <li key={i} style={{ marginBottom: 6, fontFamily: 'monospace', fontSize: 13 }}>
                          Index {d.index} duplicates index {d.firstSeenIndex} (key: {d.key})
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}

          {result.note && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#71717a' }}>{result.note}</p>
          )}
        </section>
      )}

      <footer style={{ marginTop: 48, fontSize: 13, color: '#71717a' }}>
        The JSON is downloaded only when you click a check, then discarded after the result—nothing is saved. Safe to use with private URLs if your network allows.
      </footer>
    </main>
  );
}
