// Worker para ZXing WASM
self.importScripts('https://unpkg.com/@zxing/library@latest/umd/index.min.js');

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'INIT':
      try {
        // Inicializa o ZXing
        const reader = new ZXing.BrowserMultiFormatReader();
        self.postMessage({ type: 'INIT_SUCCESS', reader });
      } catch (error) {
        self.postMessage({ type: 'INIT_ERROR', error: error.message });
      }
      break;
      
    case 'DECODE':
      try {
        // Processa a imagem para decodificar QR code
        const result = ZXing.BrowserMultiFormatReader.decodeFromImageData(data);
        self.postMessage({ type: 'DECODE_SUCCESS', result });
      } catch (error) {
        self.postMessage({ type: 'DECODE_ERROR', error: error.message });
      }
      break;
      
    default:
      self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
  }
};
