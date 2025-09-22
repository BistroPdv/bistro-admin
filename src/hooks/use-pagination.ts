import { PaginatedResult } from "@/@types/pagination";
import api from "@/lib/api";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface UsePaginationProps<T> {
  endpoint: string;
  pageSize?: number;
  queryKey: string[];
  queryOptions?: Omit<
    UseQueryOptions<PaginatedResult<T>>,
    "queryKey" | "queryFn"
  >;
  additionalParams?: Record<string, any>;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  changePageSize: (newPageSize: number) => void;
  refetch: () => void;
}

export function usePagination<T = any>({
  endpoint,
  pageSize: initialPageSize = 12,
  queryKey,
  queryOptions = {},
  additionalParams = {},
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResult<T>>({
    queryKey: [...queryKey, currentPage, pageSize, additionalParams],
    queryFn: async () => {
      const response = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: pageSize,
          ...additionalParams,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    ...queryOptions,
  });

  // Calcular metadados de paginação
  // A API retorna: { total: 100, totalPage: 9, page: 1, limit: 12 }
  const totalPages = data?.totalPage || data?.meta?.lastPage || 1;
  const totalItems = data?.total || data?.meta?.total || 0;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Ações de paginação
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Estado da paginação
  const paginationState: PaginationState = {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
  };

  // Ações da paginação
  const paginationActions: PaginationActions = {
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    refetch,
  };

  return {
    // Dados
    data: data?.data || [],
    isLoading,
    error,

    // Estado da paginação
    ...paginationState,

    // Ações da paginação
    ...paginationActions,
  };
}
