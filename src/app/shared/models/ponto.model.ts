export interface Funcionario {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataAdmissao: Date;
  status: StatusFuncionario;
  horarioTrabalho: HorarioTrabalho;
  
  // Informações pessoais
  dataNascimento?: Date;
  sexo?: string;
  estadoCivil?: string;
  rg?: string;
  orgaoExpedidor?: string;
  dataExpedicao?: Date;
  
  // Informações profissionais
  tipoContrato?: string;
  dataContratacao?: Date;
  dataDemissao?: Date;
  salario?: number;
  valeRefeicao?: number;
  valeTransporte?: number;
  supervisor?: string;
  
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  tipoEndereco?: string;
  
  // Contato
  telefone?: string;
  celular?: string;
  email?: string;
  emailCorporativo?: string;
  telefoneEmergencia?: string;
  contatoEmergencia?: string;
  
  // Documentos
  pis?: string;
  tituloEleitor?: string;
  zonaEleitoral?: string;
  certificadoReservista?: string;
  carteiraTrabalho?: string;
  serieCarteiraTrabalho?: string;
  dataEmissaoCarteiraTrabalho?: Date;
  ufCarteiraTrabalho?: string;
  carteiraIdentidade?: string;
  
  // Informações adicionais
  nacionalidade?: string;
  naturalidade?: string;
  ufNaturalidade?: string;
  escolaridade?: string;
  formacao?: string;
  instituicaoEnsino?: string;
  observacoes?: string;
  
  // Campos de auditoria
  dataInclusao: Date;
  idRespInclusao: string;
  nomeRespInclusao: string;
  dataUltimaAlteracao?: Date;
  idRespUltimaAlteracao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface RegistroPonto {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  data: Date;
  horaEntrada?: Date;
  horaSaida?: Date;
  horaEntradaIntervalo?: Date;
  horaSaidaIntervalo?: Date;
  tipoRegistro: TipoRegistroPonto;
  justificativa?: string;
  status: StatusRegistroPonto;
  horasExtras?: number;
  horasExtrasAprovadas?: number;
  aprovadorId?: string;
  aprovadorNome?: string;
  dataAprovacao?: Date;
  observacaoAprovacao?: string;
  historicoAprovacao?: HistoricoAprovacaoPonto[];
  dataInclusao: Date;
  idRespInclusao: string;
  nomeRespInclusao: string;
  dataUltimaAlteracao?: Date;
  idRespUltimaAlteracao?: string;
  nomeRespUltimaAlteracao?: string;
}

export interface HistoricoAprovacaoPonto {
  id: string;
  registroPontoId: string;
  acao: AcaoAprovacaoPonto;
  statusAnterior?: StatusRegistroPonto;
  statusNovo: StatusRegistroPonto;
  horasExtrasAnterior?: number;
  horasExtrasNovo?: number;
  observacao: string;
  responsavelId: string;
  responsavelNome: string;
  dataAcao: Date;
}

export interface HorarioTrabalho {
  id: string;
  nome: string;
  horaEntrada: string;
  horaSaida: string;
  horaInicioIntervalo: string;
  horaFimIntervalo: string;
  toleranciaEntrada: number;
  toleranciaSaida: number;
  cargaHorariaSemanal: number;
  cargaHorariaDiaria: number;
  diasTrabalho: DiaSemana[];
  ativo: boolean;
}

export interface FiltroPonto {
  funcionarioId?: string;
  funcionarioNome?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: StatusRegistroPonto;
  tipoRegistro?: TipoRegistroPonto;
  temHorasExtras?: boolean;
}

export interface FiltroFuncionario {
  nome?: string;
  matricula?: string;
  cpf?: string;
  departamento?: string;
  status?: StatusFuncionario;
  cargo?: string;
}

export interface RelatorioPonto {
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  departamento: string;
  periodo: {
    dataInicio: Date;
    dataFim: Date;
  };
  totalDiasTrabalhados: number;
  totalHorasTrabalhadas: number;
  totalHorasEfetivas: number;
  totalAtrasos: number;
  totalSaidasAntecipadas: number;
  totalFaltas: number;
  totalHorasExtras: number;
  registros: RegistroPonto[];
}

export enum StatusFuncionario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  FERIAS = 'FERIAS',
  LICENCA = 'LICENCA'
}

export enum StatusRegistroPonto {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  CORRIGIDO = 'CORRIGIDO'
}

export enum TipoRegistroPonto {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  ENTRADA_INTERVALO = 'ENTRADA_INTERVALO',
  SAIDA_INTERVALO = 'SAIDA_INTERVALO',
  CORRECAO = 'CORRECAO'
}

export enum DiaSemana {
  SEGUNDA = 'SEGUNDA',
  TERCA = 'TERCA',
  QUARTA = 'QUARTA',
  QUINTA = 'QUINTA',
  SEXTA = 'SEXTA',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

export enum AcaoAprovacaoPonto {
  CRIACAO = 'CRIACAO',
  ENVIAR_APROVACAO = 'ENVIAR_APROVACAO',
  APROVAR = 'APROVAR',
  REPROVAR = 'REPROVAR',
  CORRIGIR = 'CORRIGIR',
  APROVAR_HORAS_EXTRAS = 'APROVAR_HORAS_EXTRAS',
  REPROVAR_HORAS_EXTRAS = 'REPROVAR_HORAS_EXTRAS'
}

export interface ConfiguracaoPonto {
  id: string;
  empresaId: string;
  toleranciaAtraso: number; // em minutos
  toleranciaSaidaAntecipada: number; // em minutos
  considerarIntervalo: boolean;
  permitirCorrecao: boolean;
  exigirJustificativa: boolean;
  permitirRegistroExterno: boolean;
  exigirGeolocalizacao: boolean;
  horarioInicioExpediente: string; // formato HH:mm
  horarioFimExpediente: string; // formato HH:mm
  diasTrabalho: DiaSemana[];
  observacoes?: string;
  dataInclusao: Date;
  idRespInclusao: string;
  nomeRespInclusao: string;
  dataUltimaModificacao?: Date;
  idRespUltimaModificacao?: string;
  nomeRespUltimaModificacao?: string;
} 