"use client";

import { Button } from "@/components/ui/button";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Cart } from "./_components/Cart";
import { CategoryOrderModal } from "./_components/CategoryOrderModal";
import { ComandaIdentification } from "./_components/ComandaIdentification";
import { ProductsList } from "./_components/ProductsList";
import { useBuffetLogic } from "./_components/useBuffetLogic";

export default function BuffetPage() {
  const {
    // Estados
    comandaNumber,
    setComandaNumber,
    isQrMode,
    setIsQrMode,
    cart,
    isComandaSet,
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
    isLoading,
    validatingComanda,
    isCreatingOrder,
    devices,
    selectedCameraId,
    getCurrentCameraName,

    // Funções
    handleManualInput,
    handleAddToCart,
    handleUpdateQuantity,
    getTotalPrice,
    handleFinalizeOrder,
    resetComanda,
    resetCamera,
    handleQrResult,
    handleQrError,
    toggleCamera,
  } = useBuffetLogic();

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && orderedCategories) {
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

      toast.success("Ordem das categorias atualizada!");
    }
  };

  if (!isComandaSet) {
    return (
      <ComandaIdentification
        isQrMode={isQrMode}
        setIsQrMode={setIsQrMode}
        comandaNumber={comandaNumber}
        setComandaNumber={setComandaNumber}
        onManualInput={handleManualInput}
        cameraError={cameraError}
        cameraPermissionDenied={cameraPermissionDenied}
        resetCamera={resetCamera}
        validatingComanda={validatingComanda}
        onQrResult={handleQrResult}
        onQrError={handleQrError}
        devices={devices}
        selectedCameraId={selectedCameraId}
        getCurrentCameraName={getCurrentCameraName}
        onToggleCamera={toggleCamera}
      />
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
        <ProductsList
          orderedCategories={orderedCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onShowCategoryOrderModal={() => setShowCategoryOrderModal(true)}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
        />

        {/* Carrinho */}
        <Cart
          cart={cart}
          showCart={showCart}
          onCloseCart={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onFinalizeOrder={handleFinalizeOrder}
          getTotalPrice={getTotalPrice}
          isCreatingOrder={isCreatingOrder}
        />
      </div>

      {/* Modal de Configuração da Ordem das Categorias */}
      <CategoryOrderModal
        isOpen={showCategoryOrderModal}
        onClose={() => setShowCategoryOrderModal(false)}
        orderedCategories={orderedCategories || []}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
}
