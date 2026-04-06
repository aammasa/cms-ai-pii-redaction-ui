import { useApp } from '@/store/AppContext';
import { Icon } from '@/components/ui/Icon';
import styles from './EntityChips.module.css';

export function EntityChips() {
  const { state, dispatch } = useApp();

  const selectAll = () =>
    dispatch({ type: 'SET_ACTIVE_ENTITIES', payload: new Set(state.allEntities.map((e) => e.id)) });

  const selectNone = () =>
    dispatch({ type: 'SET_ACTIVE_ENTITIES', payload: new Set() });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.titleRow}>
          <Icon name="shield" size={13} style={{ color: 'var(--muted)' }} />
          <span className={styles.title}>Entities to detect</span>
        </span>
        <div className={styles.actions}>
          <button className={styles.epBtn} onClick={selectAll}>All</button>
          <button className={styles.epBtn} onClick={selectNone}>None</button>
        </div>
      </div>
      <div className={styles.grid}>
        {state.allEntities.map((e) => (
          <div
            key={e.id}
            className={`${styles.chip} ${state.activeEntities.has(e.id) ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_ENTITY', payload: e.id })}
            role="checkbox"
            aria-checked={state.activeEntities.has(e.id)}
            tabIndex={0}
            onKeyDown={(ev) => ev.key === 'Enter' && dispatch({ type: 'TOGGLE_ENTITY', payload: e.id })}
          >
            <span className={styles.dot} />
            {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}
