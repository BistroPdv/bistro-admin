export interface DashboardTypes {
  sales: Sale[];
  topProducts: TopProduct[];
  length: number;
  totalSales: number;
  totalOnline: number;
  totalPresencial: number;
}

interface Sale {
  name: string;
  total: number;
  online: number;
  presencial: number;
}

interface TopProduct {
  name: string;
  amount: number;
  rating: number;
}
