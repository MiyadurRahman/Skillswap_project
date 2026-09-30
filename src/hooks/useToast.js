import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const removalTimeoutRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    timeoutRef.current = null;
    setToast((current) => (current ? { ...current, closing: true } : null));
    removalTimeoutRef.current = setTimeout(() => {
      setToast(null);
      removalTimeoutRef.current = null;
    }, 180);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    if (!message) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    const normalizedType = ['success', 'error', 'warning', 'info'].includes(type)
      ? type
      : 'info';
    setToast({ id: Date.now(), message, type: normalizedType, closing: false });
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      dismissToast();
    }, normalizedType === 'error' || normalizedType === 'warning' ? 5000 : 3500);
  }, [dismissToast]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (removalTimeoutRef.current) clearTimeout(removalTimeoutRef.current);
    },
    []
  );

  return { toast, toastMessage: toast?.message || null, showToast, dismissToast };
}
