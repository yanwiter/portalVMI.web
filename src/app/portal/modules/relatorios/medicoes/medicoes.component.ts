import { Component, DestroyRef, inject } from '@angular/core';
import { statusAprovacaoOptions } from '../../../../shared/models/options/statusAprovacao.options';
import { UsuarioModel } from '../../../../shared/models/usuario.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { getSeverity } from '../../../../shared/util/util';

@Component({
  selector: 'app-medicoes',
  templateUrl: './medicoes.component.html',
  styleUrl: './medicoes.component.scss'
})
export class MedicoesComponent {

  public medicoes: UsuarioModel[] = [];
  public customQueryParams?: string;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public tblLazyLoading: boolean = false;
  public isEditando: boolean = false;
  public modalTitle: string = '';
  public statusOptions = statusAprovacaoOptions;
  public displayModal: boolean = false;
  public perfisOptions: any[] = [];
  public mostrarSenha: boolean = false;
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly acessosService = inject(GenericService<UsuarioModel>);
  private readonly destroy = inject(DestroyRef);

  public filtros = {
    responsavel: '',
    fornecedor: '',
    statusMedicao: null,
    dataMedicao: null
  };

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

    if (this.filtros.responsavel) {
      params.append('nomeResponsavel', this.filtros.responsavel);
    }

    if (this.filtros.fornecedor) {
      params.append('nomeFornecedor', this.filtros.fornecedor);
    }

    if (this.filtros.dataMedicao) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataMedicao);
      params.append('dataMedicao', dataFormatada);
    }

    if (this.filtros.statusMedicao !== null) {
      params.append('statusMedicao', String(this.filtros.statusMedicao));
    }
    return params.toString();
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
      this.medicoes = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.medicoes = [];
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
      dataCriacao: item.dataInclusao ? new Date(item.dataInclusao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataInclusao).toLocaleTimeString('pt-BR') : 'N/A',
      dataAlteracao: item.dataUltimaAlteracao ? new Date(item.dataUltimaAlteracao).toLocaleDateString('pt-BR') + " às " + new Date(item.dataUltimaAlteracao).toLocaleTimeString('pt-BR') : 'N/A',
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

    if (this.filtros.responsavel) {
      queryParams.push(`Responsavel=${this.filtros.responsavel}`);
    }

    if (this.filtros.fornecedor)
    {
      queryParams.push(`Fornecedor=${this.filtros.fornecedor}`);
    }

    if (this.filtros.dataMedicao) {
      const dataFormatada = formatarDataParaDDMMYYYY(this.filtros.dataMedicao);
      queryParams.push(`DataMedicao=${dataFormatada}`);
    }

    if (this.filtros.statusMedicao !== null) {
      queryParams.push(`StatusMedicao=${this.filtros.statusMedicao}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }
  
  public limparFiltros() {
    this.filtros = {
      responsavel: '',
      fornecedor: '',
      statusMedicao: null,
      dataMedicao: null
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

    if (this.filtros.responsavel) {
      filters.push({ label: 'Nome Responsável', value: this.filtros.responsavel });
    }

    if (this.filtros.fornecedor) {
      filters.push({ label: 'Nome Fornecedor', value: this.filtros.fornecedor });
    }

    if (this.filtros.dataMedicao) {
      const data = new Date(this.filtros.dataMedicao);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      
      filters.push({ label: 'Data Medição', value: dataFormatada });
    }

    if (this.filtros.statusMedicao !== null) {
      filters.push({ label: 'Status Medição', value: this.filtros.statusMedicao ? 'Aprovado' : 'Aguardando aprovação' });
    }

    return filters;
  }
}
