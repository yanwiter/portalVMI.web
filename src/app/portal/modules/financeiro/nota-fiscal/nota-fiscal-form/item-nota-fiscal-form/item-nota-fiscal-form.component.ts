import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemNotaFiscal } from '../../../../../../shared/models/notaFiscal.model';

@Component({
  selector: 'app-item-nota-fiscal-form',
  templateUrl: './item-nota-fiscal-form.component.html',
  styleUrls: ['./item-nota-fiscal-form.component.scss']
})
export class ItemNotaFiscalFormComponent implements OnInit {
  @Input() item: ItemNotaFiscal | null = null;
  @Input() produtos: any[] = [];
  @Output() salvar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      produtoId: [null, Validators.required],
      produtoCodigo: ['', Validators.required],
      produtoDescricao: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(0.01)]],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
      valorTotal: [0, Validators.required],
      ncm: ['', Validators.required],
      cfop: ['5102', Validators.required],
      unidadeComercial: ['UN', Validators.required],
      valorBaseIcms: [0],
      valorIcms: [0],
      aliquotaIcms: [18]
    });
  }

  ngOnInit(): void {
    if (this.item) {
      this.form.patchValue(this.item);
    }
    
    // Observar mudanças para calcular valores
    this.form.valueChanges.subscribe(() => {
      this.calcularValores();
    });
  }

  onProdutoChange(event: any): void {
    const produto = this.produtos.find(p => p.id === event.value);
    if (produto) {
      this.form.patchValue({
        produtoCodigo: produto.codigo,
        produtoDescricao: produto.descricao,
        ncm: produto.ncm,
        valorUnitario: produto.precoVenda || 0
      });
      this.calcularValores();
    }
  }

  calcularValores(): void {
    const quantidade = this.form.get('quantidade')?.value || 0;
    const valorUnitario = this.form.get('valorUnitario')?.value || 0;
    const aliquotaIcms = this.form.get('aliquotaIcms')?.value || 18;
    
    const valorTotal = quantidade * valorUnitario;
    const valorBaseIcms = valorTotal;
    const valorIcms = valorBaseIcms * (aliquotaIcms / 100);
    
    this.form.patchValue({
      valorTotal,
      valorBaseIcms,
      valorIcms
    }, { emitEvent: false });
  }

  onSalvar(): void {
    if (this.form.valid) {
      // Atualizar o item com os dados do formulário
      if (this.item) {
        Object.assign(this.item, this.form.value);
      }
      this.salvar.emit();
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