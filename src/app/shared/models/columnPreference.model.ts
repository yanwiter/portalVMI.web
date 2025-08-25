import { ColumnConfig } from './column-config.model';
import { IApiRouteBase } from "./api/routes.model";

export class ColumnPreferenceRouteModel implements IApiRouteBase {
  basePath: string = "ColumnPreferences";
}

export interface ColumnPreferenceModel {
  id: string;
  namePreference: string;
  description?: string;
  screenKey: string;
  idUser: string;
  columns: ColumnConfig[];
  isFavorite: boolean;
  isPinned: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Modelo para envio à API - o campo columns é serializado como string
 */
export interface ColumnPreferenceApiModel {
  id?: string;
  namePreference: string;
  description?: string;
  screenKey: string;
  idUser: string;
  columns: string;
  isFavorite: boolean;
  isPinned: boolean;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
}
