import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SidebarService } from "../../services/sidebar/sidebarService";
import { PerfilModel } from "../../models/perfil.model";
import { GenericService } from "../../services/generic/generic.service";
import { MessageService } from "primeng/api";
import { Result } from "../../models/api/result.model";

interface MenuItem {
  label: string;
  routerLink: string;
  hasSubmenu?: boolean;
  isSubmenuVisible?: boolean;
  submenuItems?: SubMenuItem[];
  requiredPermission?: string | string[];
}

interface SubMenuItem {
  label: string;
  routerLink: string;
  requiredPermission?: string;
}

interface Menu {
  icon: string;
  title: string;
  items: MenuItem[];
  requiredPermission?: string;
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly sidebarService = inject(SidebarService);
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly messageService = inject(MessageService);

  private _isSidebarVisible: boolean = true;
  private _userPermissions: any[] = [];
  private idPessoaLogada: number = 0;

  get isSidebarVisible(): boolean {
    return this._isSidebarVisible;
  }

  @Input() set isSidebarVisible(value: boolean) {
    this._isSidebarVisible = value;
    this.isSidebarVisibleChange.emit(this._isSidebarVisible);
  }

  @Output() isSidebarVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeIndex: number[] = [];
  menus: Menu[] = [];

  public ngOnInit(): void {
    this.loadUserDataFromStorage();
    this.loadUserPermissions();

    this.sidebarService.getSidebarState().pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((isOpen) => {
      this._isSidebarVisible = isOpen;
      this.isSidebarVisibleChange.emit(isOpen);
    });

    this.router.events.pipe(
      takeUntilDestroyed(this.destroy),
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarService.toggleSidebar(true);
    });
  }

  private loadUserDataFromStorage(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        this.idPessoaLogada = parsedData.perfiliIdPessoaLogada || 0;
      } catch (e) {
        console.error('Erro ao parsear userData do localStorage', e);
      }
    }
  }

  private loadUserPermissions(): void {
    if (!this.idPessoaLogada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'ID do usuário não encontrado',
        life: 3000
      });
      return;
    }

    this.perfilService.get('perfilRoutes', this.idPessoaLogada,)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response: Result<PerfilModel>) => {
          if (response.isSuccess && response.data) {
            this._userPermissions = response.data.acessos || [];

            if (this._userPermissions.length === 0) {
              console.warn('Nenhuma permissão encontrada para o usuário');
            }

            this.getMenus();
          } else {
            this.handleError(response);
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  private handleError(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar buscar permissões de usuário!',
      detail: err.error?.message || 'Erro desconhecido',
      life: 3000
    });
  }

  private hasPermission(modulo: string, rotina: string | string[], acesso: string): boolean {
    return this._userPermissions.some(perm =>
      perm.modulo === modulo &&
      (rotina === '' || perm.rotina === rotina) &&
      perm.acesso === acesso &&
      perm.ativo
    );
  }

  protected getMenus(): void {
    const allMenus: Menu[] = [
      {
        icon: 'pi pi-home icon-spacing',
        title: "Início",
        requiredPermission: "Início",
        items: [
          { label: "Home", routerLink: 'inicio', requiredPermission: "Home" },
          { label: "Dashboards", routerLink: 'inicio/dashboards', requiredPermission: "Dashboards" },
        ]
      },
      {
        icon: 'pi pi-file-edit icon-spacing',
        title: "Relatórios",
        requiredPermission: "Relatórios",
        items: [
          {
            label: "Relatório de Medição",
            routerLink: 'relatorios/medicoes',
            requiredPermission: "Relatório Medição"
          },
        ]
      },
      {
        icon: 'pi pi-dollar icon-spacing',
        title: "Financeiro",
        requiredPermission: "Financeiro",
        items: [
          { label: "teste", routerLink: 'fonte-de-dados/equivalente-comprometida', requiredPermission: "Equivalente Comprometida" },
          {
            label: "teste",
            routerLink: '',
            hasSubmenu: true,
            isSubmenuVisible: false,
            requiredPermission: "Áreas de Manutenção",
            submenuItems: [
              { label: "teste", routerLink: 'fonte-de-dados/area-manutencao', requiredPermission: "Área Manutenção" },
              { label: "teste", routerLink: 'fonte-de-dados/taxa-funcao', requiredPermission: "Taxa Função" },
              { label: "teste", routerLink: 'fonte-de-dados/parceiros', requiredPermission: "Parceiros" }
            ]
          },
          { label: "teste", routerLink: 'fonte-de-dados/dosimetrados', requiredPermission: "Dosimetrados" },
          { label: "teste", routerLink: 'fonte-de-dados/tempo-permanencia', requiredPermission: "Tempo Permanência" },
          { label: "teste", routerLink: 'fonte-de-dados/taxa-base', requiredPermission: "Taxa Base" }
        ]
      },
      {
        icon: 'pi pi-map icon-spacing',
        title: "Comercial",
        requiredPermission: "Comercial",
        items: [
          {
            label: "Clientes e Fornecedores",
            routerLink: 'comercial/clientes-fornecedores',
            requiredPermission: "Clientes e Fornecedores"
          },
          {
            label: "Funil de Vendas",
            routerLink: 'comercial/funil-vendas',
            requiredPermission: "Funil de Vendas"
          }
        ]
      },
      {
        icon: 'pi pi-wave-pulse icon-spacing',
        title: "Planejamento",
        requiredPermission: "Planejamento",
        items: [
          {
            label: "Histórico de Produtos",
            routerLink: 'planejamento/historico-produto',
            requiredPermission: "Histórico de Produtos"
          },
          {
            label: "Testes de Qualidade",
            routerLink: 'planejamento/teste-produto',
            requiredPermission: "Testes de Qualidade"
          }
        ]
      },
      {
        icon: 'pi pi-cog icon-spacing',
        title: "Configurações",
        requiredPermission: "Configurações",
        items: [
          {
            label: "Perfis e Acessos",
            routerLink: '',
            hasSubmenu: true,
            isSubmenuVisible: false,
            requiredPermission: ["Controle de Perfis", "Controle de Acessos"],
            submenuItems: [
              {
                label: "Controle de Perfis",
                routerLink: 'configuracoes/perfis',
                requiredPermission: "Controle de Perfis"
              },
              {
                label: "Controle de Acessos",
                routerLink: 'configuracoes/acessos',
                requiredPermission: "Controle de Acessos"
              },
            ]
          },
        ]
      }
    ];

    this.menus = allMenus
      .filter(menu => {
        return this.hasPermission(menu.title, '', 'Visualização');
      })
      .map(menu => ({
        ...menu,
        items: menu.items
          .filter(item => {
            if (item.hasSubmenu) {
              return item.submenuItems?.some(subItem =>
                this.hasPermission(menu.title, subItem.requiredPermission || '', 'Visualização')
              );
            }
            return this.hasPermission(menu.title, item.requiredPermission || '', 'Visualização');
          })
          .map(item => ({
            ...item,
            submenuItems: item.submenuItems?.filter(subItem =>
              this.hasPermission(menu.title, subItem.requiredPermission || '', 'Visualização')
            )
          }))
      }))
      .filter(menu => menu.items.length > 0);
  }

  protected toggleSubmenu(menuItem: any) {
    menuItem.isSubmenuVisible = !menuItem.isSubmenuVisible;
  }
}