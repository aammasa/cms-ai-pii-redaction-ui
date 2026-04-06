import type { Pattern } from '@/types';
import { Icon } from '@/components/ui/Icon';
import styles from './PatternTable.module.css';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface Props {
  patterns: Pattern[];
  unitLabel: string;
  onDelete: (id: string) => void;
}

export function PatternTable({ patterns, unitLabel, onDelete }: Props) {
  const custom = patterns.filter((p) => !p.builtin);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{unitLabel} Patterns</span>
        <span className={styles.count}>
          {patterns.length} total · {custom.length} custom
        </span>
      </div>

      {patterns.length === 0 ? (
        <div className={styles.empty}>No patterns for this unit yet.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Entity Type</th>
              <th>Label</th>
              <th>Regex(es)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {patterns.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className={styles.entityBadge}>{p.entity_type}</span>
                  {p.builtin && (
                    <span className={styles.builtinBadge} style={{ marginTop: 4, display: 'block' }}>
                      built-in
                    </span>
                  )}
                </td>
                <td className={styles.labelCell}>{escapeHtml(p.label)}</td>
                <td>
                  {p.patterns.map((r, i) => (
                    <div key={i} className={styles.regex}>
                      {r}
                    </div>
                  ))}
                </td>
                <td>
                  {!p.builtin && (
                    <button
                      className={styles.deleteBtn}
                      title="Delete pattern"
                      onClick={() => onDelete(p.id)}
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
