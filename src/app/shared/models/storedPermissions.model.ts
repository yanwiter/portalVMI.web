import { Permission } from '../services/permissions/permissions.service';

/**
 * Interface para permissões armazenadas no localStorage
 */
export interface StoredPermissions {
  /** ID do usuário */
  userId: string;
  
  /** ID do perfil */
  perfilId: string;
  
  /** Lista de permissões */
  permissions: Permission[];
  
  /** Data/hora da última atualização */
  lastUpdated: string;
  
  /** Versão do formato das permissões */
  version: string;
}
