"use client";

import { Caixa, CaixaListResponse } from "@/@types/caixas";
import CaixaDetailsModal from "@/components/caixa-details-modal";
import CaixasTable from "@/components/caixas-table";
import { TitlePage } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CaixasPage() {
  const [selectedCaixa, setSelectedCaixa] = useState<Caixa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: caixasData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["caixas", page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });

      return api.get(`/caixa?${params.toString()}`);
    },
    select: (res) => res.data as CaixaListResponse,
  });

  const handleViewCaixa = (caixa: Caixa) => {
    setSelectedCaixa(caixa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCaixa(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getTotalMovimentacoes = (movimentacoes: any[]) => {
    return movimentacoes.reduce((total, mov) => {
      return mov.tipo === "ABERTURA" || mov.tipo === "ENTRADA"
        ? total + mov.valor
        : total - mov.valor;
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (error) {
    toast.error("Erro ao carregar caixas");
  }

  const totalCaixas = caixasData?.total || 0;
  const caixasAbertos = caixasData?.data.filter((c) => c.status).length || 0;
  const caixasFechados = caixasData?.data.filter((c) => !c.status).length || 0;
  const totalMovimentacoes =
    caixasData?.data.reduce((total, caixa) => {
      return total + getTotalMovimentacoes(caixa.CaixaMovimentacao);
    }, 0) || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <TitlePage
        title="Caixas"
        description="Gerencie e monitore os caixas do sistema"
        icon={<DollarSign className="h-8 w-8" />}
      >
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="gap-2 h-11 px-6"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </TitlePage>
      <div className="flex-none space-y-6 pb-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3 mb-3 justify-between">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total de Caixas
                </h3>
                <p className="text-xs text-muted-foreground">
                  Registrados no sistema
                </p>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {totalCaixas}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Caixas Abertos
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ativos no momento
                </p>
              </div>
              <div className="text-2xl font-semibold text-green-600">
                {caixasAbertos}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3 mb-3 justify-between">
              <div className="p-2 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Caixas Fechados
                </h3>
                <p className="text-xs text-muted-foreground">Finalizados</p>
              </div>
              <div className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                {caixasFechados}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3 mb-3 justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Movimentação Total
                </h3>
                <p className="text-xs text-muted-foreground">
                  Soma de todos os caixas
                </p>
              </div>
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalMovimentacoes)}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabela de Caixas */}
      <div className="flex-1 overflow-hidden">
        <CaixasTable
          caixas={caixasData?.data || []}
          loading={isLoading}
          onViewCaixa={handleViewCaixa}
        />
      </div>

      {/* Paginação */}
      {caixasData && caixasData.totalPage > 1 && (
        <div className="flex-none flex items-center justify-between pt-4 border-t bg-muted/30 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {caixasData.data.length} de {caixasData.total} caixas
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Página {page} de {caixasData.totalPage}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-8 px-3"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === caixasData.totalPage}
              className="h-8 px-3"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      <CaixaDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caixa={selectedCaixa}
      />
    </div>
  );
}
