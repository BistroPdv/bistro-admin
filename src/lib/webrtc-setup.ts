// WebRTC Adapter setup - MUST be loaded before any MediaDevices usage
let webrtcAdapterLoaded = false;

export async function setupWebRTC(): Promise<boolean> {
  if (webrtcAdapterLoaded) {
    return true;
  }

  try {
    if (typeof window !== "undefined" && "navigator" in window) {
      // Import webrtc-adapter direto
      const adapter = await import("webrtc-adapter");

      // O import do webrtc-adapter já deveria aplicar patches automaticamente
      console.log("WebRTC Adapter imported successfully");
      webrtcAdapterLoaded = true;
      return true;
    }

    webrtcAdapterLoaded = false;
    return false;
  } catch (error) {
    console.warn("Failed to load webrtc-adapter:", error);
    webrtcAdapterLoaded = false;
    return false;
  }
}

// FOREARING SETUP immediate load
if (typeof window !== "undefined") {
  // não aguarda aqui, apenas inicia o processo
  setupWebRTC().then((success) => {
    if (success) {
      console.log("✅ WebRTC setup completed");
    }
  });
}
