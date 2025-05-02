"use client";

import api from "@/lib/api";
import { cn } from "@/lib/utils";
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
import { Card, CardContent, CardFooter } from "./ui/card";
import { SwitchWithText } from "./ui/switch-with-text";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isDraggable?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  isDraggable = false,
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
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
    <Card
      className={cn(
        "overflow-hidden h-full flex flex-col transition-all",
        "hover:shadow-lg dark:hover:shadow-primary/5",
        "border border-border dark:border-border/40",
        "bg-card dark:bg-card/95 !py-0",
        isDraggable &&
          "border-2 border-dashed border-muted-foreground/30 cursor-move"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.imagem ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}
            <img
              src={product.imagem}
              alt={product.nome}
              className="h-full w-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
              onLoad={() => setIsLoading(false)}
            />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground bg-muted/50 dark:bg-muted/20">
            <RiImageLine className="h-10 w-10 opacity-70" />
            <p className="text-xs text-center font-medium">Sem imagem</p>
          </div>
        )}
        {product.ativo ? (
          <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-medium">
            Ativo
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-xs font-medium"
          >
            Inativo
          </Badge>
        )}
      </div>

      <CardContent className="flex-grow p-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base tracking-tight truncate text-foreground">
            {product.nome}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3.0rem]">
            {product.descricao || "Sem descrição"}
          </p>
          <p className="font-bold text-lg text-primary pt-1">
            {formattedPrice}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between w-full border-t border-border/30 dark:border-border/10 pt-3">
          <span className="text-sm font-medium text-foreground/80">
            Status:
          </span>
          <SwitchWithText
            uncheckText={<RiCloseLine className="h-4 w-4" />}
            checkText={<RiCheckLine className="h-4 w-4" />}
            checked={product.ativo}
            onCheckedChange={handleStatusChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full font-medium transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={() => onEdit && onEdit(product)}
          >
            <RiEditLine className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full font-medium text-destructive"
            onClick={() => onDelete && onDelete(product)}
          >
            <RiDeleteBinLine className="h-3.5 w-3.5 mr-1.5" />
            Excluir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
