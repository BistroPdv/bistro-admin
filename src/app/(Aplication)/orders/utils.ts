import { Order } from "./types";

export const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "ABERTO":
      return "bg-yellow-500";
    case "FINALIZADO":
      return "bg-green-500";
    case "CANCELADO":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

export const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "ABERTO":
      return "Pendente";
    case "FINALIZADO":
      return "Finalizado";
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Desconhecido";
  }
};

export const calculateProductTotal = (produto: Order["produtos"][0]) => {
  const produtoTotal = produto.produto.preco * produto.quantidade;
  const adicionaisTotal =
    produto.adicionais?.reduce((total, adicional) => {
      return total + adicional.preco * adicional.quantidade;
    }, 0) || 0;
  return produtoTotal + adicionaisTotal;
};

export const calculateAdicionaisTotal = (produto: Order["produtos"][0]) => {
  return (
    produto.adicionais?.reduce((total, adicional) => {
      return total + adicional.preco * adicional.quantidade;
    }, 0) || 0
  );
};

export const calculateOrderTotal = (order: Order) => {
  return order.produtos.reduce((total, produto) => {
    return total + calculateProductTotal(produto);
  }, 0);
};
