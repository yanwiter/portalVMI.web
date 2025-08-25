import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { PedidoCompra, FiltroPedidoCompra, StatusPedido } from '../../../../shared/models/estoque.model';
import { statusPedidoOptions } from '../../../../shared/models/options/estoque.options';

@Component({
  selector: 'app-pedidos-compra',
  templateUrl: './pedidos-compra.component.html',
  styleUrl: './pedidos-compra.component.scss'
})
export class PedidosCompraComponent implements OnInit {
  
  public pedidosCompra: PedidoCompra[] = [];
  public fornecedores: any[] = [];
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
  public statusPedidoOptions = statusPedidoOptions;
  public displayModal: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public pedidoParaExcluir: any = null;
  
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly pedidosService = inject(GenericService<PedidoCompra>);
  private readonly destroy = inject(DestroyRef);

  public pedidoEditando: any = {
    fornecedorId: null,
    dataPedido: new Date(),
    dataEntrega: null,
    status: StatusPedido.PENDENTE,
    observacoes: '',
    itens: []
  };

  public filtros: FiltroPedidoCompra = {
    numero: '',
    fornecedorId: undefined,
    status: undefined,
    dataInicio: undefined,
    dataFim: undefined
  };

  ngOnInit(): void {
    this.loadFornecedores();
    this.loadProdutos();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de um pedido
   */
  showDialog(pedido?: any) {
    this.isEditando = !!pedido;
    this.modalTitle = this.isEditando ? 'Editar Pedido de Compra' : 'Novo Pedido de Compra';

    this.pedidoEditando = this.isEditando
      ? {
        id: pedido.id,
        fornecedorId: pedido.fornecedorId,
        dataPedido: new Date(pedido.dataPedido),
        dataEntrega: pedido.dataEntrega ? new Date(pedido.dataEntrega) : null,
        status: pedido.status,
        observacoes: pedido.observacoes,
        itens: pedido.itens || []
      }
      : {
        fornecedorId: null,
        dataPedido: new Date(),
        dataEntrega: null,
        status: StatusPedido.PENDENTE,
        observacoes: '',
        itens: []
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.pedidoEditando = {
      fornecedorId: null,
      dataPedido: new Date(),
      dataEntrega: null,
      status: StatusPedido.PENDENTE,
      observacoes: '',
      itens: []
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar um pedido baseado no modo de edição
   */
  salvarPedido() {
    if (this.isEditando) {
      this.atualizarPedido();
    } else {
      this.criarPedido();
    }
  }

  /**
   * Cria um novo pedido
   */
  criarPedido() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const novoPedido = {
      fornecedorId: this.pedidoEditando.fornecedorId,
      dataPedido: this.pedidoEditando.dataPedido,
      dataEntrega: this.pedidoEditando.dataEntrega,
      status: this.pedidoEditando.status,
      observacoes: this.pedidoEditando.observacoes,
      itens: this.pedidoEditando.itens,
      idRespInclusao: getUserIdFromStorage()
    };

    this.pedidosService.post('estoqueRoutes', novoPedido, ['pedidos-compra'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Pedido criado com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza um pedido existente
   */
  atualizarPedido() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const pedidoAtualizado = {
      id: this.pedidoEditando.id,
      fornecedorId: this.pedidoEditando.fornecedorId,
      dataPedido: this.pedidoEditando.dataPedido,
      dataEntrega: this.pedidoEditando.dataEntrega,
      status: this.pedidoEditando.status,
      observacoes: this.pedidoEditando.observacoes,
      itens: this.pedidoEditando.itens,
      idRespUltimaAlteracao: getUserIdFromStorage()
    };

    this.pedidosService.update('estoqueRoutes', this.pedidoEditando.id, pedidoAtualizado, ['pedidos-compra'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Pedido atualizado com sucesso!', 3000);
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

    if (!this.pedidoEditando.fornecedorId) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione um fornecedor.', 3000);
      valido = false;
    }

    if (!this.pedidoEditando.dataPedido) {
      messageOfReturns(this.messageService, 'info', 'Atenção', 'Informe a data do pedido.', 3000);
      valido = false;
    }

    if (this.pedidoEditando.itens.length === 0) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Adicione pelo menos um item ao pedido.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Adiciona um item ao pedido
   */
  adicionarItem() {
    this.pedidoEditando.itens.push({
      produtoId: null,
      quantidade: 1,
      precoUnitario: 0,
      valorTotal: 0
    });
  }

  /**
   * Remove um item do pedido
   */
  removerItem(index: number) {
    this.pedidoEditando.itens.splice(index, 1);
  }

  /**
   * Calcula o valor total do item
   */
  calcularValorItem(item: any) {
    item.valorTotal = (item.quantidade || 0) * (item.precoUnitario || 0);
  }

  /**
   * Calcula o valor total do pedido
   */
  calcularValorTotal(): number {
    return this.pedidoEditando.itens.reduce((total: number, item: any) => {
      return total + (item.valorTotal || 0);
    }, 0);
  }

  /**
   * Inicia a edição de um pedido
   */
  iniciarEdicao(pedido: PedidoCompra) {
    this.showDialog(pedido);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   */
  confirmarExclusao(pedido: any) {
    this.pedidoParaExcluir = pedido;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão do pedido
   */
  confirmarExclusaoDialog() {
    if (this.pedidoParaExcluir) {
      this.excluirPedido(this.pedidoParaExcluir);
    }
    this.displayConfirmation = false;
    this.pedidoParaExcluir = null;
  }

  /**
   * Cancela a exclusão do pedido
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.pedidoParaExcluir = null;
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

    this.pedidosService.getAll('estoqueRoutes', ['pedidos-compra'], params)
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

    if (this.filtros.numero) {
      params.append('numero', this.filtros.numero);
    }

    if (this.filtros.fornecedorId) {
      params.append('fornecedorId', String(this.filtros.fornecedorId));
    }

    if (this.filtros.status) {
      params.append('status', this.filtros.status);
    }

    if (this.filtros.dataInicio) {
      params.append('dataInicio', this.filtros.dataInicio.toISOString());
    }

    if (this.filtros.dataFim) {
      params.append('dataFim', this.filtros.dataFim.toISOString());
    }

    return params.toString();
  }

  /**
   * Carrega a lista de fornecedores disponíveis
   */
  public loadFornecedores() {
    this.pedidosService.getAll('estoqueRoutes', ['fornecedores'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.items && Array.isArray(response.items)) {
            this.fornecedores = response.items.map(fornecedor => ({
              label: fornecedor.nome,
              value: fornecedor.id
            }));
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Carrega a lista de produtos disponíveis
   */
  public loadProdutos() {
    this.pedidosService.getAll('estoqueRoutes', ['produtos'])
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
   * Exclui um pedido
   */
  public excluirPedido(pedido: any) {
    this.spinnerService.show();

    this.pedidosService.delete('estoqueRoutes', pedido.id, ['pedidos-compra'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Pedido excluído com sucesso.', 3000);
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
      this.pedidosCompra = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.pedidosCompra = [];
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
      numero: item.numero ?? 'N/A',
      fornecedorId: item.fornecedorId,
      fornecedor: item.fornecedor,
      dataPedido: item.dataPedido ? new Date(item.dataPedido).toLocaleDateString('pt-BR') : 'N/A',
      dataEntrega: item.dataEntrega ? new Date(item.dataEntrega).toLocaleDateString('pt-BR') : 'N/A',
      status: item.status,
      valorTotal: item.valorTotal ?? 0,
      observacoes: item.observacoes ?? 'N/A',
      itens: item.itens || [],
      dataInclusao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      dataAlteracao: item.dataUltimaAlteracao ? new Date(item.dataUltimaAlteracao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataUltimaAlteracao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeCriadorUsuario: item.nomeRespInclusao ?? 'N/A',
      respUltimaModificacaoUsuario: item.nomeRespUltimaAlteracao ?? 'N/A'
    }));
  }

  /**
   * Retorna a severidade para exibição de status
   */
  public getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(status);
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
      numero: '',
      fornecedorId: undefined,
      status: undefined,
      dataInicio: undefined,
      dataFim: undefined
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

    if (this.filtros.numero) {
      filters.push({ label: 'Número', value: this.filtros.numero });
    }

    if (this.filtros.fornecedorId) {
      const fornecedorSelecionado = this.fornecedores.find(option => option.value === this.filtros.fornecedorId);
      const valorExibicao = fornecedorSelecionado ? fornecedorSelecionado.label : this.filtros.fornecedorId;
      filters.push({ label: 'Fornecedor', value: valorExibicao });
    }

    if (this.filtros.status) {
      filters.push({ label: 'Status', value: this.filtros.status });
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

    return filters;
  }

  /**
   * Exporta os dados para Excel
   */
  public exportarParaExcel() {
    this.spinnerService.show();

    const queryParams = this.buildFiltersParams();
    const args = queryParams.split('&');

    this.pedidosService.exportarExcel('estoqueRoutes', ['pedidos-compra', 'exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de pedidos de compra");
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