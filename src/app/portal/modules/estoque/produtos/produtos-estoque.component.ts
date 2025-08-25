import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { Produto, FiltroEstoque, StatusEstoque } from '../../../../shared/models/estoque.model';
import { unidadeMedidaOptions } from '../../../../shared/models/options/estoque.options';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';

@Component({
  selector: 'app-produtos-estoque',
  templateUrl: './produtos-estoque.component.html',
  styleUrl: './produtos-estoque.component.scss'
})
export class ProdutosEstoqueComponent implements OnInit {
  
  public produtos: Produto[] = [];
  public categorias: any[] = [];
  public customQueryParams?: string;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public tblLazyLoading: boolean = false;
  public isEditando: boolean = false;
  public modalTitle: string = '';
  public statusOptions = inativoAtivoOptions;
  public unidadeMedidaOptions = unidadeMedidaOptions;
  public displayModal: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public produtoParaExcluir: any = null;
  
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly produtosService = inject(GenericService<Produto>);
  private readonly destroy = inject(DestroyRef);

  public produtoEditando: any = {
    codigo: '',
    nome: '',
    descricao: '',
    categoria: '',
    unidadeMedida: '',
    precoUnitario: 0,
    estoqueMinimo: 0,
    estoqueMaximo: 0,
    estoqueAtual: 0,
    status: true
  };

  public filtros: FiltroEstoque = {
    codigo: '',
    nome: '',
    categoria: undefined,
    status: undefined,
    estoqueMinimo: false,
    estoqueMaximo: false
  };

  ngOnInit(): void {
    this.loadCategorias();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de um produto
   */
  showDialog(produto?: any) {
    this.isEditando = !!produto;
    this.modalTitle = this.isEditando ? 'Editar Produto' : 'Incluir Produto';

    this.produtoEditando = this.isEditando
      ? {
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        unidadeMedida: produto.unidadeMedida,
        precoUnitario: produto.precoUnitario,
        estoqueMinimo: produto.estoqueMinimo,
        estoqueMaximo: produto.estoqueMaximo,
        estoqueAtual: produto.estoqueAtual,
        status: produto.status
      }
      : {
        codigo: '',
        nome: '',
        descricao: '',
        categoria: '',
        unidadeMedida: '',
        precoUnitario: 0,
        estoqueMinimo: 0,
        estoqueMaximo: 0,
        estoqueAtual: 0,
        status: true
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.produtoEditando = {
      codigo: '',
      nome: '',
      descricao: '',
      categoria: '',
      unidadeMedida: '',
      precoUnitario: 0,
      estoqueMinimo: 0,
      estoqueMaximo: 0,
      estoqueAtual: 0,
      status: true
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar um produto baseado no modo de edição
   */
  salvarProduto() {
    if (this.isEditando) {
      this.atualizarProduto();
    } else {
      this.criarProduto();
    }
  }

  /**
   * Cria um novo produto
   */
  criarProduto() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const novoProduto = {
      codigo: this.produtoEditando.codigo,
      nome: this.produtoEditando.nome,
      descricao: this.produtoEditando.descricao,
      categoria: this.produtoEditando.categoria,
      unidadeMedida: this.produtoEditando.unidadeMedida,
      precoUnitario: this.produtoEditando.precoUnitario,
      estoqueMinimo: this.produtoEditando.estoqueMinimo,
      estoqueMaximo: this.produtoEditando.estoqueMaximo,
      estoqueAtual: this.produtoEditando.estoqueAtual,
      status: this.produtoEditando.status,
      idRespInclusao: getUserIdFromStorage()
    };

            this.produtosService.post('estoqueRoutes', novoProduto, ['produtos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Produto criado com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza um produto existente
   */
  atualizarProduto() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const produtoAtualizado = {
      id: this.produtoEditando.id,
      codigo: this.produtoEditando.codigo,
      nome: this.produtoEditando.nome,
      descricao: this.produtoEditando.descricao,
      categoria: this.produtoEditando.categoria,
      unidadeMedida: this.produtoEditando.unidadeMedida,
      precoUnitario: this.produtoEditando.precoUnitario,
      estoqueMinimo: this.produtoEditando.estoqueMinimo,
      estoqueMaximo: this.produtoEditando.estoqueMaximo,
      estoqueAtual: this.produtoEditando.estoqueAtual,
      status: this.produtoEditando.status,
      idRespUltimaAlteracao: getUserIdFromStorage()
    };

    this.produtosService.update('estoqueRoutes', this.produtoEditando.id, produtoAtualizado, ['produtos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Produto atualizado com sucesso!', 3000);
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

    if (!this.produtoEditando.codigo) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o código do produto.', 3000);
      valido = false;
    }

    if (!this.produtoEditando.nome) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o nome do produto.', 3000);
      valido = false;
    }

    if (!this.produtoEditando.categoria) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione uma categoria.', 3000);
      valido = false;
    }

    if (!this.produtoEditando.unidadeMedida) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione uma unidade de medida.', 3000);
      valido = false;
    }

    if (this.produtoEditando.precoUnitario <= 0) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe um preço unitário válido.', 3000);
      valido = false;
    }

    if (this.produtoEditando.estoqueMinimo < 0) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'O estoque mínimo não pode ser negativo.', 3000);
      valido = false;
    }

