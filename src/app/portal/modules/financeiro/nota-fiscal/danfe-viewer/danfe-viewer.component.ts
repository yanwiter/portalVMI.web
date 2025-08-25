import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NotaFiscal, TipoOperacao, StatusNotaFiscal, ItemNotaFiscal } from '../../../../../shared/models/notaFiscal.model';
import { dadosEmpresaVMI, EmpresaModel } from '../../../../../shared/models/empresa.model';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

@Component({
  selector: 'app-danfe-viewer',
  templateUrl: './danfe-viewer.component.html',
  styleUrls: ['./danfe-viewer.component.scss']
})
export class DanfeViewerComponent implements OnInit, AfterViewInit {
  @Input() notaFiscal: NotaFiscal | null = null;
  
  @ViewChild('barcodeCanvas', { static: false }) barcodeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas!: ElementRef<HTMLCanvasElement>;
  
  dadosEmpresa: EmpresaModel = dadosEmpresaVMI;
  dataAtual = new Date();
  horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.gerarCodigoBarras();
      this.gerarQRCodeReal();
    }, 100);
  }

  formatarMoeda(valor: number): string {
    return valor?.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2
    }) || 'R$ 0,00';
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  formatarCnpjCpf(cnpjCpf: string): string {
    if (!cnpjCpf) return '';
    const numeros = cnpjCpf.replace(/\D/g, '');
    
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpjCpf;
  }

  formatarCep(cep: string): string {
    if (!cep) return '';
    const numeros = cep.replace(/\D/g, '');
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  calcularTotalItens(): number {
    if (!this.notaFiscal?.itens) return 0;
    return this.notaFiscal.itens.reduce((total, item) => total + (item.valorTotal || 0), 0);
  }

  gerarChaveAcesso(): string {
    if (!this.notaFiscal) return '00000000000000000000000000000000000000000000';
    
    const uf = '43'; // RS como exemplo
    const anoMes = this.notaFiscal.dataEmissao ? 
      new Date(this.notaFiscal.dataEmissao).getFullYear().toString().substr(2, 2) +
      (new Date(this.notaFiscal.dataEmissao).getMonth() + 1).toString().padStart(2, '0') : 
      new Date().getFullYear().toString().substr(2, 2) + 
      (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    const cnpj = this.dadosEmpresa.cnpj.replace(/\D/g, '').padStart(14, '0');
    const modelo = '55'; // Modelo NF-e
    const serie = (this.notaFiscal.serie || '001').padStart(3, '0');
    const numero = (this.notaFiscal.numero || '000000001').padStart(9, '0');
    const tipoEmissao = '1'; // Normal
    const codigoNumerico = '12345678'; // Código aleatório
    
    // Monta os 43 dígitos
    const chave = uf + anoMes + cnpj + modelo + serie + numero + tipoEmissao + codigoNumerico;
    
    // Calcula o dígito verificador (módulo 11)
    let soma = 0;
    let peso = 2;
    
    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    
    return chave + dv.toString();
  }

  gerarProtocolo(): string {
    // Simula um protocolo de autorização
    return `123456789012345`;
  }

  gerarCodigoBarras(): void {
    if (this.barcodeCanvas?.nativeElement) {
      try {
        const chave = this.gerarChaveAcesso();
        JsBarcode(this.barcodeCanvas.nativeElement, chave, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: false,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
      }
    }
  }

  gerarQRCodeReal(): void {
    if (this.qrcodeCanvas?.nativeElement) {
      try {
        const chave = this.gerarChaveAcesso();
        const qrData = `https://www.nfe.fazenda.gov.br/portal/consulta.aspx?p=${chave}|2|1|1`;
        
        QRCode.toCanvas(this.qrcodeCanvas.nativeElement, qrData, {
          width: 120,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    }
  }

  imprimirDanfe(): void {
    const conteudo = document.querySelector('.danfe-container');
    if (conteudo) {
      const janela = window.open('', '_blank');
      if (janela) {
        janela.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>DANFE - Nota Fiscal ${this.notaFiscal?.numero}</title>
            <style>
              ${this.gerarEstilosImpressao()}
            </style>
          </head>
          <body>
            ${conteudo.outerHTML}
            <script>
              setTimeout(() => {
                if (typeof JsBarcode !== 'undefined') {
                  const barcodeCanvas = document.querySelector('#barcodeCanvas');
                  if (barcodeCanvas) {
                    JsBarcode(barcodeCanvas, '${this.gerarChaveAcesso()}', {
                      format: "CODE128",
                      width: 1.5,
                      height: 30,
                      displayValue: false,
                      margin: 3,
                      background: "#ffffff",
                      lineColor: "#000000"
                    });
                  }
                }
                if (typeof QRCode !== 'undefined') {
                  const qrcodeCanvas = document.querySelector('#qrcodeCanvas');
                  if (qrcodeCanvas) {
                    QRCode.toCanvas(qrcodeCanvas, 'https://www.nfe.fazenda.gov.br/portal/consulta.aspx?p=${this.gerarChaveAcesso()}|2|1|1', {
                      width: 100,
                      margin: 2,
                      color: {
                        dark: '#000000',
                        light: '#ffffff'
                      }
                    });
                  }
                }
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 300);
              }, 100);
            </script>
          </body>
          </html>
        `);
        janela.document.close();
      }
    }
  }

  private gerarEstilosImpressao(): string {
    return `
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        font-size: 8pt;
      }
      
      .danfe-container {
        width: 100%;
        margin: 0;
        padding: 5mm;
        border: none;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2mm;
      }
      
      th, td {
        border: 1px solid #000;
        padding: 2px;
        font-size: 7pt;
      }
      
      .section-title {
        background-color: #000 !important;
        color: #fff !important;
        font-weight: bold;
        padding: 3px;
        text-align: center;
      }
      
      .barcode, .qrcode {
        text-align: center;
        margin: 2mm 0;
      }
      
      @page {
        size: A4;
        margin: 10mm;
      }
    `;
  }
}