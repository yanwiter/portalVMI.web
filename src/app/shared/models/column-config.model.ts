export interface ColumnConfig {
  field: string;
  header: string;
  visible: boolean;
  order: number;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}
