"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne a exibição automática do banner de instalação
      e.preventDefault();
      // Salva o evento para usar depois
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostra nosso próprio prompt após um pequeno delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      // O usuário instalou o PWA
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      console.log("PWA was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Verifica se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true) {
      // Já está instalado, não mostra o prompt
      return;
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra o prompt de instalação
    deferredPrompt.prompt();

    // Aguarda a resposta do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("PWA install was accepted");
    } else {
      console.log("PWA install was dismissed");
    }

    // Limpa o prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleClosePrompt = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">
            Instalar Bistro Admin
          </h4>
          <p className="text-xs text-gray-300 mb-3">
            Instale este app para acesso rápido e modo offline.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
            >
              Instalar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClosePrompt}
              className="text-xs px-3 py-1 border-gray-600 text-gray-300"
            >
              Agora não
            </Button>
          </div>
        </div>
        <button
          onClick={handleClosePrompt}
          className="text-gray-400 hover:text-gray-200 text-lg leading-none"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
