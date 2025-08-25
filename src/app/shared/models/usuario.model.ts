import { IApiRouteBase } from "./api/routes.model";
import { HorarioAcesso } from "./horariosAcesso.model";

export class UsuarioRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de usuarios */
    basePath = "Usuario";
}

export interface UsuarioModel {
    id: string;
    nome: string;
    email: string;
    senha: string;
    dataCriacao: Date;
    ultimaAlteracao: Date;
    dataInativacao: Date;
    status_usuario: boolean;
    perfilNome: string;
    idPerfil?: string;
    horariosAcesso?: HorarioAcesso[];
    fotoPerfil?: string;
}