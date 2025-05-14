import { IApiRouteBase } from "./api/routes.model";

export class LoginRouteModel implements IApiRouteBase {
    /** Caminho base para a API de entradas de Login */
    basePath = "Login";
}

export interface LoginModel {
    username: string;
    password: string;
    typeUser: string;
}