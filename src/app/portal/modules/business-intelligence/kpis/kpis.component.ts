import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-kpis',
  templateUrl: './kpis.component.html',
  styleUrls: ['./kpis.component.scss']
})
export class KpisComponent implements OnInit {
  
  kpis = [
    {
      id: 1,
      nome: 'Taxa de Conversão',
      valor: 68.5,
      meta: 75,
      unidade: '%',
      categoria: 'Vendas',
      status: 'warning',
      tendencia: 'up',
      variacao: 2.3
    },
    {
      id: 2,
      nome: 'Ticket Médio',
      valor: 1250.00,
      meta: 1400,
      unidade: 'R$',
      categoria: 'Vendas',
      status: 'success',
      tendencia: 'up',
      variacao: 8.7
    },
    {
      id: 3,
      nome: 'Satisfação do Cliente',
      valor: 92.3,
      meta: 90,
      unidade: '%',
      categoria: 'Qualidade',
      status: 'success',
      tendencia: 'up',
      variacao: 1.2
    },
    {
      id: 4,
      nome: 'Tempo de Resposta',
      valor: 2.4,
      meta: 2.0,
      unidade: 'h',
      categoria: 'Serviço',
      status: 'danger',
      tendencia: 'down',
      variacao: -0.3
    },
    {
      id: 5,
      nome: 'Retenção de Clientes',
      valor: 94.8,
      meta: 95,
      unidade: '%',
      categoria: 'Fidelização',
      status: 'success',
      tendencia: 'up',
      variacao: 0.5
    },
    {
      id: 6,
      nome: 'Custo por Cliente',
      valor: 85.50,
      meta: 80,
      unidade: 'R$',
      categoria: 'Financeiro',
      status: 'warning',
      tendencia: 'down',
      variacao: -2.1
    }
  ];

  categorias = [
    { label: 'Todas', value: 'todas' },
    { label: 'Vendas', value: 'Vendas' },
    { label: 'Qualidade', value: 'Qualidade' },
    { label: 'Serviço', value: 'Serviço' },
    { label: 'Fidelização', value: 'Fidelização' },
    { label: 'Financeiro', value: 'Financeiro' }
  ];

  categoriaSelecionada = 'todas';
  kpisFiltrados = this.kpis;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.filtrarKpis();
  }

  filtrarKpis() {
    if (this.categoriaSelecionada === 'todas') {
      this.kpisFiltrados = this.kpis;
    } else {
      this.kpisFiltrados = this.kpis.filter(kpi => kpi.categoria === this.categoriaSelecionada);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      default: return 'info';
    }
  }

  getTendenciaIcon(tendencia: string): string {
    return tendencia === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }

  getTendenciaClass(tendencia: string): string {
    return tendencia === 'up' ? 'positive' : 'negative';
  }

  onEditarKpi(kpi: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'Editar KPI',
      detail: `Editando KPI: ${kpi.nome}`
    });
  }

  onExportarKpis() {
    this.messageService.add({
      severity: 'success',
      summary: 'Exportação',
      detail: 'KPIs exportados com sucesso!'
    });
  }

  onAtualizarKpis() {
    this.messageService.add({
      severity: 'success',
      summary: 'Atualização',
      detail: 'KPIs atualizados com sucesso!'
    });
  }

  getKpisSuccess(): number {
    return this.kpisFiltrados.filter(k => k.status === 'success').length;
  }

  getKpisWarning(): number {
    return this.kpisFiltrados.filter(k => k.status === 'warning').length;
  }

  getKpisDanger(): number {
    return this.kpisFiltrados.filter(k => k.status === 'danger').length;
  }

  getTotalKpis(): number {
    return this.kpisFiltrados.length;
  }
} 