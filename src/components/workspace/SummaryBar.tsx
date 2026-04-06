import { useState } from 'react';
import type { SummaryLength } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './SummaryBar.module.css';

const LENGTHS: SummaryLength[] = ['short', 'medium', 'detailed'];

export function SummaryBar() {
  const { state, dispatch, runSummarize } = useApp();
  const [busy, setBusy] = useState(false);

  const handleSummarize = async () => {
    setBusy(true);
    await runSummarize();
    setBusy(false);
  };

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Summary</span>
      <span className={`${styles.text} ${state.summary ? styles.hasText : ''}`}>
        {state.summary || '— run summarization on the redacted text'}
      </span>
      <div className={styles.btns}>
        {LENGTHS.map((len) => (
          <button
            key={len}
            className={`${styles.lenBtn} ${state.sumLen === len ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_SUM_LEN', payload: len })}
          >
            {len}
          </button>
        ))}
        <button
          className={styles.goBtn}
          onClick={handleSummarize}
          disabled={busy || !state.redactedText}
        >
          {busy ? '…' : 'Summarize'}
        </button>
      </div>
    </div>
  );
}
