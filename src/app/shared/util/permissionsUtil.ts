import { Permission } from '../services/permissions/permissions.service';
import { StoredPermissions } from '../models/storedPermissions.model';

/**
 * Utilitário para gerenciar permissões no localStorage
 */
export class PermissionsUtil {
  private static readonly STORAGE_KEY = 'userPermissions';
  private static readonly VERSION = '1.0.0';

  /**
   * Salva as permissões no localStorage
   */
  static savePermissions(userId: string, perfilId: string, permissions: Permission[]): void {
    try {
      const permissionsData: StoredPermissions = {
        userId,
        perfilId,
        permissions,
        lastUpdated: new Date().toISOString(),
        version: this.VERSION
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(permissionsData));
    } catch (error) {
      console.error('Erro ao salvar permissões no localStorage:', error);
    }
  }

  /**
   * Carrega as permissões do localStorage
   */
  static loadPermissions(userId: string, perfilId: string): Permission[] | null {
    try {
      const permissionsData = localStorage.getItem(this.STORAGE_KEY);
      if (!permissionsData) {
        return null;
      }

      const parsed: StoredPermissions = JSON.parse(permissionsData);
      
      if (parsed.userId === userId && parsed.perfilId === perfilId) {
        const lastUpdated = new Date(parsed.lastUpdated);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return parsed.permissions;
        } else {
          this.clearPermissions();
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar permissões do localStorage:', error);
      this.clearPermissions();
      return null;
    }
  }

  /**
   * Verifica se existem permissões válidas no localStorage
   */
  static hasValidPermissions(userId: string, perfilId: string): boolean {
    try {
      const permissionsData = localStorage.getItem(this.STORAGE_KEY);
      if (!permissionsData) {
        return false;
      }

      const parsed: StoredPermissions = JSON.parse(permissionsData);
      
      if (parsed.userId === userId && parsed.perfilId === perfilId) {
        const lastUpdated = new Date(parsed.lastUpdated);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        return hoursDiff < 24;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpa as permissões do localStorage
   */
  static clearPermissions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Permissões removidas do localStorage');
    } catch (error) {
      console.error('Erro ao limpar permissões do localStorage:', error);
    }
  }

  /**
   * Obtém informações sobre as permissões armazenadas
   */
  static getPermissionsInfo(): { exists: boolean; lastUpdated?: string; version?: string } {
    try {
      const permissionsData = localStorage.getItem(this.STORAGE_KEY);
      if (!permissionsData) {
        return { exists: false };
      }

      const parsed: StoredPermissions = JSON.parse(permissionsData);
      return {
        exists: true,
        lastUpdated: parsed.lastUpdated,
        version: parsed.version
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Verifica se as permissões precisam ser atualizadas
   */
  static needsUpdate(userId: string, perfilId: string): boolean {
    try {
      const permissionsData = localStorage.getItem(this.STORAGE_KEY);
      if (!permissionsData) {
        return true;
      }

      const parsed: StoredPermissions = JSON.parse(permissionsData);
      
      if (parsed.userId !== userId || parsed.perfilId !== perfilId) {
        return true;
      }

      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      return hoursDiff >= 1;
    } catch (error) {
      return true;
    }
  }

  /**
   * Migra permissões de versões antigas se necessário
   */
  static migratePermissionsIfNeeded(): void {
    try {
      const permissionsData = localStorage.getItem(this.STORAGE_KEY);
      if (!permissionsData) {
        return;
      }

      const parsed = JSON.parse(permissionsData);
      
      if (!parsed.version) {
        const newPermissionsData: StoredPermissions = {
          userId: parsed.userId || '',
          perfilId: parsed.perfilId || '',
          permissions: parsed.permissions || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          version: this.VERSION
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newPermissionsData));
      }
    } catch (error) {
      console.error('Erro durante migração de permissões:', error);
    }
  }
}
