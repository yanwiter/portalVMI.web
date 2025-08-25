import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  // Ações rápidas
  public quickActions = [
    {
      id: 'sessoes',
      title: 'Controle de Sessões',
      description: 'Gerenciar sessões ativas',
      icon: 'pi pi-users',
      color: 'primary',
      route: '/portal/configuracoes/sessoes'
    },
    {
      id: 'acessos',
      title: 'Perfis e Acessos',
      description: 'Configurar permissões',
      icon: 'pi pi-shield',
      color: 'success',
      route: '/portal/configuracoes/acessos'
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Visualizar relatórios',
      icon: 'pi pi-chart-bar',
      color: 'info',
      route: '/portal/relatorios'
    },
    {
      id: 'contratos',
      title: 'Contratos',
      description: 'Gerenciar contratos',
      icon: 'pi pi-file',
      color: 'warning',
      route: '/portal/comercial/contratos'
    }
  ];

  ngOnInit(): void {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.translateService.get([
      'HOME.TITLE',
      'HOME.QUICK_ACTIONS'
    ]).subscribe();
  }

  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
