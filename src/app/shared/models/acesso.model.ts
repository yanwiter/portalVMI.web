import { IApiRouteBase } from "./api/routes.model";

export class AcessoRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de acesso */
    basePath = "Acesso";
}

export interface AcessoModel {
    id: number;
    nome: string;
}