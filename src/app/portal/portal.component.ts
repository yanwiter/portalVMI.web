import { Component, inject } from "@angular/core";
import { SidebarService } from "../shared/services/sidebar/sidebarService";
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from "rxjs";

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
   * Título da página atual extraído dos dados da rota ativa
   */
  public pageTitle: string = '';

  /**
   * Serviço injetado para gerenciar o estado da sidebar.
   */
  private readonly sidebarService = inject(SidebarService);

  /**
   * Serviço injetado para gerenciar a navegação entre rotas.
   */
  private readonly router = inject(Router);

  /**
   * Serviço injetado para gerenciar os dados da rota ativa.
   */
  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * Método do ciclo de vida do Angular chamado após a criação do componente.
   * 
   * Realiza as seguintes ações:
   * 1. Assina as mudanças de estado da sidebar
   * 2. Monitora eventos de navegação para atualizar o estado da sidebar quando a rota muda
   */
  ngOnInit(): void {
    this.sidebarService.getSidebarState().subscribe((isExpanded) => {
      this.modeSidebar = isExpanded;
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        this.pageTitle = data["title"] ?? '';
      });
  }

  /**
   * Atualiza o título quando um componente de rota é ativado.
   * Se o componente expõe a propriedade `pageTitle`, ela terá prioridade.
   */
  onRouteActivate(componentInstance: unknown): void {
    const hasOwnTitle = componentInstance && typeof (componentInstance as any)["pageTitle"] === 'string';
    if (hasOwnTitle) {
      this.pageTitle = (componentInstance as any)["pageTitle"] as string;
    }
  }
}