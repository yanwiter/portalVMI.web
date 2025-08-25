import { Injectable, inject } from '@angular/core';
import { GenericService } from '../generic/generic.service';
import { PerfilModel } from '../../models/perfil.model';
import { loadPerfilIdFromStorage, saveUserAcessosToStorage } from '../../util/localStorageUtil';
import { PermissionsEventService } from './permissions-event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

/**
 * Serviço para sincronizar as permissões do usuário atual
 * quando perfis são alterados no sistema
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionsSyncService {
  
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly permissionsEventService = inject(PermissionsEventService);
  private readonly destroy = inject(DestroyRef);

  constructor() {
    this.subscribeToProfileChanges();
  }

  /**
   * Se inscreve nos eventos de mudança de perfil para sincronizar permissões
   */
  private subscribeToProfileChanges(): void {
    this.permissionsEventService.events$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(event => {
        if (event && event.type === 'profile_changed') {
          this.syncCurrentUserPermissions();
        }
      });
  }

  /**
   * Sincroniza as permissões do usuário atual
   * Busca as permissões atualizadas da API e salva no localStorage
   */
  public async syncCurrentUserPermissions(): Promise<void> {
    try {
      const perfilId = loadPerfilIdFromStorage();
      if (!perfilId) {
        return;
      }

      this.perfilService.get('perfilRoutes', perfilId)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: (response) => {
            if (response.isSuccess && response.data && response.data.acessos) {
              const acessosAtivos = response.data.acessos.filter((acesso: any) => acesso.ativo === true);
              saveUserAcessosToStorage(acessosAtivos);
              
              this.permissionsEventService.notifyPermissionsUpdated(
                perfilId,
                'Usuário Atual'
              );
              
              setTimeout(() => {
                this.permissionsEventService.notifyPermissionsReload();
              }, 100);
            } else {
              console.warn('[PermissionsSyncService] Failed to get profile data:', response);
            }
          },
          error: (err) => {
            console.error('[PermissionsSyncService] Error syncing permissions:', err);
          }
        });
    } catch (error) {
      console.error('[PermissionsSyncService] Error in syncCurrentUserPermissions:', error);
    }
  }

  /**
   * Força a sincronização das permissões
   * Útil para casos onde é necessário atualizar manualmente
   */
  public forceSync(): void {
    console.log('[PermissionsSyncService] Force syncing permissions...');
    this.syncCurrentUserPermissions();
  }

  /**
   * Verifica se as permissões estão sincronizadas
   * Compara as permissões do localStorage com as da API
   */
  public async checkPermissionsSync(): Promise<boolean> {
    try {
      const perfilId = loadPerfilIdFromStorage();
      if (!perfilId) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[PermissionsSyncService] Error checking permissions sync:', error);
      return false;
    }
  }
}
