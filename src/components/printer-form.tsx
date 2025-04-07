"use client";

import {
  Printer,
  PrinterFormValues,
  printerFormSchema,
} from "@/schemas/printer-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

interface PrinterFormProps {
  onSubmit: (data: PrinterFormValues) => void;
  printer?: Printer;
}

export function PrinterForm({ onSubmit, printer }: PrinterFormProps) {
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      nome: printer?.nome || "",
      ip: printer?.ip || "",
      porta: printer?.porta || "9100",
    },
  });

  const handleSubmit = (data: PrinterFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Impressora</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Impressora Cozinha" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o nome da impressora para identificação.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço IP</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 192.168.1.100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o endereço IP da impressora de rede.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="porta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porta</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 9100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite a porta de comunicação da impressora (geralmente
                    9100).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {printer ? "Salvar Alterações" : "Adicionar Impressora"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
