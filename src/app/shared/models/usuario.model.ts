import { IApiRouteBase } from "./api/routes.model";

export class UsuarioRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de usuarios */
    basePath = "Usuario";
}

export interface UsuarioModel {
    id: number;
    nome: string;
    email: string;
    senha: string;
    dataCriacao: Date;
    ultimaAlteracao: Date;
    status_usuario: boolean;
    perfilNome: string;
}