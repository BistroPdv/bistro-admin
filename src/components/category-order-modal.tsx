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
import api from "@/lib/api";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SortableItem } from "./sortable-item";

interface CategoryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export function CategoryOrderModal({
  isOpen,
  onClose,
  categories,
}: CategoryOrderModalProps) {
  const [items, setItems] = useState<Category[]>(categories);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateOrderMutation = useMutation({
    mutationFn: async (orderedCategories: Category[]) => {
      const updates = orderedCategories.map((category, index) => ({
        id: category.id,
        ordem: index + 1,
      }));

      return api.put("/categorias/ordem", { categorias: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = () => {
    updateOrderMutation.mutate(items);
  };
  console.log(categories);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ordenar Categorias</DialogTitle>
          <DialogDescription>
            Arraste as categorias para reordená-las. Clique em Salvar para
            aplicar as alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((category) => (
                  <SortableItem key={category.id} id={category.id}>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <span>{category.nome}</span>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveOrder}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
