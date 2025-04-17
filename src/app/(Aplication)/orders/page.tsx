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
import api from "@/lib/api";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

// Tipo para os pedidos
type Order = {
  id: string;
  pdvCodPedido: string;
  mesa: {
    numero: number;
    id: string;
  };
  status: "ABERTO" | "FINALIZADO" | "CANCELADO";
  produtos: {
    produto: {
      nome: string;
      preco: number;
      descricao: string;
      codigo: string;
    };
    quantidade: number;
    status: string;
  }[];
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

interface PedidoData {
  id: string;
  status: "ABERTO" | "FINALIZADO" | "CANCELADO";
  pdvCodPedido: string;
  mesa: {
    numero: number;
    id: string;
  };
  produtos: {
    produto: {
      nome: string;
      preco: number;
      descricao: string;
      codigo: string;
    };
    quantidade: number;
    status: string;
  }[];
  createdAt: string;
}

interface PedidoResponseData {
  data: PedidoData[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

// Dados de exemplo para demonstração
const mockOrders: Order[] = [
  {
    id: "1",
    pdvCodPedido: "#001",
    mesa: {
      numero: 1,
      id: "mesa1",
    },
    status: "ABERTO",
    produtos: [
      {
        produto: {
          nome: "X-Burger",
          preco: 25.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 2,
        status: "",
      },
      {
        produto: {
          nome: "Refrigerante",
          preco: 6.5,
          descricao: "Sem gelo",
          codigo: "",
        },
        quantidade: 2,
        status: "",
      },
    ],
    createdAt: "2023-06-15T14:30:00",
  },
  {
    id: "2",
    pdvCodPedido: "#002",
    mesa: {
      numero: 3,
      id: "mesa3",
    },
    status: "FINALIZADO",
    produtos: [
      {
        produto: {
          nome: "Salada Caesar",
          preco: 28.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 1,
        status: "",
      },
      {
        produto: {
          nome: "Água",
          preco: 4.5,
          descricao: "",
          codigo: "",
        },
        quantidade: 1,
        status: "",
      },
    ],
    createdAt: "2023-06-15T14:45:00",
  },
  {
    id: "3",
    pdvCodPedido: "#003",
    mesa: {
      numero: 5,
      id: "mesa5",
    },
    status: "FINALIZADO",
    produtos: [
      {
        produto: {
          nome: "Pizza Margherita",
          preco: 45.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 1,
        status: "",
      },
    ],
    createdAt: "2023-06-15T15:00:00",
  },
  {
    id: "4",
    pdvCodPedido: "#004",
    mesa: {
      numero: 2,
      id: "mesa2",
    },
    status: "FINALIZADO",
    produtos: [
      {
        produto: {
          nome: "Espaguete à Bolonhesa",
          preco: 32.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 2,
        status: "",
      },
      {
        produto: {
          nome: "Vinho Tinto",
          preco: 89.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 1,
        status: "",
      },
    ],
    createdAt: "2023-06-15T13:15:00",
  },
  {
    id: "5",
    pdvCodPedido: "#005",
    mesa: {
      numero: 7,
      id: "mesa7",
    },
    status: "CANCELADO",
    produtos: [
      {
        produto: {
          nome: "Risoto de Camarão",
          preco: 58.9,
          descricao: "",
          codigo: "",
        },
        quantidade: 1,
        status: "",
      },
    ],
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
    case "ABERTO":
      return "bg-yellow-500";
    case "FINALIZADO":
      return "bg-green-500";
    case "CANCELADO":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

// Função para obter o texto do status
const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "ABERTO":
      return "Pendente";
    case "FINALIZADO":
      return "Finalizado";
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Desconhecido";
  }
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showOrdersList, setShowOrdersList] = useState<boolean>(true);

  // Query para carregar os pedidos com scroll infinito
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["pedidos", statusFilter, dateFilter, tableFilter],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await api.get("/pedidos", {
          params: {
            page: pageParam,
            status: statusFilter !== "all" ? statusFilter : undefined,
            date: dateFilter || undefined,
            table: tableFilter || undefined,
          },
        });
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
  const handleSelectOrder = (order: PedidoData) => {
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
      console.log(`Reimprimindo pedido ${selectedOrder.pdvCodPedido}`);
      // Aqui seria implementada a lógica de reimpressão
      alert(`Pedido ${selectedOrder.pdvCodPedido} enviado para impressão!`);
    }
  };

  // Função para atualizar o status do pedido
  const handleUpdateStatus = (newStatus: Order["status"]) => {
    if (selectedOrder) {
      // Aqui seria implementada a lógica de atualização do status no backend
      const updatedOrder = { ...selectedOrder, status: newStatus };
      setSelectedOrder(updatedOrder);
      alert(
        `Status do pedido ${
          selectedOrder.pdvCodPedido
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
                    <SelectItem value="ABERTO">Pendente</SelectItem>
                    <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
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
        {(showOrdersList || window.innerWidth >= 768) && (
          <Card className="w-full md:w-1/3 lg:w-1/4 border rounded-lg overflow-hidden">
            <CardContent className="p-0 flex-1">
              <ScrollArea
                className="h-[calc(100vh-16rem)] px-2 py-2"
                onScroll={handleScroll}
              >
                <div className="space-y-2 pb-2">
                  {status === "pending" ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Carregando pedidos...
                    </div>
                  ) : data?.pages[0].data.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum pedido encontrado
                    </div>
                  ) : (
                    <>
                      {data?.pages.map((page, pageIndex) => (
                        <div key={pageIndex}>
                          {page.data.map((order: PedidoData) => (
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
                                <div className="font-medium">
                                  {order.pdvCodPedido}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Mesa {order.mesa.numero}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${getStatusColor(
                                      order.status as Order["status"]
                                    )}`}
                                  />
                                  <span className="text-xs">
                                    {getStatusText(
                                      order.status as Order["status"]
                                    )}
                                  </span>
                                </div>
                                <div className="font-medium min-w-[90px] text-right">
                                  {formatCurrency(
                                    order.produtos.reduce(
                                      (total, item) =>
                                        total +
                                        item.produto.preco * item.quantidade,
                                      0
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                      {isFetchingNextPage && (
                        <div className="p-4 text-center text-muted-foreground">
                          Carregando mais pedidos...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Área de detalhes do pedido */}
        {selectedOrder && (!showOrdersList || window.innerWidth >= 768) && (
          <Card className="w-full md:w-2/3 lg:w-3/4 border rounded-lg overflow-hidden flex flex-col h-full">
            <CardHeader className="bg-muted/50 pb-3 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <RiShoppingBag3Line className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedOrder.pdvCodPedido} - Mesa{" "}
                      {selectedOrder.mesa.numero}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Criado em {formatDate(selectedOrder.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(
                    selectedOrder.status as Order["status"]
                  )}`}
                >
                  {getStatusText(selectedOrder.status as Order["status"])}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-full overflow-hidden">
              {/* Área de ações do pedido */}
              <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReprint}
                  className="gap-1 flex-1 md:flex-none"
                >
                  <RiPrinterLine className="h-4 w-4" />
                  <span className="whitespace-nowrap">Reimprimir</span>
                </Button>

                {selectedOrder.status === "ABERTO" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("FINALIZADO")}
                  >
                    <RiShoppingBag3Line className="h-4 w-4" />
                    <span className="whitespace-nowrap">Iniciar Preparo</span>
                  </Button>
                )}
                {selectedOrder.status === "FINALIZADO" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("FINALIZADO")}
                  >
                    <RiCheckLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Marcar Pronto</span>
                  </Button>
                )}
                {selectedOrder.status === "FINALIZADO" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("FINALIZADO")}
                  >
                    <RiCheckDoubleLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Marcar Entregue</span>
                  </Button>
                )}
                {(selectedOrder.status === "ABERTO" ||
                  selectedOrder.status === "FINALIZADO") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1 flex-1 md:flex-none"
                    onClick={() => handleUpdateStatus("CANCELADO")}
                  >
                    <RiCloseLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">Cancelar</span>
                  </Button>
                )}
              </div>

              {/* Conteúdo do pedido */}
              <div className="flex-1 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="p-4 pb-20">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold tracking-tight">
                            Itens do Pedido
                          </h3>
                        </div>
                        <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                          {selectedOrder.produtos.map((item, index) => (
                            <div key={`${item.produto.codigo}-${index}`}>
                              <div className="flex justify-between py-2 gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {item.quantidade}x {item.produto.nome}
                                  </div>
                                  {item.produto.descricao && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      Obs: {item.produto.descricao}
                                    </div>
                                  )}
                                </div>
                                <div className="font-medium min-w-[90px] text-right">
                                  {formatCurrency(
                                    item.produto.preco * item.quantidade
                                  )}
                                </div>
                              </div>
                              {index < selectedOrder.produtos.length - 1 && (
                                <Separator className="opacity-30" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Rodapé com total */}
              <div className="p-4 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 z-10 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="font-bold">Total</div>
                  <div className="font-bold text-xl">
                    {formatCurrency(
                      selectedOrder.produtos.reduce(
                        (total, item) =>
                          total + item.produto.preco * item.quantidade,
                        0
                      )
                    )}
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
