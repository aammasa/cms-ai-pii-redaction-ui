import { useApp } from '@/store/AppContext';
import { OperatorSelector } from '@/components/upload/OperatorSelector';
import styles from './Sidebar.module.css';

interface Props {
  onReprocess: () => void;
}

export function Sidebar({ onReprocess }: Props) {
  const { state, dispatch } = useApp();
  const { file, entityCounts, allEntities, entitiesFound, activeEntities, allLanguages, detectedLanguage } = state;

  const ext = file?.name.split('.').pop()?.toUpperCase() ?? 'TXT';
  const langLabel =
    allLanguages.find((l) => l.code === detectedLanguage)?.label ?? detectedLanguage ?? '';
  const detectedTypes = new Set(entitiesFound.map((e) => e.type));

  return (
    <aside className={styles.sidebar}>
      {/* File info */}
      <div className={styles.sidebarTop}>
        <h3 className={styles.sectionHeading}>File</h3>
        <div className={styles.fileInfo}>
          <div className={styles.fileIcon}>{ext}</div>
          <div>
            <div className={styles.fileName}>{file?.name ?? '—'}</div>
            <div className={styles.fileType}>
              {state.originalText.length.toLocaleString()} chars
            </div>
            {langLabel && (
              <div className={styles.fileLang}>{langLabel} detected</div>
            )}
          </div>
        </div>
      </div>

      {/* Detected PII */}
      <div className={styles.section}>
        <h4 className={styles.sectionLabel}>Detected PII</h4>
        <div className={styles.entityList}>
          {Object.keys(entityCounts).length === 0 ? (
            <div className={styles.noResults}>No PII detected</div>
          ) : (
            Object.entries(entityCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const label = allEntities.find((e) => e.id === type)?.label ?? type;
                return (
                  <div key={type} className={styles.entityRow}>
                    <span className={styles.entityName}>{label}</span>
                    <span className={styles.entityCount}>{count}</span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div>
          <div className={styles.ctrlLabel}>Redaction style</div>
          <OperatorSelector compact onChange={onReprocess} />
        </div>
        <div>
          <div className={styles.ctrlLabel}>Active entities</div>
          <div className={styles.toggles}>
            {allEntities
              .filter((e) => detectedTypes.has(e.id))
              .map((e) => {
                const isOn = activeEntities.has(e.id);
                return (
                  <div
                    key={e.id}
                    className={styles.toggleRow}
                    onClick={() => dispatch({ type: 'TOGGLE_ENTITY', payload: e.id })}
                    role="checkbox"
                    aria-checked={isOn}
                    tabIndex={0}
                    onKeyDown={(ev) =>
                      ev.key === 'Enter' && dispatch({ type: 'TOGGLE_ENTITY', payload: e.id })
                    }
                  >
                    <label className={styles.toggleLabel}>{e.label}</label>
                    <div className={`${styles.toggleSw} ${isOn ? styles.on : ''}`} />
                  </div>
                );
              })}
          </div>
        </div>
        <button className={styles.reprocessBtn} onClick={onReprocess}>
          Apply changes
        </button>
      </div>
    </aside>
  );
}
