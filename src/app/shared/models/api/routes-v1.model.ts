import { environment } from "../../../../environments/environment";
import { AcessoRouteModel } from "../acesso.model";
import { ClientesFornecedoresRouteModel } from "../clientesFornecedores.model";
import { LoginRouteModel } from "../login.model";
import { PerfilRouteModel } from "../perfil.model";
import { UsuarioRouteModel } from "../usuario.model";
import { NotaFiscalRouteModel } from "../notaFiscalRoute.model";
import { ProdutoRouteModel } from "../produtoRoute.model";
import { PontoRouteModel } from "../pontoRoute.model";
import { SessaoRouteModel } from "../sessaoRoute.model";
import { ContratoRouteModel } from "../contrato.model";
import { EstoqueRouteModel } from "../estoqueRoute.model";
import { ColumnPreferenceRouteModel } from "../columnPreference.model";
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
  clientesAndFornecedoresRoutes: ClientesFornecedoresRouteModel;
  notaFiscalRoutes: NotaFiscalRouteModel;
  produtoRoutes: ProdutoRouteModel;
  pontoRoutes: PontoRouteModel;
  sessaoRoutes: SessaoRouteModel;
  contratoRoutes: ContratoRouteModel;
  estoqueRoutes: EstoqueRouteModel;
  columnPreferenceRoutes: ColumnPreferenceRouteModel;

  constructor() {

    this.loginRoutes = new LoginRouteModel();
    this.perfilRoutes = new PerfilRouteModel();
    this.usuarioRoutes = new UsuarioRouteModel();
    this.acessoRoutes = new AcessoRouteModel();
    this.clientesAndFornecedoresRoutes = new ClientesFornecedoresRouteModel();
    this.notaFiscalRoutes = new NotaFiscalRouteModel();
    this.produtoRoutes = new ProdutoRouteModel();
    this.pontoRoutes = new PontoRouteModel();
    this.sessaoRoutes = new SessaoRouteModel();
    this.contratoRoutes = new ContratoRouteModel();
    this.estoqueRoutes = new EstoqueRouteModel();
    this.columnPreferenceRoutes = new ColumnPreferenceRouteModel();

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
