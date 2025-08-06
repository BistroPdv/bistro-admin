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
      name: "",
      description: "",
      type: undefined,
      status: true,
      change: false,
      taxa: "0",
    },
  });

  const handleSubmit = (values: PaymentMethodType) => {
    // @ts-ignore
    values.taxa = Number(values.taxa);
    onSubmit(values);
  };

  useEffect(() => {
    if (editingPaymentMethod !== null) {
      form.reset(editingPaymentMethod);
    } else {
      form.reset({
        name: "",
        description: "",
        type: "DINHEIRO",
        status: true,
        change: false,
        taxa: "0",
      });
    }
  }, [editingPaymentMethod, form]);

  const paymentTypeOptions = [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "CARTAO", label: "Cartão" },
    { value: "PIX", label: "PIX" },
    { value: "TICKET", label: "Ticket" },
    { value: "VOUCHER", label: "Voucher" },
    { value: "OUTROS", label: "Outros" },
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
                name="name"
                label="Nome"
                icon={<RiMoneyDollarCircleLine className="h-4 w-4" />}
                placeholder="Ex: Dinheiro, Cartão de Crédito..."
                type="text"
              />

              <FormField
                control={form.control}
                name="type"
                label="Tipo"
                icon={<RiSettings3Line className="h-4 w-4" />}
                type="select"
                placeholder="Selecione o tipo"
                options={paymentTypeOptions}
              />

              <FormField
                control={form.control}
                name="description"
                label="Descrição (Opcional)"
                icon={<RiTextWrap className="h-4 w-4" />}
                placeholder="Descrição adicional sobre a forma de pagamento"
                type="text"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxa"
                  label="Taxa (%)"
                  icon={<RiPercentLine className="h-4 w-4" />}
                  placeholder="0.00"
                  type="number"
                />
              </div>

              <FormField
                control={form.control}
                name="change"
                label=""
                type="checkbox"
                description="Aceita troco"
              />

              <FormField
                control={form.control}
                name="status"
                label=""
                type="checkbox"
                description="Ativo?"
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
