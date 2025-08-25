import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

interface ContaReceber {
  id: number;
  numero: string;
  cliente: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
  formaPagamento?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-contas-receber',
  templateUrl: './contas-receber.component.html',
  styleUrls: ['./contas-receber.component.scss']
})
export class ContasReceberComponent implements OnInit {
  contasReceber: ContaReceber[] = [];
  selectedConta: ContaReceber | null = null;
  displayDialog = false;
  isNewConta = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadContasReceber();
  }

  loadContasReceber(): void {
    // Mock data
    this.contasReceber = [
      {
        id: 1,
        numero: 'CR001',
        cliente: 'Empresa ABC Ltda',
        valor: 15000.00,
        dataVencimento: new Date('2024-02-15'),
        status: 'PENDENTE',
        observacoes: 'Fatura referente ao mês de janeiro'
      },
      {
        id: 2,
        numero: 'CR002',
        cliente: 'Comércio XYZ S/A',
        valor: 8500.00,
        dataVencimento: new Date('2024-02-10'),
        dataPagamento: new Date('2024-02-08'),
        status: 'PAGO',
        formaPagamento: 'Transferência Bancária',
        observacoes: 'Pagamento antecipado'
      },
      {
        id: 3,
        numero: 'CR003',
        cliente: 'Indústria DEF Ltda',
        valor: 22000.00,
        dataVencimento: new Date('2024-01-30'),
        status: 'VENCIDO',
        observacoes: 'Aguardando contato do cliente'
      }
    ];
  }

  openNew(): void {
    this.isNewConta = true;
    this.selectedConta = {
      id: 0,
      numero: '',
      cliente: '',
      valor: 0,
      dataVencimento: new Date(),
      status: 'PENDENTE'
    };
    this.displayDialog = true;
  }

  editConta(conta: ContaReceber): void {
    this.isNewConta = false;
    this.selectedConta = { ...conta };
    this.displayDialog = true;
  }

  deleteConta(conta: ContaReceber): void {
    this.contasReceber = this.contasReceber.filter(c => c.id !== conta.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Conta a receber excluída com sucesso'
    });
  }

  saveConta(): void {
    if (this.selectedConta) {
      if (this.isNewConta) {
        this.selectedConta.id = this.contasReceber.length + 1;
        this.contasReceber.push({ ...this.selectedConta });
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta a receber criada com sucesso'
        });
      } else {
        const index = this.contasReceber.findIndex(c => c.id === this.selectedConta?.id);
        if (index !== -1) {
          this.contasReceber[index] = { ...this.selectedConta };
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Conta a receber atualizada com sucesso'
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

  getTotalReceber(): number {
    return this.contasReceber
      .filter(c => c.status === 'PENDENTE' || c.status === 'VENCIDO')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalPago(): number {
    return this.contasReceber
      .filter(c => c.status === 'PAGO')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalVencido(): number {
    return this.contasReceber
      .filter(c => c.status === 'VENCIDO')
      .reduce((total, conta) => total + conta.valor, 0);
  }
} 