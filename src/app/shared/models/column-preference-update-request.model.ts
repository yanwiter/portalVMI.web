import { ColumnConfig } from './column-config.model';

export interface ColumnPreferenceUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  columns?: ColumnConfig[];
  isFavorite?: boolean;
  isPinned?: boolean;
}
