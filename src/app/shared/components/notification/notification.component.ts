import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation/translation.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'user' | 'process' | 'financial';
  actionUrl?: string;
  actionText?: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);

  public notifications: Notification[] = [];
  public filteredNotifications: Notification[] = [];
  public showNotificationPanel = false;
  public selectedFilter: 'all' | 'unread' | 'read' = 'all';
  public selectedType: 'all' | 'info' | 'success' | 'warning' | 'error' = 'all';
  public selectedCategory: 'all' | 'system' | 'user' | 'process' | 'financial' = 'all';

  // Estatísticas
  public stats = {
    total: 0,
    unread: 0,
    read: 0
  };

  ngOnInit(): void {
    this.loadTranslations();
    this.loadMockNotifications();
    this.updateStats();
    this.applyFilters();
  }

  private loadTranslations(): void {
    this.translateService.get([
      'NOTIFICATION.TITLE',
      'NOTIFICATION.MARK_ALL_READ',
      'NOTIFICATION.FILTERS',
      'NOTIFICATION.NO_NOTIFICATIONS',
      'NOTIFICATION.MARK_READ',
      'NOTIFICATION.MARK_UNREAD',
      'NOTIFICATION.DELETE',
      'NOTIFICATION.ALL',
      'NOTIFICATION.UNREAD',
      'NOTIFICATION.READ'
    ]).subscribe();
  }

  private loadMockNotifications(): void {
    this.notifications = [
      {
        id: 1,
        title: 'Sessão expirando',
        message: 'Sua sessão expira em 15 minutos. Renove para continuar.',
        type: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        read: false,
        priority: 'high',
        category: 'system',
        actionUrl: '/portal/configuracoes/sessoes',
        actionText: 'Renovar Sessão'
      },
      {
        id: 2,
        title: 'Medição aprovada',
        message: 'Medição VMI-2024-001 foi aprovada com sucesso.',
        type: 'success',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        read: false,
        priority: 'medium',
        category: 'process',
        actionUrl: '/portal/relatorios/medicoes',
        actionText: 'Ver Detalhes'
      },
      {
        id: 3,
        title: 'Novo usuário cadastrado',
        message: 'João Silva foi cadastrado no sistema.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        read: true,
        priority: 'low',
        category: 'user',
        actionUrl: '/portal/configuracoes/acessos',
        actionText: 'Ver Usuário'
      },
      {
        id: 4,
        title: 'Erro no sistema',
        message: 'Ocorreu um erro ao processar o relatório. Tente novamente.',
        type: 'error',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        read: false,
        priority: 'high',
        category: 'system',
        actionUrl: '/portal/relatorios',
        actionText: 'Tentar Novamente'
      },
      {
        id: 5,
        title: 'Pagamento recebido',
        message: 'Pagamento de R$ 45.000,00 foi recebido.',
        type: 'success',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        read: true,
        priority: 'medium',
        category: 'financial',
        actionUrl: '/portal/financeiro',
        actionText: 'Ver Detalhes'
      },
      {
        id: 6,
        title: 'Contrato vencendo',
        message: 'Contrato VMI-2024-008 vence em 5 dias.',
        type: 'warning',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
        read: false,
        priority: 'high',
        category: 'process',
        actionUrl: '/portal/comercial/contratos',
        actionText: 'Renovar Contrato'
      }
    ];
  }

  public toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  public markAsRead(notification: Notification): void {
    notification.read = true;
    this.updateStats();
    this.applyFilters();
  }

  public markAsUnread(notification: Notification): void {
    notification.read = false;
    this.updateStats();
    this.applyFilters();
  }

  public markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateStats();
    this.applyFilters();
  }

  public deleteNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.updateStats();
    this.applyFilters();
  }

  public onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      const filterMatch = this.selectedFilter === 'all' || 
        (this.selectedFilter === 'unread' && !notification.read) ||
        (this.selectedFilter === 'read' && notification.read);

      const typeMatch = this.selectedType === 'all' || notification.type === this.selectedType;
      const categoryMatch = this.selectedCategory === 'all' || notification.category === this.selectedCategory;

      return filterMatch && typeMatch && categoryMatch;
    });
  }

  private updateStats(): void {
    this.stats.total = this.notifications.length;
    this.stats.unread = this.notifications.filter(n => !n.read).length;
    this.stats.read = this.notifications.filter(n => n.read).length;
  }

  public getNotificationIcon(type: string): string {
    switch (type) {
      case 'info': return 'pi pi-info-circle';
      case 'success': return 'pi pi-check-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'error': return 'pi pi-times-circle';
      default: return 'pi pi-bell';
    }
  }

  public getNotificationColor(type: string): string {
    switch (type) {
      case 'info': return 'var(--blue-500)';
      case 'success': return 'var(--green-500)';
      case 'warning': return 'var(--orange-500)';
      case 'error': return 'var(--red-500)';
      default: return 'var(--text-color-secondary)';
    }
  }

  public getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'var(--red-500)';
      case 'medium': return 'var(--orange-500)';
      case 'low': return 'var(--green-500)';
      default: return 'var(--text-color-secondary)';
    }
  }

  public getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  }

  public getCategoryLabel(category: string): string {
    switch (category) {
      case 'system': return 'Sistema';
      case 'user': return 'Usuário';
      case 'process': return 'Processo';
      case 'financial': return 'Financeiro';
      default: return 'Geral';
    }
  }

  public formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  }

  public navigateToAction(notification: Notification): void {
    if (notification.actionUrl) {
      // Aqui você pode implementar a navegação
      console.log('Navegando para:', notification.actionUrl);
    }
  }

  public getMenuItems(notification: Notification): any[] {
    return [
      {
        label: notification.read ? 'Marcar como não lida' : 'Marcar como lida',
        icon: notification.read ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => notification.read ? this.markAsUnread(notification) : this.markAsRead(notification)
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        command: () => this.deleteNotification(notification)
      }
    ];
  }
}