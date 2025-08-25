import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Funcionario, FiltroFuncionario, StatusFuncionario, HorarioTrabalho } from '../../../../shared/models/ponto.model';
import { statusFuncionarioOptions } from '../../../../shared/models/options/statusFuncionario.options';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { Result } from '../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.scss']
})
export class FuncionariosComponent implements OnInit {
  @ViewChild('op') op!: OverlayPanel;
  funcionarios: Funcionario[] = [];
  funcionarioSelecionado: Funcionario = {} as Funcionario;
  displayDialog = false;
  loading = false;
  
  // Filtros
  filtro: FiltroFuncionario = {};
  statusOptions = statusFuncionarioOptions;
  horariosTrabalho: HorarioTrabalho[] = [];
  
  // Opções para os novos campos
  sexoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Feminino', value: 'F' }
  ];
  
  estadoCivilOptions = [
    { label: 'Solteiro(a)', value: 'SOLTEIRO' },
    { label: 'Casado(a)', value: 'CASADO' },
    { label: 'Divorciado(a)', value: 'DIVORCIADO' },
    { label: 'Viúvo(a)', value: 'VIUVO' },
    { label: 'União Estável', value: 'UNIAO_ESTAVEL' }
  ];
  
  tipoContratoOptions = [
    { label: 'CLT', value: 'CLT' },
    { label: 'PJ', value: 'PJ' },
    { label: 'Estagiário', value: 'ESTAGIARIO' },
    { label: 'Temporário', value: 'TEMPORARIO' },
    { label: 'Autônomo', value: 'AUTONOMO' }
  ];
  
  estadosOptions = [
    { label: 'Acre', value: 'AC' },
    { label: 'Alagoas', value: 'AL' },
    { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' },
    { label: 'Mato Grosso', value: 'MT' },
    { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Pará', value: 'PA' },
    { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Pernambuco', value: 'PE' },
    { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Rio Grande do Norte', value: 'RN' },
    { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' },
    { label: 'Roraima', value: 'RR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' },
    { label: 'Sergipe', value: 'SE' },
    { label: 'Tocantins', value: 'TO' }
  ];
  
  tipoEnderecoOptions = [
    { label: 'Residencial', value: 'RESIDENCIAL' },
    { label: 'Comercial', value: 'COMERCIAL' },
    { label: 'Correspondência', value: 'CORRESPONDENCIA' }
  ];
  
  escolaridadeOptions = [
    { label: 'Ensino Fundamental Incompleto', value: 'FUNDAMENTAL_INCOMPLETO' },
    { label: 'Ensino Fundamental Completo', value: 'FUNDAMENTAL_COMPLETO' },
    { label: 'Ensino Médio Incompleto', value: 'MEDIO_INCOMPLETO' },
    { label: 'Ensino Médio Completo', value: 'MEDIO_COMPLETO' },
    { label: 'Ensino Superior Incompleto', value: 'SUPERIOR_INCOMPLETO' },
    { label: 'Ensino Superior Completo', value: 'SUPERIOR_COMPLETO' },
    { label: 'Pós-Graduação', value: 'POS_GRADUACAO' },
    { label: 'Mestrado', value: 'MESTRADO' },
    { label: 'Doutorado', value: 'DOUTORADO' }
  ];
  
  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Permissões
  canCreate = false;
  canEdit = false;
  canDelete = false;

  // Configuração de colunas
  columns = [
    { field: 'matricula', header: 'Matrícula', visible: true },
    { field: 'nome', header: 'Nome', visible: true },
    { field: 'cpf', header: 'CPF', visible: true },
    { field: 'cargo', header: 'Cargo', visible: true },
    { field: 'departamento', header: 'Departamento', visible: true },
    { field: 'dataAdmissao', header: 'Data Admissão', visible: true },
    { field: 'status', header: 'Status', visible: true }
  ];

  // Paginação
  rowsPerPage = [10, 25, 50];

  constructor(
    private funcionarioService: GenericService<Funcionario>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.carregarFuncionarios();
    this.carregarHorariosTrabalho();
    this.carregarDadosTeste();
  }


  carregarFuncionarios(): void {
    this.loading = true;
    this.funcionarioService.getAll('pontoRoutes', undefined, 'funcionarios')
      .subscribe({
        next: (response: Result<Funcionario[]>) => {
          if (response.isSuccess && response.data) {
            this.funcionarios = response.data;
            this.totalRecords = response.data.length;
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erro ao carregar funcionários:', error);
          this.loading = false;
        }
      });
  }

  carregarHorariosTrabalho(): void {
    // Dados de teste para horários de trabalho
    this.horariosTrabalho = [
      {
        id: '1',
        nome: 'Padrão (8h)',
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
      {
        id: '2',
        nome: 'Flexível (6h)',
        horaEntrada: '09:00',
        horaSaida: '18:00',
        horaInicioIntervalo: '12:00',
        horaFimIntervalo: '13:00',
        toleranciaEntrada: 30,
        toleranciaSaida: 30,
        cargaHorariaSemanal: 30,
        cargaHorariaDiaria: 6,
        diasTrabalho: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'] as any,
        ativo: true
      }
    ];
  }

  carregarDadosTeste(): void {
    this.funcionarios = [
      {
        id: '1',
        matricula: '001',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cargo: 'Desenvolvedor',
        departamento: 'TI',
        dataAdmissao: new Date('2023-01-15'),
        status: StatusFuncionario.ATIVO,
        horarioTrabalho: this.horariosTrabalho[0],
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
        status: StatusFuncionario.ATIVO,
        horarioTrabalho: this.horariosTrabalho[0],
        dataInclusao: new Date(),
        idRespInclusao: '1',
        nomeRespInclusao: 'Admin'
      }
    ];
    this.totalRecords = this.funcionarios.length;
  }

  novoFuncionario(): void {
    this.funcionarioSelecionado = {
      id: '',
      matricula: '',
      nome: '',
      cpf: '',
      
      // Informações Básicas
      dataNascimento: undefined,
      sexo: undefined,
      estadoCivil: undefined,
      rg: '',
      orgaoExpedidor: '',
      dataExpedicao: undefined,
      
      // Informações Profissionais
      cargo: '',
      departamento: '',
      dataAdmissao: new Date(),
      dataDemissao: undefined,
      tipoContrato: undefined,
      dataContratacao: undefined,
      salario: undefined,
      valeRefeicao: undefined,
      valeTransporte: undefined,
      horarioTrabalho: this.horariosTrabalho[0],
      supervisor: '',
      status: StatusFuncionario.ATIVO,
      
      // Endereço
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: undefined,
      pais: 'Brasil',
      tipoEndereco: undefined,
      
      // Contato
      telefone: '',
      celular: '',
      email: '',
      emailCorporativo: '',
      telefoneEmergencia: '',
      contatoEmergencia: '',
      
      // Documentos
      pis: '',
      tituloEleitor: '',
      zonaEleitoral: '',
      certificadoReservista: '',
      carteiraTrabalho: '',
      serieCarteiraTrabalho: '',
      dataEmissaoCarteiraTrabalho: undefined,
      ufCarteiraTrabalho: undefined,
      carteiraIdentidade: '',
      
      // Informações Adicionais
      nacionalidade: 'Brasileira',
      naturalidade: '',
      ufNaturalidade: undefined,
      escolaridade: undefined,
      formacao: '',
      instituicaoEnsino: '',
      observacoes: '',
      
      // Auditoria
      dataInclusao: new Date(),
      idRespInclusao: '1',
      nomeRespInclusao: 'Admin'
    };
    this.displayDialog = true;
  }

  editarFuncionario(funcionario: Funcionario): void {
    this.funcionarioSelecionado = { ...funcionario };
    this.displayDialog = true;
  }

  salvarFuncionario(): void {
    if (!this.validarFuncionario()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios',
        life: 3000
      });
      return;
    }

    this.loading = true;
    
    if (this.funcionarioSelecionado.id) {
      // Atualizar
      this.funcionarioService.update('pontoRoutes', this.funcionarioSelecionado.id, this.funcionarioSelecionado, ['funcionarios'])
        .subscribe({
          next: (response: Result<Funcionario>) => {
            this.handleSaveResponse(response, 'atualizado');
          },
          error: (error: any) => {
            this.handleSaveError();
          }
        });
    } else {
      // Criar
      this.funcionarioService.post('pontoRoutes', this.funcionarioSelecionado, ['funcionarios'])
        .subscribe({
          next: (response: Result<Funcionario>) => {
            this.handleSaveResponse(response, 'criado');
          },
          error: (error: any) => {
            this.handleSaveError();
          }
        });
    }
  }

  private handleSaveResponse(response: Result<Funcionario>, action: string): void {
    if (response.isSuccess) {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Funcionário ${action} com sucesso`,
        life: 3000
      });
      this.displayDialog = false;
      this.carregarFuncionarios();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: response.error?.message || `Erro ao ${action} funcionário`,
        life: 3000
      });
    }
    this.loading = false;
  }

  private handleSaveError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao salvar funcionário',
      life: 3000
    });
    this.loading = false;
  }

  private validarFuncionario(): boolean {
    return !!(
      this.funcionarioSelecionado.matricula &&
      this.funcionarioSelecionado.nome &&
      this.funcionarioSelecionado.cpf &&
      this.funcionarioSelecionado.dataNascimento &&
      this.funcionarioSelecionado.sexo &&
      this.funcionarioSelecionado.cargo &&
      this.funcionarioSelecionado.departamento &&
      this.funcionarioSelecionado.dataAdmissao &&
      this.funcionarioSelecionado.tipoContrato &&
      this.funcionarioSelecionado.horarioTrabalho &&
      this.funcionarioSelecionado.status &&
      this.funcionarioSelecionado.cep &&
      this.funcionarioSelecionado.logradouro &&
      this.funcionarioSelecionado.numero &&
      this.funcionarioSelecionado.bairro &&
      this.funcionarioSelecionado.cidade &&
      this.funcionarioSelecionado.estado &&
      this.funcionarioSelecionado.pais &&
      this.funcionarioSelecionado.telefone &&
      this.funcionarioSelecionado.email
    );
  }

  excluirFuncionario(funcionario: Funcionario): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o funcionário ${funcionario.nome}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.funcionarioService.delete('pontoRoutes', funcionario.id, ['funcionarios'])
          .subscribe({
            next: (response: Result<any>) => {
              if (response.isSuccess) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sucesso',
                  detail: 'Funcionário excluído com sucesso',
                  life: 3000
                });
                this.carregarFuncionarios();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: response.error?.message || 'Erro ao excluir funcionário',
                  life: 3000
                });
              }
              this.loading = false;
            },
            error: (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir funcionário',
                life: 3000
              });
              this.loading = false;
            }
          });
      }
    });
  }

  aplicarFiltros(): void {
    this.carregarFuncionarios();
  }

  limparFiltros(): void {
    this.filtro = {};
    this.carregarFuncionarios();
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getStatusClass(status: StatusFuncionario): 'success' | 'danger' | 'warning' | 'info' | 'secondary' {
    switch (status) {
      case StatusFuncionario.ATIVO:
        return 'success';
      case StatusFuncionario.INATIVO:
        return 'danger';
      case StatusFuncionario.FERIAS:
        return 'warning';
      case StatusFuncionario.LICENCA:
        return 'info';
      default:
        return 'secondary';
    }
  }

  // Métodos para o novo layout
  handlePageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.carregarFuncionarios();
  }

  loadTableData(event: any): void {
    // Implementar carregamento lazy se necessário
    this.carregarFuncionarios();
  }

  onColReorder(event: any): void {
    // Implementar reordenação de colunas se necessário
    console.log('Coluna reordenada:', event);
  }

  exportarParaExcel(): void {
    // Implementar exportação para Excel
    this.messageService.add({
      severity: 'info',
      summary: 'Exportação',
      detail: 'Funcionalidade de exportação em desenvolvimento',
      life: 3000
    });
  }

  toggleColumnConfig(event: any): void {
    // Implementar configuração de colunas
    this.messageService.add({
      severity: 'info',
      summary: 'Configuração',
      detail: 'Configuração de colunas em desenvolvimento',
      life: 3000
    });
  }

  saveColumnPreferences(): void {
    // Implementar salvamento das preferências de colunas
    console.log('Preferências de colunas salvas');
  }
} 