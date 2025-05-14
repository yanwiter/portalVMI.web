import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MedicoesComponent } from "./medicoes/medicoes.component";

const routes: Routes = [
  {
    path: "medicoes",
    component: MedicoesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatoriosRoutingModule { }
