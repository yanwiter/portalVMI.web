export interface Contrato {
  id?: string;
  numero: string;
  titulo: string;
  descricao: string;
  clienteId: string;
  clienteNome: string;
  valorTotal: number;
  dataInicio: Date;
  dataFim: Date;
  status: StatusContrato;
  tipoContrato: TipoContrato;
  responsavelId: string;
  responsavelNome: string;
  aprovadorId?: string;
  aprovadorNome?: string;
  dataAprovacao?: Date;
  observacoes?: string;
  anexos?: AnexoContrato[];
  historicoAprovacao?: HistoricoAprovacao[];
  dataInclusao: Date;
  idRespInclusao: string;
  nomeRespInclusao: string;
  dataUltimaAlteracao?: Date;
  idRespUltimaAlteracao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface AnexoContrato {
  id: string;
  contratoId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  dataUpload: Date;
}

export interface HistoricoAprovacao {
  id: string;
  contratoId: string;
  acao: AcaoAprovacao;
  statusAnterior?: StatusContrato;
  statusNovo: StatusContrato;
  observacao: string;
  responsavelId: string;
  responsavelNome: string;
  dataAcao: Date;
}

export enum StatusContrato {
  RASCUNHO = 'RASCUNHO',
  EM_ANALISE = 'EM_ANALISE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  EM_VIGOR = 'EM_VIGOR',
  ENCERRADO = 'ENCERRADO',
  CANCELADO = 'CANCELADO'
}

export enum TipoContrato {
  COMPRA = 'COMPRA',
  VENDA = 'VENDA',
  PRESTACAO_SERVICOS = 'PRESTACAO_SERVICOS',
  LOCACAO = 'LOCACAO',
  PARCERIA = 'PARCERIA',
  OUTROS = 'OUTROS'
}

export enum AcaoAprovacao {
  CRIACAO = 'CRIACAO',
  ENVIAR_APROVACAO = 'ENVIAR_APROVACAO',
  APROVAR = 'APROVAR',
  REPROVAR = 'REPROVAR',
  ATIVAR = 'ATIVAR',
  ENCERRAR = 'ENCERRAR',
  CANCELAR = 'CANCELAR',
  CORRIGIR = 'CORRIGIR'
}

export interface FiltroContrato {
  numero?: string;
  titulo?: string;
  clienteId?: string;
  status?: StatusContrato;
  tipoContrato?: TipoContrato;
  responsavelId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  valorMinimo?: number;
  valorMaximo?: number;
}

export interface ContratoRouteModel {
  basePath: string;
  getAll: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
  approve: string;
  reject: string;
  sendForApproval: string;
  getHistory: string;
}

export class ContratoRouteModel implements ContratoRouteModel {
  basePath = 'contratos';
  getAll = 'getAll';
  getById = 'getById';
  create = 'create';
  update = 'update';
  delete = 'delete';
  approve = 'approve';
  reject = 'reject';
  sendForApproval = 'sendForApproval';
  getHistory = 'getHistory';
} 