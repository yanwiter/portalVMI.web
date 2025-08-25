import { AcessoRouteModel } from "../acesso.model";
import { ClientesFornecedoresRouteModel } from "../clientesFornecedores.model";
import { LoginRouteModel } from "../login.model";
import { UsuarioRouteModel } from "../usuario.model";
import { NotaFiscalRouteModel } from "../notaFiscalRoute.model";
import { ProdutoRouteModel } from "../produtoRoute.model";
import { PontoRouteModel } from "../pontoRoute.model";
import { SessaoRouteModel } from "../sessaoRoute.model";
import { ContratoRouteModel } from "../contrato.model";
import { EstoqueRouteModel } from "../estoqueRoute.model";import { ColumnPreferenceRouteModel } from "../columnPreference.model";
export interface IApiEndpoints {

  loginRoutes: LoginRouteModel;
  perfilRoutes: UsuarioRouteModel;
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
