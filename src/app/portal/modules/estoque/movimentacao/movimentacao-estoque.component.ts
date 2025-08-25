import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { MovimentacaoEstoque, FiltroMovimentacao, TipoMovimentacao } from '../../../../shared/models/estoque.model';
import { tipoMovimentacaoOptions, motivoMovimentacaoOptions } from '../../../../shared/models/options/estoque.options';

@Component({
  selector: 'app-movimentacao-estoque',
  templateUrl: './movimentacao-estoque.component.html',
  styleUrl: './movimentacao-estoque.component.scss'
})
export class MovimentacaoEstoqueComponent implements OnInit {
  
  public movimentacoes: MovimentacaoEstoque[] = [];
  public produtos: any[] = [];
  public customQueryParams?: string;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public tblLazyLoading: boolean = false;
  public isEditando: boolean = false;
  public modalTitle: string = '';
  public tipoMovimentacaoOptions = tipoMovimentacaoOptions;
  public motivoMovimentacaoOptions = motivoMovimentacaoOptions;
  public displayModal: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public movimentacaoParaExcluir: any = null;
  
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly movimentacaoService = inject(GenericService<MovimentacaoEstoque>);
  private readonly destroy = inject(DestroyRef);

  public movimentacaoEditando: any = {
    produtoId: null,
    tipoMovimentacao: null,
    quantidade: 0,
    motivo: '',
    documento: '',
    fornecedor: '',
    cliente: '',
    observacoes: ''
  };

  public filtros: FiltroMovimentacao = {
    produtoId: undefined,
    tipoMovimentacao: undefined,
    dataInicio: undefined,
    dataFim: undefined,
    fornecedor: '',
    cliente: ''
  };

