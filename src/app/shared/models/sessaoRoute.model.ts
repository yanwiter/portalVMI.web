import { IApiRouteBase } from "./api/routes.model";

export interface SessaoRouteModel extends IApiRouteBase {
  getAll: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
  encerrar: string;
  encerrarMultiplas: string;
  exportarExcel: string;
}

export class SessaoRouteModel implements SessaoRouteModel {
  basePath: string = 'api/v1/sessoes';
  getAll: string = '';
  getById: string = '{id}';
  create: string = '';
  update: string = '{id}';
  delete: string = '{id}';
  encerrar: string = 'encerrar';
  encerrarMultiplas: string = 'encerrar-multiplas';
  exportarExcel: string = 'exportar-excel';
}