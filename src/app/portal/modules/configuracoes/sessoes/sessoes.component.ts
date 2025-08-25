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
import { getUserIdFromStorage, getUserNameFromStorage } from '../../../../shared/util/localStorageUtil';
import { messageOfReturns, getSeverity, handleExcelExportSuccess } from '../../../../shared/util/util';
import { SessaoModel, SessaoFiltroModel, EncerrarSessaoModel, EncerrarMultiplasSessoesModel } from '../../../../shared/models/sessao.model';
import { SessaoMockService } from '../../../../shared/services/mock/sessao-mock.service';
import { isMockEnabled } from '../../../../shared/config/mock-config';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sessoes',
  templateUrl: './sessoes.component.html',
  styleUrl: './sessoes.component.scss'
})
export class SessoesComponent {
  // Dados das sessões
  public sessoes: SessaoModel[] = [];
  public selectedSessoes: SessaoModel[] = [];
  
  // Configurações da tabela
  public customQueryParams?: string;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public tblLazyLoading: boolean = false;

  // Filtros
  public filtros: SessaoFiltroModel = {
    nomeUsuario: '',
    emailUsuario: '',
    perfilUsuario: '',
    dispositivo: '',
    navegador: '',
    sistemaOperacional: '',
    ipAddress: '',
    ativa: undefined,
    dataLoginInicio: undefined,
    dataLoginFim: undefined,
    tempoSessaoMinimo: undefined,
    tempoSessaoMaximo: undefined
  };

  // Opções para dropdowns
  public perfisOptions: any[] = [];
  public navegadoresOptions: any[] = [];
  public sistemasOperacionaisOptions: any[] = [];
  public statusSessaoOptions = [
    { label: 'Todas', value: undefined },
    { label: 'Ativas', value: true },
    { label: 'Inativas', value: false }
  ];

  // Modais
  public displayDetalhesModal: boolean = false;
  public displayConfirmacaoModal: boolean = false;
  public sessaoSelecionada: SessaoModel | null = null;
  public sessaoParaEncerrar: SessaoModel | null = null;
  public motivoEncerramento: string = '';

