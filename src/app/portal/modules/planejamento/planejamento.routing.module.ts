import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HistoricoProdutosComponent } from "./historico-produtos/historico-produtos.component";
import { TesteProdutosComponent } from "./teste-produtos/teste-produtos.component";

const routes: Routes = [
  {
    path: "historico-produto",
    component: HistoricoProdutosComponent,
  },
  {
    path: "teste-produto",
    component: TesteProdutosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanejamentoRoutingModule { }
