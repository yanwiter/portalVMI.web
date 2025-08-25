import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { 
  Funcionario, 
  RegistroPonto, 
  FiltroPonto, 
  StatusRegistroPonto, 
  TipoRegistroPonto 
} from '../../../../shared/models/ponto.model';
import { statusRegistroPontoOptions } from '../../../../shared/models/options/statusRegistroPonto.options';
import { tipoRegistroPontoOptions } from '../../../../shared/models/options/tipoRegistroPonto.options';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { Result } from '../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';

@Component({
  selector: 'app-registro-ponto',
  templateUrl: './registro-ponto.component.html',
  styleUrls: ['./registro-ponto.component.scss']
})
export class RegistroPontoComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  funcionarioSelecionado: Funcionario | null = null;
  dataRegistro: Date = new Date();
  horaRegistro: Date = new Date();
  tipoRegistro: TipoRegistroPonto | null = null;
  justificativa: string = '';
  
  registrosPonto: RegistroPonto[] = [];
  registroEditando: RegistroPonto | null = null;
  horaEditando: Date = new Date();
  displayDialog = false;
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

  constructor(
    private pontoService: GenericService<RegistroPonto>,
    private funcionarioService: GenericService<Funcionario>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.carregarFuncionarios();
    this.carregarRegistrosPonto();
    this.carregarDadosTeste();
  }

  carregarFuncionarios(): void {
    this.funcionarioService.getAll('pontoRoutes', undefined, 'funcionarios')
      .subscribe({
        next: (response: Result<Funcionario[]>) => {
          if (response.isSuccess && response.data) {
            this.funcionarios = response.data;
          }
        },
        error: (error: any) => {
          console.error('Erro ao carregar funcionários:', error);
        }
      });
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
          console.error('Erro ao carregar registros de ponto:', error);
          this.loading = false;
        }
      });
  }

  carregarDadosTeste(): void {
    // Dados de teste para funcionários
    this.funcionarios = [
      {
        id: '1',
        matricula: '001',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cargo: 'Desenvolvedor',
        departamento: 'TI',
        dataAdmissao: new Date('2023-01-15'),
        status: 'ATIVO' as any,
        horarioTrabalho: {
          id: '1',
          nome: 'Padrão',
          horaEntrada: '08:00',
          horaSaida: '18:00',
          horaInicioIntervalo: '12:00',
          horaFimIntervalo: '13:00',
          toleranciaEntrada: 15,
          toleranciaSaida: 15,
          cargaHorariaSemanal: 40,
          cargaHorariaDiaria: 8,
          diasTrabalho: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'] as any,
          ativo: true
        },
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'Admin'
      },
      {
        id: '2',
        matricula: '002',
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        cargo: 'Analista',
        departamento: 'RH',
        dataAdmissao: new Date('2023-02-20'),
        status: 'ATIVO' as any,
        horarioTrabalho: {
          id: '1',
          nome: 'Padrão',
          horaEntrada: '08:00',
          horaSaida: '18:00',
          horaInicioIntervalo: '12:00',
          horaFimIntervalo: '13:00',
          toleranciaEntrada: 15,
          toleranciaSaida: 15,
          cargaHorariaSemanal: 40,
          cargaHorariaDiaria: 8,
          diasTrabalho: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'] as any,
          ativo: true
        },
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'Admin'
      }
    ];

    // Dados de teste para registros de ponto
    this.registrosPonto = [
      {
        id: '1',
        funcionarioId: '1',
        funcionarioNome: 'João Silva',
        funcionarioMatricula: '001',
        data: new Date(),
        horaEntrada: new Date(new Date().setHours(8, 0, 0, 0)),
        tipoRegistro: TipoRegistroPonto.ENTRADA,
        status: StatusRegistroPonto.APROVADO,
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva'
      },
      {
        id: '2',
        funcionarioId: '1',
        funcionarioNome: 'João Silva',
        funcionarioMatricula: '001',
        data: new Date(),
        horaSaida: new Date(new Date().setHours(18, 0, 0, 0)),
        tipoRegistro: TipoRegistroPonto.SAIDA,
        status: StatusRegistroPonto.APROVADO,
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva'
      },
      {
        id: '3',
        funcionarioId: '2',
        funcionarioNome: 'Maria Santos',
        funcionarioMatricula: '002',
        data: new Date(),
        horaEntrada: new Date(new Date().setHours(8, 15, 0, 0)),
        tipoRegistro: TipoRegistroPonto.ENTRADA,
        status: StatusRegistroPonto.PENDENTE,
        justificativa: 'Trânsito intenso',
        dataInclusao: new Date(),
        idRespInclusao: '2',
        nomeRespInclusao: 'Maria Santos'
      }
    ];
    this.totalRecords = this.registrosPonto.length;
  }

  registrarPonto(): void {
    if (!this.podeRegistrar()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios',
        life: 3000
      });
      return;
    }

    const registro: RegistroPonto = {
      id: '',
      funcionarioId: this.funcionarioSelecionado!.id,
      funcionarioNome: this.funcionarioSelecionado!.nome,
      funcionarioMatricula: this.funcionarioSelecionado!.matricula,
      data: this.dataRegistro,
      horaEntrada: this.tipoRegistro === TipoRegistroPonto.ENTRADA ? this.horaRegistro : undefined,
      horaSaida: this.tipoRegistro === TipoRegistroPonto.SAIDA ? this.horaRegistro : undefined,
      horaEntradaIntervalo: this.tipoRegistro === TipoRegistroPonto.ENTRADA_INTERVALO ? this.horaRegistro : undefined,
      horaSaidaIntervalo: this.tipoRegistro === TipoRegistroPonto.SAIDA_INTERVALO ? this.horaRegistro : undefined,
      tipoRegistro: this.tipoRegistro!,
      justificativa: this.justificativa,
      status: StatusRegistroPonto.PENDENTE,
      dataInclusao: new Date(),
      idRespInclusao: '1', // ID do usuário logado
      nomeRespInclusao: 'Admin' // Nome do usuário logado
    };

    this.loading = true;
    this.pontoService.post('pontoRoutes', registro, ['registros'])
      .subscribe({
        next: (response: Result<RegistroPonto>) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Registro de ponto realizado com sucesso',
              life: 3000
            });
            this.limparFormulario();
            this.carregarRegistrosPonto();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: response.error?.message || 'Erro ao registrar ponto',
              life: 3000
            });
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao registrar ponto',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  podeRegistrar(): boolean {
    return !!(
      this.funcionarioSelecionado &&
      this.dataRegistro &&
      this.horaRegistro &&
      this.tipoRegistro
    );
  }

  limparFormulario(): void {
    this.funcionarioSelecionado = null;
    this.dataRegistro = new Date();
    this.horaRegistro = new Date();
    this.tipoRegistro = null;
    this.justificativa = '';
  }

  aplicarFiltros(): void {
    this.carregarRegistrosPonto();
  }

  limparFiltros(): void {
    this.filtro = {};
    this.carregarRegistrosPonto();
  }

  editarRegistro(registro: RegistroPonto): void {
    this.registroEditando = { ...registro };
    this.horaEditando = registro.horaEntrada || registro.horaSaida || new Date();
    this.displayDialog = true;
  }

  salvarRegistro(): void {
    if (!this.registroEditando) return;

    // Atualizar hora baseada no tipo
    if (this.registroEditando.tipoRegistro === TipoRegistroPonto.ENTRADA) {
      this.registroEditando.horaEntrada = this.horaEditando;
      this.registroEditando.horaSaida = undefined;
    } else if (this.registroEditando.tipoRegistro === TipoRegistroPonto.SAIDA) {
      this.registroEditando.horaSaida = this.horaEditando;
      this.registroEditando.horaEntrada = undefined;
    }

    this.loading = true;
    this.pontoService.update('pontoRoutes', this.registroEditando.id, this.registroEditando, ['registros'])
      .subscribe({
        next: (response: Result<RegistroPonto>) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Registro atualizado com sucesso',
              life: 3000
            });
            this.displayDialog = false;
            this.carregarRegistrosPonto();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: response.error?.message || 'Erro ao atualizar registro',
              life: 3000
            });
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar registro',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  excluirRegistro(registro: RegistroPonto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o registro de ponto de ${registro.funcionarioNome}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.pontoService.delete('pontoRoutes', registro.id, ['registros'])
          .subscribe({
            next: (response: Result<any>) => {
              if (response.isSuccess) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sucesso',
                  detail: 'Registro excluído com sucesso',
                  life: 3000
                });
                this.carregarRegistrosPonto();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: response.error?.message || 'Erro ao excluir registro',
                  life: 3000
                });
              }
              this.loading = false;
            },
            error: (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir registro',
                life: 3000
              });
              this.loading = false;
            }
          });
      }
    });
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarHora(hora: Date): string {
    return new Date(hora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getTipoLabel(tipo: TipoRegistroPonto): string {
    const option = this.tipoRegistroOptions.find(opt => opt.value === tipo);
    return option ? option.label : tipo;
  }

  getTipoClass(tipo: TipoRegistroPonto): string {
    switch (tipo) {
      case TipoRegistroPonto.ENTRADA:
        return 'tipo-entrada';
      case TipoRegistroPonto.SAIDA:
        return 'tipo-saida';
      case TipoRegistroPonto.ENTRADA_INTERVALO:
        return 'tipo-entrada-intervalo';
      case TipoRegistroPonto.SAIDA_INTERVALO:
        return 'tipo-saida-intervalo';
      case TipoRegistroPonto.CORRECAO:
        return 'tipo-correcao';
      default:
        return 'tipo-outro';
    }
  }

  getStatusClass(status: StatusRegistroPonto): string {
    switch (status) {
      case StatusRegistroPonto.APROVADO:
        return 'status-aprovado';
      case StatusRegistroPonto.REPROVADO:
        return 'status-reprovado';
      case StatusRegistroPonto.CORRIGIDO:
        return 'status-corrigido';
      default:
        return 'status-pendente';
    }
  }
} 