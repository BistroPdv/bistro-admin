"use client";

import { Product } from "@/schemas/product-schema";
import { ProductCard } from "./product-card";
import { Categoria } from "./products-table";

interface ProductsGridProps {
  loading?: boolean;
  items: Categoria[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
}

export function ProductsGrid({
  loading,
  items,
  onEditProduct,
  onDeleteProduct,
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
        if (category.produtos.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category.nome}</h2>
              {category.cor && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: category.cor }}
                >
                  {category.produtos.length} produtos
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {category.produtos.map((product) => (
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