  ngOnInit(): void {
    this.loadProdutos();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de uma movimentação
   */
  showDialog(movimentacao?: any) {
    this.isEditando = !!movimentacao;
    this.modalTitle = this.isEditando ? 'Editar Movimentação' : 'Nova Movimentação';

    this.movimentacaoEditando = this.isEditando
      ? {
        id: movimentacao.id,
        produtoId: movimentacao.produtoId,
        tipoMovimentacao: movimentacao.tipoMovimentacao,
        quantidade: movimentacao.quantidade,
        motivo: movimentacao.motivo,
        documento: movimentacao.documento,
        fornecedor: movimentacao.fornecedor,
        cliente: movimentacao.cliente,
        observacoes: movimentacao.observacoes
      }
      : {
        produtoId: null,
        tipoMovimentacao: null,
        quantidade: 0,
        motivo: '',
        documento: '',
        fornecedor: '',
        cliente: '',
        observacoes: ''
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.movimentacaoEditando = {
      produtoId: null,
      tipoMovimentacao: null,
      quantidade: 0,
      motivo: '',
      documento: '',
      fornecedor: '',
      cliente: '',
      observacoes: ''
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar uma movimentação baseado no modo de edição
   */
  salvarMovimentacao() {
    if (this.isEditando) {
      this.atualizarMovimentacao();
    } else {
      this.criarMovimentacao();
    }
  }

  /**
   * Cria uma nova movimentação
   */
  criarMovimentacao() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const novaMovimentacao = {
      produtoId: this.movimentacaoEditando.produtoId,
      tipoMovimentacao: this.movimentacaoEditando.tipoMovimentacao,
      quantidade: this.movimentacaoEditando.quantidade,
      motivo: this.movimentacaoEditando.motivo,
      documento: this.movimentacaoEditando.documento,
      fornecedor: this.movimentacaoEditando.fornecedor,
      cliente: this.movimentacaoEditando.cliente,
      observacoes: this.movimentacaoEditando.observacoes,
      idRespMovimentacao: getUserIdFromStorage()
    };

            this.movimentacaoService.post('estoqueRoutes', novaMovimentacao, ['movimentacao'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Movimentação registrada com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza uma movimentação existente
   */
  atualizarMovimentacao() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const movimentacaoAtualizada = {
      id: this.movimentacaoEditando.id,
      produtoId: this.movimentacaoEditando.produtoId,
      tipoMovimentacao: this.movimentacaoEditando.tipoMovimentacao,
      quantidade: this.movimentacaoEditando.quantidade,
      motivo: this.movimentacaoEditando.motivo,
      documento: this.movimentacaoEditando.documento,
      fornecedor: this.movimentacaoEditando.fornecedor,
      cliente: this.movimentacaoEditando.cliente,
      observacoes: this.movimentacaoEditando.observacoes,
      idRespMovimentacao: getUserIdFromStorage()
    };

    this.movimentacaoService.update('estoqueRoutes', this.movimentacaoEditando.id, movimentacaoAtualizada, ['movimentacao'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Movimentação atualizada com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Verifica se os campos obrigatórios foram preenchidos
   */
  verificarCamposPreenchidos(): boolean {
    let valido = true;

    if (!this.movimentacaoEditando.produtoId) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione um produto.', 3000);
      valido = false;
    }

    if (!this.movimentacaoEditando.tipoMovimentacao) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione o tipo de movimentação.', 3000);
      valido = false;
    }

    if (this.movimentacaoEditando.quantidade <= 0) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe uma quantidade válida.', 3000);
      valido = false;
    }

    if (!this.movimentacaoEditando.motivo) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione um motivo.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Inicia a edição de uma movimentação
   */
  iniciarEdicao(movimentacao: MovimentacaoEstoque) {
    this.showDialog(movimentacao);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   */
  confirmarExclusao(movimentacao: any) {
    this.movimentacaoParaExcluir = movimentacao;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão da movimentação
   */
  confirmarExclusaoDialog() {
    if (this.movimentacaoParaExcluir) {
      this.excluirMovimentacao(this.movimentacaoParaExcluir);
    }
    this.displayConfirmation = false;
    this.movimentacaoParaExcluir = null;
  }

  /**
   * Cancela a exclusão da movimentação
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.movimentacaoParaExcluir = null;
  }

  /**
   * Carrega os dados da tabela com paginação e filtros
   */
  public loadTableData(event: TableLazyLoadEvent) {
    this.spinnerService.show();
    this.tblLazyLoading = true;

    const pageNumber = Math.floor(event.first! / event.rows!) + 1;
    const pageSize = event.rows!;

    let params = `PageNumber=${pageNumber}&PageSize=${pageSize}`;

    const filters = this.buildFiltersParams();

    if (filters) {
      params += filters.startsWith('&') ? filters : `&${filters}`;
    }

    this.movimentacaoService.getAll('estoqueRoutes', ['movimentacao'], params)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
          this.tblLazyLoading = false;
        },
        error: (err) => {
          this.handleError(err);
          this.tblLazyLoading = false;
        },
        complete: () => this.handleComplete(),
      });
  }

  /**
   * Constrói os parâmetros de filtro para a requisição
   */
  public buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.produtoId) {
      params.append('produtoId', String(this.filtros.produtoId));
    }

    if (this.filtros.tipoMovimentacao) {
      params.append('tipoMovimentacao', this.filtros.tipoMovimentacao);
    }

    if (this.filtros.dataInicio) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataInicio);
      params.append('dataInicio', dataFormatada);
    }

    if (this.filtros.dataFim) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataFim);
      params.append('dataFim', dataFormatada);
    }

    if (this.filtros.fornecedor) {
      params.append('fornecedor', this.filtros.fornecedor);
    }

    if (this.filtros.cliente) {
      params.append('cliente', this.filtros.cliente);
    }

