import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { PerfilModel, StatusPerfilEnum, TipoSuspensaoEnum } from '../../../../shared/models/perfil.model';
import { AcessoPerfil } from '../../../../shared/models/AcessoPerfil.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { inativoAtivoOptions, tipoSuspensaoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { getAccessLabel, getSeverity, messageOfReturns, handleExcelExportSuccess } from '../../../../shared/util/util';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatDate, parseDate, convertStringToDate } from '../../../../shared/util/dateUtil';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsEventService } from '../../../../shared/services/permissions/permissions-event.service';
import { PermissionsSyncService } from '../../../../shared/services/permissions/permissions-sync.service';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { ColumnPreferencesService } from '../../../../shared/services/columns-preference/columnPreferences.service';

/**
 * Componente para gerenciamento de perfis de usuário
 * @class
 * @Component
 */
@Component({
  selector: 'app-perfis',
  templateUrl: './perfis.component.html',
  styleUrl: './perfis.component.scss'
})
export class PerfisComponent {

  /** Referência ao componente OverlayPanel */
  @ViewChild('op') overlayPanel!: OverlayPanel;

  /** Lista de perfis exibidos na tabela */
  public perfis: any[] = [];

  /** Parâmetros de query customizados para filtros */
  public customQueryParams?: string;

  /** Parâmetros de filtro para query */
  public queryFilterParams?: Map<string, string>;

  /** Número atual de linhas por página */
  public currentRowsPerPage = 10;

  /** Índice da primeira linha atual */
  public currentFirstRows = 1;

  /** Flag para controlar exibição do modal */
  public displayModal: boolean = false;

  /** Flag para indicar se está editando um perfil */
  public isEditando: boolean = false;

  /** Título do modal */
  public modalTitle: string = '';

  /** Flag para controle de carregamento lazy */
  public tblLazyLoading: boolean = false;

  /** Número de linhas por página */
  public rows = 10;

  /** Opções de linhas por página */
  public rowsPerPage = [10, 25, 50, 100];

  /** Total de registros */
  public totalRecords: number = 0;

  /** Dados do perfil sendo editado */
  public perfilEditando: any = {
    nome: '',
    descricao: '',
    status: StatusPerfilEnum.Ativo,
    tipoSuspensao: TipoSuspensaoEnum.Temporaria,
    dataInicioSuspensao: null,
    dataFimSuspensao: null,
    motivoSuspensao: ''
  };

  /** Filtros aplicáveis à tabela */
  public filtros = {
    nome: '',
    status: null
  };

  /** Colunas da tabela */
  public columns: any[] = [
    { field: 'nome', header: '', visible: true },
    { field: 'descricao', header: '', visible: true },
    { field: 'statusPerfil', header: '', visible: true },
    { field: 'dataInclusao', header: '', visible: false },
    { field: 'nomeRespInclusao', header: '', visible: false },
    { field: 'dataUltimaModificacao', header: '', visible: false },
    { field: 'nomeRespUltimaModificacao', header: '', visible: false },
    { field: 'justificativaInativacao', header: '', visible: false },
    { field: 'motivoSuspensao', header: '', visible: false },
    { field: 'dataInicioSuspensao', header: '', visible: false },
    { field: 'dataFimSuspensao', header: '', visible: false }
  ];

  /** Opções de status */
  public statusOptions = inativoAtivoOptions;

  /** Opções de tipo de suspensão */
  public tipoSuspensaoOptions = tipoSuspensaoOptions;

  /** Lista de acessos disponíveis */
  public sourcePerfis: AcessoPerfil[] = [];

  /** Lista de acessos selecionados */
  public targetPerfis: AcessoPerfil[] = [];

  /** Valores do formulário de filtro */
  public filterFormValues: { [field: string]: any } = {};

  /** Mostrar modal de confirmação */
  public displayConfirmation: boolean = false;

  /** Título do modal de confirmação */
  public modalTitleDelete: string = '';

  /** Perfil a ser excluído */
  public perfilParaExcluir: any = null;

  /** Propriedades de permissão */
  public canCreate: boolean = false;
  public canEdit: boolean = false;
  public canDelete: boolean = false;
  public canView: boolean = false;
  public hasAnyPermission: boolean = false;
  public showActionsColumn: boolean = false;

