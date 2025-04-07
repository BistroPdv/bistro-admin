"use client";

import { PrinterForm } from "@/components/printer-form";
import PrintersTable from "@/components/printers-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Printer, PrinterFormValues } from "@/schemas/printer-schema";
import { useQuery } from "@tanstack/react-query";
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
    queryFn: () => api.get(`/restaurantCnpj/${cnpj.restaurantCnpj}/printers`),
    select: (res) => res.data,
  });

  const handleAddPrinter = async (data: PrinterFormValues) => {
    try {
      const newPrinter: Printer = {
        nome: data.nome,
        ip: data.ip,
        porta: data.porta,
        restaurantCnpj: cnpj.restaurantCnpj,
      };
      const response = await api.post(
        `/restaurantCnpj/${cnpj.restaurantCnpj}/printers`,
        { ...newPrinter, porta: Number(data.porta) }
      );
      if (response.status === 201) {
        toast.success("Impressora criada com sucesso");
        refetch();
      }
      setShowForm(false);
      setEditingPrinter(undefined);
    } catch (error) {
      toast.error("Erro ao criar impressora");
    }
  };

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter(printer);
    setShowForm(true);
  };

  const handleDeletePrinter = (printerId?: string) => {};

  if (error) {
    toast.error("Erro ao carregar impressoras");
  }

  console.log(printers);

  return (
    <div className="container py-6">
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
