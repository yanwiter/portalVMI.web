import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';
import { TranslationService } from '../../../../../shared/services/translation/translation.service';

@Component({
  selector: 'app-dashboard-cliente',
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.scss'
})
export class DashboardClienteComponent implements OnInit {

  // Dados para cards de estatísticas
  totalClientes: number = 1247;
  clientesAtivos: number = 1189;
  clientesInativos: number = 58;
  novosClientesMes: number = 23;

  // Dados para gráficos
  clientesPorPorte = {
    labels: ['Grande Porte', 'Médio Porte', 'Pequeno Porte'],
    datasets: [
      {
        data: [15, 45, 40],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  clientesPorRegiao = {
    labels: ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'],
    datasets: [
      {
        label: 'Clientes por Região',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [45, 25, 20, 7, 3]
      }
    ]
  };

  novosClientesUltimosMeses = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Novos Clientes',
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
        data: [18, 22, 15, 28, 23, 19]
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

  // Dados para tabela de clientes recentes
  clientesRecentes = [
    { nome: 'Hospital São Lucas', porte: 'Grande Porte', regiao: 'Sudeste', status: 'Ativo', dataCadastro: '2024-01-15' },
    { nome: 'Clínica Santa Maria', porte: 'Médio Porte', regiao: 'Sul', status: 'Ativo', dataCadastro: '2024-01-14' },
    { nome: 'Centro Médico ABC', porte: 'Pequeno Porte', regiao: 'Nordeste', status: 'Ativo', dataCadastro: '2024-01-13' },
    { nome: 'Hospital Universitário', porte: 'Grande Porte', regiao: 'Sudeste', status: 'Ativo', dataCadastro: '2024-01-12' },
    { nome: 'Clínica Especializada', porte: 'Médio Porte', regiao: 'Centro-Oeste', status: 'Ativo', dataCadastro: '2024-01-11' }
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
    console.log('Carregando dados do dashboard de clientes...');
  }

  onPeriodoChange(): void {
    this.carregarDados();
  }

  getStatusClass(status: string): string {
    return status === 'Ativo' ? 'status-ativo' : 'status-inativo';
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
