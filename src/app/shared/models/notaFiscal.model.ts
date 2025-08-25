export interface NotaFiscal {
  id?: number;
  numero: string;
  serie: string;
  dataEmissao: Date;
  dataVencimento: Date;
  clienteId: number;
  clienteNome: string;
  clienteCnpjCpf: string;
  valorTotal: number;
  valorBaseIcms: number;
  valorIcms: number;
  valorBaseIpi: number;
  valorIpi: number;
  valorBasePis: number;
  valorPis: number;
  valorBaseCofins: number;
  valorCofins: number;
  status: StatusNotaFiscal;
  tipoOperacao: TipoOperacao;
  naturezaOperacao: string;
  observacoes?: string;
  itens: ItemNotaFiscal[];
  aprovadorId?: string;
  aprovadorNome?: string;
  dataAprovacao?: Date;
  observacaoAprovacao?: string;
  historicoAprovacao?: HistoricoAprovacaoNotaFiscal[];
  dataInclusao: Date;
  idRespInclusao: string;
  nomeRespInclusao: string;
  dataUltimaAlteracao?: Date;
  idRespUltimaAlteracao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface ItemNotaFiscal {
  id?: number;
  notaFiscalId: number;
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  cfop: string;
  ncm: string;
  unidadeComercial: string;
  valorBaseIcms: number;
  valorIcms: number;
  aliquotaIcms: number;
  observacoes?: string;
}

export interface HistoricoAprovacaoNotaFiscal {
  id: string;
  notaFiscalId: number;
  acao: AcaoAprovacaoNotaFiscal;
  statusAnterior?: StatusNotaFiscal;
  statusNovo: StatusNotaFiscal;
  observacao: string;
  responsavelId: string;
  responsavelNome: string;
  dataAcao: Date;
}

export enum StatusNotaFiscal {
  RASCUNHO = 'RASCUNHO',
  EM_ANALISE = 'EM_ANALISE',
  APROVADA = 'APROVADA',
  REPROVADA = 'REPROVADA',
  EMITIDA = 'EMITIDA',
  CANCELADA = 'CANCELADA',
  CONTINGENCIA = 'CONTINGENCIA'
}

export enum TipoOperacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA'
}

export enum AcaoAprovacaoNotaFiscal {
  CRIACAO = 'CRIACAO',
  ENVIAR_APROVACAO = 'ENVIAR_APROVACAO',
  APROVAR = 'APROVAR',
  REPROVAR = 'REPROVAR',
  EMITIR = 'EMITIR',
  CANCELAR = 'CANCELAR',
  CORRIGIR = 'CORRIGIR'
}

export interface FiltroNotaFiscal {
  numero?: string;
  clienteNome?: string;
  status?: StatusNotaFiscal;
  tipoOperacao?: TipoOperacao;
  dataInicio?: Date;
  dataFim?: Date;
  dataEmissaoInicio?: Date;
  dataEmissaoFim?: Date;
  valorMinimo?: number;
  valorMaximo?: number;
} 