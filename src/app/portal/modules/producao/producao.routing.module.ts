import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanejamentoProducaoComponent } from "./planejamento-producao/planejamento-producao.component";
import { ControleQualidadeComponent } from "./controle-qualidade/controle-qualidade.component";
import { RastreabilidadeComponent } from "./rastreabilidade/rastreabilidade.component";
import { ManutencaoComponent } from "./manutencao/manutencao.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "planejamento",
    pathMatch: "full"
  },
  {
    path: "planejamento",
    component: PlanejamentoProducaoComponent,
  },
  {
    path: "qualidade",
    component: ControleQualidadeComponent,
  },
  {
    path: "rastreabilidade",
    component: RastreabilidadeComponent,
  },
  {
    path: "manutencao",
    component: ManutencaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProducaoRoutingModule { } 