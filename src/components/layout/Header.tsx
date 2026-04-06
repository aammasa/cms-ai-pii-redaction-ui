import styles from './Header.module.css';
import { useApp } from '@/store/AppContext';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onNewFile: () => void;
  onOpenAdmin: () => void;
  showNewFile: boolean;
}

export function Header({ onNewFile, onOpenAdmin, showNewFile }: Props) {
  const { state } = useApp();

  return (
    <header className={styles.header}>
      {/* ── Trimble brand logo ────────────────────────────── */}
      <div className={styles.logo}>
        {/* Official Trimble mark from @trimble-oss/modus-icons */}
        <div className={styles.logoMark}>
          <Icon name="trimble-logo" size={28} />
        </div>
        <span className={styles.logoWord}>Trimble</span>
        <span className={styles.logoDivider}>|</span>
        <span className={styles.logoProduct}>PII Redact</span>
      </div>

      {/* ── Right controls ────────────────────────────────── */}
      <div className={styles.right}>
        <div className={styles.statusPill}>
          <div className={`${styles.statusDot} ${state.apiOnline ? styles.online : ''}`} />
          <span className={`${styles.statusLabel} ${state.apiOnline ? styles.online : ''}`}>
            {state.apiOnline ? 'API connected' : 'API offline'}
          </span>
        </div>

        {showNewFile && (
          <button className={styles.newFileBtn} onClick={onNewFile}>
            <Icon name="arrow-back" size={13} />
            New file
          </button>
        )}

        <button className={styles.adminBtn} onClick={onOpenAdmin}>
          <Icon name="settings" size={14} />
          Custom Patterns
        </button>
      </div>
    </header>
  );
}
