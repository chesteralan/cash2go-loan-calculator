import React from 'react';
import { useOnlineStatus } from '../hooks/usePWA';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-500/20 animate-fade-in"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>Offline Mode — All calculations and saved schedules remain fully accessible.</span>
    </div>
  );
};
