import { PermissionEventType } from './enums/permission-event-type.enum';

/**
 * Interface para eventos de permissão
 */
export interface PermissionEvent {
  type: PermissionEventType;
  data?: any;
  timestamp: Date;
}
