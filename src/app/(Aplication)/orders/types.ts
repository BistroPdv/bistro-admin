export enum OrderStatus {
  ABERTO = "ABERTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}

export type Order = {
  id: string;
  pdvCodPedido: string;
  mesa: {
    numero: number;
    id: string;
  };
  status: OrderStatus;
  produtos: {
    produto: {
      nome: string;
      preco: number;
      descricao: string;
      codigo: string;
    };
    obs?: string;
    quantidade: number;
    status: string;
    adicionais?: {
      adicional: {
        nome: string;
        preco: number;
        codIntegra: string;
      };
      quantidade: number;
      preco: number;
    }[];
  }[];
  createdAt: string;
};
