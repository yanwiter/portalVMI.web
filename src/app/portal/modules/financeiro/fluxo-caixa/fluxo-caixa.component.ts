import { Component, OnInit } from '@angular/core';

interface FluxoCaixa {
  data: Date;
  descricao: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: string;
  valor: number;
  saldo: number;
}

@Component({
  selector: 'app-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrls: ['./fluxo-caixa.component.scss']
})
export class FluxoCaixaComponent implements OnInit {
  fluxoCaixa: FluxoCaixa[] = [];
  saldoInicial = 50000.00;
  saldoAtual = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadFluxoCaixa();
  }

  loadFluxoCaixa(): void {
    // Mock data
    this.fluxoCaixa = [
      {
        data: new Date('2024-02-01'),
        descricao: 'Saldo Inicial',
        tipo: 'ENTRADA',
        categoria: 'Saldo',
        valor: this.saldoInicial,
        saldo: this.saldoInicial
      },
      {
        data: new Date('2024-02-05'),
        descricao: 'Recebimento Cliente ABC',
        tipo: 'ENTRADA',
        categoria: 'Vendas',
        valor: 15000.00,
        saldo: this.saldoInicial + 15000.00
      },
      {
        data: new Date('2024-02-08'),
        descricao: 'Pagamento Fornecedor XYZ',
        tipo: 'SAIDA',
        categoria: 'Compras',
        valor: 8500.00,
        saldo: this.saldoInicial + 15000.00 - 8500.00
      },
      {
        data: new Date('2024-02-12'),
        descricao: 'Recebimento Cliente DEF',
        tipo: 'ENTRADA',
        categoria: 'Vendas',
        valor: 22000.00,
        saldo: this.saldoInicial + 15000.00 - 8500.00 + 22000.00
      },
      {
        data: new Date('2024-02-15'),
        descricao: 'Pagamento Salários',
        tipo: 'SAIDA',
        categoria: 'RH',
        valor: 18000.00,
        saldo: this.saldoInicial + 15000.00 - 8500.00 + 22000.00 - 18000.00
      }
    ];

    this.saldoAtual = this.fluxoCaixa[this.fluxoCaixa.length - 1].saldo;
  }

  getTotalEntradas(): number {
    return this.fluxoCaixa
      .filter(f => f.tipo === 'ENTRADA')
      .reduce((total, fluxo) => total + fluxo.valor, 0);
  }

  getTotalSaidas(): number {
    return this.fluxoCaixa
      .filter(f => f.tipo === 'SAIDA')
      .reduce((total, fluxo) => total + fluxo.valor, 0);
  }

  getTipoSeverity(tipo: string): 'success' | 'warning' | 'danger' | 'info' {
    return tipo === 'ENTRADA' ? 'success' : 'danger';
  }
} 