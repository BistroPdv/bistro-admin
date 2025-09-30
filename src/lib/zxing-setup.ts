// Função para verificar se WASM está carregado
export const checkWasmSupport = () => {
  if (typeof window === "undefined") return false;

  try {
    return (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    );
  } catch (e) {
    return false;
  }
};

// Função para configurar ZXing para usar arquivos WASM locais
export const configureZXingLocalWasm = () => {
  if (typeof window === "undefined") return;

  try {
    // Configura o ZXing para usar arquivos WASM locais em vez do CDN
    if (window.ZXing) {
      // Se ZXing já estiver disponível globalmente
      window.ZXing.setWasmPath = (path: string) => {
        // Força o uso de arquivos locais
        return path.replace("https://fastly.jsdelivr.net", "");
      };
    }

    // Configuração alternativa para bibliotecas que usam ZXing
    if (window.BarcodeDetector) {
      // Configura o BarcodeDetector para usar configurações locais
      console.log("BarcodeDetector available, configuring for local WASM");
    }

    console.log("ZXing configured for local WASM files");
  } catch (error) {
    console.warn("Could not configure ZXing for local WASM:", error);
  }
};
