"use client";

import { ProdutoServicoCadastro, ProdutosOmie } from "@/@types/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { RiImportLine, RiSearchLine } from "@remixicon/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";

interface ImportOptionsModalProps {
  onImport: (selectedOptions: {
    codigo_produto: number;
    descricao: string;
    valor_unitario: string;
    isImported: boolean;
  }) => void;
}

export function ImportOptionsModal({ onImport }: ImportOptionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<AxiosResponse, Error, ProdutosOmie>({
      queryKey: ["productOmie"],
      queryFn: ({ pageParam = 1 }) =>
        api.get("/integrations/omie/list-produtos", {
          params: {
            page: pageParam,
            limit: 500,
          },
        }),
      select: (data) => data.pages[data.pages.length - 1].data,
      getNextPageParam: (lastPage) => {
        const currentPage = lastPage.data.page || 1;
        const totalPages = Math.ceil(lastPage.data.total / 500);

        if (currentPage < totalPages) {
          return currentPage + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      enabled: isOpen,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const filteredProducts = data?.produto_servico_cadastro.filter((product) =>
    product.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1">
          <RiImportLine className="h-4 w-4" />
          Importar Opções
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Opções</DialogTitle>
        </DialogHeader>
        <div className="sticky top-0 z-10 bg-background py-4">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {status === "pending" && <p>Carregando...</p>}
          {status === "error" && <p>Erro ao carregar produtos</p>}
          {status === "success" && (
            <div className="flex flex-col gap-2">
              {filteredProducts?.map((product: ProdutoServicoCadastro) => (
                <div key={product.codigo}>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex flex-col">
                      <span className="font-medium">{product.descricao}</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {product.valor_unitario.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onImport({
                          codigo_produto: product.codigo_produto,
                          descricao: product.descricao,
                          valor_unitario: product.valor_unitario.toString(),
                          isImported: true,
                        });
                        setIsOpen(false);
                      }}
                    >
                      Importar
                    </Button>
                  </div>
                </div>
              ))}
              <div ref={observerTarget} className="h-4">
                {isFetchingNextPage && (
                  <p className="text-center text-muted-foreground">
                    Carregando mais produtos...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 z-10 bg-background border-t py-2">
          <p className="text-sm text-muted-foreground text-center">
            {filteredProducts?.length || 0} produtos listados
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
