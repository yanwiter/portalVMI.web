import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CotacoesComponent } from "./cotacoes/cotacoes.component";
import { OrdensCompraComponent } from "./ordens-compra/ordens-compra.component";
import { AprovacoesComponent } from "./aprovacoes/aprovacoes.component";
import { FornecedoresComponent } from "./fornecedores/fornecedores.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "cotacoes",
    pathMatch: "full"
  },
  {
    path: "cotacoes",
    component: CotacoesComponent,
  },
  {
    path: "ordens-compra",
    component: OrdensCompraComponent,
  },
  {
    path: "aprovacoes",
    component: AprovacoesComponent,
  },
  {
    path: "fornecedores",
    component: FornecedoresComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComprasRoutingModule { } 