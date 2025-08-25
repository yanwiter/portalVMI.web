import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SensitiveDataService } from '../../services/sensitive-data.service';
import { SensitiveDataLevel, SensitiveDataConfig } from '../../models/sensitive-data.model';

@Component({
  selector: 'app-sensitive-data-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="sensitive-data-button" [ngClass]="'level-' + currentLevel" 
            [title]="'Nível Atual: ' + getCurrentLevelConfig()?.label + ' - Clique para alterar'"
            (click)="cycleToNextLevel()">
      <i class="pi" [ngClass]="getIconClass()"></i>
    </button>
  `,
  styleUrls: ['./sensitive-data-indicator.component.scss']
})
export class SensitiveDataIndicatorComponent implements OnInit, OnDestroy {
  @Input() showSelector: boolean = false; // Não usado mais, mas mantido para compatibilidade
  
  public currentLevel: SensitiveDataLevel = SensitiveDataLevel.PUBLIC;
  private subscription: Subscription = new Subscription();

  constructor(private sensitiveDataService: SensitiveDataService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.sensitiveDataService.getUserLevel().subscribe(level => {
        this.currentLevel = level;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cycleToNextLevel(): void {    // Ciclo: Público -> Interno -> Conf    
    let nextLevel: SensitiveDataLevel;
    
    switch (this.currentLevel) {
      case SensitiveDataLevel.PUBLIC:
        nextLevel = SensitiveDataLevel.INTERNAL;
        break;
      case SensitiveDataLevel.INTERNAL:
        nextLevel = SensitiveDataLevel.CONFIDENTIAL;
        break;
      case SensitiveDataLevel.CONFIDENTIAL:
        nextLevel = SensitiveDataLevel.PUBLIC;
        break;
      default:
        nextLevel = SensitiveDataLevel.PUBLIC;
    }
    
    this.sensitiveDataService.setUserLevel(nextLevel);
    this.currentLevel = nextLevel;
  }

  getCurrentLevelConfig(): SensitiveDataConfig | undefined {
    return this.sensitiveDataService.getLevelConfig(this.currentLevel);
  }

  getIconClass(): string {
    return this.getIconForLevel(this.currentLevel);
  }

  getIconForLevel(level: SensitiveDataLevel): string {
    switch (level) {
      case SensitiveDataLevel.PUBLIC:
        return 'pi-eye';
      case SensitiveDataLevel.INTERNAL:
        return 'pi-eye-slash';
      case SensitiveDataLevel.CONFIDENTIAL:
        return 'pi-lock';
      default:
        return 'pi-eye';
    }
  }
}
