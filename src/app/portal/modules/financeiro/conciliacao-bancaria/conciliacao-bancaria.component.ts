import { Component, OnInit } from '@angular/core';

interface ConciliacaoBancaria {
  id: number;
  data: Date;
  descricao: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  status: 'CONCILIADO' | 'NAO_CONCILIADO';
  categoria?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-conciliacao-bancaria',
  templateUrl: './conciliacao-bancaria.component.html',
  styleUrls: ['./conciliacao-bancaria.component.scss']
})
export class ConciliacaoBancariaComponent implements OnInit {
  conciliacoes: ConciliacaoBancaria[] = [];
  saldoContabil = 45000.00;
  saldoBancario = 45000.00;

  constructor() {}

  ngOnInit(): void {
    this.loadConciliacoes();
  }

  loadConciliacoes(): void {
    // Mock data
    this.conciliacoes = [
      {
        id: 1,
        data: new Date('2024-02-15'),
        descricao: 'Transferência Recebida',
        valor: 15000.00,
        tipo: 'CREDITO',
        status: 'CONCILIADO',
        categoria: 'Vendas'
      },
      {
        id: 2,
        data: new Date('2024-02-14'),
        descricao: 'Pagamento Fornecedor',
        valor: 8500.00,
        tipo: 'DEBITO',
        status: 'CONCILIADO',
        categoria: 'Compras'
      },
      {
        id: 3,
        data: new Date('2024-02-13'),
        descricao: 'Cheque Compensado',
        valor: 5000.00,
        tipo: 'DEBITO',
        status: 'NAO_CONCILIADO',
        observacoes: 'Aguardando confirmação'
      },
      {
        id: 4,
        data: new Date('2024-02-12'),
        descricao: 'Depósito em Dinheiro',
        valor: 8000.00,
        tipo: 'CREDITO',
        status: 'CONCILIADO',
        categoria: 'Vendas'
      }
    ];
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    return status === 'CONCILIADO' ? 'success' : 'warning';
  }

  getTipoSeverity(tipo: string): 'success' | 'warning' | 'danger' | 'info' {
    return tipo === 'CREDITO' ? 'success' : 'danger';
  }

  getTotalConciliado(): number {
    return this.conciliacoes
      .filter(c => c.status === 'CONCILIADO')
      .reduce((total, conc) => total + conc.valor, 0);
  }

  getTotalNaoConciliado(): number {
    return this.conciliacoes
      .filter(c => c.status === 'NAO_CONCILIADO')
      .reduce((total, conc) => total + conc.valor, 0);
  }

  getDiferenca(): number {
    return this.saldoContabil - this.saldoBancario;
  }
} 