import { MessageService } from "primeng/api";
import { ClienteFornecedorEnum } from "../models/enums/clienteFornecedor.enum";
import { TipoPessoaEnum } from "../models/enums/tipoPessoa.enum";
import { getDataAtualFormatada } from "./dateUtil";
import { TipoAcessoEnum } from "../models/enums/tipoAcesso.enum";

/**
 * Obtém a severidade apropriada para um tipo de acesso
 * @param type Tipo de acesso
 * @returns Severidade correspondente
 */
export function getSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
  switch (type.toUpperCase()) {
    case 'INCLUSÃO':
      return 'success';
    case 'EXCLUSÃO':
      return 'danger';
    case 'EDIÇÃO':
      return 'warning';
    case 'VISUALIZAÇÃO':
      return 'info';
    default:
      return 'contrast';
  }
}

/**
 * Obtém o texto do tipo de acesso
 * @param type Tipo de acesso
 * @returns Texto do tipo de acesso
 */
export function getAccessLabel(type: string): string {
  switch (type.toUpperCase()) {
    case 'INCLUSÃO': return 'Inclusão';
    case 'EXCLUSÃO': return 'Exclusão';
    case 'EDIÇÃO': return 'Edição';
    case 'VISUALIZAÇÃO': return 'Visualização';
    default: return type;
  }
}

/**
 * Formata um valor monetário
 * @param value Valor a ser formatado
 * @returns Valor formatado com R$
 */
export function formatCurrency(value: any): string {
  return parseFloat(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Valida um CPF
 * @param cpf CPF a ser validado
 * @returns true se o CPF for válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const cpfArray = cpf.split('').map(el => +el);
  const rest = (count: number) => (cpfArray.slice(0, count - 12)
    .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10 % 11 % 10);

  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
}

/**
 * Valida um CNPJ
 * @param cnpj CNPJ a ser validado
 * @returns true se o CNPJ for válido, false caso contrário
 */
export function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

  const cnpjArray = cnpj.split('').map(el => +el);
  const peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const rest = (count: number) => (cnpjArray.slice(0, count - 12)
    .reduce((soma, el, index) => (soma + el * peso[index]), 0) % 11);

  const calcDigit = (t: number) => rest(t) < 2 ? 0 : 11 - rest(t);

  return calcDigit(12) === cnpjArray[12] && calcDigit(13) === cnpjArray[13];
}

/**
 * Formata um CPF ou CNPJ
 * @param value Valor a ser formatado
 * @returns Valor formatado ou 'N/A' se não for válido
 */
export function formataCPFCNPJ(value: string): string {
  if (!value) return 'N/A';

  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length === 11) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  if (cleanValue.length === 14) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return value;
}

/**
 * Obtém o texto do tipo de pessoa
 * @param tipo Tipo de pessoa
 * @returns Texto do tipo de pessoa
 */
export function getTipoPessoaText(tipo: TipoPessoaEnum): string {
  return tipo === TipoPessoaEnum.Fisica ? 'Pessoa Física' : 'Pessoa Jurídica';
}

/**
 * Obtém o texto do tipo de cadastro
 * @param tipo Tipo de cadastro
 * @returns Texto do tipo de cadastro
 */
export function getTipoCadastroText(tipo: ClienteFornecedorEnum): string {
  return tipo === ClienteFornecedorEnum.Cliente ? 'Cliente' : 'Fornecedor';
}

/**
 * Obtém o texto do tipo de acesso
 * @param tipo Tipo de acesso
 * @returns Texto do tipo de acesso
 */
export function getTipoAcessoText(tipo: TipoAcessoEnum): string {
  switch (tipo) {
    case TipoAcessoEnum.Interno:
      return 'Interno';
    case TipoAcessoEnum.Externo:
      return 'Externo';
    default:
      return 'Fornecedor';
  }
}

/**
 * Trata o sucesso na exportação para Excel
 * @param blob Dados do arquivo Excel
 */
export function handleExcelExportSuccess(blob: Blob, legenda: string): void {
  const dataAtual = getDataAtualFormatada();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `${legenda} ${dataAtual}.xlsx`;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

}

/**
 * Exibe uma mensagem de retorno
 * @param messageService Serviço de mensagens
 * @param severity Severidade da mensagem
 * @param summary Sumário da mensagem
 * @param detail Detalhes da mensagem
 * @param life Tempo de vida da mensagem em milissegundos
 */
export function messageOfReturns(messageService: MessageService, severity: string, summary: string, detail: string, life: number): void {
  messageService.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: life
  });
}

/**
* Verifica se uma string é um GUID válido
*/
export function isGuid(str: string): boolean {
 const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 return guidRegex.test(str);
}

/**
 * Gera um ID único baseado em timestamp e número aleatório
 * @returns String com ID único
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}