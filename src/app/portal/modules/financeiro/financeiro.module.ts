import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceiroRoutingModule } from './financeiro.routing.module';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';


@NgModule({
  declarations: [
  ],
  imports: [
    FinanceiroRoutingModule, CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class FinanceiroModule { }
