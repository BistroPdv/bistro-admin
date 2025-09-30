import { PaginatedResult } from "@/@types/pagination";
import { Category } from "@/@types/products";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export interface OrderItem {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface CreateOrderRequest {
  comandaId: string;
  itens: OrderItem[];
  total: number;
  observacoes?: string;
}

export const useBuffetLogic = () => {
  const [comandaNumber, setComandaNumber] = useState<string>("");
  const [comandaId, setComandaId] = useState<string>("");
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
  const [validatingComanda, setValidatingComanda] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const [isFormFactorMobile, setIsFormFactorMobile] = useState(false);

  // Estilos para otimizar touch e responsividade
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

  const getAspectRatio = () => {
    // const FOR_MOBILE_ASPECT_RATIO = 4/3;
    const FOR_MOBILE_ASPECT_RATIO = 16 / 9;
    const FOR_DESKTOP_ASPECT_RATIO = 4 / 3;

    return isFormFactorMobile
      ? FOR_MOBILE_ASPECT_RATIO
      : FOR_DESKTOP_ASPECT_RATIO;
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
          const { setupWebRTC } = await import("@/lib/webrtc-setup");
          const isReady = await setupWebRTC();

          if (isReady) {
            console.log("WebRTC adapter set correctly");
          } else {
            console.warn("WebRTC adapter setup retried");
          }
        } catch (error) {
          console.warn("WebRTC setup failed:", error);
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
      setCameraInitializing(false);
      setTimeout(() => initQrScanner(), 50);
    } else {
      stopQrScanner();
    }
  }, [isQrMode]);

  // Backup initialization in case the previous one fails
  useEffect(() => {
    if (
      isQrMode &&
      !cameraError &&
      !cameraPermissionDenied &&
      !isScannerActive
    ) {
      const timeoutId = setTimeout(() => {
        if (isQrMode && !isScannerActive) {
          initQrScanner();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isQrMode, cameraError, cameraPermissionDenied, isScannerActive]);

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
      const checkContainer = () => {
        const element =
          scannerRef.current || document.getElementById("qr-reader");
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 100 && rect.height > 100;
      };

      if (!checkContainer()) {
        console.log("Container não está pronto, tentando novamente...");
        setTimeout(initQrScanner, 100);
        return;
      }

      const qrboxFunction = (
        viewfinderWidth: number,
        viewfinderHeight: number
      ) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxEdgeSize = Math.floor(minEdge * 0.75);
        return { width: qrboxEdgeSize, height: qrboxEdgeSize };
      };

      const config = {
        fps: 10,
        qrbox: qrboxFunction,
        aspectRatio: getAspectRatio(),
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 1.5,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], // só QR
      };

      const elementId = "qr-reader";

      if (qrScanner) {
        try {
          qrScanner.clear();
        } catch (e) {
          console.warn("Erro ao limpar scanner anterior:", e);
        }
      }

      const scanner = new Html5QrcodeScanner(elementId, config, false);

      scanner.render(
        async (decodedText) => {
          setComandaNumber(decodedText);
          setCameraError("");
          setCameraPermissionDenied(false);
          setIsScannerActive(false);

          try {
            await scanner.clear();
          } catch (e) {
            console.warn("Erro ao limpar scanner:", e);
          }

          const isValid = await validateComanda(decodedText);
          if (isValid) setIsComandaSet(true);
          else setComandaNumber("");
        },
        (error: any) => {
          const errorMsg =
            typeof error === "string" ? error : error?.message || "";

          // Ignora erros normais de não detecção
          if (
            errorMsg.includes("No QR code found") ||
            errorMsg.includes("multformat readers") ||
            errorMsg.includes("no multformat readers")
          )
            return;

          // Só loga erros críticos
          console.error("Erro real do scanner:", errorMsg);
          handleQrScanError(error);
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

    stopQrScanner();
    setCameraError("");
    setCameraPermissionDenied(false);
    setCameraInitializing(true);

    setTimeout(() => {
      setCameraInitializing(false);
      if (isQrMode) {
        initQrScanner();
      }
    }, 1000);
  };

  useEffect(() => {
    // Função para checar se é mobile pelo tamanho da tela
    const checkMobile = () => {
      // Você pode ajustar o breakpoint conforme necessário
      setIsFormFactorMobile(window.innerWidth <= 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Função para tratamento de erros do QR scanner html5-qrcode
  const handleQrScanError = (error: any) => {
    console.error("QR Scanner error:", error);

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

    const errorMsg = error?.message || error?.toString() || "Erro na leitura";
    if (
      errorMsg?.includes("multformat readers") ||
      errorMsg?.includes("no multformat readers") ||
      errorMsg?.includes("unable to detect") ||
      errorMsg?.includes("No readers available")
    ) {
      setCameraError(
        "Câmera não conseguiu inicializar corretamente. Tente novamente."
      );
      setIsScannerActive(false);
      stopQrScanner();

      setTimeout(() => {
        if (isQrMode && !isScannerActive) {
          console.log("Auto-retrying scanner após erro multformat...");
          initQrScanner();
        }
      }, 2000);
      return;
    }

    if (errorMsg && !errorMsg.includes("No QR code found")) {
      console.log("Camera error occurred:", errorMsg);
      setCameraError(`Erro na câmera: ${errorMsg}`);
      setIsScannerActive(false);
      stopQrScanner();
    }
  };

  const handleManualInput = async () => {
    if (comandaNumber.trim()) {
      const isValid = await validateComanda(comandaNumber.trim());
      if (isValid) {
        setIsComandaSet(true);
      }
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

  const handleFinalizeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho primeiro!");
      return;
    }

    if (!comandaId) {
      toast.error(
        "Erro: ID da comanda não encontrado. Tente validar a comanda novamente."
      );
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Converter carrinho para o formato de order items
      const itens = cart.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.preco,
      }));

      const orderData: CreateOrderRequest = {
        comandaId: comandaId,
        itens: itens,
        total: getTotalPrice(),
        observacoes: undefined, // Pode ser implementado no futuro
      };

      const response = await api.post("/pedidos", orderData);

      toast.success("Pedido criado com sucesso!");

      // Reset do estado após sucesso
      setCart([]);
      setComandaNumber("");
      setComandaId("");
      setIsComandaSet(false);
      setShowCart(false);

      console.log("Pedido criado:", response.data);
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);

      if (error.response?.status === 400) {
        toast.error(
          "Dados do pedido inválidos. Verifique os produtos selecionados."
        );
      } else if (error.response?.status === 404) {
        toast.error("Comanda não encontrada. Tente validar novamente.");
      } else if (error.response?.status === 401) {
        toast.error("Erro de autorização. Verifique sua sessão.");
      } else {
        toast.error("Erro ao criar pedido. Tente novamente.");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const resetComanda = () => {
    setComandaNumber("");
    setComandaId("");
    setIsComandaSet(false);
    setCart([]);
    setShowCart(false);
  };

  // Função para validar se a comanda existe na API
  const validateComanda = async (numeroComanda: string): Promise<boolean> => {
    setValidatingComanda(true);

    try {
      const response = await api.get(`/commanded/${numeroComanda}`);

      if (response.data && response.data.ativo !== false) {
        // Armazenar o ID da comanda retornado pela API
        setComandaId(response.data.id);
        toast.success(`Comanda ${numeroComanda} validada com sucesso!`);
        return true;
      } else {
        toast.error(`Comanda ${numeroComanda} não está ativa ou não existe.`);
        return false;
      }
    } catch (error: any) {
      console.error("Erro ao validar comanda:", error);

      if (error.response?.status === 404) {
        toast.error(
          "Comanda não encontrada. Verifique se o número está correto."
        );
      } else if (error.response?.status === 401) {
        toast.error("Erro de autorização. Tente novamente.");
      } else {
        toast.error("Erro ao validar comanda. Tente novamente.");
      }

      return false;
    } finally {
      setValidatingComanda(false);
    }
  };

  return {
    // Estados
    comandaNumber,
    setComandaNumber,
    isQrMode,
    setIsQrMode,
    cart,
    setCart,
    isComandaSet,
    setIsComandaSet,
    selectedCategory,
    setSelectedCategory,
    showCart,
    setShowCart,
    orderedCategories,
    setOrderedCategories,
    showCategoryOrderModal,
    setShowCategoryOrderModal,
    cameraError,
    cameraPermissionDenied,
    cameraInitializing,
    isScannerActive,
    isCameraReady,
    scannerRef,
    categories,
    isLoading,
    validatingComanda,
    isCreatingOrder,
    isFormFactorMobile,
    setIsFormFactorMobile,
    // Funções
    handleManualInput,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    getTotalPrice,
    handleFinalizeOrder,
    resetComanda,
    resetCamera,
    initQrScanner,
    stopQrScanner,
    saveCategoryOrder,
    loadCategoryOrder,
    validateComanda,
  };
};
