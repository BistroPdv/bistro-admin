export interface FechamentoCaixa {
  caixa: Caixa;
  vendas: Venda[];
  movimentacoes: Movimentac[];
  fechamento: Fechamento2;
  resumo: Resumo;
}

export interface CaixaListResponse {
  page: number;
  totalPage: number;
  limit: number;
  total: number;
  data: Caixa[];
}

export interface Caixa {
  id: string;
  status: boolean;
  createdAt: string;
  user: User;
  CaixaMovimentacao: CaixaMovimentacao[];
}

export interface CaixaMovimentacao {
  id: string;
  caixaId: string;
  valor: number;
  tipo: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  nome: string;
}

interface Venda {
  id: string;
  status: string;
  tipoPedido: string;
  createdAt: string;
  total: number;
  troco: number;
  payments: Payment[];
}

interface Payment {
  id: string;
  valor: number;
  troco: number;
  methodPaymentId: string;
}

interface Movimentac {
  id: string;
  valor: number;
  tipo: string;
  createdAt: string;
}

interface Fechamento2 {
  id: string;
  totalMoment: number;
  totalMethods: number;
  totalChange: number;
  createAt: string;
  metodosPagamento: MetodosPagamento[];
}

interface MetodosPagamento {
  id: string;
  nome: string;
  tipo: string;
  valorInformado: number;
  descricao: string;
  valorReal: number;
  diferenca: number;
}

interface Resumo {
  totalVendas: number;
  totalMovimentacoes: number;
  totalTroco: number;
  totalInformado: number;
  totalReal: number;
  diferencaTotal: number;
}
