import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanejamentoRoutingModule } from './planejamento.routing.module';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { TesteProdutosComponent } from './teste-produtos/teste-produtos.component';
import { HistoricoProdutosComponent } from './historico-produtos/historico-produtos.component';


@NgModule({
  declarations: [
    HistoricoProdutosComponent,
    TesteProdutosComponent
  ],
  imports: [
    PlanejamentoRoutingModule, CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class PlanejamentoModule { }