    return params.toString();
  }

  /**
   * Carrega a lista de produtos disponíveis
   */
  public loadProdutos() {
    this.movimentacaoService.getAll('estoqueRoutes', ['produtos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.items && Array.isArray(response.items)) {
            this.produtos = response.items.map(produto => ({
              label: `${produto.codigo} - ${produto.nome}`,
              value: produto.id
            }));
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Exclui uma movimentação
   */
  public excluirMovimentacao(movimentacao: any) {
    this.spinnerService.show();

    this.movimentacaoService.delete('estoqueRoutes', movimentacao.id, ['movimentacao'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Movimentação excluída com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          this.handleError(err);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Trata erros nas requisições
   */
  private handleError(err: any) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar registrar esta ação!',
      detail: err.error?.message || 'Erro desconhecido',
      life: 3000
    });
  }

  /**
   * Finaliza o carregamento após requisição
   */
  private handleComplete() {
    this.spinnerService.hide();
  }

  /**
   * Atualiza a paginação quando alterada
   */
  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

  /**
   * Processa a resposta da requisição de dados
   */
  private handleResponse(response: any) {
    if (response.items && Array.isArray(response.items)) {
      this.movimentacoes = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.movimentacoes = [];
      this.spinnerService.hide();
    }
    this.spinnerService.hide();
    this.totalRecords = response.totalCount ?? 0;
  }

  /**
   * Formata os dados para exibição na tabela
   */
  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      produtoId: item.produtoId,
      produto: item.produto,
      tipoMovimentacao: item.tipoMovimentacao,
      quantidade: item.quantidade,
      quantidadeAnterior: item.quantidadeAnterior,
      quantidadeAtual: item.quantidadeAtual,
      motivo: item.motivo,
      documento: item.documento,
      fornecedor: item.fornecedor,
      cliente: item.cliente,
      observacoes: item.observacoes,
      dataMovimentacao: item.dataMovimentacao ? new Date(item.dataMovimentacao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataMovimentacao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeRespMovimentacao: item.nomeRespMovimentacao ?? 'N/A'
    }));
  }

  /**
   * Retorna a severidade para exibição de status
   */
  public getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(status);
  }

  /**
   * Formata quantidade
   */
  public formatarQuantidade(quantidade: number, unidade: string): string {
    return `${quantidade} ${unidade}`;
  }

  /**
   * Aplica os filtros selecionados
   */
  public filtrar() {
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Limpa todos os filtros aplicados
   */
  public limparFiltros() {
    this.filtros = {
      produtoId: undefined,
      tipoMovimentacao: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      fornecedor: '',
      cliente: ''
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Retorna o texto do cabeçalho dos filtros baseado na quantidade ativa
   */
  public getFiltrosHeader(): string {
    const activeFiltersCount = this.getActiveFilters().length;

    if (activeFiltersCount === 0) {
      return 'Filtros ';
    } else if (activeFiltersCount === 1) {
      return 'Filtro Ativo: ';
    } else {
      return 'Filtros Ativos: ';
    }
  }

  /**
   * Retorna os filtros atualmente aplicados
   */
  public getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.produtoId) {
      const produtoSelecionado = this.produtos.find(option => option.value === this.filtros.produtoId);
      const valorExibicao = produtoSelecionado ? produtoSelecionado.label : this.filtros.produtoId;
      filters.push({ label: 'Produto', value: valorExibicao });
    }

    if (this.filtros.tipoMovimentacao) {
      filters.push({ label: 'Tipo', value: this.filtros.tipoMovimentacao });
    }

    if (this.filtros.dataInicio) {
      const data = new Date(this.filtros.dataInicio);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      filters.push({ label: 'Data Início', value: dataFormatada });
    }

    if (this.filtros.dataFim) {
      const data = new Date(this.filtros.dataFim);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      filters.push({ label: 'Data Fim', value: dataFormatada });
    }

    if (this.filtros.fornecedor) {
      filters.push({ label: 'Fornecedor', value: this.filtros.fornecedor });
    }

    if (this.filtros.cliente) {
      filters.push({ label: 'Cliente', value: this.filtros.cliente });
    }

    return filters;
  }

  /**
   * Exporta os dados para Excel
   */
  public exportarParaExcel() {
    this.spinnerService.show();

    const queryParams = this.buildFiltersParams();
    const args = queryParams.split('&');

    this.movimentacaoService.exportarExcel('estoqueRoutes', ['movimentacao', 'exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de movimentações");
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Dados exportados com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', 'Falha ao exportar dados para Excel: ' + (err.message ?? 'Erro desconhecido'), 3000);
          this.spinnerService.hide();
        }
      });
  }
} 