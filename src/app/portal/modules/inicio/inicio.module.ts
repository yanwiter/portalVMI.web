import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { InicioComponent } from './inicio/inicio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioRoutingModule } from './inicio.routing.module';


@NgModule({
  declarations: [
    InicioComponent,
    DashboardComponent
  ],
  imports: [
   InicioRoutingModule,CommonModule, FormsModule, PrimeNGModule, SharedModule
  ]
})
export class InicioModule { }
