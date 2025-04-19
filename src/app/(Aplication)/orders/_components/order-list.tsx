import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "../types";
import { formatCurrency, getStatusColor, getStatusText } from "../utils";

interface OrderListProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

export function OrderList({
  orders,
  selectedOrder,
  onSelectOrder,
  onScroll,
  isLoading,
  isFetchingNextPage,
}: OrderListProps) {
  return (
    <Card className="w-full md:w-1/3 lg:w-1/4 border rounded-lg overflow-hidden">
      <CardContent className="p-0 flex-1">
        <ScrollArea
          className="h-[calc(100vh-16rem)] px-2 py-2"
          onScroll={onScroll}
        >
          <div className="space-y-2 pb-2">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando pedidos...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum pedido encontrado
              </div>
            ) : (
              <>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors select-none relative ${
                      selectedOrder?.id === order.id
                        ? "bg-muted border-2 border-primary shadow-sm dark:bg-muted/80 dark:border-primary/70 dark:shadow-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => onSelectOrder(order)}
                  >
                    {selectedOrder?.id === order.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{order.pdvCodPedido}</div>
                      <div className="text-sm text-muted-foreground">
                        Mesa {order.mesa.numero}
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
                        {formatCurrency(
                          order.produtos.reduce((total, produto) => {
                            const produtoTotal =
                              produto.produto.preco * produto.quantidade;
                            const adicionaisTotal =
                              produto.adicionais?.reduce(
                                (total, adicional) =>
                                  total +
                                  adicional.preco * adicional.quantidade,
                                0
                              ) || 0;
                            return total + produtoTotal + adicionaisTotal;
                          }, 0)
                        )}
                      </div>
                    </div>
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
  );
}
