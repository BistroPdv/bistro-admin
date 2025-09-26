"use client";

import { Category } from "@/@types/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDragMove2Line } from "@remixicon/react";

interface SortableCategoryProps {
  category: Category;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

function SortableCategory({
  category,
  isSelected,
  onSelect,
}: SortableCategoryProps) {
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

interface CategoryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderedCategories: Category[];
  onDragEnd: (event: DragEndEvent) => void;
}

export const CategoryOrderModal = ({
  isOpen,
  onClose,
  orderedCategories,
  onDragEnd,
}: CategoryOrderModalProps) => {
  // Configurar sensores para drag and drop otimizado para touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              onDragEnd={onDragEnd}
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
            onClick={onClose}
            className="touch-button touch-optimized"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
