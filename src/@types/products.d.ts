export interface Category {
  id: string;
  nome: string;
  imagem: string;
  cor: string;
  ordem: number;
  temPromocao: boolean;
  externoId: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
  produtos: Product[];
  Impressora: PrintTypes;
  tipoAdicional?: string; // Campo mantido para compatibilidade com dados existentes
  tituloAdicionalFixo?: string; // Campo mantido para compatibilidade com dados existentes
  opcoesAdicionais?: { nome: string }[]; // Campo mantido para compatibilidade com dados existentes
  adicionais?: Adicional[];
}

export interface Adicional {
  titulo: string;
  qtdMinima: number;
  qtdMaxima: number;
  obrigatorio: boolean;
  opcoes: { nome: string }[];
}

export interface PrintTypes {
  id?: string;
  nome: string;
  ip: string;
  port: number;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  preco: number;
  categoriaId: string;
  externoId: any;
  codigo: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
}
