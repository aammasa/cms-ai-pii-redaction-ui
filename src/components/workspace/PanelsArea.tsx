import { useCallback, useRef, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Icon } from '@/components/ui/Icon';
import styles from './PanelsArea.module.css';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOriginalHtml(text: string, entities: { type: string; start: number; end: number }[]): string {
  let html = escapeHtml(text);
  // Sort descending by start position to safely replace without offset drift
  const sorted = [...entities].sort((a, b) => b.start - a.start);
  sorted.forEach((e) => {
    const raw = text.slice(e.start, e.end);
    html = html.replace(
      escapeHtml(raw),
      `<span class="pii-highlight" title="${e.type}">${escapeHtml(raw)}</span>`,
    );
  });
  return html;
}

function buildRedactedHtml(text: string): string {
  return escapeHtml(text).replace(
    /&lt;([A-Z_]+)&gt;/g,
    '<span class="pii-tag">&lt;$1&gt;</span>',
  );
}

export function PanelsArea() {
  const { state } = useApp();
  const { originalText, redactedText, entitiesFound } = state;

  const originalHtml = buildOriginalHtml(originalText, entitiesFound);
  const redactedHtml = buildRedactedHtml(redactedText);

  const [copiedOrig, setCopiedOrig] = useState(false);
  const [copiedRed, setCopiedRed] = useState(false);

  const copyText = useCallback(
    (which: 'original' | 'redacted') => {
      const text = which === 'original' ? originalText : redactedText;
      void navigator.clipboard.writeText(text).then(() => {
        if (which === 'original') {
          setCopiedOrig(true);
          setTimeout(() => setCopiedOrig(false), 1500);
        } else {
          setCopiedRed(true);
          setTimeout(() => setCopiedRed(false), 1500);
        }
      });
    },
    [originalText, redactedText],
  );

  // refs kept for backward compat but no longer used for text mutation
  const origBtnRef = useRef<HTMLButtonElement>(null);
  const redBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.panelsArea}>
      <div className={styles.headers}>
        <div className={styles.panelHeader}>
          <span className={styles.panelLabel}>Original</span>
          <button ref={origBtnRef} className={styles.copyBtn} onClick={() => copyText('original')}>
            {copiedOrig
              ? <><Icon name="check" size={12} /> Copied</>
              : <><Icon name="copy-content" size={12} /> Copy</>
            }
          </button>
        </div>
        <div className={styles.panelHeader}>
          <span className={styles.panelLabel}>Redacted</span>
          <button ref={redBtnRef} className={styles.copyBtn} onClick={() => copyText('redacted')}>
            {copiedRed
              ? <><Icon name="check" size={12} /> Copied</>
              : <><Icon name="copy-content" size={12} /> Copy</>
            }
          </button>
        </div>
      </div>

      <div className={styles.scroll}>
        {/* eslint-disable-next-line react/no-danger */}
        <div className={styles.panelBody} dangerouslySetInnerHTML={{ __html: originalHtml }} />
        {/* eslint-disable-next-line react/no-danger */}
        <div className={styles.panelBody} dangerouslySetInnerHTML={{ __html: redactedHtml }} />
      </div>
    </div>
  );
}
