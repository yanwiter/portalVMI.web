import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface Relatorio {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  ultimaExecucao: Date;
  proximaExecucao: Date;
  status: 'ativo' | 'inativo' | 'erro';
  formato: string[];
  agendamento: string;
}

@Component({
  selector: 'app-relatorios-avancados',
  templateUrl: './relatorios-avancados.component.html',
  styleUrls: ['./relatorios-avancados.component.scss']
})
export class RelatoriosAvancadosComponent implements OnInit {
  relatorios: Relatorio[] = [];
  categorias: string[] = [];
  formatos: string[] = ['PDF', 'Excel', 'CSV', 'HTML'];
  agendamentos: string[] = ['Diário', 'Semanal', 'Mensal', 'Trimestral', 'Anual'];
  
  selectedRelatorio: Relatorio | null = null;
  displayDialog = false;
  isNewRelatorio = false;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadRelatorios();
    this.loadCategorias();
  }

  loadRelatorios(): void {
    this.relatorios = [
      {
        id: 1,
        nome: 'Relatório de Vendas por Região',
        categoria: 'Vendas',
        descricao: 'Análise detalhada de vendas por região geográfica',
        ultimaExecucao: new Date('2024-01-15'),
        proximaExecucao: new Date('2024-02-15'),
        status: 'ativo',
        formato: ['PDF', 'Excel'],
        agendamento: 'Mensal'
      },
      {
        id: 2,
        nome: 'Dashboard Financeiro Executivo',
        categoria: 'Financeiro',
        descricao: 'Indicadores financeiros para tomada de decisão',
        ultimaExecucao: new Date('2024-01-20'),
        proximaExecucao: new Date('2024-01-27'),
        status: 'ativo',
        formato: ['PDF', 'HTML'],
        agendamento: 'Semanal'
      },
      {
        id: 3,
        nome: 'Análise de Produtividade RH',
        categoria: 'Recursos Humanos',
        descricao: 'Métricas de produtividade e performance',
        ultimaExecucao: new Date('2024-01-10'),
        proximaExecucao: new Date('2024-02-10'),
        status: 'erro',
        formato: ['Excel', 'CSV'],
        agendamento: 'Mensal'
      }
    ];
  }

  loadCategorias(): void {
    this.categorias = ['Vendas', 'Financeiro', 'Recursos Humanos', 'Estoque', 'Produção', 'Logística'];
  }

  openNewRelatorio(): void {
    this.isNewRelatorio = true;
    this.selectedRelatorio = {
      id: 0,
      nome: '',
      categoria: '',
      descricao: '',
      ultimaExecucao: new Date(),
      proximaExecucao: new Date(),
      status: 'ativo',
      formato: [],
      agendamento: ''
    };
    this.displayDialog = true;
  }

  editRelatorio(relatorio: Relatorio): void {
    this.isNewRelatorio = false;
    this.selectedRelatorio = { ...relatorio };
    this.displayDialog = true;
  }

  deleteRelatorio(relatorio: Relatorio): void {
    this.relatorios = this.relatorios.filter(r => r.id !== relatorio.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant('RELATORIO_DELETED')
    });
  }

  saveRelatorio(): void {
    if (this.selectedRelatorio) {
      if (this.isNewRelatorio) {
        this.selectedRelatorio.id = Math.max(...this.relatorios.map(r => r.id)) + 1;
        this.relatorios.push(this.selectedRelatorio);
      } else {
        const index = this.relatorios.findIndex(r => r.id === this.selectedRelatorio?.id);
        if (index !== -1) {
          this.relatorios[index] = this.selectedRelatorio;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: this.translateService.instant('RELATORIO_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedRelatorio = null;
  }

  executeRelatorio(relatorio: Relatorio): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('INFO'),
      detail: this.translateService.instant('RELATORIO_EXECUTING')
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ativo': return 'status-active';
      case 'inativo': return 'status-inactive';
      case 'erro': return 'status-error';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ativo': return 'pi pi-check-circle';
      case 'inativo': return 'pi pi-pause-circle';
      case 'erro': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-circle';
    }
  }
} 