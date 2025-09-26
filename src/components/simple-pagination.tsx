import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  pageSize: number;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  pageSize,
}: SimplePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
      {/* Informações da paginação */}
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {totalItems} itens
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {(() => {
            const maxVisible = 5;
            const pages: ReactNode[] = [];

            if (totalPages <= maxVisible) {
              // Mostrar todas as páginas se for 5 ou menos
              for (let i = 1; i <= totalPages; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(i)}
                    className="w-8 h-8 p-0"
                  >
                    {i}
                  </Button>
                );
              }
            } else {
              // Lógica para mostrar páginas com elipse
              const startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, currentPage + 2);

              // Primeira página
              if (startPage > 1) {
                pages.push(
                  <Button
                    key={1}
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="w-8 h-8 p-0"
                  >
                    1
                  </Button>
                );

                if (startPage > 2) {
                  pages.push(
                    <span
                      key="ellipsis-start"
                      className="px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }
              }

              // Páginas do meio
              for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 || startPage === 1) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(i)}
                      className="w-8 h-8 p-0"
                    >
                      {i}
                    </Button>
                  );
                }
              }

              // Última página
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span
                      key="ellipsis-end"
                      className="px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }

                pages.push(
                  <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                );
              }
            }

            return pages;
          })()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
