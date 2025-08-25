import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComercialRoutingModule } from './comercial.routing.module';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { FunilVendasComponent } from './funil-vendas/funil-vendas.component';


@NgModule({
  declarations: [
    FunilVendasComponent,
  ],
  imports: [
    ComercialRoutingModule, CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class ComercialModule { }
