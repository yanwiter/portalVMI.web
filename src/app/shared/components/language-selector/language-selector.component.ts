import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService, Language } from '../../services/translation/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, TranslateModule]
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private languageSubscription?: Subscription;

  public availableLanguages: Language[] = [];
  public selectedLanguage: Language | null = null;

  ngOnInit(): void {
    this.initializeLanguages();
    this.subscribeToLanguageChanges();
    this.subscribeToLanguageChangeEvents();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeLanguages(): void {
    try {
      this.availableLanguages = this.translationService.getAvailableLanguages();
      this.selectedLanguage = this.translationService.getCurrentLanguageInfo() || this.availableLanguages[0];
    } catch (error) {
      console.error('Erro ao inicializar idiomas:', error);
      // Fallback para português
      this.availableLanguages = [
        { code: 'pt', name: 'Português', flag: '🇧🇷' }
      ];
      this.selectedLanguage = this.availableLanguages[0];
    }
  }

  private subscribeToLanguageChanges(): void {
    this.languageSubscription = this.translationService.currentLanguage$.subscribe(languageCode => {
      // Atualizar o idioma selecionado quando houver mudança
      this.selectedLanguage = this.translationService.getCurrentLanguageInfo() || this.availableLanguages[0];
      this.changeDetectorRef.detectChanges();
    });
  }

  private subscribeToLanguageChangeEvents(): void {
    // Escutar eventos de mudança de idioma
    window.addEventListener('languageChanged', () => {
      this.selectedLanguage = this.translationService.getCurrentLanguageInfo() || this.availableLanguages[0];
      this.changeDetectorRef.detectChanges();
    });
  }

  onLanguageChange(event: any): void {
    if (event.value && event.value.code) {
      this.translationService.setLanguage(event.value.code);
    }
  }
} 