"use client";

import { PaginatedResult } from "@/@types/pagination";
import { Category } from "@/@types/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiDragMove2Line,
  RiKeyboardLine,
  RiQrScanLine,
  RiSettings3Line,
  RiShoppingCartLine,
  RiSubtractLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

// Componente SortableCategory
function SortableCategory({
  category,
  isSelected,
  onSelect,
}: {
  category: Category;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 touch-button touch-optimized min-h-[44px]"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded touch-button touch-optimized min-w-[44px] min-h-[44px] flex items-center justify-center drag-handle"
      >
        <RiDragMove2Line className="h-5 w-5 text-muted-foreground" />
      </div>
      <Button
        variant={isSelected ? "default" : "outline"}
        onClick={() => onSelect(category.id)}
        className="whitespace-nowrap touch-button touch-optimized text-sm flex-1 justify-start min-h-[44px]"
      >
        {category.nome}
      </Button>
    </div>
  );
}

export default function BuffetPage() {
  const [comandaNumber, setComandaNumber] = useState<string>("");
  const [isQrMode, setIsQrMode] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isComandaSet, setIsComandaSet] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [showCategoryOrderModal, setShowCategoryOrderModal] =
    useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [cameraPermissionDenied, setCameraPermissionDenied] =
    useState<boolean>(false);
  const [cameraInitializing, setCameraInitializing] = useState<boolean>(false);
  const [qrScanner, setQrScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Adicionar estilos para otimizar touch e responsividade
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .touch-optimized {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .touch-button {
        min-height: 48px;
        min-width: 48px;
        touch-action: manipulation;
      }
      .touch-card {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .drag-handle {
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
      }
      @media (max-width: 768px) {
        .touch-button {
          min-height: 56px;
          min-width: 56px;
        }
        .mobile-grid {
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .mobile-text {
          font-size: 14px;
        }
        .mobile-title {
          font-size: 18px;
        }
      }
      @media (max-width: 480px) {
        .mobile-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .mobile-full {
          width: 100%;
        }
        .mobile-stack {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Função para salvar ordenação no localStorage
  const saveCategoryOrder = (categories: Category[]) => {
    const orderIds = categories.map((cat) => cat.id);
    localStorage.setItem("buffet-category-order", JSON.stringify(orderIds));
  };

  // Função para carregar ordenação do localStorage
  const loadCategoryOrder = (categories: Category[]): Category[] => {
    try {
      const savedOrder = localStorage.getItem("buffet-category-order");
      if (savedOrder) {
        const orderIds: string[] = JSON.parse(savedOrder);
        const orderedCats = orderIds
          .map((id) => categories.find((cat) => cat.id === id))
          .filter(Boolean) as Category[];

        // Adicionar categorias que não estão na ordem salva
        const remainingCats = categories.filter(
          (cat) => !orderIds.includes(cat.id)
        );
        return [...orderedCats, ...remainingCats];
      }
    } catch (error) {
      console.error("Erro ao carregar ordenação das categorias:", error);
    }
    return categories;
  };

  // Buscar categorias e produtos
  const { data: categories, isLoading } = useQuery<
    AxiosResponse,
    Error,
    PaginatedResult<Category>
  >({
    queryKey: ["products"],
    queryFn: () => api.get(`/categorias?status=true`),
    select: (resp) => resp.data,
  });

  // Aplicar ordenação quando as categorias são carregadas
  useEffect(() => {
    if (categories?.data) {
      const ordered = loadCategoryOrder(categories.data);
      setOrderedCategories(ordered);
    }
  }, [categories?.data]);

  // Carregamento de WebRTC adapter no lado cliente
  useEffect(() => {
    const ensureWebRTCSetup = async () => {
      if (typeof window !== "undefined") {
        try {
          // Importa setup geral do webrtc
          const { setupWebRTC } = await import("@/lib/webrtc-setup");
          const isReady = await setupWebRTC();

          if (isReady) {
            console.log("WebRTC adapter set correctly");
          } else {
            console.warn("WebRTC adapter setup retried");
          }
        } catch (error) {
          console.warn("WebRTC setup failed:", error);
          // Fallback com import direto
          await import("webrtc-adapter").catch(() => {});
        }
      }
    };

    ensureWebRTCSetup();
  }, []);

  // Efect para resetear erros de câmera quando modo QR muda
  useEffect(() => {
    if (isQrMode) {
      setCameraError("");
      setCameraPermissionDenied(false);
      setCameraInitializing(true);
    } else {
      stopQrScanner();
    }
  }, [isQrMode]);

  // Inicializar scanner QR quando necessário
  useEffect(() => {
    if (
      isQrMode &&
      !cameraError &&
      !cameraPermissionDenied &&
      !isScannerActive &&
      !cameraInitializing
    ) {
      // Aguardar um pouco para garantir que o DOM está renderizado
      setTimeout(() => {
        initQrScanner();
      }, 1000);
    }
  }, [isQrMode, cameraError, cameraPermissionDenied, cameraInitializing]);

  // Cleanup para quando desmonta o componente
  useEffect(() => {
    return () => {
      stopQrScanner();
    };
  }, []);

  // Função para inicializar o scanner QR
  const initQrScanner = () => {
    if (!scannerRef.current || isScannerActive) return;

    try {
      // Aguardar um pouco para garantir que o DOM está estável
      const checkContainer = () => {
        const element =
          scannerRef.current || document.getElementById("qr-reader");
        if (!element) return false;

        // Verificar se o container tem dimensões válidas
        const rect = element.getBoundingClientRect();
        return rect.width > 100 && rect.height > 100;
      };

      if (!checkContainer()) {
        console.log("Container não está pronto, tentando novamente...");
        setTimeout(initQrScanner, 500);
        return;
      }

      const config = {
        fps: 5, // FPS adequado para detecção contínua
        qrbox: function (viewfinderWidth: number, viewfinderHeight: number) {
          // Garantir que as dimensões são válidas
          const validWidth = Math.max(viewfinderWidth || 250, 100);
          const validHeight = Math.max(viewfinderHeight || 250, 100);

          const minEdgePercentage = 0.7; // 70% da menor dimensão
          const minEdgeSize = Math.min(validWidth, validHeight);
          const qrboxSize = Math.floor(
            Math.max(minEdgeSize * minEdgePercentage, 200)
          );

          return {
            width: Math.min(qrboxSize, validWidth * 0.8),
            height: Math.min(qrboxSize, validHeight * 0.8),
          };
        },
        aspectRatio: 1.0,
      };

      const elementId = "qr-reader";

      // Limpar qualquer scanner anterior
      if (qrScanner) {
        try {
          qrScanner.clear();
        } catch (e) {
          console.warn("Erro ao limpar scanner anterior:", e);
        }
      }

      const scanner = new Html5QrcodeScanner(
        elementId,
        config,
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // Scanner sempre ativo - só processa quando encontra QR code
          console.log("QR Code detectado:", decodedText);
          setComandaNumber(decodedText);
          setIsComandaSet(true);
          setCameraError("");
          setCameraPermissionDenied(false);
          setIsScannerActive(false);
          toast.success(`Comanda ${decodedText} identificada!`);
          try {
            scanner.clear();
          } catch (e) {
            console.warn("Erro ao limpar scanner:", e);
          }
        },
        (error: any) => {
          // Ignorar apenas erros de "QR code não encontrado"
          // Scanner mantém ativo para continuar tentando
          const errorMsg =
            typeof error === "string" ? error : error?.message || "";

          // Se não é erro de QR não encontrado, informar
          if (
            errorMsg &&
            !errorMsg.includes("No QR code found") &&
            !errorMsg.includes("NotFoundException") &&
            !errorMsg.includes("QR code not found")
          ) {
            console.log("Erro não crítico de scanner:", errorMsg);
            handleQrScanError(error);
          }
          // Para erros de "QR code not found" - scanner continua normal
        }
      );

      setQrScanner(scanner);
      setIsScannerActive(true);
      setIsCameraReady(true);
      setCameraInitializing(false);
      console.log("Scanner QR ativo e aguardando QR code...");
    } catch (error) {
      console.error("Erro ao inicializar scanner:", error);
      setCameraError("Erro ao inicializar a câmera");
      setCameraInitializing(false);
      setIsScannerActive(false);
    }
  };

  // Função para parar o scanner QR
  const stopQrScanner = () => {
    if (qrScanner) {
      try {
        qrScanner.clear();
      } catch (error) {
        console.warn("Error clearing scanner:", error);
        // Força limpeza se clear falhou
        const element =
          scannerRef.current || document.getElementById("qr-reader");
        if (element) {
          element.innerHTML = "";
        }
      }
      setQrScanner(null);
    }
    setIsScannerActive(false);
  };

  // Reset de câmara quando necessário
  const resetCamera = () => {
    console.log("Resetting camera...");

    // Para e limpa o scanner atual
    stopQrScanner();

    // Reseta todos os estados de erro
    setCameraError("");
    setCameraPermissionDenied(false);
    setCameraInitializing(true);

    // Delay adequado para total resete
    setTimeout(() => {
      setCameraInitializing(false);
      if (isQrMode) {
        initQrScanner();
      }
    }, 1000);
  };

  // Função para tratamento de erros do QR scanner html5-qrcode
  const handleQrScanError = (error: any) => {
    console.error("QR Scanner error:", error);

    // Verificar tipos de erro específicos do html5-qrcode
    if (
      error?.message?.includes("Permission denied") ||
      error?.message?.includes("NotAllowedError") ||
      error?.name === "NotAllowedError"
    ) {
      setCameraPermissionDenied(true);
      setCameraError(
        "Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador."
      );
      toast.error("Permissão da câmera necessária");
      return;
    }

    if (
      error?.message?.includes("NotFoundError") ||
      error?.name === "NotFoundError"
    ) {
      setCameraError("Câmera não encontrada");
      setIsScannerActive(false);
      stopQrScanner();
      return;
    }

    // Verificar se é um erro de stream interrompido
    if (
      error?.message?.includes("stream") ||
      error?.message?.includes("Stream") ||
      error?.message?.includes("Camera access denied")
    ) {
      setCameraError(
        "Problema com o stream da câmera. Toque em 'Tentar Novamente' para continuar."
      );
      setIsScannerActive(false);
      stopQrScanner();
      return;
    }

    // Para outros erros genéricos
    const errorMsg = error?.message || error?.toString() || "Erro na leitura";
    if (errorMsg && !errorMsg.includes("No QR code found")) {
      console.log("Camera error occurred:", errorMsg);
      setCameraError(`Erro na câmera: ${errorMsg}`);
      setIsScannerActive(false);
      stopQrScanner();
    }
  };

  const handleManualInput = () => {
    if (comandaNumber.trim()) {
      setIsComandaSet(true);
      toast.success(`Comanda ${comandaNumber} definida!`);
    } else {
      toast.error("Digite um número de comanda válido");
    }
  };

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          nome: product.nome,
          preco: parseFloat(product.preco),
          quantidade: 1,
          imagem: product.imagem,
        },
      ]);
    }
    toast.success(`${product.nome} adicionado ao carrinho!`);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantidade: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.success("Item removido do carrinho!");
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    );
  };

  const handleFinalizeOrder = () => {
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho primeiro!");
      return;
    }

    // Aqui você implementaria a lógica para enviar o pedido
    toast.success("Pedido finalizado com sucesso!");
    setCart([]);
    setComandaNumber("");
    setIsComandaSet(false);
    setShowCart(false); // Fechar modal do carrinho se estava aberto
  };

  const resetComanda = () => {
    setComandaNumber("");
    setIsComandaSet(false);
    setCart([]);
    setShowCart(false);
  };

  // Configurar sensores para drag and drop otimizado para touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para melhor resposta em touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedCategories.findIndex(
        (cat) => cat.id === active.id
      );
      const newIndex = orderedCategories.findIndex((cat) => cat.id === over.id);

      const newOrderedCategories = arrayMove(
        orderedCategories,
        oldIndex,
        newIndex
      );
      setOrderedCategories(newOrderedCategories);
      saveCategoryOrder(newOrderedCategories);

      toast.success("Ordem das categorias atualizada!");
    }
  };

  if (!isComandaSet) {
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
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-muted-foreground text-xs font-medium">
                            <RiQrScanLine className="h-3 w-3" />
                            Posicione o QR code na câmera
                          </div>
                        </div>
                        <div className="relative w-full h-40 md:h-44 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-inner">
                          {cameraError || cameraPermissionDenied ? (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <div className="text-center text-white bg-black/50 rounded-lg p-4 max-w-xs">
                                <RiQrScanLine className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm font-medium mb-1">
                                  {cameraPermissionDenied
                                    ? "Acesso à câmera necessário"
                                    : "Problema com a câmera"}
                                </p>
                                {cameraPermissionDenied && (
                                  <p className="text-xs text-white/80">
                                    Clique no ícone da câmera no navegador e
                                    permita o acesso
                                  </p>
                                )}
                                {cameraError && !cameraPermissionDenied && (
                                  <>
                                    <p className="text-xs text-white/80 mb-3">
                                      {cameraError}
                                    </p>
                                    <button
                                      onClick={resetCamera}
                                      className="px-3 py-1.5 bg-primary/80 hover:bg-primary text-white text-xs rounded transition-colors"
                                    >
                                      Tentar Novamente
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 border-2 border-white/30 rounded-lg animate-pulse"></div>
                              </div>
                              <div
                                ref={scannerRef}
                                id="qr-reader"
                                className="absolute inset-0 w-full h-full"
                                style={{
                                  minWidth: "100%",
                                  minHeight: "160px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              />
                            </>
                          )}
                        </div>
                        <div className="text-center text-xs text-muted-foreground">
                          Aponte a câmera para o QR code
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
                            className="text-lg text-center py-3 flex-1 border-2 focus:border-primary transition-colors"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleManualInput()
                            }
                          />
                          <Button
                            size="sm"
                            onClick={handleManualInput}
                            className="px-4 py-3 touch-button touch-optimized bg-primary hover:bg-primary/90 shadow-lg"
                          >
                            <RiCheckLine className="h-5 w-5" />
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
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-primary font-semibold text-sm">
                        Comanda #{comandaNumber} identificada
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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com informações da comanda */}
      <div className="flex-none bg-primary text-primary-foreground p-3 md:p-4 rounded-lg mb-3 md:mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold truncate">
              Comanda #{comandaNumber}
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              Selecione os produtos desejados
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={resetComanda}
            className="bg-white/20 text-white hover:bg-white/30 touch-button touch-optimized flex-shrink-0 text-sm md:text-base px-3 md:px-4 py-2"
          >
            Nova Comanda
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 overflow-hidden pb-20 lg:pb-0">
        {/* Lista de Produtos */}
        <div className="flex-1 flex flex-col min-h-0 lg:min-w-0">
          <div className="flex-none mb-3 md:mb-4 relative">
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Produtos Disponíveis
            </h2>

            {/* Filtro por categoria */}
            <div className="flex gap-2 overflow-x-auto pb-2 last:mr-14">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className="whitespace-nowrap touch-button touch-optimized text-sm"
              >
                Todas
              </Button>
              {orderedCategories?.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap touch-button touch-optimized text-sm"
                >
                  {category.nome}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setShowCategoryOrderModal(true)}
                className="whitespace-nowrap absolute right-0 touch-button touch-optimized text-sm flex-shrink-0"
                title="Configurar ordem das categorias"
              >
                <RiSettings3Line className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 p-1 mobile-grid">
                {orderedCategories
                  ?.filter(
                    (category) =>
                      !selectedCategory || category.id === selectedCategory
                  )
                  ?.map((category) =>
                    category.produtos?.map((product) => (
                      <Card
                        key={product.id}
                        className="hover:shadow-lg transition-shadow touch-card touch-optimized"
                      >
                        <CardContent className="p-3 md:p-4">
                          {product.imagem && (
                            <div className="w-full h-24 md:h-32 bg-gray-100 rounded-lg mb-2 md:mb-3 overflow-hidden">
                              <img
                                src={product.imagem}
                                alt={product.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
                            {product.nome}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg md:text-xl font-bold text-primary">
                              R$ {Number(product.preco).toFixed(2)}
                            </span>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              className="bg-primary hover:bg-primary/90 touch-button touch-optimized"
                              size="sm"
                            >
                              <RiAddLine className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span className="hidden sm:inline">
                                Adicionar
                              </span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Botão flutuante do carrinho no mobile */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setShowCart(true)}
              className="h-14 w-14 rounded-full shadow-lg touch-button touch-optimized"
              size="lg"
            >
              <RiShoppingCartLine className="h-6 w-6" />
              <Badge
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                variant="destructive"
              >
                {cart.length}
              </Badge>
            </Button>
          </div>
        )}

        {/* Carrinho - Desktop e Modal Mobile */}
        <div
          className={`${
            !showCart ? "hidden lg:flex" : "fixed"
          } lg:relative h-[95%] top-0 left-0 right-0 bottom-0 lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto bg-white dark:bg-gray-900 z-40 lg:z-auto w-full lg:w-80 flex flex-col min-h-0 lg:min-h-0`}
        >
          {showCart && (
            <div className="lg:hidden absolute top-4 right-4">
              <Button
                onClick={() => setShowCart(false)}
                variant="outline"
                size="sm"
                className="rounded-full h-8 w-8 p-0 touch-button touch-optimized"
              >
                <RiCloseLine className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              showCart ? "h-full" : ""
            }`}
          >
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <RiShoppingCartLine className="h-4 w-4 md:h-5 md:w-5" />
                Carrinho ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
                  <div className="text-center">
                    <RiShoppingCartLine className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-h-0 px-2">
                    <ScrollArea className="h-full">
                      <div className="space-y-1.5 pr-1 pb-1">
                        {cart.map((item) => (
                          <Card key={item.id} className="p-1.5">
                            <div className="flex items-center gap-2">
                              {item.imagem && (
                                <img
                                  src={item.imagem}
                                  className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://www.unirg.edu.br/imagens/noticia_padrao.png";
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm mb-1 line-clamp-2">
                                  {item.nome}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  R$ {Number(item.preco).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        item.id,
                                        item.quantidade + 1
                                      )
                                    }
                                    className="h-6 w-6 p-0 touch-button touch-optimized"
                                  >
                                    <RiAddLine className="h-3 w-3" />
                                  </Button>
                                  <div className="text-xs font-bold bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 min-w-[20px] text-center">
                                    {item.quantidade}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        item.id,
                                        item.quantidade - 1
                                      )
                                    }
                                    className="h-6 w-6 p-0 touch-button touch-optimized"
                                  >
                                    <RiSubtractLine className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="px-2 pb-2">
                    <Separator className="my-2" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-base md:text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">
                          R$ {getTotalPrice().toFixed(2)}
                        </span>
                      </div>

                      <Button
                        onClick={handleFinalizeOrder}
                        className="w-full py-3 md:py-4 text-base md:text-lg touch-button touch-optimized"
                        size="lg"
                      >
                        <RiCheckLine className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                        Finalizar Pedido
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Configuração da Ordem das Categorias */}
      <Dialog
        open={showCategoryOrderModal}
        onOpenChange={setShowCategoryOrderModal}
      >
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configurar Ordem das Categorias</DialogTitle>
            <DialogDescription>
              Arraste e solte as categorias para reordená-las conforme sua
              preferência
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedCategories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {orderedCategories.map((category) => (
                      <SortableCategory
                        key={category.id}
                        category={category}
                        isSelected={false}
                        onSelect={() => {}}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCategoryOrderModal(false)}
              className="touch-button touch-optimized"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
