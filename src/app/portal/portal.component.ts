import { Component, inject } from "@angular/core";
import { SidebarService } from "../shared/services/sidebar/sidebarService";
import { Router, NavigationEnd } from '@angular/router';

/**
 * Componente principal do portal da aplicação.
 * 
 * Este componente é responsável por gerenciar o layout principal do portal,
 * incluindo o estado da sidebar e a navegação entre rotas.
 */
@Component({
  selector: "app-portal",
  templateUrl: "./portal.component.html",
  styleUrl: "./portal.component.scss",
})
export class PortalComponent {
  /**
   * Controla o modo de exibição da sidebar (expandida ou recolhida).
   */
  public modeSidebar = false;

  /**
   * Armazena o ano atual para exibição no footer ou outras partes da interface.
   */
  public currentYear: number = new Date().getFullYear();

  /**
   * Serviço injetado para gerenciar o estado da sidebar.
   */
  private readonly sidebarService = inject(SidebarService);

  /**
   * Serviço injetado para gerenciar a navegação entre rotas.
   */
  private readonly router = inject(Router);

  /**
   * Método do ciclo de vida do Angular chamado após a criação do componente.
   * 
   * Realiza as seguintes ações:
   * 1. Assina as mudanças de estado da sidebar
   * 2. Monitora eventos de navegação para atualizar o estado da sidebar quando a rota muda
   */
  ngOnInit(): void {
    // Assina as mudanças de estado da sidebar
    this.sidebarService.getSidebarState().subscribe((isExpanded) => {
      this.modeSidebar = isExpanded;
    });

    // Monitora eventos de navegação
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Atualiza o estado da sidebar quando a navegação é concluída
        this.sidebarService.getSidebarState().subscribe((isExpanded) => {
          this.modeSidebar = isExpanded;
        });
      }
    });
  }
}