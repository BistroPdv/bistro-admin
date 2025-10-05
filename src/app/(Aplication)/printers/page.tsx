"use client";

import { PrinterFormModal } from "@/components/printer-form-modal";
import PrintersTable from "@/components/printers-table";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Printer, PrinterFormValues } from "@/schemas/printer-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusCircle, PrinterIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PrintersPage() {
  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const queryClient = useQueryClient();

  const {
    data: printers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["printers"],
    queryFn: () => api.get(`/printers`),
    select: (res) => res.data,
    staleTime: 0, // Força sempre buscar dados frescos
    gcTime: 0, // Remove cache imediatamente
  });

  const createPrinterMutation = useMutation({
    mutationFn: async (data: PrinterFormValues) => {
      const newPrinter: Printer = {
        id: data.id,
        nome: data.nome,
        ip: data.ip,
        porta: Number(data.porta),
        restaurantCnpj: cnpj.restaurantCnpj,
      };

      if (data.id) {
        return api.put(`/printers/${data.id}`, newPrinter);
      } else {
        return api.post(`/printers`, newPrinter);
      }
    },
    onSuccess: async (_, variables) => {
      // Múltiplas estratégias para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["printers"] });
      queryClient.refetchQueries({ queryKey: ["printers"] });
      await refetch();

      // Força re-render da tabela
      setTimeout(() => {
        refetch();
      }, 100);

      setIsModalOpen(false);
      setEditingPrinter(null);
      toast.success(
        variables.id
          ? "Impressora atualizada com sucesso"
          : "Impressora criada com sucesso"
      );
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Erro ao processar impressora"
        );
      } else {
        toast.error("Erro ao processar impressora");
      }
    },
  });

  const deletePrinterMutation = useMutation({
    mutationFn: async (printerId: string) => {
      return api.delete(`/printers/${printerId}`);
    },
    onSuccess: async () => {
      // Múltiplas estratégias para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["printers"] });
      queryClient.refetchQueries({ queryKey: ["printers"] });
      await refetch();

      // Força re-render da tabela
      setTimeout(() => {
        refetch();
      }, 100);

      toast.success("Impressora excluída com sucesso");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Erro ao excluir impressora"
        );
      } else {
        toast.error("Erro ao excluir impressora");
      }
    },
  });

  const handleAddNewPrinter = () => {
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter(printer);
    setIsModalOpen(true);
  };

  const handleDeletePrinter = (printerId?: string) => {
    if (printerId) {
      deletePrinterMutation.mutate(printerId);
    }
  };

  const handleSubmit = (data: PrinterFormValues) => {
    createPrinterMutation.mutate(data);
  };

  if (error) {
    toast.error("Erro ao carregar impressoras");
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PrinterIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Impressoras de Rede</h1>
        </div>
        <Button onClick={handleAddNewPrinter} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Impressora
        </Button>
      </div>

      <PrintersTable
        printers={printers?.data || printers || []}
        loading={isLoading}
        onEditPrinter={handleEditPrinter}
        onDeletePrinter={handleDeletePrinter}
      />

      <PrinterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        printer={editingPrinter || undefined}
        loading={createPrinterMutation.isPending}
      />
    </div>
  );
}
