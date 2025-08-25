import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContextService } from '../services/context/context.service';
import { EmpresaDataService } from '../services/context/empresa-data.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaContextGuard implements CanActivate {
  constructor(
    private contextService: ContextService,
    private empresaDataService: EmpresaDataService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const empresaAtiva = this.contextService.obterEmpresaAtiva();
    
    if (!empresaAtiva) {
      console.error('Nenhuma empresa ativa encontrada');
      this.router.navigate(['/login']);
      return of(false);
    }

    // Verificar se o módulo está disponível para a empresa
    const modulo = this.obterModuloDaRota(state.url);
    
    if (modulo) {
      return this.empresaDataService.verificarPermissaoModulo(empresaAtiva.id, modulo).pipe(
        map(temPermissao => {
          if (temPermissao) {
            return true;
          } else {
            console.warn(`Módulo '${modulo}' não disponível para empresa '${empresaAtiva.nomeFantasia}'`);
            this.router.navigate(['/nao-autorizado']);
            return false;
          }
        }),
        catchError(error => {
          console.error('Erro ao verificar permissões da empresa:', error);
          this.router.navigate(['/nao-autorizado']);
          return of(false);
        })
      );
    }

    return of(true);
  }

  private obterModuloDaRota(url: string): string | null {
    // Extrair o módulo da URL
    const segments = url.split('/').filter(segment => segment);
    
    if (segments.length > 1) {
      const modulo = segments[1];
      
      // Mapear URLs para módulos
      const mapeamentoModulos: { [key: string]: string } = {
        'inicio': 'inicio',
        'cadastros': 'cadastros',
        'comercial': 'comercial',
        'estoque': 'estoque',
        'financeiro': 'financeiro',
        'ponto': 'ponto',
        'relatorios': 'relatorios',
        'configuracoes': 'configuracoes',
        'vendas': 'vendas',
        'compras': 'compras',
        'producao': 'producao',
        'projetos': 'projetos',
        'recursos-humanos': 'recursos-humanos',
        'logistica': 'logistica',
        'planejamento': 'planejamento',
        'integracao': 'integracao',
        'business-intelligence': 'business-intelligence',
        'contratos': 'contratos',
        'documentos': 'documentos',
        'comunicacao': 'comunicacao'
      };

      return mapeamentoModulos[modulo] || null;
    }

    return null;
  }
}
