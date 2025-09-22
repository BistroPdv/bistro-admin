interface PaginationMeta {
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data?: T[];
  meta?: PaginationMeta;
  total?: number;
  totalPage?: number;
  page?: number;
  limit?: number;
}
