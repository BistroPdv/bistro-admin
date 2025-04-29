import { PaginatedResult } from "./pagination";

export interface TableType {
  id: string;
  numero: number;
  delete: boolean;
  capacity: number | null;
  location: string | null;
  restaurantCnpj: string;
  createdAt: string;
  updatedAt: string;
  endNumber: number | null;
}

export interface TablePagination extends PaginatedResult<Table> {}
