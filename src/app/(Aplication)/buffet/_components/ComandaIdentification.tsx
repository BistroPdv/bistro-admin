"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  RiCameraSwitchLine,
  RiCheckLine,
  RiKeyboardLine,
  RiQrScanLine,
} from "@remixicon/react";
import { Scanner } from "@yudiel/react-qr-scanner";

import { IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface ComandaIdentificationProps {
  isQrMode: boolean;
  setIsQrMode: (mode: boolean) => void;
  comandaNumber: string;
  setComandaNumber: (number: string) => void;
  onManualInput: () => void;
  cameraError: string;
  cameraPermissionDenied: boolean;
  resetCamera: () => void;
  validatingComanda?: boolean;
  onQrResult: (result: string) => void;
  onQrError: (error: any) => void;
  devices: any[];
  selectedCameraId: string;
  getCurrentCameraName: () => string;
  onToggleCamera: () => void;
  onCheckPermissions: () => Promise<boolean>;
}

export const ComandaIdentification = ({
  isQrMode,
  setIsQrMode,
  comandaNumber,
  setComandaNumber,
  onManualInput,
  cameraError,
  cameraPermissionDenied,
  resetCamera,
  validatingComanda,
  onQrResult,
  onQrError,
  devices,
  selectedCameraId,
  getCurrentCameraName,
  onToggleCamera,
  onCheckPermissions,
}: ComandaIdentificationProps) => {
  // Função para lidar com os códigos detectados
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      // Pega o primeiro código detectado
      const firstCode = detectedCodes[0];
      onQrResult(firstCode.rawValue);
    }
  };
  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <Card className="shadow-xl w-full">
            <CardHeader className="text-center pb-2 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">
                Identificar Comanda
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Escolha uma das opções abaixo para continuar
              </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              {/* Layout responsivo */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4">
                {/* Botões de seleção */}
                <div className="flex flex-row sm:flex-col lg:flex-col justify-center sm:justify-start lg:justify-start gap-2 sm:gap-3 lg:w-32">
                  <Button
                    variant={isQrMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQrMode(true)}
                    className={`flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 touch-button touch-optimized transition-all duration-200 w-full sm:w-auto lg:w-full min-h-[44px] sm:min-h-[40px] ${
                      isQrMode
                        ? "bg-primary hover:bg-primary/90 shadow-lg"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <RiQrScanLine className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">QR Code</span>
                    <span className="xs:hidden sm:hidden">QR</span>
                  </Button>
                  <Button
                    variant={!isQrMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQrMode(false)}
                    className={`flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 touch-button touch-optimized transition-all duration-200 w-full sm:w-auto lg:w-full min-h-[44px] sm:min-h-[40px] ${
                      !isQrMode
                        ? "bg-primary hover:bg-primary/90 shadow-lg"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <RiKeyboardLine className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">Digitar</span>
                    <span className="xs:hidden sm:hidden">#</span>
                  </Button>
                </div>

                {/* Área principal */}
                <div className="flex-1">
                  {isQrMode ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-full text-muted-foreground text-xs font-medium">
                          <RiQrScanLine className="h-3 w-3" />
                          <span className="hidden xs:inline">
                            Scanner QR Code Ativo
                          </span>
                          <span className="xs:hidden">Scanner Ativo</span>
                        </div>
                        {devices && devices.length > 1 && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={onToggleCamera}
                              className="flex items-center gap-1 sm:gap-2 text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-auto min-h-[36px]"
                            >
                              <RiCameraSwitchLine className="h-3 w-3" />
                              <span className="truncate max-w-[120px] sm:max-w-none">
                                {getCurrentCameraName()}
                              </span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Scanner QR responsivo */}
                      <div className="relative w-full min-h-[200px] xs:min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[350px] bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 border-primary/20">
                        {cameraError || cameraPermissionDenied ? (
                          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                            <div className="text-center text-white bg-black/80 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-sm mx-2">
                              <RiQrScanLine className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                              <p className="text-sm sm:text-lg font-medium mb-2">
                                {cameraPermissionDenied
                                  ? "Permissão da câmera necessária"
                                  : "Problema com a câmera"}
                              </p>
                              {cameraPermissionDenied && (
                                <div className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 px-2">
                                  <p className="mb-2">
                                    <strong>
                                      Para permitir o acesso à câmera:
                                    </strong>
                                  </p>
                                  <ol className="text-left space-y-1 text-xs">
                                    <li>
                                      1. Clique no ícone de cadeado 🔒 na barra
                                      de endereço
                                    </li>
                                    <li>2. Selecione "Permitir" para câmera</li>
                                    <li>
                                      3. Recarregue a página se necessário
                                    </li>
                                  </ol>
                                </div>
                              )}
                              {cameraError && !cameraPermissionDenied && (
                                <>
                                  <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 px-2">
                                    {cameraError}
                                  </p>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={resetCamera}
                                      className="px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm rounded-lg transition-colors font-medium min-h-[40px] sm:min-h-[44px]"
                                    >
                                      <RiQrScanLine className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                      <span className="hidden xs:inline">
                                        Reiniciar Scanner
                                      </span>
                                      <span className="xs:hidden">
                                        Reiniciar
                                      </span>
                                    </button>
                                    <button
                                      onClick={onCheckPermissions}
                                      className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors font-medium min-h-[40px] sm:min-h-[44px]"
                                    >
                                      Verificar Permissões
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full">
                            <Scanner
                              onScan={handleScan}
                              onError={onQrError}
                              constraints={{
                                deviceId: selectedCameraId
                                  ? { exact: selectedCameraId }
                                  : undefined,
                                facingMode: selectedCameraId
                                  ? undefined
                                  : "environment",
                              }}
                              styles={{
                                container: {
                                  width: "100%",
                                  height: "100%",
                                },
                                video: {
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                },
                              }}
                            />
                            {/* Fallback para quando WASM não carregar */}
                            <div className="absolute bottom-2 right-2 text-xs text-white/60">
                              {cameraError.includes("WASM") && (
                                <div className="bg-red-500/80 px-2 py-1 rounded text-white text-xs">
                                  WASM não carregado
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-primary font-medium text-xs sm:text-sm">
                            <span className="hidden xs:inline">
                              Aponte para o QR code
                            </span>
                            <span className="xs:hidden">Aponte para o QR</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-full text-muted-foreground text-xs font-medium">
                          <RiKeyboardLine className="h-3 w-3" />
                          <span className="hidden xs:inline">
                            Digite o número da comanda
                          </span>
                          <span className="xs:hidden">Digite o número</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Input
                          type="number"
                          placeholder="Ex: 123"
                          value={comandaNumber}
                          onChange={(e) => setComandaNumber(e.target.value)}
                          disabled={validatingComanda}
                          className="text-base sm:text-lg text-center py-2.5 sm:py-3 flex-1 border-2 focus:border-primary transition-colors min-h-[44px] sm:min-h-[48px]"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            !validatingComanda &&
                            onManualInput()
                          }
                        />
                        <Button
                          size="sm"
                          onClick={onManualInput}
                          disabled={validatingComanda}
                          className="px-3 sm:px-4 py-2.5 sm:py-3 touch-button touch-optimized bg-primary hover:bg-primary/90 shadow-lg min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px]"
                        >
                          {validatingComanda ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <RiCheckLine className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </Button>
                      </div>
                      <div className="text-center text-xs text-muted-foreground px-2">
                        <span className="hidden xs:inline">
                          Digite o número da sua comanda
                        </span>
                        <span className="xs:hidden">
                          Digite o número da comanda
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {comandaNumber && (
                <div className="text-center px-2">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
                    {validatingComanda ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                    )}
                    <span className="text-primary font-semibold text-xs sm:text-sm">
                      {validatingComanda
                        ? "Validando comanda #" + comandaNumber
                        : "Comanda #" + comandaNumber + " identificada"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
