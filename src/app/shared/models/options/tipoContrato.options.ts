import { TipoContrato } from '../contrato.model';

export const tipoContratoOptions = [
  { label: 'Compra', value: TipoContrato.COMPRA },
  { label: 'Venda', value: TipoContrato.VENDA },
  { label: 'Prestação de Serviços', value: TipoContrato.PRESTACAO_SERVICOS },
  { label: 'Locação', value: TipoContrato.LOCACAO },
  { label: 'Parceria', value: TipoContrato.PARCERIA },
  { label: 'Outros', value: TipoContrato.OUTROS }
]; 