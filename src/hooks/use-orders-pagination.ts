import { usePagination } from "./use-pagination";

interface Order {
  id: string;
  status: string;
  table: string;
  total: number;
  createdAt: string;
}

interface UseOrdersPaginationProps {
  pageSize?: number;
  status?: string;
  date?: string;
  table?: string;
}

export function useOrdersPagination({
  pageSize = 10,
  status,
  date,
  table,
}: UseOrdersPaginationProps = {}) {
  const additionalParams: Record<string, any> = {};

  if (status && status !== "all") {
    additionalParams.status = status;
  }
  if (date) {
    additionalParams.date = date;
  }
  if (table) {
    additionalParams.table = table;
  }

  return usePagination<Order>({
    endpoint: "/pedidos",
    pageSize,
    queryKey: ["orders", status, date, table],
    additionalParams,
  });
}
