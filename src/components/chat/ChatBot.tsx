import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { sendChatMessage, type ChatMessage } from '@/api/client';
import { Icon } from '@/components/ui/Icon';
import styles from './ChatBot.module.css';

const SUGGESTED = [
  'What PII was found in this document?',
  'Summarize this document briefly',
  'List all supported entity types',
  'Show patterns for the construction unit',
];

export function ChatBot() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const context = state.originalText
        ? `The user has loaded a document. Original text (first 2000 chars):\n${state.originalText.slice(0, 2000)}\n\nRedacted text (first 2000 chars):\n${state.redactedText.slice(0, 2000)}`
        : undefined;

      const res = await sendChatMessage({
        message: msg,
        history: history,
        document_context: context,
      });

      setHistory(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const clearChat = () => {
    setHistory([]);
    setError('');
  };

  return (
    <>
      {/* ── Floating trigger button ──────────────────────── */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI assistant"
        title="Ask AI assistant"
      >
        <Icon name={open ? 'close' : 'trimble-logo'} size={22} />
      </button>

      {/* ── Chat panel ───────────────────────────────────── */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`} role="dialog" aria-label="AI Assistant">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Icon name="bot" size={18} />
            </div>
            <div>
              <div className={styles.headerTitle}>PII Assistant</div>
              <div className={styles.headerSub}>Powered by Trimble AI</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            {history.length > 0 && (
              <button className={styles.clearBtn} onClick={clearChat} title="Clear chat">
                <Icon name="delete" size={14} />
              </button>
            )}
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {history.length === 0 && !loading && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <Icon name="bot" size={28} />
              </div>
              <p className={styles.emptyTitle}>How can I help?</p>
              <p className={styles.emptySub}>
                Ask me about PII detection, patterns, redaction, or your loaded document.
              </p>
              <div className={styles.suggestions}>
                {SUGGESTED.map(s => (
                  <button key={s} className={styles.suggestion} onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
              {msg.role === 'assistant' && (
                <div className={styles.msgAvatar}>
                  <Icon name="bot" size={14} />
                </div>
              )}
              <div className={styles.msgBubble}>
                <pre className={styles.msgText}>{msg.content}</pre>
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.msg} ${styles.msgAssistant}`}>
              <div className={styles.msgAvatar}>
                <Icon name="ai-stars" size={13} />
              </div>
              <div className={styles.msgBubble}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMsg}>
              <Icon name="shield" size={13} />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          {state.view === 'workspace' && (
            <div className={styles.contextBadge}>
              <Icon name="file-new" size={11} />
              {state.file?.name ?? 'Document loaded'}
            </div>
          )}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Ask anything about PII, patterns, or your document…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => void send(input)}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <Icon name="arrow-back" size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
          <div className={styles.hint}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* Overlay (mobile) */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden />}
    </>
  );
}
