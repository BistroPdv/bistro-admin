"use client";

import { Category } from "@/@types/products";
import { Product } from "@/schemas/product-schema";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RiDragMove2Line, RiPencilLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";
import { SortableProductCard } from "./sortable-product-card";
import { SortableProductListItem } from "./sortable-product-list-item";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ProductsGridProps {
  loading?: boolean;
  items: Category[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onEditCategory?: (category: Category) => void;
  onReorderProducts?: (categoryId: string, products: Product[]) => void;
  viewMode?: "card" | "list";
}

export function ProductsGrid({
  loading,
  items,
  onEditProduct,
  onDeleteProduct,
  onEditCategory,
  onReorderProducts,
  viewMode = "card",
}: ProductsGridProps) {
  const [categories, setCategories] = useState(items);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setCategories(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && editingCategoryId) {
      // Encontra a categoria que está sendo editada
      const editingCategory = categories.find(
        (category) => category.id === editingCategoryId
      );

      if (editingCategory && editingCategory.produtos) {
        const oldIndex = editingCategory.produtos.findIndex(
          (product) => product.id === active.id
        );
        const newIndex = editingCategory.produtos.findIndex(
          (product) => product.id === over.id
        );

        const newProducts = arrayMove(
          editingCategory.produtos,
          oldIndex,
          newIndex
        );

        // Atualiza a ordem dos produtos
        const updatedProducts = newProducts.map((product, index) => ({
          ...product,
          ordem: index + 1,
        }));

        // Atualiza a lista de categorias mantendo os produtos ordenados
        const updatedCategories = categories.map((category) =>
          category.id === editingCategoryId
            ? { ...category, produtos: updatedProducts }
            : category
        );

        setCategories(updatedCategories);
        onReorderProducts?.(editingCategoryId, updatedProducts);
      }
    }

    setActiveId(null);
  };

  const toggleCategoryOrder = (categoryId: string) => {
    setEditingCategoryId(editingCategoryId === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  const activeProduct = activeId
    ? categories
        .flatMap((category) => category.produtos || [])
        .find((product) => product.id === activeId)
    : null;

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {categories.map((category) => {
            if (category.produtos?.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
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
                    {!category.ativo && (
                      <Badge className="bg-destructive text-xs font-medium">
                        Inativo
                      </Badge>
                    )}

                    <span className="px-2 py-1 text-xs font-medium rounded-full">
                      {category.produtos?.length} produtos
                    </span>
                  </div>
                  <Button
                    variant={
                      editingCategoryId === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleCategoryOrder(category.id)}
                    className="flex items-center gap-2"
                  >
                    <RiDragMove2Line className="h-4 w-4" />
                    {editingCategoryId === category.id
                      ? "Finalizar Ordenação"
                      : "Ordenar Produtos"}
                  </Button>
                </div>

                <SortableContext
                  items={category.produtos?.map((product) => product.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {viewMode === "card" ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                      {category.produtos
                        ?.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                        .map((product) => (
                          <SortableProductCard
                            key={product.id}
                            id={product.id}
                            product={product}
                            onEdit={onEditProduct}
                            onDelete={onDeleteProduct}
                            isDraggable={editingCategoryId === category.id}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="divide-y border rounded-md overflow-hidden bg-card shadow-sm">
                      <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Listagem de produtos
                      </div>
                      {category.produtos?.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          Nenhum produto nesta categoria
                        </div>
                      )}
                      {category.produtos
                        ?.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                        .map((product) =>
                          editingCategoryId === category.id ? (
                            <SortableProductListItem
                              key={product.id}
                              id={product.id}
                              product={product}
                              onEdit={onEditProduct}
                              onDelete={onDeleteProduct}
                              isDraggable={true}
                            />
                          ) : (
                            <ProductListItem
                              key={product.id}
                              product={product}
                              onEdit={onEditProduct}
                              onDelete={onDeleteProduct}
                            />
                          )
                        )}
                    </div>
                  )}
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeProduct ? (
            <div className="opacity-50">
              {viewMode === "card" ? (
                <ProductCard
                  product={activeProduct}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  isDraggable={editingCategoryId === activeProduct.categoriaId}
                />
              ) : (
                <ProductListItem
                  product={activeProduct}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
