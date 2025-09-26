"use client";

import { useCallback, useEffect, useState } from "react";

interface WebRTCLoaderProps {
  onLoaded?: () => void;
  retry?: boolean;
}

export function WebRTCLoader({ onLoaded, retry }: WebRTCLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadWebRTCAdapter = useCallback(async () => {
    if (isLoading) return; // Evitar carregamentos duplicados

    setIsLoading(true);
    try {
      // Importa e CARREGA o adapter imediatamente
      const adapter = await import("webrtc-adapter");

      // Espera um pouco para garantir inicialização
      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsLoaded(true);
      setIsLoading(false);
      console.log(
        "WebRTC adapter loaded successfully for mobile compatibility"
      );
      onLoaded?.();
    } catch (error) {
      console.warn("Failed to load webrtc-adapter:", error);
      setIsLoading(false);
    }
  }, [onLoaded, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded && !isLoading) {
      loadWebRTCAdapter();
    }
  }, [loadWebRTCAdapter, isLoaded, isLoading]);

  // Retry se necessário
  useEffect(() => {
    if (retry && typeof window !== "undefined" && !isLoaded && !isLoading) {
      console.log("Retrying WebRTC adapter load...");
      loadWebRTCAdapter();
    }
  }, [retry, loadWebRTCAdapter, isLoaded, isLoading]);

  // Expose como que pode ser usada por outros componentes
  return isLoaded ? (
    <div style={{ display: "none" }} data-webrtc-ready="true" />
  ) : (
    <div style={{ display: "none" }} data-webrtc-loading="true" />
  );
}
