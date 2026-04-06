import { useRef, useState } from 'react';
import type { CreatePatternPayload } from '@/api/client';
import styles from './AddPatternForm.module.css';

interface Props {
  activeUnit: string;
  onSubmit: (payload: CreatePatternPayload) => Promise<void>;
}

export function AddPatternForm({ activeUnit, onSubmit }: Props) {
  const [entityType, setEntityType] = useState('');
  const [label, setLabel] = useState('');
  const [desc, setDesc] = useState('');
  const [context, setContext] = useState('');
  const [score, setScore] = useState('0.80');
  const [regexRows, setRegexRows] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  const addRow = () => setRegexRows((r) => [...r, '']);
  const removeRow = (i: number) => setRegexRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, val: string) =>
    setRegexRows((r) => r.map((v, idx) => (idx === i ? val : v)));

  const clear = () => {
    setEntityType('');
    setLabel('');
    setDesc('');
    setContext('');
    setScore('0.80');
    setRegexRows(['']);
    setError('');
    firstRef.current?.focus();
  };

  const submit = async () => {
    const et = entityType.trim().toUpperCase();
    const lbl = label.trim();
    const patterns = regexRows.map((r) => r.trim()).filter(Boolean);

    if (!et || !/^[A-Z][A-Z0-9_]+$/.test(et)) {
      setError('Entity type must be uppercase letters, numbers, underscores (e.g. MY_CUSTOM_ID)');
      return;
    }
    if (!lbl) { setError('Label is required'); return; }
    if (!patterns.length) { setError('At least one regex pattern is required'); return; }

    setError('');
    setBusy(true);
    try {
      await onSubmit({
        entity_type: et,
        label: lbl,
        description: desc.trim(),
        unit: activeUnit,
        patterns,
        context: context.split(',').map((s) => s.trim()).filter(Boolean),
        score: parseFloat(score),
      });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pattern');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.section}>
      <span className={styles.title}>Add Custom Pattern</span>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>
            Entity Type <span className={styles.req}>*</span>
          </label>
          <input
            ref={firstRef}
            className={styles.input}
            placeholder="e.g. CONSTR_PROJECT_CODE"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase' }}
          />
          <div className={styles.hint}>Uppercase letters, numbers, underscores</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Label <span className={styles.req}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. Project Code"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.span2}`}>
          <label className={styles.label}>Description</label>
          <input
            className={styles.input}
            placeholder="What this identifier represents"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.span2}`}>
          <label className={styles.label}>
            Regex Patterns <span className={styles.req}>*</span>
          </label>
          <div>
            {regexRows.map((row, i) => (
              <div key={i} className={styles.regexRow}>
                <input
                  className={styles.input}
                  style={{ flex: 1 }}
                  placeholder={`e.g. \\bPROJ-\\d{4}-[A-Z0-9]{4,8}\\b`}
                  value={row}
                  onChange={(e) => updateRow(i, e.target.value)}
                />
                {i === 0 ? (
                  <button className={styles.btnSecondary} onClick={addRow}>+</button>
                ) : (
                  <button
                    className={styles.btnSecondary}
                    style={{ color: 'var(--danger)' }}
                    onClick={() => removeRow(i)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.hint}>One regex per row. Use \b for word boundaries.</div>
        </div>

        <div className={`${styles.field} ${styles.span2}`}>
          <label className={styles.label}>Context Keywords</label>
          <input
            className={styles.input}
            placeholder="project code, proj id, project number (comma separated)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <div className={styles.hint}>Words near the match that boost confidence</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confidence Score</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Add Pattern'}
        </button>
        <button className={styles.btnSecondary} onClick={clear}>
          Clear
        </button>
      </div>
    </div>
  );
}
