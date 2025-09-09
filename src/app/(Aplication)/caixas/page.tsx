"use client";

import { Caixa, CaixaListResponse } from "@/@types/caixas";
import CaixaDetailsModal from "@/components/caixa-details-modal";
import CaixasTable from "@/components/caixas-table";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, RefreshCw } from "lucide-react";
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

  if (error) {
    toast.error("Erro ao carregar caixas");
  }

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Caixas</h1>
            <p className="text-muted-foreground">
              Gerencie e visualize os caixas do sistema
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      {caixasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Caixas
                </p>
                <p className="text-2xl font-bold">{caixasData.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Caixas Abertos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {caixasData.data.filter((c) => c.status).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Caixas Fechados
                </p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {caixasData.data.filter((c) => !c.status).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Caixas */}
      <CaixasTable
        caixas={caixasData?.data || []}
        loading={isLoading}
        onViewCaixa={handleViewCaixa}
      />

      {/* Paginação */}
      {caixasData && caixasData.totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {caixasData.data.length} de {caixasData.total} caixas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 py-2 text-sm">
              Página {page} de {caixasData.totalPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === caixasData.totalPage}
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
