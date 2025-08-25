import { StatusNotaFiscal } from '../notaFiscal.model';

export const statusNotaFiscalOptions = [
  { label: 'Rascunho', value: StatusNotaFiscal.RASCUNHO },
  { label: 'Em Análise', value: StatusNotaFiscal.EM_ANALISE },
  { label: 'Aprovada', value: StatusNotaFiscal.APROVADA },
  { label: 'Reprovada', value: StatusNotaFiscal.REPROVADA },
  { label: 'Emitida', value: StatusNotaFiscal.EMITIDA },
  { label: 'Cancelada', value: StatusNotaFiscal.CANCELADA },
  { label: 'Contingência', value: StatusNotaFiscal.CONTINGENCIA }
]; 