import { Component } from '@angular/core';

@Component({
  selector: 'app-funil-vendas',
  templateUrl: './funil-vendas.component.html',
  styleUrl: './funil-vendas.component.scss'
})
export class FunilVendasComponent {
  stages = [
    { name: 'Prospecção', count: 2, amount: 1396000 },
    { name: 'Qualificação', count: 3, amount: 1190000 },
    { name: 'Proposta Enviada', count: 5, amount: 1258000 },
    { name: 'Negociação', count: 3, amount: 1120000 },
    { name: 'Fechamento', count: 5, amount: 1297000 }
  ];

  companies = [
    { name: 'TechSolutions Inc', amount: 250000 },
    { name: 'Global Innovations', amount: 250000 },
    { name: 'Future Enterprises', amount: 250000 },
    { name: 'Quantum Systems', amount: 270000 },
    { name: 'Nexus Technologies', amount: 470000 },
    { name: 'Alpha Ventures', amount: 880000 },
    { name: 'Omega Corp', amount: 880000 },
    { name: 'Stellar Group', amount: 870000 },
    { name: 'Horizon Ltd', amount: 870000 },
    { name: 'Summit Industries', amount: 870000 },
    { name: 'Apex Solutions', amount: 870000 },
    { name: 'Pinnacle Enterprises', amount: 870000 },
    { name: 'Vertex Partners', amount: 870000 },
    { name: 'Infinity Group', amount: 870000 },
    { name: 'Zenith Systems', amount: 870000 },
    { name: 'Titan Holdings', amount: 870000 }
  ];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  getStageColor(index: number): string {
  const colors = ['#F44336', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'];
  return colors[index % colors.length];
}

getStageBackgroundColor(index: number): string {
  const bgColors = ['#FFEBEE', '#FFF8E1', '#E8F5E9', '#E3F2FD', '#F3E5F5'];
  return bgColors[index % bgColors.length];
}
}
