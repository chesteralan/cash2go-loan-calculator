import React from 'react';
import { useOfflineReady, useOnlineStatus } from '../hooks/usePWA';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const isOfflineReady = useOfflineReady();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-lg animate-fade-in ' +
        (isOfflineReady
          ? 'bg-emerald-600 text-white shadow-emerald-600/20'
          : 'bg-amber-500 text-white shadow-amber-500/20')
      }
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>
        {isOfflineReady
          ? 'Offline Mode — Served fully from cache; all data remains accessible.'
          : 'Offline Mode — All calculations and saved schedules remain fully accessible.'}
      </span>
    </div>
  );
};
