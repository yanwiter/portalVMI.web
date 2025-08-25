import { AnexosModel } from "./anexos.model";
import { IApiRouteBase } from "./api/routes.model";
import { ContatoModel } from "./contato.model";
import { DadoFinanceiroModel } from "./dadoFinanceiro.model";
import { EnderecoModel } from "./endereco.model";

export class ClientesFornecedoresRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de cliente e fornecedores */
    basePath = "ClientesFornecedores";
}

export interface ClientesFornecedoresModel {
    id: string;
    tipoCadastro: number;
    tipoPessoa: number;
    cpfCnpj: string;
    porteEmpresa?: any;
    tipoEmpresa?: any;
    rg?: string;
    razaoSocial?: string;
    nomeFantasia?: any;
    naturezaJuridica?: any;
    optanteMEI?: any;
    optanteSimples?: any;
    regimeTributario?: any;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    cnae?: string;
    atividadeCnae?: string;
    site?: string;
    statusCadastro: boolean;
    dataInclusao?: Date;
    idRespInclusao: string;
    nomeRespInclusao: string;
    dataUltimaModificacao?: Date;
    idRespUltimaModificacao: string;
    nomeRespUltimaModificacao: string;
    dataInativacao?: Date;
    idRespInativacao?: string;
    nomeRespInativacao?: string;
    justificativaInativacao?: string;
    observacoes?: string;

    enderecos: EnderecoModel[];
    contatos: ContatoModel[];
    dadosFinanceiros: DadoFinanceiroModel[];
    anexos: AnexosModel[];
}