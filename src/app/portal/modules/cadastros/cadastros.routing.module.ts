import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClientesFornecedoresComponent } from "./clientes-fornecedores/clientes-fornecedores.component";
import { ProdutosComponent } from "./produtos/produtos.component";
import { FuncionariosComponent } from './funcionarios/funcionarios.component';

const routes: Routes = [
  {
    path: "produtos",
    component: ProdutosComponent,
  },
  {
    path: "clientes-fornecedores",
    component: ClientesFornecedoresComponent,
  },
  {
    path: "funcionarios",
    component: FuncionariosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastrosRoutingModule { }
