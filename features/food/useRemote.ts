import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

type RemoteState<T> = { data: T | null; loading: boolean; error: unknown };

/** Loads `load()` whenever `deps` change; keeps the previous data while refetching. */
export function useRemote<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<RemoteState<T>>({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loadRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState((prev) => ({ data: prev.data, loading: false, error }));
      });
    return () => {
      active = false;
    };
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, reload };
}
