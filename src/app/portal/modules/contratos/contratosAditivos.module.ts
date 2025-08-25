import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { GestaoContratosComponent } from './gestao-contratos/gestao-contratos.component';
import { GestaoAditivosComponent } from './gestao-aditivos/gestao-aditivos.component';
import { AprovacaoContratosComponent } from './aprovacao-contratos/aprovacao-contratos.component';
import { ContratosAditivosRoutingModule } from './contratosAditivos.routing.module';

@NgModule({
  declarations: [
    GestaoContratosComponent,
    GestaoAditivosComponent,
    AprovacaoContratosComponent
  ],
  imports: [
    ContratosAditivosRoutingModule, CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class ContratosAditivosModule { }
