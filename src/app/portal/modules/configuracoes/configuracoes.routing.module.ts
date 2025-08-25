import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PerfisComponent } from "./perfis/perfis.component";
import { AcessosComponent } from "./acessos/acessos.component";
import { SessoesComponent } from "./sessoes/sessoes.component";
import { LogsSistemaComponent } from "./logs-sistema/logs-sistema.component";

const routes: Routes = [
  {
    path: "perfis",
    component: PerfisComponent,
  },
  {
    path: "acessos",
    component: AcessosComponent,
  },
  {
    path: "sessoes",
    component: SessoesComponent,
  },
  {
    path: "logs-sistema",
    component: LogsSistemaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracoesRoutingModule { }
