"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

import { FormField } from "@/components/form-field";
import {
  paymentMethodFormSchema,
  PaymentMethodType,
} from "@/schemas/payment-method-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiSecurePaymentLine,
  RiSettings3Line,
  RiTextWrap,
} from "@remixicon/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export function PaymentMethodFormModal({
  open,
  onOpenChange,
  editingPaymentMethod,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPaymentMethod: PaymentMethodType | null;
  onSubmit: (values: PaymentMethodType) => void;
}) {
  const form = useForm<PaymentMethodType>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: editingPaymentMethod || {
      nome: "",
      descricao: "",
      tipo: undefined,
      ativo: true,
      aceitaTroco: false,
      percentualTaxa: "",
      diasParaRecebimento: "",
    },
  });

  const handleSubmit = (values: PaymentMethodType) => {
    onSubmit(values);
  };

  useEffect(() => {
    if (editingPaymentMethod !== null) {
      form.reset(editingPaymentMethod);
    } else {
      form.reset({
        nome: "",
        descricao: "",
        tipo: undefined,
        ativo: true,
        aceitaTroco: false,
        percentualTaxa: "",
        diasParaRecebimento: "",
      });
    }
  }, [editingPaymentMethod, form]);

  const paymentTypeOptions = [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
    { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
    { value: "PIX", label: "PIX" },
    { value: "TRANSFERENCIA", label: "Transferência Bancária" },
    { value: "OUTRO", label: "Outro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiSecurePaymentLine className="h-5 w-5" />
            {editingPaymentMethod
              ? "Editar Forma de Pagamento"
              : "Cadastrar Nova Forma de Pagamento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="nome"
                label="Nome"
                icon={<RiMoneyDollarCircleLine className="h-4 w-4" />}
                placeholder="Ex: Dinheiro, Cartão de Crédito..."
                type="text"
              />

              <FormField
                control={form.control}
                name="tipo"
                label="Tipo"
                icon={<RiSettings3Line className="h-4 w-4" />}
                type="select"
                placeholder="Selecione o tipo"
                options={paymentTypeOptions}
              />

              <FormField
                control={form.control}
                name="descricao"
                label="Descrição (Opcional)"
                icon={<RiTextWrap className="h-4 w-4" />}
                placeholder="Descrição adicional sobre a forma de pagamento"
                type="text"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="percentualTaxa"
                  label="Taxa (%)"
                  icon={<RiPercentLine className="h-4 w-4" />}
                  placeholder="0.00"
                  type="number"
                />

                <FormField
                  control={form.control}
                  name="diasParaRecebimento"
                  label="Dias p/ Recebimento"
                  icon={<RiCalendarLine className="h-4 w-4" />}
                  placeholder="0"
                  type="number"
                />
              </div>

              <FormField
                control={form.control}
                name="aceitaTroco"
                label="Aceita Troco"
                type="checkbox"
                description="Marque se esta forma de pagamento aceita troco"
              />

              <FormField
                control={form.control}
                name="ativo"
                label="Ativo"
                type="checkbox"
                description="Marque para manter esta forma de pagamento ativa"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingPaymentMethod ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
