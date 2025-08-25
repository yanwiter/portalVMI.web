import { TipoMovimentacao, StatusPedido, StatusEstoque } from '../estoque.model';

export const tipoMovimentacaoOptions = [
  { label: 'Entrada', value: TipoMovimentacao.ENTRADA },
  { label: 'Saída', value: TipoMovimentacao.SAIDA },
  { label: 'Ajuste', value: TipoMovimentacao.AJUSTE },
  { label: 'Transferência', value: TipoMovimentacao.TRANSFERENCIA }
];

export const statusPedidoOptions = [
  { label: 'Pendente', value: StatusPedido.PENDENTE },
  { label: 'Aprovado', value: StatusPedido.APROVADO },
  { label: 'Em Preparação', value: StatusPedido.EM_PREPARACAO },
  { label: 'Enviado', value: StatusPedido.ENVIADO },
  { label: 'Recebido', value: StatusPedido.RECEBIDO },
  { label: 'Cancelado', value: StatusPedido.CANCELADO }
];

export const statusEstoqueOptions = [
  { label: 'Normal', value: StatusEstoque.NORMAL },
  { label: 'Baixo', value: StatusEstoque.BAIXO },
  { label: 'Crítico', value: StatusEstoque.CRITICO },
  { label: 'Excesso', value: StatusEstoque.EXCESSO }
];

export const unidadeMedidaOptions = [
  { label: 'Unidade', value: 'UN' },
  { label: 'Quilograma', value: 'KG' },
  { label: 'Gramas', value: 'G' },
  { label: 'Litro', value: 'L' },
  { label: 'Mililitro', value: 'ML' },
  { label: 'Metro', value: 'M' },
  { label: 'Centímetro', value: 'CM' },
  { label: 'Caixa', value: 'CX' },
  { label: 'Pacote', value: 'PCT' },
  { label: 'Fardo', value: 'FD' }
];

export const motivoMovimentacaoOptions = [
  { label: 'Compra', value: 'Compra' },
  { label: 'Venda', value: 'Venda' },
  { label: 'Ajuste de Inventário', value: 'Ajuste de Inventário' },
  { label: 'Transferência entre Almoxarifados', value: 'Transferência entre Almoxarifados' },
  { label: 'Devolução de Cliente', value: 'Devolução de Cliente' },
  { label: 'Devolução para Fornecedor', value: 'Devolução para Fornecedor' },
  { label: 'Perda/Avaria', value: 'Perda/Avaria' },
  { label: 'Doação', value: 'Doação' },
  { label: 'Outros', value: 'Outros' }
]; 