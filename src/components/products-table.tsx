"use client";

import { Product } from "@/schemas/product-schema";
import { Badge, Edit2Icon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface Categoria {
  id: string;
  nome: string;
  imagem: string;
  cor: string;
  ordem: number;
  temPromocao: boolean;
  externoId: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
  produtos: Product[];
  impressoras: any[];
}

interface RowActionsProps {
  loading?: boolean;
  items: Categoria[];
  onEditProduct?: (product: Product) => void;
}

export default function ProductsTable(props: RowActionsProps) {
  const { loading, items, onEditProduct } = props;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((category) => {
        if (category.produtos.length === 0) return null;

        return (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center">
                <CardTitle>{category.nome}</CardTitle>
                {category.cor && (
                  <Badge
                    style={{ backgroundColor: category.cor }}
                    className="text-white ml-2"
                  >
                    {category.produtos.length} produtos
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[15%]"></TableHead>
                    <TableHead className="w-[25%]">Nome</TableHead>
                    <TableHead className="truncate">Descrição</TableHead>
                    <TableHead className="w-[10%]">Preço</TableHead>
                    <TableHead className="w-[15%]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.produtos.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="w-[15%]">
                        <img
                          width={28}
                          height={28}
                          className="min-w-28 h-16 rounded-md object-cover"
                          src={
                            product.imagem ||
                            "https://www.gnial.com.br/gnialhelp/wp-content/themes/kojn/assets/images/default-fallback-image.png"
                          }
                          alt={product.nome}
                        />
                      </TableCell>
                      <TableCell className="w-[25%] font-medium">
                        {product.nome}
                      </TableCell>
                      <TableCell className="truncate">
                        {product.descricao}
                      </TableCell>
                      <TableCell className="w-[10%]">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(product.preco)}
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onEditProduct && onEditProduct(product)
                            }
                          >
                            <Edit2Icon className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
