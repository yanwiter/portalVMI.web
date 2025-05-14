/**
 * Componente de autenticação e login de usuários.
 * 
 * Este componente gerencia o processo de login, incluindo autenticação básica,
 * tratamento de primeiro acesso e solicitação de redefinição de senha.
 * 
 * @class LoginComponent
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PerfilModel } from '../../shared/models/perfil.model';
import { GenericService } from '../../shared/services/generic/generic.service';
import { MessageService } from 'primeng/api';
import { saveUserData } from '../../shared/util/localStorageUtil';
import { SpinnerService } from '../../shared/services/spinner/spinner.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /** Email do usuário para login */
  public email: string = '';
  
  /** Senha do usuário */
  public password: string = '';
  
  /** Tipo de usuário (default: 'colaborador') */
  public userType: string = 'colaborador';
  
  /** Controla a visibilidade da senha no formulário */
  public mostrarSenha: boolean = false;
  
  /** Indica se está ocorrendo uma operação de loading */
  public loading: boolean = false;

  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly loginService = inject(GenericService<PerfilModel>);

  /**
   * Submete os dados de login para autenticação
   * @method onSubmit
   */
  onSubmit() {
    const loginData = {
      email: this.email,
      password: this.password,
      //userType: this.userType
    };

    this.loginService.post('loginRoutes', loginData)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Inicia o processo de recuperação de senha
   * @method esqueciSenha
   */
  esqueciSenha() {
    if (!this.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo obrigatório',
        detail: 'Por favor, informe seu e-mail para redefinir a senha',
        life: 3000
      });
      return;
    }

    this.spinnerService.show();

    const requestBody = { email: this.email };
    
    this.loginService.postWithBody('loginRoutes', ['Esqueci-senha'], requestBody)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'E-mail enviado',
            detail: 'Enviamos um e-mail com instruções para redefinir sua senha',
            life: 5000
          });
          this.spinnerService.hide();
        },
        error: (err) => {
          this.handleError(err);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Trata a resposta bem-sucedida do serviço de login
   * @method handleResponse
   * @private
   * @param {any} response - Resposta do servidor de autenticação
   */
  private handleResponse(response: any) {
    if (response.success && response.data) {
      saveUserData(response);
  
      if (response.data.isPrimeiroAcesso) {
        localStorage.setItem('passwordResetData', JSON.stringify({
          obrigatorio: true,
          email: this.email
        }));
        this.router.navigate(['/redefinir-senha'], { state: { bypassGuard: true } });
      } else {
        this.router.navigate(['/portal'], { state: { bypassGuard: true } });
        this.messageService.add({
          severity: 'success',
          summary: 'Login efetuado com sucesso',
          detail: `Olá, ${response.data.nome}! Seja bem-vindo(a)!`,
          life: 3000
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erro inesperado',
        detail: 'A resposta do servidor não contém dados do usuário',
        life: 3000
      });
    }
  }

  /**
   * Trata erros ocorridos durante o processo de login
   * @method handleError
   * @private
   * @param {any} error - Objeto de erro retornado
   */
  private handleError(error: any) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Erro ao efetuar login',
      detail: error.error?.message ?? 'Erro desconhecido',
      life: 3000
    });
  }
}