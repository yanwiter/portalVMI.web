import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NotificationType } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  showNotification(message: string, type: NotificationType, detail: string = '') {
    this.messageService.add({ severity: type, summary: message, detail: detail, life: 3000 });
  }
}
