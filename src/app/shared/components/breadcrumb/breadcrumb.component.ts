import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem = {
    icon: 'pi pi-home',
    url: '/portal'
  };

  ngOnInit(): void {
    this.generateBreadcrumbs();
    
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateBreadcrumbs(): void {
    this.breadcrumbItems = [];
    
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment !== '');

    if (segments.length > 1) {
      let currentUrl = '';
      
      for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        currentUrl += `/${segment}`;
        
        const label = this.getBreadcrumbLabel(segment);
        
        this.breadcrumbItems.push({
          label: label,
          url: `/portal${currentUrl}`
        });
      }
    }
  }

  private getBreadcrumbLabel(segment: string): string {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment !== '');
    
    const labelMap: { [key: string]: string } = {
      'inicio': 'BREADCRUMB.INICIO',
      'dashboards': 'BREADCRUMB.DASHBOARDS',
      'relatorios': 'BREADCRUMB.RELATORIOS',
      'medicoes': 'BREADCRUMB.MEDICOES',
      'financeiro': 'BREADCRUMB.FINANCEIRO',
      'notas-fiscais': 'BREADCRUMB.NOTAS_FISCAIS',
      'emissao-notas-fiscais': 'BREADCRUMB.EMISSAO_NOTAS_FISCAIS',
      'comercial': 'BREADCRUMB.COMERCIAL',
      'funil-vendas': 'BREADCRUMB.FUNIL_VENDAS',
      'contratos-aditivos': 'BREADCRUMB.CONTRATOS_ADITIVOS',
      'gestao-contratos': 'BREADCRUMB.GESTAO_CONTRATOS',
      'gestao-aditivos': 'BREADCRUMB.GESTAO_ADITIVOS',
      'planejamento': 'BREADCRUMB.PLANEJAMENTO',
      'historico-produto': 'BREADCRUMB.HISTORICO_PRODUTOS',
      'historico-produtos': 'BREADCRUMB.HISTORICO_PRODUTOS',
      'teste-produto': 'BREADCRUMB.TESTE_PRODUTOS',
      'teste-produtos': 'BREADCRUMB.TESTE_PRODUTOS',
      'cadastro': 'BREADCRUMB.CADASTROS',
      'produtos': 'BREADCRUMB.PRODUTOS',
      'clientes-fornecedores': 'BREADCRUMB.CLIENTES_FORNECEDORES',
      'funcionarios': 'BREADCRUMB.FUNCIONARIOS',
      'configuracoes': 'BREADCRUMB.CONFIGURACOES',
      'perfis': 'BREADCRUMB.PERFIS',
      'acessos': 'BREADCRUMB.ACESSOS',
      'sessoes': 'BREADCRUMB.SESSOES',
      'logs-sistema': 'BREADCRUMB.LOGS_SISTEMA',
      'ponto': 'BREADCRUMB.PONTO',
      'registro-ponto': 'BREADCRUMB.REGISTRO_PONTO',
      'configuracao': 'BREADCRUMB.CONFIGURACAO_PONTO',
      'horarios-trabalho': 'BREADCRUMB.HORARIOS_TRABALHO',
      'aprovacao-horas-extras': 'BREADCRUMB.APROVACAO_HORAS_EXTRAS',
      'business-intelligence': 'BREADCRUMB.BUSINESS_INTELLIGENCE',
      'kpis': 'BREADCRUMB.KPIS',
      'relatorios-avancados': 'BREADCRUMB.RELATORIOS_AVANCADOS',
      'analises-preditivas': 'BREADCRUMB.ANALISES_PREDITIVAS'
    };

    // Verificar se estamos no contexto do módulo ponto
    const isPontoContext = segments.includes('ponto');
    
    // Se estamos no contexto do ponto e o segmento é 'relatorios', usar a label específica do ponto
    if (isPontoContext && segment === 'relatorios') {
      return 'BREADCRUMB.RELATORIOS_PONTO';
    }

    const translationKey = labelMap[segment];
    if (translationKey) {
      return translationKey;
    }
    
    return this.capitalizeFirstLetter(segment);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
} 