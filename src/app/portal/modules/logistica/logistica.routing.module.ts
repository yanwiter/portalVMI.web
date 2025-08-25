import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TransportesComponent } from "./transportes/transportes.component";
import { RoteirizacaoComponent } from "./roteirizacao/roteirizacao.component";
import { EntregasComponent } from "./entregas/entregas.component";
import { RastreamentoComponent } from "./rastreamento/rastreamento.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "transportes",
    pathMatch: "full"
  },
  {
    path: "transportes",
    component: TransportesComponent,
  },
  {
    path: "roteirizacao",
    component: RoteirizacaoComponent,
  },
  {
    path: "entregas",
    component: EntregasComponent,
  },
  {
    path: "rastreamento",
    component: RastreamentoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaRoutingModule { } 