import { Component, DestroyRef, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Result } from '../../../../shared/models/api/result.model';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { inativoAtivoOptions, tipoSuspensaoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { getSeverity, getTipoAcessoText, handleExcelExportSuccess, messageOfReturns } from '../../../../shared/util/util';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatarDataParaDDMMYYYY, formatDate, parseDate, convertStringToDate } from '../../../../shared/util/dateUtil';
import { tipoPessoaOptions } from '../../../../shared/models/options/tipoPessoa.options';
import { tipoAcessoOptions } from '../../../../shared/models/options/tipoAcesso.options';
import { DiaSemana } from '../../../../shared/models/diaSemana.model';
import { HorarioAcesso } from '../../../../shared/models/horariosAcesso.model';
import { TipoAcessoEnum } from '../../../../shared/models/enums/tipoAcesso.enum';
import { StatusUsuarioEnum, TipoSuspensaoEnum } from '../../../../shared/models/enums/statusUsuario.enum';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ColumnPreferencesService } from '../../../../shared/services/columns-preference/columnPreferences.service';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { SensitiveDataService } from '../../../../shared/services/sensitive-data.service';
import { SensitiveDataLevel } from '../../../../shared/models/sensitive-data.model';
import { ColumnConfig } from '../../../../shared/models/column-config.model';

/**
 * Componente para gerenciamento de acessos de usuários
 */
@Component({
  selector: 'app-acessos',
  templateUrl: './acessos.component.html',
  styleUrl: './acessos.component.scss'
})
export class AcessosComponent {

  @ViewChild('op') overlayPanel!: OverlayPanel;
  @ViewChild('canvasEditor') canvasEditor!: any;
  @ViewChild('canvasPreview') canvasPreview!: any;

  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly columnPrefsService = inject(ColumnPreferencesService);
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly permissionsService = inject(PermissionsService);
  private readonly sensitiveDataService = inject(SensitiveDataService);

  public pageTitle: string = this.translateService.instant('ACESSOS.TITLE');
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
  public StatusUsuarioEnum = StatusUsuarioEnum;
  public TipoSuspensaoEnum = TipoSuspensaoEnum;
  public tipoPessoaOptions = tipoPessoaOptions;
  public tipoAcessoOptions = tipoAcessoOptions;
  public displayModal: boolean = false;
  public deveAlterarSenha: boolean = true;
  public perfisOptions: any[] = [];
  public mostrarSenha: boolean = false;
  public displayConfirmation: boolean = false;
  public modalTitleDelete: string = '';
  public acessoParaExcluir: any = null;
  public fotoPerfilPreview: string | null = null;
  public arquivoSelecionado: File | null = null;
  public displayFotoEditor: boolean = false;
  public imagemOriginal: string | null = null;
  public imagemEditada: string | null = null;
  public escala: number = 1;
  public posicaoX: number = 0;
  public posicaoY: number = 0;
  public rotacao: number = 0;
  public cropX: number = 0;
  public cropY: number = 0;
  public cropSize: number = 200;
  public diasSemana: DiaSemana[] = [];
  public canCreate: boolean = false;
  public canEdit: boolean = false;
  public canDelete: boolean = false;
  public canView: boolean = false;
  public hasAnyPermission: boolean = false;
  public showColumnConfigModal = false;
  
  /** Opções de status */
  public statusOptions = inativoAtivoOptions;

  /** Opções de tipo de suspensão */
  public tipoSuspensaoOptions = tipoSuspensaoOptions;

  /** Propriedades para dados sensíveis */
  public SensitiveDataLevel = SensitiveDataLevel;
  public currentUserSensitiveLevel: SensitiveDataLevel = SensitiveDataLevel.PUBLIC;

  public acessoEditando: any = {
    nome: '',
    email: '',
    idPerfil: null,
    perfilId: null,
    status: StatusUsuarioEnum.Ativo,
    tipoAcesso: 0,
    tipoPessoa: 0,
    telefone: null,
    cpfCnpj: null,
    usuario: null,
    dataExpiracao: null,
    observacoes: '',
    senha: '@PortalVMI' + new Date().getFullYear(),
    fotoPerfil: null,
    tipoSuspensao: TipoSuspensaoEnum.Temporaria,
    dataInicioSuspensao: null,
    dataFimSuspensao: null,
    motivoSuspensao: '',
    idRespSuspensao: null,
    nomeRespSuspensao: null,
    dataSuspensao: null
  };

  public filtros = {
    nome: '',
    status: null,
    email: '',
    perfil: null,
    dataCriacao: null
  };

  public horarios: any[] = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    return { label: time, value: time };
  });

  public columns: any[] = [];
  public visibleColumns: any[] = [];
  public showActionsColumn: boolean = false;

  /**
   * Inicializa o componente carregando os perfis e dados da tabela
   */
  ngOnInit(): void {
    this.loadUserPermissions();
    this.initializeFormData();
    this.initializeDiasSemana();
    this.initializeColumns();
    this.loadColumnPreferences();
    this.modalTitleDelete = this.translateService.instant('ACESSOS.CONFIRMAR_EXCLUSAO');
    this.loadPerfis();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
    if (this.acessoEditando.horariosAcesso) {
      this.carregarHorariosExistente(this.acessoEditando.horariosAcesso);
    }
    
    this.translationService.currentLanguage$.subscribe(() => {
      this.initializeDiasSemana();
      this.initializeColumns();
      this.modalTitleDelete = this.translateService.instant('ACESSOS.CONFIRMAR_EXCLUSAO');
      this.loadColumnPreferences();
      this.cdr.detectChanges();
    });
  }



  /**
   * Recarrega as permissões do usuário (útil para casos de mudança de perfil)
   */
  public reloadPermissions(): void {
    this.permissionsService.reloadPermissions();
    this.loadUserPermissions();
  }

  /**
   * Carrega as permissões do usuário
   */
  private loadUserPermissions(): void {
    const rotinaId = 'B7DC57DD-AE9D-47BE-9145-945B38E1C3D2';

    setTimeout(() => {
      this.canView = this.permissionsService.canView(rotinaId);
      this.canCreate = this.permissionsService.canCreate(rotinaId);
      this.canEdit = this.permissionsService.canEdit(rotinaId);
      this.canDelete = this.permissionsService.canDelete(rotinaId);
      this.hasAnyPermission = this.permissionsService.hasAnyPermission(rotinaId);
      this.showActionsColumn = this.canEdit || this.canDelete;
      // Só atualiza as colunas visíveis se as colunas já foram inicializadas e as preferências foram carregadas
      if (this.columns && this.columns.length > 0) {
        this.updateVisibleColumns();
      }
    }, 10);
  }

  /**
   * Atualiza a lista de colunas visíveis
   */
  private updateVisibleColumns(): void {
    if (!this.columns || this.columns.length === 0) {
      this.visibleColumns = [];
      return;
    }
    
    this.visibleColumns = this.columns.filter(col => col.visible);
  }

  /**
   * Obtém a última coluna visível
   */
  get lastVisibleColumn(): any {
    return this.visibleColumns.length > 0 ? this.visibleColumns[this.visibleColumns.length - 1] : null;
  }

  /**
   * Inicializa os dados padrão do formulário
   */
  private initializeFormData() {
    this.acessoEditando = {
      nome: '',
      email: '',
      senha: '@PortalVMI' + new Date().getFullYear(),
      idPerfil: null,
      perfilId: null,
      status: StatusUsuarioEnum.Ativo,
      tipoAcesso: 0,
      tipoPessoa: 0,
      telefone: null,
      cpfCnpj: null,
      usuario: null,
      dataExpiracao: null,
      observacoes: '',
      horariosAcesso: [],
      fotoPerfil: null,
      tipoSuspensao: TipoSuspensaoEnum.Temporaria,
      dataInicioSuspensao: null,
      dataFimSuspensao: null,
      motivoSuspensao: '',
      idRespSuspensao: null,
      nomeRespSuspensao: null,
      dataSuspensao: null
    };
  }

  /**
   * Inicializa os dias da semana com traduções
   */
  private initializeDiasSemana(): void {
    this.diasSemana = [
      { value: 0, label: this.translateService.instant('ACESSOS.DOMINGO') },
      { value: 1, label: this.translateService.instant('ACESSOS.SEGUNDA_FEIRA') },
      { value: 2, label: this.translateService.instant('ACESSOS.TERCA_FEIRA') },
      { value: 3, label: this.translateService.instant('ACESSOS.QUARTA_FEIRA') },
      { value: 4, label: this.translateService.instant('ACESSOS.QUINTA_FEIRA') },
      { value: 5, label: this.translateService.instant('ACESSOS.SEXTA_FEIRA') },
      { value: 6, label: this.translateService.instant('ACESSOS.SABADO') }
    ];
  }

  /**
   * Cria a configuração padrão das colunas
   */
  private createDefaultColumnConfig(): any[] {
    return [
      { field: 'nome', header: this.translateService.instant('ACESSOS.NOME_COMPLETO'), visible: true },
      { field: 'email', header: this.translateService.instant('ACESSOS.EMAIL'), visible: true },
      { field: 'perfilNome', header: this.translateService.instant('ACESSOS.PERFIL'), visible: true },
      { field: 'status', header: this.translateService.instant('ACESSOS.STATUS_ACESSO'), visible: true },
      { field: 'tipoAcesso', header: this.translateService.instant('ACESSOS.TIPO_ACESSO'), visible: true },
      { field: 'dataCriacao', header: this.translateService.instant('ACESSOS.DATA_CADASTRO'), visible: false },
      { field: 'nomeCriadorUsuario', header: this.translateService.instant('TABLES.RESPONSIBLE'), visible: false },
      { field: 'dataAlteracao', header: this.translateService.instant('TABLES.LAST_MODIFICATION'), visible: false },
      { field: 'respUltimaModificacaoUsuario', header: this.translateService.instant('TABLES.RESPONSIBLE'), visible: false },
      { field: 'justificativaInativacao', header: this.translateService.instant('ACESSOS.JUSTIFICATIVA_INATIVACAO'), visible: false }
    ];
  }

  /**
   * Inicializa as colunas da tabela com traduções
   */
  private initializeColumns(): void {
    const currentColumns = [...this.columns];
    this.columns = this.createDefaultColumnConfig();

    // Preserva as configurações de visibilidade existentes
    if (currentColumns.length > 0) {
      this.columns.forEach((col, index) => {
        const currentCol = currentColumns.find(c => c.field === col.field);
        if (currentCol) {
          col.visible = currentCol.visible;
        }
      });
    }

    // Não chama updateVisibleColumns aqui, será chamado após carregar as preferências
  }

  /**
   * Obtém as colunas padrão para restauração
   */
  public getDefaultColumns(): any[] {
    return this.createDefaultColumnConfig();
  }

  /**
   * Abre o modal de configuração de colunas
   * @param event Evento de mudança de colunas
   */
  toggleColumnConfig(event: Event) {
    if (this.overlayPanel) {
      this.overlayPanel.toggle(event);
    }
  }

  /**
   * Trata mudança de colunas
   * @param event 
   */
  onColReorder(event: any) {
    if (!this.columns || this.columns.length === 0) {
      return;
    }

    const movedColumn = this.columns[event.dragIndex];

    this.columns.splice(event.dragIndex, 1);
    this.columns.splice(event.dropIndex, 0, movedColumn);

    this.updateVisibleColumns();
    this.saveColumnPreferences();
  }

  /**
   * Carrega as preferências de colunas da API
   */
  loadColumnPreferences() {
    if (!this.columns || this.columns.length === 0) {
      return;
    }

    // Carrega as preferências da API para a tela 'acessos'
    this.columnPrefsService.loadPreferencesFromApi('acessos', this.columns)
      .subscribe({
        next: (preferences) => {
          if (preferences && preferences.length > 0) {
            // Procura por uma preferência marcada como default
            const defaultPreference = preferences.find(p => p.isDefault);
            
            if (defaultPreference && defaultPreference.columns) {
              // Aplica a preferência default da API
              let columns: any[] = [];
              
              // Verifica se as colunas são string JSON ou array
              if (typeof defaultPreference.columns === 'string') {
                try {
                  columns = JSON.parse(defaultPreference.columns);
                } catch (parseError) {
                  console.error('Erro ao fazer parse das colunas da preferência default:', parseError);
                  // Em caso de erro, usa as colunas padrão
                  this.columns = this.createDefaultColumnConfig();
                  this.updateVisibleColumns();
                  return;
                }
              } else if (Array.isArray(defaultPreference.columns)) {
                columns = defaultPreference.columns;
              } else {
                // Se não há colunas válidas, usa as padrão
                this.columns = this.createDefaultColumnConfig();
                this.updateVisibleColumns();
                return;
              }
              
              // Aplica as colunas processadas
              this.columns = columns.map((col: any, index: number) => ({
                ...col,
                order: index
              }));
            } else {
              // Se não há preferência default, usa as colunas padrão do componente
              this.columns = this.createDefaultColumnConfig();
            }
          } else {
            // Se não há preferências na API, usa as colunas padrão do componente
            this.columns = this.createDefaultColumnConfig();
          }
          
          // Atualiza a lista de colunas visíveis
          this.updateVisibleColumns();
        },
        error: (error) => {
          console.error('Erro ao carregar preferências da API:', error);
          // Em caso de erro, usa as colunas padrão do componente
          this.columns = this.createDefaultColumnConfig();
          this.updateVisibleColumns();
        }
      });
  }

  /**
   * Salva as preferências de colunas
   */
  saveColumnPreferences() {
    if (!this.columns || this.columns.length === 0) {
      return;
    }

    this.columnPrefsService.savePreferencesForScreenSimple('acessos', this.columns);
    this.updateVisibleColumns();
  }

  /**
   * Exibe o modal para edição ou criação de um acesso
   * @param acesso Dados do acesso a ser editado (opcional)
   */
  showDialog(acesso?: any) {
    this.isEditando = !!acesso;
    this.modalTitle = this.isEditando ? this.translateService.instant('ACESSOS.EDITAR_ACESSO') : this.translateService.instant('ACESSOS.INCLUIR_ACESSO');

    this.acessoEditando = this.isEditando
      ? {
        id: acesso.id,
        nome: acesso.nome,
        email: acesso.email,
        idPerfil: acesso.idPerfil || null,
        perfilId: acesso.idPerfil || null,
        status: acesso.status || acesso.statusUsuario || StatusUsuarioEnum.Ativo,
        justificativaInativacao: acesso.justificativaInativacao,
        tipoAcesso: acesso.tipoAcesso !== null && acesso.tipoAcesso !== undefined ? Number(acesso.tipoAcesso) : 0,
        tipoPessoa: acesso.tipoPessoa !== null && acesso.tipoPessoa !== undefined ? Number(acesso.tipoPessoa) : 0,
        telefone: acesso.telefone,
        cpfCnpj: acesso.cpfCnpj,
        usuario: acesso.usuario,
        dataExpiracao: convertStringToDate(acesso.dataExpiracao),
        observacoes: acesso.observacoes,
        horariosAcessoJson: acesso.horariosAcessoJson,
        dataCriacao: convertStringToDate(acesso.dataInclusao),
        dataAlteracao: convertStringToDate(acesso.dataUltimaAlteracao),
        dataInativacao: convertStringToDate(acesso.dataInativacao),
        dataUltimoLogin: convertStringToDate(acesso.dataUltimoLogin),
        fotoPerfil: acesso.fotoPerfil || null,
        tipoSuspensao: acesso.tipoSuspensao || TipoSuspensaoEnum.Temporaria,
        dataInicioSuspensao: convertStringToDate(acesso.dataInicioSuspensao),
        dataFimSuspensao: convertStringToDate(acesso.dataFimSuspensao),
        motivoSuspensao: acesso.motivoSuspensao || '',
        idRespSuspensao: acesso.idRespSuspensao,
        nomeRespSuspensao: acesso.nomeRespSuspensao,
        dataSuspensao: convertStringToDate(acesso.dataSuspensao)
      }
      : {
        nome: '',
        email: '',
        senha: '@PortalVMI' + new Date().getFullYear(),
        idPerfil: null,
        perfilId: null,
        status: StatusUsuarioEnum.Ativo,
        tipoAcesso: 0,
        tipoPessoa: 0,
        telefone: null,
        cpfCnpj: null,
        usuario: null,
        dataExpiracao: null,
        observacoes: '',
        horariosAcesso: [],
        fotoPerfil: null,
        tipoSuspensao: TipoSuspensaoEnum.Temporaria,
        dataInicioSuspensao: null,
        dataFimSuspensao: null,
        motivoSuspensao: '',
        idRespSuspensao: null,
        nomeRespSuspensao: null,
        dataSuspensao: null
      };

    if (this.isEditando && (this.acessoEditando.status === null || this.acessoEditando.status === undefined)) {
      this.acessoEditando.status = StatusUsuarioEnum.Ativo;
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);

    if (this.isEditando && acesso.fotoPerfil) {
      this.carregarFotoExistente(acesso.fotoPerfil);
    } else {
      this.fotoPerfilPreview = null;
      this.arquivoSelecionado = null;
    }

    if (this.isEditando && acesso.horariosAcesso) {
      try {
        const horarios = typeof acesso.horariosAcesso === 'string'
          ? JSON.parse(acesso.horariosAcesso)
          : acesso.horariosAcesso;

        if (Array.isArray(horarios)) {
          this.carregarHorariosExistente(horarios);
        }
      } catch (e) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.ERRO_AO_PARSEAR_HORARIOS'), 3000);
      }
    }

    this.displayModal = true;
  }

  /**
   * Fecha o modal e reseta os dados do formulário
   */
  fecharModal() {
    this.displayModal = false;
    this.initializeFormData();
    this.isEditando = false;
  }

  /**
   * Decide se deve criar ou atualizar um acesso baseado no modo de edição
   */
  salvarAcesso() {

    if (!this.verificarCamposPreenchidos(true)) {
      return;
    }

    if (this.acessoEditando.status === StatusUsuarioEnum.Suspenso) {
      this.confirmarSuspensao(() => {
        this.executarSalvamento();
      });
      return;
    }

    this.executarSalvamento();
  }

  /**
   * Atualiza um acesso existente
   */
  atualizarAcesso() {

    if (!this.verificarCamposPreenchidos(false)) {
      return;
    }

    if (this.acessoEditando.status === StatusUsuarioEnum.Suspenso) {
      this.confirmarSuspensao(() => {
        this.executarAtualizacao();
      });
      return;
    }

    this.executarAtualizacao();
  }

  /**
   * Executa a atualização do acesso
   */
  private executarAtualizacao() {
    this.spinnerService.show();

    const acessoAtualizado: any = {
      id: this.acessoEditando.id,
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      idPerfil: this.acessoEditando.perfilId,
      statusUsuario: this.acessoEditando.status,
      idRespUltimaAlteracao: getUserIdFromStorage(),
      justificativaInativacao: this.acessoEditando.justificativaInativacao,
      tipoAcesso: this.acessoEditando.tipoAcesso,
      tipoPessoa: this.acessoEditando.tipoPessoa,
      telefone: this.acessoEditando.telefone,
      cpfCnpj: this.acessoEditando.cpfCnpj,
      usuario: this.acessoEditando.usuario,
      dataExpiracao: this.acessoEditando.dataExpiracao,
      observacoes: this.acessoEditando.observacoes,
      horariosAcesso: this.getHorariosAcesso(),
      fotoPerfil: this.acessoEditando.fotoPerfil,
      tipoSuspensao: this.acessoEditando.tipoSuspensao,
      dataInicioSuspensao: this.acessoEditando.dataInicioSuspensao,
      dataFimSuspensao: this.acessoEditando.dataFimSuspensao,
      motivoSuspensao: this.acessoEditando.motivoSuspensao,
      idRespSuspensao: this.acessoEditando.idRespSuspensao,
      nomeRespSuspensao: this.acessoEditando.nomeRespSuspensao,
      dataSuspensao: this.acessoEditando.dataSuspensao
    };

    if (this.acessoEditando.status !== StatusUsuarioEnum.Ativo) {
      acessoAtualizado.idRespInativacao = getUserIdFromStorage();
    }

    if (this.acessoEditando.status === StatusUsuarioEnum.Suspenso) {
      acessoAtualizado.idRespSuspensao = getUserIdFromStorage();
      acessoAtualizado.nomeRespSuspensao = null;
      acessoAtualizado.dataSuspensao = new Date();
    }

    this.acessosService.update('usuarioRoutes', this.acessoEditando.id, acessoAtualizado)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', this.translateService.instant('ACESSOS.SUCESSO'), this.translateService.instant('ACESSOS.ACESSO_ATUALIZADO_SUCESSO'), 3000);
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Executa o salvamento do acesso
   */
  private executarSalvamento() {
    this.spinnerService.show();

    const novoAcesso: any = {
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      senha: this.acessoEditando.senha,
      idRespInclusao: getUserIdFromStorage(),
      idPerfil: this.acessoEditando.perfilId,
      statusUsuario: this.acessoEditando.status,
      tipoAcesso: this.acessoEditando.tipoAcesso,
      tipoPessoa: this.acessoEditando.tipoPessoa,
      telefone: this.acessoEditando.telefone,
      cpfCnpj: this.acessoEditando.cpfCnpj,
      usuario: this.acessoEditando.usuario,
      dataExpiracao: this.acessoEditando.dataExpiracao,
      observacoes: this.acessoEditando.observacoes,
      horariosAcesso: this.getHorariosAcesso(),
      fotoPerfil: this.acessoEditando.fotoPerfil,
      tipoSuspensao: this.acessoEditando.tipoSuspensao,
      dataInicioSuspensao: this.acessoEditando.dataInicioSuspensao,
      dataFimSuspensao: this.acessoEditando.dataFimSuspensao,
      motivoSuspensao: this.acessoEditando.motivoSuspensao,
      idRespSuspensao: this.acessoEditando.idRespSuspensao,
      nomeRespSuspensao: this.acessoEditando.nomeRespSuspensao,
      dataSuspensao: this.acessoEditando.dataSuspensao
    };

    this.acessosService.post('usuarioRoutes', novoAcesso)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          messageOfReturns(this.messageService, 'success', this.translateService.instant('ACESSOS.SUCESSO'), this.translateService.instant('ACESSOS.ACESSO_CRIADO_SUCESSO'), 3000);
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
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_NOME_USUARIO'), 3000);
      valido = false;
    }

    if (this.acessoEditando.email === '') {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_EMAIL_USUARIO'), 3000);
      valido = false;
    }

    if (!editando) {
      if (this.acessoEditando.senha === '') {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_SENHA_USUARIO'), 3000);
        valido = false;
      }
    }

    if (this.acessoEditando.perfilId === null || this.acessoEditando.perfilId === undefined) {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.warn'), this.translateService.instant('ACESSOS.SELECIONE_PERFIL_USUARIO'), 3000);
      valido = false;
    }

    if (this.acessoEditando.tipoAcesso === null || this.acessoEditando.tipoAcesso === undefined) {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.SELECIONE_TIPO_ACESSO'), 3000);
      valido = false;
    }

    if (this.acessoEditando.tipoPessoa === null || this.acessoEditando.tipoPessoa === undefined) {
      messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.SELECIONE_TIPO_PESSOA'), 3000);
      valido = false;
    }

    if (this.acessoEditando.status === StatusUsuarioEnum.Suspenso) {
      if (!this.acessoEditando.motivoSuspensao || this.acessoEditando.motivoSuspensao.trim() === '') {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_MOTIVO_SUSPENSAO'), 3000);
        valido = false;
      }

      if (!this.acessoEditando.dataInicioSuspensao) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_DATA_INICIO_SUSPENSAO'), 3000);
        valido = false;
      }

      if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria && !this.acessoEditando.dataFimSuspensao) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.INFORME_DATA_FIM_SUSPENSAO'), 3000);
        valido = false;
      }

      if (this.acessoEditando.dataInicioSuspensao && this.acessoEditando.dataFimSuspensao) {
        const dataInicio = new Date(this.acessoEditando.dataInicioSuspensao);
        const dataFim = new Date(this.acessoEditando.dataFimSuspensao);
        
        if (dataInicio >= dataFim) {
          messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.DATA_FIM_MAIOR_INICIO'), 3000);
          valido = false;
        }

        if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          if (dataInicio < hoje) {
            messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.DATA_INICIO_NAO_PASSADO'), 3000);
            valido = false;
          }
        }
      }

      const userIdAtual = getUserIdFromStorage();
      if (this.isEditando && this.acessoEditando.id === userIdAtual) {
        messageOfReturns(this.messageService, 'warn', this.translateService.instant('COMMON.WARNING'), this.translateService.instant('ACESSOS.NAO_SUSPENDER_SI_MESMO'), 3000);
        valido = false;
      }
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
      if (this.filtros.status === StatusUsuarioEnum.Suspenso) {
        params.append('statusAcesso', 'suspenso');
      } else {
        params.append('statusAcesso', this.filtros.status === StatusUsuarioEnum.Ativo ? 'true' : 'false');
      }
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
          messageOfReturns(this.messageService, 'success', this.translateService.instant('ACESSOS.SUCESSO'), this.translateService.instant('ACESSOS.ACESSO_EXCLUIDO_SUCESSO'), 3000);
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
      summary: this.translateService.instant('ACESSOS.ERRO_TENTAR_REGISTRAR'),
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
      
      setTimeout(() => {
        this.carregarFotosPerfil();
      }, 100);
    } else {
      this.acessos = [];
      this.spinnerService.hide();
    }
    this.spinnerService.hide();
    this.totalRecords = response.totalCount ?? 0;
  }

  /**
   * Carrega as fotos de perfil dos usuários que não têm foto
   */
  private carregarFotosPerfil(): void {
    const usuariosSemFoto = this.acessos.filter(acesso => !acesso.fotoPerfil);
    usuariosSemFoto.forEach(acesso => {
      if (acesso.id) {
        
        this.acessosService.get('usuarioRoutes', acesso.id)
          .pipe(takeUntilDestroyed(this.destroy))
          .subscribe({
            next: (response) => {
              if (response && response.data && response.data.fotoPerfil) {
                const index = this.acessos.findIndex(a => a.id === acesso.id);
                if (index !== -1) {
                  this.acessos[index].fotoPerfil = response.data.fotoPerfil;
                  this.cdr.detectChanges();
                }
              }
            },
            error: (error) => {
              messageOfReturns(this.messageService, 'error', this.translateService.instant('ACESSOS.ERRO'), this.translateService.instant('ACESSOS.ERRO_CARREGAR_FOTO'), 3000);
            }
          });
      }
    });
  }

  /**
   * Formata os dados para exibição na tabela
   * @param data Dados brutos da API
   * @returns Dados formatados para exibição
   */
  private formatTableData(data: any[]): any[] {
    return data.map((item) => {
      const formattedItem = {
        id: item.id,
        nome: item.nome ?? 'N/A',
        email: item.email ?? 'N/A',
        perfis: item.perfil ? item.perfil.nome : 'N/A',
        statusAcesso: item.status || item.statusUsuario,
        status: item.status || item.statusUsuario,
        dataInativacao: item.dataInativacao ? formatDate(convertStringToDate(item.dataInativacao), true) : null,
        dataCriacao: item.dataInclusao ? formatDate(convertStringToDate(item.dataInclusao), true) : 'N/A',
        dataAlteracao: item.dataUltimaAlteracao ? formatDate(convertStringToDate(item.dataUltimaAlteracao), true) : 'N/A',
        nomeCriadorUsuario: item.nomeRespInclusao ?? 'N/A',
        respUltimaModificacaoUsuario: item.nomeRespUltimaAlteracao ?? 'N/A',
        justificativaInativacao: item.justificativaInativacao ?? 'N/A',
        perfilNome: item.perfilNome ?? 'N/A',
        tipoAcesso: item.tipoAcesso,
        tipoPessoa: item.tipoPessoa,
        telefone: item.telefone,
        cpfCnpj: item.cpfCnpj,
        usuario: item.usuarioLogin,
        dataExpiracao: item.dataExpiracao ? formatDate(convertStringToDate(item.dataExpiracao), true) : null,
        horariosAcesso: item.horariosAcesso ?? [],
        dataUltimoLogin: item.dataUltimoLogin ? convertStringToDate(item.dataUltimoLogin) : null,
        idPerfil: item.idPerfil,
        tipoSuspensao: item.tipoSuspensao,
        dataInicioSuspensao: item.dataInicioSuspensao ? formatDate(convertStringToDate(item.dataInicioSuspensao), false) : null,
        dataFimSuspensao: item.dataFimSuspensao ? formatDate(convertStringToDate(item.dataFimSuspensao), false) : null,
        motivoSuspensao: item.motivoSuspensao,
        idRespSuspensao: item.idRespSuspensao,
        nomeRespSuspensao: item.nomeRespSuspensao,
        dataSuspensao: item.dataSuspensao ? formatDate(convertStringToDate(item.dataSuspensao), true) : null,
        fotoPerfil: item.fotoPerfil || null
      };
      
      return formattedItem;
    });
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
      if (this.filtros.status === StatusUsuarioEnum.Suspenso) {
        queryParams.push(`StatusAcesso=suspenso`);
      } else {
        queryParams.push(`StatusAcesso=${this.filtros.status === StatusUsuarioEnum.Ativo ? 'true' : 'false'}`);
      }
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
      return this.translateService.instant('ACESSOS.FILTROS') + ' ';
    } else if (activeFiltersCount === 1) {
      return this.translateService.instant('ACESSOS.FILTRO_ATIVO');
    } else {
      return this.translateService.instant('ACESSOS.FILTROS_ATIVOS');
    }
  }

  /**
   * Retorna os filtros atualmente aplicados
   * @returns Array com os filtros ativos
   */
  public getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nome) {
      filters.push({ label: this.translateService.instant('ACESSOS.NOME'), value: this.filtros.nome });
    }

    if (this.filtros.email) {
      filters.push({ label: this.translateService.instant('ACESSOS.EMAIL'), value: this.filtros.email });
    }

    if (this.filtros.perfil) {
      const perfilSelecionado = this.perfisOptions.find(option => option.value === this.filtros.perfil);
      const valorExibicao = perfilSelecionado ? perfilSelecionado.label : this.filtros.perfil;
      filters.push({ label: this.translateService.instant('ACESSOS.PERFIL'), value: valorExibicao });
    }

    if (this.filtros.dataCriacao) {
      const data = new Date(this.filtros.dataCriacao);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;

      filters.push({ label: this.translateService.instant('ACESSOS.DATA_CRIACAO'), value: dataFormatada });
    }

    if (this.filtros.status !== null) {
      let statusLabel = '';
      if (this.filtros.status === StatusUsuarioEnum.Ativo) {
        statusLabel = this.translateService.instant('ACESSOS.ATIVO');
      } else if (this.filtros.status === StatusUsuarioEnum.Inativo) {
        statusLabel = this.translateService.instant('ACESSOS.INATIVO');
      } else if (this.filtros.status === StatusUsuarioEnum.Suspenso) {
        statusLabel = this.translateService.instant('ACESSOS.SUSPENSO');
      }
      filters.push({ label: this.translateService.instant('ACESSOS.STATUS_ACESSO'), value: statusLabel });
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
          messageOfReturns(this.messageService, 'success', this.translateService.instant('ACESSOS.SUCESSO'), this.translateService.instant('ACESSOS.DADOS_EXPORTADOS_SUCESSO'), 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', this.translateService.instant('ACESSOS.ERRO'), this.translateService.instant('ACESSOS.ERRO_EXPORTAR_EXCEL') + (err.message ?? this.translateService.instant('ACESSOS.ERRO_DESCONHECIDO')), 3000);
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Atualiza os horários de acesso no objeto de edição
   */
  public atualizarHorarios() {
    this.acessoEditando.horariosAcesso = this.getHorariosAcesso();
  }

  /**
   * Verifica se um dia específico possui horários configurados
   * @param diaValue Valor numérico do dia da semana (0-6)
   * @returns True se o dia possui horários configurados, false caso contrário
   */
  public hasHorarios(diaValue: number): boolean {
    return !!this.diasSemana.find(d => d.value === diaValue)?.horarioInicio &&
      !!this.diasSemana.find(d => d.value === diaValue)?.horarioFim;
  }

  /**
   * Formata os horários de acesso para exibição em texto
   * @param horarios Array de horários de acesso
   * @returns String formatada com os horários ou mensagem de sem restrições
   */
  public formatHorariosAcesso(horarios: HorarioAcesso[]): string {
    if (!horarios || horarios.length === 0) return this.translateService.instant('ACESSOS.SEM_RESTRICOES');

    return horarios.map(h => {
      const dia = this.diasSemana.find(d => d.value === h.diaSemana)?.label || 'Dia ' + h.diaSemana;
      return `${dia}: ${h.inicio} às ${h.fim}`;
    }).join('; ');
  }

  /**
   * Obtém os horários de acesso configurados em formato JSON
   * @returns String JSON com os horários de acesso configurados
   */
  public getHorariosAcesso(): string {
    const horarios = this.diasSemana
      .filter(dia => dia.horarioInicio && dia.horarioFim)
      .map(dia => ({
        diaSemana: dia.value,
        inicio: dia.horarioInicio,
        fim: dia.horarioFim
      }));

    return JSON.stringify(horarios);
  }

  /**
   * Carrega horários de acesso existentes para edição
   * @param horarios Array de horários de acesso existentes
   */
  public carregarHorariosExistente(horarios: HorarioAcesso[]) {
    this.diasSemana.forEach(dia => {
      dia.horarioInicio = undefined;
      dia.horarioFim = undefined;
    });

    horarios.forEach(horario => {
      const dia = this.diasSemana.find(d => d.value === horario.diaSemana);
      if (dia) {
        dia.horarioInicio = horario.inicio;
        dia.horarioFim = horario.fim;
      }
    });
  }

  /**
   * Aplica os horários de um dia modelo para todos os outros dias
   */
  public aplicarATodosOsDias() {
    const diaModelo = this.diasSemana.find(d => d.horarioInicio || d.horarioFim);

    if (diaModelo) {
      this.diasSemana.forEach(dia => {
        dia.horarioInicio = diaModelo.horarioInicio;
        dia.horarioFim = diaModelo.horarioFim;
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('COMMON.WARNING'),
        detail: this.translateService.instant('ACESSOS.CONFIGURE_PELO_MENOS_UM_DIA')
      });
    }
  }

  /**
   * Limpa todos os horários de acesso configurados
   */
  public limparTodosHorarios() {
    this.diasSemana.forEach(dia => {
      dia.horarioInicio = undefined;
      dia.horarioFim = undefined;
    });
    this.atualizarHorarios();
  }

  /**
   * Retorna a severidade visual para o tipo de acesso
   * @param tipoAcessoOptions Valor numérico do tipo de acesso
   * @returns Classe de severidade correspondente ao tipo de acesso
   */
  public getSeverityTipoAcesso(tipoAcessoOptions: number): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | 'help' {
    switch (tipoAcessoOptions) {
      case 0:
        return 'success';
      case 1:
        return 'help';
      case 2:
        return 'info';
      default:
        return 'success';
    }
  }

  /**
   * Obtém o texto descritivo do tipo de acesso
   * @param tipo Enum do tipo de acesso
   * @returns Texto descritivo do tipo de acesso
   */
  public getTipoAcesso(tipo: TipoAcessoEnum): string {
    return getTipoAcessoText(tipo);
  }

  /**
   * Trata a seleção de arquivo de imagem para foto de perfil
   * @param event Evento de seleção de arquivo
   */
  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.isValidImageFile(file)) {
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('COMMON.ERRO'),
          detail: this.translateService.instant('ACESSOS.ARQUIVO_NAO_SUPORTADO')
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('COMMON.ERRO'),
          detail: this.translateService.instant('ACESSOS.ARQUIVO_MUITO_GRANDE')
        });
        return;
      }

      this.arquivoSelecionado = file;
      this.abrirEditorFoto(file);
    }
  }

  /**
   * Abre o editor de foto para uma nova imagem selecionada
   * @param file Arquivo de imagem selecionado
   */
  public abrirEditorFoto(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagemOriginal = e.target.result;
      this.imagemEditada = e.target.result;
      this.resetarTransformacoes();
      this.displayFotoEditor = true;

      setTimeout(() => {
        if (this.canvasEditor) {
          this.inicializarCanvas();
        } else {
          setTimeout(() => {
            this.inicializarCanvas();
          }, 200);
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Abre o editor de foto para uma imagem existente
   */
  public abrirEditorFotoExistente(): void {
    if (this.fotoPerfilPreview) {
      this.imagemOriginal = this.fotoPerfilPreview;
      this.imagemEditada = this.fotoPerfilPreview;
      this.resetarTransformacoes();
      this.displayFotoEditor = true;

      setTimeout(() => {
        if (this.canvasEditor) {
          this.inicializarCanvas();
        } else {
          setTimeout(() => {
            this.inicializarCanvas();
          }, 200);
        }
      }, 100);
    }
  }

  /**
   * Reseta todas as transformações da imagem para valores padrão
   */
  private resetarTransformacoes(): void {
    this.escala = 1;
    this.posicaoX = 0;
    this.posicaoY = 0;
    this.rotacao = 0;
  }

  /**
   * Inicializa o canvas para edição de imagem
   */
  private inicializarCanvas(): void {
    if (this.canvasEditor && this.imagemOriginal) {
      const canvas = this.canvasEditor.nativeElement;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;

        this.resetarTransformacoes();
        this.renderizarImagem();
      };

      img.src = this.imagemOriginal;
    }
  }

  /**
   * Renderiza a imagem no canvas com as transformações aplicadas
   */
  public renderizarImagem(): void {
    if (this.canvasEditor && this.imagemOriginal) {
      const canvas = this.canvasEditor.nativeElement;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((this.rotacao * Math.PI) / 180);
        ctx.scale(this.escala, this.escala);

        const imgWidth = img.width * this.escala;
        const imgHeight = img.height * this.escala;

        ctx.drawImage(img, -imgWidth / 2 + this.posicaoX, -imgHeight / 2 + this.posicaoY, imgWidth, imgHeight);
        ctx.restore();
      };

      img.src = this.imagemOriginal;
    }
  }

  /**
   * Salva a foto editada e atualiza o preview
   */
  public salvarFotoEditada(): void {
    if (this.canvasEditor && this.imagemOriginal) {
      const canvas = this.canvasEditor.nativeElement;

      const imagemEditada = canvas.toDataURL('image/jpeg', 0.9);

      this.fotoPerfilPreview = imagemEditada;
      this.acessoEditando.fotoPerfil = imagemEditada;

      this.displayFotoEditor = false;

      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('COMMON.SUCESSO'),
        detail: this.translateService.instant('ACESSOS.FOTO_EDITADA_SUCESSO')
      });
    }
  }

  /**
   * Aplica zoom na imagem (ampliar ou reduzir)
   * @param direcao Direção do zoom ('in' para ampliar, 'out' para reduzir)
   */
  public aplicarZoom(direcao: 'in' | 'out'): void {
    if (direcao === 'in') {
      this.escala = Math.min(this.escala * 1.2, 3);
    } else {
      this.escala = Math.max(this.escala / 1.2, 0.3);
    }
    this.renderizarImagem();
  }

  /**
   * Rotaciona a imagem no editor
   * @param direcao Direção da rotação ('left' para esquerda, 'right' para direita)
   */
  public rotacionarImagem(direcao: 'left' | 'right'): void {
    if (direcao === 'left') {
      this.rotacao -= 90;
    } else {
      this.rotacao += 90;
    }
    this.renderizarImagem();
  }

  /**
   * Cancela a edição da foto e fecha o editor
   */
  public cancelarEdicao(): void {
    this.displayFotoEditor = false;
    this.imagemOriginal = null;
    this.imagemEditada = null;
    this.resetarTransformacoes();
  }

  /**
   * Reseta todas as transformações aplicadas na imagem
   */
  public resetarEdicao(): void {
    this.escala = 1;
    this.posicaoX = 0;
    this.posicaoY = 0;
    this.rotacao = 0;
    this.renderizarImagem();
  }

  /**
   * Ajusta o tamanho da área de corte da imagem
   */
  public ajustarTamanhoCorte(): void {
    this.cropX = (400 - this.cropSize) / 2;
    this.cropY = (400 - this.cropSize) / 2;

    this.renderizarImagem();
  }

  /**
   * Valida se o arquivo selecionado é uma imagem suportada
   * @param file Arquivo a ser validado
   * @returns True se o arquivo é uma imagem válida, false caso contrário
   */
  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Remove a foto de perfil selecionada
   */
  public removerFoto(): void {
    this.fotoPerfilPreview = null;
    this.arquivoSelecionado = null;
    this.acessoEditando.fotoPerfil = null;

    const fileInput = document.getElementById('fotoPerfil') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Carrega uma foto de perfil existente para edição
   * @param fotoPerfil String base64 da foto de perfil
   */
  public carregarFotoExistente(fotoPerfil: string): void {
    console.log('carregarFotoExistente chamado com:', fotoPerfil ? 'foto válida' : 'foto inválida');
    
    if (fotoPerfil && fotoPerfil !== 'null' && fotoPerfil !== 'undefined') {
      console.log('Definindo fotoPerfilPreview e acessoEditando.fotoPerfil');
      this.fotoPerfilPreview = fotoPerfil;
      this.acessoEditando.fotoPerfil = fotoPerfil;
      
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    } else {
      console.log('Foto inválida, limpando preview');
      this.fotoPerfilPreview = null;
      this.acessoEditando.fotoPerfil = null;
    }
  }

  /**
   * Trata mudança de status
   * @method
   * @public
   */
  onStatusChange() {
    if (this.acessoEditando.status !== StatusUsuarioEnum.Inativo) {
      this.acessoEditando.justificativaInativacao = '';
    }
  
    if (this.acessoEditando.status !== StatusUsuarioEnum.Suspenso) {
      this.acessoEditando.tipoSuspensao = TipoSuspensaoEnum.Temporaria;
      this.acessoEditando.dataInicioSuspensao = null;
      this.acessoEditando.dataFimSuspensao = null;
      this.acessoEditando.motivoSuspensao = '';
      this.acessoEditando.idRespSuspensao = null;
      this.acessoEditando.nomeRespSuspensao = null;
      this.acessoEditando.dataSuspensao = null;
    } else {
      this.acessoEditando.dataInicioSuspensao = new Date();
      
      if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria) {
        const dataFim = new Date();
        dataFim.setDate(dataFim.getDate() + 30);
        this.acessoEditando.dataFimSuspensao = dataFim;
      }
    }
  }

  /**
   * Trata mudança de tipo de suspensão
   * @method
   * @public
   */
  onTipoSuspensaoChange() {
    if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Permanente) {
      this.acessoEditando.dataFimSuspensao = null;
    }
    
    if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria && !this.acessoEditando.dataFimSuspensao) {
      if (this.acessoEditando.dataInicioSuspensao) {
        const dataInicio = new Date(this.acessoEditando.dataInicioSuspensao);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + 30);
        this.acessoEditando.dataFimSuspensao = dataFim;
      } else {
        const hoje = new Date();
        const dataFim = new Date(hoje);
        dataFim.setDate(dataFim.getDate() + 30);
        this.acessoEditando.dataFimSuspensao = dataFim;
      }
    }
  }

  /**
   * Obtém o texto traduzido do status do acesso
   * @param status Status do acesso
   * @returns Texto traduzido do status
   */
  public getStatusText(status: StatusUsuarioEnum): string {
    switch (status) {
      case StatusUsuarioEnum.Ativo:
        return this.translateService.instant('ACESSOS.ATIVO');
      case StatusUsuarioEnum.Inativo:
        return this.translateService.instant('ACESSOS.INATIVO');
      case StatusUsuarioEnum.Suspenso:
        return this.translateService.instant('ACESSOS.SUSPENSO');
      default:
        return this.translateService.instant('ACESSOS.INATIVO');
    }
  }

  /**
   * Obtém a severidade (cor) do status do acesso para o componente p-tag
   * @param status Status do acesso
   * @returns Severidade do status (success, danger, warning)
   */
  public getStatusSeverity(status: StatusUsuarioEnum): 'success' | 'danger' | 'warning' {
    switch (status) {
      case StatusUsuarioEnum.Ativo:
        return 'success';
      case StatusUsuarioEnum.Inativo:
        return 'danger';
      case StatusUsuarioEnum.Suspenso:
        return 'warning';
      default:
        return 'danger';
    }
  }

  /**
   * Obtém o texto traduzido do tipo de acesso
   * @param tipoAcesso Tipo de acesso (valor numérico)
   * @returns Texto traduzido do tipo de acesso
   */
  public getTipoAcessoText(tipoAcesso: number): string {
    switch (tipoAcesso) {
      case 0:
        return this.translateService.instant('ACESSOS.TIPO_ACESSO_INTERNO');
      case 1:
        return this.translateService.instant('ACESSOS.TIPO_ACESSO_EXTERNO');
      case 2:
        return this.translateService.instant('ACESSOS.TIPO_ACESSO_SISTEMA');
      default:
        return this.translateService.instant('ACESSOS.TIPO_ACESSO_INTERNO');
    }
  }

  /**
   * Mostra confirmação para suspensão de usuário
   */
  private confirmarSuspensao(callback: () => void) {
    const mensagem = this.obterMensagemConfirmacaoSuspensao();
    
    const acceptLabel = this.translateService.instant('COMMON.CONFIRM');
    const rejectLabel = this.translateService.instant('COMMON.CANCEL');
    const header = this.translateService.instant('ACESSOS.CONFIRMAR_SUSPENSAO');
    
    this.confirmationService.confirm({
      message: mensagem,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: acceptLabel,
      rejectLabel: rejectLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        callback();
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.translateService.instant('ACESSOS.OPERACAO_CANCELADA'),
          detail: this.translateService.instant('ACESSOS.SUSPENSAO_CANCELADA'),
          life: 3000
        });
      }
    });
  }

  /**
   * Obtém a mensagem de confirmação baseada no tipo de suspensão
   */
  private obterMensagemConfirmacaoSuspensao(): string {
    const nomeUsuario = this.acessoEditando.nome;
    
    if (this.acessoEditando.tipoSuspensao === TipoSuspensaoEnum.Temporaria) {
      const dataFim = this.acessoEditando.dataFimSuspensao;
      if (dataFim) {
        const dataFormatada = formatDate(dataFim, false);
        return this.translateService.instant('ACESSOS.CONFIRMAR_SUSPENSAO_TEMPORARIA', {
          nome: nomeUsuario,
          data: dataFormatada
        });
      }
    }
    
    return this.translateService.instant('ACESSOS.CONFIRMAR_SUSPENSAO_PERMANENTE', {
      nome: nomeUsuario
    });
  }

  /**
   * Obtém o nível de sensibilidade de um campo específico
   */
  public getFieldSensitiveLevel(fieldName: string): SensitiveDataLevel {
    return this.sensitiveDataService.getFieldLevel(fieldName);
  }

  /**
   * Abre o modal de configuração de colunas
   */
  openColumnConfigModal(): void {
    if (!this.columns || this.columns.length === 0) {
      console.warn('AcessosComponent: Nenhuma coluna disponível para configuração');
      return;
    }
    
    this.showColumnConfigModal = true;
  }

  /**
   * Fecha o modal de configuração de colunas
   */
  closeColumnConfigModal(): void {
    this.showColumnConfigModal = false;
  }

  /**
   * Manipula mudanças nas colunas
   */
  onColumnsChanged(columns: any[]): void {
    this.columns = [...columns];
    this.updateVisibleColumns();
    
    this.saveColumnPreferences();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }
}