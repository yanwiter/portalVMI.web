import { Component, OnInit, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { 
  NotaFiscal, 
  StatusNotaFiscal, 
  TipoOperacao, 
  AcaoAprovacaoNotaFiscal,
  HistoricoAprovacaoNotaFiscal,
  FiltroNotaFiscal 
} from '../../../../../shared/models/notaFiscal.model';
import { statusNotaFiscalOptions } from '../../../../../shared/models/options/statusNotaFiscal.options';
import { tipoOperacaoOptions } from '../../../../../shared/models/options/tipoOperacao.options';
import { GenericService } from '../../../../../shared/services/generic/generic.service';
import { Result } from '../../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../../shared/services/permissions/permissions.service';
import { formatarDataParaDDMMYYYY } from '../../../../../shared/util/dateUtil';
import { getUserIdFromStorage } from '../../../../../shared/util/localStorageUtil';
import { formatCurrency } from '../../../../../shared/util/util';

@Component({
  selector: 'app-emissao-nota-fiscal',
  templateUrl: './emissao-nota-fiscal.component.html',
  styleUrls: ['./emissao-nota-fiscal.component.scss']
})
export class EmissaoNotaFiscalComponent implements OnInit {
  @Input() notaFiscal: NotaFiscal | null = null;
  notasFiscais: NotaFiscal[] = [];
  notaFiscalSelecionada: NotaFiscal | null = null;
  displayDialog = false;
  displayDialogAprovacao = false;
  displayDialogHistorico = false;
  loading = false;
  
  // Filtros
  filtro: FiltroNotaFiscal = {};
  statusOptions = statusNotaFiscalOptions;
  tipoOperacaoOptions = tipoOperacaoOptions;
  
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
  canEmit = false;
  canView = false;

  // Aprovação
  observacaoAprovacao = '';
  acaoSelecionada: AcaoAprovacaoNotaFiscal | null = null;
  
  // Emissão
  ambiente = 'HOMOLOGACAO';
  justificativa = '';
  
  // Enums para template
  StatusNotaFiscal = StatusNotaFiscal;
  
  // Propriedades para template
  dataAtual = new Date();

  constructor(
    private notaFiscalService: GenericService<NotaFiscal>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.carregarNotasFiscais();
    this.carregarDadosTeste();
  }

  carregarNotasFiscais(): void {
    this.loading = true;
    this.notaFiscalService.getAll('notaFiscalRoutes')
      .subscribe({
        next: (response: Result<NotaFiscal[]>) => {
          if (response.isSuccess && response.data) {
            this.notasFiscais = response.data;
            this.totalRecords = response.data.length;
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar notas fiscais',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  carregarDadosTeste(): void {
    // Dados de teste para notas fiscais
    this.notasFiscais = [
      {
        id: 1,
        numero: '001',
        serie: '1',
        dataEmissao: new Date('2024-01-15'),
        dataVencimento: new Date('2024-02-15'),
        clienteId: 1,
        clienteNome: 'Cliente Teste Ltda',
        clienteCnpjCpf: '12.345.678/0001-90',
        valorTotal: 1500.00,
        valorBaseIcms: 1500.00,
        valorIcms: 270.00,
        valorBaseIpi: 0,
        valorIpi: 0,
        valorBasePis: 1500.00,
        valorPis: 9.75,
        valorBaseCofins: 1500.00,
        valorCofins: 45.00,
        status: StatusNotaFiscal.EM_ANALISE,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal em análise',
        itens: [
          {
            id: 1,
            notaFiscalId: 1,
            produtoId: 1,
            produtoCodigo: '001',
            produtoDescricao: 'Produto Teste 1',
            quantidade: 2,
            valorUnitario: 500.00,
            valorTotal: 1000.00,
            cfop: '5102',
            ncm: '84713000',
            unidadeComercial: 'UN',
            valorBaseIcms: 1000.00,
            valorIcms: 180.00,
            aliquotaIcms: 18.00,
            observacoes: 'Item de teste'
          }
        ],
        dataInclusao: new Date('2024-01-15'),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva',
        historicoAprovacao: [
          {
            id: '1',
            notaFiscalId: 1,
            acao: AcaoAprovacaoNotaFiscal.CRIACAO,
            statusNovo: StatusNotaFiscal.RASCUNHO,
            observacao: 'Nota fiscal criada',
            responsavelId: '1',
            responsavelNome: 'João Silva',
            dataAcao: new Date('2024-01-15')
          },
          {
            id: '2',
            notaFiscalId: 1,
            acao: AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO,
            statusAnterior: StatusNotaFiscal.RASCUNHO,
            statusNovo: StatusNotaFiscal.EM_ANALISE,
            observacao: 'Enviada para aprovação',
            responsavelId: '1',
            responsavelNome: 'João Silva',
            dataAcao: new Date('2024-01-16')
          }
        ]
      },
      {
        id: 2,
        numero: '002',
        serie: '1',
        dataEmissao: new Date('2024-01-20'),
        dataVencimento: new Date('2024-02-20'),
        clienteId: 2,
        clienteNome: 'KETRA SOLUÇÕES INTELIGENTES',
        clienteCnpjCpf: '12.345.678/0001-90',
        valorTotal: 2500.00,
        valorBaseIcms: 2500.00,
        valorIcms: 450.00,
        valorBaseIpi: 0,
        valorIpi: 0,
        valorBasePis: 2500.00,
        valorPis: 16.25,
        valorBaseCofins: 2500.00,
        valorCofins: 75.00,
        status: StatusNotaFiscal.APROVADA,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal aprovada',
        itens: [
          {
            id: 3,
            notaFiscalId: 2,
            produtoId: 3,
            produtoCodigo: '003',
            produtoDescricao: 'Solução Tecnológica Ketra',
            quantidade: 5,
            valorUnitario: 500.00,
            valorTotal: 2500.00,
            cfop: '5102',
            ncm: '84713000',
            unidadeComercial: 'UN',
            valorBaseIcms: 2500.00,
            valorIcms: 450.00,
            aliquotaIcms: 18.00,
            observacoes: 'Item de exemplo'
          }
        ],
        aprovadorId: '3',
        aprovadorNome: 'Carlos Oliveira',
        dataAprovacao: new Date('2024-01-21'),
        observacaoAprovacao: 'Nota fiscal aprovada pelo gestor financeiro',
        dataInclusao: new Date('2024-01-18'),
        idRespInclusao: '2',
        nomeRespInclusao: 'Maria Santos',
        historicoAprovacao: [
          {
            id: '3',
            notaFiscalId: 2,
            acao: AcaoAprovacaoNotaFiscal.CRIACAO,
            statusNovo: StatusNotaFiscal.RASCUNHO,
            observacao: 'Nota fiscal criada',
            responsavelId: '2',
            responsavelNome: 'Maria Santos',
            dataAcao: new Date('2024-01-18')
          },
          {
            id: '4',
            notaFiscalId: 2,
            acao: AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO,
            statusAnterior: StatusNotaFiscal.RASCUNHO,
            statusNovo: StatusNotaFiscal.EM_ANALISE,
            observacao: 'Enviada para aprovação',
            responsavelId: '2',
            responsavelNome: 'Maria Santos',
            dataAcao: new Date('2024-01-19')
          },
          {
            id: '5',
            notaFiscalId: 2,
            acao: AcaoAprovacaoNotaFiscal.APROVAR,
            statusAnterior: StatusNotaFiscal.EM_ANALISE,
            statusNovo: StatusNotaFiscal.APROVADA,
            observacao: 'Nota fiscal aprovada',
            responsavelId: '3',
            responsavelNome: 'Carlos Oliveira',
            dataAcao: new Date('2024-01-21')
          }
        ]
      },
      {
        id: 3,
        numero: '003',
        serie: '1',
        dataEmissao: new Date('2024-01-25'),
        dataVencimento: new Date('2024-02-25'),
        clienteId: 3,
        clienteNome: 'Comércio Teste ME',
        clienteCnpjCpf: '11.222.333/0001-44',
        valorTotal: 800.00,
        valorBaseIcms: 800.00,
        valorIcms: 144.00,
        valorBaseIpi: 0,
        valorIpi: 0,
        valorBasePis: 800.00,
        valorPis: 5.20,
        valorBaseCofins: 800.00,
        valorCofins: 24.00,
        status: StatusNotaFiscal.REPROVADA,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal reprovada - valores incorretos',
        itens: [
          {
            id: 4,
            notaFiscalId: 3,
            produtoId: 4,
            produtoCodigo: '004',
            produtoDescricao: 'Produto Reprovado',
            quantidade: 2,
            valorUnitario: 400.00,
            valorTotal: 800.00,
            cfop: '5102',
            ncm: '84713000',
            unidadeComercial: 'UN',
            valorBaseIcms: 800.00,
            valorIcms: 144.00,
            aliquotaIcms: 18.00,
            observacoes: 'Item reprovado'
          }
        ],
        dataInclusao: new Date('2024-01-22'),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva',
        historicoAprovacao: [
          {
            id: '6',
            notaFiscalId: 3,
            acao: AcaoAprovacaoNotaFiscal.CRIACAO,
            statusNovo: StatusNotaFiscal.RASCUNHO,
            observacao: 'Nota fiscal criada',
            responsavelId: '1',
            responsavelNome: 'João Silva',
            dataAcao: new Date('2024-01-22')
          },
          {
            id: '7',
            notaFiscalId: 3,
            acao: AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO,
            statusAnterior: StatusNotaFiscal.RASCUNHO,
            statusNovo: StatusNotaFiscal.EM_ANALISE,
            observacao: 'Enviada para aprovação',
            responsavelId: '1',
            responsavelNome: 'João Silva',
            dataAcao: new Date('2024-01-23')
          },
          {
            id: '8',
            notaFiscalId: 3,
            acao: AcaoAprovacaoNotaFiscal.REPROVAR,
            statusAnterior: StatusNotaFiscal.EM_ANALISE,
            statusNovo: StatusNotaFiscal.REPROVADA,
            observacao: 'Valores incorretos - necessário correção',
            responsavelId: '3',
            responsavelNome: 'Carlos Oliveira',
            dataAcao: new Date('2024-01-24')
          }
        ]
      }
    ];
    this.totalRecords = this.notasFiscais.length;
  }

  novaNotaFiscal(): void {
    if (!this.canCreate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para criar notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = {
      numero: '',
      serie: '',
      dataEmissao: new Date(),
      dataVencimento: new Date(),
      clienteId: 0,
      clienteNome: '',
      clienteCnpjCpf: '',
      valorTotal: 0,
      valorBaseIcms: 0,
      valorIcms: 0,
      valorBaseIpi: 0,
      valorIpi: 0,
      valorBasePis: 0,
      valorPis: 0,
      valorBaseCofins: 0,
      valorCofins: 0,
      status: StatusNotaFiscal.RASCUNHO,
      tipoOperacao: TipoOperacao.SAIDA,
      naturezaOperacao: 'Venda de mercadoria',
      itens: [],
      dataInclusao: new Date(),
      idRespInclusao: getUserIdFromStorage(),
      nomeRespInclusao: 'Usuário Atual'
    };
    this.displayDialog = true;
  }

  editarNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canEdit) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para editar notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.displayDialog = true;
  }

  visualizarNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canView) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para visualizar notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.displayDialog = true;
  }

  aprovarNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canApprove) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para aprovar notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.acaoSelecionada = AcaoAprovacaoNotaFiscal.APROVAR;
    this.displayDialogAprovacao = true;
  }

  reprovarNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canReject) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para reprovar notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.acaoSelecionada = AcaoAprovacaoNotaFiscal.REPROVAR;
    this.displayDialogAprovacao = true;
  }

  enviarParaAprovacao(notaFiscal: NotaFiscal): void {
    if (!this.canEdit) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para enviar notas fiscais para aprovação',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.acaoSelecionada = AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO;
    this.displayDialogAprovacao = true;
  }

  emitirNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canEmit) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para emitir notas fiscais',
        life: 3000
      });
      return;
    }

    this.notaFiscalSelecionada = { ...notaFiscal };
    this.acaoSelecionada = AcaoAprovacaoNotaFiscal.EMITIR;
    this.displayDialogAprovacao = true;
  }

  executarAcao(): void {
    if (!this.notaFiscalSelecionada || !this.acaoSelecionada) return;

    this.loading = true;
    const statusAnterior = this.notaFiscalSelecionada.status;
    let novoStatus: StatusNotaFiscal;

    switch (this.acaoSelecionada) {
      case AcaoAprovacaoNotaFiscal.APROVAR:
        novoStatus = StatusNotaFiscal.APROVADA;
        break;
      case AcaoAprovacaoNotaFiscal.REPROVAR:
        novoStatus = StatusNotaFiscal.REPROVADA;
        break;
      case AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO:
        novoStatus = StatusNotaFiscal.EM_ANALISE;
        break;
      case AcaoAprovacaoNotaFiscal.EMITIR:
        novoStatus = StatusNotaFiscal.EMITIDA;
        break;
      default:
        novoStatus = statusAnterior;
    }

    const notaFiscalAtualizada = {
      ...this.notaFiscalSelecionada,
      status: novoStatus,
      dataUltimaAlteracao: new Date(),
      idRespUltimaAlteracao: getUserIdFromStorage(),
      nomeRespUltimaAlteracao: 'Usuário Atual'
    };

    if (this.acaoSelecionada === AcaoAprovacaoNotaFiscal.APROVAR) {
      notaFiscalAtualizada.aprovadorId = getUserIdFromStorage();
      notaFiscalAtualizada.aprovadorNome = 'Usuário Atual';
      notaFiscalAtualizada.dataAprovacao = new Date();
      notaFiscalAtualizada.observacaoAprovacao = this.observacaoAprovacao;
    }

    this.notaFiscalService.update('notaFiscalRoutes', this.notaFiscalSelecionada.id!, notaFiscalAtualizada)
      .subscribe({
        next: (response: Result<NotaFiscal>) => {
          if (response.isSuccess) {
            // Adicionar ao histórico
            const historico: HistoricoAprovacaoNotaFiscal = {
              id: Date.now().toString(),
              notaFiscalId: this.notaFiscalSelecionada!.id!,
              acao: this.acaoSelecionada!,
              statusAnterior,
              statusNovo: novoStatus,
              observacao: this.observacaoAprovacao,
              responsavelId: getUserIdFromStorage(),
              responsavelNome: 'Usuário Atual',
              dataAcao: new Date()
            };

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Nota fiscal ${this.getAcaoLabel(this.acaoSelecionada!)} com sucesso`,
              life: 3000
            });

            this.displayDialogAprovacao = false;
            this.observacaoAprovacao = '';
            this.acaoSelecionada = null;
            this.carregarNotasFiscais();
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

  visualizarHistorico(notaFiscal: NotaFiscal): void {
    this.notaFiscalSelecionada = { ...notaFiscal };
    this.displayDialogHistorico = true;
  }

  salvarNotaFiscal(): void {
    if (!this.notaFiscalSelecionada) return;

    this.loading = true;
    
    if (this.notaFiscalSelecionada.id) {
      // Atualizar nota fiscal existente
      this.notaFiscalService.update('notaFiscalRoutes', this.notaFiscalSelecionada.id, this.notaFiscalSelecionada)
        .subscribe({
          next: (response: Result<NotaFiscal>) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Nota fiscal salva com sucesso',
                life: 3000
              });
              this.displayDialog = false;
              this.carregarNotasFiscais();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao salvar nota fiscal',
                life: 3000
              });
            }
            this.loading = false;
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao salvar nota fiscal',
              life: 3000
            });
            this.loading = false;
          }
        });
    } else {
      // Criar nova nota fiscal
      this.notaFiscalService.post('notaFiscalRoutes', this.notaFiscalSelecionada)
        .subscribe({
          next: (response: Result<NotaFiscal>) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Nota fiscal criada com sucesso',
                life: 3000
              });
              this.displayDialog = false;
              this.carregarNotasFiscais();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao criar nota fiscal',
                life: 3000
              });
            }
            this.loading = false;
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar nota fiscal',
              life: 3000
            });
            this.loading = false;
          }
        });
    }
  }

  aplicarFiltros(): void {
    this.carregarNotasFiscais();
  }

  limparFiltros(): void {
    this.filtro = {};
    this.carregarNotasFiscais();
  }

  formatarMoeda(valor: number): string {
    return formatCurrency(valor);
  }

  formatarData(data: Date): string {
    return formatarDataParaDDMMYYYY(data);
  }

  getStatusClass(status: StatusNotaFiscal): 'success' | 'danger' | 'warning' | 'info' | 'secondary' {
    switch (status) {
      case StatusNotaFiscal.APROVADA:
        return 'success';
      case StatusNotaFiscal.REPROVADA:
        return 'danger';
      case StatusNotaFiscal.EMITIDA:
        return 'success';
      case StatusNotaFiscal.CANCELADA:
        return 'danger';
      case StatusNotaFiscal.CONTINGENCIA:
        return 'warning';
      case StatusNotaFiscal.EM_ANALISE:
        return 'warning';
      default:
        return 'info';
    }
  }

  getAcaoLabel(acao: AcaoAprovacaoNotaFiscal): string {
    switch (acao) {
      case AcaoAprovacaoNotaFiscal.APROVAR:
        return 'aprovada';
      case AcaoAprovacaoNotaFiscal.REPROVAR:
        return 'reprovada';
      case AcaoAprovacaoNotaFiscal.ENVIAR_APROVACAO:
        return 'enviada para aprovação';
      case AcaoAprovacaoNotaFiscal.EMITIR:
        return 'emitida';
      default:
        return 'processada';
    }
  }

  podeAprovar(notaFiscal: NotaFiscal): boolean {
    return this.canApprove && notaFiscal.status === StatusNotaFiscal.EM_ANALISE;
  }

  podeReprovar(notaFiscal: NotaFiscal): boolean {
    return this.canReject && notaFiscal.status === StatusNotaFiscal.EM_ANALISE;
  }

  podeEnviarParaAprovacao(notaFiscal: NotaFiscal): boolean {
    return this.canEdit && notaFiscal.status === StatusNotaFiscal.RASCUNHO;
  }

  podeEmitir(notaFiscal: NotaFiscal): boolean {
    return this.canEmit && notaFiscal.status === StatusNotaFiscal.APROVADA;
  }

  podeEditar(notaFiscal: NotaFiscal): boolean {
    return this.canEdit && (notaFiscal.status === StatusNotaFiscal.RASCUNHO || notaFiscal.status === StatusNotaFiscal.REPROVADA);
  }

  cancelar(): void {
    // Implementar lógica de cancelamento
    console.log('Cancelando emissão de nota fiscal');
  }
} 