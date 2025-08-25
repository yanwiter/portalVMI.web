import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss'
})
export class ProdutosComponent {
  
  public acessos: UsuarioModel[] = [];
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
  public perfisOptions: any[] = [];
  public mostrarSenha: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public acessoParaExcluir: any = null;
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);

  public acessoEditando: any = {
    nome: '',
    email: '',
    idPerfil: null,
    status: 'Ativo'
  };

  public filtros = {
    nome: '',
    status: null,
    email: '',
    perfil: null,
    dataCriacao: null
  };

  /**
   * Inicializa o componente carregando os perfis e dados da tabela
   */
  ngOnInit(): void {
    this.loadPerfis();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de um acesso
   * @param acesso Dados do acesso a ser editado (opcional)
   */
  showDialog(acesso?: any) {
    this.isEditando = !!acesso;
    this.modalTitle = this.isEditando ? 'Editar Produto' : 'Incluir Produto';

    this.acessoEditando = this.isEditando
      ? {
        id: acesso.id,
        nome: acesso.nome,
        email: acesso.email,
        idPerfil: acesso.perfil?.id ?? acesso.idPerfil,
        status: acesso.statusAcesso,
        justificativaInativacao: acesso.justificativaInativacao
      }
      : {
        nome: '',
        email: '',
        senha: '@PortalVMI' + new Date().getFullYear(),
        idPerfil: null,
        status: true
      };

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.acessoEditando = {
      nome: '',
      email: '',
      senha: '',
      idPerfil: null,
      status: true
    };
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar um acesso baseado no modo de edição
   */
  salvarAcesso() {
    if (this.isEditando) {
      this.atualizarAcesso();
    } else {
      this.criarAcesso();
    }
  }

  /**
   * Cria um novo acesso de usuário
   */
  criarAcesso() {

    if (!this.verificarCamposPreenchidos(false)) {
      return;
    }

    this.spinnerService.show();

    const novoAcesso = {
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      senha: this.acessoEditando.senha,
      idRespInclusao: getUserIdFromStorage(),
      idPerfil: this.acessoEditando.perfilId,
      statusUsuario: this.acessoEditando.status
    };

    this.acessosService.post('usuarioRoutes', novoAcesso)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Acesso criado com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza um acesso existente
   */
  atualizarAcesso() {

    if (!this.verificarCamposPreenchidos(false)) {
      return;
    }

    this.spinnerService.show();

    const acessoAtualizado: any = {
      id: this.acessoEditando.id,
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      idPerfil: this.acessoEditando.perfilId,
      statusUsuario: this.acessoEditando.status,
      idRespUltimaAlteracao: getUserIdFromStorage(),
      justificativaInativacao: this.acessoEditando.justificativaInativacao
    };

    if (this.acessoEditando.status === false) {
      acessoAtualizado.idRespInativacao = getUserIdFromStorage();
    }

    this.acessosService.update('usuarioRoutes', this.acessoEditando.id, acessoAtualizado)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Acesso atualizado com sucesso!', 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Verifica se os campos obrigatórios foram preenchidos
   * @method
   * @public
   * @returns {boolean} True se os campos obrigatórios foram preenchidos, false caso contrário  */
  verificarCamposPreenchidos(editando: boolean) {
    let valido = true;

    if (this.acessoEditando.nome === '') {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o nome do usuário.', 3000);
      valido = false;
    }

    if (this.acessoEditando.email === '') {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe o email do usuário.', 3000);
      valido = false;
    }

    if (!editando) {
      if (this.acessoEditando.senha === '') {
        messageOfReturns(this.messageService, 'warning', 'Atenção', 'Informe a senha do usuário.', 3000);
        valido = false;
      }
    }

    if (this.acessoEditando.perfilId === null) {
      messageOfReturns(this.messageService, 'warning', 'Atenção', 'Selecione um perfil para o usuário.', 3000);
      valido = false;
    }

    return valido;
  }

  /**
   * Inicia a edição de um acesso
   * @param acesso Dados do acesso a ser editado
   * @param index Índice do acesso na tabela
   */
  iniciarEdicao(acesso: UsuarioModel, index: number) {
    this.showDialog(acesso);
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   * @param acesso Dados do acesso a ser excluído
   */
  confirmarExclusao(acesso: any) {
    this.acessoParaExcluir = acesso;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão do acesso
   */
  confirmarInativacaoDialog() {
    if (this.acessoParaExcluir) {
      this.excluirAcesso(this.acessoParaExcluir);
    }
    this.displayConfirmation = false;
    this.acessoParaExcluir = null;
  }

  /**
   * Cancela a exclusão do acesso
   */
  cancelarInativacao() {
    this.displayConfirmation = false;
    this.acessoParaExcluir = null;
  }

  /**
   * Carrega os dados da tabela com paginação e filtros
   * @param event Evento de lazy loading da tabela
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

    this.acessosService.getAll('usuarioRoutes', undefined, params)
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
   * @returns String com os parâmetros de filtro formatados
   */
  public buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.nome) {
      params.append('nome', this.filtros.nome);
    }

    if (this.filtros.email) {
      params.append('email', this.filtros.email);
    }

    if (this.filtros.perfil) {
      params.append('idPerfil', String(this.filtros.perfil));
    }

    if (this.filtros.dataCriacao) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataCriacao);
      params.append('dataCriacao', dataFormatada);
    }

    if (this.filtros.status !== null) {
      params.append('statusAcesso', String(this.filtros.status));
    }
    return params.toString();
  }

  /**
   * Carrega a lista de perfis disponíveis
   */
  public loadPerfis() {
    this.acessosService.getAll('perfilRoutes')
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.items && Array.isArray(response.items)) {
            this.perfisOptions = response.items.map(perfil => ({
              label: perfil.nome,
              value: perfil.id
            }));
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Exclui um acesso de usuário
   * @param acesso Dados do acesso a ser excluído
   */
  public excluirAcesso(acesso: any) {
    this.spinnerService.show();

    this.acessosService.delete('usuarioRoutes', acesso.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Acesso excluído com sucesso.', 3000);
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
   * @param err Objeto de erro retornado pela requisição
   */
  private handleError(err: Result<UsuarioModel>) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar registrar esta ação!',
      detail: err.error?.message,
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
   * @param event Evento de mudança de página
   */
  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

  /**
   * Processa a resposta da requisição de dados
   * @param response Resposta da API
   */
  private handleResponse(response: any) {
    if (response.items && Array.isArray(response.items)) {
      this.acessos = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.acessos = [];
      this.spinnerService.hide();
    }
    this.spinnerService.hide();
    this.totalRecords = response.totalCount ?? 0;
  }

  /**
   * Formata os dados para exibição na tabela
   * @param data Dados brutos da API
   * @returns Dados formatados para exibição
   */
  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      nome: item.nome ?? 'N/A',
      email: item.email ?? 'N/A',
      perfis: item.perfil ? item.perfil.nome : 'N/A',
      statusAcesso: item.statusUsuario,
      status: item.statusUsuario,
      dataCriacao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      dataAlteracao: item.dataUltimaAlteracao ? new Date(item.dataUltimaAlteracao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataUltimaAlteracao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeCriadorUsuario: item.nomeRespInclusao ?? 'N/A',
      respUltimaModificacaoUsuario: item.nomeRespUltimaAlteracao ?? 'N/A',
      justificativaInativacao: item.justificativaInativacao ?? 'N/A',
      perfilNome: item.perfilNome ?? 'N/A',
    }));
  }

  /**
   * Retorna a severidade para exibição de status
   * @param price Status do item
   * @returns Classe de severidade correspondente
   */
  public getSeverity(price: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(price);
  }

  /**
   * Aplica os filtros selecionados
   */
  public filtrar() {
    let queryParams = [];

    if (this.filtros.nome) {
      queryParams.push(`Nome=${this.filtros.nome}`);
    }

    if (this.filtros.email) {
      queryParams.push(`Email=${this.filtros.email}`);
    }

    if (this.filtros.perfil) {
      queryParams.push(`idPerfil=${this.filtros.perfil}`);
    }

    if (this.filtros.status !== null) {
      queryParams.push(`StatusPerfil=${this.filtros.status}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Limpa todos os filtros aplicados
   */
  public limparFiltros() {
    this.filtros = {
      nome: '',
      status: null,
      email: '',
      perfil: null,
      dataCriacao: null
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Retorna o texto do cabeçalho dos filtros baseado na quantidade ativa
   * @returns Texto do cabeçalho
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
   * @returns Array com os filtros ativos
   */
  public getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nome) {
      filters.push({ label: 'Nome', value: this.filtros.nome });
    }

    if (this.filtros.email) {
      filters.push({ label: 'Email', value: this.filtros.email });
    }

    if (this.filtros.perfil) {
      const perfilSelecionado = this.perfisOptions.find(option => option.value === this.filtros.perfil);
      const valorExibicao = perfilSelecionado ? perfilSelecionado.label : this.filtros.perfil;
      filters.push({ label: 'Perfil', value: valorExibicao });
    }

    if (this.filtros.dataCriacao) {
      const data = new Date(this.filtros.dataCriacao);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;

      filters.push({ label: 'Data de Criação', value: dataFormatada });
    }

    if (this.filtros.status !== null) {
      filters.push({ label: 'Status Perfil', value: this.filtros.status ? 'Ativo' : 'Inativo' });
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

    this.acessosService.exportarExcel('usuarioRoutes', ['exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de acessos");
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
