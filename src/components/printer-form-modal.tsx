"use client";

import {
  Printer,
  printerFormSchema,
  PrinterFormValues,
} from "@/schemas/printer-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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

interface PrinterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrinterFormValues) => void;
  printer?: Printer;
  loading?: boolean;
}

export function PrinterFormModal({
  isOpen,
  onClose,
  onSubmit,
  printer,
  loading = false,
}: PrinterFormModalProps) {
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      id: printer?.id || "",
      nome: printer?.nome || "",
      ip: printer?.ip || "",
      porta: String(printer?.porta) || "9100",
    },
  });

  const handleSubmit = (data: PrinterFormValues) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Reset form when printer changes
  React.useEffect(() => {
    if (printer) {
      form.reset({
        id: printer.id || "",
        nome: printer.nome || "",
        ip: printer.ip || "",
        porta: String(printer.porta) || "9100",
      });
    } else {
      form.reset({
        id: "",
        nome: "",
        ip: "",
        porta: "9100",
      });
    }
  }, [printer, form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {printer ? "Editar Impressora" : "Nova Impressora"}
          </DialogTitle>
          <DialogDescription>
            {printer
              ? "Edite os detalhes da impressora selecionada."
              : "Preencha os detalhes para adicionar uma nova impressora de rede."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {printer ? "Salvar Alterações" : "Adicionar Impressora"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
