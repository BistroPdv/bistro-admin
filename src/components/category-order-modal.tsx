"use client";

import { Category } from "@/@types/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { RiDraggable } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  const [items, setItems] = useState<Category[]>([]);
  const queryClient = useQueryClient();

  // Atualiza o estado local sempre que as categorias ou o estado do modal mudar
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setItems(categories);
    }
  }, [categories, isOpen]);

  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateOrderMutation = useMutation({
    mutationFn: async (orderedCategories: Category[]) => {
      const updates = orderedCategories.map((category, index) => {
        return {
          id: category.id,
          ordem: index + 1,
        };
      });

      return api.put(`/categorias/ordem`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categorias reordenadas com sucesso");
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
              <div className="space-y-2 overflow-auto max-h-[calc(100vh-18rem)] px-2">
                {items.map((category) => (
                  <SortableItem key={category.id} id={category.id}>
                    <div className="flex bg-muted items-center cursor-move select-none py-3 px-4 gap-3 border rounded-md">
                      <RiDraggable />
                      <span>{category.nome}</span>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveOrder}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