  public StatusPerfilEnum = StatusPerfilEnum;
  public TipoSuspensaoEnum = TipoSuspensaoEnum;

  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly columnPreferencesService = inject(ColumnPreferencesService);
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly permissionsEventService = inject(PermissionsEventService);
  private readonly permissionsSyncService = inject(PermissionsSyncService);
  private readonly permissionsService = inject(PermissionsService);

  /**
   * Método de inicialização do componente
   * @method
   * @public
   */
  ngOnInit(): void {
    this.loadUserPermissions();
    
    setTimeout(() => {
      this.initializeColumns();
      this.modalTitleDelete = this.translateService.instant('PERFIS.CONFIRMAR_EXCLUSAO');
      this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
      this.loadColumnPreferences();
    }, 100);
    
    this.translationService.currentLanguage$.subscribe(() => {
      this.initializeColumns();
      this.modalTitleDelete = this.translateService.instant('PERFIS.CONFIRMAR_EXCLUSAO');
      this.loadColumnPreferences();
      this.cdr.detectChanges();
    });
  }

  /**
   * Carrega as permissões do usuário
   */
  private loadUserPermissions(): void {
    const rotinaId = 'D7DF8D60-26C8-4D5D-AF46-ADBF5E65F28C';

    setTimeout(() => {
      this.canView = this.permissionsService.canView(rotinaId);
      this.canCreate = this.permissionsService.canCreate(rotinaId);
      this.canEdit = this.permissionsService.canEdit(rotinaId);
      this.canDelete = this.permissionsService.canDelete(rotinaId);
      this.hasAnyPermission = this.permissionsService.hasAnyPermission(rotinaId);
      this.showActionsColumn = this.canEdit || this.canDelete;
    }, 200);
  }

  /**
   * Recarrega as permissões do usuário (útil para casos de mudança de perfil)
   */
  public reloadPermissions(): void {
    this.permissionsService.reloadPermissions();
    this.loadUserPermissions();
  }

  /**
   * Inicializa as colunas da tabela com traduções
   */
  private initializeColumns(): void {
    const currentColumns = [...this.columns];
    
    this.columns = [
      { field: 'nome', header: this.translateService.instant('PERFIS.NOME_PERFIL'), visible: true },
      { field: 'descricao', header: this.translateService.instant('PERFIS.DESCRICAO_PERFIL'), visible: true },
      { field: 'statusPerfil', header: this.translateService.instant('PERFIS.STATUS_PERFIL'), visible: true },
      { field: 'dataInclusao', header: this.translateService.instant('PERFIS.DATA_INCLUSAO'), visible: false },
      { field: 'nomeRespInclusao', header: this.translateService.instant('TABLES.RESPONSIBLE'), visible: false },
      { field: 'dataUltimaModificacao', header: this.translateService.instant('TABLES.LAST_MODIFICATION'), visible: false },
      { field: 'nomeRespUltimaModificacao', header: this.translateService.instant('TABLES.RESPONSIBLE'), visible: false },
      { field: 'justificativaInativacao', header: this.translateService.instant('PERFIS.JUSTIFICATIVA_INATIVACAO'), visible: false },
      { field: 'motivoSuspensao', header: this.translateService.instant('PERFIS.MOTIVO_SUSPENSAO'), visible: false },
      { field: 'dataInicioSuspensao', header: this.translateService.instant('PERFIS.DATA_INICIO_SUSPENSAO'), visible: false },
      { field: 'dataFimSuspensao', header: this.translateService.instant('PERFIS.DATA_FIM_SUSPENSAO'), visible: false }
    ];

    if (currentColumns.length > 0) {
      this.columns.forEach((col, index) => {
        const currentCol = currentColumns.find(c => c.field === col.field);
        if (currentCol) {
          col.visible = currentCol.visible;
        }
      });
    }
  }

  /**
   * Abre o modal de configuração de colunas
   * @param event Evento de mudança de colunas
   */
  toggleColumnConfig(event: Event) {
    this.overlayPanel.toggle(event);
  }

  /**
   * Trata mudança de colunas
   * @param event 
   */
  onColReorder(event: any) {
    const movedColumn = this.columns[event.dragIndex];

    this.columns.splice(event.dragIndex, 1);
    this.columns.splice(event.dropIndex, 0, movedColumn);

    this.saveColumnPreferences();
  }

  /**
   * Carrega as preferências de colunas
   */
  loadColumnPreferences() {
    //const savedPreferences = this.columnPreferencesService.loadPreferences('perfis', this.columns);
    
/*     this.columns.forEach(col => {
      const savedCol = savedPreferences.find((p: any) => p.field === col.field);
      if (savedCol) {
        col.visible = savedCol.visible;
      }
    }); */
  }

  /**
   * Salva as preferências de colunas
   */
  saveColumnPreferences() {
    //this.columnPreferencesService.savePreferences('perfis', this.columns);
  }

  /**
   * Carrega os dados da tabela
   * @method
   * @public
   * @param {TableLazyLoadEvent} event - Evento de carregamento lazy da tabela
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

    this.perfilService.getAll('perfilRoutes', undefined, params)
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
   * Constrói os parâmetros de filtro para a query
   * @method
   * @public
   * @returns {string} Parâmetros de filtro formatados
   */
  buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.nome) {
      params.append('nome', this.filtros.nome);
    }

    if (this.filtros.status !== null) {
      params.append('statusPerfil', String(this.filtros.status));
    }
    return params.toString();
  }

  /**
   * Carrega os dados de um perfil específico
   * @method
   * @private
   * @param {number} perfilId - ID do perfil a ser carregado
   */
  private loadPerfilData(perfilId: number) {
    this.perfilService.get('perfilRoutes', perfilId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.handlePerfilResponse(response.data);
          }
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Carrega todos os acessos disponíveis
   * @method
   * @private
   */
  private loadAllAcessos() {
    this.perfilService.getAll('perfilRoutes', ['Acessos'])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handlePerfilResponse(response);
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Trata a resposta de carregamento de perfil
   * @method
   * @private
   * @param {any} response - Resposta da API
   */
  private handlePerfilResponse(response: any) {
    this.sourcePerfis = [];
    this.targetPerfis = [];

    if (response.acessos && Array.isArray(response.acessos)) {
      response.acessos.forEach((acesso: AcessoPerfil) => {
        if (acesso.ativo) {
          this.targetPerfis.push(acesso);
        } else {
          this.sourcePerfis.push(acesso);
        }
      });
    }

    if (this.isEditando && response.perfil) {
      this.perfilEditando.dataInicioSuspensao = convertStringToDate(response.perfil.dataInicioSuspensao);
      this.perfilEditando.dataFimSuspensao = convertStringToDate(response.perfil.dataFimSuspensao);
    }

    this.changeDetectorRef.detectChanges();
  }

  /**
   * Trata a conclusão de operações
   * @method
   * @private
   */
  private handleComplete() {
    this.spinnerService.hide();
  }

  /**
   * Trata erros nas operações
   * @method
   * @private
   * @param {Result<PerfilModel>} err - Objeto de erro
   */
  private handleError(err: Result<PerfilModel>) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('PERFIS.ERRO_TENTAR_REGISTRAR'),
      detail: err.error?.message,
      life: 3000
    });
  }

  /**
   * Trata a resposta da API
   * @method
   * @private
   * @param {any} response - Resposta da API
   */
  private handleResponse(response: any) {
    if (response.items && Array.isArray(response.items)) {
      this.perfis = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.perfis = [];
      this.spinnerService.hide();
    }
    this.totalRecords = response.totalCount || 0;
    this.spinnerService.hide();
  }

  /**
   * Trata mudança de página
   * @method
   * @public
   * @param {any} event - Evento de mudança de página
   */
  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

  /**
   * Formata os dados da tabela
   * @method
   * @private
   * @param {any[]} data - Dados a serem formatados
   * @returns {any[]} Dados formatados
   */
  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      nome: item.nome ?? 'N/A',
      descricao: item.descricao ?? 'N/A',
      status: item.statusPerfil,
      statusPerfil: item.statusPerfil,
      dataInclusao: formatDate(item.dataInclusao),
      nomeRespInclusao: item.nomeRespInclusao ?? 'N/A',
      dataUltimaModificacao: formatDate(item.dataUltimaModificacao),
      nomeRespUltimaModificacao: item.nomeRespUltimaModificacao ?? 'N/A',
      justificativaInativacao: item.justificativaInativacao ?? 'N/A',
      tipoSuspensao: item.tipoSuspensao || 0,
      dataInicioSuspensao: item.dataInicioSuspensao ? formatDate(convertStringToDate(item.dataInicioSuspensao), false) : '	N/A',
      dataFimSuspensao: item.dataFimSuspensao ? formatDate(convertStringToDate(item.dataFimSuspensao), false) : '	N/A',
      motivoSuspensao: item.motivoSuspensao ?? 'N/A'
    }));
  }

  /**
   * Exibe o modal de edição/criação
   * @method
   * @public
   * @param {any} [perfil] - Perfil a ser editado (opcional)
   */
  showDialog(perfil?: any) {
    if (perfil && !this.canEdit) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_EDITAR'),
        life: 3000
      });
      return;
    }

    if (!perfil && !this.canCreate) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_CRIAR'),
        life: 3000
      });
      return;
    }

    this.isEditando = !!perfil;
    this.modalTitle = this.isEditando ? this.translateService.instant('PERFIS.EDITAR_PERFIL') : this.translateService.instant('PERFIS.INCLUIR_PERFIL');

    this.perfilEditando = this.isEditando
      ? {
        id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        status: perfil.statusPerfil,
        justificativaInativacao: perfil.justificativaInativacao,
        tipoSuspensao: perfil.tipoSuspensao || TipoSuspensaoEnum.Temporaria,
        dataInicioSuspensao: convertStringToDate(perfil.dataInicioSuspensao),
        dataFimSuspensao: convertStringToDate(perfil.dataFimSuspensao),
        motivoSuspensao: perfil.motivoSuspensao || ''
      }
      : {
        nome: '',
        descricao: '',
        status: StatusPerfilEnum.Ativo,
        justificativaInativacao: '',
        tipoSuspensao: TipoSuspensaoEnum.Temporaria,
        dataInicioSuspensao: null,
        dataFimSuspensao: null,
        motivoSuspensao: ''
      };

    if (this.isEditando) {
      this.loadPerfilData(perfil.id);
    } else {
      this.loadAllAcessos();
    }

    this.displayModal = true;
  }

  /**
   * Inicia a edição de um perfil
   * @method
   * @public
   * @param {any} perfil - Perfil a ser editado
   * @param {number} index - Índice do perfil na tabela
   */
  iniciarEdicao(perfil: any, index: number) {
    this.showDialog(perfil);
  }

  /**
   * Inclui um novo perfil
   * @method
   * @public
   */
  incluirPerfil() {
    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    const requestBody = {
      perfil: {
        nome: this.perfilEditando.nome,
        descricao: this.perfilEditando.descricao,
        statusPerfil: this.perfilEditando.status,
        IdRespInclusao: getUserIdFromStorage()
      },
      acessos: [
        ...this.sourcePerfis.map(acesso => ({
          idAcesso: acesso.idAcesso,
          acesso: acesso.acesso,
          idRotina: acesso.idRotina,
          rotina: acesso.rotina,
          idModulo: acesso.idModulo,
          modulo: acesso.modulo,
          ativo: false
        })),
        ...this.targetPerfis.map(acesso => ({
          idAcesso: acesso.idAcesso,
          acesso: acesso.acesso,
          idRotina: acesso.idRotina,
          rotina: acesso.rotina,
          idModulo: acesso.idModulo,
          modulo: acesso.modulo,
          ativo: true
        }))
      ]
    };

    this.perfilService.post('perfilRoutes', requestBody)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', this.translateService.instant('PERFIS.SUCESSO'), this.translateService.instant('PERFIS.PERFIL_CRIADO_SUCESSO'), 3000);
          this.displayModal = false;
          this.refreshTela();
          this.permissionsEventService.notifyProfileChanged(
            response.data?.id || 'unknown',
            this.perfilEditando.nome,
            'created'
          );
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Salva as alterações em um perfil existente
   * @method
   * @public
   */
  salvarAlteracaoPerfil() {

    if (!this.verificarCamposPreenchidos()) {
      return;
    }

    const perfilData: any = {
      id: this.perfilEditando.id,
      nome: this.perfilEditando.nome,
      descricao: this.perfilEditando.descricao,
      statusPerfil: this.perfilEditando.status,
      justificativaInativacao: this.perfilEditando.justificativaInativacao,
      idRespUltimaModificacao: getUserIdFromStorage()
    };

    if (this.perfilEditando.status === StatusPerfilEnum.Suspenso) {
      perfilData.tipoSuspensao = this.perfilEditando.tipoSuspensao;
      perfilData.dataInicioSuspensao = this.perfilEditando.dataInicioSuspensao;
      perfilData.dataFimSuspensao = this.perfilEditando.dataFimSuspensao;
      perfilData.motivoSuspensao = this.perfilEditando.motivoSuspensao;
    }

    if (this.perfilEditando.status === StatusPerfilEnum.Inativo) {
      perfilData.idRespInativacao = getUserIdFromStorage();
    }

    const requestBody = {
      perfil: perfilData,
      acessos: [
        ...this.sourcePerfis.map(acesso => ({
          idAcesso: acesso.idAcesso,
          acesso: acesso.acesso,
          idRotina: acesso.idRotina,
          rotina: acesso.rotina,
          idModulo: acesso.idModulo,
          modulo: acesso.modulo,
          ativo: false
        })),
        ...this.targetPerfis.map(acesso => ({
          idAcesso: acesso.idAcesso,
          acesso: acesso.acesso,
          idRotina: acesso.idRotina,
          rotina: acesso.rotina,
          idModulo: acesso.idModulo,
          modulo: acesso.modulo,
          ativo: true
        }))
      ]
    };

    this.perfilService.update('perfilRoutes', this.perfilEditando.id, requestBody)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', this.translateService.instant('PERFIS.SUCESSO'), this.translateService.instant('PERFIS.PERFIL_ATUALIZADO_SUCESSO'), 3000);
          this.displayModal = false;
          this.refreshTela();
          this.permissionsEventService.notifyProfileChanged(
            this.perfilEditando.id,
            this.perfilEditando.nome,
            'updated'
          );
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Atualiza a tela completamente após operações CRUD
   * @method
   * @private
   */
  private refreshTela(): void {
    const currentFirst = this.currentFirstRows;
    const currentRows = this.currentRowsPerPage;
    
    this.loadTableData({ first: currentFirst, rows: currentRows });

    this.changeDetectorRef.detectChanges();

    this.loadUserPermissions();
  }

  /**
   * Verifica se os campos obrigatórios foram preenchidos
   * @method
   * @public
   * @returns {boolean} True se os campos obrigatórios foram preenchidos, false caso contrário  */
  verificarCamposPreenchidos() {
    let valido = true;

    if (this.perfilEditando.nome === '') {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.INFORME_NOME_PERFIL'), 3000);
      valido = false;
    }

    if (this.targetPerfis.length === 0) {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.SELECIONE_AO_MENOS_UM_ACESSO'), 3000);
      valido = false;
    }

    if (this.perfilEditando.status === StatusPerfilEnum.Suspenso) {
      if (!this.perfilEditando.motivoSuspensao || this.perfilEditando.motivoSuspensao.trim() === '') {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.INFORME_MOTIVO_SUSPENSAO'), 3000);
        valido = false;
      }

      if (!this.perfilEditando.dataInicioSuspensao) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.INFORME_DATA_INICIO_SUSPENSAO'), 3000);
        valido = false;
      }

      if (this.perfilEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria && !this.perfilEditando.dataFimSuspensao) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.INFORME_DATA_FIM_SUSPENSAO'), 3000);
        valido = false;
      }

      if (this.perfilEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria && 
          this.perfilEditando.dataInicioSuspensao && 
          this.perfilEditando.dataFimSuspensao &&
          this.perfilEditando.dataFimSuspensao <= this.perfilEditando.dataInicioSuspensao) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('PERFIS.DATA_FIM_MAIOR_DATA_INICIO'), 3000);
        valido = false;
      }
    }

    return valido;
  }

  /**
   * Exibe o diálogo de confirmação para exclusão
   * @param perfil Dados do perfil a ser excluído
   */
  confirmarExclusao(perfil: any) {
    if (!this.canDelete) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_EXCLUIR'),
        life: 3000
      });
      return;
    }

    this.perfilParaExcluir = perfil;
    this.displayConfirmation = true;
  }

  /**
   * Confirma a exclusão do perfil
   */
  confirmarExclusaoDialog() {
    if (this.perfilParaExcluir) {
      this.excluirPerfil(this.perfilParaExcluir);
    }
    this.displayConfirmation = false;
    this.perfilParaExcluir = null;
  }

  /**
   * Cancela a exclusão do perfil
   */
  cancelarExclusao() {
    this.displayConfirmation = false;
    this.perfilParaExcluir = null;
  }

  /**
   * Exclui um perfil
   * @method
   * @public
   * @param {any} perfil - Perfil a ser excluído
   */
  excluirPerfil(perfil: any) {
    this.spinnerService.show();

    this.perfilService.delete('perfilRoutes', perfil.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.refreshTela();
          messageOfReturns(this.messageService, 'success', this.translateService.instant('PERFIS.SUCESSO'), this.translateService.instant('PERFIS.PERFIL_EXCLUIDO_SUCESSO'), 3000);
          this.spinnerService.hide();
          this.permissionsEventService.notifyProfileChanged(
            perfil.id,
            perfil.nome,
            'deleted'
          );
        },
        error: (err) => {
          this.handleError(err);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Obtém o label de acesso
   * @method
   * @public
   * @param {string} acesso - Valor do acesso
   * @returns {string} Label formatado
   */
  getAccessLabel(acesso: string): string {
    return getAccessLabel(acesso);
  }

  /**
   * Obtém a severidade para exibição
   * @method
   * @public
   * @param {string} price - Valor para determinar severidade
   * @returns {'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'} Severidade
   */
  getSeverity(price: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(price);
  }

  /**
   * Trata mudança de status
   * @method
   * @public
   */
  onStatusChange() {
    if (this.perfilEditando.status !== StatusPerfilEnum.Inativo) {
      this.perfilEditando.justificativaInativacao = '';
    }
  
    if (this.perfilEditando.status !== StatusPerfilEnum.Suspenso) {
      this.perfilEditando.tipoSuspensao = TipoSuspensaoEnum.Temporaria;
      this.perfilEditando.dataInicioSuspensao = null;
      this.perfilEditando.dataFimSuspensao = null;
      this.perfilEditando.motivoSuspensao = '';
    }

    if (this.perfilEditando.status !== StatusPerfilEnum.Inativo) {
      this.perfilEditando.justificativaInativacao = '';
    }
  }

  /**
   * Trata mudança de tipo de suspensão
   * @method
   * @public
   */
  onTipoSuspensaoChange() {
    if (this.perfilEditando.tipoSuspensao === TipoSuspensaoEnum.Permanente) {
      this.perfilEditando.dataFimSuspensao = null;
    }
    
    if (this.perfilEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria && !this.perfilEditando.dataFimSuspensao) {
      if (this.perfilEditando.dataInicioSuspensao) {
        const dataInicio = new Date(this.perfilEditando.dataInicioSuspensao);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + 30);
        this.perfilEditando.dataFimSuspensao = dataFim;
      }
    }
  }

  /**
   * Aplica os filtros
   * @method
   * @public
   */
  filtrar() {
    if (!this.canView) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_VISUALIZAR'),
        life: 3000
      });
      return;
    }

    let queryParams = [];

    if (this.filtros.nome) {
      queryParams.push(`Nome=${this.filtros.nome}`);
    }

    if (this.filtros.status !== null) {
      queryParams.push(`StatusPerfil=${this.filtros.status}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Limpa os filtros aplicados
   * @method
   * @public
   */
  limparFiltros() {
    if (!this.canView) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_VISUALIZAR'),
        life: 3000
      });
      return;
    }

    this.filtros = {
      nome: '',
      status: null
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Força a atualização das permissões no localStorage
   * Útil quando as permissões são alteradas e precisam ser sincronizadas
   * @method
   * @public
   */
  public forceUpdatePermissions(): void {
    this.permissionsSyncService.forceSync();
    this.permissionsEventService.notifyPermissionsReload();
  }

  /**
   * Obtém o cabeçalho dos filtros
   * @method
   * @public
   * @returns {string} Texto do cabeçalho
   */
  getFiltrosHeader(): string {
    const activeFiltersCount = this.getActiveFilters().length;

    if (activeFiltersCount === 0) {
      return this.translateService.instant('PERFIS.FILTROS') + ' ';
    } else if (activeFiltersCount === 1) {
      return this.translateService.instant('PERFIS.FILTRO_ATIVO');
    } else {
      return this.translateService.instant('PERFIS.FILTROS_ATIVOS');
    }
  }

  /**
   * Obtém os filtros ativos
   * @method
   * @public
   * @returns {{ label: string, value: string }[]} Lista de filtros ativos
   */
  getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nome) {
      filters.push({ label: this.translateService.instant('PERFIS.NOME'), value: this.filtros.nome });
    }

    if (this.filtros.status !== null) {
      const statusLabel = this.filtros.status ? this.translateService.instant('PERFIS.ATIVO') : this.translateService.instant('PERFIS.INATIVO');
      filters.push({ label: this.translateService.instant('PERFIS.STATUS_PERFIL'), value: statusLabel });
    }
    return filters;
  }

  /**
   * Exporta dados para Excel
   * @method
   * @public
   */
  public exportarParaExcel() {
    if (!this.canView) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('PERFIS.SEM_PERMISSAO_EXPORTAR'),
        life: 3000
      });
      return;
    }

    this.spinnerService.show();

    const queryParams = this.buildFiltersParams();
    const args = queryParams.split('&');

    this.perfilService.exportarExcel('perfilRoutes', ['exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, this.translateService.instant('PERFIS.RELATORIO_PERFIS'));
          messageOfReturns(this.messageService, 'success', this.translateService.instant('PERFIS.SUCESSO'), this.translateService.instant('PERFIS.DADOS_EXPORTADOS_SUCESSO'), 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', this.translateService.instant('PERFIS.ERRO'), this.translateService.instant('PERFIS.ERRO_EXPORTAR_EXCEL') + (err.message ?? this.translateService.instant('PERFIS.ERRO_DESCONHECIDO')), 3000);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Trata erros na exportação para Excel
   * @method
   * @private
   * @param {any} error - Objeto de erro
   */
  private handleExcelExportError(error: any): void {
    messageOfReturns(this.messageService, 'error', this.translateService.instant('PERFIS.ERRO'), this.translateService.instant('PERFIS.ERRO_EXPORTAR_EXCEL') + (error.message ?? this.translateService.instant('PERFIS.ERRO_DESCONHECIDO')), 3000);
  }

  /**
   * Obtém o label do status para exibição
   * @method
   * @public
   * @param {StatusPerfilEnum} status - Status do perfil
   * @returns {string} Label traduzido do status
   */
  public getStatusLabel(status: StatusPerfilEnum): string {
    switch (status) {
      case StatusPerfilEnum.Ativo:
        return this.translateService.instant('PERFIS.ATIVO');
      case StatusPerfilEnum.Inativo:
        return this.translateService.instant('PERFIS.INATIVO');
      case StatusPerfilEnum.Suspenso:
        return this.translateService.instant('PERFIS.SUSPENSO');
      default:
        return this.translateService.instant('COMMON.UNKNOWN');
    }
  }

  /**
   * Obtém a severidade do status para o componente p-tag
   * @method
   * @public
   * @param {StatusPerfilEnum} status - Status do perfil
   * @returns {string} Severidade para o p-tag
   */
  public getStatusSeverity(status: StatusPerfilEnum): 'success' | 'danger' | 'warning' | 'info' {
    switch (status) {
      case StatusPerfilEnum.Ativo:
        return 'success';
      case StatusPerfilEnum.Inativo:
        return 'danger';
      case StatusPerfilEnum.Suspenso:
        return 'warning';
      default:
        return 'info';
    }
  }
}