"use client";

import { Category } from "@/@types/products";
import { Product } from "@/schemas/product-schema";
import { RiPencilLine } from "@remixicon/react";
import { ProductCard } from "./product-card";
import { Button } from "./ui/button";

interface ProductsGridProps {
  loading?: boolean;
  items: Category[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onEditCategory?: (category: Category) => void;
}

export function ProductsGrid({
  loading,
  items,
  onEditProduct,
  onDeleteProduct,
  onEditCategory,
}: ProductsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {items.map((category) => {
        if (category.produtos?.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCategory?.(category)}
                className="p-1 rounded-md hover:bg-muted"
              >
                <RiPencilLine />
              </Button>
              <h2 className="text-xl font-semibold">{category.nome}</h2>
              {category.cor && (
                <span className="px-2 py-1 text-xs font-medium rounded-full">
                  {category.produtos?.length} produtos
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {category.produtos?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
