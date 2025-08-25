import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nao-autorizado',
  templateUrl: './nao-autorizado.component.html',
  styleUrl: './nao-autorizado.component.scss'
})
/**
 * Componente para exibição de página não autorizada
 * 
 * Este componente é exibido quando o usuário tenta acessar uma rota sem permissão
 * Oferece a opção de navegar para a página de autenticação
 */
export class NaoAutorizadoComponent {

  /**
   * Serviço de roteamento injetado
   * @private
   */
  private readonly router = inject(Router);

  /**
   * Navega para a página de autenticação
   * 
   * Este método é chamado quando o usuário clica no botão para ir para a página de login
   * @public
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}