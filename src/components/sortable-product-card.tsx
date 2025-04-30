"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/schemas/product-schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductCard } from "./product-card";

interface SortableProductCardProps {
  id: string;
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isDraggable?: boolean;
}

export function SortableProductCard({
  id,
  product,
  onEdit,
  onDelete,
  isDraggable = false,
}: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggable ? "grab" : "default",
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative",
        isOver &&
          !isDragging &&
          "after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary after:rounded-lg after:bg-primary/5"
      )}
    >
      <ProductCard
        product={product}
        onEdit={onEdit}
        onDelete={onDelete}
        isDraggable={isDraggable}
      />
    </div>
  );
}
