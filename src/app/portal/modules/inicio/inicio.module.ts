import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { InicioComponent } from './inicio/inicio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioRoutingModule } from './inicio.routing.module';
import { DashboardEstoqueComponent } from './dashboard/dashboard-estoque/dashboard-estoque.component';
import { DashboardExecutivoComponent } from './dashboard/dashboard-executivo/dashboard-executivo.component';
import { DashboardClienteComponent } from './dashboard/dashboard-cliente/dashboard-cliente.component';
import { DashboardFornecedorComponent } from './dashboard/dashboard-fornecedor/dashboard-fornecedor.component';
import { DashboardContratoComponent } from './dashboard/dashboard-contrato/dashboard-contrato.component';

// Services
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    InicioComponent,
    DashboardComponent,
    DashboardEstoqueComponent,
    DashboardExecutivoComponent,
    DashboardClienteComponent,
    DashboardFornecedorComponent,
    DashboardContratoComponent
  ],
  imports: [
   InicioRoutingModule,
   CommonModule, 
   FormsModule, 
   PrimeNGModule, 
   SharedModule
  ],
  providers: [
    MessageService
  ]
})
export class InicioModule { }
