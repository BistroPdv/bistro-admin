"use client";

import api from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  OrderDetails,
  OrderFilters,
  OrderHeader,
  OrderList,
} from "./_components";
import { Order, OrderStatus } from "./types";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showOrdersList, setShowOrdersList] = useState<boolean>(true);

  // Query para carregar os pedidos com scroll infinito
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["pedidos", statusFilter, dateFilter, tableFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        page: pageParam,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }
      if (tableFilter) {
        params.table = tableFilter;
      }

      const response = await api.get("/pedidos", { params });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Seleciona um pedido para visualização
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    // Em telas pequenas, esconde a lista de pedidos ao selecionar um pedido
    if (window.innerWidth < 768) {
      setShowOrdersList(false);
    }
  };

  // Volta para a lista de pedidos (em mobile)
  const handleBackToList = () => {
    setShowOrdersList(true);
  };

  // Função para carregar mais pedidos quando o usuário rola até o final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop === clientHeight &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  // Função para reimprimir o pedido
  const handleReprint = () => {
    if (selectedOrder) {
      // Aqui seria implementada a lógica de reimpressão
      alert(`Pedido ${selectedOrder.pdvCodPedido} enviado para impressão!`);
    }
  };

  // Função para atualizar o status do pedido
  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (selectedOrder) {
      refetch();
      const updatedOrder = { ...selectedOrder, status: newStatus };
      setSelectedOrder(updatedOrder);
    }
  };

  // Flatten orders array from all pages
  const orders = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="flex flex-col h-full flex-1">
      <OrderHeader
        showFilters={showFilters}
        showOrdersList={showOrdersList}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onBackToList={handleBackToList}
      />

      {showFilters && (
        <OrderFilters
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          tableFilter={tableFilter}
          onStatusFilterChange={(data) => {
            setStatusFilter(data);
            setSelectedOrder(null);
          }}
          onDateFilterChange={setDateFilter}
          onTableFilterChange={setTableFilter}
        />
      )}

      <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] gap-4 flex-1 overflow-auto">
        {(showOrdersList || window.innerWidth >= 768) && (
          <OrderList
            orders={orders || []}
            selectedOrder={selectedOrder}
            onSelectOrder={handleSelectOrder}
            onScroll={handleScroll}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}

        <OrderDetails
          order={selectedOrder}
          onReprint={handleReprint}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
