"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { PaymentMethodType } from "@/schemas/payment-method-schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiDeleteBin6Line,
  RiDragMove2Line,
  RiEdit2Line,
  RiMore2Line,
  RiToggleLine,
} from "@remixicon/react";

interface SortableTableRowProps {
  paymentMethod: PaymentMethodType;
  onEdit: (paymentMethod: PaymentMethodType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  paymentTypeLabels: Record<string, string>;
}

export function SortableTableRow({
  paymentMethod,
  onEdit,
  onDelete,
  onToggleStatus,
  paymentTypeLabels,
}: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: paymentMethod.id || "" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-muted/50" : ""}
    >
      <TableCell className="w-[50px]">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center cursor-move hover:bg-muted/50 rounded p-1 transition-colors"
        >
          <RiDragMove2Line className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div>
          <div className="font-medium">{paymentMethod.name}</div>
          {paymentMethod.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {paymentMethod.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {
            paymentTypeLabels[
              paymentMethod.type as keyof typeof paymentTypeLabels
            ]
          }
        </Badge>
      </TableCell>
      <TableCell>
        {paymentMethod.taxa ? `${paymentMethod.taxa}%` : "-"}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={paymentMethod.channel}
            disabled
            className="pointer-events-none"
          />
          <span className="text-sm">
            {paymentMethod.channel ? "Sim" : "Não"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={paymentMethod.status ? "default" : "secondary"}>
          {paymentMethod.status ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <RiMore2Line className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(paymentMethod)}
              className="cursor-pointer"
            >
              <RiEdit2Line className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onToggleStatus(paymentMethod.id!, !paymentMethod.status)
              }
              className="cursor-pointer"
            >
              <RiToggleLine className="mr-2 h-4 w-4" />
              {paymentMethod.status ? "Desativar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <RiDeleteBin6Line className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a forma de pagamento "
                    {paymentMethod.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(paymentMethod.id!)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
