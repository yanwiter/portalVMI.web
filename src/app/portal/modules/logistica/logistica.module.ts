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
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { RatingModule } from 'primeng/rating';
import { StepsModule } from 'primeng/steps';
import { MenuModule } from 'primeng/menu';
import { TimelineModule } from 'primeng/timeline';
import { MapModule } from 'primeng/map';

// Componentes
import { TransportesComponent } from './transportes/transportes.component';
import { RoteirizacaoComponent } from './roteirizacao/roteirizacao.component';
import { EntregasComponent } from './entregas/entregas.component';
import { RastreamentoComponent } from './rastreamento/rastreamento.component';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Routing
import { LogisticaRoutingModule } from './logistica.routing.module';

@NgModule({
  declarations: [
    TransportesComponent,
    RoteirizacaoComponent,
    EntregasComponent,
    RastreamentoComponent
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
    ChartModule,
    ProgressBarModule,
    TabViewModule,
    InputNumberModule,
    TextareaModule,
    CheckboxModule,
    RadioButtonModule,
    MultiSelectModule,
    FileUploadModule,
    InputMaskModule,
    RatingModule,
    StepsModule,
    MenuModule,
    TimelineModule,
    MapModule,
    SharedModule,
    LogisticaRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class LogisticaModule { } 