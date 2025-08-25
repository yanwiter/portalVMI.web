import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Components
import { PontoComponent } from './ponto.component';
import { RegistroPontoComponent } from './registro-ponto/registro-ponto.component';
import { RelatoriosPontoComponent } from './relatorios-ponto/relatorios-ponto.component';
import { ConfiguracaoPontoComponent } from './configuracao-ponto/configuracao-ponto.component';
import { HorariosTrabalhoComponent } from './horarios-trabalho/horarios-trabalho.component';
import { AprovacaoHorasExtrasComponent } from './aprovacao-horas-extras/aprovacao-horas-extras.component';

// Routing
import { PontoRoutingModule } from './ponto-routing.module';

@NgModule({
  declarations: [
    PontoComponent,
    RegistroPontoComponent,
    RelatoriosPontoComponent,
    ConfiguracaoPontoComponent,
    HorariosTrabalhoComponent,
    AprovacaoHorasExtrasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // PrimeNG
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    InputTextareaModule,
    MessageModule,
    ToastModule,
    TooltipModule,
    PaginatorModule,
    TabViewModule,
    MultiSelectModule,
    CheckboxModule,
    RadioButtonModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    TimelineModule,
    TagModule,
    
    // Shared
    SharedModule,
    
    // Routing
    PontoRoutingModule
  ],
  providers: [
    ConfirmationService
  ]
})
export class PontoModule { } 