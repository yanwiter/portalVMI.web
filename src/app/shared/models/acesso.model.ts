import { IApiRouteBase } from "./api/routes.model";

export class AcessoRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de acesso */
    basePath = "Acesso";
}

export interface AcessoModel {
    id: string;
    nome: string;
    email: string;
    senha: string;
    idPerfil?: string;
    perfilNome?: string;
    status: number;
    tipoAcesso: number;
    tipoPessoa: number;
    telefone?: string;
    cpfCnpj?: string;
    usuario?: string;
    dataExpiracao?: Date | string | null;
    observacoes?: string;
    fotoPerfil?: string;
    tipoSuspensao?: number;
    dataInicioSuspensao?: Date | string | null;
    dataFimSuspensao?: Date | string | null;
    motivoSuspensao?: string;
    idRespSuspensao?: string;
    nomeRespSuspensao?: string;
    dataSuspensao?: Date | string | null;
    dataCriacao?: Date | string | null;
    ultimaAlteracao?: Date | string | null;
    dataInativacao?: Date | string | null;
    status_usuario?: boolean;
    horariosAcesso?: any[];
}