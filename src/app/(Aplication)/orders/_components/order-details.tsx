import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiPrinterLine,
  RiShoppingBag3Line,
  RiShoppingCartLine,
} from "@remixicon/react";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Order, OrderStatus } from "../types";
import {
  calculateAdicionaisTotal,
  calculateOrderTotal,
  calculateProductTotal,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusText,
} from "../utils";
import { CancelOrderModal } from "./cancel-order-modal";
import { ConfirmOrderModal } from "./confirm-order-modal";

interface OrderDetailsProps {
  order: Order | null;
  onReprint: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}

export function OrderDetails({
  order,
  onReprint,
  onUpdateStatus,
}: OrderDetailsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalizeClick = () => {
    setShowConfirmModal(true);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmFinalize = async () => {
    if (!order) return;

    try {
      setIsLoading(true);
      const response = await api.patch(`/pedidos/${order.id}`, null, {
        params: {
          status: OrderStatus.FINALIZADO,
        },
      });
      if (response.status === 200) {
        onUpdateStatus(OrderStatus.FINALIZADO);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!order) return;

    if (!reason.trim()) {
      toast.error("Motivo de cancelamento é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.patch(`/pedidos/${order.id}`, null, {
        params: {
          status: OrderStatus.CANCELADO,
          motivo: reason,
        },
      });
      if (response.status === 200) {
        onUpdateStatus(OrderStatus.CANCELADO);
        setShowCancelModal(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Erro ao cancelar pedido");
      } else {
        toast.error("Erro ao cancelar pedido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) {
    return (
      <Card className="w-full md:w-2/3 lg:w-3/4 border rounded-lg overflow-hidden flex flex-col h-full">
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="bg-muted/50 p-4 rounded-full inline-block">
              <RiShoppingCartLine className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Nenhum pedido selecionado</h3>
              <p className="text-sm text-muted-foreground">
                Selecione um pedido na lista para visualizar os detalhes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full md:w-2/3 lg:w-3/4 border rounded-lg overflow-hidden flex flex-col h-full">
        <CardHeader className="bg-muted/50 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-md">
                <RiShoppingBag3Line className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {order.pdvCodPedido} - Mesa {order.mesa.numero}
                </CardTitle>
                <CardDescription className="text-xs">
                  Criado em {formatDate(order.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div
              className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-full overflow-hidden">
          {/* Área de ações do pedido */}
          <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-2 shrink-0">
            {order.status !== "CANCELADO" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReprint}
                  className="gap-1 flex-1 md:flex-none"
                >
                  <RiPrinterLine className="h-4 w-4" />
                  <span className="whitespace-nowrap">Reimprimir</span>
                </Button>
              </>
            )}
            {order.status === "ABERTO" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200 flex-1 md:flex-none"
                  onClick={handleFinalizeClick}
                >
                  <RiCheckDoubleLine className="h-4 w-4" />
                  <span className="whitespace-nowrap">Finalizar Pedido</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1 flex-1 md:flex-none"
                  onClick={handleCancelClick}
                >
                  <RiCloseLine className="h-4 w-4" />
                  <span className="whitespace-nowrap">Cancelar</span>
                </Button>
              </>
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
                      {order.produtos.map((produto, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex justify-between text-sm gap-2">
                                <p className="font-medium">
                                  {produto.produto.nome}
                                </p>
                                <span className="text-muted-foreground">
                                  {produto.quantidade}x
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCurrency(
                                    produto.produto.preco * produto.quantidade
                                  )}
                                </span>
                              </div>
                              <div className="mt-1 space-y-1">
                                {produto.adicionais &&
                                  produto.adicionais.length > 0 && (
                                    <div>
                                      {produto.adicionais.length > 0 && (
                                        <p className="text-muted-foreground font-medium">
                                          Adicionais
                                        </p>
                                      )}
                                      {produto.adicionais.map(
                                        (adicional, idx) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between text-sm pl-4"
                                          >
                                            <span className="text-muted-foreground">
                                              + {adicional.quantidade}x{" "}
                                              {adicional.adicional.nome}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {formatCurrency(
                                                adicional.preco *
                                                  adicional.quantidade
                                              )}
                                            </span>
                                          </div>
                                        )
                                      )}
                                      <div className="flex justify-between text-sm pl-4 border-t pt-1">
                                        <span className="text-muted-foreground font-medium">
                                          Total Adicionais
                                        </span>
                                        <span className="text-muted-foreground font-medium">
                                          {formatCurrency(
                                            calculateAdicionaisTotal(produto)
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="font-medium">
                                {formatCurrency(calculateProductTotal(produto))}
                              </p>
                            </div>
                          </div>

                          {produto.obs && (
                            <p className="text-foreground font-semibold text-sm">
                              Observação: {produto.obs}
                            </p>
                          )}
                          {index < order.produtos.length - 1 && <Separator />}
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
            <div className="flex justify-between items-center font-medium">
              <span>Total do Pedido</span>
              <span>{formatCurrency(calculateOrderTotal(order))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmOrderModal
        isOpen={showConfirmModal}
        isLoading={isLoading}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmFinalize}
        orderNumber={order.pdvCodPedido}
      />
      <CancelOrderModal
        isOpen={showCancelModal}
        isLoading={isLoading}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        orderNumber={order.pdvCodPedido}
      />
    </>
  );
}
