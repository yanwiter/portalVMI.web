import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmpresaModel } from '../../models/empresa.model';

export interface ContextoEmpresa {
  empresaAtiva: EmpresaModel | null;
  empresasDisponiveis: EmpresaModel[];
  usuarioLogado: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    empresaId: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private contextoSubject = new BehaviorSubject<ContextoEmpresa>({
    empresaAtiva: null,
    empresasDisponiveis: [],
    usuarioLogado: null
  });

  public contexto$ = this.contextoSubject.asObservable();

  constructor() {
    this.inicializarContexto();
  }

  private inicializarContexto(): void {
    // Carregar contexto do localStorage se existir
    const contextoSalvo = localStorage.getItem('contextoEmpresa');
    if (contextoSalvo) {
      try {
        const contexto = JSON.parse(contextoSalvo);
        this.contextoSubject.next(contexto);
      } catch (error) {
        console.error('Erro ao carregar contexto salvo:', error);
        this.definirContextoPadrao();
      }
    } else {
      this.definirContextoPadrao();
    }
  }

  private definirContextoPadrao(): void {
    // Definir empresa ativa por padrão para demonstração visual
    const contextoPadrao: ContextoEmpresa = {
      empresaAtiva: {
        id: 'vmi-medica-001',
        razaoSocial: 'VMI MÉDICA LTDA',
        nomeFantasia: 'VMI MÉDICA',
        cnpj: '12.345.678/0001-95',
        inscricaoEstadual: '123.456.789',
        inscricaoMunicipal: '123.456',
        cnae: '4751201',
        endereco: {
          logradouro: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234-567',
          pais: 'BRASIL'
        },
        contato: {
          telefone: '(11) 1234-5678',
          email: 'contato@vmimedica.com.br',
          site: 'www.vmimedica.com.br'
        },
        regimeTributario: 'Simples Nacional',
        optanteSimples: true,
        optanteMEI: false
      },
      empresasDisponiveis: [
        {
          id: 'vmi-medica-001',
          razaoSocial: 'VMI MÉDICA LTDA',
          nomeFantasia: 'VMI MÉDICA',
          cnpj: '12.345.678/0001-95',
          logo: 'assets/ketra_logo.png',
          inscricaoEstadual: '123.456.789',
          inscricaoMunicipal: '123.456',
          cnae: '4751201',
          endereco: {
            logradouro: 'Rua das Flores',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '01234-567',
            pais: 'BRASIL'
          },
          contato: {
            telefone: '(11) 1234-5678',
            email: 'contato@vmimedica.com.br',
            site: 'www.vmimedica.com.br'
          },
          regimeTributario: 'Simples Nacional',
          optanteSimples: true,
          optanteMEI: false
        },
        {
          id: 'ketra-solucoes-001',
          razaoSocial: 'KETRA SOLUÇÕES INTELIGENTES LTDA',
          nomeFantasia: 'KETRA SOLUÇÕES INTELIGENTES',
          cnpj: '12.345.678/0001-90',
          logo: 'assets/ketra_logo1.png',
          inscricaoEstadual: '123.456.789',
          inscricaoMunicipal: '123.456',
          cnae: '6201500',
          endereco: {
            logradouro: 'Rua das Inovações',
            numero: '789',
            bairro: 'Centro Tecnológico',
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '01234-567',
            pais: 'BRASIL'
          },
          contato: {
            telefone: '(11) 3456-7890',
            email: 'contato@ketrasolucoes.com.br',
            site: 'www.ketrasolucoes.com.br'
          },
          regimeTributario: 'Lucro Real',
          optanteSimples: false,
          optanteMEI: false
        }
      ],
      usuarioLogado: null
    };

    this.contextoSubject.next(contextoPadrao);
    this.salvarContexto(contextoPadrao);
  }

  public alterarEmpresaAtiva(empresa: EmpresaModel): void {
    const contextoAtual = this.contextoSubject.value;
    const novoContexto: ContextoEmpresa = {
      ...contextoAtual,
      empresaAtiva: empresa
    };

    this.contextoSubject.next(novoContexto);
    this.salvarContexto(novoContexto);
  }

  public definirEmpresaAtivaAposLogin(empresa: EmpresaModel): void {
    // Método específico para definir empresa após login bem-sucedido
    this.alterarEmpresaAtiva(empresa);
  }

  public definirUsuarioLogado(usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    empresaId: string;
  }): void {
    const contextoAtual = this.contextoSubject.value;
    const novoContexto: ContextoEmpresa = {
      ...contextoAtual,
      usuarioLogado: usuario
    };

    this.contextoSubject.next(novoContexto);
    this.salvarContexto(novoContexto);
  }

  public obterEmpresaAtiva(): EmpresaModel | null {
    return this.contextoSubject.value.empresaAtiva;
  }

  public obterEmpresaAtivaId(): string | null {
    const empresa = this.obterEmpresaAtiva();
    return empresa ? empresa.id : null;
  }

  public obterEmpresaAtivaNome(): string | null {
    const empresa = this.obterEmpresaAtiva();
    return empresa ? empresa.nomeFantasia : null;
  }

  public obterEmpresasDisponiveis(): EmpresaModel[] {
    return this.contextoSubject.value.empresasDisponiveis;
  }

  public obterUsuarioLogado() {
    return this.contextoSubject.value.usuarioLogado;
  }

  public limparContexto(): void {
    localStorage.removeItem('contextoEmpresa');
    this.contextoSubject.next({
      empresaAtiva: null,
      empresasDisponiveis: [],
      usuarioLogado: null
    });
  }

  private salvarContexto(contexto: ContextoEmpresa): void {
    try {
      localStorage.setItem('contextoEmpresa', JSON.stringify(contexto));
    } catch (error) {
      console.error('Erro ao salvar contexto:', error);
    }
  }
}
