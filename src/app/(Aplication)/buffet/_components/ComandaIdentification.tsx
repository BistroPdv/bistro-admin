"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RiCheckLine, RiKeyboardLine, RiQrScanLine } from "@remixicon/react";
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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-start justify-center px-4 py-4">
        <div className="w-full max-w-xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg md:text-xl">
                Identificar Comanda
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Escolha uma das opções abaixo para continuar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Layout em flex-row para aproveitar espaço lateral */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Botões de seleção */}
                <div className="flex flex-row  lg:flex-col justify-center lg:justify-start gap-2 lg:w-32">
                  <Button
                    variant={isQrMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQrMode(true)}
                    className={`flex items-center max-w-24 gap-2 text-sm px-3 py-2 touch-button touch-optimized transition-all duration-200 w-full lg:w-full ${
                      isQrMode
                        ? "bg-primary hover:bg-primary/90 shadow-lg"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <RiQrScanLine className="h-4 w-4" />
                    <span className="hidden sm:inline">QR Code</span>
                    <span className="sm:hidden">QR</span>
                  </Button>
                  <Button
                    variant={!isQrMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQrMode(false)}
                    className={`flex max-w-24 items-center gap-2 text-sm px-3 py-2 touch-button touch-optimized transition-all duration-200 w-full lg:w-full ${
                      !isQrMode
                        ? "bg-primary hover:bg-primary/90 shadow-lg"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <RiKeyboardLine className="h-4 w-4" />
                    <span className="hidden sm:inline">Digitar</span>
                    <span className="sm:hidden">#</span>
                  </Button>
                </div>

                {/* Área principal */}
                <div className="flex-1">
                  {isQrMode ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-muted-foreground text-xs font-medium">
                          <RiQrScanLine className="h-3 w-3" />
                          Scanner QR Code Ativo
                        </div>
                      </div>

                      {/* Scanner QR em tela cheia/maior */}
                      <div className="relative w-full min-h-[290px] md:h-[290px] bg-black rounded-xl overflow-hidden shadow-xl border-2 border-primary/20">
                        {cameraError || cameraPermissionDenied ? (
                          <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="text-center text-white bg-black/80 rounded-xl p-6 max-w-sm">
                              <RiQrScanLine className="h-12 w-12 mx-auto mb-4 text-primary" />
                              <p className="text-lg font-medium mb-2">
                                {cameraPermissionDenied
                                  ? "Permissão da câmera necessária"
                                  : "Problema com a câmera"}
                              </p>
                              {cameraPermissionDenied && (
                                <p className="text-sm text-white/80 mb-4">
                                  Permita o acesso à câmera no navegador para
                                  continuar
                                </p>
                              )}
                              {cameraError && !cameraPermissionDenied && (
                                <>
                                  <p className="text-sm text-white/80 mb-4">
                                    {cameraError}
                                  </p>
                                  <button
                                    onClick={resetCamera}
                                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors font-medium"
                                  >
                                    <RiQrScanLine className="inline h-4 w-4 mr-2" />
                                    Reiniciar Scanner
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Scanner
                            onScan={handleScan}
                            onError={onQrError}
                            constraints={{
                              facingMode: "environment",
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
                        )}
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-primary font-medium text-sm">
                            Aponte para o QR code
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-muted-foreground text-xs font-medium">
                          <RiKeyboardLine className="h-3 w-3" />
                          Digite o número da comanda
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Input
                          type="number"
                          placeholder="Ex: 123"
                          value={comandaNumber}
                          onChange={(e) => setComandaNumber(e.target.value)}
                          disabled={validatingComanda}
                          className="text-lg text-center py-3 flex-1 border-2 focus:border-primary transition-colors"
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
                          className="px-4 py-3 touch-button touch-optimized bg-primary hover:bg-primary/90 shadow-lg"
                        >
                          {validatingComanda ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <RiCheckLine className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <div className="text-center text-xs text-muted-foreground">
                        Digite o número da sua comanda
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {comandaNumber && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    {validatingComanda ? (
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    )}
                    <span className="text-primary font-semibold text-sm">
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
