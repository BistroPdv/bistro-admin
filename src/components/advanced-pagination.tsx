import { Button } from "@/components/ui/button";
import { RiSkipBackLine, RiSkipForwardLine } from "@remixicon/react";

interface AdvancedPaginationProps {
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
  showInfo?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export function AdvancedPagination({
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
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
}: AdvancedPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calcular páginas visíveis com elipse
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se for menor ou igual ao máximo
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const delta = Math.floor(maxVisiblePages / 2);
    const startPage = Math.max(1, currentPage - delta);
    const endPage = Math.min(totalPages, currentPage + delta);

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

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
      {/* Informações da paginação */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </div>
      )}

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFirst}
            disabled={!hasPreviousPage}
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

        {/* Última página */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLast}
            disabled={!hasNextPage}
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
