"use client";

import { Caixa } from "@/@types/caixas";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Calendar, DollarSign, Eye, User } from "lucide-react";
import { Badge } from "./ui/badge";
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

interface CaixasTableProps {
  loading?: boolean;
  caixas: Caixa[];
  onViewCaixa?: (caixa: Caixa) => void;
}

export default function CaixasTable(props: CaixasTableProps) {
  const { loading, caixas, onViewCaixa } = props;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-500">
        Aberto
      </Badge>
    ) : (
      <Badge variant="secondary">Fechado</Badge>
    );
  };

  const getTotalMovimentacoes = (movimentacoes: any[]) => {
    return movimentacoes.reduce((total, mov) => {
      return mov.tipo === "ABERTURA" || mov.tipo === "ENTRADA"
        ? total + mov.valor
        : total - mov.valor;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Carregando caixas...</p>
      </div>
    );
  }

  if (caixas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <p className="text-muted-foreground">Nenhum caixa encontrado</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Lista de Caixas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize e gerencie todos os caixas do sistema
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[12%] font-semibold">Status</TableHead>
                <TableHead className="w-[18%] font-semibold">Usuário</TableHead>
                <TableHead className="w-[18%] font-semibold">
                  Data Abertura
                </TableHead>
                <TableHead className="w-[15%] font-semibold">
                  Movimentações
                </TableHead>
                <TableHead className="w-[20%] font-semibold">
                  Saldo Atual
                </TableHead>
                <TableHead className="w-[17%] font-semibold text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caixas.map((caixa) => {
                const totalMovimentacoes = getTotalMovimentacoes(
                  caixa.CaixaMovimentacao
                );

                return (
                  <TableRow
                    key={caixa.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusBadge(caixa.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-muted rounded-full">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="font-medium">
                          {caixa.user.nome || "Usuário não informado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-muted rounded-full">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {dayjs(caixa.createdAt)
                              .locale("pt-br")
                              .format("DD/MM/YYYY")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dayjs(caixa.createdAt)
                              .locale("pt-br")
                              .format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">
                            {caixa.CaixaMovimentacao.length}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          movimentação(ões)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span
                            className={`font-bold text-lg ${
                              totalMovimentacoes >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(totalMovimentacoes)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewCaixa && onViewCaixa(caixa)}
                        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
