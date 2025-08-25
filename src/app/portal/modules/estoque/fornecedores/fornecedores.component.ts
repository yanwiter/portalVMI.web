import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { Fornecedor } from '../../../../shared/models/estoque.model';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';

@Component({
  selector: 'app-fornecedores',
  templateUrl: './fornecedores.component.html',
  styleUrl: './fornecedores.component.scss'
})
export class FornecedoresComponent implements OnInit {
  
  public fornecedores: Fornecedor[] = [];
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
  public fornecedorParaExcluir: any = null;
  
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly fornecedoresService = inject(GenericService<Fornecedor>);
  private readonly destroy = inject(DestroyRef);

  public fornecedorEditando: any = {
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    status: true
  };

  public filtros = {
    nome: '',
    cnpj: '',
    status: null
  };

  ngOnInit(): void {
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de um fornecedor
   */
  showDialog(fornecedor?: any) {
    this.isEditando = !!fornecedor;
    this.modalTitle = this.isEditando ? 'Editar Fornecedor' : 'Incluir Fornecedor';

    this.fornecedorEditando = this.isEditando
      ? {
        id: fornecedor.id,
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj,
        email: fornecedor.email,
        telefone: fornecedor.telefone,
        endereco: fornecedor.endereco,
        status: fornecedor.status
      }
      : {
        nome: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        status: true
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.fornecedorEditando = {
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      status: true
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar um fornecedor baseado no modo de edição
   */
  salvarFornecedor() {
    if (this.isEditando) {
      this.atualizarFornecedor();
    } else {
      this.criarFornecedor();
    }
  }

  /**
   * Cria um novo fornecedor
   */
  criarFornecedor() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const novoFornecedor = {
      nome: this.fornecedorEditando.nome,
      cnpj: this.fornecedorEditando.cnpj,
      email: this.fornecedorEditando.email,
      telefone: this.fornecedorEditando.telefone,
      endereco: this.fornecedorEditando.endereco,
      status: this.fornecedorEditando.status,
      idRespInclusao: getUserIdFromStorage()
    };

            this.fornecedoresService.post('estoqueRoutes', novoFornecedor, ['fornecedores'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Fornecedor criado com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza um fornecedor existente
   */
  atualizarFornecedor() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    this.spinnerService.show();

    const fornecedorAtualizado = {
      id: this.fornecedorEditando.id,
      nome: this.fornecedorEditando.nome,
      cnpj: this.fornecedorEditando.cnpj,
      email: this.fornecedorEditando.email,
      telefone: this.fornecedorEditando.telefone,
      endereco: this.fornecedorEditando.endereco,
      status: this.fornecedorEditando.status,
      idRespUltimaAlteracao: getUserIdFromStorage()
    };

    this.fornecedoresService.update('estoqueRoutes', this.fornecedorEditando.id, fornecedorAtualizado, ['fornecedores'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Fornecedor atualizado com sucesso!', 3000);
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

    if (!this.fornecedorEditando.nome) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o nome do fornecedor.', 3000);
      valido = false;
    }

    if (!this.fornecedorEditando.cnpj) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o CNPJ do fornecedor.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Inicia a edição de um fornecedor
   */
  iniciarEdicao(fornecedor: Fornecedor) {
    this.showDialog(fornecedor);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   */
  confirmarExclusao(fornecedor: any) {
    this.fornecedorParaExcluir = fornecedor;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão do fornecedor
   */
  confirmarExclusaoDialog() {
    if (this.fornecedorParaExcluir) {
      this.excluirFornecedor(this.fornecedorParaExcluir);
    }
    this.displayConfirmation = false;
    this.fornecedorParaExcluir = null;
  }

  /**
   * Cancela a exclusão do fornecedor
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.fornecedorParaExcluir = null;
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

    this.fornecedoresService.getAll('estoqueRoutes', ['fornecedores'], params)
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

    if (this.filtros.cnpj) {
      params.append('cnpj', this.filtros.cnpj);
    }

    if (this.filtros.status !== null) {
      params.append('status', String(this.filtros.status));
    }

    return params.toString();
  }

  /**
   * Exclui um fornecedor
   */
  public excluirFornecedor(fornecedor: any) {
    this.spinnerService.show();

    this.fornecedoresService.delete('estoqueRoutes', fornecedor.id, ['fornecedores'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Fornecedor excluído com sucesso.', 3000);
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
      this.fornecedores = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.fornecedores = [];
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
      cnpj: item.cnpj ?? 'N/A',
      email: item.email ?? 'N/A',
      telefone: item.telefone ?? 'N/A',
      endereco: item.endereco ?? 'N/A',
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
      cnpj: '',
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

    if (this.filtros.cnpj) {
      filters.push({ label: 'CNPJ', value: this.filtros.cnpj });
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

    this.fornecedoresService.exportarExcel('estoqueRoutes', ['fornecedores', 'exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de fornecedores");
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