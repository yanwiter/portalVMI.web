import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';
import { TranslationService } from '../../../../../shared/services/translation/translation.service';

@Component({
  selector: 'app-dashboard-fornecedor',
  templateUrl: './dashboard-fornecedor.component.html',
  styleUrl: './dashboard-fornecedor.component.scss'
})
export class DashboardFornecedorComponent implements OnInit {

  // Dados para cards de estatísticas
  totalFornecedores: number = 856;
  fornecedoresAtivos: number = 823;
  fornecedoresInativos: number = 33;
  novosFornecedoresMes: number = 12;

  // Dados para gráficos
  fornecedoresPorCategoria = {
    labels: ['Equipamentos Médicos', 'Medicamentos', 'Material Hospitalar', 'Serviços', 'Tecnologia'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    ]
  };

  fornecedoresPorRegiao = {
    labels: ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'],
    datasets: [
      {
        label: 'Fornecedores por Região',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [50, 25, 15, 8, 2]
      }
    ]
  };

  novosFornecedoresUltimosMeses = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Novos Fornecedores',
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
        data: [8, 12, 9, 15, 12, 10]
      }
    ]
  };

  // Dados para gráfico de avaliação
  avaliacaoFornecedores = {
    labels: ['Excelente', 'Bom', 'Regular', 'Ruim'],
    datasets: [
      {
        data: [45, 35, 15, 5],
        backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#F44336'],
        hoverBackgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#F44336']
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

  // Dados para tabela de fornecedores recentes
  fornecedoresRecentes = [
    { nome: 'MedSupply Ltda', categoria: 'Equipamentos Médicos', regiao: 'Sudeste', status: 'Ativo', avaliacao: 'Excelente', dataCadastro: '2024-01-15' },
    { nome: 'PharmaTech', categoria: 'Medicamentos', regiao: 'Sul', status: 'Ativo', avaliacao: 'Bom', dataCadastro: '2024-01-14' },
    { nome: 'Hospitalar Express', categoria: 'Material Hospitalar', regiao: 'Nordeste', status: 'Ativo', avaliacao: 'Regular', dataCadastro: '2024-01-13' },
    { nome: 'TechMed Solutions', categoria: 'Tecnologia', regiao: 'Sudeste', status: 'Ativo', avaliacao: 'Excelente', dataCadastro: '2024-01-12' },
    { nome: 'Serviços Médicos Pro', categoria: 'Serviços', regiao: 'Centro-Oeste', status: 'Ativo', avaliacao: 'Bom', dataCadastro: '2024-01-11' }
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
    console.log('Carregando dados do dashboard de fornecedores...');
  }

  onPeriodoChange(): void {
    this.carregarDados();
  }

  getStatusClass(status: string): string {
    return status === 'Ativo' ? 'status-ativo' : 'status-inativo';
  }

  getAvaliacaoClass(avaliacao: string): string {
    switch (avaliacao) {
      case 'Excelente': return 'avaliacao-excelente';
      case 'Bom': return 'avaliacao-bom';
      case 'Regular': return 'avaliacao-regular';
      case 'Ruim': return 'avaliacao-ruim';
      default: return 'avaliacao-regular';
    }
  }

  getAvaliacaoSeverity(avaliacao: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (avaliacao) {
      case 'Excelente': return 'success';
      case 'Bom': return 'info';
      case 'Regular': return 'warning';
      case 'Ruim': return 'danger';
      default: return 'warning';
    }
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
