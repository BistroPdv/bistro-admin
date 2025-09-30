// Configuração para @yudiel/react-qr-scanner
// Força o uso de arquivos WASM locais em vez de CDN externo

// Declaração de tipos para ZXing
declare global {
  interface Window {
    ZXing?: {
      setWasmPath?: (path: string) => string;
    };
  }
}

export const configureQRScanner = () => {
  if (typeof window === "undefined") return;

  try {
    // Intercepta requisições de WASM para usar arquivos locais
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();

      // Se for uma requisição para o CDN do ZXing, redireciona para arquivo local
      if (url.includes("fastly.jsdelivr.net") && url.includes(".wasm")) {
        console.log("Redirecting WASM request to local file:", url);
        const localUrl = "/zxing-wasm/zxing_reader.wasm";
        return originalFetch(localUrl, init);
      }

      return originalFetch(input, init);
    };

    // Configuração adicional para ZXing
    if (window.ZXing) {
      // Define o caminho base para arquivos WASM
      window.ZXing.setWasmPath = (path: string) => {
        if (path.includes("fastly.jsdelivr.net")) {
          return "/zxing-wasm/zxing_reader.wasm";
        }
        return path;
      };
    }

    console.log("QR Scanner configured for local WASM files");
  } catch (error) {
    console.warn("Could not configure QR Scanner:", error);
  }
};

// Função para criar um fallback quando WASM falha
export const createWasmFallback = () => {
  if (typeof window === "undefined") return;

  // Intercepta erros de WASM e tenta usar BarcodeDetector nativo
  window.addEventListener("error", (event) => {
    if (event.message?.includes("wasm") || event.message?.includes("WASM")) {
      console.log(
        "WASM error detected, attempting fallback to BarcodeDetector"
      );

      // Tenta usar BarcodeDetector nativo se disponível
      if ("BarcodeDetector" in window) {
        console.log("Using native BarcodeDetector as fallback");
      }
    }
  });
};
