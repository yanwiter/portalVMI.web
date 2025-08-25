import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface ModeloPredicao {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  precisao: number;
  status: 'ativo' | 'treinando' | 'inativo' | 'erro';
  ultimaAtualizacao: Date;
  proximaExecucao: Date;
  metricas: {
    acuracia: number;
    precisao: number;
    recall: number;
    f1Score: number;
  };
}

interface Predicao {
  id: number;
  modelo: string;
  entrada: any;
  resultado: any;
  confianca: number;
  dataPredicao: Date;
  status: 'processando' | 'concluido' | 'erro';
}

@Component({
  selector: 'app-analises-preditivas',
  templateUrl: './analises-preditivas.component.html',
  styleUrls: ['./analises-preditivas.component.scss']
})
export class AnalisesPreditivasComponent implements OnInit {
  modelos: ModeloPredicao[] = [];
  modelosFiltrados: ModeloPredicao[] = [];
  predicoes: Predicao[] = [];
  tiposModelo: string[] = ['Classificação', 'Regressão', 'Clustering', 'Série Temporal'];
  statusOptions: string[] = ['Todos', 'Ativo', 'Treinando', 'Inativo', 'Erro'];
  
  // Filtros
  filtroTipo: string | null = null;
  filtroStatus: string | null = null;
  
  selectedModelo: ModeloPredicao | null = null;
  displayDialog = false;
  isNewModelo = false;
  
