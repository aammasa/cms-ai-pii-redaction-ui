import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/upload/UploadZone';
import { Workspace } from '@/components/workspace/Workspace';
import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { ChatBot } from '@/components/chat/ChatBot';
import { Loader } from '@/components/ui/Loader';
import styles from './App.module.css';

export function App() {
  const { state, dispatch } = useApp();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleNewFile = () => dispatch({ type: 'RESET_TO_UPLOAD' });

  return (
    <div className={styles.shell}>
      <Header
        showNewFile={state.view === 'workspace'}
        onNewFile={handleNewFile}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <main className={styles.main}>
        {state.view === 'upload' ? <UploadZone /> : <Workspace />}
      </main>

      <AdminDrawer open={adminOpen} onClose={() => setAdminOpen(false)} />
      <ChatBot />
      <Loader />
    </div>
  );
}
