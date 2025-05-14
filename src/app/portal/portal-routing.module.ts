import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PortalComponent } from "./portal.component";

const routes: Routes = [
  {
    path: "",
    component: PortalComponent,
    children: [
      {
        path: "",
        loadChildren: () => import("./modules/inicio/inicio.module").then((m) => m.InicioModule),
      },
      {
        path: "inicio",
        loadChildren: () => import("./modules/inicio/inicio.module").then((m) => m.InicioModule),
      },
      {
        path: "relatorios",
        loadChildren: () => import("./modules/relatorios/relatorios.module").then((m) => m.RelatoriosModule),
      },
      {
        path: "financeiro",
        loadChildren: () => import("./modules/financeiro/financeiro.module").then((m) => m.FinanceiroModule),
      },
      {
        path: "comercial",
        loadChildren: () => import("./modules/comercial/comercial.module").then((m) => m.ComercialModule),
      },
      {
        path: "planejamento",
        loadChildren: () => import("./modules/planejamento/planejamento.module").then((m) => m.PlanejamentoModule),
      },
      {
        path: "configuracoes",
        loadChildren: () => import("./modules/configuracoes/configuracoes.module").then((m) => m.ConfiguracoesModule),
      },

    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule { }
