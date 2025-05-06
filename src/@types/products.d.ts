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
  ativo: boolean;
  produtos: Product[];
  Impressora: PrintTypes | null;
  ativo: boolean;
  tipoAdicional?: string; // Campo mantido para compatibilidade com dados existentes
  tituloAdicionalFixo?: string; // Campo mantido para compatibilidade com dados existentes
  opcoesAdicionais?: {
    id?: string;
    nome: string;
    preco?: number;
    ativo: boolean;
  }[]; // Campo mantido para compatibilidade com dados existentes
  adicionais?: Adicional[];
}

export interface Adicional {
  id?: string;
  titulo: string;
  qtdMinima: number;
  qtdMaxima: number;
  obrigatorio: boolean;
  ativo: boolean;
  opcoes: {
    id?: string;
    nome: string;
    preco?: number;
    delete: boolean;
    ativo: boolean;
    codIntegra?: string;
    isImported?: boolean;
  }[];
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
  ordem: number;
  categoriaId: string;
  externoId: any;
  codigo: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
  ativo: boolean;
}

export interface ProdutosOmie {
  pagina: number;
  total_de_paginas: number;
  registros: number;
  total_de_registros: number;
  produto_servico_cadastro: ProdutoServicoCadastro[];
}

export interface ProdutoServicoCadastro {
  aliquota_cofins: number;
  aliquota_ibpt: number;
  aliquota_icms: number;
  aliquota_pis: number;
  altura: number;
  bloqueado: string;
  bloquear_exclusao: string;
  cest: string;
  cfop: string;
  codInt_familia: string;
  codigo: string;
  codigo_beneficio: string;
  codigo_familia: number;
  codigo_produto: number;
  codigo_produto_integracao: string;
  csosn_icms: string;
  cst_cofins: string;
  cst_icms: string;
  cst_pis: string;
  descr_detalhada: string;
  descricao: string;
  descricao_familia: string;
  dias_crossdocking: number;
  dias_garantia: number;
  ean: string;
  estoque_minimo: number;
  exibir_descricao_nfe: string;
  exibir_descricao_pedido: string;
  importado_api: string;
  inativo: string;
  info: Info;
  largura: number;
  lead_time: number;
  marca: string;
  modelo: string;
  motivo_deson_icms: string;
  ncm: string;
  obs_internas: string;
  per_icms_fcp: number;
  peso_bruto: number;
  peso_liq: number;
  profundidade: number;
  quantidade_estoque: number;
  recomendacoes_fiscais: RecomendacoesFiscais;
  red_base_cofins: number;
  red_base_icms: number;
  red_base_pis: number;
  tipoItem: string;
  unidade: string;
  valor_unitario: number;
}

export interface Info {
  dAlt: string;
  dInc: string;
  hAlt: string;
  hInc: string;
  uAlt: string;
  uInc: string;
}

export interface RecomendacoesFiscais {
  cnpj_fabricante: string;
  cupom_fiscal: string;
  id_cest: string;
  id_preco_tabelado: number;
  indicador_escala: string;
  market_place: string;
  origem_mercadoria: string;
}
