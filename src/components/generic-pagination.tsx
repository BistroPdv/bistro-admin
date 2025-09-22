import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GenericPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  pageSize: number;
  showInfo?: boolean;
  maxVisiblePages?: number;
}

export function GenericPagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  pageSize,
  showInfo = true,
  maxVisiblePages = 5,
}: GenericPaginationProps) {
  // Calcular o range de páginas para exibir
  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Informações da paginação */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </div>
      )}

      {/* Controles de paginação usando shadcn/ui */}
      <Pagination>
        <PaginationContent>
          {/* Página anterior */}
          <PaginationItem>
            <PaginationPrevious
              onClick={onPrevious}
              className={
                !hasPreviousPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* Números das páginas */}
          {visiblePages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Próxima página */}
          <PaginationItem>
            <PaginationNext
              onClick={onNext}
              className={
                !hasNextPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
