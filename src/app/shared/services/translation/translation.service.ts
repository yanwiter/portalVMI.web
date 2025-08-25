import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interface que define a estrutura de um idioma disponível
 */
export interface Language {
  /** Código do idioma (ex: 'pt', 'en', 'es') */
  code: string;
  /** Nome do idioma em sua língua nativa */
  name: string;
  /** Emoji da bandeira do país (opcional) */
  flag?: string;
}

/**
 * Serviço responsável por gerenciar traduções e mudanças de idioma na aplicação
 * Utiliza o ngx-translate para gerenciar as traduções e mantém o estado do idioma atual
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  /** BehaviorSubject que mantém o idioma atual */
  private currentLanguageSubject = new BehaviorSubject<string>('pt');
  
  /** Observable público para monitorar mudanças no idioma atual */
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  /** Lista de idiomas disponíveis na aplicação */
  public availableLanguages: Language[] = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  /**
   * Construtor do serviço
   * @param translateService - Serviço do ngx-translate para gerenciar traduções
   * @param applicationRef - Referência da aplicação para forçar detecção de mudanças
   */
  constructor(
    private translateService: TranslateService,
    private applicationRef: ApplicationRef
  ) {
    this.initializeTranslation();
  }

  /**
   * Inicializa o serviço de tradução configurando idiomas disponíveis,
   * idioma padrão e idioma inicial baseado em preferências salvas ou idioma do navegador
   * @private
   */
  private initializeTranslation(): void {
    this.translateService.addLangs(['pt', 'en', 'es']);
    
    this.translateService.setDefaultLang('pt');
    
    let savedLanguage: string | null = null;
    try {
      savedLanguage = localStorage.getItem('selectedLanguage');
    } catch (error) {
      console.warn('localStorage não está disponível:', error);
    }
    
    const browserLanguage = this.translateService.getBrowserLang();
    
    const languageToUse = savedLanguage || 
                         (browserLanguage && this.availableLanguages.some(lang => lang.code === browserLanguage) ? browserLanguage : 'pt');
    
    this.setLanguage(languageToUse);
  }

  /**
   * Define o idioma atual da aplicação
   * @param languageCode - Código do idioma a ser definido (ex: 'pt', 'en', 'es')
   * @public
   */
  public setLanguage(languageCode: string): void {
    if (this.availableLanguages.some(lang => lang.code === languageCode)) {
      this.translateService.use(languageCode).subscribe(() => {
        this.currentLanguageSubject.next(languageCode);
        
        try {
          localStorage.setItem('selectedLanguage', languageCode);
        } catch (error) {
          console.warn('Não foi possível salvar o idioma no localStorage:', error);
        }
        
        this.forceGlobalChangeDetection();
      }, (error) => {
        console.error('Erro ao alterar idioma:', error);
      });
    } else {
      console.warn('Idioma não suportado:', languageCode);
    }
  }

  /**
   * Força a detecção de mudanças global na aplicação após mudança de idioma
   * Dispara eventos customizados para notificar componentes sobre a mudança
   * @private
   */
  private forceGlobalChangeDetection(): void {
    setTimeout(() => {
      this.applicationRef.tick();
      
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: this.getCurrentLanguage() } 
      }));
      
      setTimeout(() => {
        this.applicationRef.tick();
      }, 50);
    }, 100);
  }

  /**
   * Retorna o código do idioma atual
   * @returns {string} Código do idioma atual
   * @public
   */
  public getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Retorna informações completas sobre o idioma atual
   * @returns {Language | undefined} Objeto com informações do idioma atual ou undefined se não encontrado
   * @public
   */
  public getCurrentLanguageInfo(): Language | undefined {
    return this.availableLanguages.find(lang => lang.code === this.getCurrentLanguage());
  }

  /**
   * Retorna a lista de todos os idiomas disponíveis
   * @returns {Language[]} Array com todos os idiomas disponíveis
   * @public
   */
  public getAvailableLanguages(): Language[] {
    return this.availableLanguages;
  }

  /**
   * Traduz uma chave para o idioma atual de forma síncrona
   * @param key - Chave de tradução
   * @param params - Parâmetros para interpolação na tradução (opcional)
   * @returns {string} Texto traduzido ou a chave original se não encontrada
   * @public
   */
  public translate(key: string, params?: any): string {
    const translation = this.translateService.instant(key, params);
    if (translation === key) {
      console.warn(`Tradução não encontrada para a chave: ${key}`);
      return key;
    }
    return translation;
  }

  /**
   * Retorna um observable para traduzir uma chave de forma assíncrona
   * @param key - Chave de tradução
   * @param params - Parâmetros para interpolação na tradução (opcional)
   * @returns Observable com a tradução
   * @public
   */
  public getTranslation(key: string, params?: any) {
    return this.translateService.get(key, params);
  }

  /**
   * Força a atualização de um componente específico através do ChangeDetectorRef
   * @param changeDetectorRef - Referência do detector de mudanças do componente
   * @public
   */
  public forceComponentUpdate(changeDetectorRef: ChangeDetectorRef): void {
    changeDetectorRef.detectChanges();
  }
} 