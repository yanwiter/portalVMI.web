import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NotaFiscal, StatusNotaFiscal, TipoOperacao, FiltroNotaFiscal } from '../../../../shared/models/notaFiscal.model';
import { statusNotaFiscalOptions } from '../../../../shared/models/options/statusNotaFiscal.options';
import { tipoOperacaoOptions } from '../../../../shared/models/options/tipoOperacao.options';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { Result } from '../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { gerarXmlNotaFiscal } from '../../../../shared/util/xmlUtil';

@Component({
  selector: 'app-nota-fiscal',
  templateUrl: './nota-fiscal.component.html',
  styleUrls: ['./nota-fiscal.component.scss']
})
export class NotaFiscalComponent implements OnInit {
  notasFiscais: NotaFiscal[] = [];
  notaFiscalSelecionada: NotaFiscal | null = null;
  displayDialog = false;
  displayDialogEmissao = false;
  displayDialogDanfe = false;
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
  canEmit = false;
  canCancel = false;

  // Para acesso ao window no template
  window = window;

  constructor(
    private notaFiscalService: GenericService<NotaFiscal>,
    private messageService: MessageService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.carregarNotasFiscais();
    this.carregarNotasFiscaisTeste(); // Carregar dados de teste
  }


  carregarNotasFiscais(): void {
    this.loading = true;
    this.notaFiscalService.getAll('notaFiscalRoutes')
      .subscribe({
        next: (response: Result<NotaFiscal[]>) => {
          if (response.isSuccess && response.data) {
            this.notasFiscais = response.data;
            this.totalRecords = response.data.length;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao carregar notas fiscais',
              life: 3000
            });
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
      idRespInclusao: '1',
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
    this.displayDialogEmissao = true;
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

  cancelarNotaFiscal(notaFiscal: NotaFiscal): void {
    if (!this.canCancel) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para cancelar notas fiscais',
        life: 3000
      });
      return;
    }

    if (!notaFiscal.id) return;
    
    this.loading = true;
    this.notaFiscalService.update('notaFiscalRoutes', notaFiscal.id, { ...notaFiscal, status: StatusNotaFiscal.CANCELADA })
      .subscribe({
        next: (response: Result<NotaFiscal>) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Nota fiscal cancelada com sucesso',
              life: 3000
            });
            this.carregarNotasFiscais();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao cancelar nota fiscal',
              life: 3000
            });
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao cancelar nota fiscal',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  aplicarFiltros(): void {
    this.first = 0;
    this.carregarNotasFiscais();
  }

  limparFiltros(): void {
    this.filtro = {};
    this.aplicarFiltros();
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getStatusClass(status: StatusNotaFiscal): string {
    switch (status) {
      case StatusNotaFiscal.EMITIDA:
        return 'status-emitida';
      case StatusNotaFiscal.CANCELADA:
        return 'status-cancelada';
      case StatusNotaFiscal.CONTINGENCIA:
        return 'status-contingencia';
      default:
        return 'status-rascunho';
    }
  }

  carregarNotasFiscaisTeste(): void {
    // Dados de teste para desenvolvimento
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
        status: StatusNotaFiscal.EMITIDA,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal de teste',
        dataInclusao: new Date('2024-01-15'),
        idRespInclusao: '1',
        nomeRespInclusao: 'João Silva',
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
          },
          {
            id: 2,
            notaFiscalId: 1,
            produtoId: 2,
            produtoCodigo: '002',
            produtoDescricao: 'Produto Teste 2',
            quantidade: 1,
            valorUnitario: 500.00,
            valorTotal: 500.00,
            cfop: '5102',
            ncm: '84713000',
            unidadeComercial: 'UN',
            valorBaseIcms: 500.00,
            valorIcms: 90.00,
            aliquotaIcms: 18.00,
            observacoes: 'Item de teste'
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
        status: StatusNotaFiscal.RASCUNHO,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal em rascunho',
        dataInclusao: new Date('2024-01-20'),
        idRespInclusao: '2',
        nomeRespInclusao: 'Maria Santos',
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
        status: StatusNotaFiscal.CANCELADA,
        tipoOperacao: TipoOperacao.SAIDA,
        naturezaOperacao: 'Venda de mercadoria',
        observacoes: 'Nota fiscal cancelada',
        dataInclusao: new Date('2024-01-25'),
        idRespInclusao: '3',
        nomeRespInclusao: 'Pedro Costa',
        itens: [
          {
            id: 4,
            notaFiscalId: 3,
            produtoId: 4,
            produtoCodigo: '004',
            produtoDescricao: 'Solução Ketra Cancelada',
            quantidade: 2,
            valorUnitario: 400.00,
            valorTotal: 800.00,
            cfop: '5102',
            ncm: '84713000',
            unidadeComercial: 'UN',
            valorBaseIcms: 800.00,
            valorIcms: 144.00,
            aliquotaIcms: 18.00,
            observacoes: 'Item cancelado'
          }
        ]
      }
    ];
    this.totalRecords = this.notasFiscais.length;
  }

  visualizarDanfe(notaFiscal: NotaFiscal): void {

    console.log('Visualizando DANFE da nota fiscal:', notaFiscal.numero);
    
    this.notaFiscalSelecionada = { ...notaFiscal };
    this.displayDialogDanfe = true;
  }

  gerarDanfe(notaFiscal: NotaFiscal): void {

    console.log('Gerando DANFE da nota fiscal:', notaFiscal.numero);
    
    // Simular geração da DANFE
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'DANFE Gerada',
        detail: `DANFE da nota fiscal ${notaFiscal.numero} foi gerada com sucesso!`,
        life: 3000
      });
    }, 2000);
  }

  baixarXml(notaFiscal: NotaFiscal): void {

    console.log('Baixando XML da nota fiscal:', notaFiscal.numero);
    
    this.loading = true;
    
    // Simular delay para mostrar loading
    setTimeout(() => {
      try {
        // Gerar XML usando a função utilitária
        const xmlContent = gerarXmlNotaFiscal(notaFiscal);
        
        // Criar blob com o XML
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
        
        this.handleXmlDownloadSuccess(blob, notaFiscal);
        this.loading = false;
      } catch (error) {
        console.error('Erro ao gerar XML:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao gerar XML da nota fiscal',
          life: 3000
        });
        this.loading = false;
      }
    }, 1000);
  }

  private handleXmlDownloadSuccess(blob: Blob, notaFiscal: NotaFiscal): void {
    const dataAtual = new Date().toISOString().split('T')[0];
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `NFe_${notaFiscal.numero}_${dataAtual}.xml`;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    this.messageService.add({
      severity: 'success',
      summary: 'XML Baixado',
      detail: `XML da nota fiscal ${notaFiscal.numero} foi baixado com sucesso!`,
      life: 3000
    });
  }
} 