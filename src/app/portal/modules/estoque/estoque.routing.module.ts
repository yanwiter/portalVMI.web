import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// Componentes de Produtos
import { ProdutosEstoqueComponent } from "./produtos/produtos-estoque.component";
import { CategoriasComponent } from "./categorias/categorias.component";

// Componentes de Movimentação
import { MovimentacaoEstoqueComponent } from "./movimentacao/movimentacao-estoque.component";

// Componentes de Fornecedores
import { FornecedoresComponent } from "./fornecedores/fornecedores.component";

// Componentes de Pedidos de Compra
import { PedidosCompraComponent } from "./pedidos-compra/pedidos-compra.component";

const routes: Routes = [
  {
    path: "produtos",
    component: ProdutosEstoqueComponent,
  },
  {
    path: "categorias",
    component: CategoriasComponent,
  },
  {
    path: "movimentacao",
    component: MovimentacaoEstoqueComponent,
  },
  {
    path: "fornecedores",
    component: FornecedoresComponent,
  },
  {
    path: "pedidos-compra",
    component: PedidosCompraComponent,
  },
  {
    path: "",
    redirectTo: "produtos",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstoqueRoutingModule { } 