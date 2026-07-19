import { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
      <FiWifiOff className="w-4 h-4" /> You are offline. Some features may not work.
    </div>
  );
}
