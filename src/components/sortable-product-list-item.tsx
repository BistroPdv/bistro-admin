"use client";

import { Product } from "@/schemas/product-schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDraggable } from "@remixicon/react";
import { ProductListItem } from "./product-list-item";

interface SortableProductListItemProps {
  id: string;
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isDraggable?: boolean;
}

export function SortableProductListItem({
  id,
  product,
  onEdit,
  onDelete,
  isDraggable = false,
}: SortableProductListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  if (!isDraggable) {
    return (
      <ProductListItem product={product} onEdit={onEdit} onDelete={onDelete} />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border-l-2 border-l-transparent hover:border-l-primary"
      {...attributes}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-200 cursor-move">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground bg-background hover:bg-muted transition-colors shadow-sm"
          {...listeners}
        >
          <RiDraggable className="h-6 w-6" />
        </div>
      </div>
      <div className="pl-10">
        <ProductListItem
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
