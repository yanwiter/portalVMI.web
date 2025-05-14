import { environment } from "../../../../environments/environment";
import { AcessoRouteModel } from "../acesso.model";
import { ClientesFornecedoresRouteModel } from "../clientesFornecedores.model";
import { LoginRouteModel } from "../login.model";
import { PerfilRouteModel } from "../perfil.model";
import { UsuarioRouteModel } from "../usuario.model";
import { ApiRoutesBase, IApiEndpoints } from "./routes.model";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ApiEndpoints implements IApiEndpoints {

  loginRoutes: LoginRouteModel;
  perfilRoutes: PerfilRouteModel;
  usuarioRoutes: UsuarioRouteModel;
  acessoRoutes: AcessoRouteModel;
  clientesAndFornecedoresRoutes: ClientesFornecedoresRouteModel

  constructor() {

    this.loginRoutes = new LoginRouteModel();
    this.perfilRoutes = new PerfilRouteModel();
    this.usuarioRoutes = new UsuarioRouteModel();
    this.acessoRoutes = new AcessoRouteModel();
    this.clientesAndFornecedoresRoutes = new ClientesFornecedoresRouteModel();

  }
}

export class ApiRoutesV1 extends ApiRoutesBase {
  constructor() {
    const apiBasePath = `${environment.apiServer}`;
    const endpoints = new ApiEndpoints();
    super(apiBasePath, endpoints);
  }

  getFullUrl = (endpoint: keyof IApiEndpoints, specificRoute?: string[]): string => {
    let baseUri = `${this.apiBasePath}/${this.endpoints[endpoint].basePath}`;

    if (specificRoute && specificRoute.length > 0) {
        baseUri += `/${specificRoute.join("/")}`;
    }
    return baseUri;
  };

  getQueryParams = (args: string[]): string => {
      if (!args || args.length === 0) return '';
      
      const joinedParams = args.join('&');
      
      return joinedParams.startsWith('?') ? joinedParams : `?${joinedParams}`;
  };
}
