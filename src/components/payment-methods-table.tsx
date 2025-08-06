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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentMethodType } from "@/schemas/payment-method-schema";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiMore2Line,
  RiToggleLine,
} from "@remixicon/react";

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethodType[];
  onEdit: (paymentMethod: PaymentMethodType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  loading?: boolean;
}

const paymentTypeLabels = {
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
  PIX: "PIX",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
};

export function PaymentMethodsTable({
  paymentMethods,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}: PaymentMethodsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead>Dias p/ Recebimento</TableHead>
            <TableHead>Aceita Troco</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentMethods.map((paymentMethod) => (
            <TableRow key={paymentMethod.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{paymentMethod.nome}</div>
                  {paymentMethod.descricao && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {paymentMethod.descricao}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {
                    paymentTypeLabels[
                      paymentMethod.tipo as keyof typeof paymentTypeLabels
                    ]
                  }
                </Badge>
              </TableCell>
              <TableCell>
                {paymentMethod.percentualTaxa
                  ? `${paymentMethod.percentualTaxa}%`
                  : "-"}
              </TableCell>
              <TableCell>
                {paymentMethod.diasParaRecebimento
                  ? `${paymentMethod.diasParaRecebimento} dias`
                  : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={paymentMethod.aceitaTroco}
                    disabled
                    className="pointer-events-none"
                  />
                  <span className="text-sm">
                    {paymentMethod.aceitaTroco ? "Sim" : "Não"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={paymentMethod.ativo ? "default" : "secondary"}>
                  {paymentMethod.ativo ? "Ativo" : "Inativo"}
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
                        onToggleStatus(paymentMethod.id!, !paymentMethod.ativo)
                      }
                      className="cursor-pointer"
                    >
                      <RiToggleLine className="mr-2 h-4 w-4" />
                      {paymentMethod.ativo ? "Desativar" : "Ativar"}
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
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a forma de pagamento
                            "{paymentMethod.nome}"? Esta ação não pode ser
                            desfeita.
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
