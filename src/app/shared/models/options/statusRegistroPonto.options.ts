import { StatusRegistroPonto } from '../ponto.model';

export const statusRegistroPontoOptions = [
  { label: 'Pendente', value: StatusRegistroPonto.PENDENTE },
  { label: 'Aprovado', value: StatusRegistroPonto.APROVADO },
  { label: 'Reprovado', value: StatusRegistroPonto.REPROVADO },
  { label: 'Corrigido', value: StatusRegistroPonto.CORRIGIDO }
]; 