import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, ChangeDetectorRef, OnDestroy, HostListener } from "@angular/core";
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SidebarService } from "../../services/sidebar/sidebarService";
import { PerfilModel } from "../../models/perfil.model";
import { AcessoPerfil } from "../../models/AcessoPerfil.model";
import { GenericService } from "../../services/generic/generic.service";
import { MessageService } from "primeng/api";
import { Result } from "../../models/api/result.model";
import { Menu } from "../../models/menu.model";
import { MenuItem } from "../../models/menuItem.model";
import { SubMenuItem } from "../../models/subMenuItem.model";
import { TranslationService } from "../../services/translation/translation.service";
import { ThemeService } from "../../services/theme/theme.service";
import { Subscription } from "rxjs";
import { saveUserAcessosToStorage, loadUserAcessosFromStorage } from "../../util/localStorageUtil";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PermissionsEventService } from "../../services/permissions/permissions-event.service";
import { PermissionEventType } from "../../models/enums/permission-event-type.enum";

/**
 * Componente de Sidebar responsável pela navegação principal da aplicação.
 * 
 * Este componente gerencia:
 * - Estado de expansão/recolhimento da sidebar
 * - Permissões do usuário e criação dinâmica do menu
 * - Interação com submenus e navegação
 * - Animações suaves e responsivas
 * - Integração com sistema de temas e idiomas
 * - Controle de acesso baseado em permissões
 */
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  animations: [
    trigger('slideInOut', [
      state('collapsed', style({
        maxHeight: '0',
        opacity: '0',
        transform: 'translateY(-10px)'
      })),
      state('expanded', style({
        maxHeight: '500px',
        opacity: '1',
        transform: 'translateY(0)'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('fadeInOut', [
      state('hidden', style({
        opacity: '0',
        transform: 'translateX(-10px) scale(0.95)'
      })),
      state('visible', style({
        opacity: '1',
        transform: 'translateX(0) scale(1)'
      })),
      transition('hidden <=> visible', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('slideInRight', [
      state('hidden', style({
        opacity: '0',
        transform: 'translateX(-20px) scale(0.95)'
      })),
      state('visible', style({
        opacity: '1',
        transform: 'translateX(0) scale(1)'
      })),
      transition('hidden <=> visible', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('slideInDown', [
      state('hidden', style({
        opacity: '0',
        transform: 'translateY(-10px)',
        maxHeight: '0'
      })),
      state('visible', style({
        opacity: '1',
        transform: 'translateY(0)',
        maxHeight: '200px'
      })),
      transition('hidden <=> visible', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('slideInUp', [
      state('hidden', style({
        opacity: '0',
        transform: 'translateY(10px)',
        maxHeight: '0'
      })),
      state('visible', style({
        opacity: '1',
        transform: 'translateY(0)',
        maxHeight: '200px'
      })),
      transition('hidden <=> visible', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Estado interno da sidebar (expandida/recolhida) */
  private _isSidebarExpanded: boolean = true;

  /** Indica se o submenu principal está sendo mostrado para cima */
  private _isSubmenuUp: boolean = false;

  /** Indica se o submenu aninhado está sendo mostrado para cima */
  private _isNestedSubmenuUp: boolean = false;

  /** Permissões do usuário logado */
  private _userPermissions: AcessoPerfil[] = [];

  /** ID da pessoa logada obtido do localStorage */
  private id: string = '';

  /** Estado de abertura da sidebar para controles responsivos */
  public isSidebarOpen = false;

  /** Índices dos itens de menu ativos */
  public activeIndex: number[] = [];

  /** Lista de menus filtrados por permissão */
  public menus: Menu[] = [];

  /** Menu atualmente destacado no modo compacto */
  public hoveredMenu: Menu | null = null;

  /** Menu atualmente ativo baseado na rota atual */
  public activeMenu: Menu | null = null;

  /** Submenu aninhado atualmente visível */
  public nestedSubmenu: MenuItem | null = null;

  /** Posição do submenu principal */
  public submenuPosition = { top: 100, left: 80 };

  /** Estado de hover do submenu principal */
  public submenuHover = false;

  /** Posição do submenu aninhado */
  public nestedSubmenuPosition = { top: 100, left: 300 };
  
  /** Estado de hover do submenu aninhado */
  public nestedSubmenuHover = false;

  /** Indica se o submenu foi aberto por clique (não por hover) */
  public submenuOpenedByClick = false;
  
  /** Altura máxima calculada para o submenu baseada no espaço disponível */
  public calculatedMaxHeight: number = 400;

  /** Altura máxima calculada para o submenu aninhado baseada no espaço disponível */
  public nestedSubmenuMaxHeight: number = 400;

  /** Estado de loading para melhor UX */
  public isLoading = false;

  /** Tema atual da aplicação */
  public currentTheme: string = 'light';

  /** Serviços injetados */
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly sidebarService = inject(SidebarService);
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly messageService = inject(MessageService);
  private readonly translationService = inject(TranslationService);
  private readonly themeService = inject(ThemeService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly permissionsEventService = inject(PermissionsEventService);
  
  /** Subscrições para gerenciamento de ciclo de vida */
  private languageSubscription?: Subscription;
  private themeSubscription?: Subscription;
  translateService: any;

  /**
   * Getter para o estado atual da sidebar
   * @returns true se a sidebar está expandida, false se recolhida
   */
  public get modeSidebar(): boolean {
    return this._isSidebarExpanded;
  }

  /**
   * Setter para o estado da sidebar
   * @param value - Novo estado (true = expandido, false = recolhido)
   */
  @Input() set modeSidebar(value: boolean) {
    this._isSidebarExpanded = value;
    this.isSidebarChangeMode.emit(this._isSidebarExpanded);
  }

  /** EventEmitter para notificar mudanças no estado da sidebar */
  @Output() isSidebarChangeMode: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Inicialização do componente
   * Configura listeners de rota, carrega permissões e configura subscrições
   */
  public ngOnInit(): void {
    this.loadUserDataFromStorage();
    this.loadUserPermissions();
    this.subscribeToLanguageChanges();
    this.subscribeToThemeChanges();
    this.subscribeToPermissionEvents();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenu();
        this.changeDetectorRef.detectChanges();
      });

    setTimeout(() => {
      this.updateActiveMenu();
    }, 100);
  }

  /**
   * Cleanup do componente
   * Cancela todas as subscrições ativas
   */
  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.hoveredMenu) {
      this.showCompactSubmenu(this.hoveredMenu);
    }
    if (this.nestedSubmenu) {
      const dummyEvent = new MouseEvent('mouseenter');
      this.showNestedSubmenu(this.nestedSubmenu, dummyEvent);
    }
  }

  /**
   * Configura subscrição para mudanças de idioma
   * Atualiza os menus quando o idioma for alterado
   */
  private subscribeToLanguageChanges(): void {
    this.languageSubscription = this.translationService.currentLanguage$.subscribe(() => {
      this.forceMenuUpdate();
    });

    window.addEventListener('languageChanged', () => {
      this.forceMenuUpdate();
    });
  }

  /**
   * Configura subscrição para mudanças de tema
   * Atualiza a interface quando o tema for alterado
   */
  private subscribeToThemeChanges(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = theme;
      this.changeDetectorRef.detectChanges();
    });
  }

  /**
   * Configura subscrição para eventos de mudança de permissão
   * Atualiza o sidebar automaticamente quando perfis são alterados
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
              this.refreshSidebar();
              break;
          }
        }
      });
  }

  /**
   * Carrega as permissões do usuário do servidor ou do localStorage
   * Filtra os menus baseado nas permissões obtidas
   */
  private loadUserPermissions(): void {
    this.loadUserDataFromStorage();

    const storedAcessos = loadUserAcessosFromStorage();
    if (storedAcessos && storedAcessos.length > 0) {
      this._userPermissions = storedAcessos;
      this.getMenus();
      this.isLoading = false;
      return;
    }
    
    if (!this.id) {
      this._userPermissions = [];
      this.getMenus();
      this.isLoading = false;
      return;
    }

    this.perfilService.get('perfilRoutes', this.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response: Result<PerfilModel>) => {
          if (response.isSuccess && response.data) {
            const acessosAtivos = (response.data.acessos || []).filter(acesso => acesso.ativo === true);
            this._userPermissions = acessosAtivos;
          
            saveUserAcessosToStorage(acessosAtivos);
            
            if (this._userPermissions.length === 0) {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro ao tentar buscar permissões de usuário!',
                detail: 'Nenhuma permissão encontrada para o usuário',
                life: 3000
              });
            }
            this.getMenus();
          } else {
            this.handleError(response);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
          this.isLoading = false;
        }
      });
  }

  /**
   * Carrega os dados do usuário do localStorage
   * Extrai o ID do perfil para consulta de permissões
   */
  private loadUserDataFromStorage(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        this.id = parsedData.perfilId || '';
      } catch (e) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao tentar buscar permissões de usuário!',
          detail: 'Erro ao parsear userData do localStorage',
          life: 3000
        });
      }
    }
  }

  /**
   * Trata erros ao carregar permissões
   * Exibe mensagem de erro para o usuário
   * @param err - Objeto de erro recebido
   */
  private handleError(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar buscar permissões de usuário!',
      detail: err.error?.message || 'Erro desconhecido',
      life: 3000
    });
  }

  /**
   * Verifica se o usuário tem permissão para um determinado recurso
   * @param modulo - Nome do módulo
   * @param rotina - Nome da rotina (pode ser string ou array de strings)
   * @param acesso - Tipo de acesso requerido
   * @returns true se o usuário tem permissão, false caso contrário
   */
  private hasPermission(modulo: string, rotina: string | string[], acesso: string): boolean {
    if (this._userPermissions.length === 0) {
      return true;
    }
    
    const hasPermission = this._userPermissions.some(perm =>
      perm.modulo === modulo &&
      (rotina === '' || perm.rotina === rotina) &&
      perm.acesso === acesso &&
      perm.ativo === true
    );
    
    return hasPermission;
  }

  /**
   * Gera a estrutura de menus baseada nas permissões do usuário
   * Filtra menus e itens baseado nas permissões disponíveis
   */
  protected getMenus(): void {
    try {
      const allMenus: Menu[] = [
        {
          icon: 'pi pi-home icon-spacing',
          title: 'Início',
          titleKey: 'SIDEBAR.INICIO',
          requiredPermission: "Início",
          isExpanded: false,
          items: [
            { label: 'Dashboard', labelKey: 'SIDEBAR.DASHBOARD', routerLink: 'inicio', requiredPermission: "Home" },
            { label: "Dashboards", labelKey: 'SIDEBAR.DASHBOARDS', routerLink: 'inicio/dashboards', requiredPermission: "Dashboards" },
          ]
        },
        {
          icon: 'pi pi-chart-line icon-spacing',
          title: 'Business Intelligence',
          titleKey: 'SIDEBAR.BUSINESS_INTELLIGENCE',
          requiredPermission: "Business Intelligence",
          isExpanded: false,
          items: [
            { label: 'KPIs', labelKey: 'SIDEBAR.KPIS', routerLink: 'business-intelligence/kpis', requiredPermission: "KPI" },
            { label: 'Relatórios Avançados', labelKey: 'SIDEBAR.RELATORIOS_AVANCADOS', routerLink: 'business-intelligence/relatorios', requiredPermission: "Relatórios Avançados" },
            { label: 'Análises Preditivas', labelKey: 'SIDEBAR.ANALISES_PREDITIVAS', routerLink: 'business-intelligence/analises', requiredPermission: "Análises Preditivas" },
          ]
        },
        {
          icon: 'pi pi-dollar icon-spacing',
          title: 'Financeiro',
          titleKey: 'SIDEBAR.FINANCEIRO',
          requiredPermission: "Financeiro",
          isExpanded: false,
          items: [
            { label: "Notas Fiscais", labelKey: 'SIDEBAR.NOTAS_FISCAIS', routerLink: 'financeiro/notas-fiscais', requiredPermission: "Notas Fiscais" },
            { label: "Contas a Receber", labelKey: 'SIDEBAR.CONTAS_RECEBER', routerLink: 'financeiro/contas-receber', requiredPermission: "Contas a Receber" },
            { label: "Contas a Pagar", labelKey: 'SIDEBAR.CONTAS_PAGAR', routerLink: 'financeiro/contas-pagar', requiredPermission: "Contas a Pagar" },
            { label: "Fluxo de Caixa", labelKey: 'SIDEBAR.FLUXO_CAIXA', routerLink: 'financeiro/fluxo-caixa', requiredPermission: "Fluxo de Caixa" },
            { label: "Conciliação Bancária", labelKey: 'SIDEBAR.CONCILIACAO_BANCARIA', routerLink: 'financeiro/conciliacao', requiredPermission: "Conciliação Bancária" },
          ]
        },
        {
          icon: 'pi pi-shopping-cart icon-spacing',
          title: 'Vendas',
          titleKey: 'SIDEBAR.VENDAS',
          requiredPermission: "Vendas",
          isExpanded: false,
          items: [
            { label: "Oportunidades", labelKey: 'SIDEBAR.OPORTUNIDADES', routerLink: 'vendas/oportunidades', requiredPermission: "Oportunidades" },
            { label: "Pipeline de Vendas", labelKey: 'SIDEBAR.PIPELINE_VENDAS', routerLink: 'vendas/pipeline', requiredPermission: "Pipeline de Vendas" },
            { label: "Orçamentos", labelKey: 'SIDEBAR.ORCAMENTOS', routerLink: 'vendas/orcamentos', requiredPermission: "Orçamentos" },
            { label: "Pedidos de Venda", labelKey: 'SIDEBAR.PEDIDOS_VENDA', routerLink: 'vendas/pedidos', requiredPermission: "Pedidos de Venda" },
            { label: "Comissões", labelKey: 'SIDEBAR.COMISSOES', routerLink: 'vendas/comissoes', requiredPermission: "Comissões" },
          ]
        },
        {
          icon: 'pi pi-map icon-spacing',
          title: 'Comercial',
          titleKey: 'SIDEBAR.COMERCIAL',
          requiredPermission: "Comercial",
          isExpanded: false,
          items: [
            {
              label: "Funil de Vendas",
              labelKey: 'SIDEBAR.FUNIL_VENDAS',
              routerLink: 'comercial/funil-vendas',
              requiredPermission: "Funil de Vendas"
            },
          ]
        },
        {
          icon: 'pi pi-box icon-spacing',
          title: "Estoque",
          titleKey: 'SIDEBAR.ESTOQUE',
          requiredPermission: "Estoque",
          isExpanded: false,
          items: [
            {
              label: "Produtos",
              labelKey: 'SIDEBAR.PRODUTOS_ESTOQUE',
              routerLink: 'estoque/produtos',
              requiredPermission: "Produtos Estoque"
            },
            {
              label: "Categorias",
              labelKey: 'SIDEBAR.CATEGORIAS_ESTOQUE',
              routerLink: 'estoque/categorias',
              requiredPermission: "Categorias Estoque"
            },
            {
              label: "Movimentação",
              labelKey: 'SIDEBAR.MOVIMENTACAO_ESTOQUE',
              routerLink: 'estoque/movimentacao',
              requiredPermission: "Movimentação Estoque"
            },
            {
              label: "Fornecedores",
              labelKey: 'SIDEBAR.FORNECEDORES_ESTOQUE',
              routerLink: 'estoque/fornecedores',
              requiredPermission: "Fornecedores Estoque"
            },
            {
              label: "Pedidos de Compra",
              labelKey: 'SIDEBAR.PEDIDOS_COMPRA',
              routerLink: 'estoque/pedidos-compra',
              requiredPermission: "Pedidos de Compra"
            }
          ]
        },
        {
          icon: 'pi pi-clock icon-spacing',
          title: "Ponto",
          titleKey: 'SIDEBAR.PONTO',
          requiredPermission: "Ponto",
          isExpanded: false,
          items: [
            {
              label: "Registro de Ponto",
              labelKey: 'SIDEBAR.REGISTRO_PONTO',
              routerLink: 'ponto/registro-ponto',
              requiredPermission: "Controle de Ponto"
            },
            {
              label: "Relatórios",
              labelKey: 'SIDEBAR.RELATORIOS_PONTO',
              routerLink: 'ponto/relatorios',
              requiredPermission: "Controle de Ponto"
            },
            {
              label: "Horários de Trabalho",
              labelKey: 'SIDEBAR.HORARIOS_TRABALHO',
              routerLink: 'ponto/horarios-trabalho',
              requiredPermission: "Controle de Ponto"
            },
            {
              label: "Configurações",
              labelKey: 'SIDEBAR.CONFIGURACOES_PONTO',
              routerLink: 'ponto/configuracao',
              requiredPermission: "Controle de Ponto"
            },
          ]
        },
        {
          icon: 'pi pi-file-edit icon-spacing',
          title: 'Relatórios',
          titleKey: 'SIDEBAR.RELATORIOS',
          requiredPermission: "Relatórios",
          isExpanded: false,
          items: [
            {
              label: "Relatório de Medição",
              labelKey: 'SIDEBAR.RELATORIO_MEDICAO',
              routerLink: 'relatorios/medicoes',
              requiredPermission: "Relatório Medição"
            },
            {
              label: "Relatório de Estoque",
              labelKey: 'SIDEBAR.RELATORIO_ESTOQUE',
              routerLink: 'relatorios/estoque',
              requiredPermission: "Relatório Estoque"
            },
          ]
        },
        {
          icon: 'pi pi-file icon-spacing',
          title: "Contratos e Aditivos",
          titleKey: 'SIDEBAR.CONTRATOS_ADITIVOS',
          requiredPermission: "Contratos e Aditivos",
          isExpanded: false,
          items: [
            {
              label: "Gestão de Contratos",
              labelKey: 'SIDEBAR.GESTAO_CONTRATOS',
              routerLink: 'contratos-aditivos/gestao-contratos',
              requiredPermission: "Contratos"
            },
            {
              label: "Gestão de Aditivos",
              labelKey: 'SIDEBAR.GESTAO_ADITIVOS',
              routerLink: 'contratos-aditivos/gestao-aditivos',
              requiredPermission: "Aditivos"
            },
          ]
        },
        {
          icon: 'pi pi-folder icon-spacing',
          title: "Documentos",
          titleKey: 'SIDEBAR.DOCUMENTOS',
          requiredPermission: "Documentos",
          isExpanded: false,
          items: [
            {
              label: "Árvore de Documentos",
              labelKey: 'SIDEBAR.ARVORE_DOCUMENTOS',
              routerLink: 'documentos/teste-pw',
              requiredPermission: "TestePW"
            },
          ]
        },
        {
          icon: 'pi pi-wave-pulse icon-spacing',
          title: "Planejamento",
          titleKey: 'SIDEBAR.PLANEJAMENTO',
          requiredPermission: "Planejamento",
          isExpanded: false,
          items: [
            {
              label: "Histórico de Produtos",
              labelKey: 'SIDEBAR.HISTORICO_PRODUTOS',
              routerLink: 'planejamento/historico-produto',
              requiredPermission: "Histórico de Produtos"
            },
            {
              label: "Testes de Qualidade",
              labelKey: 'SIDEBAR.TESTES_QUALIDADE',
              routerLink: 'planejamento/teste-produto',
              requiredPermission: "Testes de Qualidade"
            }
          ]
        },
        {
          icon: 'pi pi-plus icon-spacing',
          title: "Cadastro",
          titleKey: 'SIDEBAR.CADASTRO',
          requiredPermission: "Cadastro",
          isExpanded: false,
          items: [
            {
              label: "Clientes e Fornecedores",
              labelKey: 'SIDEBAR.CLIENTES_FORNECEDORES',
              routerLink: 'cadastro/clientes-fornecedores',
              requiredPermission: "Cadastro de Clientes/Fornecedores"
            },
            {
              label: "Produtos",
              labelKey: 'SIDEBAR.PRODUTOS',
              routerLink: 'cadastro/produtos',
              requiredPermission: "Cadastro de Produtos"
            },
            {
              label: "Funcionários",
              labelKey: 'SIDEBAR.FUNCIONARIOS',
              routerLink: 'cadastro/funcionarios',
              requiredPermission: "Cadastro de Funcionários"
            }
          ]
        },
        {
          icon: 'pi pi-cog icon-spacing',
          title: "Configurações",
          titleKey: 'SIDEBAR.CONFIGURACOES',
          requiredPermission: "Configurações",
          isExpanded: false,
          items: [
            {
              label: "Perfis e Acessos",
              labelKey: 'SIDEBAR.PERFIS_ACESSOS',
              routerLink: '',
              hasSubmenu: true,
              isSubmenuVisible: false,
              requiredPermission: ["Controle de Perfis", "Controle de Acessos"],
              submenuItems: [
                {
                  label: "Controle de Perfis",
                  labelKey: 'SIDEBAR.CONTROLE_PERFIS',
                  routerLink: 'configuracoes/perfis',
                  requiredPermission: "Controle de Perfis"
                },
                {
                  label: "Controle de Acessos",
                  labelKey: 'SIDEBAR.CONTROLE_ACESSOS',
                  routerLink: 'configuracoes/acessos',
                  requiredPermission: "Controle de Acessos"
                },
              ]
            },
            {
              label: "Controle de Sessões",
              labelKey: 'SIDEBAR.CONTROLE_SESSOES',
              routerLink: 'configuracoes/sessoes',
              requiredPermission: "Controle de Sessões"
            },
            {
              label: "Logs do Sistema",
              labelKey: 'SIDEBAR.LOGS_SISTEMA',
              routerLink: 'configuracoes/logs-sistema',
              requiredPermission: "Logs do Sistema"
            },
          ],
        }
      ];

      this.menus = allMenus
        .filter(menu => this.hasPermission(menu.title, '', 'Visualização'))
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
      
      this.changeDetectorRef.detectChanges();
      this.updateActiveMenu();
      
    } catch (error) {
      messageOfReturns(this.messageService, 'error', this.translateService.instant('SIDEBAR.ERRO_AO_GERAR_MENUS'), this.translateService.instant('SIDEBAR.ERRO_AO_GERAR_MENUS_DETALHE'), 3000);
    }
  }

  /**
   * Alterna a expansão de uma seção de menu
   * @param menu - Menu a ser expandido/recolhido
   */
  protected toggleMenuSection(menu: Menu): void {
    menu.isExpanded = !menu.isExpanded;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Mostra o submenu no modo compacto
   * Calcula posição baseada no espaço disponível na tela
   * @param menu - Menu que contém o submenu
   * @param event - Evento do mouse para posicionamento
   */
  showCompactSubmenu(menu: Menu, event?: MouseEvent) {
    if (this.hoveredMenu === menu && this.submenuOpenedByClick) {
      this.closeSubmenu();
      return;
    }
    
    if (this.hoveredMenu && this.hoveredMenu !== menu) {
      this.hoveredMenu = null;
      this.submenuOpenedByClick = false;
    }
    
    this.hoveredMenu = menu;
    this.submenuOpenedByClick = true;
    
    const sidebar = document.querySelector('.modern-sidebar.compact') as HTMLElement;
    if (sidebar) {
      const rect = sidebar.getBoundingClientRect();
      const targetElement = event ? (event.target as HTMLElement) : null;
      
      if (targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const headerHeight = 80;
        const itemHeight = 56;
        const totalItems = menu.items.length;
        const estimatedHeight = Math.min(headerHeight + (totalItems * itemHeight), window.innerHeight * 0.8);
        
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        
        let topPosition: number;
        let maxHeight: number;
        
        if (spaceBelow >= estimatedHeight || spaceBelow > spaceAbove) {
          topPosition = targetRect.top - 10;
          this._isSubmenuUp = false;
          
          maxHeight = Math.min(estimatedHeight, spaceBelow - 20);
        } else {
          topPosition = targetRect.bottom - estimatedHeight + 10;
          this._isSubmenuUp = true;
          
          maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
        }
        
        topPosition = Math.max(10, Math.min(topPosition, window.innerHeight - maxHeight - 10));
        
        if (maxHeight < 100) {
          maxHeight = Math.min(300, window.innerHeight - 40);
        }
        
        this.submenuPosition = {
          top: topPosition,
          left: rect.right + 5
        };
        
        this.calculatedMaxHeight = maxHeight;
      } else {
        this.submenuPosition = {
          top: rect.top + 100,
          left: rect.right + 5
        };
        this.calculatedMaxHeight = window.innerHeight * 0.8;
      }
    }
  }

  /**
   * Esconde o submenu no modo compacto
   * Aplica delay para permitir navegação entre menu e submenu
   * @param menu - Menu do submenu a ser escondido
   */
  hideCompactSubmenu(menu: Menu) {
    setTimeout(() => {
      if (!this.submenuHover && !this.submenuOpenedByClick) {
        this.hoveredMenu = null;
        this.submenuOpenedByClick = false;
      }
    }, 150);
  }

  /**
   * Mostra o submenu aninhado à direita
   * Calcula posição baseada no espaço disponível
   * @param menuItem - Item de menu que contém o submenu
   * @param event - Evento do mouse para posicionamento
   */
  showNestedSubmenu(menuItem: MenuItem, event: MouseEvent) {
    this.nestedSubmenu = menuItem;
    const targetElement = event.target as HTMLElement;
    const targetRect = targetElement.getBoundingClientRect();
    
    const headerHeight = 80;
    const itemHeight = 50;
    const totalItems = menuItem.submenuItems?.length || 0;
    const estimatedHeight = Math.min(headerHeight + (totalItems * itemHeight), window.innerHeight * 0.8);

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    let topPosition: number;
    let maxHeight: number;
    
    if (spaceBelow >= estimatedHeight || spaceBelow > spaceAbove) {
      topPosition = targetRect.top - 10;
      this._isNestedSubmenuUp = false;
      maxHeight = Math.min(estimatedHeight, spaceBelow - 20);
    } else {
      topPosition = targetRect.bottom - estimatedHeight + 10;
      this._isNestedSubmenuUp = true;
      maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
    }

    topPosition = Math.max(10, Math.min(topPosition, window.innerHeight - maxHeight - 10));
    
    if (maxHeight < 100) {
      maxHeight = Math.min(300, window.innerHeight - 40);
    }
    
    this.nestedSubmenuPosition = {
      top: topPosition,
      left: targetRect.right + 5
    };
    
    this.nestedSubmenuMaxHeight = maxHeight;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Esconde o submenu aninhado
   * Aplica delay para permitir navegação
   * @param menuItem - Item de menu do submenu aninhado
   */
  hideNestedSubmenu(menuItem: MenuItem) {
    setTimeout(() => {
      if (!this.nestedSubmenuHover) {
        this.nestedSubmenu = null;
      }
    }, 100);
  }

  /**
   * Verifica se o submenu principal está sendo mostrado para cima
   * @returns true se o submenu está sendo mostrado para cima
   */
  isSubmenuUp(): boolean {
    return this._isSubmenuUp;
  }

  /**
   * Verifica se o submenu aninhado está sendo mostrado para cima
   * @returns true se o submenu aninhado está sendo mostrado para cima
   */
  isNestedSubmenuUp(): boolean {
    return this._isNestedSubmenuUp;
  }

  /**
   * Mostra o submenu no modo expandido
   * @param menuItem - Item de menu que contém o submenu
   * @param event - Evento do mouse
   */
  showExpandedSubmenu(menuItem: MenuItem, event: MouseEvent) {
    menuItem.isSubmenuVisible = true;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Esconde o submenu no modo expandido
   * Aplica delay para permitir navegação
   * @param menuItem - Item de menu do submenu
   */
  hideExpandedSubmenu(menuItem: MenuItem) {
    setTimeout(() => {
      menuItem.isSubmenuVisible = false;
      this.changeDetectorRef.detectChanges();
    }, 150);
  }

  /**
   * Alterna menu no modo compacto
   * @param menu - Menu a ser alternado
   */
  toggleCompactMenu(menu: Menu) {
    this.hoveredMenu = menu;
  }

  /**
   * Alterna o estado da sidebar (expandido/recolhido)
   * Utiliza o serviço de sidebar para gerenciar o estado
   */
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  /**
   * Força a atualização dos menus após mudança de idioma
   * Recarrega a estrutura de menus com as novas traduções
   */
  private forceMenuUpdate(): void {
    if (this._userPermissions.length > 0) {
      this.getMenus();
    }
  }

  /**
   * Atualiza o sidebar completamente quando as permissões são alteradas
   * Recarrega permissões, menus e força detecção de mudanças
   */
  private refreshSidebar(): void {

    const storedAcessos = loadUserAcessosFromStorage();
    if (storedAcessos && storedAcessos.length > 0) {
      this._userPermissions = storedAcessos;
    }
    
    this.getMenus();
    this.changeDetectorRef.detectChanges();
    this.updateActiveMenu();
    
  }

  /**
   * Método público para forçar o refresh do sidebar
   * Útil para casos onde é necessário atualizar manualmente
   */
  public forceRefreshSidebar(): void {
    this.refreshSidebar();
  }

  /**
   * Verifica se a sidebar pode ser exibida
   * @returns true se a sidebar pode ser exibida
   */
  protected isSidebarAllowed(): boolean {
    return true;
  }

  /**
   * Manipulador de eventos de teclado para acessibilidade
   * Permite navegação por teclado na sidebar
   * @param event - Evento de teclado
   */
  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSidebar();
    }
  }

  /**
   * Verifica se um item está ativo baseado na rota atual
   * @param routerLink - Link da rota
   * @returns true se o item está ativo
   */
  public isItemActive(routerLink: string): boolean {
    return this.router.url.includes(routerLink);
  }

  /**
   * Verifica se um menu está ativo baseado na rota atual
   * Considera itens de submenu para determinar se o menu principal está ativo
   * @param menu - Menu a ser verificado
   * @returns true se o menu está ativo
   */
  public isMenuActive(menu: Menu): boolean {
    if (!menu || !menu.items) return false;
    
    const currentUrl = this.router.url;
    const isActive = menu.items.some((item: MenuItem) => {
      if (item.hasSubmenu && item.submenuItems) {
        return item.submenuItems.some((subItem: SubMenuItem) => 
          currentUrl.includes(subItem.routerLink)
        );
      }
      return currentUrl.includes(item.routerLink);
    });
    
    return isActive;
  }

  /**
   * Atualiza o menu ativo baseado na rota atual
   * Chamado sempre que a rota for alterada
   */
  private updateActiveMenu(): void {
    this.activeMenu = this.menus.find(menu => this.isMenuActive(menu)) || null;
  }

  /**
   * Obtém a classe CSS do tema atual
   * @returns String com a classe do tema para aplicação de estilos
   */
  public getThemeClass(): string {
    return `theme-${this.currentTheme}`;
  }

  /**
   * Fecha o submenu quando clicar em outro item ou fora
   * Reseta todos os estados relacionados aos submenus
   */
  closeSubmenu() {
    this.hoveredMenu = null;
    this.submenuOpenedByClick = false;
    this.nestedSubmenu = null;
  }

  /**
   * Detecta cliques fora do submenu para fechá-lo
   * Melhora a experiência do usuário ao fechar submenus automaticamente
   * @param event - Evento de clique do documento
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.modern-sidebar.compact');
    const submenu = document.querySelector('.compact-submenu-float');
    const nestedSubmenu = document.querySelector('.compact-submenu-float.nested-submenu');
    
    if (sidebar && submenu && nestedSubmenu) {
      if (!sidebar.contains(target) && !submenu.contains(target) && !nestedSubmenu.contains(target)) {
        this.closeSubmenu();
      }
    }
  }

  /**
   * Traduz o título de um menu principal
   * Utiliza o serviço de tradução para obter o texto no idioma atual
   * @param menu - Menu cujo título deve ser traduzido
   * @returns Título traduzido ou título original se não houver chave de tradução
   */
  translateTitle(menu: Menu): string {
    if (menu.titleKey) {
      return this.translationService.translate(menu.titleKey);
    }
    return menu.title;
  }

  /**
   * Traduz o label de um item de menu
   * Utiliza o serviço de tradução para obter o texto no idioma atual
   * @param item - Item de menu cujo label deve ser traduzido
   * @returns Label traduzido ou label original se não houver chave de tradução
   */
  translateLabel(item: MenuItem): string {
    if (item.labelKey) {
      return this.translationService.translate(item.labelKey);
    }
    return item.label;
  }

  /**
   * Traduz o label de um submenu
   * Utiliza o serviço de tradução para obter o texto no idioma atual
   * @param subItem - Item de submenu cujo label deve ser traduzido
   * @returns Label traduzido ou label original se não houver chave de tradução
   */
  translateSubmenuLabel(subItem: SubMenuItem): string {
    if (subItem.labelKey) {
      return this.translationService.translate(subItem.labelKey);
    }
    return subItem.label;
  }
}

function messageOfReturns(messageService: MessageService, arg1: string, arg2: any, arg3: any, arg4: number) {
  throw new Error("Function not implemented.");
}
