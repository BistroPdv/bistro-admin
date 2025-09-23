export interface Commanded {
  id: string;
  numero: number;
  qrValue?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandedCreateRequest {
  of: number;
  to: number;
}

export interface CommandedRangeResponse {
  message: string;
  data: Commanded[];
}

export interface CommandedPaginationParams {
  page?: number;
  limit?: number;
}

export interface CommandedPaginationResponse {
  data: Commanded[];
  meta: {
    total: number;
    totalItems: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}
