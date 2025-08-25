import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface PipelineStage {
  id: number;
  nome: string;
  cor: string;
  oportunidades: any[];
  valorTotal: number;
  probabilidadeMedia: number;
}

@Component({
  selector: 'app-pipeline-vendas',
  templateUrl: './pipeline-vendas.component.html',
  styleUrls: ['./pipeline-vendas.component.scss']
})
export class PipelineVendasComponent implements OnInit {
  pipelineStages: PipelineStage[] = [];
  
  // Dados para gráficos
  chartData: any;
  chartOptions: any;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPipelineData();
    this.initChartData();
  }

  loadPipelineData(): void {
    this.pipelineStages = [
      {
        id: 1,
        nome: 'Prospecção',
        cor: '#3B82F6',
        oportunidades: [
          { id: 1, titulo: 'Cliente A', valor: 50000, probabilidade: 20 },
          { id: 2, titulo: 'Cliente B', valor: 75000, probabilidade: 30 }
        ],
        valorTotal: 125000,
        probabilidadeMedia: 25
      },
      {
        id: 2,
        nome: 'Qualificação',
        cor: '#06B6D4',
        oportunidades: [
          { id: 3, titulo: 'Cliente C', valor: 100000, probabilidade: 50 },
          { id: 4, titulo: 'Cliente D', valor: 60000, probabilidade: 40 }
        ],
        valorTotal: 160000,
        probabilidadeMedia: 45
      },
      {
        id: 3,
        nome: 'Proposta',
        cor: '#8B5CF6',
        oportunidades: [
          { id: 5, titulo: 'Cliente E', valor: 150000, probabilidade: 70 },
          { id: 6, titulo: 'Cliente F', valor: 80000, probabilidade: 60 }
        ],
        valorTotal: 230000,
        probabilidadeMedia: 65
      },
      {
        id: 4,
        nome: 'Negociação',
        cor: '#F59E0B',
        oportunidades: [
          { id: 7, titulo: 'Cliente G', valor: 200000, probabilidade: 80 },
          { id: 8, titulo: 'Cliente H', valor: 120000, probabilidade: 85 }
        ],
        valorTotal: 320000,
        probabilidadeMedia: 82.5
      },
      {
        id: 5,
        nome: 'Fechamento',
        cor: '#10B981',
        oportunidades: [
          { id: 9, titulo: 'Cliente I', valor: 300000, probabilidade: 95 },
          { id: 10, titulo: 'Cliente J', valor: 180000, probabilidade: 90 }
        ],
        valorTotal: 480000,
        probabilidadeMedia: 92.5
      }
    ];
  }

  initChartData(): void {
    this.chartData = {
      labels: this.pipelineStages.map(stage => stage.nome),
      datasets: [
        {
          label: 'Valor Total',
          data: this.pipelineStages.map(stage => stage.valorTotal),
          backgroundColor: this.pipelineStages.map(stage => stage.cor),
          borderColor: this.pipelineStages.map(stage => stage.cor),
          borderWidth: 1
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
        y: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: '#dee2e6'
          }
        },
        x: {
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

  getValorTotalPipeline(): number {
    return this.pipelineStages.reduce((total, stage) => total + stage.valorTotal, 0);
  }

  getProbabilidadeMediaPipeline(): number {
    const totalProbabilidade = this.pipelineStages.reduce((total, stage) => total + stage.probabilidadeMedia, 0);
    return totalProbabilidade / this.pipelineStages.length;
  }

  getTotalOportunidades(): number {
    return this.pipelineStages.reduce((total, stage) => total + stage.oportunidades.length, 0);
  }
} 