  // Dados para gráficos
  chartData: any;
  chartOptions: any;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadModelos();
    this.loadPredicoes();
    this.initChartData();
    this.aplicarFiltros();
  }

  loadModelos(): void {
    this.modelos = [
      {
        id: 1,
        nome: 'Modelo de Demanda de Produtos',
        tipo: 'Série Temporal',
        descricao: 'Prediz a demanda futura baseada em dados históricos',
        precisao: 87.5,
        status: 'ativo',
        ultimaAtualizacao: new Date('2024-01-20'),
        proximaExecucao: new Date('2024-01-27'),
        metricas: {
          acuracia: 0.875,
          precisao: 0.892,
          recall: 0.856,
          f1Score: 0.874
        }
      },
      {
        id: 2,
        nome: 'Classificador de Risco de Crédito',
        tipo: 'Classificação',
        descricao: 'Avalia o risco de crédito de clientes',
        precisao: 92.3,
        status: 'ativo',
        ultimaAtualizacao: new Date('2024-01-18'),
        proximaExecucao: new Date('2024-01-25'),
        metricas: {
          acuracia: 0.923,
          precisao: 0.934,
          recall: 0.918,
          f1Score: 0.926
        }
      },
      {
        id: 3,
        nome: 'Segmentação de Clientes',
        tipo: 'Clustering',
        descricao: 'Agrupa clientes por comportamento de compra',
        precisao: 78.9,
        status: 'treinando',
        ultimaAtualizacao: new Date('2024-01-15'),
        proximaExecucao: new Date('2024-01-22'),
        metricas: {
          acuracia: 0.789,
          precisao: 0.801,
          recall: 0.776,
          f1Score: 0.788
        }
      },
      {
        id: 4,
        nome: 'Preditor de Vendas',
        tipo: 'Regressão',
        descricao: 'Prediz vendas futuras baseado em fatores de mercado',
        precisao: 85.2,
        status: 'ativo',
        ultimaAtualizacao: new Date('2024-01-19'),
        proximaExecucao: new Date('2024-01-26'),
        metricas: {
          acuracia: 0.852,
          precisao: 0.861,
          recall: 0.843,
          f1Score: 0.852
        }
      },
      {
        id: 5,
        nome: 'Análise de Sentimento',
        tipo: 'Classificação',
        descricao: 'Analisa sentimento de comentários de clientes',
        precisao: 91.7,
        status: 'inativo',
        ultimaAtualizacao: new Date('2024-01-10'),
        proximaExecucao: new Date('2024-01-17'),
        metricas: {
          acuracia: 0.917,
          precisao: 0.925,
          recall: 0.908,
          f1Score: 0.916
        }
      }
    ];
  }

  loadPredicoes(): void {
    this.predicoes = [
      {
        id: 1,
        modelo: 'Modelo de Demanda de Produtos',
        entrada: { produto: 'Produto A', periodo: 'Janeiro 2024' },
        resultado: { demanda: 1250, intervalo: [1100, 1400] },
        confianca: 0.87,
        dataPredicao: new Date('2024-01-20'),
        status: 'concluido'
      },
      {
        id: 2,
        modelo: 'Classificador de Risco de Crédito',
        entrada: { cliente: 'Cliente B', score: 750 },
        resultado: { risco: 'Baixo', probabilidade: 0.92 },
        confianca: 0.92,
        dataPredicao: new Date('2024-01-19'),
        status: 'concluido'
      }
    ];
  }

  initChartData(): void {
    this.chartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Precisão Média',
          data: [85, 87, 89, 88, 90, 92],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        },
        {
          label: 'Taxa de Erro',
          data: [15, 13, 11, 12, 10, 8],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: '#dee2e6'
          }
        },
        y: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: '#dee2e6'
          }
        }
      }
    };
  }

  aplicarFiltros(): void {
    this.modelosFiltrados = this.modelos.filter(modelo => {
      const passaFiltroTipo = !this.filtroTipo || modelo.tipo === this.filtroTipo;
      const passaFiltroStatus = !this.filtroStatus || 
                               this.filtroStatus === 'Todos' || 
                               modelo.status === this.filtroStatus.toLowerCase();
      
      return passaFiltroTipo && passaFiltroStatus;
    });
  }

  onFiltroTipoChange(): void {
    this.aplicarFiltros();
  }

  onFiltroStatusChange(): void {
    this.aplicarFiltros();
  }

  openNewModelo(): void {
    this.isNewModelo = true;
    this.selectedModelo = {
      id: 0,
      nome: '',
      tipo: '',
      descricao: '',
      precisao: 0,
      status: 'ativo',
      ultimaAtualizacao: new Date(),
      proximaExecucao: new Date(),
      metricas: {
        acuracia: 0,
        precisao: 0,
        recall: 0,
        f1Score: 0
      }
    };
    this.displayDialog = true;
  }

  editModelo(modelo: ModeloPredicao): void {
    this.isNewModelo = false;
    this.selectedModelo = { ...modelo };
    this.displayDialog = true;
  }

  deleteModelo(modelo: ModeloPredicao): void {
    this.modelos = this.modelos.filter(m => m.id !== modelo.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('ANALISES_PREDITIVAS.SUCCESS'),
      detail: this.translateService.instant('ANALISES_PREDITIVAS.MODELO_DELETED')
    });
  }

  saveModelo(): void {
    if (this.selectedModelo) {
      if (this.isNewModelo) {
        this.selectedModelo.id = Math.max(...this.modelos.map(m => m.id)) + 1;
        this.modelos.push(this.selectedModelo);
      } else {
        const index = this.modelos.findIndex(m => m.id === this.selectedModelo?.id);
        if (index !== -1) {
          this.modelos[index] = this.selectedModelo;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('ANALISES_PREDITIVAS.SUCCESS'),
        detail: this.translateService.instant('ANALISES_PREDITIVAS.MODELO_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedModelo = null;
  }

  treinarModelo(modelo: ModeloPredicao): void {
    modelo.status = 'treinando';
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('ANALISES_PREDITIVAS.INFO'),
      detail: this.translateService.instant('ANALISES_PREDITIVAS.MODELO_TREINANDO')
    });
  }

  executarPredicao(modelo: ModeloPredicao): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('ANALISES_PREDITIVAS.INFO'),
      detail: this.translateService.instant('ANALISES_PREDITIVAS.PREDICAO_EXECUTANDO')
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ativo': return 'status-active';
      case 'treinando': return 'status-training';
      case 'inativo': return 'status-inactive';
      case 'erro': return 'status-error';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ativo': return 'pi pi-check-circle';
      case 'treinando': return 'pi pi-spin pi-spinner';
      case 'inativo': return 'pi pi-pause-circle';
      case 'erro': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-circle';
    }
  }

  getPrecisaoClass(precisao: number): string {
    if (precisao >= 90) return 'precisao-excelente';
    if (precisao >= 80) return 'precisao-boa';
    if (precisao >= 70) return 'precisao-regular';
    return 'precisao-ruim';
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getTotalModelos(): number {
    return this.modelos.length;
  }

  getModelosAtivos(): number {
    return this.modelos.filter(m => m.status === 'ativo').length;
  }

  getModelosTreinando(): number {
    return this.modelos.filter(m => m.status === 'treinando').length;
  }

  getPrecisaoMedia(): string {
    if (this.modelos.length === 0) return '0.0';
    const media = this.modelos.reduce((acc, m) => acc + m.precisao, 0) / this.modelos.length;
    return media.toFixed(1);
  }
} 