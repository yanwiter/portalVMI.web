import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { 
  RegistroPonto, 
  StatusRegistroPonto, 
  TipoRegistroPonto,
  AcaoAprovacaoPonto,
  HistoricoAprovacaoPonto,
  FiltroPonto 
} from '../../../../shared/models/ponto.model';
import { statusRegistroPontoOptions } from '../../../../shared/models/options/statusRegistroPonto.options';
import { tipoRegistroPontoOptions } from '../../../../shared/models/options/tipoRegistroPonto.options';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { Result } from '../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { formatarDataParaDDMMYYYY } from '../../../../shared/util/dateUtil';
import { getUserIdFromStorage } from '../../../../shared/util/localStorageUtil';
import { formatCurrency } from '../../../../shared/util/util';

@Component({
  selector: 'app-aprovacao-horas-extras',
  templateUrl: './aprovacao-horas-extras.component.html',
  styleUrls: ['./aprovacao-horas-extras.component.scss']
})
export class AprovacaoHorasExtrasComponent implements OnInit {
  registrosPonto: RegistroPonto[] = [];
  registroSelecionado: RegistroPonto | null = null;
  displayDialog = false;
  displayDialogAprovacao = false;
  displayDialogHistorico = false;
  loading = false;
  
  // Filtros
  filtro: FiltroPonto = {};
  statusRegistroOptions = statusRegistroPontoOptions;
  tipoRegistroOptions = tipoRegistroPontoOptions;
  
  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Permissões
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canApprove = false;
  canReject = false;
  canView = false;

  // Aprovação
  observacaoAprovacao = '';
  acaoSelecionada: AcaoAprovacaoPonto | null = null;
  horasExtrasAprovadas = 0;

  constructor(
    private pontoService: GenericService<RegistroPonto>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.carregarRegistrosPonto();
    this.carregarDadosTeste();
  }

