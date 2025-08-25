import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NotificationType } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  /**
   * Exibe uma notificação na interface do usuário
   * 
   * @param {string} message - O resumo/mensagem principal da notificação
   * @param {NotificationType} type - O tipo da notificação (ex: 'success', 'error', 'info', 'warn')
   * @param {string} [detail=''] - Detalhes adicionais da notificação (opcional)
   * 
   * @example
   * // Mostra uma notificação de sucesso
   * this.notificationService.showNotification('Operação concluída', 'success');
   * 
   * // Mostra uma notificação de erro com detalhes
   * this.notificationService.showNotification('Falha na operação', 'error', 'O arquivo não foi encontrado');
   */
  public showNotification(message: string, type: NotificationType, detail: string = '') {
    this.messageService.add({ severity: type, summary: message, detail: detail, life: 3000 });
  }
}