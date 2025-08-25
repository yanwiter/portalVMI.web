import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCounterAnimation]'
})
export class CounterAnimationDirective implements OnInit, OnDestroy {
  @Input('appCounterAnimation') targetValue: number = 0;
  @Input() duration: number = 2000;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  @Input() locale: string = 'pt-BR';
  @Input() decimalPlaces: number = 0;

  private animationFrameId: number | null = null;
  private startTime: number | null = null;
  private startValue: number = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.startAnimation();
  }

  ngOnDestroy(): void {
    this.cancelAnimation();
  }

  private startAnimation(): void {
    this.cancelAnimation();
    this.startValue = 0;
    this.startTime = null;
    
    const animate = (timestamp: number) => {
      if (!this.startTime) this.startTime = timestamp;
      
      const progress = timestamp - this.startTime;
      const percentage = Math.min(progress / this.duration, 1);
      
      const currentValue = this.easeOutQuad(percentage, this.startValue, this.targetValue, 1);
      this.updateDisplay(currentValue);
      
      if (percentage < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private easeOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d;
    return -c * t*(t-2) + b;
  }

  private updateDisplay(value: number): void {
    let formattedValue: string;
    
    if (this.decimalPlaces > 0) {
      formattedValue = value.toLocaleString(this.locale, {
        minimumFractionDigits: this.decimalPlaces,
        maximumFractionDigits: this.decimalPlaces
      });
    } else {
      formattedValue = Math.round(value).toLocaleString(this.locale);
    }

    const displayText = `${this.prefix}${formattedValue}${this.suffix}`;
    this.renderer.setProperty(this.el.nativeElement, 'textContent', displayText);
  }

  private cancelAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}