  // Services
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly sessoesService = inject(GenericService<SessaoModel>);
  private readonly sessoesMockService = inject(SessaoMockService);
  private readonly destroy = inject(DestroyRef);
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.loadPerfis();
    this.loadNavegadores();
    this.loadSistemasOperacionais();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
    this.initializeStatusOptions();
  }

  /**
   * Inicializa as opções de status com tradução
   */
  private initializeStatusOptions(): void {
    this.translateService.get(['SESSOES.TODAS', 'SESSOES.ATIVAS', 'SESSOES.INATIVAS']).subscribe(translations => {
      this.statusSessaoOptions = [
        { label: translations['SESSOES.TODAS'], value: undefined },
        { label: translations['SESSOES.ATIVAS'], value: true },
        { label: translations['SESSOES.INATIVAS'], value: false }
      ];
    });
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

    if (isMockEnabled('sessoes')) {
      // Usa o serviço mock
      this.sessoesMockService.getAll('sessaoRoutes', undefined, params)
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
    } else {
      // Usa o serviço real
      this.sessoesService.getAll('sessaoRoutes', undefined, params)
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
  }

  /**
   * Constrói os parâmetros de filtro para a requisição
   */
  public buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.nomeUsuario) {
      params.append('nomeUsuario', this.filtros.nomeUsuario);
    }

    if (this.filtros.emailUsuario) {
      params.append('emailUsuario', this.filtros.emailUsuario);
    }

    if (this.filtros.perfilUsuario) {
      params.append('perfilUsuario', this.filtros.perfilUsuario);
    }

    if (this.filtros.dispositivo) {
      params.append('dispositivo', this.filtros.dispositivo);
    }

    if (this.filtros.navegador) {
      params.append('navegador', this.filtros.navegador);
    }

    if (this.filtros.sistemaOperacional) {
      params.append('sistemaOperacional', this.filtros.sistemaOperacional);
    }

    if (this.filtros.ipAddress) {
      params.append('ipAddress', this.filtros.ipAddress);
    }

    if (this.filtros.ativa !== undefined) {
      params.append('ativa', String(this.filtros.ativa));
    }

    if (this.filtros.dataLoginInicio) {
      params.append('dataLoginInicio', formatarDataParaDDMMYYYY(this.filtros.dataLoginInicio));
    }

    if (this.filtros.dataLoginFim) {
      params.append('dataLoginFim', formatarDataParaDDMMYYYY(this.filtros.dataLoginFim));
    }

    if (this.filtros.tempoSessaoMinimo !== undefined) {
      params.append('tempoSessaoMinimo', String(this.filtros.tempoSessaoMinimo));
    }

    if (this.filtros.tempoSessaoMaximo !== undefined) {
      params.append('tempoSessaoMaximo', String(this.filtros.tempoSessaoMaximo));
    }

    return params.toString();
  }

  /**
   * Carrega a lista de perfis disponíveis
   */
  public loadPerfis() {
    if (isMockEnabled('sessoes')) {
      // Dados mock para perfis
      this.perfisOptions = [
        { label: 'Administrador', value: 'admin1' },
        { label: 'Gerente', value: 'gerente1' },
        { label: 'Analista', value: 'analista1' },
        { label: 'Usuário', value: 'usuario1' }
      ];
    } else {
      this.sessoesService.getAll('perfilRoutes')
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
  }

  /**
   * Carrega a lista de navegadores
   */
  public loadNavegadores() {
    this.navegadoresOptions = [
      { label: 'Chrome', value: 'Chrome' },
      { label: 'Firefox', value: 'Firefox' },
      { label: 'Safari', value: 'Safari' },
      { label: 'Edge', value: 'Edge' },
      { label: 'Opera', value: 'Opera' },
      { label: 'Internet Explorer', value: 'Internet Explorer' },
      { label: 'Outros', value: 'Outros' }
    ];
  }

  /**
   * Carrega a lista de sistemas operacionais
   */
  public loadSistemasOperacionais() {
    this.sistemasOperacionaisOptions = [
      { label: 'Windows', value: 'Windows' },
      { label: 'macOS', value: 'macOS' },
      { label: 'Linux', value: 'Linux' },
      { label: 'Android', value: 'Android' },
      { label: 'iOS', value: 'iOS' },
      { label: 'Outros', value: 'Outros' }
    ];
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
      nomeUsuario: '',
      emailUsuario: '',
      perfilUsuario: '',
      dispositivo: '',
      navegador: '',
      sistemaOperacional: '',
      ipAddress: '',
      ativa: undefined,
      dataLoginInicio: undefined,
      dataLoginFim: undefined,
      tempoSessaoMinimo: undefined,
      tempoSessaoMaximo: undefined
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Retorna o cabeçalho dos filtros
   */
  public getFiltrosHeader(): string {
    const activeFiltersCount = this.getActiveFilters().length;

    if (activeFiltersCount === 0) {
      return this.translationService.translate('SESSOES.FILTROS') + ' ';
    } else if (activeFiltersCount === 1) {
      return this.translationService.translate('SESSOES.FILTRO_ATIVO');
    } else {
      return this.translationService.translate('SESSOES.FILTROS_ATIVOS');
    }
  }

  /**
   * Retorna os filtros atualmente aplicados
   */
  public getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nomeUsuario) {
      filters.push({ label: this.translationService.translate('SESSOES.NOME_USUARIO'), value: this.filtros.nomeUsuario });
    }

    if (this.filtros.emailUsuario) {
      filters.push({ label: this.translationService.translate('SESSOES.EMAIL_USUARIO'), value: this.filtros.emailUsuario });
    }

    if (this.filtros.perfilUsuario) {
      const perfilSelecionado = this.perfisOptions.find(option => option.value === this.filtros.perfilUsuario);
      const valorExibicao = perfilSelecionado ? perfilSelecionado.label : this.filtros.perfilUsuario;
      filters.push({ label: this.translationService.translate('SESSOES.PERFIL_USUARIO'), value: valorExibicao });
    }

    if (this.filtros.dispositivo) {
      filters.push({ label: this.translationService.translate('SESSOES.DISPOSITIVO'), value: this.filtros.dispositivo });
    }

    if (this.filtros.navegador) {
      filters.push({ label: this.translationService.translate('SESSOES.NAVEGADOR'), value: this.filtros.navegador });
    }

    if (this.filtros.sistemaOperacional) {
      filters.push({ label: this.translationService.translate('SESSOES.SISTEMA_OPERACIONAL'), value: this.filtros.sistemaOperacional });
    }

    if (this.filtros.ipAddress) {
      filters.push({ label: this.translationService.translate('SESSOES.IP_ADDRESS'), value: this.filtros.ipAddress });
    }

    if (this.filtros.ativa !== undefined) {
      filters.push({ 
        label: this.translationService.translate('SESSOES.STATUS_SESSAO'), 
        value: this.filtros.ativa ? this.translationService.translate('SESSOES.ATIVAS') : this.translationService.translate('SESSOES.INATIVAS') 
      });
    }

    if (this.filtros.dataLoginInicio) {
      const data = new Date(this.filtros.dataLoginInicio);
      const dataFormatada = data.toLocaleDateString('pt-BR');
      filters.push({ label: this.translationService.translate('SESSOES.DATA_LOGIN_INICIO'), value: dataFormatada });
    }

    if (this.filtros.dataLoginFim) {
      const data = new Date(this.filtros.dataLoginFim);
      const dataFormatada = data.toLocaleDateString('pt-BR');
      filters.push({ label: this.translationService.translate('SESSOES.DATA_LOGIN_FIM'), value: dataFormatada });
    }

    return filters;
  }

  /**
   * Encerra uma sessão individual
   */
  public encerrarSessao(sessao: SessaoModel) {
    this.sessaoParaEncerrar = sessao;
    this.motivoEncerramento = '';
    this.displayConfirmacaoModal = true;
  }

  /**
   * Confirma o encerramento de uma sessão
   */
  public confirmarEncerramento() {
    if (!this.sessaoParaEncerrar) return;

    this.spinnerService.show();

    const encerrarSessao: EncerrarSessaoModel = {
      idSessao: this.sessaoParaEncerrar.id,
      motivo: this.motivoEncerramento,
      idRespEncerramento: getUserIdFromStorage(),
      nomeRespEncerramento: getUserNameFromStorage()
    };

    if (isMockEnabled('sessoes')) {
      // Usa o serviço mock
      this.sessoesMockService.post('sessaoRoutes', encerrarSessao, ['encerrar'])
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            messageOfReturns(this.messageService, 'success', 
              this.translationService.translate('SESSOES.SUCESSO'), 
              this.translationService.translate('SESSOES.SESSAO_ENCERRADA_SUCESSO'), 3000);
            this.displayConfirmacaoModal = false;
            this.sessaoParaEncerrar = null;
            this.motivoEncerramento = '';
            this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          },
          error: (err) => this.handleError(err)
        });
    } else {
      // Usa o serviço real
      this.sessoesService.post('sessaoRoutes', encerrarSessao, ['encerrar'])
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            messageOfReturns(this.messageService, 'success', 
              this.translationService.translate('SESSOES.SUCESSO'), 
              this.translationService.translate('SESSOES.SESSAO_ENCERRADA_SUCESSO'), 3000);
            this.displayConfirmacaoModal = false;
            this.sessaoParaEncerrar = null;
            this.motivoEncerramento = '';
            this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          },
          error: (err) => this.handleError(err)
        });
    }
  }

  /**
   * Cancela o encerramento de uma sessão
   */
  public cancelarEncerramento() {
    this.displayConfirmacaoModal = false;
    this.sessaoParaEncerrar = null;
    this.motivoEncerramento = '';
  }

  /**
   * Encerra múltiplas sessões selecionadas
   */
  public encerrarSessoesSelecionadas() {
    if (!this.selectedSessoes || this.selectedSessoes.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      message: this.translationService.translate('SESSOES.TEM_CERTEZA_ENCERRAR_MULTIPLAS'),
      header: this.translationService.translate('SESSOES.CONFIRMAR_ENCERRAMENTO'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('COMMON.YES'),
      rejectLabel: this.translationService.translate('COMMON.NO'),
      accept: () => {
        this.spinnerService.show();

        const encerrarMultiplas: EncerrarMultiplasSessoesModel = {
          idsSessoes: this.selectedSessoes.map(s => s.id),
          motivo: 'Encerramento em lote pelo administrador',
          idRespEncerramento: getUserIdFromStorage(),
          nomeRespEncerramento: getUserNameFromStorage()
        };

        if (isMockEnabled('sessoes')) {
          // Usa o serviço mock
          this.sessoesMockService.encerrarMultiplasSessoes(encerrarMultiplas)
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe({
              next: () => {
                messageOfReturns(this.messageService, 'success', 
                  this.translationService.translate('SESSOES.SUCESSO'), 
                  `${this.selectedSessoes.length} ${this.translationService.translate('SESSOES.SESSOES_ENCERRADAS_SUCESSO')}!`, 3000);
                this.selectedSessoes = [];
                this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
              },
              error: (err) => this.handleError(err)
            });
        } else {
          // Usa o serviço real
          this.sessoesService.post('sessaoRoutes', encerrarMultiplas, ['encerrar-multiplas'])
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe({
              next: () => {
                messageOfReturns(this.messageService, 'success', 
                  this.translationService.translate('SESSOES.SUCESSO'), 
                  `${this.selectedSessoes.length} ${this.translationService.translate('SESSOES.SESSOES_ENCERRADAS_SUCESSO')}!`, 3000);
                this.selectedSessoes = [];
                this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
              },
              error: (err) => this.handleError(err)
            });
        }
      }
    });
  }

  /**
   * Visualiza detalhes de uma sessão
   */
  public visualizarDetalhesSessao(sessao: SessaoModel) {
    this.sessaoSelecionada = sessao;
    this.displayDetalhesModal = true;
  }

  /**
   * Exporta os dados para Excel
   */
  public exportarParaExcel() {
    this.spinnerService.show();

    const queryParams = this.buildFiltersParams();
    const args = queryParams.split('&');

    if (isMockEnabled('sessoes')) {
      // Usa o serviço mock
      this.sessoesMockService.exportarExcel('sessaoRoutes', ['exportar-excel'], ...args)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: (blob) => {
            handleExcelExportSuccess(blob, "Relatório de sessões");
            messageOfReturns(this.messageService, 'success', 
              this.translationService.translate('SESSOES.SUCESSO'), 
              this.translationService.translate('SESSOES.DADOS_EXPORTADOS_SUCESSO'), 3000);
            this.spinnerService.hide();
          },
          error: (err) => {
            messageOfReturns(this.messageService, 'error', 
              this.translationService.translate('SESSOES.ERRO'), 
              this.translationService.translate('SESSOES.ERRO_EXPORTAR_EXCEL') + ': ' + (err.message ?? this.translationService.translate('SESSOES.ERRO_DESCONHECIDO')), 3000);
            this.spinnerService.hide();
          }
        });
    } else {
      // Usa o serviço real
      this.sessoesService.exportarExcel('sessaoRoutes', ['exportar-excel'], ...args)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: (blob) => {
            handleExcelExportSuccess(blob, "Relatório de sessões");
            messageOfReturns(this.messageService, 'success', 
              this.translationService.translate('SESSOES.SUCESSO'), 
              this.translationService.translate('SESSOES.DADOS_EXPORTADOS_SUCESSO'), 3000);
            this.spinnerService.hide();
          },
          error: (err) => {
            messageOfReturns(this.messageService, 'error', 
              this.translationService.translate('SESSOES.ERRO'), 
              this.translationService.translate('SESSOES.ERRO_EXPORTAR_EXCEL') + ': ' + (err.message ?? this.translationService.translate('SESSOES.ERRO_DESCONHECIDO')), 3000);
            this.spinnerService.hide();
          }
        });
    }
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
      this.sessoes = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.sessoes = [];
      this.spinnerService.hide();
    }
    this.totalRecords = response.totalCount ?? 0;
  }

  /**
   * Formata os dados para exibição na tabela
   */
  private formatTableData(data: any[]): SessaoModel[] {
    return data.map((item) => ({
      id: item.id,
      idUsuario: item.idUsuario,
      nomeUsuario: item.nomeUsuario ?? 'N/A',
      emailUsuario: item.emailUsuario ?? 'N/A',
      perfilUsuario: item.perfilUsuario ?? 'N/A',
      dataLogin: item.dataLogin ? new Date(item.dataLogin) : new Date(),
      dataUltimaAtividade: item.dataUltimaAtividade ? new Date(item.dataUltimaAtividade) : new Date(),
      tempoSessao: item.tempoSessao ?? '0 min',
      tempoInativo: item.tempoInativo ?? '0 min',
      dispositivo: item.dispositivo ?? 'N/A',
      navegador: item.navegador ?? 'N/A',
      versaoNavegador: item.versaoNavegador ?? 'N/A',
      sistemaOperacional: item.sistemaOperacional ?? 'N/A',
      ipAddress: item.ipAddress ?? 'N/A',
      userAgent: item.userAgent ?? 'N/A',
      pais: item.pais ?? 'N/A',
      cidade: item.cidade ?? 'N/A',
      regiao: item.regiao ?? 'N/A',
      ativa: item.ativa ?? false,
      bloqueada: item.bloqueada ?? false,
      motivoBloqueio: item.motivoBloqueio,
      tokenJWT: item.tokenJWT,
      refreshToken: item.refreshToken,
      expiraEm: item.expiraEm ? new Date(item.expiraEm) : new Date(),
      dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : new Date(),
      dataUltimaModificacao: item.dataUltimaModificacao ? new Date(item.dataUltimaModificacao) : new Date(),
      idRespCriacao: item.idRespCriacao,
      nomeRespCriacao: item.nomeRespCriacao,
      idRespUltimaModificacao: item.idRespUltimaModificacao,
      nomeRespUltimaModificacao: item.nomeRespUltimaModificacao
    }));
  }

  /**
   * Trata erros nas requisições
   */
  private handleError(err: Result<SessaoModel>) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: this.translationService.translate('SESSOES.ERRO'),
      detail: err.error?.message || this.translationService.translate('SESSOES.ERRO_DESCONHECIDO'),
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
   * Retorna a severidade para exibição de perfil
   */
  public getPerfilSeverity(perfil: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const perfilLower = perfil.toLowerCase();
    if (perfilLower.includes('admin')) return 'danger';
    if (perfilLower.includes('gerente')) return 'warning';
    if (perfilLower.includes('usuario')) return 'info';
    return 'secondary';
  }

  /**
   * Formata data para exibição
   */
  public formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }

  /**
   * Formata hora para exibição
   */
  public formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formata data e hora para exibição
   */
  public formatarDataHora(data: Date): string {
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Manipula a reordenação de colunas
   */
  public onColReorder(event: any): void {
    // Implementação para reordenação de colunas se necessário
    console.log('Colunas reordenadas:', event);
  }
}
