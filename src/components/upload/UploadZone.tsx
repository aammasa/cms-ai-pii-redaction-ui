import { useCallback, useRef, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { EntityChips } from './EntityChips';
import { LanguageSelector } from './LanguageSelector';
import { OperatorSelector } from './OperatorSelector';
import { Icon } from '@/components/ui/Icon';
import styles from './UploadZone.module.css';

const ACCEPTED = '.txt,.pdf,.docx,.doc,.csv,.md';
const FORMATS = ['.txt', '.pdf', '.docx', '.csv', '.md'];

export function UploadZone() {
  const { processFile } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      void processFile(file);
    },
    [processFile],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={styles.zone}>
      {/* Drop area */}
      <div
        className={`${styles.dropArea} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className={styles.fileInput}
          onChange={onInputChange}
          onClick={(e) => e.stopPropagation()}
        />
        <div className={styles.iconWrap}>
          <Icon name="cloud-upload" size={26} />
        </div>
        <div className={styles.title}>Drop your file here</div>
        <div className={styles.sub}>
          or <span>browse to upload</span>
        </div>
        <div className={styles.formats}>
          {FORMATS.map((f) => (
            <span key={f} className={styles.fmtTag}>
              {f}
            </span>
          ))}
        </div>
      </div>

      <EntityChips />
      <LanguageSelector />
      <OperatorSelector />
    </div>
  );
}
