import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { ClientesFornecedoresComponent } from './clientes-fornecedores/clientes-fornecedores.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { CadastrosRoutingModule } from './cadastros.routing.module';
import { FuncionariosComponent } from './funcionarios/funcionarios.component';
@NgModule({
  declarations: [
    ProdutosComponent,
    ClientesFornecedoresComponent,
    FuncionariosComponent,
  ],
  imports: [
    CadastrosRoutingModule, 
    CommonModule, 
    FormsModule, 
    PrimeNGModule, 
    SharedModule
  ]
})
export class CadastrosModule { }
