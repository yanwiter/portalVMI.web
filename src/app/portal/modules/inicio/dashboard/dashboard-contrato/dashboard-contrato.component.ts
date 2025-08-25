import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';
import { TranslationService } from '../../../../../shared/services/translation/translation.service';

@Component({
  selector: 'app-dashboard-contrato',
  templateUrl: './dashboard-contrato.component.html',
  styleUrl: './dashboard-contrato.component.scss'
})
export class DashboardContratoComponent implements OnInit {

  // Dados para cards de estatísticas
  totalContratos: number = 1245;
  contratosVigentes: number = 856;
  contratosEncerrados: number = 324;
  contratosCancelados: number = 65;
  valorTotalContratos: number = 15420000;

  // Dados para gráficos
  contratosPorStatus = {
    labels: ['Vigentes', 'Encerrados', 'Cancelados', 'Pendentes'],
    datasets: [
      {
        data: [856, 324, 65, 0],
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FF9800'],
        hoverBackgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FF9800']
      }
    ]
  };

  contratosPorTipo = {
    labels: ['Compra', 'Venda', 'Serviços', 'Licenciamento'],
    datasets: [
      {
        label: 'Contratos por Tipo',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [45, 35, 15, 5]
      }
    ]
  };

  valorContratosUltimosMeses = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Valor dos Contratos (R$)',
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
        data: [1200000, 1800000, 1500000, 2200000, 1900000, 2100000]
      }
    ]
  };

  // Dados para gráfico de duração
  duracaoContratos = {
    labels: ['0-6 meses', '6-12 meses', '1-2 anos', '2+ anos'],
    datasets: [
      {
        data: [25, 40, 25, 10],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }
    ]
  };

  // Opções dos gráficos
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      }
    }
  };

  chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Dados para tabela de contratos recentes
  contratosRecentes = [
    { numero: 'CTR-2024-001', cliente: 'Hospital São Lucas', tipo: 'Venda', valor: 250000, status: 'Vigente', dataInicio: '2024-01-15', dataFim: '2024-12-31' },
    { numero: 'CTR-2024-002', cliente: 'Clínica Santa Maria', tipo: 'Compra', valor: 180000, status: 'Vigente', dataInicio: '2024-01-20', dataFim: '2024-06-30' },
    { numero: 'CTR-2024-003', cliente: 'Centro Médico ABC', tipo: 'Serviços', valor: 95000, status: 'Vigente', dataInicio: '2024-02-01', dataFim: '2024-08-31' },
    { numero: 'CTR-2024-004', cliente: 'Hospital Universitário', tipo: 'Venda', valor: 320000, status: 'Vigente', dataInicio: '2024-02-15', dataFim: '2024-12-31' },
    { numero: 'CTR-2024-005', cliente: 'Clínica Especializada', tipo: 'Licenciamento', valor: 75000, status: 'Vigente', dataInicio: '2024-03-01', dataFim: '2024-09-30' }
  ];

  // Período selecionado
  periodoSelecionado: string = 'Últimos 6 meses';
  periodos = [
    { label: 'Últimos 3 meses', value: '3' },
    { label: 'Últimos 6 meses', value: '6' },
    { label: 'Último ano', value: '12' }
  ];

  constructor(
    private translationService: TranslationService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    // Aqui você implementaria a chamada para a API
    console.log('Carregando dados do dashboard de contratos...');
  }

  onPeriodoChange(): void {
    this.carregarDados();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'Vigente': return 'success';
      case 'Encerrado': return 'info';
      case 'Cancelado': return 'danger';
      case 'Pendente': return 'warning';
      default: return 'info';
    }
  }

  getTipoSeverity(tipo: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (tipo) {
      case 'Venda': return 'success';
      case 'Compra': return 'info';
      case 'Serviços': return 'warning';
      case 'Licenciamento': return 'secondary';
      default: return 'info';
    }
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  // Método para tradução
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  // Getter para verificar se é tema escuro
  get isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }
}
