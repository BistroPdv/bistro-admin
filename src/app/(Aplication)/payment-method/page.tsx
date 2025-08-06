"use client";

import { PaymentMethodFormModal } from "@/components/payment-method-form-modal";
import { PaymentMethodsTable } from "@/components/payment-methods-table";
import { TitlePage } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { PaymentMethodType } from "@/schemas/payment-method-schema";
import { RiAddLine, RiSecurePaymentLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentMethodPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethodType | null>(null);
  const queryClient = useQueryClient();

  const {
    data: methodPayment,
    isLoading,
    error,
  } = useQuery<AxiosResponse, Error, { data: PaymentMethodType[] }>({
    queryKey: ["payment-method"],
    queryFn: () => api.get("/payment-method"),
    select: (res) => res.data,
  });

  const createPaymentMethodMutation = useMutation({
    mutationFn: async (formData: PaymentMethodType) => {
      const endpoint = `/payment-method`;
      return api.post(endpoint, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-method"] });
      setIsModalOpen(false);
      setEditingPaymentMethod(null);
      toast.success("Forma de pagamento cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar forma de pagamento:", error);
      toast.error("Erro ao cadastrar forma de pagamento");
    },
  });

  const updatePaymentMethodMutation = useMutation({
    mutationFn: async (formData: PaymentMethodType & { id: string }) => {
      const endpoint = `/payment-method/${formData.id}`;
      return api.put(endpoint, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-method"] });
      setIsModalOpen(false);
      setEditingPaymentMethod(null);
      toast.success("Forma de pagamento atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar forma de pagamento:", error);
      toast.error("Erro ao atualizar forma de pagamento");
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const endpoint = `/payment-method/${id}`;
      return api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-method"] });
      toast.success("Forma de pagamento excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir forma de pagamento:", error);
      toast.error("Erro ao excluir forma de pagamento");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const endpoint = `/payment-method/${id}`;
      return api.patch(endpoint, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-method"] });
      toast.success("Status da forma de pagamento alterado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao alterar status da forma de pagamento:", error);
      toast.error("Erro ao alterar status da forma de pagamento");
    },
  });

  const reorderPaymentMethodsMutation = useMutation({
    mutationFn: async (paymentMethods: PaymentMethodType[]) => {
      const updates = paymentMethods.map((paymentMethod, index) => ({
        id: paymentMethod.id,
        order: index + 1,
      }));

      const response = await api.put(`/payment-method/order`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-method"] });
      toast.success("Ordem das formas de pagamento atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao reordenar formas de pagamento:", error);
      toast.error("Erro ao reordenar formas de pagamento");
    },
  });

  const handleAddNew = () => {
    setEditingPaymentMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (paymentMethod: PaymentMethodType) => {
    setEditingPaymentMethod(paymentMethod);
    setIsModalOpen(true);
  };

  const handleSubmit = (values: PaymentMethodType) => {
    if (editingPaymentMethod) {
      updatePaymentMethodMutation.mutate({
        ...values,
        id: editingPaymentMethod.id || "",
      });
    } else {
      createPaymentMethodMutation.mutate(values);
    }
  };

  const handleDelete = (id: string) => {
    deletePaymentMethodMutation.mutate(id);
  };

  const handleToggleStatus = (id: string, newStatus: boolean) => {
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const handleReorderPaymentMethods = (paymentMethods: PaymentMethodType[]) => {
    reorderPaymentMethodsMutation.mutate(paymentMethods);
  };

  if (error) {
    return <div>Erro ao carregar formas de pagamento</div>;
  }

  return (
    <div className="space-y-6">
      <TitlePage
        title="Formas de Pagamento"
        description="Gerencie as formas de pagamento aceitas no seu estabelecimento"
        icon={<RiSecurePaymentLine />}
      >
        <Button onClick={handleAddNew} className="gap-2">
          <RiAddLine className="h-4 w-4" />
          Adicionar
        </Button>
      </TitlePage>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodsTable
            paymentMethods={methodPayment?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onReorder={handleReorderPaymentMethods}
            loading={isLoading}
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
