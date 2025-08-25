import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { SpinnerService } from '../../../../../shared/services/spinner/spinner.service';
import { StatusEstoque } from '../../../../../shared/models/estoque.model';
import { GenericService } from '../../../../../shared/services/generic/generic.service';
import { messageOfReturns } from '../../../../../shared/util/util';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-dashboard-estoque',
  templateUrl: './dashboard-estoque.component.html',
  styleUrl: './dashboard-estoque.component.scss'
})
export class DashboardEstoqueComponent implements OnInit {
  
  public produtos: any[] = [];
  public movimentacoes: any[] = [];
  public pedidosCompra: any[] = [];
  public fornecedores: any[] = [];
  
  // Métricas do dashboard
  public totalProdutos: number = 0;
  public produtosBaixoEstoque: number = 0;
  public produtosCriticos: number = 0;
  public valorTotalEstoque: number = 0;
  public movimentacoesHoje: number = 0;
  public pedidosPendentes: number = 0;
  
  // Dados para gráficos
  public dadosGraficoEstoque: any;
  public dadosGraficoMovimentacao: any;
  public dadosGraficoCategorias: any;
  
  private readonly spinnerService = inject(SpinnerService);
  private readonly messageService = inject(MessageService);
  private readonly estoqueService = inject(GenericService<any>);
  private readonly destroy = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    //this.carregarDashboard();
  }

  /**
   * Carrega todos os dados do dashboard
   */
  private carregarDashboard() {
    //this.spinnerService.show();
    
    // Carrega métricas principais
    this.carregarMetricas();
    
    // Carrega dados para gráficos
    this.carregarDadosGraficos();
    
    // Carrega listas recentes
    this.carregarListasRecentes();
  }

  /**
   * Carrega as métricas principais do dashboard
   */
  private carregarMetricas() {
    this.estoqueService.getAll('estoqueRoutes', ['dashboard', 'metricas'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const metricas = response.data[0];
            this.totalProdutos = metricas.totalProdutos || 0;
            this.produtosBaixoEstoque = metricas.produtosBaixoEstoque || 0;
            this.produtosCriticos = metricas.produtosCriticos || 0;
            this.valorTotalEstoque = metricas.valorTotalEstoque || 0;
            this.movimentacoesHoje = metricas.movimentacoesHoje || 0;
            this.pedidosPendentes = metricas.pedidosPendentes || 0;
          }
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', 'Erro ao carregar métricas do dashboard', 3000);
        }
      });
  }

  /**
   * Carrega dados para os gráficos
   */
  private carregarDadosGraficos() {
    // Gráfico de status do estoque
    this.carregarGraficoEstoque();
    
    // Gráfico de movimentação
    this.carregarGraficoMovimentacao();
    
    // Gráfico de categorias
    this.carregarGraficoCategorias();
  }

  /**
   * Carrega dados para o gráfico de status do estoque
   */
  private carregarGraficoEstoque() {
    this.estoqueService.getAll('estoqueRoutes', ['dashboard', 'grafico-estoque'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const dados = response.data[0];
            this.dadosGraficoEstoque = {
              labels: ['Normal', 'Baixo', 'Crítico', 'Excesso'],
              datasets: [
                {
                  data: [
                    dados.normal || 0,
                    dados.baixo || 0,
                    dados.critico || 0,
                    dados.excesso || 0
                  ],
                  backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#2196F3'],
                  borderWidth: 0
                }
              ]
            };
          }
        },
        error: (err) => {
          console.error('Erro ao carregar gráfico de estoque:', err);
        }
      });
  }

  /**
   * Carrega dados para o gráfico de movimentação
   */
  private carregarGraficoMovimentacao() {
    this.estoqueService.getAll('estoqueRoutes', ['dashboard', 'grafico-movimentacao'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const dados = response.data[0];
            this.dadosGraficoMovimentacao = {
              labels: dados.labels || [],
              datasets: [
                {
                  label: 'Entradas',
                  data: dados.entradas || [],
                  borderColor: '#4CAF50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Saídas',
                  data: dados.saidas || [],
                  borderColor: '#F44336',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  tension: 0.4
                }
              ]
            };
          }
        },
        error: (err) => {
          console.error('Erro ao carregar gráfico de movimentação:', err);
        }
      });
  }

  /**
   * Carrega dados para o gráfico de categorias
   */
  private carregarGraficoCategorias() {
    this.estoqueService.getAll('estoqueRoutes', ['dashboard', 'grafico-categorias'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const dados = response.data[0];
            this.dadosGraficoCategorias = {
              labels: dados.labels || [],
              datasets: [
                {
                  data: dados.data || [],
                  backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                  ],
                  borderWidth: 0
                }
              ]
            };
          }
        },
        error: (err) => {
          console.error('Erro ao carregar gráfico de categorias:', err);
        }
      });
  }

  /**
   * Carrega listas de dados recentes
   */
  private carregarListasRecentes() {
    // Produtos com estoque baixo
    this.carregarProdutosBaixoEstoque();
    
    // Últimas movimentações
    this.carregarUltimasMovimentacoes();
    
    // Pedidos de compra pendentes
    this.carregarPedidosPendentes();
  }

  /**
   * Carrega produtos com estoque baixo
   */
  private carregarProdutosBaixoEstoque() {
    this.estoqueService.getAll('estoqueRoutes', ['produtos', 'baixo-estoque'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.produtos = response.items || [];
        },
        error: (err) => {
          console.error('Erro ao carregar produtos com estoque baixo:', err);
        }
      });
  }

  /**
   * Carrega últimas movimentações
   */
  private carregarUltimasMovimentacoes() {
    this.estoqueService.getAll('estoqueRoutes', ['movimentacao', 'recentes'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.movimentacoes = response.items || [];
        },
        error: (err) => {
          console.error('Erro ao carregar movimentações recentes:', err);
        }
      });
  }

  /**
   * Carrega pedidos de compra pendentes
   */
  private carregarPedidosPendentes() {
    this.estoqueService.getAll('estoqueRoutes', ['pedidos-compra', 'pendentes'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.pedidosCompra = response.items || [];
        },
        error: (err) => {
          console.error('Erro ao carregar pedidos pendentes:', err);
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
   * Atualiza o dashboard
   */
  public atualizarDashboard() {
    this.carregarDashboard();
    messageOfReturns(this.messageService, 'success', 'Sucesso', 'Dashboard atualizado com sucesso!', 3000);
  }

  // Getter para verificar se é tema escuro
  get isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }
} 