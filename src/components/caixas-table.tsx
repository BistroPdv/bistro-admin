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
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          Lista de Caixas
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Visualize e gerencie todos os caixas do sistema
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted/20">
                  <TableHead className="w-[12%] font-semibold text-sm py-4">
                    Status
                  </TableHead>
                  <TableHead className="w-[18%] font-semibold text-sm py-4">
                    Usuário
                  </TableHead>
                  <TableHead className="w-[18%] font-semibold text-sm py-4">
                    Data Abertura
                  </TableHead>
                  <TableHead className="w-[15%] font-semibold text-sm py-4">
                    Movimentações
                  </TableHead>
                  <TableHead className="w-[20%] font-semibold text-sm py-4">
                    Saldo Atual
                  </TableHead>
                  <TableHead className="w-[17%] font-semibold text-center text-sm py-4">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caixas.map((caixa, index) => {
                  const totalMovimentacoes = getTotalMovimentacoes(
                    caixa.CaixaMovimentacao
                  );

                  return (
                    <TableRow
                      key={caixa.id}
                      className="hover:bg-muted/30 transition-colors border-b"
                    >
                      <TableCell className="py-4">
                        {getStatusBadge(caixa.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {caixa.user.nome || "Usuário não informado"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
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
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {caixa.CaixaMovimentacao.length}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            movimentações
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={`font-semibold text-sm ${
                              totalMovimentacoes >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(totalMovimentacoes)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewCaixa && onViewCaixa(caixa)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
