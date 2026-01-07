import { useState, useEffect } from "react";
import { X, Download, Share, Plus, MoreVertical, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "desktop" | "unknown";

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>("unknown");

  const detectDevice = (): DeviceType => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) return "ios";
    if (isAndroid) return "android";
    return "desktop";
  };

  useEffect(() => {
    console.log("[PWA] Inicializando componente de instalação PWA");
    
    const device = detectDevice();
    setDeviceType(device);
    console.log("[PWA] Dispositivo detectado:", device);

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      console.log("[PWA] App já está instalado (modo standalone)");
      setIsInstalled(true);
      return;
    }

    // Check localStorage for dismissed state
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = new Date().getTime();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
      
      if (hoursSinceDismissed < 24) {
        console.log("[PWA] Prompt foi dispensado há menos de 24h, não mostrando");
        return;
      }
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] Evento beforeinstallprompt capturado!");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show prompt after 2 seconds
    const timer = setTimeout(() => {
      console.log("[PWA] Timer de 2 segundos expirado, mostrando prompt");
      setShowPrompt(true);
    }, 2000);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App instalado com sucesso!");
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    console.log("[PWA] Botão de instalação clicado");
    
    if (deferredPrompt) {
      console.log("[PWA] Usando deferredPrompt para instalação automática");
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("[PWA] Resultado da escolha do usuário:", outcome);
        
        if (outcome === "accepted") {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error("[PWA] Erro ao tentar instalar:", error);
        setShowManualInstructions(true);
      }
    } else {
      console.log("[PWA] Sem deferredPrompt, mostrando instruções manuais");
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    console.log("[PWA] Prompt dispensado pelo usuário");
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
    setShowPrompt(false);
  };

  const DeviceIcon = () => {
    switch (deviceType) {
      case "ios":
      case "android":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const ManualInstructions = () => {
    if (deviceType === "ios") {
      return (
        <div className="space-y-4">
          <h4 className="font-display font-bold text-lg">Como instalar no iPhone/iPad:</h4>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</span>
              <span>Toque no ícone <Share className="inline w-4 h-4 mx-1" /> <strong>Compartilhar</strong> na barra inferior do Safari</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</span>
              <span>Role para baixo e toque em <Plus className="inline w-4 h-4 mx-1" /> <strong>"Adicionar à Tela de Início"</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</span>
              <span>Confirme tocando em <strong>"Adicionar"</strong></span>
            </li>
          </ol>
          <div className="p-3 bg-secondary/20 rounded-lg text-xs">
            <strong>Dica:</strong> Use o Safari para melhor experiência. Outros navegadores no iOS podem não suportar PWA.
          </div>
        </div>
      );
    }

    if (deviceType === "android") {
      return (
        <div className="space-y-4">
          <h4 className="font-display font-bold text-lg">Como instalar no Android:</h4>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</span>
              <span>Toque no ícone <MoreVertical className="inline w-4 h-4 mx-1" /> <strong>Menu</strong> (três pontos) no canto superior direito do Chrome</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</span>
              <span>Toque em <Download className="inline w-4 h-4 mx-1" /> <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</span>
              <span>Confirme a instalação</span>
            </li>
          </ol>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h4 className="font-display font-bold text-lg">Como instalar no Desktop:</h4>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</span>
            <span>No Chrome, clique no ícone <Download className="inline w-4 h-4 mx-1" /> de instalação na barra de endereços (lado direito)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</span>
            <span>Ou clique no menu <MoreVertical className="inline w-4 h-4 mx-1" /> (três pontos) e selecione <strong>"Instalar PromptHub..."</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</span>
            <span>Clique em <strong>"Instalar"</strong> para confirmar</span>
          </li>
        </ol>
        <div className="p-3 bg-secondary/20 rounded-lg text-xs">
          <strong>Navegadores suportados:</strong> Chrome, Edge, Brave e outros baseados em Chromium.
        </div>
      </div>
    );
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card rounded-2xl border-2 border-primary shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-coral to-coral-dark p-6 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 rounded-full bg-card/20 hover:bg-card/40 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-card" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <div className="text-card">
              <h3 className="font-display font-bold text-xl">Instale o PromptHub</h3>
              <p className="text-sm opacity-90">Acesse mais rápido, direto da sua tela inicial!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {showManualInstructions ? (
            <ManualInstructions />
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success">✓</span>
                  </div>
                  <span>Funciona offline</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success">✓</span>
                  </div>
                  <span>Carregamento super rápido</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success">✓</span>
                  </div>
                  <span>Experiência como app nativo</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                <DeviceIcon />
                <span>
                  {deviceType === "ios" && "Detectado: iPhone/iPad"}
                  {deviceType === "android" && "Detectado: Android"}
                  {deviceType === "desktop" && "Detectado: Desktop"}
                  {deviceType === "unknown" && "Dispositivo"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          {showManualInstructions ? (
            <Button 
              onClick={() => setShowManualInstructions(false)}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleInstall}
                className="w-full btn-generate text-base py-6"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
              
              {!deferredPrompt && (
                <Button 
                  onClick={() => setShowManualInstructions(true)}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Ver instruções de instalação
                </Button>
              )}
              
              <button
                onClick={handleDismiss}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Agora não, talvez depois
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
