import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToastMessage(msg);
    timeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      timeoutRef.current = null;
    }, 3500);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return { toastMessage, showToast };
}
