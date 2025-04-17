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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiCloseLine,
  RiFilter3Line,
  RiPrinterLine,
  RiSearch2Line,
  RiShoppingBag3Line,
} from "@remixicon/react";
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
  const [tableFilter, setTableFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showOrdersList, setShowOrdersList] = useState<boolean>(true);

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

    // Filtro por mesa
    if (tableFilter) {
      result = result.filter((order) =>
        order.table.toLowerCase().includes(tableFilter.toLowerCase())
      );
    }

    setFilteredOrders(result);
  };

  // Atualiza os filtros quando eles mudam
  useEffect(() => {
    filterOrders();
  }, [statusFilter, dateFilter, tableFilter, orders]);

  // Função para reimprimir o pedido
  const handleReprint = () => {
    if (selectedOrder) {
      console.log(`Reimprimindo pedido ${selectedOrder.number}`);
      // Aqui seria implementada a lógica de reimpressão
      alert(`Pedido ${selectedOrder.number} enviado para impressão!`);
    }
  };

  // Função para atualizar o status do pedido
  const handleUpdateStatus = (newStatus: Order["status"]) => {
    if (selectedOrder) {
      // Aqui seria implementada a lógica de atualização do status no backend
      const updatedOrder = { ...selectedOrder, status: newStatus };
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? updatedOrder : order
      );
      setOrders(updatedOrders);
      setSelectedOrder(updatedOrder);
      alert(
        `Status do pedido ${
          selectedOrder.number
        } atualizado para ${getStatusText(newStatus)}!`
      );
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 pt-6">
      {/* Barra superior com título e botões de ação */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h1 className="text-xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <RiFilter3Line className="h-4 w-4" />
            Filtros
          </Button>
          {!showOrdersList && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="md:hidden flex items-center gap-1"
            >
              <RiArrowLeftSLine className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Área de filtros (colapsável) */}
      {showFilters && (
        <Card className="w-full mb-4 border rounded-lg overflow-hidden">
          <CardContent className="p-3 flex-1">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Data</label>
                <div className="relative">
                  <Input
                    type="date"
                    placeholder="Filtrar por data"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Mesa</label>
                <div className="relative">
                  <RiSearch2Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por mesa"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] gap-4 flex-1 overflow-auto">
        {/* Lista de pedidos - visível apenas quando showOrdersList é true em mobile */}
        {(showOrdersList || window.innerWidth >= 768) && (
          <Card className="w-full md:w-1/3 lg:w-1/4 border rounded-lg overflow-hidden">
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[calc(100vh-16rem)] px-2 py-2">
                <div className="space-y-2 pb-2">
                  {filteredOrders.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum pedido encontrado
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
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
                              className={`w-3 h-3 rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            />
                            <span className="text-xs">
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="font-medium min-w-[90px] text-right">
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Área de detalhes do pedido - visível apenas quando um pedido está selecionado ou showOrdersList é false em mobile */}
        {selectedOrder && (!showOrdersList || window.innerWidth >= 768) && (
          <Card className="w-full md:w-2/3 lg:w-3/4 border rounded-lg overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/50 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <RiShoppingBag3Line className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedOrder.number} - {selectedOrder.table}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Criado em {formatDate(selectedOrder.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusText(selectedOrder.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {/* Área de ações do pedido */}
              <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReprint}
                  className="gap-1 flex-1 md:flex-none"
                >
                  <RiPrinterLine className="h-4 w-4" />
                  <span className="whitespace-nowrap">Reimprimir</span>
                </Button>

                {selectedOrder.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("preparing")}
                  >
                    <RiShoppingBag3Line className="h-4 w-4" />
                    <span className="whitespace-nowrap">Iniciar Preparo</span>
                  </Button>
                )}
                {selectedOrder.status === "preparing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("ready")}
                  >
                    <RiCheckLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Marcar Pronto</span>
                  </Button>
                )}
                {selectedOrder.status === "ready" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("delivered")}
                  >
                    <RiCheckDoubleLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Marcar Entregue</span>
                  </Button>
                )}
                {(selectedOrder.status === "pending" ||
                  selectedOrder.status === "preparing") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("canceled")}
                  >
                    <RiCloseLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Cancelar</span>
                  </Button>
                )}
              </div>

              {/* Conteúdo do pedido */}
              <ScrollArea className="h-[calc(100vh-20rem)] p-4 flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold tracking-tight">
                        Itens do Pedido
                      </h3>
                    </div>
                    <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                      {selectedOrder.items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex justify-between py-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {item.quantity}x {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground truncate">
                                  Obs: {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="font-medium min-w-[90px] text-right">
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
              </ScrollArea>

              {/* Rodapé com total */}
              <div className="p-4 border-t sticky bottom-0 bg-card mt-auto">
                <div className="flex justify-between items-center">
                  <div className="font-bold">Total</div>
                  <div className="font-bold text-xl">
                    {formatCurrency(selectedOrder.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem quando nenhum pedido está selecionado */}
        {!selectedOrder && !showOrdersList && (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Nenhum pedido selecionado</h3>
              <p className="text-muted-foreground">
                Selecione um pedido na lista para visualizar os detalhes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
