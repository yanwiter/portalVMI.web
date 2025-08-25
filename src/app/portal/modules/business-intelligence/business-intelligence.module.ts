import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Module
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';

// Translate
import { TranslateModule } from '@ngx-translate/core';

// Componentes
import { KpisComponent } from './kpis/kpis.component';
import { RelatoriosAvancadosComponent } from './relatorios-avancados/relatorios-avancados.component';
import { AnalisesPreditivasComponent } from './analises-preditivas/analises-preditivas.component';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Routing
import { BusinessIntelligenceRoutingModule } from './business-intelligence.routing.module';

// Services
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    KpisComponent,
    RelatoriosAvancadosComponent,
    AnalisesPreditivasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    PrimeNGModule,
    SharedModule,
    BusinessIntelligenceRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class BusinessIntelligenceModule { } 