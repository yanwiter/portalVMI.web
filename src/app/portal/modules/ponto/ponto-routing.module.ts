import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PontoComponent } from './ponto.component';
import { RegistroPontoComponent } from './registro-ponto/registro-ponto.component';
import { RelatoriosPontoComponent } from './relatorios-ponto/relatorios-ponto.component';
import { ConfiguracaoPontoComponent } from './configuracao-ponto/configuracao-ponto.component';
import { HorariosTrabalhoComponent } from './horarios-trabalho/horarios-trabalho.component';
import { AprovacaoHorasExtrasComponent } from './aprovacao-horas-extras/aprovacao-horas-extras.component';

const routes: Routes = [
  {
    path: '',
    component: PontoComponent,
    children: [
      { path: '', redirectTo: 'registro-ponto', pathMatch: 'full' },
      { path: 'registro-ponto', component: RegistroPontoComponent },
      { path: 'relatorios', component: RelatoriosPontoComponent },
      { path: 'configuracao', component: ConfiguracaoPontoComponent },
      { path: 'horarios-trabalho', component: HorariosTrabalhoComponent },
      { path: 'aprovacao-horas-extras', component: AprovacaoHorasExtrasComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PontoRoutingModule { } 