import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface Comissao {
  id: number;
  vendedor: string;
  mes: string;
  vendasRealizadas: number;
  valorVendas: number;
  percentualComissao: number;
  valorComissao: number;
  status: 'pendente' | 'aprovada' | 'paga';
  dataPagamento?: Date;
}

@Component({
  selector: 'app-comissoes',
  templateUrl: './comissoes.component.html',
  styleUrls: ['./comissoes.component.scss']
})
export class ComissoesComponent implements OnInit {
  comissoes: Comissao[] = [];
  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  vendedores: string[] = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];
  statusOptions: string[] = ['Pendente', 'Aprovada', 'Paga'];
  
  selectedComissao: Comissao | null = null;
  displayDialog = false;
  isNewComissao = false;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadComissoes();
  }

  loadComissoes(): void {
    this.comissoes = [
      {
        id: 1,
        vendedor: 'João Silva',
        mes: 'Janeiro',
        vendasRealizadas: 5,
        valorVendas: 250000,
        percentualComissao: 5,
        valorComissao: 12500,
        status: 'aprovada'
      },
      {
        id: 2,
        vendedor: 'Maria Santos',
        mes: 'Janeiro',
        vendasRealizadas: 3,
        valorVendas: 180000,
        percentualComissao: 4.5,
        valorComissao: 8100,
        status: 'pendente'
      },
      {
        id: 3,
        vendedor: 'Pedro Costa',
        mes: 'Janeiro',
        vendasRealizadas: 4,
        valorVendas: 320000,
        percentualComissao: 6,
        valorComissao: 19200,
        status: 'paga',
        dataPagamento: new Date('2024-02-05')
      }
    ];
  }

  openNewComissao(): void {
    this.isNewComissao = true;
    this.selectedComissao = {
      id: 0,
      vendedor: '',
      mes: '',
      vendasRealizadas: 0,
      valorVendas: 0,
      percentualComissao: 0,
      valorComissao: 0,
      status: 'pendente'
    };
    this.displayDialog = true;
  }

  editComissao(comissao: Comissao): void {
    this.isNewComissao = false;
    this.selectedComissao = { ...comissao };
    this.displayDialog = true;
  }

  deleteComissao(comissao: Comissao): void {
    this.comissoes = this.comissoes.filter(c => c.id !== comissao.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant('COMISSAO_DELETED')
    });
  }

  saveComissao(): void {
    if (this.selectedComissao) {
      if (this.isNewComissao) {
        this.selectedComissao.id = Math.max(...this.comissoes.map(c => c.id)) + 1;
        this.comissoes.push(this.selectedComissao);
      } else {
        const index = this.comissoes.findIndex(c => c.id === this.selectedComissao?.id);
        if (index !== -1) {
          this.comissoes[index] = this.selectedComissao;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: this.translateService.instant('COMISSAO_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedComissao = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pendente': return 'status-pending';
      case 'aprovada': return 'status-approved';
      case 'paga': return 'status-paid';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pendente': return 'pi pi-clock';
      case 'aprovada': return 'pi pi-check-circle';
      case 'paga': return 'pi pi-dollar';
      default: return 'pi pi-circle';
    }
  }

  getTotalComissoes(): number {
    return this.comissoes.reduce((total, c) => total + c.valorComissao, 0);
  }

  getTotalVendas(): number {
    return this.comissoes.reduce((total, c) => total + c.valorVendas, 0);
  }

  getTotalVendedores(): number {
    return new Set(this.comissoes.map(c => c.vendedor)).size;
  }
} 