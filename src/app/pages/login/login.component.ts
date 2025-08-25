import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { GenericService } from '../../shared/services/generic/generic.service';
import { saveUserId } from '../../shared/util/localStorageUtil';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public email: string = '';
  public password: string = '';
  public userType: string = 'colaborador';
  public mostrarSenha: boolean = false;
  public loading: boolean = false;

  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly loginService = inject(GenericService<any>);

  onSubmit() {
    this.spinnerService.show();
    
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.loginService.post('loginRoutes', loginData)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.spinnerService.hide();
          this.handleLoginResponse(response, this.email);
        },
        error: (err) => {
          this.spinnerService.hide();
          this.handleError(err);
        }
      });
  }

  private handleLoginResponse(response: any, email: string) {
    if (response.success && response.data.userId) {
      saveUserId(response.data.userId);
      
      this.router.navigate(['/authenticate'], { 
        state: { 
          email: email,
          bypassGuard: true 
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro no login',
        detail: response.message || 'Credenciais inválidas',
        life: 5000
      });
    }
  }

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
            detail: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha',
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

  private handleError(error: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.error?.message || 'Ocorreu um erro durante o processo',
      life: 5000
    });
  }
}