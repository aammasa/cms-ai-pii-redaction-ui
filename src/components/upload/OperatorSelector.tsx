import type { OperatorId } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './OperatorSelector.module.css';

export const OPERATORS: { id: OperatorId; label: string }[] = [
  { id: 'replace', label: '<TAG>' },
  { id: 'redact', label: 'remove' },
  { id: 'mask', label: '****' },
  { id: 'hash', label: 'hash' },
];

interface Props {
  /** When true, renders as compact mini-buttons (workspace sidebar) */
  compact?: boolean;
  /** Called after operator changes (e.g. to trigger reprocess) */
  onChange?: () => void;
}

export function OperatorSelector({ compact = false, onChange }: Props) {
  const { state, dispatch } = useApp();

  return (
    <div className={compact ? styles.panelCompact : styles.panel}>
      {!compact && (
        <div className={styles.header}>
          <span className={styles.title}>Redaction style</span>
        </div>
      )}
      <div className={styles.row}>
        {OPERATORS.map((op) => (
          <button
            key={op.id}
            className={`${compact ? styles.opBtnMini : styles.opBtn} ${state.operator === op.id ? styles.active : ''}`}
            onClick={() => {
              dispatch({ type: 'SET_OPERATOR', payload: op.id });
              onChange?.();
            }}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
