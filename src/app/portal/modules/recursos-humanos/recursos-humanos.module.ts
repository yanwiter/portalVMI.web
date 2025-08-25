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

// Componentes
import { FuncionariosComponent } from './funcionarios/funcionarios.component';
import { FolhaPagamentoComponent } from './folha-pagamento/folha-pagamento.component';
import { BeneficiosComponent } from './beneficios/beneficios.component';
import { FeriasComponent } from './ferias/ferias.component';
import { AvaliacaoComponent } from './avaliacao/avaliacao.component';
import { TreinamentosComponent } from './treinamentos/treinamentos.component';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Routing
import { RecursosHumanosRoutingModule } from './recursos-humanos.routing.module';

@NgModule({
  declarations: [
    FuncionariosComponent,
    FolhaPagamentoComponent,
    BeneficiosComponent,
    FeriasComponent,
    AvaliacaoComponent,
    TreinamentosComponent
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
    SharedModule,
    RecursosHumanosRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class RecursosHumanosModule { } 