  carregarRegistrosPonto(): void {
    this.loading = true;
    this.pontoService.getAll('pontoRoutes', undefined, 'registros')
      .subscribe({
        next: (response: Result<RegistroPonto[]>) => {
          if (response.isSuccess && response.data) {
            this.registrosPonto = response.data;
            this.totalRecords = response.data.length;
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar registros de ponto',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  carregarDadosTeste(): void {
    // Dados de teste para registros de ponto com horas extras
    this.registrosPonto = [
      {
        id: '1',
        funcionarioId: '1',
        funcionarioNome: 'João Silva',
        funcionarioMatricula: '001',
        data: new Date(),
        horaEntrada: new Date(new Date().setHours(8, 0, 0, 0)),
        horaSaida: new Date(new Date().setHours(20, 0, 0, 0)),
        tipoRegistro: TipoRegistroPonto.SAIDA,
        status: StatusRegistroPonto.PENDENTE,
        horasExtras: 2,
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva',
        historicoAprovacao: [
          {
            id: '1',
            registroPontoId: '1',
            acao: AcaoAprovacaoPonto.CRIACAO,
            statusNovo: StatusRegistroPonto.PENDENTE,
            observacao: 'Registro de ponto criado',
            responsavelId: '1',
            responsavelNome: 'João Silva',
            dataAcao: new Date()
          }
        ]
      },
      {
        id: '2',
        funcionarioId: '2',
        funcionarioNome: 'Maria Santos',
        funcionarioMatricula: '002',
        data: new Date(),
        horaEntrada: new Date(new Date().setHours(8, 15, 0, 0)),
        horaSaida: new Date(new Date().setHours(19, 30, 0, 0)),
        tipoRegistro: TipoRegistroPonto.SAIDA,
        status: StatusRegistroPonto.APROVADO,
        horasExtras: 1.25,
        horasExtrasAprovadas: 1.25,
        aprovadorId: '3',
        aprovadorNome: 'Carlos Oliveira',
        dataAprovacao: new Date(),
        observacaoAprovacao: 'Horas extras aprovadas',
        dataInclusao: new Date(),
        idRespInclusao: '2',
        nomeRespInclusao: 'Maria Santos',
        historicoAprovacao: [
          {
            id: '2',
            registroPontoId: '2',
            acao: AcaoAprovacaoPonto.CRIACAO,
            statusNovo: StatusRegistroPonto.PENDENTE,
            observacao: 'Registro de ponto criado',
            responsavelId: '2',
            responsavelNome: 'Maria Santos',
            dataAcao: new Date()
          },
          {
            id: '3',
            registroPontoId: '2',
            acao: AcaoAprovacaoPonto.APROVAR_HORAS_EXTRAS,
            statusAnterior: StatusRegistroPonto.PENDENTE,
            statusNovo: StatusRegistroPonto.APROVADO,
            horasExtrasAnterior: 1.25,
            horasExtrasNovo: 1.25,
            observacao: 'Horas extras aprovadas',
            responsavelId: '3',
            responsavelNome: 'Carlos Oliveira',
            dataAcao: new Date()
          }
        ]
      },
      {
        id: '3',
        funcionarioId: '3',
        funcionarioNome: 'Pedro Costa',
        funcionarioMatricula: '003',
        data: new Date(),
        horaEntrada: new Date(new Date().setHours(8, 0, 0, 0)),
        horaSaida: new Date(new Date().setHours(22, 0, 0, 0)),
        tipoRegistro: TipoRegistroPonto.SAIDA,
        status: StatusRegistroPonto.REPROVADO,
        horasExtras: 4,
        justificativa: 'Projeto urgente',
        dataInclusao: new Date(),
        idRespInclusao: '3',
        nomeRespInclusao: 'Pedro Costa',
        historicoAprovacao: [
          {
            id: '4',
            registroPontoId: '3',
            acao: AcaoAprovacaoPonto.CRIACAO,
            statusNovo: StatusRegistroPonto.PENDENTE,
            observacao: 'Registro de ponto criado',
            responsavelId: '3',
            responsavelNome: 'Pedro Costa',
            dataAcao: new Date()
          },
          {
            id: '5',
            registroPontoId: '3',
            acao: AcaoAprovacaoPonto.REPROVAR_HORAS_EXTRAS,
            statusAnterior: StatusRegistroPonto.PENDENTE,
            statusNovo: StatusRegistroPonto.REPROVADO,
            horasExtrasAnterior: 4,
            horasExtrasNovo: 0,
            observacao: 'Horas extras excessivas - necessário justificativa',
            responsavelId: '3',
            responsavelNome: 'Carlos Oliveira',
            dataAcao: new Date()
          }
        ]
      }
    ];
    this.totalRecords = this.registrosPonto.length;
  }

  visualizarRegistro(registro: RegistroPonto): void {
    if (!this.canView) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para visualizar registros de ponto',
        life: 3000
      });
      return;
    }

    this.registroSelecionado = { ...registro };
    this.displayDialog = true;
  }

  aprovarHorasExtras(registro: RegistroPonto): void {
    if (!this.canApprove) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para aprovar horas extras',
        life: 3000
      });
      return;
    }

    this.registroSelecionado = { ...registro };
    this.acaoSelecionada = AcaoAprovacaoPonto.APROVAR_HORAS_EXTRAS;
    this.horasExtrasAprovadas = registro.horasExtras || 0;
    this.displayDialogAprovacao = true;
  }

  reprovarHorasExtras(registro: RegistroPonto): void {
    if (!this.canReject) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para reprovar horas extras',
        life: 3000
      });
      return;
    }

    this.registroSelecionado = { ...registro };
    this.acaoSelecionada = AcaoAprovacaoPonto.REPROVAR_HORAS_EXTRAS;
    this.horasExtrasAprovadas = 0;
    this.displayDialogAprovacao = true;
  }

  executarAcao(): void {
    if (!this.registroSelecionado || !this.acaoSelecionada) return;

    this.loading = true;
    const statusAnterior = this.registroSelecionado.status;
    let novoStatus: StatusRegistroPonto;
    const horasExtrasAnterior = this.registroSelecionado.horasExtrasAprovadas || 0;

    switch (this.acaoSelecionada) {
      case AcaoAprovacaoPonto.APROVAR_HORAS_EXTRAS:
        novoStatus = StatusRegistroPonto.APROVADO;
        break;
      case AcaoAprovacaoPonto.REPROVAR_HORAS_EXTRAS:
        novoStatus = StatusRegistroPonto.REPROVADO;
        break;
      default:
        novoStatus = statusAnterior;
    }

    const registroAtualizado = {
      ...this.registroSelecionado,
      status: novoStatus,
      dataUltimaAlteracao: new Date(),
      idRespUltimaAlteracao: getUserIdFromStorage(),
      nomeRespUltimaAlteracao: 'Usuário Atual'
    };

    if (this.acaoSelecionada === AcaoAprovacaoPonto.APROVAR_HORAS_EXTRAS) {
      registroAtualizado.aprovadorId = getUserIdFromStorage();
      registroAtualizado.aprovadorNome = 'Usuário Atual';
      registroAtualizado.dataAprovacao = new Date();
      registroAtualizado.observacaoAprovacao = this.observacaoAprovacao;
      registroAtualizado.horasExtrasAprovadas = this.horasExtrasAprovadas;
    } else if (this.acaoSelecionada === AcaoAprovacaoPonto.REPROVAR_HORAS_EXTRAS) {
      registroAtualizado.horasExtrasAprovadas = 0;
    }

    this.pontoService.update('pontoRoutes', this.registroSelecionado.id, registroAtualizado, ['registros'])
      .subscribe({
        next: (response: Result<RegistroPonto>) => {
          if (response.isSuccess) {
            // Adicionar ao histórico
            const historico: HistoricoAprovacaoPonto = {
              id: Date.now().toString(),
              registroPontoId: this.registroSelecionado!.id,
              acao: this.acaoSelecionada!,
              statusAnterior,
              statusNovo: novoStatus,
              horasExtrasAnterior,
              horasExtrasNovo: this.horasExtrasAprovadas,
              observacao: this.observacaoAprovacao,
              responsavelId: getUserIdFromStorage(),
              responsavelNome: 'Usuário Atual',
              dataAcao: new Date()
            };

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Horas extras ${this.getAcaoLabel(this.acaoSelecionada!)} com sucesso`,
              life: 3000
            });

            this.displayDialogAprovacao = false;
            this.observacaoAprovacao = '';
            this.acaoSelecionada = null;
            this.horasExtrasAprovadas = 0;
            this.carregarRegistrosPonto();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao executar ação',
              life: 3000
            });
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao executar ação',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  visualizarHistorico(registro: RegistroPonto): void {
    this.registroSelecionado = { ...registro };
    this.displayDialogHistorico = true;
  }

  aplicarFiltros(): void {
    this.carregarRegistrosPonto();
  }

  limparFiltros(): void {
    this.filtro = {};
    this.carregarRegistrosPonto();
  }

  formatarData(data: Date): string {
    return formatarDataParaDDMMYYYY(data);
  }

  formatarHora(hora: Date): string {
    return new Date(hora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatarHorasExtras(horas: number): string {
    const horasInt = Math.floor(horas);
    const minutos = Math.round((horas - horasInt) * 60);
    return `${horasInt}h${minutos.toString().padStart(2, '0')}min`;
  }

  getStatusClass(status: StatusRegistroPonto): 'success' | 'danger' | 'warning' | 'info' | 'secondary' {
    switch (status) {
      case StatusRegistroPonto.APROVADO:
        return 'success';
      case StatusRegistroPonto.REPROVADO:
        return 'danger';
      case StatusRegistroPonto.CORRIGIDO:
        return 'warning';
      default:
        return 'info';
    }
  }

  getTipoClass(tipo: TipoRegistroPonto): 'success' | 'danger' | 'warning' | 'info' | 'secondary' {
    switch (tipo) {
      case TipoRegistroPonto.ENTRADA:
        return 'success';
      case TipoRegistroPonto.SAIDA:
        return 'danger';
      case TipoRegistroPonto.ENTRADA_INTERVALO:
        return 'info';
      case TipoRegistroPonto.SAIDA_INTERVALO:
        return 'warning';
      case TipoRegistroPonto.CORRECAO:
        return 'secondary';
      default:
        return 'info';
    }
  }

  getAcaoLabel(acao: AcaoAprovacaoPonto): string {
    switch (acao) {
      case AcaoAprovacaoPonto.APROVAR_HORAS_EXTRAS:
        return 'aprovadas';
      case AcaoAprovacaoPonto.REPROVAR_HORAS_EXTRAS:
        return 'reprovadas';
      default:
        return 'processadas';
    }
  }

  podeAprovar(registro: RegistroPonto): boolean {
    return this.canApprove && 
           registro.status === StatusRegistroPonto.PENDENTE && 
           (registro.horasExtras || 0) > 0;
  }

  podeReprovar(registro: RegistroPonto): boolean {
    return this.canReject && 
           registro.status === StatusRegistroPonto.PENDENTE && 
           (registro.horasExtras || 0) > 0;
  }

  temHorasExtras(registro: RegistroPonto): boolean {
    return (registro.horasExtras || 0) > 0;
  }

  getTipoLabel(tipo: TipoRegistroPonto): string {
    const option = this.tipoRegistroOptions.find(opt => opt.value === tipo);
    return option ? option.label : tipo;
  }
} 