import { IApiRouteBase } from "./api/routes.model";

export class ClientesFornecedoresRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de cliente e fornecedores */
    basePath = "ClientesFornecedores";
}

export interface ClientesFornecedores {
    id?: string;
    nome?: string;
    tipo?: string;
    periodoContratacao?: string;
    status?: string;
}