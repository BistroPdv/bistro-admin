"use client";

import { PrinterForm } from "@/components/printer-form";
import PrintersTable from "@/components/printers-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Printer, PrinterFormValues } from "@/schemas/printer-schema";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusCircle, PrinterIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PrintersPage() {
  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const [showForm, setShowForm] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | undefined>(
    undefined
  );

  const {
    data: printers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["printers"],
    queryFn: () => api.get(`/printers`),
    select: (res) => res.data,
  });

  const handleAddPrinter = async (data: PrinterFormValues) => {
    try {
      const newPrinter: Printer = {
        id: data.id,
        nome: data.nome,
        ip: data.ip,
        porta: Number(data.porta),
        restaurantCnpj: cnpj.restaurantCnpj,
      };
      if (data.id) {
        const resp = await api.put(`/printers/${data.id}`, newPrinter);
        if (resp.status === 200) {
          toast.success("Impressora atualizada com sucesso");
          refetch();
        }
      } else {
        const resp = await api.post(`/printers`, newPrinter);
        if (resp.status === 201) {
          toast.success("Impressora criada com sucesso");
          refetch();
        }
      }
      setShowForm(false);
      setEditingPrinter(undefined);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Erro ao criar impressora");
      }
    }
  };

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter(printer);
    setShowForm(true);
  };

  const handleDeletePrinter = async (printerId?: string) => {
    try {
      const resp = await api.delete(`/printers/${printerId}`);
      if (resp.status === 200) {
        toast.success("Impressora excluída com sucesso");
        refetch();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Erro ao excluir impressora");
      }
    }
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
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Impressora
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle>
              {editingPrinter ? "Editar Impressora" : "Nova Impressora"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <PrinterForm onSubmit={handleAddPrinter} printer={editingPrinter} />
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPrinter(undefined);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <PrintersTable
        printers={printers?.data || []}
        loading={isLoading}
        onEditPrinter={handleEditPrinter}
        onDeletePrinter={handleDeletePrinter}
      />
    </div>
  );
}
