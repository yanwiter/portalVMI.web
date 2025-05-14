import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

  barChartDateRange: Date[];


  constructor() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    this.barChartDateRange = [startDate, endDate];
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
}
