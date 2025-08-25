import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { KpisComponent } from "./kpis/kpis.component";
import { RelatoriosAvancadosComponent } from "./relatorios-avancados/relatorios-avancados.component";
import { AnalisesPreditivasComponent } from "./analises-preditivas/analises-preditivas.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "kpis",
    pathMatch: "full"
  },
  {
    path: "kpis",
    component: KpisComponent,
  },
  {
    path: "relatorios",
    component: RelatoriosAvancadosComponent,
  },
  {
    path: "analises",
    component: AnalisesPreditivasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessIntelligenceRoutingModule { } 