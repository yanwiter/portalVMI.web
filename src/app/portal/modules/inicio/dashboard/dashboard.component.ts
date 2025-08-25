import { Component } from '@angular/core';
import { dashboardsOptions } from '../../../../shared/models/options/dashboards.options';
import { TranslationService } from '../../../../shared/services/translation/translation.service';
import { ThemeService } from '../../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

  barChartDateRange: Date[];
  public dashboardsOptions = dashboardsOptions;
  selectedDashboards: number = 1;

  constructor(
    private translationService: TranslationService,
    private themeService: ThemeService
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.barChartDateRange = [startDate, endDate];
    this.atualizarDadosClientesFornecedores();
  }

  // Getter para obter o título do dashboard selecionado
  get dashboardTitle(): string {
    const selectedOption = this.dashboardsOptions.find(option => option.value === this.selectedDashboards);
    if (!selectedOption) return this.translate('DASHBOARD.TITLE');
    
    switch (selectedOption.value) {
      case 1: return this.translate('DASHBOARD.GENERAL');
      case 2: return this.translate('DASHBOARD.CONTRACTS');
      case 3: return this.translate('DASHBOARD.CLIENTS_SUPPLIERS');
      case 4: return this.translate('DASHBOARD.STOCK');
      case 5: return this.translate('DASHBOARD.EXECUTIVE');
      case 6: return this.translate('DASHBOARD.CLIENTS');
      case 7: return this.translate('DASHBOARD.SUPPLIERS');
      case 8: return this.translate('DASHBOARD.CONTRACTS_DETAILED');
      default: return this.translate('DASHBOARD.TITLE');
    }
  }

  // Getter para obter o ícone do dashboard selecionado
  get dashboardIcon(): string {
    switch (this.selectedDashboards) {
      case 1: return 'pi-chart-line'; // Geral
      case 2: return 'pi-file-edit'; // Contratos
      case 3: return 'pi-users'; // Clientes e Fornecedores
      case 4: return 'pi-box'; // Estoque
      case 5: return 'pi-chart-pie'; // Executivo
      case 6: return 'pi-user'; // Clientes
      case 7: return 'pi-truck'; // Fornecedores
      case 8: return 'pi-file-text'; // Contratos Detalhado
      default: return 'pi-chart-line';
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

  updateBarChart() {
    console.log('Atualizando gráfico de barras com período:', this.barChartDateRange);
    // Implemente a lógica para atualizar os dados do gráfico
  }


  productionData = {
    labels: ['Grande Porte', 'Médio Porte', 'Pequeno Porte'],
    datasets: [
      {
        data: [40, 32, 28],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  orderData = {
    labels: ['Em Produção', 'Aguardando Inspeção', 'Finalizado'],
    datasets: [
      {
        data: [40, 32, 28],
        backgroundColor: ['#4CAF50', '#99FF', '#FF9F40'],
        hoverBackgroundColor: ['#4CAF50', '#9966FF', '#FF9F40']
      }
    ]
  };

  equipmentData = {
    labels: ['Arcos Cirúrgicos', 'Mamógrafos', 'Raios X Fixos', 'Ressonância Magnética'],
    datasets: [
      {
        label: 'Percentual de Vendas',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [43, 92, 65, 51]
      }
    ]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 45
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 60,
          left: 0
        }
      },
      title: {
        display: true,
        text: '',
        fontSize: 20,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        }
      }
    }
  };

  chartOptionsForBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 45
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 60,
          left: 0
        }
      },
      title: {
        display: true,
        text: '',
        fontSize: 20,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true
        },
        ticks: {
          display: true
        },
        border: {
          display: true
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          display: true
        },
        border: {
          display: true
        }
      }
    }
  };

  data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Planejada',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80]
      },
      {
        label: 'Realizada',
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        data: [60, 55, 75, 82, 50, 50, 38, 42, 58, 65, 70, 75]
      }
    ]
  };

  chartOptionsContratos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 45
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 60,
          left: 0
        }
      },
      title: {
        display: true,
        text: '',
        fontSize: 20,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true
        },
        ticks: {
          display: true
        },
        border: {
          display: true
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          display: true
        },
        border: {
          display: true
        }
      }
    }
  };

  dataContratos = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Abertos',
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80]
      },
      {
        label: 'Cancelados',
        backgroundColor: '#F44336',
        borderColor: '#D32F2F',
        data: [60, 55, 75, 82, 50, 50, 38, 42, 58, 65, 70, 75]
      }
    ]
  };

  contratosData = {
    labels: ['Vigentes', 'Encerrados', 'Cancelados'],
    datasets: [
      {
        data: [40, 32, 28],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        hoverBackgroundColor: ['#388E3C', '#F57C00', '#D32F2F']
      }
    ]
  };

  // Métodos e dados específicos para a aba de Clientes/Fornecedores
  totalClientesFornecedores: number = 0;
  clientesAtivos: number = 0;
  fornecedoresAtivos: number = 0;
  cadastrosInativos: number = 0;

  tipoCadastroData: any;
  statusCadastroData: any;
  porteEmpresaData: any;
  novosCadastrosData: any;
  ultimosCadastros: any[] = [];

  periodoOptions = [
    { label: 'Últimos 30 dias', value: 30 },
    { label: 'Últimos 90 dias', value: 90 },
    { label: 'Último ano', value: 365 },
    { label: 'Todos', value: 0 }
  ];
  periodoSelecionado = this.periodoOptions[0];

  dateRange: Date[] = [];

  // Método para formatar CPF/CNPJ
  formatDocument(doc: string): string {
    if (!doc) return '';
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  }

  // Método para carregar os dados
  atualizarDadosClientesFornecedores() {
    // Aqui você faria as chamadas para sua API para obter os dados
    // Estes são dados de exemplo:

    this.totalClientesFornecedores = 125;
    this.clientesAtivos = 85;
    this.fornecedoresAtivos = 32;
    this.cadastrosInativos = 8;

    // Dados para os gráficos
    this.tipoCadastroData = {
      labels: ['Clientes', 'Fornecedores'],
      datasets: [
        {
          data: [85, 32],
          backgroundColor: ['#4CAF50', '#2196F3'],
          hoverBackgroundColor: ['#66BB6A', '#42A5F5']
        }
      ]
    };

    this.statusCadastroData = {
      labels: ['Ativos', 'Inativos'],
      datasets: [
        {
          data: [117, 8],
          backgroundColor: ['#4CAF50', '#F44336'],
          hoverBackgroundColor: ['#66BB6A', '#EF5350']
        }
      ]
    };

    this.porteEmpresaData = {
      labels: ['MEI', 'Micro', 'Pequena', 'Média', 'Grande'],
      datasets: [
        {
          label: 'Quantidade',
          backgroundColor: '#42A5F5',
          data: [15, 42, 28, 24, 8]
        }
      ]
    };

    this.novosCadastrosData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Novos Cadastros',
          data: [12, 19, 15, 8, 11, 9],
          fill: false,
          borderColor: '#4CAF50',
          tension: 0.4
        }
      ]
    };

    this.ultimosCadastros = [
      { razaoSocial: 'Empresa A Ltda', tipoCadastro: 0, cpfCnpj: '12345678000199', dataInclusao: new Date(), statusCadastro: true },
      { razaoSocial: 'Fornecedor B ME', tipoCadastro: 1, cpfCnpj: '98765432000155', dataInclusao: new Date(), statusCadastro: true },
      { razaoSocial: 'Cliente C', tipoCadastro: 0, cpfCnpj: '12345678901', dataInclusao: new Date(), statusCadastro: false },
      { razaoSocial: 'Empresa D EPP', tipoCadastro: 1, cpfCnpj: '11222333000144', dataInclusao: new Date(), statusCadastro: true },
      { razaoSocial: 'Cliente E', tipoCadastro: 0, cpfCnpj: '98765432100', dataInclusao: new Date(), statusCadastro: true }
    ];
  }
}
