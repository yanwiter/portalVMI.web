/**
 * Componente para redefinição de senha do usuário.
 * 
 * Este componente lida com dois cenários de redefinição de senha:
 * 1. Redefinição obrigatória no primeiro acesso
 * 2. Redefinição solicitada pelo usuário através de token
 * 
 * @class RedefirSenhaComponent
 * @implements {OnInit}
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilModel } from '../../shared/models/perfil.model';
import { GenericService } from '../../shared/services/generic/generic.service';
import { MessageService } from 'primeng/api';
import { SpinnerService } from '../../shared/services/spinner/spinner.service';

@Component({
  selector: 'app-redefir-senha',
  templateUrl: './redefir-senha.component.html',
  styleUrl: './redefir-senha.component.scss'
})
export class RedefirSenhaComponent {
  /** Email do usuário para redefinição de senha */
  public email: string = '';
  
  /** Token de redefinição de senha */
  public token: string = '';
  
  /** Nova senha digitada pelo usuário */
  public password: string = '';
  
  /** Confirmação da nova senha */
  public passwordRepeat: string = '';
  
  /** Flag para mostrar/ocultar senha atual */
  public mostrarSenhaAtual: boolean = false;
  
  /** Senha atual do usuário (para cenário de alteração) */
  public senhaAtual: string = '';
  
  /** Flag para mostrar/ocultar a nova senha */
  public mostrarSenha: boolean = false;
  
  /** Indica se a redefinição é obrigatória (primeiro acesso) */
  public obrigatorio: boolean = false;

  private readonly destroy = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spinnerService = inject(SpinnerService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(GenericService<PerfilModel>);

  /**
   * Inicializa o componente verificando parâmetros de rota e dados salvos
   * @method ngOnInit
   */
  ngOnInit() {
    const savedData = localStorage.getItem('passwordResetData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.obrigatorio = data.obrigatorio;
      this.email = data.email;
    }

    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];
    });

    if (this.obrigatorio) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alteração obrigatória',
        detail: 'Você deve alterar sua senha para continuar',
        life: 5000
      });
    }
  }

  /**
   * Valida e envia os dados para redefinição de senha
   * @method onSubmit
   */
  onSubmit() {
    if (this.password !== this.passwordRepeat) {
      this.messageService.add({
        severity: 'info',
        summary: 'Ação não realizada',
        detail: `As senhas não coincidem!`,
        life: 3000
      });
      return;
    }
  
    const validacao = this.validarSenha(this.password);
    if (!validacao.valido) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Senha inválida',
        detail: validacao.mensagem,
        life: 3000
      });
      return;
    }
  
    this.spinnerService.show();
  
    if (this.obrigatorio) {
      this.alterarSenhaPrimeiroAcesso();
    } else {
      this.redefinirSenhaComToken();
    }
  }

  /**
   * Verifica se a senha tem o mínimo de caracteres
   * @method temMinimoCaracteres
   * @returns {boolean} True se a senha tem 8 ou mais caracteres
   */
  temMinimoCaracteres(): boolean {
    return this.password?.length >= 8;
  }

  /**
   * Verifica se a senha contém letra maiúscula
   * @method temMaiuscula
   * @returns {boolean} True se a senha contém pelo menos 1 letra maiúscula
   */
  temMaiuscula(): boolean {
    return /[A-Z]/.test(this.password);
  }

  /**
   * Verifica se a senha contém letra minúscula
   * @method temMinuscula
   * @returns {boolean} True se a senha contém pelo menos 1 letra minúscula
   */
  temMinuscula(): boolean {
    return /[a-z]/.test(this.password);
  }

  /**
   * Verifica se a senha contém número
   * @method temNumero
   * @returns {boolean} True se a senha contém pelo menos 1 número
   */
  temNumero(): boolean {
    return /[0-9]/.test(this.password);
  }

  /**
   * Valida a senha de acordo com os critérios de complexidade
   * @method validarSenha
   * @private
   * @param {string} senha - Senha a ser validada
   * @returns {Object} Objeto com status de validação e mensagem de erro (se aplicável)
   */
  private validarSenha(senha: string): { valido: boolean, mensagem?: string } {
    if (senha.length < 8) {
      return { valido: false, mensagem: 'A senha deve ter no mínimo 8 caracteres' };
    }
  
    if (!/[A-Z]/.test(senha)) {
      return { valido: false, mensagem: 'A senha deve conter pelo menos 1 letra maiúscula' };
    }
  
    if (!/[a-z]/.test(senha)) {
      return { valido: false, mensagem: 'A senha deve conter pelo menos 1 letra minúscula' };
    }
  
    if (!/[0-9]/.test(senha)) {
      return { valido: false, mensagem: 'A senha deve conter pelo menos 1 número' };
    }
    return { valido: true };
  }

  /**
   * Processa a alteração de senha para primeiro acesso
   * @method alterarSenhaPrimeiroAcesso
   * @private
   */
  private alterarSenhaPrimeiroAcesso() {
    const savedData = localStorage.getItem('passwordResetData');
    const email = savedData ? JSON.parse(savedData).email : this.email;

    const dados = {
      email: email,
      newPassword: this.password,
      confirmPassword: this.passwordRepeat
    };

    this.authService.postWithBody('loginRoutes', ['Resetar-senha-primeiro-acesso'], dados)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
          this.router.navigate(['/portal'], { state: { bypassGuard: true } });
          this.messageService.add({
            severity: 'success',
            summary: 'Login efetuado com sucesso',
            detail: `Olá, ${response.data.nome}! Seja bem-vindo(a)!`,
            life: 3000
          });
        },
        error: (err) => this.handleError(err)
      });
    localStorage.removeItem('passwordResetData');
  }

  /**
   * Processa a redefinição de senha usando token
   * @method redefinirSenhaComToken
   * @private
   */
  private redefinirSenhaComToken() {
    const resetData = {
      email: this.email,
      token: this.token,
      newPassword: this.password,
      confirmPassword: this.passwordRepeat
    };

    this.authService.postWithBody('loginRoutes', ['Resetar-senha'], resetData)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
          this.router.navigate(['/authenticate'], { state: { bypassGuard: true } });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Trata a resposta do servidor após tentativa de redefinição
   * @method handleResponse
   * @private
   * @param {any} response - Resposta do servidor
   */
  private handleResponse(response: any) {
    if (response.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.obrigatorio 
          ? 'Senha alterada com sucesso!' 
          : 'Sua senha foi redefinida com sucesso!',
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erro inesperado',
        detail: 'A resposta do servidor teve erros',
        life: 3000
      });
    }
    this.spinnerService.hide();
  }

  /**
   * Trata erros ocorridos durante o processo de redefinição
   * @method handleError
   * @private
   * @param {any} error - Erro ocorrido
   */
  private handleError(error: any) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Erro ao alterar senha',
      detail: error.error?.message ?? 'Erro desconhecido',
      life: 3000
    });
    this.spinnerService.hide();
  }
}