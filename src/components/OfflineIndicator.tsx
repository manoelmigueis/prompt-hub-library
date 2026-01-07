import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineNotice, setShowOnlineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineNotice(true);
      setTimeout(() => setShowOnlineNotice(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineNotice(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showOnlineNotice) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOnline 
          ? "bg-success text-success-foreground" 
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Conexão restaurada!</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
