export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria: string;
  unidadeMedida: string;
  precoUnitario: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  estoqueAtual: number;
  status: boolean;
  dataInclusao: Date;
  dataUltimaAlteracao?: Date;
  nomeRespInclusao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  status: boolean;
  dataInclusao: Date;
  dataUltimaAlteracao?: Date;
  nomeRespInclusao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produto?: Produto;
  tipoMovimentacao: TipoMovimentacao;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  motivo: string;
  documento?: string;
  fornecedor?: string;
  cliente?: string;
  observacoes?: string;
  dataMovimentacao: Date;
  nomeRespMovimentacao?: string;
  idRespMovimentacao?: number;
}

export enum TipoMovimentacao {
  ENTRADA = 'Entrada',
  SAIDA = 'Saída',
  AJUSTE = 'Ajuste',
  TRANSFERENCIA = 'Transferência'
}

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status: boolean;
  dataInclusao: Date;
  dataUltimaAlteracao?: Date;
  nomeRespInclusao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface PedidoCompra {
  id: number;
  numero: string;
  fornecedorId: number;
  fornecedor?: Fornecedor;
  dataPedido: Date;
  dataEntrega?: Date;
  status: StatusPedido;
  valorTotal: number;
  observacoes?: string;
  itens: ItemPedidoCompra[];
  dataInclusao: Date;
  dataUltimaAlteracao?: Date;
  nomeRespInclusao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface ItemPedidoCompra {
  id: number;
  pedidoCompraId: number;
  produtoId: number;
  produto?: Produto;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
}

export enum StatusPedido {
  PENDENTE = 'Pendente',
  APROVADO = 'Aprovado',
  EM_PREPARACAO = 'Em Preparação',
  ENVIADO = 'Enviado',
  RECEBIDO = 'Recebido',
  CANCELADO = 'Cancelado'
}

export interface RelatorioEstoque {
  produtoId: number;
  produto?: Produto;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  valorTotalEstoque: number;
  ultimaMovimentacao?: Date;
  diasSemMovimentacao: number;
  statusEstoque: StatusEstoque;
}

export enum StatusEstoque {
  NORMAL = 'Normal',
  BAIXO = 'Baixo',
  CRITICO = 'Crítico',
  EXCESSO = 'Excesso'
}

export interface FiltroEstoque {
  codigo?: string;
  nome?: string;
  categoria?: number;
  status?: boolean;
  estoqueMinimo?: boolean;
  estoqueMaximo?: boolean;
}

export interface FiltroMovimentacao {
  produtoId?: number;
  tipoMovimentacao?: TipoMovimentacao;
  dataInicio?: Date;
  dataFim?: Date;
  fornecedor?: string;
  cliente?: string;
}

export interface FiltroPedidoCompra {
  numero?: string;
  fornecedorId?: number;
  status?: StatusPedido;
  dataInicio?: Date;
  dataFim?: Date;
} 