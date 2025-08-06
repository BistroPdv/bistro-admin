"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentMethodType } from "@/schemas/payment-method-schema";
import {
  DndContext,
  DragEndEvent,
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
import { useEffect, useState } from "react";
import { SortableTableRow } from "./sortable-table-row";

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethodType[];
  onEdit: (paymentMethod: PaymentMethodType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  onReorder?: (paymentMethods: PaymentMethodType[]) => void;
  loading?: boolean;
}

const paymentTypeLabels = {
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  PIX: "PIX",
  TICKET: "Ticket",
  VOUCHER: "Voucher",
  OUTROS: "Outros",
};

export function PaymentMethodsTable({
  paymentMethods,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  loading = false,
}: PaymentMethodsTableProps) {
  const [items, setItems] = useState<PaymentMethodType[]>(paymentMethods);

  useEffect(() => {
    setItems(paymentMethods);
  }, [paymentMethods]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Chama a função de callback para atualizar a ordem
        onReorder?.(newItems);

        return newItems;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="text-sm text-muted-foreground">
          Nenhuma forma de pagamento cadastrada
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Clique em "Adicionar" para cadastrar a primeira forma de pagamento
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id || "")}
          strategy={verticalListSortingStrategy}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Aceita Troco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((paymentMethod) => (
                <SortableTableRow
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  paymentTypeLabels={paymentTypeLabels}
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
}
