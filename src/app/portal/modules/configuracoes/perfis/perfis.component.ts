import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { PerfilModel } from '../../../../shared/models/perfil.model';
import { AcessoPerfil } from '../../../../shared/models/AcessoPerfil.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { getAccessLabel, getSeverity } from '../../../../shared/util/util';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';

@Component({
  selector: 'app-perfis',
  templateUrl: './perfis.component.html',
  styleUrl: './perfis.component.scss'
})
export class PerfisComponent {

  public perfis: any[] = [];
  public customQueryParams?: string;
  public queryFilterParams?: Map<string, string>;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public displayModal: boolean = false;
  public isEditando: boolean = false;
  public modalTitle: string = '';
  public tblLazyLoading: boolean = false;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;

  public perfilEditando: any = {
    nome: '',
    descricao: '',
    status: 'Ativo'
  };

  public filtros = {
    nome: '',
    status: null
  };

  public statusOptions = inativoAtivoOptions;
  public sourcePerfis: AcessoPerfil[] = [];
  public targetPerfis: AcessoPerfil[] = [];
  public filterFormValues: { [field: string]: any } = {};
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
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
    this.changeDetectorRef.detectChanges();
  }

  private handleComplete() {
    this.spinnerService.hide();
  }

  private handleError(err: Result<PerfilModel>) {
    this.spinnerService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Erro ao tentar registrar esta ação!',
      detail: err.error?.message,
      life: 3000
    });
  }

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

  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      nome: item.nome ?? 'N/A',
      descricao: item.descricao ?? 'N/A',
      status: item.statusPerfil,
      statusPerfil: item.statusPerfil,
      dataInclusao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " ás " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeRespInclusao: item.nomeRespInclusao ?? 'N/A',
      dataUltimaModificacao: item.dataUltimaModificacao ? new Date(item.dataUltimaModificacao).toLocaleDateString('pt-BR') + " ás " + new Date(item.dataUltimaModificacao).toLocaleTimeString('pt-BR') : 'N/A',
      nomeRespUltimaModificacao: item.nomeRespUltimaModificacao ?? 'N/A',
      justificativaInativacao: item.justificativaInativacao ?? 'N/A'
    }));
  }

  showDialog(perfil?: any) {
    this.isEditando = !!perfil;
    this.modalTitle = this.isEditando ? 'Editar Perfil' : 'Incluir Perfil';

    this.perfilEditando = this.isEditando
      ? {
        id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        status: perfil.statusPerfil,
        justificativaInativacao: perfil.justificativaInativacao
      }
      : {
        nome: '',
        descricao: '',
        status: true,
        justificativaInativacao: ''
      };

    if (this.isEditando) {
      this.loadPerfilData(perfil.id);
    } else {
      this.loadAllAcessos();
    }

    this.displayModal = true;
  }

  iniciarEdicao(perfil: any, index: number) {
    this.showDialog(perfil);
  }

  incluirPerfil() {
    const requestBody = {
      perfil: {
        nome: this.perfilEditando.nome,
        descricao: this.perfilEditando.descricao,
        statusPerfil: this.perfilEditando.status,
        IdRespInclusao: getUserIdFromStorage()
      },
      acessos: [
        ...this.sourcePerfis.map(acesso => ({
          acessoId: acesso.acessoId,
          acesso: acesso.acesso,
          rotinaId: acesso.rotinaId,
          rotina: acesso.rotina,
          moduloId: acesso.moduloId,
          modulo: acesso.modulo,
          ativo: false
        })),
        ...this.targetPerfis.map(acesso => ({
          acessoId: acesso.acessoId,
          acesso: acesso.acesso,
          rotinaId: acesso.rotinaId,
          rotina: acesso.rotina,
          moduloId: acesso.moduloId,
          modulo: acesso.modulo,
          ativo: true
        }))
      ]
    };

    this.perfilService.post('perfilRoutes', requestBody)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil criado com sucesso!',
            life: 3000
          });
          this.displayModal = false;
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
  }

  salvarAlteracaoPerfil() {
    const perfilData: any = {
      id: this.perfilEditando.id,
      nome: this.perfilEditando.nome,
      descricao: this.perfilEditando.descricao,
      statusPerfil: this.perfilEditando.status,
      justificativaInativacao: this.perfilEditando.justificativaInativacao,
      idRespUltimaModificacao: getUserIdFromStorage()
    };

    if (this.perfilEditando.status === false) {
      perfilData.idRespInativacao = getUserIdFromStorage();
    }

    const requestBody = {
      perfil: perfilData,
      acessos: [
        ...this.sourcePerfis.map(acesso => ({
            acessoId: acesso.acessoId,
            acesso: acesso.acesso,
            rotinaId: acesso.rotinaId,
            rotina: acesso.rotina,
            moduloId: acesso.moduloId,
            modulo: acesso.modulo,
            ativo: false
        })),
        ...this.targetPerfis.map(acesso => ({
            acessoId: acesso.acessoId,
            acesso: acesso.acesso,
            rotinaId: acesso.rotinaId,
            rotina: acesso.rotina,
            moduloId: acesso.moduloId,
            modulo: acesso.modulo,
            ativo: true
        }))
      ]
    };

    this.perfilService.update('perfilRoutes', this.perfilEditando.id, requestBody)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil atualizado com sucesso!',
            life: 3000
            });
          this.displayModal = false;
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => this.handleError(err)
      });
}
  confirmarExclusao(perfil: any) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir o perfil "' + perfil.nome + '"?',
      header: 'Confirmação',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.excluirPerfil(perfil);
      },
      reject: () => {
      }
    });
  }

  excluirPerfil(perfil: any) {
    this.perfilService.delete('perfilRoutes', perfil.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Perfil excluído com sucesso' 
          });
        },
        error: (err) => this.handleError(err)
      });
  }

  getAccessLabel(price: string): string {
    return getAccessLabel(price);
  }

  getSeverity(price: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return getSeverity(price);
  }

  onStatusChange() {
    if (this.perfilEditando.status !== 'Inativo') {
      this.perfilEditando.justificativaInativacao = '';
    }
  }

  filtrar() {
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

  limparFiltros() {
    this.filtros = {
      nome: '',
      status: null
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  getFiltrosHeader(): string {
    const activeFiltersCount = this.getActiveFilters().length;

    if (activeFiltersCount === 0) {
      return 'Filtros ';
    } else if (activeFiltersCount === 1) {
      return 'Filtro Ativo: ';
    } else {
      return 'Filtros Ativos: ';
    }
  }

  getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nome) {
      filters.push({ label: 'Nome', value: this.filtros.nome });
    }

    if (this.filtros.status !== null) {
      filters.push({ label: 'Status Perfil', value: this.filtros.status ? 'Ativo' : 'Inativo' });
    }
    return filters;
  }

}