import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracoesRoutingModule } from './configuracoes.routing.module';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { PerfisComponent } from './perfis/perfis.component';
import { AcessosComponent } from './acessos/acessos.component';
import { SessoesComponent } from './sessoes/sessoes.component';
import { TranslateModule } from '@ngx-translate/core';
import { LogsSistemaComponent } from './logs-sistema/logs-sistema.component';

@NgModule({
  declarations: [
    PerfisComponent,
    AcessosComponent,
    SessoesComponent,
    LogsSistemaComponent
  ],
  imports: [
    ConfiguracoesRoutingModule, 
    CommonModule, 
    FormsModule, 
    PrimeNGModule, 
    SharedModule,
    TranslateModule
  ]
})
export class ConfiguracoesModule { }
