"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RiShoppingBag3Line } from "@remixicon/react";
import { useEffect, useState } from "react";

// Tipo para os pedidos
type Order = {
  id: string;
  number: string;
  table: string;
  status: "pending" | "preparing" | "ready" | "delivered" | "canceled";
  items: OrderItem[];
  total: number;
  createdAt: string;
};

// Tipo para os itens do pedido
type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
};

// Dados de exemplo para demonstração
const mockOrders: Order[] = [
  {
    id: "1",
    number: "#001",
    table: "Mesa 01",
    status: "pending",
    items: [
      {
        id: "item1",
        name: "X-Burger",
        quantity: 2,
        price: 25.9,
      },
      {
        id: "item2",
        name: "Refrigerante",
        quantity: 2,
        price: 6.5,
        notes: "Sem gelo",
      },
    ],
    total: 64.8,
    createdAt: "2023-06-15T14:30:00",
  },
  {
    id: "2",
    number: "#002",
    table: "Mesa 03",
    status: "preparing",
    items: [
      {
        id: "item3",
        name: "Salada Caesar",
        quantity: 1,
        price: 28.9,
      },
      {
        id: "item4",
        name: "Água",
        quantity: 1,
        price: 4.5,
      },
    ],
    total: 33.4,
    createdAt: "2023-06-15T14:45:00",
  },
  {
    id: "3",
    number: "#003",
    table: "Mesa 05",
    status: "ready",
    items: [
      {
        id: "item5",
        name: "Pizza Margherita",
        quantity: 1,
        price: 45.9,
      },
    ],
    total: 45.9,
    createdAt: "2023-06-15T15:00:00",
  },
  {
    id: "4",
    number: "#004",
    table: "Mesa 02",
    status: "delivered",
    items: [
      {
        id: "item6",
        name: "Espaguete à Bolonhesa",
        quantity: 2,
        price: 32.9,
      },
      {
        id: "item7",
        name: "Vinho Tinto",
        quantity: 1,
        price: 89.9,
      },
    ],
    total: 155.7,
    createdAt: "2023-06-15T13:15:00",
  },
  {
    id: "5",
    number: "#005",
    table: "Mesa 07",
    status: "canceled",
    items: [
      {
        id: "item8",
        name: "Risoto de Camarão",
        quantity: 1,
        price: 58.9,
      },
    ],
    total: 58.9,
    createdAt: "2023-06-15T12:30:00",
  },
];

// Função para formatar o valor em reais
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// Função para formatar a data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Função para obter a cor do status
const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "preparing":
      return "bg-blue-500";
    case "ready":
      return "bg-green-500";
    case "delivered":
      return "bg-gray-500";
    case "canceled":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

// Função para obter o texto do status
const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "Pendente";
    case "preparing":
      return "Preparando";
    case "ready":
      return "Pronto";
    case "delivered":
      return "Entregue";
    case "canceled":
      return "Cancelado";
    default:
      return "Desconhecido";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Seleciona um pedido para visualização
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Filtra os pedidos com base no status e data
  const filterOrders = () => {
    let result = [...orders];

    // Filtro por status
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Filtro por data (simplificado - apenas verifica se a data contém a string)
    if (dateFilter) {
      result = result.filter((order) => order.createdAt.includes(dateFilter));
    }

    setFilteredOrders(result);
  };

  // Atualiza os filtros quando eles mudam
  useEffect(() => {
    filterOrders();
  }, [statusFilter, dateFilter, orders]);

  // Função para reimprimir o pedido
  const handleReprint = () => {
    if (selectedOrder) {
      console.log(`Reimprimindo pedido ${selectedOrder.number}`);
      // Aqui seria implementada a lógica de reimpressão
      alert(`Pedido ${selectedOrder.number} enviado para impressão!`);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar de pedidos - ocupa flex: 1 */}
      <Card className="flex-1 border rounded-lg overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Gerencie os pedidos do restaurante</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Barra de filtros */}
          <div className="px-4 py-2 border-b flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="preparing">Preparando</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Entregue</option>
                <option value="canceled">Cancelado</option>
              </select>
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="Filtrar por data"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-15rem)] px-4">
            <div className="space-y-2 pb-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors select-none relative ${
                    selectedOrder?.id === order.id
                      ? "bg-muted border-2 border-primary shadow-sm dark:bg-muted/80 dark:border-primary/70 dark:shadow-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                  onClick={() => handleSelectOrder(order)}
                >
                  {selectedOrder?.id === order.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{order.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.table}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      />
                      <span className="text-xs">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de detalhes do pedido - ocupa flex: 2 */}
      <Card className="flex-[2] border rounded-lg overflow-hidden">
        {selectedOrder ? (
          <>
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <RiShoppingBag3Line className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedOrder.number} - {selectedOrder.table}
                      </CardTitle>
                      <CardDescription>
                        Criado em {formatDate(selectedOrder.createdAt)}
                      </CardDescription>
                    </div>
                    <div
                      className={`ml-2 px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusText(selectedOrder.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReprint}
                      className="gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-printer"
                      >
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect width="12" height="8" x="6" y="14"></rect>
                      </svg>
                      Reimprimir
                    </Button>

                    {selectedOrder.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chef-hat"
                        >
                          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                          <line x1="6" x2="18" y1="17" y2="17"></line>
                        </svg>
                        Iniciar Preparo
                      </Button>
                    )}
                    {selectedOrder.status === "preparing" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check-circle"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Marcar como Pronto
                      </Button>
                    )}
                    {selectedOrder.status === "ready" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check-check"
                        >
                          <path d="m5 12 5 5L20 7"></path>
                        </svg>
                        Marcar como Entregue
                      </Button>
                    )}
                    {(selectedOrder.status === "pending" ||
                      selectedOrder.status === "preparing") && (
                      <Button variant="destructive" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100vh-12rem)] relative pt-6">
              <div className="flex-grow overflow-auto">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-semibold tracking-tight">
                        Itens do Pedido
                      </h3>
                    </div>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {selectedOrder.items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex justify-between py-3">
                            <div>
                              <div className="font-medium">
                                {item.quantity}x {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground">
                                  Obs: {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                          {index < selectedOrder.items.length - 1 && (
                            <Separator className="opacity-30" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 sticky bottom-0 bg-card">
                <Separator />
                <div className="flex justify-between items-center mt-4">
                  <div className="font-bold">Total</div>
                  <div className="font-bold text-xl">
                    {formatCurrency(selectedOrder.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Nenhum pedido selecionado</h3>
              <p className="text-muted-foreground">
                Selecione um pedido na lista ao lado para visualizar os detalhes
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
