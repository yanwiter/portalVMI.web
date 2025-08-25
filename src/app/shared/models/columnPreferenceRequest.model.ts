import { ColumnConfig } from './column-config.model';

export interface ColumnPreferenceRequest {
  name: string;
  description?: string;
  columns: ColumnConfig[];
  isFavorite: boolean;
  isPinned: boolean;
  screenKey?: string;
}
