import { AcessoRouteModel } from "../acesso.model";
import { ClientesFornecedoresRouteModel } from "../clientesFornecedores.model";
import { LoginRouteModel } from "../login.model";
import { UsuarioRouteModel } from "../usuario.model";

export interface IApiEndpoints {

  loginRoutes: LoginRouteModel;
  perfilRoutes: UsuarioRouteModel;
  usuarioRoutes: UsuarioRouteModel;
  acessoRoutes: AcessoRouteModel;
  clientesAndFornecedoresRoutes: ClientesFornecedoresRouteModel

}
export interface IApiRoutesBase {
  apiBasePath: string;
  endpoints: IApiEndpoints;
}

export class ApiRoutesBase implements IApiRoutesBase {
  apiBasePath: string;
  endpoints: IApiEndpoints;

  constructor( apiBasePath: string, endpoints: IApiEndpoints) {
    this.apiBasePath = apiBasePath;
    this.endpoints = endpoints;
  }
}

export interface IApiRouteBase {
  basePath: string;
}
