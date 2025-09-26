"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiShoppingCartLine,
  RiSubtractLine,
} from "@remixicon/react";
import { CartItem } from "./useBuffetLogic";

interface CartProps {
  cart: CartItem[];
  showCart: boolean;
  onCloseCart: () => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onFinalizeOrder: () => void;
  getTotalPrice: () => number;
  isCreatingOrder?: boolean;
}

export const Cart = ({
  cart,
  showCart,
  onCloseCart,
  onUpdateQuantity,
  onFinalizeOrder,
  getTotalPrice,
  isCreatingOrder,
}: CartProps) => {
  return (
    <>
      {/* Botão flutuante do carrinho no mobile */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={onCloseCart}
            className="h-14 w-14 rounded-full shadow-lg touch-button touch-optimized"
            size="lg"
          >
            <RiShoppingCartLine className="h-6 w-6" />
            <Badge
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
              variant="destructive"
            >
              {cart.length}
            </Badge>
          </Button>
        </div>
      )}

      {/* Carrinho - Desktop e Modal Mobile */}
      <div
        className={`${
          !showCart ? "hidden lg:flex" : "fixed"
        } lg:relative h-[95%] top-0 left-0 right-0 bottom-0 lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto bg-white dark:bg-gray-900 z-40 lg:z-auto w-full lg:w-80 flex flex-col min-h-0 lg:min-h-0`}
      >
        {showCart && (
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              onClick={onCloseCart}
              variant="outline"
              size="sm"
              className="rounded-full h-8 w-8 p-0 touch-button touch-optimized"
            >
              <RiCloseLine className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Card
          className={`flex-1 flex flex-col min-h-0 ${showCart ? "h-full" : ""}`}
        >
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <RiShoppingCartLine className="h-4 w-4 md:h-5 md:w-5" />
              Carrinho ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
                <div className="text-center">
                  <RiShoppingCartLine className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione produtos</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 px-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5 pr-1 pb-1">
                      {cart.map((item) => (
                        <Card key={item.id} className="p-1.5">
                          <div className="flex items-center gap-2">
                            {item.imagem && (
                              <img
                                src={item.imagem}
                                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://www.unirg.edu.br/imagens/noticia_padrao.png";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm mb-1 line-clamp-2">
                                {item.nome}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                R$ {Number(item.preco).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      item.quantidade + 1
                                    )
                                  }
                                  className="h-6 w-6 p-0 touch-button touch-optimized"
                                >
                                  <RiAddLine className="h-3 w-3" />
                                </Button>
                                <div className="text-xs font-bold bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 min-w-[20px] text-center">
                                  {item.quantidade}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      item.quantidade - 1
                                    )
                                  }
                                  className="h-6 w-6 p-0 touch-button touch-optimized"
                                >
                                  <RiSubtractLine className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="px-2 pb-2">
                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-base md:text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={onFinalizeOrder}
                      disabled={isCreatingOrder}
                      className="w-full py-3 md:py-4 text-base md:text-lg touch-button touch-optimized"
                      size="lg"
                    >
                      {isCreatingOrder ? (
                        <>
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1 md:mr-2" />
                          Enviando Pedido...
                        </>
                      ) : (
                        <>
                          <RiCheckLine className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                          Finalizar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
