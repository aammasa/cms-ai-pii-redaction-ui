import { useApp } from '@/store/AppContext';
import styles from './Loader.module.css';

export function Loader() {
  const { state } = useApp();
  if (!state.loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinnerWrap}>
        <div className={styles.spinner} />
        <div className={styles.spinnerInner} />
      </div>
      <div className={styles.text}>{state.loadingMessage}</div>
    </div>
  );
}
