import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUploadEvent } from 'primeng/fileupload';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { statusHistoricoProdutoOptions } from '../../../../shared/models/options/statusHistoricoProduto.options';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatCurrency, getSeverity } from '../../../../shared/util/util';

interface HistoricoContrato {
  tipo: string | null;
  data: Date | null;
  descricao: string;
  responsavel: string;
}

interface Additive {
  number: string;
  date: Date;
  description: string;
  value: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved';
}

interface Contract {
  additives: Additive[];
}


@Component({
  selector: 'app-gestao-contratos',
  templateUrl: './gestao-contratos.component.html',
  styleUrl: './gestao-contratos.component.scss'
})
export class GestaoContratosComponent {
  uploadedFiles: any[] = [];
  dataProducao: Date;
  dataExpedicao: Date;
  nenhumAcordo: boolean = false;
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
  public statusOptions = statusHistoricoProdutoOptions;
  public displayModal: boolean = false;
  public perfisOptions: any[] = [];
  public mostrarSenha: boolean = false;
  
  // Propriedades para aprovação/reprovação
  public displayModalAprovacao: boolean = false;
  public displayModalHistorico: boolean = false;
  public contratoSelecionado: any = null;
  public observacaoAprovacao: string = '';
  public acaoSelecionada: 'aprovar' | 'reprovar' | null = null;
  public historicoAprovacao: any[] = [];
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  contract: Contract = {
    additives: []
  };

  constructor() {
    this.dataProducao = new Date();
    this.dataExpedicao = new Date();
  }

  public acessoEditando: any = {
    nome: '',
    email: '',
    perfilId: null,
    status: 'Ativo'
  };

  public filtros = {
    codigoContrato: '',
    tipoContrato: null,
    valorContrato: null,
    dataInicio: null,
    dataFim: null,
    statusTeste: null
  };

