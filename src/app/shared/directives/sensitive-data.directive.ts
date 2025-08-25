import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SensitiveDataService } from '../services/sensitive-data.service';
import { SensitiveDataLevel } from '../models/sensitive-data.model';

@Directive({
  selector: '[appSensitiveData]',
  standalone: true
})
export class SensitiveDataDirective implements OnInit, OnDestroy {
  @Input() appSensitiveData: string = '';
  @Input() sensitiveLevel: SensitiveDataLevel = SensitiveDataLevel.PUBLIC;
  @Input() customBlurIntensity?: number;

  private subscription: Subscription = new Subscription();
  private originalContent: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sensitiveDataService: SensitiveDataService
  ) {}

  ngOnInit(): void {
    this.originalContent = this.el.nativeElement.textContent || '';
    
    // Se não foi especificado um nível, tenta obter do nome do campo
    if (this.sensitiveLevel === SensitiveDataLevel.PUBLIC && this.appSensitiveData) {
      this.sensitiveLevel = this.sensitiveDataService.getFieldLevel(this.appSensitiveData);
    }

    // Aplica o blur inicial
    this.applyBlur();

    // Inscreve para mudanças no nível do usuário
    this.subscription.add(
      this.sensitiveDataService.getUserLevel().subscribe(() => {
        this.applyBlur();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private applyBlur(): void {
    const shouldBlur = this.sensitiveDataService.shouldBlurField(this.sensitiveLevel);
    
    if (shouldBlur) {
      const blurIntensity = this.customBlurIntensity || 
                           this.sensitiveDataService.getBlurIntensity(this.sensitiveLevel);
      
      this.renderer.setStyle(this.el.nativeElement, 'filter', `blur(${blurIntensity}px)`);
      this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
      
      // Adiciona tooltip informativo
      this.addTooltip();
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'filter');
      this.renderer.removeStyle(this.el.nativeElement, 'user-select');
      this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
      this.removeTooltip();
    }
  }

  private addTooltip(): void {
    const levelConfig = this.sensitiveDataService.getLevelConfig(this.sensitiveLevel);
    const tooltipText = `Dados ${levelConfig.label} - Acesso restrito`;
    
    this.renderer.setAttribute(this.el.nativeElement, 'title', tooltipText);
    this.renderer.setAttribute(this.el.nativeElement, 'data-toggle', 'tooltip');
  }

  private removeTooltip(): void {
    this.renderer.removeAttribute(this.el.nativeElement, 'title');
    this.renderer.removeAttribute(this.el.nativeElement, 'data-toggle');
  }
}
