import { Component, inject, OnInit, signal } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebarService';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getPerfilNameFromStorage, getUserNameFromStorage } from '../../util/localStorageUtil';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {

  public isSidebarOpen = false;
  public userName = signal<string>('');
  private readonly sidebarService = inject(SidebarService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const fullName = getUserNameFromStorage();
    const perfilName = getPerfilNameFromStorage();
    this.userName.set(fullName + " / " + perfilName);

    this.sidebarService.getSidebarState().subscribe((isOpen) => {
      this.isSidebarOpen = isOpen;
    });
  }

  toggleSidenav(): void {
    this.sidebarService.toggleSidebar();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSidenav();
    }
  }

  logout(): void {
    this.router.navigate(["/"], { state: { bypassGuard: true } });
    this.messageService.add({
      severity: 'success',
      summary: 'Ação bem sucedida',	
      detail: "Logout realizado com sucesso!",
      life: 3000
    });
    localStorage.removeItem('userData');
  }

  confirmLogout(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente sair?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.logout();
      },
      reject: () => {
      }
    });
  }

  onNotificationMouseEnter(event: MouseEvent, overlayPanel: any): void {
    overlayPanel.show(event);
  }

  protected isSidebarAllowed(): boolean {
    return true;
  }

}
