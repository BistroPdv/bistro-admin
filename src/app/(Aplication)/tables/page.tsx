"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

// Definindo o esquema de validação com zod
const tableFormSchema = z
  .object({
    number: z.string().min(1, "O número da mesa é obrigatório"),
    endNumber: z.string().optional(),
    capacity: z
      .string()
      .min(1, "A capacidade é obrigatória")
      .refine((val) => !isNaN(Number(val)), {
        message: "A capacidade deve ser um número",
      }),
    location: z.string().min(1, "A localização é obrigatória"),
  })
  .refine(
    (data) => {
      // Se endNumber estiver preenchido, validar que é um número e maior que number
      if (data.endNumber && data.endNumber.trim() !== "") {
        const start = Number(data.number);
        const end = Number(data.endNumber);
        return !isNaN(start) && !isNaN(end) && end >= start;
      }
      return true;
    },
    {
      message: "O número final deve ser maior ou igual ao número inicial",
      path: ["endNumber"],
    }
  );

type TableFormValues = z.infer<typeof tableFormSchema>;

type Table = {
  id: string;
  numero: number;
  delete: boolean;
  capacity: number;
  location: string;
  createdAt: string;
  restaurantCnpj: string;
  updatedAt: string;
};

export default function Page() {
  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const tables = useQuery<AxiosResponse<Table[]>>({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await api.get(`/restaurantCnpj/${cnpj}/mesa`);
      return response.data;
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      number: "",
      endNumber: "",
      capacity: "",
      location: "",
    },
  });

  const onSubmit = (data: TableFormValues) => {
    if (editingTable) {
      // Editar mesa existente
    } else {
      // Verificar se é adição em lote (intervalo de mesas)
      if (data.endNumber && data.endNumber.trim() !== "") {
        const startNum = parseInt(data.number);
        const endNum = parseInt(data.endNumber);
        const newTables: Table[] = [];
      }
    }

    // Resetar formulário e fechar diálogo
    form.reset();
    setIsDialogOpen(false);
    setEditingTable(null);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);

    setIsDialogOpen(true);
  };

  const handleDeleteTable = (id: string) => {};

  const handleAddNewTable = () => {
    setEditingTable(null);
    form.reset({
      number: "",
      endNumber: "",
      capacity: "",
      location: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Mesas</h1>
        <Button onClick={handleAddNewTable}>
          <PlusIcon className="mr-2 h-4 w-4" /> Adicionar Mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables?.data?.data.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <CardTitle>Mesa {table.numero}</CardTitle>
              <CardDescription>
                Capacidade: {table?.capacity} pessoas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Localização: {table?.location}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditTable(table)}
              >
                <Edit2Icon className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTable(table.id)}
              >
                <Trash2Icon className="h-4 w-4 mr-2" /> Remover
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Editar Mesa" : "Adicionar Nova Mesa"}
            </DialogTitle>
            <DialogDescription>
              {editingTable
                ? "Edite os detalhes da mesa selecionada."
                : "Preencha os detalhes para adicionar uma nova mesa."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Inicial</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Digite o número inicial da mesa.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Final (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 10" {...field} />
                      </FormControl>
                      <FormDescription>
                        Para adicionar várias mesas de uma vez.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 4" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número de pessoas que a mesa comporta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Área interna" {...field} />
                    </FormControl>
                    <FormDescription>
                      Onde a mesa está localizada no restaurante.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingTable ? "Salvar Alterações" : "Adicionar Mesa"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
