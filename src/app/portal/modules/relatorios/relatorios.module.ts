import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatoriosRoutingModule } from './relatorios.routing.module';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { MedicoesComponent } from './medicoes/medicoes.component';
import { RelatoriosEstoqueComponent } from './estoque/relatorios-estoque.component';


@NgModule({
  declarations: [
    MedicoesComponent,
    RelatoriosEstoqueComponent
  ],
  imports: [
    RelatoriosRoutingModule, CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class RelatoriosModule { }
