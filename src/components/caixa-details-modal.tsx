"use client";

import { Caixa, FechamentoCaixa } from "@/@types/caixas";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface CaixaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caixa: Caixa | null;
}

export default function CaixaDetailsModal({
  isOpen,
  onClose,
  caixa,
}: CaixaDetailsModalProps) {
  const {
    data: fechamentoData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fechamento-caixa", caixa?.id],
    queryFn: () => api.get(`/caixa/${caixa?.id}/close`),
    select: (res) => res.data as FechamentoCaixa,
    enabled: !!caixa?.id && isOpen,
  });

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

  const getMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case "ABERTURA":
      case "ENTRADA":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "SANGRIA":
      case "SAIDA":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovimentacaoColor = (tipo: string) => {
    switch (tipo) {
      case "ABERTURA":
      case "ENTRADA":
        return "text-green-600";
      case "SANGRIA":
      case "SAIDA":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (!caixa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Detalhes do Caixa</h2>
                <p className="text-sm text-muted-foreground">
                  Informações completas e movimentações
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-muted rounded-full">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold">
                      Usuário Responsável
                    </span>
                  </div>
                  <p className="text-lg font-medium">
                    {caixa.user.nome || "Usuário não informado"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-muted rounded-full">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold">
                      Data de Abertura
                    </span>
                  </div>
                  <p className="text-lg font-medium">
                    {dayjs(caixa.createdAt)
                      .locale("pt-br")
                      .format("DD/MM/YYYY [às] HH:mm")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Status Atual</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(caixa.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movimentações do Caixa */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Movimentações do Caixa
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Histórico completo de todas as movimentações financeiras
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">
                    Erro ao carregar movimentações
                  </p>
                </div>
              ) : caixa.CaixaMovimentacao.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">
                          Tipo de Movimentação
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Valor
                        </TableHead>
                        <TableHead className="font-semibold">
                          Data/Hora
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caixa.CaixaMovimentacao.map((mov) => (
                        <TableRow key={mov.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getMovimentacaoIcon(mov.tipo)}
                              <div>
                                <span className="font-medium">{mov.tipo}</span>
                                <p className="text-xs text-muted-foreground">
                                  ID: {mov.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`text-lg font-bold ${getMovimentacaoColor(
                                mov.tipo
                              )}`}
                            >
                              {formatCurrency(mov.valor)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {dayjs(mov.createdAt)
                                  .locale("pt-br")
                                  .format("DD/MM/YYYY")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {dayjs(mov.createdAt)
                                  .locale("pt-br")
                                  .format("HH:mm:ss")}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados de Fechamento (se disponível) */}
          {fechamentoData && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumo do Fechamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Total de Vendas:</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(fechamentoData.resumo.totalVendas)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Total de Movimentações:
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(
                          fechamentoData.resumo.totalMovimentacoes
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Total de Troco:</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(fechamentoData.resumo.totalTroco)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Diferença Total:</p>
                      <p
                        className={`text-lg font-bold ${
                          fechamentoData.resumo.diferencaTotal >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(fechamentoData.resumo.diferencaTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
