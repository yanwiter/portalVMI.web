import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FuncionariosComponent } from "./funcionarios/funcionarios.component";
import { FolhaPagamentoComponent } from "./folha-pagamento/folha-pagamento.component";
import { BeneficiosComponent } from "./beneficios/beneficios.component";
import { FeriasComponent } from "./ferias/ferias.component";
import { AvaliacaoComponent } from "./avaliacao/avaliacao.component";
import { TreinamentosComponent } from "./treinamentos/treinamentos.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "funcionarios",
    pathMatch: "full"
  },
  {
    path: "funcionarios",
    component: FuncionariosComponent,
  },
  {
    path: "folha",
    component: FolhaPagamentoComponent,
  },
  {
    path: "beneficios",
    component: BeneficiosComponent,
  },
  {
    path: "ferias",
    component: FeriasComponent,
  },
  {
    path: "avaliacao",
    component: AvaliacaoComponent,
  },
  {
    path: "treinamentos",
    component: TreinamentosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecursosHumanosRoutingModule { } 