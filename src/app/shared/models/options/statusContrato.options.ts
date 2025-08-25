import { StatusContrato } from '../contrato.model';

export const statusContratoOptions = [
  { label: 'Rascunho', value: StatusContrato.RASCUNHO },
  { label: 'Em Análise', value: StatusContrato.EM_ANALISE },
  { label: 'Aprovado', value: StatusContrato.APROVADO },
  { label: 'Reprovado', value: StatusContrato.REPROVADO },
  { label: 'Em Vigor', value: StatusContrato.EM_VIGOR },
  { label: 'Encerrado', value: StatusContrato.ENCERRADO },
  { label: 'Cancelado', value: StatusContrato.CANCELADO }
]; 