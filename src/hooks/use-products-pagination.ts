import { Product } from "@/@types/products";
import { usePagination } from "./use-pagination";

interface UseProductsPaginationProps {
  pageSize?: number;
  additionalParams?: Record<string, any>;
}

export function useProductsPagination({
  pageSize = 12,
  additionalParams = {},
}: UseProductsPaginationProps = {}) {
  return usePagination<Product>({
    endpoint: "/products",
    pageSize,
    queryKey: ["products"],
    additionalParams,
  });
}
