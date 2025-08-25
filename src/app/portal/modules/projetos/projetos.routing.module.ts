import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanejamentoProjetosComponent } from "./planejamento-projetos/planejamento-projetos.component";
import { TarefasComponent } from "./tarefas/tarefas.component";
import { RecursosComponent } from "./recursos/recursos.component";
import { CronogramasComponent } from "./cronogramas/cronogramas.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "planejamento",
    pathMatch: "full"
  },
  {
    path: "planejamento",
    component: PlanejamentoProjetosComponent,
  },
  {
    path: "tarefas",
    component: TarefasComponent,
  },
  {
    path: "recursos",
    component: RecursosComponent,
  },
  {
    path: "cronogramas",
    component: CronogramasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjetosRoutingModule { } 