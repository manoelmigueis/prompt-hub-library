import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] Nova versão disponível!");
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Check for updates periodically
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 60 * 60 * 1000); // Check every hour

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-card border-2 border-primary rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-sm">Nova versão disponível!</h4>
            <p className="text-xs text-muted-foreground">Atualize para obter as últimas melhorias.</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            Atualizar
          </Button>
          <Button onClick={() => setShowUpdate(false)} variant="outline" size="sm">
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;
