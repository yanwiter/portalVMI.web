import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GestaoContratosComponent } from "./gestao-contratos/gestao-contratos.component";
import { GestaoAditivosComponent } from "./gestao-aditivos/gestao-aditivos.component";

const routes: Routes = [
  {
    path: "gestao-contratos",
    component: GestaoContratosComponent,
  },
  {
    path: "gestao-aditivos",
    component: GestaoAditivosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContratosAditivosRoutingModule { }
