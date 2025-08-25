import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {
  private readonly versionCheckInterval = 5 * 60 * 1000;
  private readonly currentVersion = environment.version;

  constructor(private messageService: MessageService) {}

  public initVersionCheck(): void {
    this.checkVersion();
    
    setInterval(() => this.checkVersion(), this.versionCheckInterval);
  }

  private checkVersion(): void {
    fetch('assets/environment.json?t=' + new Date().getTime())
      .then(response => {
        if (!response.ok) throw new Error('Falha na verificação');
        return response.json();
      })
      .then(latestEnv => {
        if (latestEnv.version !== this.currentVersion) {
          this.notifyNewVersion();
        }
      })
      .catch(() => console.warn('Não foi possível verificar a versão'));
  }

  private notifyNewVersion(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Nova versão disponível!',
      detail: 'Uma atualização do sistema está disponível. Por favor, recarregue a página.',
      life: 10000,
      closable: true
    });
  }
}