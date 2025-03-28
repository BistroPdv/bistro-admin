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
  number: string;
  capacity: string;
  location: string;
};

export default function Page() {
  const [tables, setTables] = useState<Table[]>([
    {
      id: "1",
      number: "01",
      capacity: "4",
      location: "Área interna",
    },
    {
      id: "2",
      number: "02",
      capacity: "2",
      location: "Área externa",
    },
    {
      id: "3",
      number: "03",
      capacity: "6",
      location: "Área interna",
    },
  ]);

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
      setTables(
        tables.map((table) =>
          table.id === editingTable.id ? { ...table, ...data } : table
        )
      );
    } else {
      // Verificar se é adição em lote (intervalo de mesas)
      if (data.endNumber && data.endNumber.trim() !== "") {
        const startNum = parseInt(data.number);
        const endNum = parseInt(data.endNumber);
        const newTables: Table[] = [];

        // Criar mesas no intervalo especificado
        for (let i = startNum; i <= endNum; i++) {
          // Formatar o número da mesa com zeros à esquerda (ex: 01, 02, ...)
          const formattedNumber = i
            .toString()
            .padStart(data.number.length, "0");

          newTables.push({
            id: `${Date.now()}-${i}`,
            number: formattedNumber,
            capacity: data.capacity,
            location: data.location,
          });
        }

        setTables([...tables, ...newTables]);
      } else {
        // Adicionar uma única mesa
        const newTable: Table = {
          id: Date.now().toString(),
          number: data.number,
          capacity: data.capacity,
          location: data.location,
        };
        setTables([...tables, newTable]);
      }
    }

    // Resetar formulário e fechar diálogo
    form.reset();
    setIsDialogOpen(false);
    setEditingTable(null);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    form.reset({
      number: table.number,
      capacity: table.capacity,
      location: table.location,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter((table) => table.id !== id));
  };

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
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <CardTitle>Mesa {table.number}</CardTitle>
              <CardDescription>
                Capacidade: {table.capacity} pessoas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Localização: {table.location}</p>
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
