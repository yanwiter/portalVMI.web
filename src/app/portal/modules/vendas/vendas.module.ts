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
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';

// Componentes
import { OportunidadesComponent } from './oportunidades/oportunidades.component';
import { PipelineVendasComponent } from './pipeline-vendas/pipeline-vendas.component';
import { OrcamentosComponent } from './orcamentos/orcamentos.component';
import { PedidosVendaComponent } from './pedidos-venda/pedidos-venda.component';
import { ComissoesComponent } from './comissoes/comissoes.component';

// Shared
import { SharedModule } from '../../../shared/modules/shared.module';

// Routing
import { VendasRoutingModule } from './vendas.routing.module';

@NgModule({
  declarations: [
    OportunidadesComponent,
    PipelineVendasComponent,
    OrcamentosComponent,
    PedidosVendaComponent,
    ComissoesComponent
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
    CheckboxModule,
    RadioButtonModule,
    MultiSelectModule,
    SharedModule,
    VendasRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class VendasModule { } 