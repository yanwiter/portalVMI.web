export interface DadoFinanceiroModel {
    id?: string;
    idClienteFornecedor?: string;
    limiteCredito?: number;
    condicaoPagamento?: any;
    banco?: any;
    agencia?: string;
    conta?: string;
    tipoConta?: any;
    chavePix?: string;
}