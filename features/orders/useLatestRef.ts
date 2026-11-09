import { useEffect, useRef } from 'react';

/**
 * Ref that always holds the latest value. Used for `t` from useTranslation, which gets a new
 * identity every render and would otherwise retrigger data-loading effects in a loop.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
