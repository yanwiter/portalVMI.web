import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageModule } from 'primeng/message';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';

// Componentes
import { NotaFiscalComponent } from './nota-fiscal/nota-fiscal.component';
import { NotaFiscalFormComponent } from './nota-fiscal/nota-fiscal-form/nota-fiscal-form.component';
import { ItemNotaFiscalFormComponent } from './nota-fiscal/nota-fiscal-form/item-nota-fiscal-form/item-nota-fiscal-form.component';
import { EmissaoNotaFiscalComponent } from './nota-fiscal/emissao-nota-fiscal/emissao-nota-fiscal.component';
import { DanfeViewerComponent } from './nota-fiscal/danfe-viewer/danfe-viewer.component';
import { ContasReceberComponent } from './contas-receber/contas-receber.component';
import { ContasPagarComponent } from './contas-pagar/contas-pagar.component';
import { FluxoCaixaComponent } from './fluxo-caixa/fluxo-caixa.component';
import { ConciliacaoBancariaComponent } from './conciliacao-bancaria/conciliacao-bancaria.component';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Routing
import { FinanceiroRoutingModule } from './financeiro.routing.module';

@NgModule({
  declarations: [
    NotaFiscalComponent,
    NotaFiscalFormComponent,
    ItemNotaFiscalFormComponent,
    EmissaoNotaFiscalComponent,
    DanfeViewerComponent,
    ContasReceberComponent,
    ContasPagarComponent,
    FluxoCaixaComponent,
    ConciliacaoBancariaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ToastModule,
    TooltipModule,
    PaginatorModule,
    MessageModule,
    InputNumberModule,
    TagModule,
    InputTextareaModule,
    SharedModule,
    FinanceiroRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class FinanceiroModule { }
