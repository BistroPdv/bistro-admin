// Configuração para ZXing WASM em produção
export const setupZXing = async () => {
  if (typeof window === "undefined") return;

  try {
    // Importa e configura o ZXing
    const { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } =
      await import("@zxing/library");

    // Configura o leitor para usar WASM
    const reader = new BrowserMultiFormatReader();

    // Configurações específicas para produção
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    return reader;
  } catch (error) {
    console.error("Erro ao configurar ZXing:", error);
    return null;
  }
};

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

// Função para carregar arquivos WASM manualmente se necessário
export const loadWasmFiles = async () => {
  if (typeof window === "undefined") return false;

  try {
    // Tenta carregar os arquivos WASM do ZXing
    const wasmUrl = "/_next/static/chunks/zxing.wasm";
    const response = await fetch(wasmUrl);

    if (response.ok) {
      const wasmBuffer = await response.arrayBuffer();
      console.log("WASM files loaded successfully");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro ao carregar arquivos WASM:", error);
    return false;
  }
};
