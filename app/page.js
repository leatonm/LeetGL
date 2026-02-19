'use client';

import { useState } from 'react';
import { checkSyntax, checkDuplicates } from '../lib/analyze';

const styles = {
  main: {
    maxWidth: 680,
    margin: '0 auto',
    padding: 'clamp(20px, 5vw, 40px) 24px',
    minHeight: '100vh',
  },
  header: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: 4,
    background: 'linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: '#71717a',
    fontSize: 14,
    marginBottom: 12,
  },
  intro: {
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  tip: {
    color: '#52525b',
    fontSize: 13,
    marginBottom: 28,
  },
  tipCode: {
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 8px',
    borderRadius: 6,
    fontFamily: 'ui-monospace, monospace',
  },
  label: {
    display: 'block',
    marginBottom: 8,
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 15,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    color: '#fafafa',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputFocus: { borderColor: 'rgba(99, 102, 241, 0.5)', boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)' },
  btnRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 },
  btnPrimary: {
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.2s, transform 0.1s',
  },
  btnSecondary: {
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    color: '#e4e4e7',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  errorBanner: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    fontSize: 14,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: '#f4f4f5' },
  successMsg: { color: '#86efac', fontSize: 15 },
  errorBlock: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: 14,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  errorSummary: { color: '#fca5a5', fontWeight: 600, marginBottom: 10 },
  howToFix: {
    color: '#86efac',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    fontSize: 13,
    lineHeight: 1.5,
  },
  howToFixLabel: { color: '#71717a', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' },
  metaRow: { color: '#71717a', fontSize: 13, marginTop: 8 },
  contextLabel: { color: '#52525b', fontSize: 12, marginBottom: 6, marginTop: 12 },
  contextPre: {
    overflow: 'auto',
    padding: 12,
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0,
    fontSize: 13,
  },
  highlight: {
    background: 'rgba(239, 68, 68, 0.45)',
    color: '#fca5a5',
    padding: '0 2px',
    borderRadius: 3,
  },
  footer: { marginTop: 40, fontSize: 13, color: '#52525b' },
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

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
      const res = await fetch(url.trim(), { mode: 'cors', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      setLoading(false);
      return { text, data: null };
    } catch (e) {
      setLoading(false);
      let msg = e.message || 'Failed to fetch URL.';
      if (msg.includes('CORS') || msg.includes('Access to fetch')) {
        msg += ' Use the raw file URL (e.g. raw.githubusercontent.com/.../main/file.json for GitHub).';
      }
      setError(msg);
      return null;
    }
  }

  async function handleCheckErrors() {
    const out = await fetchJson();
    if (!out) return;
    const syntax = checkSyntax(out.text);
    setResult({
      mode: 'errors',
      syntax,
      note: 'The JSON was downloaded, analyzed, then discarded—nothing is saved or kept.',
    });
  }

  async function handleCheckDuplicates() {
    const out = await fetchJson();
    if (!out) return;
    const syntax = checkSyntax(out.text);
    if (!syntax.ok) {
      setResult({
        mode: 'duplicates',
        error: 'Cannot check duplicates: JSON has syntax errors. Fix them first using "Check for error".',
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

  function renderContext(err) {
    if (!err.context || err.contextStart == null || err.position == null) return err.context || '';
    const offset = err.position - err.contextStart;
    const before = err.context.slice(0, offset);
    const at = err.context[offset];
    const after = err.context.slice(offset + 1);
    const charDisplay = at === '\n' ? '↵' : at === '\r' ? '↵' : at || '?';
    return (
      <>
        {before}
        <span style={styles.highlight}>{charDisplay}</span>
        {after}
      </>
    );
  }

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>Lauren Shuda Check This?</h1>
        <p style={styles.subtitle}>JSON & URL checker · Made for Lauren Shuda</p>
        <p style={styles.intro}>
          Enter a URL to a JSON file. It is downloaded when you run a check, analyzed in your browser, then discarded—nothing is saved or kept.
        </p>
        <p style={styles.tip}>
          For GitHub: use the <strong>raw</strong> URL, e.g. <code style={styles.tipCode}>raw.githubusercontent.com/owner/repo/main/file.json</code> (not github.com/.../blob/main/...).
        </p>
      </header>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="url" style={styles.label}>JSON URL</label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com/data.json"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          disabled={loading}
          style={{ ...styles.input, ...(inputFocused ? styles.inputFocus : {}) }}
        />
      </div>

      <div style={styles.btnRow}>
        <button
          type="button"
          onClick={handleCheckErrors}
          disabled={loading}
          style={{ ...styles.btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Fetching…' : 'Check for error'}
        </button>
        <button
          type="button"
          onClick={handleCheckDuplicates}
          disabled={loading}
          style={{ ...styles.btnSecondary, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Fetching…' : 'Check for duplicated'}
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>{error}</div>
      )}

      {result && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {result.mode === 'errors' ? 'Syntax check' : 'Duplicate check'}
          </h2>

          {result.mode === 'errors' && result.syntax && (
            <>
              {result.syntax.ok ? (
                <p style={styles.successMsg}>✓ {result.syntax.message}</p>
              ) : (
                <div style={styles.errorBlock}>
                  <div style={styles.errorSummary}>{result.syntax.summary}</div>
                  <div style={styles.metaRow}>
                    {result.syntax.line != null && <>Line {result.syntax.line}</>}
                    {result.syntax.line != null && result.syntax.position != null && ' · '}
                    {result.syntax.position != null && <>Position {result.syntax.position}</>}
                    {result.syntax.charAt && <> · Character {result.syntax.charAt}</>}
                  </div>
                  {result.syntax.context && (
                    <>
                      <div style={styles.contextLabel}>Context (error highlighted)</div>
                      <pre style={styles.contextPre}>{renderContext(result.syntax)}</pre>
                    </>
                  )}
                  <div style={styles.howToFixLabel}>How to fix</div>
                  <div style={styles.howToFix}>{result.syntax.howToFix}</div>
                  <p style={{ marginTop: 14, fontSize: 13, color: '#71717a' }}>
                    Fix this error, then run the check again to find the next one (if any).
                  </p>
                </div>
              )}
            </>
          )}

          {result.mode === 'duplicates' && (
            <>
              {result.error && <p style={{ color: '#fca5a5', marginBottom: 12 }}>{result.error}</p>}
              {result.duplicates && !result.duplicates.ok && (
                <p style={{ color: '#fca5a5' }}>{result.duplicates.message}</p>
              )}
              {result.duplicates && result.duplicates.ok && (
                <>
                  <p style={{ color: '#e4e4e7', marginBottom: 12 }}>
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
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {result.duplicates.duplicates.map((d, i) => (
                        <li key={i} style={{ marginBottom: 6, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
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
            <p style={{ marginTop: 20, fontSize: 13, color: '#52525b' }}>{result.note}</p>
          )}
        </section>
      )}

      <footer style={styles.footer}>
        The JSON is downloaded only when you click a check, then discarded after the result—nothing is saved. Safe to use with private URLs if your network allows.
      </footer>
    </main>
  );
}
