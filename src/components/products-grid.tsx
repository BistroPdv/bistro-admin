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
import { SortableProductCard } from "./sortable-product-card";
import { Button } from "./ui/button";

interface ProductsGridProps {
  loading?: boolean;
  items: Category[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onEditCategory?: (category: Category) => void;
  onReorderProducts?: (categoryId: string, products: Product[]) => void;
}

export function ProductsGrid({
  loading,
  items,
  onEditProduct,
  onDeleteProduct,
  onEditCategory,
  onReorderProducts,
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
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeCategory = categories.find((category) =>
      category.produtos?.some((product) => product.id === active.id)
    );
    const overCategory = categories.find((category) =>
      category.produtos?.some((product) => product.id === over.id)
    );

    if (
      !activeCategory ||
      !overCategory ||
      activeCategory.id !== overCategory.id
    )
      return;

    const oldIndex = activeCategory.produtos?.findIndex(
      (product) => product.id === active.id
    );
    const newIndex = activeCategory.produtos?.findIndex(
      (product) => product.id === over.id
    );

    if (oldIndex === undefined || newIndex === undefined) return;

    const newProducts = arrayMove(
      activeCategory.produtos || [],
      oldIndex,
      newIndex
    );

    const updatedCategories = categories.map((category) => {
      if (category.id === activeCategory.id) {
        return {
          ...category,
          produtos: newProducts,
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    onReorderProducts?.(activeCategory.id, newProducts);
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
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeProduct ? (
            <div className="opacity-50">
              <ProductCard
                product={activeProduct}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                isDraggable={editingCategoryId === activeProduct.categoriaId}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
