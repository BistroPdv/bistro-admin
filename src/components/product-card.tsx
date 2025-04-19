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
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { SwitchWithText } from "./ui/switch-with-text";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const queryClient = useQueryClient();
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

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.nome}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
            <RiImageLine className="h-8 w-8" />
            <p className="text-xs text-center">Nenhuma imagem disponível</p>
          </div>
        )}
      </div>
      <CardContent className="flex-grow p-3">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-base truncate">{product.nome}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.descricao}
          </p>
          <p className="font-medium text-base">{formattedPrice}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-muted-foreground">Status:</span>
          <SwitchWithText
            uncheckText={<RiCloseLine className="h-4 w-4" />}
            checkText={<RiCheckLine className="h-4 w-4" />}
            checked={product.ativo}
            onCheckedChange={handleStatusChange}
          />
        </div>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit && onEdit(product)}
          >
            <RiEditLine className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete && onDelete(product)}
          >
            <RiDeleteBinLine className="h-3 w-3 mr-1" />
            Excluir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
