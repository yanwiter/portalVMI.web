export interface DashboardMetricasResponse {
  totalProdutos: number;
  produtosBaixoEstoque: number;
  produtosCriticos: number;
  valorTotalEstoque: number;
  movimentacoesHoje: number;
  pedidosPendentes: number;
}

export interface GraficoEstoqueResponse {
  normal: number;
  baixo: number;
  critico: number;
  excesso: number;
}

export interface GraficoMovimentacaoResponse {
  labels: string[];
  entradas: number[];
  saidas: number[];
}

export interface GraficoCategoriasResponse {
  labels: string[];
  data: number[];
}

export interface RelatorioGeralResponse {
  valorTotalEstoque: number;
  totalProdutos: number;
} 