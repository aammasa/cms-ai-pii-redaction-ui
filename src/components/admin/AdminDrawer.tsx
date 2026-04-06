import { useCallback, useEffect, useState } from 'react';
import * as api from '@/api/client';
import { Icon } from '@/components/ui/Icon';
import type { BusinessUnit, Pattern } from '@/types';
import { PatternTable } from './PatternTable';
import { AddPatternForm } from './AddPatternForm';
import { TestPanel } from './TestPanel';
import { useApp } from '@/store/AppContext';
import styles from './AdminDrawer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminDrawer({ open, onClose }: Props) {
  const { refreshEntities } = useApp();
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [activeUnit, setActiveUnit] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const [unitsData, patsData] = await Promise.all([
        api.fetchUnits(),
        api.fetchPatterns(),
      ]);
      setUnits(unitsData.units);
      setPatterns(patsData.patterns);
      setActiveUnit((prev) => prev ?? unitsData.units[0]?.id ?? null);
    } catch (err) {
      setLoadError('Failed to load patterns: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const handleDelete = async (patternId: string) => {
    if (!confirm('Delete this custom pattern? This cannot be undone.')) return;
    try {
      await api.deletePattern(patternId);
      await refresh();
      await refreshEntities();
    } catch (err) {
      alert('Delete failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCreate = async (payload: api.CreatePatternPayload) => {
    await api.createPattern(payload);
    await refresh();
    await refreshEntities();
  };

  const unit = units.find((u) => u.id === activeUnit);
  const unitPatterns = patterns.filter((p) => p.unit === activeUnit);

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Custom PII Patterns"
      >
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerTitle}>Custom PII Patterns</div>
            <div className={styles.drawerSub}>
              Define per-business-unit regex patterns for domain-specific identifiers
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Unit tabs */}
        <div className={styles.tabs}>
          {units.map((u) => (
            <button
              key={u.id}
              className={`${styles.tab} ${activeUnit === u.id ? styles.tabActive : ''}`}
              onClick={() => setActiveUnit(u.id)}
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>
          {loadError ? (
            <div className={styles.loadError}>{loadError}</div>
          ) : unit ? (
            <>
              <PatternTable
                patterns={unitPatterns}
                unitLabel={unit.label}
                onDelete={handleDelete}
              />
              <AddPatternForm activeUnit={activeUnit!} onSubmit={handleCreate} />
              <TestPanel />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
