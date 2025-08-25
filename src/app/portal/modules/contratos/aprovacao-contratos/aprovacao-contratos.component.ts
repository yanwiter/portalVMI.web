import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Contrato, StatusContrato, HistoricoAprovacao, FiltroContrato } from '../../../../shared/models/contrato.model';
import { ContratoService } from '../../../../shared/services/contrato/contrato.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { formatCurrency, getSeverity } from '../../../../shared/util/util';

@Component({
  selector: 'app-aprovacao-contratos',
  templateUrl: './aprovacao-contratos.component.html',
  styleUrl: './aprovacao-contratos.component.scss'
})
export class AprovacaoContratosComponent implements OnInit {
  public contratos: Contrato[] = [];
  public totalRecords: number = 0;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public currentFirstRows = 0;
  public tblLazyLoading: boolean = false;
  
  // Propriedades para modal de aprovação
  public displayModalAprovacao: boolean = false;
  public displayModalHistorico: boolean = false;
  public contratoSelecionado: Contrato | null = null;
  public observacaoAprovacao: string = '';
  public acaoSelecionada: 'aprovar' | 'reprovar' | null = null;
  public historicoAprovacao: HistoricoAprovacao[] = [];
  
  // Filtros
  public filtros: FiltroContrato = {};
  public statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Em Análise', value: StatusContrato.EM_ANALISE },
    { label: 'Aprovado', value: StatusContrato.APROVADO },
    { label: 'Reprovado', value: StatusContrato.REPROVADO },
    { label: 'Em Vigor', value: StatusContrato.EM_VIGOR },
    { label: 'Encerrado', value: StatusContrato.ENCERRADO },
    { label: 'Cancelado', value: StatusContrato.CANCELADO }
  ];

  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly contratoService = inject(ContratoService);
  private readonly destroy = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadTableData({ first: this.currentFirstRows, rows: this.rows });
  }

  /**
   * Carrega os dados da tabela com paginação e filtros
   */
  public loadTableData(event: TableLazyLoadEvent) {
    this.spinnerService.show();
    this.tblLazyLoading = true;

    const pageNumber = Math.floor(event.first! / event.rows!) + 1;
    const pageSize = event.rows!;

    this.contratoService.getAll(this.filtros, pageNumber, pageSize)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.contratos = response.data || [];
            this.totalRecords = response.pagination?.totalCount || 0;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: response.error?.message || 'Erro ao carregar contratos'
            });
          }
          this.tblLazyLoading = false;
          this.spinnerService.hide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar contratos'
          });
          this.tblLazyLoading = false;
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Aprova um contrato
   */
  public aprovarContrato(contrato: Contrato): void {
    this.contratoSelecionado = contrato;
    this.acaoSelecionada = 'aprovar';
    this.observacaoAprovacao = '';
    this.displayModalAprovacao = true;
  }

  /**
   * Reprova um contrato
   */
  public reprovarContrato(contrato: Contrato): void {
    this.contratoSelecionado = contrato;
    this.acaoSelecionada = 'reprovar';
    this.observacaoAprovacao = '';
    this.displayModalAprovacao = true;
  }

  /**
   * Visualiza histórico de aprovação
   */
  public visualizarHistorico(contrato: Contrato): void {
    this.contratoSelecionado = contrato;
    this.carregarHistorico(contrato.id!);
    this.displayModalHistorico = true;
  }

  /**
   * Carrega histórico de aprovação
   */
  private carregarHistorico(contratoId: string): void {
    this.spinnerService.show();
    this.contratoService.getHistory(contratoId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.historicoAprovacao = response.data || [];
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: response.error?.message || 'Erro ao carregar histórico'
            });
          }
          this.spinnerService.hide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar histórico'
          });
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Executa ação de aprovação/reprovação
   */
  public executarAcao(): void {
    if (!this.contratoSelecionado || !this.acaoSelecionada) return;

    this.spinnerService.show();
    const contratoId = this.contratoSelecionado.id!;

    let observable;
    if (this.acaoSelecionada === 'aprovar') {
      observable = this.contratoService.approve(contratoId, this.observacaoAprovacao);
    } else {
      observable = this.contratoService.reject(contratoId, this.observacaoAprovacao);
    }

    observable.pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Contrato ${this.acaoSelecionada === 'aprovar' ? 'aprovado' : 'reprovado'} com sucesso`
            });
            this.fecharModalAprovacao();
            this.loadTableData({ first: this.currentFirstRows, rows: this.rows });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: response.error?.message || 'Erro ao executar ação'
            });
          }
          this.spinnerService.hide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao executar ação'
          });
          this.spinnerService.hide();
        }
      });
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

  /**
   * Fecha modal de histórico
   */
  public fecharHistorico(): void {
    this.displayModalHistorico = false;
    this.contratoSelecionado = null;
    this.historicoAprovacao = [];
  }

  /**
   * Verifica se pode aprovar contrato
   */
  public podeAprovar(contrato: Contrato): boolean {
    return contrato.status === StatusContrato.EM_ANALISE;
  }

  /**
   * Verifica se pode reprovar contrato
   */
  public podeReprovar(contrato: Contrato): boolean {
    return contrato.status === StatusContrato.EM_ANALISE;
  }

  /**
   * Verifica se pode visualizar histórico
   */
  public podeVisualizarHistorico(contrato: Contrato): boolean {
    return !!(contrato.historicoAprovacao && contrato.historicoAprovacao.length > 0);
  }

  /**
   * Aplica filtros
   */
  public filtrar(): void {
    this.currentFirstRows = 0;
    this.loadTableData({ first: 0, rows: this.rows });
  }

  /**
   * Limpa filtros
   */
  public limparFiltros(): void {
    this.filtros = {};
    this.currentFirstRows = 0;
    this.loadTableData({ first: 0, rows: this.rows });
  }

  /**
   * Obtém severidade do status
   */
  public getSeverity(status: StatusContrato): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case StatusContrato.APROVADO:
      case StatusContrato.EM_VIGOR:
        return 'success';
      case StatusContrato.EM_ANALISE:
        return 'warning';
      case StatusContrato.REPROVADO:
      case StatusContrato.CANCELADO:
        return 'danger';
      case StatusContrato.ENCERRADO:
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Formata valor monetário
   */
  public formatCurrency(value: number): string {
    return formatCurrency(value);
  }

  /**
   * Formata data
   */
  public formatDate(date: Date): string {
    return formatarDataParaDDMMYYYY(date);
  }

  /**
   * Obtém label do status
   */
  public getStatusLabel(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.RASCUNHO:
        return 'Rascunho';
      case StatusContrato.EM_ANALISE:
        return 'Em Análise';
      case StatusContrato.APROVADO:
        return 'Aprovado';
      case StatusContrato.REPROVADO:
        return 'Reprovado';
      case StatusContrato.EM_VIGOR:
        return 'Em Vigor';
      case StatusContrato.ENCERRADO:
        return 'Encerrado';
      case StatusContrato.CANCELADO:
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