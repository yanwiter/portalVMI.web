import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClientesFornecedoresComponent } from "./clientes-fornecedores/clientes-fornecedores.component";
import { FunilVendasComponent } from "./funil-vendas/funil-vendas.component";

const routes: Routes = [
  {
    path: "clientes-fornecedores",
    component: ClientesFornecedoresComponent,
  },
  {
    path: "funil-vendas",
    component: FunilVendasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialRoutingModule { }
