import { useState } from 'react';
import { testPattern } from '@/api/client';
import type { PatternTestMatch } from '@/types';
import styles from './TestPanel.module.css';

export function TestPanel() {
  const [regex, setRegex] = useState('');
  const [sample, setSample] = useState('');
  const [resultLabel, setResultLabel] = useState('');
  const [matches, setMatches] = useState<PatternTestMatch[]>([]);
  const [hasError, setHasError] = useState(false);

  const run = async () => {
    if (!regex.trim() || !sample.trim()) {
      setResultLabel('Enter a regex and sample text');
      setHasError(false);
      setMatches([]);
      return;
    }
    setResultLabel('Testing…');
    setHasError(false);
    setMatches([]);
    try {
      const data = await testPattern([regex.trim()], sample.trim());
      setResultLabel(`${data.match_count} match${data.match_count !== 1 ? 'es' : ''}`);
      setMatches(data.matches);
    } catch (err) {
      setResultLabel('Error: ' + (err instanceof Error ? err.message : String(err)));
      setHasError(true);
    }
  };

  return (
    <div className={styles.section}>
      <span className={styles.title}>Test Regex Patterns</span>
      <div className={styles.area}>
        <div className={styles.field}>
          <label className={styles.label}>Regex to test</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder={`\\bPROJ-\\d{4}-[A-Z]{4}\\b`}
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sample text</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Contract PROJ-2024-ABCD was signed…"
            value={sample}
            onChange={(e) => setSample(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.runRow}>
        <button className={styles.testBtn} onClick={run}>
          Test
        </button>
        <span className={`${styles.resultLabel} ${hasError ? styles.error : ''}`}>
          {resultLabel}
        </span>
      </div>

      {matches.length > 0 && (
        <div className={styles.results}>
          {matches.map((m, i) => (
            <div key={i} className={styles.match}>
              <span>{m.match}</span>
              <span className={styles.pos}>
                pos {m.start}–{m.end}
              </span>
            </div>
          ))}
        </div>
      )}
      {resultLabel && !hasError && matches.length === 0 && resultLabel !== 'Testing…' && resultLabel !== 'Enter a regex and sample text' && (
        <div className={styles.noMatch}>No matches found</div>
      )}
    </div>
  );
}
