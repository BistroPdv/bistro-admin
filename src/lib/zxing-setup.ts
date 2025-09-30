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
