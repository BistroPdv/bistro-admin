"use client";

import { Category } from "@/@types/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiAddLine, RiSettings3Line } from "@remixicon/react";

interface ProductsListProps {
  orderedCategories?: Category[];
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  onShowCategoryOrderModal: () => void;
  onAddToCart: (product: any) => void;
  isLoading?: boolean;
}

export const ProductsList = ({
  orderedCategories,
  selectedCategory,
  setSelectedCategory,
  onShowCategoryOrderModal,
  onAddToCart,
  isLoading,
}: ProductsListProps) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 lg:min-w-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap touch-button touch-optimized text-sm"
            >
              {category.nome}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={onShowCategoryOrderModal}
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
                          onClick={() => onAddToCart(product)}
                          className="bg-primary hover:bg-primary/90 touch-button touch-optimized"
                          size="sm"
                        >
                          <RiAddLine className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="hidden sm:inline">Adicionar</span>
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
  );
};
