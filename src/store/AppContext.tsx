import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import * as api from '@/api/client';
import type { Entity, EntitySpan, Language, OperatorId, SummaryLength } from '@/types';

// ── State shape ────────────────────────────────────────────────────────────

export interface AppState {
  // Connection
  apiOnline: boolean;

  // Upload-screen options
  allEntities: Entity[];
  activeEntities: Set<string>;
  allLanguages: Language[];
  language: string;
  operator: OperatorId;

  // Workspace
  view: 'upload' | 'workspace';
  file: File | null;
  originalText: string;
  redactedText: string;
  entitiesFound: EntitySpan[];
  entityCounts: Record<string, number>;
  detectedLanguage: string;

  // Summary
  sumLen: SummaryLength;
  summary: string;

  // Loader
  loading: boolean;
  loadingMessage: string;
}

const FALLBACK_ENTITIES: Entity[] = [
  { id: 'PERSON', label: 'Person' },
  { id: 'EMAIL_ADDRESS', label: 'Email' },
  { id: 'PHONE_NUMBER', label: 'Phone' },
  { id: 'CREDIT_CARD', label: 'Credit card' },
  { id: 'US_SSN', label: 'SSN' },
  { id: 'LOCATION', label: 'Location' },
  { id: 'DATE_TIME', label: 'Date/time' },
  { id: 'URL', label: 'URL' },
  { id: 'IP_ADDRESS', label: 'IP address' },
  { id: 'ORGANIZATION', label: 'Organization' },
];

const initialState: AppState = {
  apiOnline: false,
  allEntities: [],
  activeEntities: new Set(),
  allLanguages: [],
  language: 'auto',
  operator: 'replace',
  view: 'upload',
  file: null,
  originalText: '',
  redactedText: '',
  entitiesFound: [],
  entityCounts: {},
  detectedLanguage: '',
  sumLen: 'short',
  summary: '',
  loading: false,
  loadingMessage: 'Processing…',
};

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_API_ONLINE'; payload: boolean }
  | { type: 'SET_ALL_ENTITIES'; payload: Entity[] }
  | { type: 'TOGGLE_ENTITY'; payload: string }
  | { type: 'SET_ACTIVE_ENTITIES'; payload: Set<string> }
  | { type: 'SET_ALL_LANGUAGES'; payload: Language[] }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_OPERATOR'; payload: OperatorId }
  | {
      type: 'SHOW_WORKSPACE';
      payload: {
        file: File;
        originalText: string;
        redactedText: string;
        entitiesFound: EntitySpan[];
        entityCounts: Record<string, number>;
        detectedLanguage: string;
      };
    }
  | {
      type: 'UPDATE_REDACTION';
      payload: {
        redactedText: string;
        entitiesFound: EntitySpan[];
        entityCounts: Record<string, number>;
      };
    }
  | { type: 'SET_SUMMARY'; payload: string }
  | { type: 'SET_SUM_LEN'; payload: SummaryLength }
  | { type: 'RESET_TO_UPLOAD' }
  | { type: 'SET_LOADING'; payload: { loading: boolean; message?: string } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_API_ONLINE':
      return { ...state, apiOnline: action.payload };
    case 'SET_ALL_ENTITIES':
      return {
        ...state,
        allEntities: action.payload,
        activeEntities: new Set(action.payload.map((e) => e.id)),
      };
    case 'TOGGLE_ENTITY': {
      const next = new Set(state.activeEntities);
      next.has(action.payload) ? next.delete(action.payload) : next.add(action.payload);
      return { ...state, activeEntities: next };
    }
    case 'SET_ACTIVE_ENTITIES':
      return { ...state, activeEntities: action.payload };
    case 'SET_ALL_LANGUAGES':
      return { ...state, allLanguages: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_OPERATOR':
      return { ...state, operator: action.payload };
    case 'SHOW_WORKSPACE':
      return {
        ...state,
        view: 'workspace',
        file: action.payload.file,
        originalText: action.payload.originalText,
        redactedText: action.payload.redactedText,
        entitiesFound: action.payload.entitiesFound,
        entityCounts: action.payload.entityCounts,
        detectedLanguage: action.payload.detectedLanguage,
        summary: '',
      };
    case 'UPDATE_REDACTION':
      return {
        ...state,
        redactedText: action.payload.redactedText,
        entitiesFound: action.payload.entitiesFound,
        entityCounts: action.payload.entityCounts,
        summary: '',
      };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_SUM_LEN':
      return { ...state, sumLen: action.payload };
    case 'RESET_TO_UPLOAD':
      return {
        ...initialState,
        apiOnline: state.apiOnline,
        allEntities: state.allEntities,
        activeEntities: new Set(state.allEntities.map((e) => e.id)),
        allLanguages: state.allLanguages,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading,
        loadingMessage: action.payload.message ?? state.loadingMessage,
      };
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Async helpers
  processFile: (file: File) => Promise<void>;
  reprocess: () => Promise<void>;
  runSummarize: () => Promise<void>;
  refreshEntities: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showLoader = useCallback((message: string) => {
    dispatch({ type: 'SET_LOADING', payload: { loading: true, message } });
  }, []);

  const hideLoader = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: { loading: false } });
  }, []);

  const refreshEntities = useCallback(async () => {
    try {
      const data = await api.fetchEntities();
      dispatch({ type: 'SET_ALL_ENTITIES', payload: data.entities });
    } catch {
      // no-op — retain current list
    }
  }, []);

  // Initialise on mount
  useEffect(() => {
    async function init() {
      const online = await api.checkHealth();
      dispatch({ type: 'SET_API_ONLINE', payload: online });

      try {
        const [entData, langData] = await Promise.all([
          api.fetchEntities(),
          api.fetchLanguages(),
        ]);
        dispatch({ type: 'SET_ALL_ENTITIES', payload: entData.entities });
        dispatch({ type: 'SET_ALL_LANGUAGES', payload: langData.languages });
      } catch {
        dispatch({ type: 'SET_ALL_ENTITIES', payload: FALLBACK_ENTITIES });
      }
    }
    void init();
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      showLoader('Extracting and redacting…');
      try {
        const data = await api.processFile(file, state.language);
        dispatch({
          type: 'SHOW_WORKSPACE',
          payload: {
            file,
            originalText: data.original_text,
            redactedText: data.redacted_text,
            entitiesFound: data.entities_found,
            entityCounts: data.entity_counts,
            detectedLanguage: data.detected_language,
          },
        });
      } catch (err) {
        alert('Error: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        hideLoader();
      }
    },
    [state.language, showLoader, hideLoader],
  );

  const reprocess = useCallback(async () => {
    showLoader('Reprocessing…');
    try {
      const data = await api.redactText(
        state.originalText,
        state.detectedLanguage || state.language,
        [...state.activeEntities],
        state.operator,
      );
      dispatch({
        type: 'UPDATE_REDACTION',
        payload: {
          redactedText: data.redacted_text,
          entitiesFound: data.entities_found,
          entityCounts: data.entity_counts,
        },
      });
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      hideLoader();
    }
  }, [state, showLoader, hideLoader]);

  const runSummarize = useCallback(async () => {
    try {
      const data = await api.summarizeText(state.redactedText, state.sumLen);
      dispatch({ type: 'SET_SUMMARY', payload: data.summary });
    } catch (err) {
      dispatch({
        type: 'SET_SUMMARY',
        payload: 'Error: ' + (err instanceof Error ? err.message : String(err)),
      });
    }
  }, [state.redactedText, state.sumLen]);

  return (
    <AppContext.Provider value={{ state, dispatch, processFile, reprocess, runSummarize, refreshEntities }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
