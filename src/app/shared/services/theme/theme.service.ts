import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  code: string;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  public availableThemes: Theme[] = [
    { code: 'light', name: 'Tema Claro', icon: 'pi pi-sun' },
    { code: 'dark', name: 'Tema Escuro', icon: 'pi pi-moon' }
  ];

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Tentar usar tema salvo no localStorage ou usar tema padrão
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem('selectedTheme');
    } catch (error) {
      console.warn('localStorage não está disponível:', error);
    }
    
    const themeToUse = savedTheme || 'light';
    this.setTheme(themeToUse);
  }

  public setTheme(themeCode: string): void {
    if (this.availableThemes.some(theme => theme.code === themeCode)) {
      this.currentThemeSubject.next(themeCode);
      
      // Aplicar tema ao body
      this.applyThemeToBody(themeCode);
      
      try {
        localStorage.setItem('selectedTheme', themeCode);
      } catch (error) {
        console.warn('Não foi possível salvar o tema no localStorage:', error);
      }
    }
  }

  private applyThemeToBody(themeCode: string): void {
    const body = document.body;
    
    // Remover classes de tema anteriores
    body.classList.remove('theme-light', 'theme-dark');
    
    // Adicionar nova classe de tema
    body.classList.add(`theme-${themeCode}`);
    
    // Adicionar atributo data-theme para CSS custom properties
    body.setAttribute('data-theme', themeCode);
  }

  public getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  public getCurrentThemeInfo(): Theme | undefined {
    return this.availableThemes.find(theme => theme.code === this.getCurrentTheme());
  }

  public getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  public toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
} 