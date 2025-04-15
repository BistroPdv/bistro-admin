"use client";

import { Product } from "@/schemas/product-schema";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.preco);

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={
            product.imagem ||
            "https://www.gnial.com.br/gnialhelp/wp-content/themes/kojn/assets/images/default-fallback-image.png"
          }
          alt={product.nome}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
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
      <CardFooter className="p-3 pt-0 flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onEdit && onEdit(product)}
        >
          <Edit2Icon className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete && onDelete(product)}
        >
          <Trash2Icon className="h-3 w-3 mr-1" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
