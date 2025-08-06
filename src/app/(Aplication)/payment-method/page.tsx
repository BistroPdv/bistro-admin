"use client";

import { PaymentMethodFormModal } from "@/components/payment-method-form-modal";
import { PaymentMethodsTable } from "@/components/payment-methods-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentMethodType } from "@/schemas/payment-method-schema";
import { RiAddLine, RiSecurePaymentLine } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";

// Dados mockados para demonstração - em produção viria de uma API
const mockPaymentMethods: PaymentMethodType[] = [
  {
    id: "1",
    nome: "Dinheiro",
    descricao: "Pagamento em espécie",
    tipo: "DINHEIRO",
    ativo: true,
    aceitaTroco: true,
    percentualTaxa: "",
    diasParaRecebimento: "0",
  },
  {
    id: "2",
    nome: "Cartão de Crédito Visa",
    descricao: "Cartão de crédito da bandeira Visa",
    tipo: "CARTAO_CREDITO",
    ativo: true,
    aceitaTroco: false,
    percentualTaxa: "3.5",
    diasParaRecebimento: "30",
  },
  {
    id: "3",
    nome: "PIX",
    descricao: "Pagamento instantâneo via PIX",
    tipo: "PIX",
    ativo: true,
    aceitaTroco: false,
    percentualTaxa: "0",
    diasParaRecebimento: "0",
  },
  {
    id: "4",
    nome: "Cartão de Débito",
    descricao: "Cartão de débito - desconto direto na conta",
    tipo: "CARTAO_DEBITO",
    ativo: false,
    aceitaTroco: false,
    percentualTaxa: "1.5",
    diasParaRecebimento: "1",
  },
];

export default function PaymentMethodPage() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethodType[]>(mockPaymentMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethodType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddNew = () => {
    setEditingPaymentMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (paymentMethod: PaymentMethodType) => {
    setEditingPaymentMethod(paymentMethod);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: PaymentMethodType) => {
    try {
      setLoading(true);

      if (editingPaymentMethod) {
        // Atualizar forma de pagamento existente
        setPaymentMethods((prev) =>
          prev.map((pm) =>
            pm.id === editingPaymentMethod.id
              ? { ...values, id: editingPaymentMethod.id }
              : pm
          )
        );
        toast.success("Forma de pagamento atualizada com sucesso!");
      } else {
        // Criar nova forma de pagamento
        const newPaymentMethod: PaymentMethodType = {
          ...values,
          id: Date.now().toString(), // Em produção, o ID viria do backend
        };
        setPaymentMethods((prev) => [...prev, newPaymentMethod]);
        toast.success("Forma de pagamento cadastrada com sucesso!");
      }

      setIsModalOpen(false);
      setEditingPaymentMethod(null);
    } catch (error) {
      toast.error("Erro ao salvar forma de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
      toast.success("Forma de pagamento excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir forma de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      setLoading(true);
      setPaymentMethods((prev) =>
        prev.map((pm) => (pm.id === id ? { ...pm, ativo: newStatus } : pm))
      );
      toast.success(
        `Forma de pagamento ${
          newStatus ? "ativada" : "desativada"
        } com sucesso!`
      );
    } catch (error) {
      toast.error("Erro ao alterar status da forma de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = paymentMethods.filter((pm) => pm.ativo).length;
  const totalCount = paymentMethods.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Formas de Pagamento
          </h1>
          <p className="text-muted-foreground">
            Gerencie as formas de pagamento aceitas no seu estabelecimento
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <RiAddLine className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Formas
            </CardTitle>
            <RiSecurePaymentLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              formas de pagamento cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formas Ativas</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              disponíveis para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Formas Inativas
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount - activeCount}</div>
            <p className="text-xs text-muted-foreground">
              temporariamente desabilitadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aceitam Troco</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentMethods.filter((pm) => pm.aceitaTroco).length}
            </div>
            <p className="text-xs text-muted-foreground">permitem troco</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Formas de Pagamento</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as formas de pagamento do seu sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodsTable
            paymentMethods={paymentMethods}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </CardContent>
      </Card>

      <PaymentMethodFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingPaymentMethod={editingPaymentMethod}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