  /**
   * Inicializa o componente carregando os perfis e dados da tabela
   */
  ngOnInit(): void {
    this.loadPerfis();
    this.loadTestData();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Exibe o modal para edição ou criação de um acesso
   * @param acesso Dados do acesso a ser editado (opcional)
   */
  showDialog(acesso?: any) {
    this.isEditando = !!acesso;
    this.modalTitle = this.isEditando ? 'Editar Contrato' : 'Incluir Contrato';

    this.acessoEditando = this.isEditando
      ? {
        id: acesso.id,
        nome: acesso.nome,
        email: acesso.email,
        perfilId: acesso.perfil?.id ?? acesso.perfilId,
        status: acesso.statusAcesso,
        justificativaInativacao: acesso.justificativaInativacao
      }
      : {
        nome: '',
        email: '',
        senha: '@PortalVMI' + new Date().getFullYear(),
        perfilId: null,
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
      perfilId: null,
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
    this.spinnerService.show();

    const novoAcesso = {
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      senha: this.acessoEditando.senha,
      idRespInclusao: getUserIdFromStorage(),
      Perfil_id: this.acessoEditando.perfilId,
      statusUsuario: this.acessoEditando.status
    };

    this.acessosService.post('usuarioRoutes', novoAcesso)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Acesso criado com sucesso!',
            life: 3000
          });
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
    this.spinnerService.show();

    const acessoAtualizado: any = {
      id: this.acessoEditando.id,
      nome: this.acessoEditando.nome,
      email: this.acessoEditando.email,
      perfil_id: this.acessoEditando.perfilId,
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
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Acesso atualizado com sucesso!',
            life: 3000
          });
          this.fecharModal();
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
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
   * Exibe confirmação para exclusão de um acesso
   * @param acesso Dados do acesso a ser excluído
   */
  confirmarExclusao(acesso: any) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir o usuário "' + acesso.nome + '"?',
      header: 'Confirmação',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.excluirAcesso(acesso);
      },
      reject: () => {
      }
    });
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

    if (this.filtros.codigoContrato) {
      params.append('codigoContrato', this.filtros.codigoContrato);
    }

    if (this.filtros.tipoContrato) {
      params.append('tipoContrato', this.filtros.tipoContrato);
    }

    if (this.filtros.dataInicio) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataInicio);
      params.append('dataInicio', dataFormatada);
    }

    if (this.filtros.dataFim) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataFim);
      params.append('dataFim', dataFormatada);
    }

    if (this.filtros.statusTeste !== null) {
      params.append('statusTeste', String(this.filtros.statusTeste));
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
    this.acessosService.delete('acessoRoutes', acesso.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Acesso excluído com sucesso' });
        },
        error: (err) => this.handleError(err)
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

    if (this.filtros.codigoContrato) {
      queryParams.push(`CodigoContrato=${this.filtros.codigoContrato}`);
    }

    if (this.filtros.tipoContrato) {
      queryParams.push(`TipoContrato=${this.filtros.tipoContrato}`);
    }

    if (this.filtros.valorContrato) {
      queryParams.push(`ValorContrato=${this.filtros.valorContrato}`);
    }

    if (this.filtros.dataInicio) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataInicio);
      queryParams.push(`DataInicio=${dataFormatada}`);
    }

    if (this.filtros.dataFim) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataFim);
      queryParams.push(`DataFim=${dataFormatada}`);
    }

    if (this.filtros.statusTeste !== null) {
      queryParams.push(`StatusTeste=${this.filtros.statusTeste}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  /**
   * Limpa todos os filtros aplicados
   */
  public limparFiltros() {
    this.filtros = {
      codigoContrato: '',
      tipoContrato: null,
      valorContrato: null,
      dataInicio: null,
      dataFim: null,
      statusTeste: null,
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

    if (this.filtros.codigoContrato) {
      filters.push({ label: 'Código Contrato', value: this.filtros.codigoContrato });
    }

    if (this.filtros.tipoContrato) {
      filters.push({ label: 'Tipo Contrato', value: this.filtros.tipoContrato });
    }

    if (this.filtros.valorContrato) {
      filters.push({
        label: 'Valor Contrato',
        value: formatCurrency(this.filtros.valorContrato)
      });
    }

    if (this.filtros.dataInicio) {
      filters.push({ label: 'Data de Início', value: formatarDataParaDDMMYYYY(this.filtros.dataInicio) });
    }

    if (this.filtros.dataFim) {
      filters.push({ label: 'Data de Término', value: formatarDataParaDDMMYYYY(this.filtros.dataFim) });
    }

    if (this.filtros.statusTeste !== null) {
      filters.push({ label: 'Situação Teste', value: this.filtros.statusTeste ? 'Ativo' : 'Inativo' });
    }

    return filters;
  }

  onValorContratoChange() {
    this.changeDetectorRef.detectChanges();
  }

  onUpload(event: FileUploadEvent) {
    this.uploadedFiles = event.files;
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  // Adicione estes métodos à classe
  adicionarClausula() {
    this.contrato.clausulas.push({
      titulo: '',
      descricao: '',
      tipo: '',
      obrigatoria: false
    });
  }

  editarClausula(clausula: any) {
    // Implemente a lógica de edição aqui
    console.log('Editar cláusula:', clausula);
  }

  removerClausula(index: number) {
    this.contrato.clausulas.splice(index, 1);
  }

  registrarOcorrencia() {
  }

  public contrato: any = {
    clausulas: [
      {
        titulo: 'Confidencialidade',
        descricao: 'As partes concordam em manter em sigilo todas as informações confidenciais.',
        tipo: 'Obrigatória',
        obrigatoria: true
      },
      {
        titulo: 'Prazo de Contrato',
        descricao: 'Este contrato terá validade de 12 meses a partir da data de assinatura.',
        tipo: 'Obrigatória',
        obrigatoria: true
      }
    ],
    multaRescisao: 5000,
    condicoesRescisao: 'Rescisão antecipada sujeita a multa de 30% do valor restante do contrato.',
    renovacaoAutomatica: true,
    prazoRenovacao: 30,
    notificacaoRenovacao: 15
  };

  public historicoContrato: HistoricoContrato[] = [
    {
      tipo: 'Criação',
      data: new Date(2024, 5, 1, 10, 30),
      descricao: 'Contrato criado pelo sistema com todas as informações básicas preenchidas.',
      responsavel: 'Sistema'
    },
    {
      tipo: 'Revisão',
      data: new Date(2024, 5, 3, 14, 15),
      descricao: 'Revisão das cláusulas contratuais pelo departamento jurídico. Validação de conformidade legal.',
      responsavel: 'João Silva'
    },
    {
      tipo: 'Aprovação',
      data: new Date(2024, 5, 5, 9, 0),
      descricao: 'Contrato aprovado pelo gestor responsável após análise completa dos termos.',
      responsavel: 'Maria Oliveira'
    },
    {
      tipo: 'Reprovação',
      data: new Date(2024, 5, 7, 16, 45),
      descricao: 'Contrato reprovado devido a inconsistências nos valores apresentados.',
      responsavel: 'Carlos Mendes'
    },
    {
      tipo: 'Revisão',
      data: new Date(2024, 5, 10, 11, 20),
      descricao: 'Revisão dos valores e ajuste das cláusulas financeiras conforme solicitado.',
      responsavel: 'Ana Costa'
    },
    {
      tipo: 'Aprovação',
      data: new Date(2024, 5, 12, 15, 30),
      descricao: 'Contrato aprovado após correções realizadas. Todas as observações foram atendidas.',
      responsavel: 'Pedro Santos'
    }
  ];

  loadTestData(): void {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(today.getMonth() + 2);

    this.contract.additives = [
      {
        number: '001/2023',
        date: new Date(2023, 5, 15),
        description: 'Prorrogação de prazo',
        value: 0,
        startDate: today,
        endDate: nextMonth,
        status: 'approved'
      },
      {
        number: '002/2023',
        date: new Date(2023, 6, 1),
        description: 'Acréscimo de valor',
        value: 15000.50,
        startDate: nextMonth,
        endDate: twoMonthsLater,
        status: 'pending'
      },
      {
        number: '003/2023',
        date: new Date(2023, 6, 10),
        description: 'Inclusão de serviço adicional',
        value: 8500.75,
        startDate: nextMonth,
        endDate: twoMonthsLater,
        status: 'pending'
      }
    ];
  }

  addAdditive(): void {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const newAdditive: Additive = {
      number: this.generateNextAdditiveNumber(),
      date: today,
      description: 'Novo aditivo',
      value: 0,
      startDate: today,
      endDate: nextMonth,
      status: 'pending'
    };

    this.contract.additives = [...this.contract.additives, newAdditive];
  }

  removeAdditive(index: number): void {
    this.contract.additives = this.contract.additives.filter((_, i) => i !== index);
  }

  private generateNextAdditiveNumber(): string {
    const lastNumber = this.contract.additives.length > 0
      ? parseInt(this.contract.additives[this.contract.additives.length - 1].number.split('/')[0])
      : 0;

    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    const currentYear = new Date().getFullYear();

    return `${nextNumber}/${currentYear}`;
  }

  // Métodos para aprovação/reprovação
  aprovarContrato(contrato: any): void {
    this.contratoSelecionado = { ...contrato };
    this.acaoSelecionada = 'aprovar';
    this.observacaoAprovacao = '';
    this.displayModalAprovacao = true;
  }

  reprovarContrato(contrato: any): void {
    this.contratoSelecionado = { ...contrato };
    this.acaoSelecionada = 'reprovar';
    this.observacaoAprovacao = '';
    this.displayModalAprovacao = true;
  }

  visualizarHistorico(contrato: any): void {
    this.contratoSelecionado = { ...contrato };
    this.carregarHistorico(contrato.id || contrato.nome);
    this.displayModalHistorico = true;
  }

  /**
   * Carrega histórico de aprovação
   */
  private carregarHistorico(contratoId: string): void {
    this.spinnerService.show();
    
    // Simular carregamento do histórico
    setTimeout(() => {
      this.historicoAprovacao = [
        {
          acao: 'CRIACAO',
          dataAcao: new Date(),
          responsavelNome: 'Sistema',
          observacao: 'Contrato criado',
          statusAnterior: null,
          statusNovo: 'RASCUNHO'
        },
        {
          acao: 'ENVIAR_APROVACAO',
          dataAcao: new Date(),
          responsavelNome: 'João Silva',
          observacao: 'Enviado para aprovação',
          statusAnterior: 'RASCUNHO',
          statusNovo: 'EM_ANALISE'
        }
      ];
      this.spinnerService.hide();
    }, 500);
  }

  /**
   * Adiciona evento ao histórico de aprovação
   */
  private adicionarEventoHistorico(acao: string, observacao: string): void {
    const novoEvento = {
      acao: acao,
      dataAcao: new Date(),
      responsavelNome: 'Usuário Atual',
      observacao: observacao,
      statusAnterior: this.contratoSelecionado?.status,
      statusNovo: acao === 'APROVAR' ? 'APROVADO' : 'REPROVADO'
    };
    
    this.historicoAprovacao.unshift(novoEvento);
  }

  executarAcao(): void {
    if (!this.contratoSelecionado || !this.acaoSelecionada) return;

    // Validar se observação é obrigatória para reprovação
    if (this.acaoSelecionada === 'reprovar' && !this.observacaoAprovacao.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Observação é obrigatória para reprovação',
        life: 3000
      });
      return;
    }

    this.spinnerService.show();

    // Simular chamada da API
    setTimeout(() => {
      this.spinnerService.hide();
      
      const acao = this.acaoSelecionada === 'aprovar' ? 'aprovado' : 'reprovado';
      const novoStatus = this.acaoSelecionada === 'aprovar' ? 'APROVADO' : 'REPROVADO';
      
      // Atualizar status do contrato selecionado
      if (this.contratoSelecionado) {
        this.contratoSelecionado.status = novoStatus;
      }
      
      // Adicionar evento ao histórico
      this.adicionarEventoHistorico(
        this.acaoSelecionada === 'aprovar' ? 'APROVAR' : 'REPROVAR',
        this.observacaoAprovacao || 'Sem observação'
      );
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Contrato ${acao} com sucesso!`,
        life: 3000
      });

      this.fecharModalAprovacao();
      
      // Recarregar dados da tabela
      this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
    }, 1000);
  }

  cancelarAcao(): void {
    this.fecharModalAprovacao();
  }

  /**
   * Fecha modal de aprovação
   */
  public fecharModalAprovacao(): void {
    this.displayModalAprovacao = false;
    this.contratoSelecionado = null;
    this.acaoSelecionada = null;
    this.observacaoAprovacao = '';
  }

  fecharHistorico(): void {
    this.displayModalHistorico = false;
    this.contratoSelecionado = null;
    this.historicoAprovacao = [];
  }

  podeAprovar(contrato: any): boolean {
    return contrato.status === 'PENDENTE_APROVACAO' || contrato.status === 'EM_ANALISE';
  }

  podeReprovar(contrato: any): boolean {
    return contrato.status === 'PENDENTE_APROVACAO' || contrato.status === 'EM_ANALISE';
  }

  podeVisualizarHistorico(contrato: any): boolean {
    return true; // Sempre pode visualizar histórico
  }

  /**
   * Retorna a classe CSS baseada no tipo de evento do histórico
   * @param tipo Tipo do evento
   * @returns Classe CSS correspondente
   */
  getTimelineEventClass(tipo: string | null): string {
    if (!tipo) return '';
    
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('criação') || tipoLower.includes('criacao') || tipoLower.includes('criado')) {
      return 'timeline-event-criacao';
    } else if (tipoLower.includes('revisão') || tipoLower.includes('revisao') || tipoLower.includes('revisar')) {
      return 'timeline-event-revisao';
    } else if (tipoLower.includes('aprovação') || tipoLower.includes('aprovacao') || tipoLower.includes('aprovado')) {
      return 'timeline-event-aprovacao';
    } else if (tipoLower.includes('reprovação') || tipoLower.includes('reprovacao') || tipoLower.includes('reprovado')) {
      return 'timeline-event-reprovacao';
    }
    
    return '';
  }

  /**
   * Retorna o ícone apropriado para cada tipo de evento
   * @param tipo Tipo do evento
   * @returns Classe do ícone
   */
  getTimelineIcon(tipo: string | null): string {
    if (!tipo) return 'pi pi-question-circle';
    
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('criação') || tipoLower.includes('criacao') || tipoLower.includes('criado')) {
      return 'pi pi-file-edit';
    } else if (tipoLower.includes('revisão') || tipoLower.includes('revisao') || tipoLower.includes('revisar')) {
      return 'pi pi-search';
    } else if (tipoLower.includes('aprovação') || tipoLower.includes('aprovacao') || tipoLower.includes('aprovado')) {
      return 'pi pi-check-circle';
    } else if (tipoLower.includes('reprovação') || tipoLower.includes('reprovacao') || tipoLower.includes('reprovado')) {
      return 'pi pi-times-circle';
    }
    
    return 'pi pi-info-circle';
  }

  /**
   * Retorna o role do usuário baseado no nome
   * @param responsavel Nome do responsável
   * @returns Role do usuário
   */
  getUserRole(responsavel: string): string {
    const roles: { [key: string]: string } = {
      'Sistema': 'Sistema Automático',
      'João Silva': 'Analista Jurídico',
      'Maria Oliveira': 'Gerente de Contratos',
      'Carlos Mendes': 'Diretor Financeiro',
      'Ana Costa': 'Analista de Contratos',
      'Pedro Santos': 'Gerente Geral'
    };
    
    return roles[responsavel] || 'Usuário';
  }

  /**
   * Retorna a classe do badge de status
   * @param tipo Tipo do evento
   * @returns Classe do badge
   */
  getStatusBadgeClass(tipo: string | null): string {
    if (!tipo) return 'status-badge-default';
    
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('criação') || tipoLower.includes('criacao') || tipoLower.includes('criado')) {
      return 'status-badge-criacao';
    } else if (tipoLower.includes('revisão') || tipoLower.includes('revisao') || tipoLower.includes('revisar')) {
      return 'status-badge-revisao';
    } else if (tipoLower.includes('aprovação') || tipoLower.includes('aprovacao') || tipoLower.includes('aprovado')) {
      return 'status-badge-aprovacao';
    } else if (tipoLower.includes('reprovação') || tipoLower.includes('reprovacao') || tipoLower.includes('reprovado')) {
      return 'status-badge-reprovacao';
    }
    
    return 'status-badge-default';
  }



  /**
   * Retorna o número de eventos aprovados
   */
  getAprovadosCount(): number {
    return this.historicoContrato.filter(h => 
      h.tipo?.toLowerCase().includes('aprovacao') || 
      h.tipo?.toLowerCase().includes('aprovado')
    ).length;
  }

  /**
   * Retorna o número de eventos reprovados
   */
  getReprovadosCount(): number {
    return this.historicoContrato.filter(h => 
      h.tipo?.toLowerCase().includes('reprovacao') || 
      h.tipo?.toLowerCase().includes('reprovado')
    ).length;
  }

  /**
   * Formata data
   */
  public formatDate(date: Date): string {
    return formatarDataParaDDMMYYYY(date);
  }

  /**
   * Formata valor monetário
   */
  public formatCurrency(value: number): string {
    return formatCurrency(value);
  }

  /**
   * Obtém label do status
   */
  public getStatusLabel(status: string): string {
    switch (status) {
      case 'RASCUNHO':
        return 'Rascunho';
      case 'EM_ANALISE':
        return 'Em Análise';
      case 'APROVADO':
        return 'Aprovado';
      case 'REPROVADO':
        return 'Reprovado';
      case 'EM_VIGOR':
        return 'Em Vigor';
      case 'ENCERRADO':
        return 'Encerrado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  /**
   * Obtém label da ação
   */
  public getAcaoLabel(acao: string): string {
    switch (acao) {
      case 'CRIACAO':
        return 'Criação';
      case 'ENVIAR_APROVACAO':
        return 'Enviado para Aprovação';
      case 'APROVAR':
        return 'Aprovado';
      case 'REPROVAR':
        return 'Reprovado';
      case 'ATIVAR':
        return 'Ativado';
      case 'ENCERRAR':
        return 'Encerrado';
      case 'CANCELAR':
        return 'Cancelado';
      case 'CORRIGIR':
        return 'Corrigido';
      default:
        return acao;
    }
  }
}