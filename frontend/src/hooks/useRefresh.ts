import { useEffect, useRef, useCallback } from 'react';

// Global refresh event
const refreshEvent = new Event('app:refresh');

export function useRefresh(onRefresh: () => void | Promise<void>) {
  const handlerRef = useRef<EventListener | null>(null);

  useEffect(() => {
    const handler = async () => {
      await onRefresh();
    };

    handlerRef.current = handler;
    window.addEventListener('app:refresh', handler);

    return () => {
      if (handlerRef.current) {
        window.removeEventListener('app:refresh', handlerRef.current);
      }
    };
  }, [onRefresh]);
}

export function triggerAppRefresh() {
  window.dispatchEvent(refreshEvent);
}
