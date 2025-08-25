import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface PedidoVenda {
  id: number;
  numero: string;
  cliente: string;
  dataPedido: Date;
  dataEntrega: Date;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'em_producao' | 'enviado' | 'entregue' | 'cancelado';
  responsavel: string;
  itens: any[];
}

@Component({
  selector: 'app-pedidos-venda',
  templateUrl: './pedidos-venda.component.html',
  styleUrls: ['./pedidos-venda.component.scss']
})
export class PedidosVendaComponent implements OnInit {
  pedidos: PedidoVenda[] = [];
  statusOptions: string[] = ['Pendente', 'Aprovado', 'Em Produção', 'Enviado', 'Entregue', 'Cancelado'];
  
  selectedPedido: PedidoVenda | null = null;
  displayDialog = false;
  isNewPedido = false;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidos = [
      {
        id: 1,
        numero: 'PV-2024-001',
        cliente: 'Empresa ABC Ltda',
        dataPedido: new Date('2024-01-15'),
        dataEntrega: new Date('2024-02-15'),
        valorTotal: 150000,
        status: 'aprovado',
        responsavel: 'João Silva',
        itens: [
          { produto: 'ERP Completo', quantidade: 1, valor: 100000 },
          { produto: 'Treinamento', quantidade: 40, valor: 50000 }
        ]
      },
      {
        id: 2,
        numero: 'PV-2024-002',
        cliente: 'XYZ Consultoria',
        dataPedido: new Date('2024-01-10'),
        dataEntrega: new Date('2024-02-10'),
        valorTotal: 45000,
        status: 'em_producao',
        responsavel: 'Maria Santos',
        itens: [
          { produto: 'Módulo Financeiro', quantidade: 1, valor: 30000 },
          { produto: 'Relatórios Customizados', quantidade: 1, valor: 15000 }
        ]
      }
    ];
  }

  openNewPedido(): void {
    this.isNewPedido = true;
    this.selectedPedido = {
      id: 0,
      numero: '',
      cliente: '',
      dataPedido: new Date(),
      dataEntrega: new Date(),
      valorTotal: 0,
      status: 'pendente',
      responsavel: '',
      itens: []
    };
    this.displayDialog = true;
  }

  editPedido(pedido: PedidoVenda): void {
    this.isNewPedido = false;
    this.selectedPedido = { ...pedido };
    this.displayDialog = true;
  }

  deletePedido(pedido: PedidoVenda): void {
    this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant('PEDIDO_DELETED')
    });
  }

  savePedido(): void {
    if (this.selectedPedido) {
      if (this.isNewPedido) {
        this.selectedPedido.id = Math.max(...this.pedidos.map(p => p.id)) + 1;
        this.pedidos.push(this.selectedPedido);
      } else {
        const index = this.pedidos.findIndex(p => p.id === this.selectedPedido?.id);
        if (index !== -1) {
          this.pedidos[index] = this.selectedPedido;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: this.translateService.instant('PEDIDO_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedPedido = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pendente': return 'status-pending';
      case 'aprovado': return 'status-approved';
      case 'em_producao': return 'status-production';
      case 'enviado': return 'status-shipped';
      case 'entregue': return 'status-delivered';
      case 'cancelado': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pendente': return 'pi pi-clock';
      case 'aprovado': return 'pi pi-check-circle';
      case 'em_producao': return 'pi pi-cog';
      case 'enviado': return 'pi pi-send';
      case 'entregue': return 'pi pi-check';
      case 'cancelado': return 'pi pi-times-circle';
      default: return 'pi pi-circle';
    }
  }
} 