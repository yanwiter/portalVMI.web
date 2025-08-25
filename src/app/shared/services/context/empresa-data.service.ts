import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContextService } from './context.service';
import { map } from 'rxjs/operators';

export interface DadosEmpresa {
  empresaId: string;
  configuracoes: {
    tema: string;
    idioma: string;
    timezone: string;
    formatoData: string;
    formatoMoeda: string;
  };
  permissoes: {
    modulos: string[];
    funcionalidades: string[];
    niveisAcesso: string[];
  };
  personalizacao: {
    logo: string;
    cores: {
      primaria: string;
      secundaria: string;
      sucesso: string;
      aviso: string;
      erro: string;
    };
    nomeSistema: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaDataService {
  private dadosEmpresas: Map<string, DadosEmpresa> = new Map();

  constructor(private contextService: ContextService) {
    this.inicializarDadosEmpresas();
  }

  private inicializarDadosEmpresas(): void {
    // Dados para VMI MÉDICA
    this.dadosEmpresas.set('vmi-medica-001', {
      empresaId: 'vmi-medica-001',
      configuracoes: {
        tema: 'light',
        idioma: 'pt',
        timezone: 'America/Sao_Paulo',
        formatoData: 'dd/MM/yyyy',
        formatoMoeda: 'BRL'
      },
      permissoes: {
        modulos: ['inicio', 'cadastros', 'comercial', 'estoque', 'financeiro', 'ponto', 'relatorios'],
        funcionalidades: ['dashboard', 'gestao-usuarios', 'gestao-empresas', 'relatorios-avancados'],
        niveisAcesso: ['admin', 'gerente', 'usuario', 'visualizador']
      },
      personalizacao: {
        logo: 'assets/ketra_logo.png',
        cores: {
          primaria: '#1976d2',
          secundaria: '#424242',
          sucesso: '#4caf50',
          aviso: '#ff9800',
          erro: '#f44336'
        },
        nomeSistema: 'Portal VMI Médica'
      }
    });

    // Dados para KETRA SOLUÇÕES INTELIGENTES
    this.dadosEmpresas.set('ketra-solucoes-001', {
      empresaId: 'ketra-solucoes-001',
      configuracoes: {
        tema: 'light',
        idioma: 'pt',
        timezone: 'America/Sao_Paulo',
        formatoData: 'dd/MM/yyyy',
        formatoMoeda: 'BRL'
      },
      permissoes: {
        modulos: ['inicio', 'cadastros', 'estoque', 'financeiro', 'relatorios'],
        funcionalidades: ['dashboard', 'gestao-usuarios', 'relatorios-basicos'],
        niveisAcesso: ['admin', 'gerente', 'usuario']
      },
      personalizacao: {
        logo: 'assets/ketra_logo1.png',
        cores: {
          primaria: '#e91e63',
          secundaria: '#607d8b',
          sucesso: '#8bc34a',
          aviso: '#ffc107',
          erro: '#e74c3c'
        },
        nomeSistema: 'Sistema Ketra Soluções Inteligentes'
      }
    });
  }

  public obterDadosEmpresa(empresaId: string): Observable<DadosEmpresa | null> {
    const dados = this.dadosEmpresas.get(empresaId);
    return of(dados || null);
  }

  public obterDadosEmpresaAtiva(): Observable<DadosEmpresa | null> {
    const empresaAtiva = this.contextService.obterEmpresaAtiva();
    if (empresaAtiva) {
      return this.obterDadosEmpresa(empresaAtiva.id);
    }
    return of(null);
  }

  public obterConfiguracoesEmpresa(empresaId: string): Observable<any> {
    return this.obterDadosEmpresa(empresaId).pipe(
      map(dados => dados?.configuracoes || null)
    );
  }

  public obterPermissoesEmpresa(empresaId: string): Observable<any> {
    return this.obterDadosEmpresa(empresaId).pipe(
      map(dados => dados?.permissoes || null)
    );
  }

  public obterPersonalizacaoEmpresa(empresaId: string): Observable<any> {
    return this.obterDadosEmpresa(empresaId).pipe(
      map(dados => dados?.personalizacao || null)
    );
  }

  public verificarPermissaoModulo(empresaId: string, modulo: string): Observable<boolean> {
    return this.obterPermissoesEmpresa(empresaId).pipe(
      map(permissoes => permissoes?.modulos?.includes(modulo) || false)
    );
  }

  public verificarPermissaoFuncionalidade(empresaId: string, funcionalidade: string): Observable<boolean> {
    return this.obterPermissoesEmpresa(empresaId).pipe(
      map(permissoes => permissoes?.funcionalidades?.includes(funcionalidade) || false)
    );
  }

  public verificarNivelAcesso(empresaId: string, nivel: string): Observable<boolean> {
    return this.obterPermissoesEmpresa(empresaId).pipe(
      map(permissoes => permissoes?.niveisAcesso?.includes(nivel) || false)
    );
  }
}
