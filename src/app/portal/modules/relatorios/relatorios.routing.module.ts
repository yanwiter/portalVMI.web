import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MedicoesComponent } from "./medicoes/medicoes.component";
import { RelatoriosEstoqueComponent } from "./estoque/relatorios-estoque.component";

const routes: Routes = [
  {
    path: "medicoes",
    component: MedicoesComponent,
  },
  {
    path: "estoque",
    component: RelatoriosEstoqueComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatoriosRoutingModule { }
