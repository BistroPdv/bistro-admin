"use client";
import ProductsTable, { Categoria } from "@/components/products-table";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export default function Page() {
  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const { data, isLoading, error } = useQuery<AxiosResponse<Categoria[]>>({
    queryKey: ["products"],
    queryFn: () => {
      const response = api.get(
        `/restaurantCnpj/${cnpj.restaurantCnpj}/categorias`
      );
      return response;
    },
  });

  if (error) {
    return <div>Error loading products</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Button>Adicionar Produto</Button>
      </div>
      <ProductsTable loading={isLoading} items={data?.data || []} />
    </div>
  );
}
