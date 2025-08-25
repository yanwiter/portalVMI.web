import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { RelatorioEstoque, StatusEstoque } from '../../../../shared/models/estoque.model';
import { RelatorioGeralResponse } from '../../../../shared/models/api/estoque-response.model';

@Component({
  selector: 'app-relatorios-estoque',
  templateUrl: './relatorios-estoque.component.html',
  styleUrl: './relatorios-estoque.component.scss'
})
export class RelatoriosEstoqueComponent implements OnInit {
  
  public relatorioEstoque: RelatorioEstoque[] = [];
  public produtosBaixoEstoque: any[] = [];
  public produtosCriticos: any[] = [];
  public produtosExcesso: any[] = [];
  public movimentacoesRecentes: any[] = [];
  public valorTotalEstoque: number = 0;
  public totalProdutos: number = 0;
  
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly relatoriosService = inject(GenericService<any>);
  private readonly destroy = inject(DestroyRef);

  ngOnInit(): void {
    //this.carregarRelatorios();
  }

  /**
   * Carrega todos os relatórios
   */
  private carregarRelatorios() {
    this.spinnerService.show();
    
    // Carrega relatório geral de estoque
    this.carregarRelatorioGeral();
    
    // Carrega produtos com estoque baixo
    this.carregarProdutosBaixoEstoque();
    
    // Carrega produtos críticos
    this.carregarProdutosCriticos();
    
    // Carrega produtos em excesso
    this.carregarProdutosExcesso();
    
    // Carrega movimentações recentes
    this.carregarMovimentacoesRecentes();
  }

  /**
   * Carrega o relatório geral de estoque
   */
  private carregarRelatorioGeral() {
    this.relatoriosService.getAll('estoqueRoutes', ['relatorios', 'geral'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const data = response.data[0];
            this.relatorioEstoque = data.items || [];
            this.valorTotalEstoque = data.valorTotalEstoque || 0;
            this.totalProdutos = data.totalProdutos || 0;
          }
        },
        error: (err) => {
          console.error('Erro ao carregar relatório geral:', err);
        }
      });
  }

  /**
   * Carrega produtos com estoque baixo
   */
  private carregarProdutosBaixoEstoque() {
    this.relatoriosService.getAll('estoqueRoutes', ['relatorios', 'baixo-estoque'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.produtosBaixoEstoque = response.data[0].items || [];
          }
        },
        error: (err) => {
          console.error('Erro ao carregar produtos com estoque baixo:', err);
        }
      });
  }

  /**
   * Carrega produtos críticos
   */
  private carregarProdutosCriticos() {
    this.relatoriosService.getAll('estoqueRoutes', ['relatorios', 'criticos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.produtosCriticos = response.data[0].items || [];
          }
        },
        error: (err) => {
          console.error('Erro ao carregar produtos críticos:', err);
        }
      });
  }

  /**
   * Carrega produtos em excesso
   */
  private carregarProdutosExcesso() {
    this.relatoriosService.getAll('estoqueRoutes', ['relatorios', 'excesso'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.produtosExcesso = response.data[0].items || [];
          }
        },
        error: (err) => {
          console.error('Erro ao carregar produtos em excesso:', err);
        }
      });
  }

  /**
   * Carrega movimentações recentes
   */
  private carregarMovimentacoesRecentes() {
    this.relatoriosService.getAll('estoqueRoutes', ['relatorios', 'movimentacoes-recentes'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.movimentacoesRecentes = response.data[0].items || [];
          }
        },
        error: (err) => {
          console.error('Erro ao carregar movimentações recentes:', err);
        }
      });
  }

  /**
   * Retorna a severidade baseada no status do estoque
   */
  public getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case StatusEstoque.NORMAL:
        return 'success';
      case StatusEstoque.BAIXO:
        return 'warning';
      case StatusEstoque.CRITICO:
        return 'danger';
      case StatusEstoque.EXCESSO:
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Formata valor monetário
   */
  public formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formata quantidade
   */
  public formatarQuantidade(quantidade: number, unidade: string): string {
    return `${quantidade} ${unidade}`;
  }

  /**
   * Exporta relatório de estoque geral
   */
  public exportarRelatorioGeral() {
    this.spinnerService.show();

    this.relatoriosService.exportarExcel('estoqueRoutes', ['relatorios', 'geral', 'exportar-excel'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório Geral de Estoque");
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Relatório exportado com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', 'Falha ao exportar relatório: ' + (err.message ?? 'Erro desconhecido'), 3000);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Exporta relatório de produtos com estoque baixo
   */
  public exportarProdutosBaixoEstoque() {
    this.spinnerService.show();

    this.relatoriosService.exportarExcel('estoqueRoutes', ['relatorios', 'baixo-estoque', 'exportar-excel'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Produtos com Estoque Baixo");
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Relatório exportado com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', 'Falha ao exportar relatório: ' + (err.message ?? 'Erro desconhecido'), 3000);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Exporta relatório de produtos críticos
   */
  public exportarProdutosCriticos() {
    this.spinnerService.show();

    this.relatoriosService.exportarExcel('estoqueRoutes', ['relatorios', 'criticos', 'exportar-excel'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Produtos Críticos");
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Relatório exportado com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', 'Falha ao exportar relatório: ' + (err.message ?? 'Erro desconhecido'), 3000);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Atualiza todos os relatórios
   */
  public atualizarRelatorios() {
    this.carregarRelatorios();
    messageOfReturns(this.messageService, 'success', 'Sucesso', 'Relatórios atualizados com sucesso!', 3000);
  }
} 