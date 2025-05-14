import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PerfisComponent } from "./perfis/perfis.component";
import { AcessosComponent } from "./acessos/acessos.component";

const routes: Routes = [
  {
    path: "perfis",
    component: PerfisComponent,
  },
  {
    path: "acessos",
    component: AcessosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracoesRoutingModule { }
