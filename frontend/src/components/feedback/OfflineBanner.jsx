import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-center text-sm font-bold text-white shadow-2xl"
    >
      <WifiOff aria-hidden="true" className="size-4 text-sun" />
      You are offline. Some actions may be unavailable.
    </div>
  );
}
