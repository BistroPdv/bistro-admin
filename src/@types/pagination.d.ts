interface PaginationMeta {
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data?: T[];
  meta: PaginationMeta;
}
