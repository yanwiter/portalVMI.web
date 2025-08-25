import { Injectable, inject, DestroyRef } from '@angular/core';
import { Permission } from '../../models/permission.model';
import { loadPerfilIdFromStorage, loadUserAcessosFromStorage } from '../../util/localStorageUtil';
import { BehaviorSubject } from 'rxjs';
import { isGuid, messageOfReturns } from '../../util/util';
import { PermissionsEventService } from './permissions-event.service';
import { PermissionEventType } from '../../models/enums/permission-event-type.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private _vizualizacao: string = 'f660e8a6-7e3c-469b-a4df-2e106ed9f546';
  private _edicao: string = '6ef086eb-7b12-4265-a2d0-4508db9b2d95';
  private _inclusao: string = '6fc21254-dc02-4d18-8633-9349c53f305d';
  private _exclusao: string ='7a2725d3-71cd-4dc7-80a8-f8225247a619';
  
  private userPermissions: Permission[] = [];
  private perfilId: string = '';
  private permissionsLoaded = false;
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  public permissions$ = this.permissionsSubject.asObservable();
  
  private readonly permissionsEventService = inject(PermissionsEventService);
  private readonly destroy = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  translateService: any;
    
  constructor() {
    this.perfilId = loadPerfilIdFromStorage() || '';
    this.loadPermissionsFromStorageLocal();
    
    if (this.userPermissions.length > 0) {
      this.permissionsLoaded = true;
    }
    
    this.subscribeToPermissionEvents();
  }

  /**
   * Carrega as permissões do localStorage
   */
  private loadPermissionsFromStorageLocal(): void {
    const storedAcessos = loadUserAcessosFromStorage();
    if (storedAcessos && storedAcessos.length > 0) {
      this.userPermissions = storedAcessos;
      this.permissionsSubject.next(this.userPermissions);
      this.permissionsLoaded = true;
    } else {
      this.permissionsLoaded = false;
    }
  }

  /**
   * Se inscreve nos eventos de permissão para atualização automática
   */
  private subscribeToPermissionEvents(): void {
    this.permissionsEventService.events$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(event => {
        if (event) {
          switch (event.type) {
            case PermissionEventType.PERMISSIONS_UPDATED:
            case PermissionEventType.PERMISSIONS_RELOADED:
            case PermissionEventType.PROFILE_CHANGED:
              this.forceReloadPermissions();
              break;
          }
        }
      });
  }

  /**
   * Verifica se o usuário tem permissão para uma determinada ação
   * @param rotina - ID da rotina
   * @param acesso - ID do tipo de acesso (Visualização, Edição, Exclusão, etc.)
   * @returns true se o usuário tem permissão
   */
  hasPermission(rotina: string, acesso: string): boolean {
    if (this.userPermissions.length === 0) {
      return false;
    }

    const hasPermission = this.userPermissions.some(
      perm =>
        perm.idRotina.toLowerCase() === rotina.toLowerCase() &&
        perm.idAcesso.toLowerCase() === acesso.toLowerCase() &&
        perm.ativo === true
    );

    return hasPermission;
  }

  /**
   * Verifica se o usuário tem qualquer permissão para uma rotina
   * @param rotina - ID da rotina
   * @returns true se o usuário tem qualquer permissão para a rotina
   */
  hasAnyPermission(rotina: string): boolean {
    if (this.userPermissions.length === 0) {
      return false;
    }

    const hasAnyPermission = this.userPermissions.some(
      perm =>
        perm.idRotina.toLowerCase() === rotina.toLowerCase() &&
        perm.ativo === true
    );

    return hasAnyPermission;
  }

  /**
   * Recarrega as permissões do usuário do localStorage
   */
  reloadPermissions(): void {
    this.permissionsLoaded = false;
    this.loadPermissionsFromStorageLocal();
  }

  /**
   * Obtém todas as permissões do usuário
   */
  getUserPermissions(): Permission[] {
    return [...this.userPermissions];
  }

  /**
   * Verifica se as permissões foram carregadas
   */
  arePermissionsLoaded(): boolean {
    return this.permissionsLoaded && this.userPermissions.length > 0;
  }

  /**
   * Força o recarregamento das permissões do localStorage
   * Útil quando as permissões são atualizadas pelo SidebarComponent
   */
  forceReloadPermissions(): void {
    this.permissionsLoaded = false;
    this.loadPermissionsFromStorageLocal();
    this.permissionsLoaded = true;
  }

  canView(rotinaIdOrNome: string, moduloNome?: string): boolean {
    if (isGuid(rotinaIdOrNome)) {
      const result = this.hasPermission(rotinaIdOrNome, this._vizualizacao);
      return result;
    }
    return this.hasPermissionByName(rotinaIdOrNome, 'Visualização', moduloNome);
  }

  canCreate(rotinaIdOrNome: string, moduloNome?: string): boolean {
    if (isGuid(rotinaIdOrNome)) {
      const result = this.hasPermission(rotinaIdOrNome, this._inclusao);
      return result;
    }
    return this.hasPermissionByName(rotinaIdOrNome, 'Inclusão', moduloNome);
  }

  canEdit(rotinaIdOrNome: string, moduloNome?: string): boolean {
    if (isGuid(rotinaIdOrNome)) {
      const result = this.hasPermission(rotinaIdOrNome, this._edicao);
      return result;
    }
    
    const result = this.hasPermissionByName(rotinaIdOrNome, 'Edição', moduloNome);
    if (!result) {
      messageOfReturns(this.messageService, 'warning', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERMISSIONS.SEM_PERMISSAO_EDICAO'), 3000);
    }
    
    return result;
  }


  canDelete(rotinaIdOrNome: string, moduloNome?: string): boolean {
    if (isGuid(rotinaIdOrNome)) {
      const result = this.hasPermission(rotinaIdOrNome, this._exclusao);
      return result;
    }
    return this.hasPermissionByName(rotinaIdOrNome, 'Exclusão', moduloNome);
  }

  /**
   * Verifica permissão pelo nome da rotina e tipo de acesso
   * @param rotinaNome - Nome da rotina (ex: "Clientes e Fornecedores")
   * @param acessoNome - Nome do tipo de acesso (ex: "Visualização", "Edição", etc.)
   * @param moduloNome - Nome do módulo (opcional, para maior precisão)
   * @returns true se o usuário tem permissão
   */
  private hasPermissionByName(rotinaNome: string, acessoNome: string, moduloNome?: string): boolean {
    if (this.userPermissions.length === 0) {
      messageOfReturns(this.messageService, 'error', this.translateService.instant('PERMISSIONS.ERRO_CARREGAR_PERMISSOES'), this.translateService.instant('PERMISSIONS.ERRO_CARREGAR_PERMISSOES_DETALHE'), 3000);
      return false;
    }

    const hasPermission = this.userPermissions.some(
      perm => {
        const rotinaMatch = perm.rotina.toLowerCase() === rotinaNome.toLowerCase();
        const acessoMatch = perm.acesso.toLowerCase() === acessoNome.toLowerCase();
        const ativoMatch = perm.ativo === true;
        const moduloMatch = !moduloNome || perm.modulo.toLowerCase() === moduloNome.toLowerCase();
        
        if (rotinaMatch && acessoMatch && ativoMatch && moduloMatch) {
          return true;
        }
        return false;
      }
    );
    
    if (!hasPermission) {
      messageOfReturns(this.messageService, 'warning', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERMISSIONS.SEM_PERMISSAO_DETALHE', { rotina: rotinaNome, acesso: acessoNome }), 3000);
    }
    
    return hasPermission;
  }

  /**
   * Obtém o ID da rotina pelo nome (para uso em casos específicos)
   * @param rotinaNome - Nome da rotina
   * @param moduloNome - Nome do módulo (opcional)
   * @returns ID da rotina ou null se não encontrada
   */
  getRotinaIdByName(rotinaNome: string, moduloNome?: string): string | null {
    const rotina = this.userPermissions.find(
      perm =>
        perm.rotina.toLowerCase() === rotinaNome.toLowerCase() &&
        perm.ativo === true &&
        (!moduloNome || perm.modulo.toLowerCase() === moduloNome.toLowerCase())
    );
    return rotina ? rotina.idRotina : null;
  }
}

export { Permission };
