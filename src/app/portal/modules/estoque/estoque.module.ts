import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNGModule } from '../../../shared/modules/primeNG.module';
import { SharedModule } from '../../../shared/modules/shared.module';
import { EstoqueRoutingModule } from './estoque.routing.module';

// Componentes de Produtos
import { ProdutosEstoqueComponent } from './produtos/produtos-estoque.component';
import { CategoriasComponent } from './categorias/categorias.component';

// Componentes de Movimentação
import { MovimentacaoEstoqueComponent } from './movimentacao/movimentacao-estoque.component';

// Componentes de Fornecedores
import { FornecedoresComponent } from './fornecedores/fornecedores.component';

// Componentes de Pedidos de Compra
import { PedidosCompraComponent } from './pedidos-compra/pedidos-compra.component';

@NgModule({
  declarations: [
    // Produtos
    ProdutosEstoqueComponent,
    CategoriasComponent,
    
    // Movimentação
    MovimentacaoEstoqueComponent,
    
    // Fornecedores
    FornecedoresComponent,
    
    // Pedidos de Compra
    PedidosCompraComponent
  ],
  imports: [
    EstoqueRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNGModule,
    SharedModule
  ]
})
export class EstoqueModule { } 