"use client";

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
  produtos: Produto[];
  impressoras: any[];
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  preco: number;
  categoriaId: string;
  externoId: any;
  codigo: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
}

interface RowActionsProps {
  loading?: boolean;
  items: Categoria[];
}

export default function ProductsTable(props: RowActionsProps) {
  const { loading, items } = props;

  return (
    <div className="space-y-4">
      {items.map((category) => {
        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[15%]"></TableHead>
                    <TableHead className="w-[25%]">Nome</TableHead>
                    <TableHead className="truncate">Descrição</TableHead>
                    <TableHead className="w-[5%]">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.produtos.map((products) => (
                    <TableRow key={products.id}>
                      <TableCell className="w-[15%]">
                        <img
                          width={28}
                          height={28}
                          className="min-w-28 h-16 rounded-2xl"
                          src={
                            products.imagem ||
                            "https://www.gnial.com.br/gnialhelp/wp-content/themes/kojn/assets/images/default-fallback-image.png"
                          }
                          alt={products.nome}
                        />
                      </TableCell>
                      <TableCell className="w-[25%]">{products.nome}</TableCell>
                      <TableCell className="truncate">
                        {products.descricao}
                      </TableCell>
                      <TableCell className="w-[5%]">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(products.preco)}
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
