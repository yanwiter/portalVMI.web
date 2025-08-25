import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, Theme } from '../../services/theme/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, TooltipModule, TranslateModule]
})
export class ThemeSelectorComponent implements OnInit {
  private themeService = inject(ThemeService);

  public availableThemes: Theme[] = [];
  public selectedTheme: Theme | null = null;

  ngOnInit(): void {
    this.initializeThemes();
  }

  private initializeThemes(): void {
    try {
      this.availableThemes = this.themeService.getAvailableThemes();
      this.selectedTheme = this.themeService.getCurrentThemeInfo() || this.availableThemes[0];
    } catch (error) {
      this.availableThemes = [
        { code: 'light', name: 'Tema Claro', icon: 'pi pi-sun' }
      ];
      this.selectedTheme = this.availableThemes[0];
    }
  }

  onThemeChange(event: any): void {
    if (event.value && event.value.code) {
      this.themeService.setTheme(event.value.code);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.selectedTheme = this.themeService.getCurrentThemeInfo() || this.availableThemes[0];
  }
} 