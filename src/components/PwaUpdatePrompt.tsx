import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, WifiOff } from 'lucide-react';

export function PwaUpdatePrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
  };

  return (
    <>
      {isOffline && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-3 max-w-sm bg-[#2e0912] border border-[#ff3366] text-[#ff99aa] p-3 rounded shadow-xl flex items-center justify-between text-xs z-50 font-mono">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#ff3366]" />
            <span>OFFLINE // CACHED VECTOR PROTOCOLS ACTIVE</span>
          </div>
        </div>
      )}

      {showInstall && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-3 max-w-sm bg-[#081224] border border-[#00ffcc] text-[#c0d4ec] p-3 rounded shadow-2xl flex items-center justify-between text-xs z-50 font-mono">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#00ffcc]" />
            <div>
              <div className="font-bold text-white">INSTALL PWA MESH</div>
              <div className="text-[10px] text-[#6e89ac]">Standalone High-Density Telemetry</div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 bg-[#00ffcc] text-[#060a13] font-bold rounded cursor-pointer hover:bg-[#33ffdd]"
          >
            INSTALL
          </button>
        </div>
      )}
    </>
  );
}
