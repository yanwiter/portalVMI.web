import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Guarda de rota para controle de autenticação/autorização
 * 
 * Esta guarda verifica se a navegação foi acionada por uma URL com flag de bypass
 * Caso contrário, redireciona para página não autorizada
 */
export class AuthGuard implements CanActivate {

  /**
   * Armazena o histórico das últimas navegações permitidas
   * @private
   */
  private readonly lastNavigation: string[] = [];

  /**
   * Serviço de roteamento injetado
   * @private
   */
  private readonly routerService = inject(Router);

  /**
   * Método que determina se uma rota pode ser ativada
   * @param {ActivatedRouteSnapshot} next - O snapshot da rota que está sendo ativada
   * @param {RouterStateSnapshot} state - O snapshot do estado atual do roteador
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree} 
   * Retorna verdadeiro se a rota pode ser ativada, falso caso contrário
   */
  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    /**
     * Verifica se a navegação foi disparada por URL com flag de bypass
     */
    const navigationTriggeredByUrl = this.routerService.getCurrentNavigation()?.extras?.state?.['bypassGuard'];

    if (navigationTriggeredByUrl) {
      this.lastNavigation.push(state.url);
      return true;
    }

    // Redireciona para página não autorizada se não tiver permissão
    this.routerService.navigate(['/unauthorized']);
    return false;
  }
}