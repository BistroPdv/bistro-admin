"use client";
import { AdvancedPagination } from "@/components/advanced-pagination";
import { SimplePagination } from "@/components/simple-pagination";
import { useState } from "react";

// Exemplo de demonstração do sistema de elipse
export function PaginationExamples() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 15; // Simular 15 páginas para testar elipse
  const totalItems = 150;
  const pageSize = 10;

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Exemplos de Paginação com Elipse</h1>

      {/* Exemplo 1: Página 1 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Página 1 de 15 (início)</h2>
        <div className="p-4 border rounded-lg">
          <SimplePagination
            currentPage={1}
            totalPages={15}
            onPageChange={goToPage}
            onPrevious={previousPage}
            onNext={nextPage}
            hasNextPage={true}
            hasPreviousPage={false}
            totalItems={150}
            pageSize={10}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Mostra: 1, 2, 3, 4, 5, ..., 15
        </p>
      </div>

      {/* Exemplo 2: Página do meio */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Página 8 de 15 (meio)</h2>
        <div className="p-4 border rounded-lg">
          <SimplePagination
            currentPage={8}
            totalPages={15}
            onPageChange={goToPage}
            onPrevious={previousPage}
            onNext={nextPage}
            hasNextPage={true}
            hasPreviousPage={true}
            totalItems={150}
            pageSize={10}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Mostra: 1, ..., 6, 7, 8, 9, 10, ..., 15
        </p>
      </div>

      {/* Exemplo 3: Página final */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Página 15 de 15 (final)</h2>
        <div className="p-4 border rounded-lg">
          <SimplePagination
            currentPage={15}
            totalPages={15}
            onPageChange={goToPage}
            onPrevious={previousPage}
            onNext={nextPage}
            hasNextPage={false}
            hasPreviousPage={true}
            totalItems={150}
            pageSize={10}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Mostra: 1, ..., 11, 12, 13, 14, 15
        </p>
      </div>

      {/* Exemplo 4: Componente Avançado */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Componente Avançado (com botões primeira/última)
        </h2>
        <div className="p-4 border rounded-lg">
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPrevious={previousPage}
            onNext={nextPage}
            onFirst={goToFirstPage}
            onLast={goToLastPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            totalItems={totalItems}
            pageSize={pageSize}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Inclui botões para primeira e última página, além das elipses
        </p>
      </div>

      {/* Controles de teste */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Teste Interativo</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Página 1
          </button>
          <button
            onClick={() => setCurrentPage(5)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Página 5
          </button>
          <button
            onClick={() => setCurrentPage(10)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Página 10
          </button>
          <button
            onClick={() => setCurrentPage(15)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Página 15
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Página atual: {currentPage} de {totalPages}
        </p>
      </div>
    </div>
  );
}
