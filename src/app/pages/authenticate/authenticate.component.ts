import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GenericService } from '../../shared/services/generic/generic.service';
import { getUserIdFromStorage, saveUserData } from '../../shared/util/localStorageUtil';
import { SpinnerService } from '../../shared/services/spinner/spinner.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit, OnDestroy {
  value: string = '';
  resendEnabled = false;
  countdown = 60;
  private countdownInterval: any;
  private userId: string | null = null;
  public email: string = '';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private genericService: GenericService<any>,
    private spinnerService: SpinnerService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras.state?.['email'] || '';
  }

  ngOnInit() {
    this.userId = getUserIdFromStorage();
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown() {
    this.resendEnabled = false;
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.resendEnabled = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  validateCode() {
    if (this.value.length !== 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Código inválido',
        detail: 'O código deve conter 6 dígitos',
        life: 3000
      });
      return;
    }

    this.spinnerService.show();

    const request = {
      UserId: this.userId,
      Code: this.value
    };

    this.genericService.postWithBody('loginRoutes', ['validar-codigo'], request)
      .subscribe({
        next: (response) => {
          this.spinnerService.hide();
          this.handleValidationResponse(response);
        },
        error: (err) => {
          this.spinnerService.hide();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error?.message || 'Código inválido ou expirado',
            life: 5000
          });
        }
      });
  }

  private handleValidationResponse(response: any) {
    if (response.success) {
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
          detail: `Olá, ${response.data.user.nome}! Seja bem-vindo(a)!`,
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

  resendCode() {
    if (this.resendEnabled && this.userId) {
      this.spinnerService.show();
      
      this.genericService.postWithBody('loginRoutes', ['reenviar-codigo'], { UserId: this.userId })
        .subscribe({
          next: () => {
            this.spinnerService.hide();
            this.messageService.add({
              severity: 'success',
              summary: 'Código reenviado',
              detail: 'Um novo código foi enviado para seu e-mail',
              life: 5000
            });
            this.startCountdown();
          },
          error: (err) => {
            this.spinnerService.hide();
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.message || 'Falha ao reenviar o código',
              life: 5000
            });
          }
        });
    }
  }
}