    if (this.produtoEditando.estoqueMaximo <= this.produtoEditando.estoqueMinimo) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'O estoque máximo deve ser maior que o mínimo.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Inicia a edição de um produto
   */
  iniciarEdicao(produto: Produto) {
    this.showDialog(produto);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   */
  confirmarExclusao(produto: any) {
    this.produtoParaExcluir = produto;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão do produto
   */
  confirmarExclusaoDialog() {
    if (this.produtoParaExcluir) {
      this.excluirProduto(this.produtoParaExcluir);
    }
    this.displayConfirmation = false;
    this.produtoParaExcluir = null;
  }

  /**
   * Cancela a exclusão do produto
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.produtoParaExcluir = null;
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

    this.produtosService.getAll('estoqueRoutes', ['produtos'], params)
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

    if (this.filtros.codigo) {
      params.append('codigo', this.filtros.codigo);
    }

    if (this.filtros.nome) {
      params.append('nome', this.filtros.nome);
    }

    if (this.filtros.categoria) {
      params.append('categoria', String(this.filtros.categoria));
    }

    if (this.filtros.status !== undefined) {
      params.append('status', String(this.filtros.status));
    }

    if (this.filtros.estoqueMinimo) {
      params.append('estoqueMinimo', 'true');
    }

    if (this.filtros.estoqueMaximo) {
      params.append('estoqueMaximo', 'true');
    }

    return params.toString();
  }

  /**
   * Carrega a lista de categorias disponíveis
   */
  public loadCategorias() {
    this.produtosService.getAll('estoqueRoutes', ['categorias'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.items && Array.isArray(response.items)) {
            this.categorias = response.items.map(categoria => ({
              label: categoria.nome,
              value: categoria.id
            }));
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Exclui um produto
   */
  public excluirProduto(produto: any) {
    this.spinnerService.show();

    this.produtosService.delete('estoqueRoutes', produto.id, ['produtos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Produto excluído com sucesso.', 3000);
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
      this.produtos = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.produtos = [];
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
      codigo: item.codigo ?? 'N/A',
      nome: item.nome ?? 'N/A',
      descricao: item.descricao ?? 'N/A',
      categoria: item.categoria ?? 'N/A',
      unidadeMedida: item.unidadeMedida ?? 'N/A',
      precoUnitario: item.precoUnitario ?? 0,
      estoqueMinimo: item.estoqueMinimo ?? 0,
      estoqueMaximo: item.estoqueMaximo ?? 0,
      estoqueAtual: item.estoqueAtual ?? 0,
      status: item.status,
      statusEstoque: this.getStatusEstoque(item.estoqueAtual, item.estoqueMinimo, item.estoqueMaximo),
      valorTotalEstoque: (item.estoqueAtual || 0) * (item.precoUnitario || 0),
      dataInclusao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      dataAlteracao: item.dataUltimaAlteracao ? new Date(item.dataUltimaAlteracao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataUltimaAlteracao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeCriadorUsuario: item.nomeRespInclusao ?? 'N/A',
      respUltimaModificacaoUsuario: item.nomeRespUltimaAlteracao ?? 'N/A'
    }));
  }

  /**
   * Calcula o status do estoque baseado nas quantidades
   */
  private getStatusEstoque(estoqueAtual: number, estoqueMinimo: number, estoqueMaximo: number): StatusEstoque {
    if (estoqueAtual <= estoqueMinimo) {
      return StatusEstoque.CRITICO;
    } else if (estoqueAtual <= estoqueMinimo * 1.5) {
      return StatusEstoque.BAIXO;
    } else if (estoqueAtual >= estoqueMaximo) {
      return StatusEstoque.EXCESSO;
    } else {
      return StatusEstoque.NORMAL;
    }
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
      codigo: '',
      nome: '',
      categoria: undefined,
      status: undefined,
      estoqueMinimo: false,
      estoqueMaximo: false
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

    if (this.filtros.codigo) {
      filters.push({ label: 'Código', value: this.filtros.codigo });
    }

    if (this.filtros.nome) {
      filters.push({ label: 'Nome', value: this.filtros.nome });
    }

    if (this.filtros.categoria) {
      const categoriaSelecionada = this.categorias.find(option => option.value === this.filtros.categoria);
      const valorExibicao = categoriaSelecionada ? categoriaSelecionada.label : this.filtros.categoria;
      filters.push({ label: 'Categoria', value: valorExibicao });
    }

    if (this.filtros.status !== undefined) {
      filters.push({ label: 'Status', value: this.filtros.status ? 'Ativo' : 'Inativo' });
    }

    if (this.filtros.estoqueMinimo) {
      filters.push({ label: 'Estoque Mínimo', value: 'Sim' });
    }

    if (this.filtros.estoqueMaximo) {
      filters.push({ label: 'Estoque Máximo', value: 'Sim' });
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

    this.produtosService.exportarExcel('estoqueRoutes', ['produtos', 'exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de produtos");
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