import { Component, DestroyRef, inject } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Result } from '../../../../shared/models/api/result.model';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { getSeverity } from '../../../../shared/util/util';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';

@Component({
  selector: 'app-acessos',
  templateUrl: './acessos.component.html',
  styleUrl: './acessos.component.scss'
})
export class AcessosComponent {

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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);

  public acessoEditando: any = {
    nome: '',
    email: '',
    perfilId: null,
    status: 'Ativo'
  };

  public filtros = {
    nome: '',
    status: null,
    email: '',
    perfil: null,
    dataCriacao: null
  };

  ngOnInit(): void {
    this.loadPerfis();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

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

  salvarAcesso() {
    if (this.isEditando) {
      this.atualizarAcesso();
    } else {
      this.criarAcesso();
    }
  }

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

  iniciarEdicao(acesso: UsuarioModel, index: number) {
    this.showDialog(acesso);
  }

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
        error: (err) => { this.handleError(err);
        this.tblLazyLoading = false;
      },
      complete: () => this.handleComplete(),
    });
  }

  public buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.nome) {
      params.append('nome', this.filtros.nome);
    }

    if (this.filtros.email) {
      params.append('email', this.filtros.email);
    }

    if (this.filtros.perfil) {
      params.append('perfilId', String(this.filtros.perfil));
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

  private handleError(err: Result<UsuarioModel>) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar registrar esta ação!',
      detail: err.error?.message,
      life: 3000
    });
  }

  private handleComplete() {
    this.spinnerService.hide();
  }

  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

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
  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      nome: item.nome ?? 'N/A',
      email: item.email ?? 'N/A',
      perfis: item.perfil ? item.perfil.nome : 'N/A',
      statusAcesso: item.statusUsuario,
      status: item.statusUsuario,
      dataCriacao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " ás " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      dataAlteracao: item.dataUltimaAlteracao ? new Date(item.dataUltimaAlteracao).toLocaleDateString('pt-BR') + " ás " + new Date(item.dataUltimaAlteracao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeCriadorUsuario: item.nomeRespInclusao ?? 'N/A',
      respUltimaModificacaoUsuario: item.nomeRespUltimaAlteracao ?? 'N/A',
      justificativaInativacao: item.justificativaInativacao ?? 'N/A',
      perfilNome: item.perfilNome ?? 'N/A',
    }));
  }

  public getSeverity(price: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(price);
  }
  
  public filtrar() {
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
}
