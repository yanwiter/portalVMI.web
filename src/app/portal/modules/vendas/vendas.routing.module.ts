import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OportunidadesComponent } from "./oportunidades/oportunidades.component";
import { PipelineVendasComponent } from "./pipeline-vendas/pipeline-vendas.component";
import { OrcamentosComponent } from "./orcamentos/orcamentos.component";
import { PedidosVendaComponent } from "./pedidos-venda/pedidos-venda.component";
import { ComissoesComponent } from "./comissoes/comissoes.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "oportunidades",
    pathMatch: "full"
  },
  {
    path: "oportunidades",
    component: OportunidadesComponent,
  },
  {
    path: "pipeline",
    component: PipelineVendasComponent,
  },
  {
    path: "orcamentos",
    component: OrcamentosComponent,
  },
  {
    path: "pedidos",
    component: PedidosVendaComponent,
  },
  {
    path: "comissoes",
    component: ComissoesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendasRoutingModule { } 