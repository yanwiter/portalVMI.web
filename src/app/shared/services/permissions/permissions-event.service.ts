import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermissionEventType } from '../../models/enums/permission-event-type.enum';
import { PermissionEvent } from '../../models/permission-event.model';

/**
 * Serviço para gerenciar eventos relacionados a permissões
 * Permite que componentes se inscrevam para receber notificações
 * quando as permissões são alteradas
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionsEventService {
  
  private readonly eventSubject = new BehaviorSubject<PermissionEvent | null>(null);
  public readonly events$ = this.eventSubject.asObservable();

  /**
   * Emite um evento de permissões atualizadas
   * @param eventType - Tipo do evento
   * @param data - Dados opcionais do evento
   */
  public emitPermissionEvent(eventType: PermissionEventType, data?: any): void {
    const event: PermissionEvent = {
      type: eventType,
      data,
      timestamp: new Date()
    };
    
    this.eventSubject.next(event);
  }

  /**
   * Notifica que as permissões foram atualizadas
   * @param profileId - ID do perfil que foi alterado
   * @param profileName - Nome do perfil alterado
   */
  public notifyPermissionsUpdated(profileId: string, profileName: string): void {
    this.emitPermissionEvent(PermissionEventType.PERMISSIONS_UPDATED, {
      profileId,
      profileName,
      message: `Perfil "${profileName}" foi alterado. As permissões foram atualizadas.`
    });
  }

  /**
   * Notifica que as permissões devem ser recarregadas
   */
  public notifyPermissionsReload(): void {
    this.emitPermissionEvent(PermissionEventType.PERMISSIONS_RELOADED, {
      message: 'Permissões devem ser recarregadas do localStorage'
    });
  }

  /**
   * Notifica que um perfil foi alterado
   * @param profileId - ID do perfil alterado
   * @param profileName - Nome do perfil alterado
   * @param action - Ação realizada (criado, atualizado, excluído)
   */
  public notifyProfileChanged(profileId: string, profileName: string, action: 'created' | 'updated' | 'deleted'): void {
    this.emitPermissionEvent(PermissionEventType.PROFILE_CHANGED, {
      profileId,
      profileName,
      action,
      message: `Perfil "${profileName}" foi ${action === 'created' ? 'criado' : action === 'updated' ? 'atualizado' : 'excluído'}`
    });
  }

  /**
   * Obtém o último evento emitido
   */
  public getLastEvent(): PermissionEvent | null {
    return this.eventSubject.value;
  }

  /**
   * Limpa todos os eventos
   */
  public clearEvents(): void {
    this.eventSubject.next(null);
  }
}
