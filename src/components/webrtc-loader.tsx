"use client";

import { useEffect, useState } from "react";

export function WebRTCLoader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadWebRTCAdapter = async () => {
      try {
        // Carrega o webrtc-adapter apenas no lado do cliente
        await import("webrtc-adapter");
        setIsLoaded(true);
        console.log(
          "WebRTC adapter loaded successfully for mobile compatibility"
        );
      } catch (error) {
        console.warn("Failed to load webrtc-adapter:", error);
      }
    };

    if (typeof window !== "undefined") {
      loadWebRTCAdapter();
    }
  }, []);

  return null; // Componente não renderiza nada, apenas carrega o adapter
}
