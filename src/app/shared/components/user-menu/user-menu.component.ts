import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme/theme.service';
import { TranslationService } from '../../services/translation/translation.service';
import { getUserNameFromStorage, getPerfilNameFromStorage, getUserIdFromStorage, getFotoPerfilFromStorage } from '../../util/localStorageUtil';
import { ContextService } from '../../services/context/context.service';
import { EmpresaModel } from '../../models/empresa.model';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GenericService } from '../../services/generic/generic.service';
import { UsuarioModel } from '../../models/usuario.model';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, OnDestroy {
  public isMenuOpen = false;
  public userName: string = '';
  public userProfile: string = '';
  public userEmail: string = '';
  public userProfileImage: string | null = null;
  public selectedFile: File | null = null;
  public userId: string | null = null;
  public empresaAtiva: EmpresaModel | null = null;
  public empresasDisponiveis: EmpresaModel[] = [];
  public empresaSelecionada: EmpresaModel | null = null;
  
  // Propriedades para edição de perfil
  public showEditProfileModal = false;
  public editingUserName: string = '';
  public editingUserEmail: string = '';
  public editingUserPhone: string = '';
  
  private subscription = new Subscription();

  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly contextService = inject(ContextService);
  private readonly messageService = inject(MessageService);
  private readonly usuarioService = inject(GenericService<UsuarioModel>);

  ngOnInit(): void {
    this.loadUserInfo();
    
    this.empresaAtiva = this.contextService.obterEmpresaAtiva();
    this.empresasDisponiveis = this.contextService.obterEmpresasDisponiveis();
    this.empresaSelecionada = this.empresaAtiva;
    
    this.loadProfileImage();
    
    this.subscription.add(
      this.contextService.contexto$.subscribe(contexto => {
        this.empresaAtiva = contexto.empresaAtiva;
        this.empresasDisponiveis = contexto.empresasDisponiveis;
        this.empresaSelecionada = contexto.empresaAtiva;
      })
    );
    
    if (!this.userProfileImage) {
      setTimeout(() => {
        this.loadProfileImage();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Carrega informações do usuário
   */
  private loadUserInfo(): void {
    this.userName = getUserNameFromStorage();
    this.userProfile = getPerfilNameFromStorage();
    this.editingUserName = this.userName;
    this.editingUserEmail = this.userEmail || localStorage.getItem('userEmail') || '';
    this.editingUserPhone = localStorage.getItem('userPhone') || '';
    
    const fotoPerfil = getFotoPerfilFromStorage();
    if (fotoPerfil && fotoPerfil !== 'null' && fotoPerfil !== 'undefined') {
      this.userProfileImage = fotoPerfil;
    }
    
    this.userId = localStorage.getItem('userId');
  }

  private loadProfileImage(): void {
    const fotoPerfil = getFotoPerfilFromStorage();
    if (fotoPerfil && fotoPerfil !== 'null' && fotoPerfil !== 'undefined') {
      this.userProfileImage = fotoPerfil;
      return;
    }
    
    if (!this.userProfileImage && this.userId) {
      this.loadProfileImageFromAPI();
    }
  }

  /**
   * Carrega foto de perfil da API
   */
  private loadProfileImageFromAPI(): void {
    if (!this.userId) return;
    
    this.usuarioService.get('usuarioRoutes', this.userId as string).subscribe({
      next: (response) => {
        if (response && response.data && response.data.fotoPerfil) {
          this.userProfileImage = response.data.fotoPerfil;
          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const parsedData = JSON.parse(userData);
              parsedData.fotoPerfil = response.data.fotoPerfil;
              localStorage.setItem('userData', JSON.stringify(parsedData));
            } catch (e) {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar foto de perfil'
              });
            }
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar foto de perfil'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar foto de perfil' + error
        });
      }
    });
  }

  /**
   * Abre o modal de edição de perfil
   */
  public openEditProfileModal(): void {
    this.showEditProfileModal = true;
    this.loadUserInfo();
    
    if (!this.userProfileImage) {
      this.loadProfileImage();
    }
  }

  public closeEditProfileModal(): void {
    this.showEditProfileModal = false;
    this.selectedFile = null;
 
    const originalImage = getFotoPerfilFromStorage();
    if (originalImage && originalImage !== 'null' && originalImage !== 'undefined') {
      this.userProfileImage = originalImage;
    }
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'A imagem deve ter no máximo 5MB'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Por favor, selecione apenas arquivos de imagem'
        });
        return;
      }

      this.selectedFile = file;
      this.previewImage(file);
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.userProfileImage = e.target.result as string;
    };
    reader.readAsDataURL(file);
  }

  public removeProfileImage(): void {
    this.userProfileImage = null;
    this.selectedFile = null;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        parsedData.fotoPerfil = null;
        localStorage.setItem('userData', JSON.stringify(parsedData));;
      } catch (e) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao remover foto de perfil'
        });
      }
    }
    
    if (this.userId) {
      this.usuarioService.delete('usuarioRoutes', this.userId, ['foto-perfil']).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Foto de perfil removida com sucesso!'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Foto removida localmente, mas houve erro na sincronização com o servidor' + error
          });
        }
      });
    }
  }

  public isFormValid(): boolean {
    return this.editingUserName?.trim().length > 0 && 
           this.editingUserEmail?.trim().length > 0;
  }

  public async saveProfileChanges(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    try {
      this.userName = this.editingUserName;
      
      if (this.selectedFile && this.userId) {
        await this.uploadProfileImage();
      } else if (this.userProfileImage && this.userProfileImage !== 'null' && this.userProfileImage !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            parsedData.fotoPerfil = this.userProfileImage;
            localStorage.setItem('userData', JSON.stringify(parsedData));
          } catch (e) {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar foto de perfil'
            });
          }
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nenhuma imagem para salvar'
        });
      }

      if (this.userId) {
        const updateData = {
          nome: this.editingUserName,
          email: this.editingUserEmail,
          telefone: this.editingUserPhone
        };

        this.usuarioService.update('usuarioRoutes', this.userId, updateData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Perfil atualizado com sucesso!'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Aviso',
              detail: 'Perfil atualizado localmente, mas houve erro na sincronização com o servidor' + error
            });
          }
        });
      }

      this.closeEditProfileModal();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar as mudanças. Tente novamente.' + error
      });
    }
  }

  /**
   * Faz upload da imagem de perfil
   */
  private async uploadProfileImage(): Promise<void> {
    if (!this.selectedFile || !this.userId) return;

    try {
      const base64 = await this.fileToBase64(this.selectedFile);
      const formData = new FormData();
      formData.append('fotoPerfil', this.selectedFile);
      
      this.usuarioService.uploadFile('usuarioRoutes', formData, [`${this.userId}/foto-perfil`]).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Imagem de perfil enviada para o servidor com sucesso!' });

          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const parsedData = JSON.parse(userData);
              parsedData.fotoPerfil = base64;
              localStorage.setItem('userData', JSON.stringify(parsedData));
            } catch (e) {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao atualizar foto de perfil' + e
              });
            }
          }
        },
        error: (error) => {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Imagem salva localmente, mas houve erro no envio para o servidor' + error });
        }
      });
    } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao processar a imagem. Tente novamente.' + error });
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
  }

  public logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public changeLanguage(lang: string): void {
    this.translationService.setLanguage(lang);
  }

  public getCurrentLanguage(): string {
    return this.translateService.currentLang || 'pt';
  }

  public getCurrentTheme(): string {
    return this.themeService.getCurrentTheme();
  }

  public onEmpresaChange(empresa: EmpresaModel): void {
    if (!empresa) return;
    
    if (empresa.id !== this.empresaAtiva?.id) {
      this.contextService.alterarEmpresaAtiva(empresa);
      this.empresaAtiva = empresa;
      this.empresaSelecionada = empresa;
      this.closeMenu();
    }
  }
} 