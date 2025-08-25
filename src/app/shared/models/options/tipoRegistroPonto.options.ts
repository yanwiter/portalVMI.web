import { TipoRegistroPonto } from '../ponto.model';

export const tipoRegistroPontoOptions = [
  { label: 'Entrada', value: TipoRegistroPonto.ENTRADA },
  { label: 'Saída', value: TipoRegistroPonto.SAIDA },
  { label: 'Entrada Intervalo', value: TipoRegistroPonto.ENTRADA_INTERVALO },
  { label: 'Saída Intervalo', value: TipoRegistroPonto.SAIDA_INTERVALO },
  { label: 'Correção', value: TipoRegistroPonto.CORRECAO }
]; 