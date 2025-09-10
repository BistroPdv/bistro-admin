"use client";

import { Caixa, FechamentoCaixa } from "@/@types/caixas";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  Activity,
  Calendar,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

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
    enabled: !!caixa?.id && isOpen && !caixa?.status, // Só busca se o caixa estiver fechado
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTotalMovimentacoes = (movimentacoes: any[]) => {
    return movimentacoes.reduce((total, mov) => {
      // ABERTURA e ENTRADA são positivas, SAIDA e SANGRIA são negativas
      if (mov.tipo === "ABERTURA" || mov.tipo === "ENTRADA") {
        return total + mov.valor;
      } else if (mov.tipo === "SAIDA" || mov.tipo === "SANGRIA") {
        return total - mov.valor;
      }
      return total;
    }, 0);
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
      <DialogContent className="min-w-[900px] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-8 py-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Detalhes do Caixa</h2>
                <p className="text-muted-foreground text-sm">
                  Informações completas e histórico de movimentações
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6 space-y-12 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Status do Caixa - Mostrar primeiro */}
          {caixa?.status ? (
            // Caixa ainda aberto - mostrar mensagem informativa
            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Caixa em Andamento
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Este caixa ainda está aberto. Os dados de fechamento estarão
                    disponíveis após o encerramento.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          Movimentações do Caixa
          {/* Informações Básicas */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/20">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Informações Básicas</h3>
            </div>

            {/* Lista de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Usuário Responsável */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Usuário Responsável
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {caixa.user.nome || "Usuário não informado"}
                </p>
              </div>

              {/* Data de Abertura */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Data de Abertura
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {dayjs(caixa.createdAt)
                    .locale("pt-br")
                    .format("DD/MM/YYYY [às] HH:mm")}
                </p>
              </div>

              {/* Status Atual */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Status Atual
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(caixa.status)}
                </div>
              </div>
            </div>
          </div>
          {/* Movimentações do Caixa */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-500/20">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Movimentações do Caixa</h3>
            </div>

            {/* Resumo das Movimentações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Entradas
                  </span>
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(
                    caixa.CaixaMovimentacao.filter(
                      (mov) => mov.tipo === "ABERTURA" || mov.tipo === "ENTRADA"
                    ).reduce((total, mov) => total + mov.valor, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    caixa.CaixaMovimentacao.filter(
                      (mov) => mov.tipo === "ABERTURA" || mov.tipo === "ENTRADA"
                    ).length
                  }{" "}
                  transações
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Saídas
                  </span>
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(
                    caixa.CaixaMovimentacao.filter(
                      (mov) => mov.tipo === "SAIDA" || mov.tipo === "SANGRIA"
                    ).reduce((total, mov) => total + mov.valor, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    caixa.CaixaMovimentacao.filter(
                      (mov) => mov.tipo === "SAIDA" || mov.tipo === "SANGRIA"
                    ).length
                  }{" "}
                  transações
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Saldo Atual
                  </span>
                </div>
                <div
                  className={`text-xl font-semibold ${
                    getTotalMovimentacoes(caixa.CaixaMovimentacao) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    getTotalMovimentacoes(caixa.CaixaMovimentacao)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {caixa.CaixaMovimentacao.length} movimentações total
                </p>
              </div>
            </div>

            {/* Conteúdo das Movimentações */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Erro ao carregar movimentações
                  </p>
                </div>
              </div>
            ) : caixa.CaixaMovimentacao.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-6 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Nenhuma movimentação encontrada
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {caixa.CaixaMovimentacao.map((mov, index) => (
                  <div
                    key={mov.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                        {getMovimentacaoIcon(mov.tipo)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {mov.tipo}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {dayjs(mov.createdAt)
                            .locale("pt-br")
                            .format("DD/MM/YYYY [às] HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold`}>
                        {formatCurrency(mov.valor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Fechamento Concluído - Mostrar por último */}
          {!caixa?.status && fechamentoData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-emerald-500/20">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold">Fechamento Concluído</h3>
              </div>

              {/* Resumo Executivo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Vendas
                    </span>
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(fechamentoData.resumo.totalVendas)}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Movimentações
                    </span>
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(fechamentoData.resumo.totalMovimentacoes)}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Troco
                    </span>
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(fechamentoData.resumo.totalTroco)}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity
                      className={`h-4 w-4 ${
                        fechamentoData.resumo.diferencaTotal >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      Diferença
                    </span>
                  </div>
                  <div
                    className={`text-xl font-semibold ${
                      fechamentoData.resumo.diferencaTotal >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(fechamentoData.resumo.diferencaTotal)}
                  </div>
                </div>
              </div>

              {/* Detalhamento por Método de Pagamento */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold">
                    Métodos de Pagamento
                  </h4>
                </div>

                {/* Métodos de Pagamento - Dados Reais da API */}
                {fechamentoData.fechamento.metodosPagamento &&
                fechamentoData.fechamento.metodosPagamento.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fechamentoData.fechamento.metodosPagamento.map(
                      (metodo, index) => {
                        const getMetodoIcon = (tipo: string) => {
                          switch (tipo.toLowerCase()) {
                            case "dinheiro":
                            case "cash":
                              return (
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                              );
                            case "cartão":
                            case "cartao":
                            case "card":
                              return (
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              );
                            case "pix":
                              return (
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              );
                            default:
                              return (
                                <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              );
                          }
                        };

                        const percentualVendas =
                          fechamentoData.resumo.totalVendas > 0
                            ? (
                                (metodo.valorReal /
                                  fechamentoData.resumo.totalVendas) *
                                100
                              ).toFixed(1)
                            : "0.0";

                        return (
                          <div
                            key={metodo.id}
                            className="p-4 bg-muted/30 rounded-lg border"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                                {getMetodoIcon(metodo.tipo)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-foreground">
                                  {metodo.nome}
                                </h5>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {metodo.descricao}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Valor Real:
                                </span>
                                <span className={`font-semibold`}>
                                  {formatCurrency(metodo.valorReal)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Valor Informado:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(metodo.valorInformado)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Diferença:
                                </span>
                                <span
                                  className={`font-medium ${
                                    metodo.diferenca >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatCurrency(metodo.diferenca)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Percentual:
                                </span>
                                <span className="text-sm font-medium">
                                  {percentualVendas}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-6 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">
                        Nenhum método de pagamento encontrado
                      </p>
                    </div>
                  </div>
                )}

                {/* Resumo de Vendas Detalhado */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Resumo Executivo
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total de Vendas:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(fechamentoData.resumo.totalVendas)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Movimentações:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(
                            fechamentoData.resumo.totalMovimentacoes
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Troco Calculado:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(fechamentoData.resumo.totalTroco)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Diferença Total:
                        </span>
                        <span
                          className={`font-semibold ${
                            fechamentoData.resumo.diferencaTotal >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(fechamentoData.resumo.diferencaTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            fechamentoData.resumo.diferencaTotal >= 0
                              ? "text-green-600 border-green-200"
                              : "text-red-600 border-red-200"
                          }
                        >
                          {fechamentoData.resumo.diferencaTotal >= 0
                            ? "Favorável"
                            : "Desfavorável"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Período:
                        </span>
                        <span className="font-semibold text-foreground">
                          {dayjs(caixa.createdAt)
                            .locale("pt-br")
                            .format("DD/MM/YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
