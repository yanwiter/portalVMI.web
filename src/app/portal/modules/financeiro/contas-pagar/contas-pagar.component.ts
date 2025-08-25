import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

interface ContaPagar {
  id: number;
  numero: string;
  fornecedor: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
  categoria: string;
  formaPagamento?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-contas-pagar',
  templateUrl: './contas-pagar.component.html',
  styleUrls: ['./contas-pagar.component.scss']
})
export class ContasPagarComponent implements OnInit {
  contasPagar: ContaPagar[] = [];
  selectedConta: ContaPagar | null = null;
  displayDialog = false;
  isNewConta = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadContasPagar();
  }

  loadContasPagar(): void {
    // Mock data
    this.contasPagar = [
      {
        id: 1,
        numero: 'CP001',
        fornecedor: 'Fornecedor ABC Ltda',
        valor: 8500.00,
        dataVencimento: new Date('2024-02-20'),
        status: 'PENDENTE',
        categoria: 'Serviços',
        observacoes: 'Pagamento de serviços de manutenção'
      },
      {
        id: 2,
        numero: 'CP002',
        fornecedor: 'Empresa XYZ S/A',
        valor: 12000.00,
        dataVencimento: new Date('2024-02-12'),
        dataPagamento: new Date('2024-02-10'),
        status: 'PAGO',
        categoria: 'Materiais',
        formaPagamento: 'Transferência Bancária',
        observacoes: 'Compra de materiais para produção'
      },
      {
        id: 3,
        numero: 'CP003',
        fornecedor: 'Comércio DEF Ltda',
        valor: 5500.00,
        dataVencimento: new Date('2024-01-25'),
        status: 'VENCIDO',
        categoria: 'Serviços',
        observacoes: 'Serviços de limpeza'
      }
    ];
  }

  openNew(): void {
    this.isNewConta = true;
    this.selectedConta = {
      id: 0,
      numero: '',
      fornecedor: '',
      valor: 0,
      dataVencimento: new Date(),
      status: 'PENDENTE',
      categoria: ''
    };
    this.displayDialog = true;
  }

  editConta(conta: ContaPagar): void {
    this.isNewConta = false;
    this.selectedConta = { ...conta };
    this.displayDialog = true;
  }

  deleteConta(conta: ContaPagar): void {
    this.contasPagar = this.contasPagar.filter(c => c.id !== conta.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Conta a pagar excluída com sucesso'
    });
  }

  saveConta(): void {
    if (this.selectedConta) {
      if (this.isNewConta) {
        this.selectedConta.id = this.contasPagar.length + 1;
        this.contasPagar.push({ ...this.selectedConta });
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta a pagar criada com sucesso'
        });
      } else {
        const index = this.contasPagar.findIndex(c => c.id === this.selectedConta?.id);
        if (index !== -1) {
          this.contasPagar[index] = { ...this.selectedConta };
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta a pagar atualizada com sucesso'
        });
      }
    }
    this.displayDialog = false;
    this.selectedConta = null;
  }

  cancel(): void {
    this.displayDialog = false;
    this.selectedConta = null;
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'PAGO': return 'success';
      case 'PENDENTE': return 'warning';
      case 'VENCIDO': return 'danger';
      default: return 'info';
    }
  }

  getTotalPagar(): number {
    return this.contasPagar
      .filter(c => c.status === 'PENDENTE' || c.status === 'VENCIDO')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalPago(): number {
    return this.contasPagar
      .filter(c => c.status === 'PAGO')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalVencido(): number {
    return this.contasPagar
      .filter(c => c.status === 'VENCIDO')
      .reduce((total, conta) => total + conta.valor, 0);
  }
} 