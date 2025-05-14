import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Result } from '../../../../shared/models/api/result.model';
import { PerfilModel } from '../../../../shared/models/perfil.model';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { clienteFornecedorOptions } from '../../../../shared/models/options/clienteFornecedor.options';

@Component({
  selector: 'app-clientes-fornecedores',
  templateUrl: './clientes-fornecedores.component.html',
  styleUrls: ['./clientes-fornecedores.component.scss']
})
export class ClientesFornecedoresComponent {

  public clientesFornecedores: any[] = [];
  public customQueryParams?: string;
  public queryFilterParams?: Map<string, string>;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public displayModal: boolean = false;
  public tblLazyLoading: boolean = false;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public minDate = new Date(2024, 0, 1);
  public maxDate = new Date();
  public calendarRange: Date[] = [];
  public statusOptions = inativoAtivoOptions;
  public clienteFornecedorOptions = clienteFornecedorOptions;

  private readonly messageService = inject(MessageService);
  private readonly perfilService = inject(GenericService<PerfilModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly spinnerService = inject(SpinnerService);

  public filtros = {
    nome: '',
    status: null,
    periodoContratacao: null as Date[] | Date | null,
    tipo: null
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

  private handleResponse(response: any) {
    if (response.items && Array.isArray(response.items)) {
      this.clientesFornecedores = this.formatTableData(response.items);
      this.spinnerService.hide();
    } else {
      this.clientesFornecedores = [];
      this.spinnerService.hide();
    }
    this.totalRecords = response.totalCount || 0;
    this.spinnerService.hide();
  }

  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
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

  private formatTableData(data: any[]): any[] {
    return data.map((item) => ({
      id: item.id,
      nome: item.nome || 'N/A',
      descricao: item.descricao || 'N/A',
      status: item.statusPerfil,
      statusPerfil: item.statusPerfil,
      justificativaInativacao: item.justificativaInativacao || 'N/A'
    }));
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
      status: null,
      periodoContratacao: null,
      tipo: null
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

    if (this.filtros.tipo !== null) {
      filters.push({ label: 'Tipo', value: this.filtros.tipo === 2 ? 'Fornecedor' : 'Cliente' });
    }

    if (Array.isArray(this.filtros.periodoContratacao)) {
      const datasValidas = this.filtros.periodoContratacao
        .map(date => new Date(date))
        .filter(date => !isNaN(date.getTime()) && date.getTime() !== 0);
    
      const formatarData = (date: Date) => {
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
      };
    
      let periodoFormatado = '';
      
      if (datasValidas.length === 2) {
        periodoFormatado = `${formatarData(datasValidas[0])} a ${formatarData(datasValidas[1])}`;
        this.calendarRange = [datasValidas[0], datasValidas[1]];
      } else if (datasValidas.length === 1) {
        periodoFormatado = formatarData(datasValidas[0]);
        this.calendarRange = [datasValidas[0], datasValidas[0]];
      }
    
      if (periodoFormatado) {
        filters.push({ label: 'Período de Contratação', value: periodoFormatado });
      }
    }

    if (this.filtros.status !== null) {
      filters.push({ label: 'Status Perfil', value: this.filtros.status ? 'Ativo' : 'Inativo' });
    }
    return filters;
  }

}