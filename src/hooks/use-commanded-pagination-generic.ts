import { Commanded } from "@/@types/commanded";
import { usePagination } from "./use-pagination";

interface UseCommandedPaginationProps {
  pageSize?: number;
  additionalParams?: Record<string, any>;
}

export function useCommandedPagination({
  pageSize = 12,
  additionalParams = {},
}: UseCommandedPaginationProps = {}) {
  return usePagination<Commanded>({
    endpoint: "/commanded",
    pageSize,
    queryKey: ["commanded"],
    additionalParams,
  });
}
