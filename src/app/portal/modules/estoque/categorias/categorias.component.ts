import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { Categoria } from '../../../../shared/models/estoque.model';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  
  public categorias: Categoria[] = [];
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
  public displayModal: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public categoriaParaExcluir: any = null;
  
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly categoriasService = inject(GenericService<Categoria>);
  private readonly destroy = inject(DestroyRef);

  public categoriaEditando: any = {
    nome: '',
    descricao: '',
    status: true
  };

  public filtros = {
    nome: '',
    status: null
  };

  ngOnInit(): void {
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de uma categoria
   */
  showDialog(categoria?: any) {
    this.isEditando = !!categoria;
    this.modalTitle = this.isEditando ? 'Editar Categoria' : 'Incluir Categoria';

    this.categoriaEditando = this.isEditando
      ? {
        id: categoria.id,
        nome: categoria.nome,
        descricao: categoria.descricao,
        status: categoria.status
      }
      : {
        nome: '',
        descricao: '',
        status: true
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.categoriaEditando = {
      nome: '',
      descricao: '',
      status: true
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar uma categoria baseado no modo de edição
   */
  salvarCategoria() {
    if (this.isEditando) {
      this.atualizarCategoria();
    } else {
      this.criarCategoria();
    }
  }

  /**
   * Cria uma nova categoria
   */
  criarCategoria() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const novaCategoria = {
      nome: this.categoriaEditando.nome,
      descricao: this.categoriaEditando.descricao,
      status: this.categoriaEditando.status,
      idRespInclusao: getUserIdFromStorage()
    };

            this.categoriasService.post('estoqueRoutes', novaCategoria, ['categorias'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Categoria criada com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza uma categoria existente
   */
  atualizarCategoria() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const categoriaAtualizada = {
      id: this.categoriaEditando.id,
      nome: this.categoriaEditando.nome,
      descricao: this.categoriaEditando.descricao,
      status: this.categoriaEditando.status,
      idRespUltimaAlteracao: getUserIdFromStorage()
    };

    this.categoriasService.update('estoqueRoutes', this.categoriaEditando.id, categoriaAtualizada, ['categorias'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Categoria atualizada com sucesso!', 3000);
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

    if (!this.categoriaEditando.nome) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o nome da categoria.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Inicia a edição de uma categoria
   */
  iniciarEdicao(categoria: Categoria) {
    this.showDialog(categoria);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   */
  confirmarExclusao(categoria: any) {
    this.categoriaParaExcluir = categoria;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão da categoria
   */
  confirmarExclusaoDialog() {
    if (this.categoriaParaExcluir) {
      this.excluirCategoria(this.categoriaParaExcluir);
    }
    this.displayConfirmation = false;
    this.categoriaParaExcluir = null;
  }

  /**
   * Cancela a exclusão da categoria
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.categoriaParaExcluir = null;
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

    this.categoriasService.getAll('estoqueRoutes', ['categorias'], params)
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

    if (this.filtros.nome) {
      params.append('nome', this.filtros.nome);
    }

    if (this.filtros.status !== null) {
      params.append('status', String(this.filtros.status));
    }

    return params.toString();
  }

  /**
   * Exclui uma categoria
   */
  public excluirCategoria(categoria: any) {
    this.spinnerService.show();

    this.categoriasService.delete('estoqueRoutes', categoria.id, ['categorias'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Categoria excluída com sucesso.', 3000);
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
      this.categorias = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.categorias = [];
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
      nome: item.nome ?? 'N/A',
      descricao: item.descricao ?? 'N/A',
      status: item.status,
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
      nome: '',
      status: null
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

    if (this.filtros.nome) {
      filters.push({ label: 'Nome', value: this.filtros.nome });
    }

    if (this.filtros.status !== null) {
      filters.push({ label: 'Status', value: this.filtros.status ? 'Ativo' : 'Inativo' });
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

    this.categoriasService.exportarExcel('estoqueRoutes', ['categorias', 'exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de categorias");
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