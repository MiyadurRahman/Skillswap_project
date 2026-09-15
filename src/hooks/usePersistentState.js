import { useEffect, useState } from 'react';

// LocalStorage-backed state: hydrates from storage on mount and persists on
// change. When `enabled` is false the state lives in memory only (demo data is
// stored locally; realtime data lives in Firestore).
export function usePersistentState(key, initialValue, enabled = true) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(`Failed to load ${key} from storage:`, e);
    }
    return initialValue;
  });

  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`Failed to save ${key}:`, e);
    }
  }, [key, state, enabled]);

  return [state, setState];
}