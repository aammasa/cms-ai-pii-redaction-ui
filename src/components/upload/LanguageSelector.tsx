import { useApp } from '@/store/AppContext';
import { Icon } from '@/components/ui/Icon';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { state, dispatch } = useApp();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Icon name="language" size={13} style={{ color: 'var(--muted)', marginRight: 6 }} />
        <span className={styles.title}>Language</span>
      </div>
      <select
        className={styles.select}
        value={state.language}
        onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
      >
        <option value="auto">Auto-detect</option>
        {state.allLanguages.map((lang) => (
          <option key={lang.code} value={lang.code} disabled={!lang.installed}>
            {lang.label}
            {!lang.installed ? ' (model not installed)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
