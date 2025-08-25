import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SessaoModel, SessaoFiltroModel, EncerrarSessaoModel, EncerrarMultiplasSessoesModel } from '../../models/sessao.model';
import { Result } from '../../models/api/result.model';

@Injectable({
  providedIn: 'root'
})
export class SessaoMockService {
  private mockSessoes: SessaoModel[] = [
    {
      id: '1',
      idUsuario: '101',
      nomeUsuario: 'João Silva',
      emailUsuario: 'joao.silva@empresa.com',
      perfilUsuario: 'Administrador',
      dataLogin: new Date('2024-01-15T08:30:00'),
      dataUltimaAtividade: new Date('2024-01-15T10:45:00'),
      tempoSessao: '2h 15min',
      tempoInativo: '5min',
      dispositivo: 'Desktop',
      navegador: 'Chrome',
      versaoNavegador: '120.0.6099.109',
      sistemaOperacional: 'Windows 11',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pais: 'Brasil',
      cidade: 'São Paulo',
      regiao: 'SP',
      ativa: true,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_123',
      expiraEm: new Date('2024-01-15T18:30:00'),
      dataCriacao: new Date('2024-01-15T08:30:00'),
      dataUltimaModificacao: new Date('2024-01-15T10:45:00'),
      idRespCriacao: '101',
      nomeRespCriacao: 'João Silva',
      idRespUltimaModificacao: '101',
      nomeRespUltimaModificacao: 'João Silva'
    },
    {
      id: '2',
      idUsuario: '102',
      nomeUsuario: 'Maria Santos',
      emailUsuario: 'maria.santos@empresa.com',
      perfilUsuario: 'Gerente',
      dataLogin: new Date('2024-01-15T09:15:00'),
      dataUltimaAtividade: new Date('2024-01-15T11:20:00'),
      tempoSessao: '2h 5min',
      tempoInativo: '15min',
      dispositivo: 'Laptop',
      navegador: 'Firefox',
      versaoNavegador: '121.0',
      sistemaOperacional: 'macOS',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0)',
      pais: 'Brasil',
      cidade: 'Rio de Janeiro',
      regiao: 'RJ',
      ativa: true,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_456',
      expiraEm: new Date('2024-01-15T19:15:00'),
      dataCriacao: new Date('2024-01-15T09:15:00'),
      dataUltimaModificacao: new Date('2024-01-15T11:20:00'),
      idRespCriacao: '102',
      nomeRespCriacao: 'Maria Santos',
      idRespUltimaModificacao: '102',
      nomeRespUltimaModificacao: 'Maria Santos'
    },
    {
      id: '3',
      idUsuario: '103',
      nomeUsuario: 'Pedro Oliveira',
      emailUsuario: 'pedro.oliveira@empresa.com',
      perfilUsuario: 'Usuário',
      dataLogin: new Date('2024-01-15T07:45:00'),
      dataUltimaAtividade: new Date('2024-01-15T09:30:00'),
      tempoSessao: '1h 45min',
      tempoInativo: '45min',
      dispositivo: 'Tablet',
      navegador: 'Safari',
      versaoNavegador: '17.1',
      sistemaOperacional: 'iOS',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X)',
      pais: 'Brasil',
      cidade: 'Belo Horizonte',
      regiao: 'MG',
      ativa: false,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_789',
      expiraEm: new Date('2024-01-15T17:45:00'),
      dataCriacao: new Date('2024-01-15T07:45:00'),
      dataUltimaModificacao: new Date('2024-01-15T09:30:00'),
      idRespCriacao: '103',
      nomeRespCriacao: 'Pedro Oliveira',
      idRespUltimaModificacao: '103',
      nomeRespUltimaModificacao: 'Pedro Oliveira'
    },
    {
      id: '4',
      idUsuario: '104',
      nomeUsuario: 'Ana Costa',
      emailUsuario: 'ana.costa@empresa.com',
      perfilUsuario: 'Analista',
      dataLogin: new Date('2024-01-15T10:00:00'),
      dataUltimaAtividade: new Date('2024-01-15T12:15:00'),
      tempoSessao: '2h 15min',
      tempoInativo: '0min',
      dispositivo: 'Desktop',
      navegador: 'Edge',
      versaoNavegador: '120.0.2210.91',
      sistemaOperacional: 'Windows 10',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pais: 'Brasil',
      cidade: 'Curitiba',
      regiao: 'PR',
      ativa: true,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_101',
      expiraEm: new Date('2024-01-15T20:00:00'),
      dataCriacao: new Date('2024-01-15T10:00:00'),
      dataUltimaModificacao: new Date('2024-01-15T12:15:00'),
      idRespCriacao: '104',
      nomeRespCriacao: 'Ana Costa',
      idRespUltimaModificacao: '104',
      nomeRespUltimaModificacao: 'Ana Costa'
    },
    {
      id: '5',
      idUsuario: '105',
      nomeUsuario: 'Carlos Ferreira',
      emailUsuario: 'carlos.ferreira@empresa.com',
      perfilUsuario: 'Administrador',
      dataLogin: new Date('2024-01-15T08:00:00'),
      dataUltimaAtividade: new Date('2024-01-15T10:30:00'),
      tempoSessao: '2h 30min',
      tempoInativo: '30min',
      dispositivo: 'Laptop',
      navegador: 'Chrome',
      versaoNavegador: '120.0.6099.109',
      sistemaOperacional: 'Ubuntu',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      pais: 'Brasil',
      cidade: 'Porto Alegre',
      regiao: 'RS',
      ativa: true,
      bloqueada: true,
      motivoBloqueio: 'Tentativas excessivas de login',
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_202',
      expiraEm: new Date('2024-01-15T18:00:00'),
      dataCriacao: new Date('2024-01-15T08:00:00'),
      dataUltimaModificacao: new Date('2024-01-15T10:30:00'),
      idRespCriacao: '105',
      nomeRespCriacao: 'Carlos Ferreira',
      idRespUltimaModificacao: '105',
      nomeRespUltimaModificacao: 'Carlos Ferreira'
    },
    {
      id: '6',
      idUsuario: '106',
      nomeUsuario: 'Lucia Mendes',
      emailUsuario: 'lucia.mendes@empresa.com',
      perfilUsuario: 'Gerente',
      dataLogin: new Date('2024-01-15T09:30:00'),
      dataUltimaAtividade: new Date('2024-01-15T11:45:00'),
      tempoSessao: '2h 15min',
      tempoInativo: '10min',
      dispositivo: 'Desktop',
      navegador: 'Firefox',
      versaoNavegador: '121.0',
      sistemaOperacional: 'Windows 11',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0)',
      pais: 'Brasil',
      cidade: 'Salvador',
      regiao: 'BA',
      ativa: true,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_303',
      expiraEm: new Date('2024-01-15T19:30:00'),
      dataCriacao: new Date('2024-01-15T09:30:00'),
      dataUltimaModificacao: new Date('2024-01-15T11:45:00'),
      idRespCriacao: '106',
      nomeRespCriacao: 'Lucia Mendes',
      idRespUltimaModificacao: '106',
      nomeRespUltimaModificacao: 'Lucia Mendes'
    },
    {
      id: '7',
      idUsuario: '107',
      nomeUsuario: 'Roberto Almeida',
      emailUsuario: 'roberto.almeida@empresa.com',
      perfilUsuario: 'Usuário',
      dataLogin: new Date('2024-01-15T07:00:00'),
      dataUltimaAtividade: new Date('2024-01-15T08:45:00'),
      tempoSessao: '1h 45min',
      tempoInativo: '60min',
      dispositivo: 'Smartphone',
      navegador: 'Chrome Mobile',
      versaoNavegador: '120.0.6099.144',
      sistemaOperacional: 'Android',
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B)',
      pais: 'Brasil',
      cidade: 'Recife',
      regiao: 'PE',
      ativa: false,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_404',
      expiraEm: new Date('2024-01-15T17:00:00'),
      dataCriacao: new Date('2024-01-15T07:00:00'),
      dataUltimaModificacao: new Date('2024-01-15T08:45:00'),
      idRespCriacao: '107',
      nomeRespCriacao: 'Roberto Almeida',
      idRespUltimaModificacao: '107',
      nomeRespUltimaModificacao: 'Roberto Almeida'
    },
    {
      id: '8',
      idUsuario: '108',
      nomeUsuario: 'Fernanda Lima',
      emailUsuario: 'fernanda.lima@empresa.com',
      perfilUsuario: 'Analista',
      dataLogin: new Date('2024-01-15T10:30:00'),
      dataUltimaAtividade: new Date('2024-01-15T12:45:00'),
      tempoSessao: '2h 15min',
      tempoInativo: '5min',
      dispositivo: 'Laptop',
      navegador: 'Safari',
      versaoNavegador: '17.1',
      sistemaOperacional: 'macOS',
      ipAddress: '192.168.1.107',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      pais: 'Brasil',
      cidade: 'Fortaleza',
      regiao: 'CE',
      ativa: true,
      bloqueada: false,
      motivoBloqueio: undefined,
      tokenJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'refresh_token_505',
      expiraEm: new Date('2024-01-15T20:30:00'),
      dataCriacao: new Date('2024-01-15T10:30:00'),
      dataUltimaModificacao: new Date('2024-01-15T12:45:00'),
      idRespCriacao: '108',
      nomeRespCriacao: 'Fernanda Lima',
      idRespUltimaModificacao: '108',
      nomeRespUltimaModificacao: 'Fernanda Lima'
    }
  ];

  /**
   * Simula a obtenção de todas as sessões com filtros e paginação
   */
  public getAll(route: string, id?: string, params?: string): Observable<Result<SessaoModel[]>> {
    return of(this.getFilteredSessoes(params)).pipe(delay(800));
  }

  /**
   * Simula o encerramento de uma sessão
   */
  public post(route: string, data: EncerrarSessaoModel, segments?: string[]): Observable<Result<any>> {
    this.mockSessoes = this.mockSessoes.filter(s => s.id !== data.idSessao);
    return of({ isSuccess: true, message: 'Sessão encerrada com sucesso', data: null }).pipe(delay(500));
  }

  /**
   * Simula o encerramento de múltiplas sessões
   */
  public encerrarMultiplasSessoes(data: EncerrarMultiplasSessoesModel): Observable<Result<any>> {
    this.mockSessoes = this.mockSessoes.filter(s => !data.idsSessoes.includes(s.id));
    return of({ isSuccess: true, message: `${data.idsSessoes.length} sessões encerradas com sucesso`, data: null }).pipe(delay(800));
  }

  /**
   * Simula a exportação para Excel
   */
  public exportarExcel(route: string, segments: string[], ...args: string[]): Observable<Blob> {
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return of(blob).pipe(delay(1000));
  }

  /**
   * Filtra as sessões baseado nos parâmetros da query string
   */
  private getFilteredSessoes(params?: string): Result<SessaoModel[]> {
    let filteredSessoes = [...this.mockSessoes];
    let totalCount = this.mockSessoes.length;
    let pageNumber = 1;
    let pageSize = 10;

    if (params) {
      const urlParams = new URLSearchParams(params);

      // Paginação
      if (urlParams.has('PageNumber')) {
        pageNumber = parseInt(urlParams.get('PageNumber')!);
      }
      if (urlParams.has('PageSize')) {
        pageSize = parseInt(urlParams.get('PageSize')!);
      }

      // Filtros
      if (urlParams.has('nomeUsuario')) {
        const nomeUsuario = urlParams.get('nomeUsuario')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.nomeUsuario.toLowerCase().includes(nomeUsuario)
        );
      }

      if (urlParams.has('emailUsuario')) {
        const emailUsuario = urlParams.get('emailUsuario')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.emailUsuario.toLowerCase().includes(emailUsuario)
        );
      }

      if (urlParams.has('perfilUsuario')) {
        const perfilUsuario = urlParams.get('perfilUsuario')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.perfilUsuario.toLowerCase().includes(perfilUsuario)
        );
      }

      if (urlParams.has('dispositivo')) {
        const dispositivo = urlParams.get('dispositivo')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.dispositivo.toLowerCase().includes(dispositivo)
        );
      }

      if (urlParams.has('navegador')) {
        const navegador = urlParams.get('navegador')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.navegador.toLowerCase().includes(navegador)
        );
      }

      if (urlParams.has('sistemaOperacional')) {
        const sistemaOperacional = urlParams.get('sistemaOperacional')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.sistemaOperacional.toLowerCase().includes(sistemaOperacional)
        );
      }

      if (urlParams.has('ipAddress')) {
        const ipAddress = urlParams.get('ipAddress')!.toLowerCase();
        filteredSessoes = filteredSessoes.filter(s => 
          s.ipAddress.toLowerCase().includes(ipAddress)
        );
      }

      if (urlParams.has('ativa')) {
        const ativa = urlParams.get('ativa') === 'true';
        filteredSessoes = filteredSessoes.filter(s => s.ativa === ativa);
      }

      if (urlParams.has('dataLoginInicio')) {
        const dataInicio = new Date(urlParams.get('dataLoginInicio')!);
        filteredSessoes = filteredSessoes.filter(s => 
          s.dataLogin >= dataInicio
        );
      }

      if (urlParams.has('dataLoginFim')) {
        const dataFim = new Date(urlParams.get('dataLoginFim')!);
        filteredSessoes = filteredSessoes.filter(s => 
          s.dataLogin <= dataFim
        );
      }

      if (urlParams.has('tempoSessaoMinimo')) {
        const tempoMinimo = parseInt(urlParams.get('tempoSessaoMinimo')!);
        filteredSessoes = filteredSessoes.filter(s => {
          const tempo = parseInt(s.tempoSessao.split(' ')[0]);
          return tempo >= tempoMinimo;
        });
      }

      if (urlParams.has('tempoSessaoMaximo')) {
        const tempoMaximo = parseInt(urlParams.get('tempoSessaoMaximo')!);
        filteredSessoes = filteredSessoes.filter(s => {
          const tempo = parseInt(s.tempoSessao.split(' ')[0]);
          return tempo <= tempoMaximo;
        });
      }

      totalCount = filteredSessoes.length;

      // Aplicar paginação
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      filteredSessoes = filteredSessoes.slice(startIndex, endIndex);
    }

    return {
      isSuccess: true,
      items: filteredSessoes,
      pagination: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount
      }
    };
  }

  /**
   * Gera conteúdo CSV para exportação
   */
  private generateCSVContent(): string {
    const headers = [
      'ID', 'Usuário', 'Email', 'Perfil', 'Data Login', 'Última Atividade',
      'Tempo Sessão', 'Tempo Inativo', 'Dispositivo', 'Navegador',
      'Sistema Operacional', 'IP', 'País', 'Cidade', 'Status'
    ];

    const csvRows = [headers.join(',')];

    this.mockSessoes.forEach(sessao => {
      const row = [
        sessao.id,
        sessao.nomeUsuario,
        sessao.emailUsuario,
        sessao.perfilUsuario,
        sessao.dataLogin.toISOString(),
        sessao.dataUltimaAtividade.toISOString(),
        sessao.tempoSessao,
        sessao.tempoInativo,
        sessao.dispositivo,
        sessao.navegador,
        sessao.sistemaOperacional,
        sessao.ipAddress,
        sessao.pais,
        sessao.cidade,
        sessao.ativa ? 'Ativa' : 'Inativa'
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}