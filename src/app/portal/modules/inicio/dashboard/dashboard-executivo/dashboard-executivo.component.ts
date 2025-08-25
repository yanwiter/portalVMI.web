import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-dashboard-executivo',
  templateUrl: './dashboard-executivo.component.html',
  styleUrls: ['./dashboard-executivo.component.scss']
})
export class DashboardExecutivoComponent implements OnInit {
  
  // Dados para gráficos
  vendasData: any;
  receitasData: any;
  lucroData: any;
  clientesData: any;
  
  // KPIs principais
  kpis = {
    vendasMes: 1250000,
    receitasMes: 980000,
    lucroMes: 320000,
    clientesAtivos: 1450,
    crescimentoVendas: 12.5,
    margemLucro: 25.6
  };

  constructor(
    private messageService: MessageService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.initializeCharts();
  }

  initializeCharts() {
    // Gráfico de vendas
    this.vendasData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Vendas (R$)',
          data: [850000, 920000, 1100000, 1250000, 1180000, 1250000],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }
      ]
    };

    // Gráfico de receitas
    this.receitasData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Receitas (R$)',
          data: [680000, 750000, 880000, 980000, 920000, 980000],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }
      ]
    };

    // Gráfico de lucro
    this.lucroData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Lucro (R$)',
          data: [220000, 250000, 280000, 320000, 290000, 320000],
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4
        }
      ]
    };

    // Gráfico de clientes
    this.clientesData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Clientes Ativos',
          data: [1200, 1250, 1300, 1350, 1400, 1450],
          borderColor: '#9C27B0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  // Opções dos gráficos
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Métodos para ações
  onRefresh() {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Dashboard atualizado com sucesso!'
    });
  }

  onExport() {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportação',
      detail: 'Relatório exportado com sucesso!'
    });
  }

  // Getter para verificar se é tema escuro
  get isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }
} 