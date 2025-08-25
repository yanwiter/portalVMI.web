import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation/translation.service';
import { SharedModule } from '../../modules/shared.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  private readonly translationService = inject(TranslationService);

  public currentDate = new Date();

  constructor() {}
}