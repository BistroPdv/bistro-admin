export interface ConsultarProdutoResponse {
  codigo_produto: number;
  codigo_produto_integracao: string;
  codigo: string;
  descricao: string;
  unidade: string;
  ncm: string;
  ean: string;
  valor_unitario: number;
  codigo_familia: number;
  tipoItem: string;
  recomendacoes_fiscais: RecomendacoesFiscais;
  peso_liq: number;
  peso_bruto: number;
  altura: number;
  largura: number;
  profundidade: number;
  marca: string;
  modelo: string;
  dias_garantia: number;
  dias_crossdocking: number;
  descr_detalhada: string;
  obs_internas: string;
  imagens: Imagen[];
  videos: any;
  caracteristicas: any;
  tabelas_preco: any;
  info: Info;
  exibir_descricao_nfe: string;
  exibir_descricao_pedido: string;
  medicamento: any;
  combustivel: any;
  veiculo: any;
  armamento: any;
  cst_icms: string;
  modalidade_icms: string;
  csosn_icms: string;
  aliquota_icms: number;
  red_base_icms: number;
  motivo_deson_icms: string;
  per_icms_fcp: number;
  codigo_beneficio: string;
  cst_pis: string;
  aliquota_pis: number;
  red_base_pis: number;
  cst_cofins: string;
  aliquota_cofins: number;
  red_base_cofins: number;
  cfop: string;
  dadosIbpt: DadosIbpt;
  codInt_familia: string;
  descricao_familia: string;
  bloqueado: string;
  bloquear_exclusao: string;
  importado_api: string;
  inativo: string;
  componentes_kit: any;
  lead_time: number;
  aliquota_ibpt: number;
  cest: string;
  quantidade_estoque: number;
  estoque_minimo: number;
  origem_imposto: string;
}

interface RecomendacoesFiscais {
  cnpj_fabricante: string;
  cupom_fiscal: string;
  id_cest: string;
  id_preco_tabelado: number;
  indicador_escala: string;
  market_place: string;
  origem_mercadoria: string;
}

interface Imagen {
  url_imagem: string;
}

interface Info {
  dAlt: string;
  dInc: string;
  hAlt: string;
  hInc: string;
  uAlt: string;
  uInc: string;
}

export interface DadosIbpt {
  aliqEstadual: number;
  aliqFederal: number;
  aliqMunicipal: number;
  chave: string;
  fonte: string;
  valido_ate: string;
  valido_de: string;
  versao: string;
}
