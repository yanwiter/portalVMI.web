import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  dataCriacao: Date;
  dataValidade: Date;
  valorTotal: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'convertido';
  responsavel: string;
  itens: any[];
}

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.component.html',
  styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {
  orcamentos: Orcamento[] = [];
  statusOptions: string[] = ['Rascunho', 'Enviado', 'Aprovado', 'Rejeitado', 'Convertido'];
  
  selectedOrcamento: Orcamento | null = null;
  displayDialog = false;
  isNewOrcamento = false;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOrcamentos();
  }

  loadOrcamentos(): void {
    this.orcamentos = [
      {
        id: 1,
        numero: 'ORC-2024-001',
        cliente: 'Empresa ABC Ltda',
        dataCriacao: new Date('2024-01-15'),
        dataValidade: new Date('2024-02-15'),
        valorTotal: 150000,
        status: 'enviado',
        responsavel: 'João Silva',
        itens: [
          { produto: 'ERP Completo', quantidade: 1, valor: 100000 },
          { produto: 'Treinamento', quantidade: 40, valor: 50000 }
        ]
      },
      {
        id: 2,
        numero: 'ORC-2024-002',
        cliente: 'XYZ Consultoria',
        dataCriacao: new Date('2024-01-10'),
        dataValidade: new Date('2024-02-10'),
        valorTotal: 45000,
        status: 'aprovado',
        responsavel: 'Maria Santos',
        itens: [
          { produto: 'Módulo Financeiro', quantidade: 1, valor: 30000 },
          { produto: 'Relatórios Customizados', quantidade: 1, valor: 15000 }
        ]
      }
    ];
  }

  openNewOrcamento(): void {
    this.isNewOrcamento = true;
    this.selectedOrcamento = {
      id: 0,
      numero: '',
      cliente: '',
      dataCriacao: new Date(),
      dataValidade: new Date(),
      valorTotal: 0,
      status: 'rascunho',
      responsavel: '',
      itens: []
    };
    this.displayDialog = true;
  }

  editOrcamento(orcamento: Orcamento): void {
    this.isNewOrcamento = false;
    this.selectedOrcamento = { ...orcamento };
    this.displayDialog = true;
  }

  deleteOrcamento(orcamento: Orcamento): void {
    this.orcamentos = this.orcamentos.filter(o => o.id !== orcamento.id);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant('ORCAMENTO_DELETED')
    });
  }

  saveOrcamento(): void {
    if (this.selectedOrcamento) {
      if (this.isNewOrcamento) {
        this.selectedOrcamento.id = Math.max(...this.orcamentos.map(o => o.id)) + 1;
        this.orcamentos.push(this.selectedOrcamento);
      } else {
        const index = this.orcamentos.findIndex(o => o.id === this.selectedOrcamento?.id);
        if (index !== -1) {
          this.orcamentos[index] = this.selectedOrcamento;
        }
      }
      
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: this.translateService.instant('ORCAMENTO_SAVED')
      });
    }
    
    this.displayDialog = false;
    this.selectedOrcamento = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'rascunho': return 'status-draft';
      case 'enviado': return 'status-sent';
      case 'aprovado': return 'status-approved';
      case 'rejeitado': return 'status-rejected';
      case 'convertido': return 'status-converted';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'rascunho': return 'pi pi-file';
      case 'enviado': return 'pi pi-send';
      case 'aprovado': return 'pi pi-check-circle';
      case 'rejeitado': return 'pi pi-times-circle';
      case 'convertido': return 'pi pi-check';
      default: return 'pi pi-circle';
    }
  }
} 