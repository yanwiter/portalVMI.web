import { IApiRouteBase } from "./api/routes.model";

export class RotinaRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de rotinas */
    basePath = "rotina";
}

export interface Rotina {
    id: number;
    nome: string;
    modulo_id: number;
}