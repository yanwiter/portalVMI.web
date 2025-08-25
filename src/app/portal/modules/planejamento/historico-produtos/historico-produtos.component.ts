import { Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { getSeverity } from '../../../../shared/util/util';
import { statusHistoricoProdutoOptions } from '../../../../shared/models/options/statusHistoricoProduto.options';
import { FileUploadEvent } from 'primeng/fileupload';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-historico-produtos',
  templateUrl: './historico-produtos.component.html',
  styleUrl: './historico-produtos.component.scss'
})
export class HistoricoProdutosComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  
  uploadedFiles: any[] = [];
  stream: MediaStream | null = null;
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);

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
    nomeProduto: '',
    statusProduto: null,
    dataExpedicao: null
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
    this.modalTitle = this.isEditando ? 'Editar Acesso' : 'Incluir Acesso';
    
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

    if (this.filtros.nomeProduto) {
      params.append('nomeProduto', this.filtros.nomeProduto);
    }

    if (this.filtros.dataExpedicao) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataExpedicao);
      params.append('dataExpedicao', dataFormatada);
    }

    if (this.filtros.statusProduto !== null) {
      params.append('statusProduto', String(this.filtros.statusProduto));
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

    if (this.filtros.nomeProduto) {
      queryParams.push(`NomeProduto=${this.filtros.nomeProduto}`);
    }

    if (this.filtros.dataExpedicao) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataExpedicao);
      queryParams.push(`DataExpedicao=${dataFormatada}`);
    }

    if (this.filtros.statusProduto !== null) {
      queryParams.push(`StatusProduto=${this.filtros.statusProduto}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }
  
  /**
   * Limpa todos os filtros aplicados
   */
  public limparFiltros() {
    this.filtros = {
      nomeProduto: '',
      statusProduto: null,
      dataExpedicao: null
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

    if (this.filtros.nomeProduto) {
      filters.push({ label: 'Nome Produto', value: this.filtros.nomeProduto });
    }

    if (this.filtros.dataExpedicao) {
      const data = new Date(this.filtros.dataExpedicao);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      
      filters.push({ label: 'Data de Expedição', value: dataFormatada });
    }

    if (this.filtros.statusProduto !== null) {
      filters.push({ label: 'Situação Produto', value: this.filtros.statusProduto ? 'Ativo' : 'Inativo' });
    }

    return filters;
  }

  async openCamera() {
    try {
      // Solicitar acesso à câmera
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      // Exibir o vídeo no elemento <video>
      this.videoElement.nativeElement.srcObject = this.stream;
      this.videoElement.nativeElement.style.display = 'block';
      
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }

  // Função para tirar uma foto (opcional)
  capturePhoto() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    
    return imageData;
  }

  // Não esqueça de parar a câmera quando não for mais necessária
  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  onUpload(event: FileUploadEvent) {
    this.uploadedFiles = event.files;
    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

}
