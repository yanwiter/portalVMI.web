import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface Oportunidade {
  id: number;
  titulo: string;
  cliente: string;
  valor: number;
  probabilidade: number;
  fase: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento' | 'ganho' | 'perdido';
  dataCriacao: Date;
  dataFechamento: Date;
  responsavel: string;
  descricao: string;
  produtos: string[];
  status: 'ativa' | 'pausada' | 'cancelada';
}

@Component({
  selector: 'app-oportunidades',
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.scss']
})
export class OportunidadesComponent implements OnInit {
  oportunidades: Oportunidade[] = [];
  fases: string[] = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento', 'Ganho', 'Perdido'];
  responsaveis: string[] = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];
  statusOptions: string[] = ['Ativa', 'Pausada', 'Cancelada'];
  
  selectedOportunidade: Oportunidade | null = null;
  displayDialog = false;
  isNewOportunidade = false;
  
  // Filtros
  filtroFase: string = '';
  filtroResponsavel: string = '';
  filtroStatus: string = '';

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOportunidades();
  }

  loadOportunidades(): void {
    this.oportunidades = [
      {
        id: 1,
        titulo: 'Implementação ERP Cliente ABC',
        cliente: 'Empresa ABC Ltda',
        valor: 150000,
        probabilidade: 75,
        fase: 'negociacao',
        dataCriacao: new Date('2024-01-10'),
        dataFechamento: new Date('2024-03-15'),
        responsavel: 'João Silva',
        descricao: 'Implementação completa do sistema ERP para empresa do setor industrial',
        produtos: ['ERP Completo', 'Treinamento', 'Suporte 24h'],
        status: 'ativa'
      },
      {
        id: 2,
        titulo: 'Sistema de Gestão Financeira',
        cliente: 'XYZ Consultoria',
        valor: 45000,
        probabilidade: 90,
        fase: 'fechamento',
        dataCriacao: new Date('2024-01-05'),
        dataFechamento: new Date('2024-02-20'),
        responsavel: 'Maria Santos',
        descricao: 'Desenvolvimento de sistema personalizado para gestão financeira',
        produtos: ['Módulo Financeiro', 'Relatórios Customizados'],
        status: 'ativa'
      },
      {
        id: 3,
        titulo: 'Migração de Dados Legacy',
        cliente: 'Tech Solutions',
        valor: 80000,
        probabilidade: 60,
        fase: 'proposta',
        dataCriacao: new Date('2024-01-15'),
        dataFechamento: new Date('2024-04-10'),
        responsavel: 'Pedro Costa',
        descricao: 'Migração de sistema legado para nova plataforma',
        produtos: ['Migração de Dados', 'Integração API'],
        status: 'pausada'
      }
    ];
  }

  openNewOportunidade(): void {
    this.isNewOportunidade = true;
    this.selectedOportunidade = {
      id: 0,
      titulo: '',
      cliente: '',
      valor: 0,
      probabilidade: 0,
      fase: 'prospeccao',
      dataCriacao: new Date(),
      dataFechamento: new Date(),
      responsavel: '',
      descricao: '',
      produtos: [],
      status: 'ativa'
    };
    this.displayDialog = true;
  }

  editOportunidade(oportunidade: Oportunidade): void {
    this.isNewOportunidade = false;
    this.selectedOportunidade = { ...oportunidade };
    this.displayDialog = true;
  }

  deleteOportunidade(oportunidade: Oportunidade): void {
    this.oportunidades = this.oportunidades.filter(o => o.id !== oportunidade.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant('OPORTUNIDADE_DELETED')
    });
  }

  saveOportunidade(): void {
    if (this.selectedOportunidade) {
      if (this.isNewOportunidade) {
        this.selectedOportunidade.id = Math.max(...this.oportunidades.map(o => o.id)) + 1;
        this.oportunidades.push(this.selectedOportunidade);
      } else {
        const index = this.oportunidades.findIndex(o => o.id === this.selectedOportunidade?.id);
        if (index !== -1) {
          this.oportunidades[index] = this.selectedOportunidade;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: this.translateService.instant('OPORTUNIDADE_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedOportunidade = null;
  }

  getFaseClass(fase: string): string {
    switch (fase) {
      case 'prospeccao': return 'fase-prospeccao';
      case 'qualificacao': return 'fase-qualificacao';
      case 'proposta': return 'fase-proposta';
      case 'negociacao': return 'fase-negociacao';
      case 'fechamento': return 'fase-fechamento';
      case 'ganho': return 'fase-ganho';
      case 'perdido': return 'fase-perdido';
      default: return '';
    }
  }

  getFaseIcon(fase: string): string {
    switch (fase) {
      case 'prospeccao': return 'pi pi-search';
      case 'qualificacao': return 'pi pi-check-circle';
      case 'proposta': return 'pi pi-file';
      case 'negociacao': return 'pi pi-comments';
      case 'fechamento': return 'pi pi-handshake';
      case 'ganho': return 'pi pi-check';
      case 'perdido': return 'pi pi-times';
      default: return 'pi pi-circle';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ativa': return 'status-active';
      case 'pausada': return 'status-paused';
      case 'cancelada': return 'status-cancelled';
      default: return '';
    }
  }

  getProbabilidadeClass(probabilidade: number): string {
    if (probabilidade >= 80) return 'probabilidade-alta';
    if (probabilidade >= 50) return 'probabilidade-media';
    return 'probabilidade-baixa';
  }

  getOportunidadesFiltradas(): Oportunidade[] {
    return this.oportunidades.filter(oportunidade => {
      const matchFase = !this.filtroFase || oportunidade.fase === this.filtroFase.toLowerCase();
      const matchResponsavel = !this.filtroResponsavel || oportunidade.responsavel === this.filtroResponsavel;
      const matchStatus = !this.filtroStatus || oportunidade.status === this.filtroStatus.toLowerCase();
      
      return matchFase && matchResponsavel && matchStatus;
    });
  }

  getValorTotal(): number {
    return this.getOportunidadesFiltradas().reduce((total, op) => total + op.valor, 0);
  }

  getValorGanho(): number {
    return this.getOportunidadesFiltradas()
      .filter(op => op.fase === 'ganho')
      .reduce((total, op) => total + op.valor, 0);
  }
} 