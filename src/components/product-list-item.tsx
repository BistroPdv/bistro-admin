"use client";

import api from "@/lib/api";
import { Product } from "@/schemas/product-schema";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiImageLine,
} from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { StatusModal } from "./ui/status-modal";
import { SwitchWithText } from "./ui/switch-with-text";

interface ProductListItemProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductListItem({
  product,
  onEdit,
  onDelete,
}: ProductListItemProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.preco);

  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");

  const updateProductStatusMutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      return api.patch(
        `/restaurantCnpj/${cnpj.restaurantCnpj}/produtos/${product.id}/toggle-status`,
        {
          ...product,
          ativo: newStatus,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        `Produto ${product.ativo ? "desativado" : "ativado"} com sucesso!`
      );
    },
    onError: () => {
      toast.error("Erro ao atualizar status do produto");
    },
  });

  const handleStatusChange = (checked: boolean) => {
    updateProductStatusMutation.mutate(checked);
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsModalOpen(false);
      const resp = await api.delete(`/produtos/${product.id}`);
      if (resp.status === 200) {
        onDelete && onDelete(product);
        toast.success("Produto excluído com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao excluir produto");
    }
  };

  return (
    <div className="flex flex-col justify-between p-4 bg-card hover:bg-muted/30 transition-colors gap-4 sm:gap-0 sm:flex-row sm:items-center">
      <div className="flex gap-4">
        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-muted">
          {product.imagem ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              )}
              <img
                src={product.imagem}
                alt={product.nome}
                className="h-full w-full object-cover"
                onLoad={() => setIsLoading(false)}
              />
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-muted-foreground bg-muted/50 dark:bg-muted/20">
              <RiImageLine className="h-6 w-6 opacity-70" />
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-semibold text-base tracking-tight truncate text-foreground">
              {product.nome}
            </h3>
            {product.ativo ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs font-medium">
                Ativo
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs font-medium">
                Inativo
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 max-w-md">
            {product.descricao || "Sem descrição"}
          </p>
          <p className="font-bold text-lg text-primary mt-2 sm:hidden">
            {formattedPrice}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto sm:ml-4">
        <p className="font-bold text-lg text-primary whitespace-nowrap hidden sm:block">
          {formattedPrice}
        </p>

        <div className="flex items-center gap-2">
          <SwitchWithText
            uncheckText={<RiCloseLine className="h-4 w-4" />}
            checkText={<RiCheckLine className="h-4 w-4" />}
            checked={product.ativo}
            onCheckedChange={handleStatusChange}
          />

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 h-8 transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit && onEdit(product)}
            >
              <RiEditLine className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 h-8 text-destructive"
              onClick={handleDelete}
            >
              <RiDeleteBinLine className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir produto"
        content="Tem certeza que deseja excluir este produto?"
        status="confirm"
      />
    </div>
  );
}
