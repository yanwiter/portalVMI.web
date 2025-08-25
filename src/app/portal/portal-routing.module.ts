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
        path: "contratos-aditivos",
        loadChildren: () => import("./modules/contratos/contratosAditivos.module").then((m) => m.ContratosAditivosModule),
      },
      {
        path: "planejamento",
        loadChildren: () => import("./modules/planejamento/planejamento.module").then((m) => m.PlanejamentoModule),
      },
      {
        path: "cadastro",
        loadChildren: () => import("./modules/cadastros/cadastros.module").then((m) => m.CadastrosModule),
      },
      {
        path: "configuracoes",
        loadChildren: () => import("./modules/configuracoes/configuracoes.module").then((m) => m.ConfiguracoesModule),
      },
      {
        path: "ponto",
        loadChildren: () => import("./modules/ponto/ponto.module").then((m) => m.PontoModule),
      },
      {
        path: "estoque",
        loadChildren: () => import("./modules/estoque/estoque.module").then((m) => m.EstoqueModule),
      },
      {
        path: "documentos",
        loadChildren: () => import("./modules/documentos/documentos.module").then((m) => m.DocumentosModule),
      },
      {
        path: "business-intelligence",
        loadChildren: () => import("./modules/business-intelligence/business-intelligence.module").then((m) => m.BusinessIntelligenceModule),
      },
      {
        path: "vendas",
        loadChildren: () => import("./modules/vendas/vendas.module").then((m) => m.VendasModule),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule { }
