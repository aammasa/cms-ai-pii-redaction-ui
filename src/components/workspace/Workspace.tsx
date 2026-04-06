import { useApp } from '@/store/AppContext';
import { Sidebar } from './Sidebar';
import { PanelsArea } from './PanelsArea';
import { SummaryBar } from './SummaryBar';
import styles from './Workspace.module.css';

export function Workspace() {
  const { reprocess } = useApp();

  return (
    <div className={styles.workspace}>
      <Sidebar onReprocess={reprocess} />
      <PanelsArea />
      <SummaryBar />
    </div>
  );
}
