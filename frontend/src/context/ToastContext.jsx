import { useCallback, useMemo, useRef, useState } from 'react';
import { Toast } from '@/components/feedback/Toast';
import { ToastContext } from '@/context/toastContextValue';

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setMessage('');
  }, []);

  const notify = useCallback((nextMessage) => {
    clearTimeout(timeoutRef.current);
    setMessage(nextMessage);
    timeoutRef.current = setTimeout(() => setMessage(''), 4000);
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [dismiss, notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={message} onClose={dismiss} />
    </ToastContext.Provider>
  );
}
