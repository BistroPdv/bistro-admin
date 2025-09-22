import { Button } from "@/components/ui/button";
import { RiSkipBackLine, RiSkipForwardLine } from "@remixicon/react";

interface EnhancedSimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  pageSize: number;
  showFirstLast?: boolean;
}

export function EnhancedSimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  pageSize,
  showFirstLast = true,
}: EnhancedSimplePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calcular páginas visíveis com elipse
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages = [];

    if (totalPages <= maxVisible) {
      // Mostrar todas as páginas se for 5 ou menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com elipse
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Primeira página
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("ellipsis-start");
        }
      }

      // Páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 || startPage === 1) {
          pages.push(i);
        }
      }

      // Última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("ellipsis-end");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
      {/* Informações da paginação */}
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {totalItems} itens
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Primeira página - só mostra se showFirstLast for true e não estiver na primeira página */}
        {showFirstLast && hasPreviousPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFirst}
            className="h-8 w-8 p-0"
            aria-label="Primeira página"
          >
            <RiSkipBackLine className="h-4 w-4" />
          </Button>
        )}

        {/* Página anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
        >
          Anterior
        </Button>

        {/* Números das páginas com elipse */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === "ellipsis-start" || page === "ellipsis-end" ? (
                <span className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Próxima página */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
        >
          Próxima
        </Button>

        {/* Última página - só mostra se showFirstLast for true e não estiver na última página */}
        {showFirstLast && hasNextPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLast}
            className="h-8 w-8 p-0"
            aria-label="Última página"
          >
            <RiSkipForwardLine className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
