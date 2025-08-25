import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { NotaFiscal, ItemNotaFiscal, StatusNotaFiscal, TipoOperacao } from '../../../../../shared/models/notaFiscal.model';
import { tipoOperacaoOptions } from '../../../../../shared/models/options/tipoOperacao.options';
import { GenericService } from '../../../../../shared/services/generic/generic.service';
import { Result } from '../../../../../shared/models/api/result.model';
import { PermissionsService } from '../../../../../shared/services/permissions/permissions.service';

@Component({
  selector: 'app-nota-fiscal-form',
  templateUrl: './nota-fiscal-form.component.html',
  styleUrls: ['./nota-fiscal-form.component.scss']
})
export class NotaFiscalFormComponent implements OnInit {
  @Input() notaFiscal: NotaFiscal | null = null;
  @Output() salvar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  tipoOperacaoOptions = tipoOperacaoOptions;
  clientes: any[] = [];
  produtos: any[] = [];
  itemSelecionado: ItemNotaFiscal | null = null;
  displayItemDialog = false;

  // Permissões
  canEdit = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: GenericService<any>,
    private produtoService: GenericService<any>,
    private messageService: MessageService,
    private permissionsService: PermissionsService
  ) {
    this.form = this.fb.group({
      numero: ['', Validators.required],
      serie: ['', Validators.required],
      dataEmissao: [new Date(), Validators.required],
      dataVencimento: [new Date(), Validators.required],
      clienteId: [null, Validators.required],
      clienteNome: ['', Validators.required],
      clienteCnpjCpf: ['', Validators.required],
      valorTotal: [0, Validators.required],
      valorBaseIcms: [0],
      valorIcms: [0],
      valorBaseIpi: [0],
      valorIpi: [0],
      valorBasePis: [0],
      valorPis: [0],
      valorBaseCofins: [0],
      valorCofins: [0],
      status: [StatusNotaFiscal.RASCUNHO],
      tipoOperacao: [TipoOperacao.SAIDA, Validators.required],
      naturezaOperacao: ['Venda de mercadoria', Validators.required],
      observacoes: [''],
      itens: [[]]
    });
  }

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarProdutos();
    
    if (this.notaFiscal) {
      this.form.patchValue(this.notaFiscal);
    }
  }

  carregarClientes(): void {
    this.clienteService.getAll('clientesAndFornecedoresRoutes')
      .subscribe({
        next: (response: Result<any[]>) => {
          if (response.isSuccess && response.data) {
            this.clientes = response.data;
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar clientes',
            life: 3000
          });
        }
      });
  }

  carregarProdutos(): void {
    this.produtoService.getAll('produtoRoutes')
      .subscribe({
        next: (response: Result<any[]>) => {
          if (response.isSuccess && response.data) {
            this.produtos = response.data;
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar produtos',
            life: 3000
          });
        }
      });
  }

  onClienteChange(event: any): void {
    const cliente = this.clientes.find(c => c.id === event.value);
    if (cliente) {
      this.form.patchValue({
        clienteNome: cliente.nome,
        clienteCnpjCpf: cliente.cnpjCpf
      });
    }
  }

  adicionarItem(): void {
    this.itemSelecionado = {
      notaFiscalId: 0,
      produtoId: 0,
      produtoCodigo: '',
      produtoDescricao: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      ncm: '',
      cfop: '5102',
      unidadeComercial: 'UN',
      valorBaseIcms: 0,
      valorIcms: 0,
      aliquotaIcms: 18
    };
    this.displayItemDialog = true;
  }

  editarItem(item: ItemNotaFiscal): void {
    this.itemSelecionado = { ...item };
    this.displayItemDialog = true;
  }

  removerItem(index: number): void {
    const itens = this.form.get('itens')?.value || [];
    itens.splice(index, 1);
    this.form.patchValue({ itens });
    this.calcularTotais();
  }

  salvarItem(): void {
    if (!this.itemSelecionado) return;

    const itens = this.form.get('itens')?.value || [];
    
    if (this.itemSelecionado.id) {
      // Editar item existente
      const index = itens.findIndex((item: ItemNotaFiscal) => item.id === this.itemSelecionado?.id);
      if (index !== -1) {
        itens[index] = this.itemSelecionado;
      }
    } else {
      // Adicionar novo item
      this.itemSelecionado.id = Date.now(); // ID temporário
      itens.push(this.itemSelecionado);
    }

    this.form.patchValue({ itens });
    this.calcularTotais();
    this.displayItemDialog = false;
    this.itemSelecionado = null;
  }

  calcularTotais(): void {
    const itens = this.form.get('itens')?.value || [];
    let valorTotal = 0;
    let valorBaseIcms = 0;
    let valorIcms = 0;
    let valorBaseIpi = 0;
    let valorIpi = 0;
    let valorBasePis = 0;
    let valorPis = 0;
    let valorBaseCofins = 0;
    let valorCofins = 0;

    itens.forEach((item: ItemNotaFiscal) => {
      valorTotal += item.valorTotal;
      valorBaseIcms += item.valorBaseIcms;
      valorIcms += item.valorIcms;
      valorBaseIpi += item.valorBaseIcms; // Assumindo que base IPI = base ICMS
      valorIpi += item.valorIcms * 0.1; // IPI 10% do ICMS (exemplo)
      valorBasePis += item.valorBaseIcms;
      valorPis += item.valorBaseIcms * 0.0165; // PIS 1.65%
      valorBaseCofins += item.valorBaseIcms;
      valorCofins += item.valorBaseIcms * 0.076; // COFINS 7.6%
    });

    this.form.patchValue({
      valorTotal,
      valorBaseIcms,
      valorIcms,
      valorBaseIpi,
      valorIpi,
      valorBasePis,
      valorPis,
      valorBaseCofins,
      valorCofins
    });
  }

  onSalvar(): void {
    if (!this.canEdit) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Você não tem permissão para editar notas fiscais',
        life: 3000
      });
      return;
    }

    if (this.form.valid) {
      this.loading = true;
      
      // Atualizar a nota fiscal com os dados do formulário
      if (this.notaFiscal) {
        Object.assign(this.notaFiscal, this.form.value);
      }
      
      this.loading = false;
      this.salvar.emit();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios',
        life: 3000
      });
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  }
} 