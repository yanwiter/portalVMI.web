/**
 * Exemplo de uso do SessaoMockService
 * 
 * Este arquivo demonstra como usar o serviço mock de sessões
 * e como alternar entre dados mock e reais.
 */

import { SessaoMockService } from './sessao-mock.service';
import { GenericService } from '../generic/generic.service';
import { SessaoModel } from '../../models/sessao.model';
import { isMockEnabled } from '../../config/mock-config';

/**
 * Exemplo de componente que usa o serviço de sessões
 */
export class SessaoExampleComponent {
  
  constructor(
    private sessoesService: GenericService<SessaoModel>,
    private sessoesMockService: SessaoMockService
  ) {}

  /**
   * Exemplo: Carregar lista de sessões
   */
  carregarSessoes() {
    const params = 'PageNumber=1&PageSize=10';
    
    if (isMockEnabled('sessoes')) {
      console.log('Usando dados MOCK');
      this.sessoesMockService.getAll('sessaoRoutes', undefined, params)
        .subscribe({
          next: (response) => {
            console.log('Dados mock carregados:', response);
            // Processar dados mock
          },
          error: (err) => {
            console.error('Erro ao carregar dados mock:', err);
          }
        });
    } else {
      console.log('Usando dados REAIS da API');
      this.sessoesService.getAll('sessaoRoutes', undefined, params)
        .subscribe({
          next: (response) => {
            console.log('Dados reais carregados:', response);
            // Processar dados reais
          },
          error: (err) => {
            console.error('Erro ao carregar dados reais:', err);
          }
        });
    }
  }

  /**
   * Exemplo: Encerrar uma sessão
   */
  encerrarSessao(idSessao: string) {
    const encerrarData = {
      idSessao: idSessao,
      motivo: 'Encerramento de teste',
      idRespEncerramento: 'admin1',
      nomeRespEncerramento: 'Administrador'
    };

    if (isMockEnabled('sessoes')) {
      this.sessoesMockService.post('sessaoRoutes', encerrarData, ['encerrar'])
        .subscribe({
          next: (response) => {
            console.log('Sessão encerrada (mock):', response);
          },
          error: (err) => {
            console.error('Erro ao encerrar sessão (mock):', err);
          }
        });
    } else {
      this.sessoesService.post('sessaoRoutes', encerrarData, ['encerrar'])
        .subscribe({
          next: (response) => {
            console.log('Sessão encerrada (real):', response);
          },
          error: (err) => {
            console.error('Erro ao encerrar sessão (real):', err);
          }
        });
    }
  }

  /**
   * Exemplo: Exportar dados para Excel
   */
  exportarDados() {
    const args = ['PageNumber=1', 'PageSize=100'];

    if (isMockEnabled('sessoes')) {
      this.sessoesMockService.exportarExcel('sessaoRoutes', ['exportar-excel'], ...args)
        .subscribe({
          next: (blob) => {
            console.log('Arquivo mock gerado:', blob);
            // Criar link de download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sessoes-mock.csv';
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.error('Erro ao exportar (mock):', err);
          }
        });
    } else {
      this.sessoesService.exportarExcel('sessaoRoutes', ['exportar-excel'], ...args)
        .subscribe({
          next: (blob) => {
            console.log('Arquivo real gerado:', blob);
            // Criar link de download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sessoes-real.csv';
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.error('Erro ao exportar (real):', err);
          }
        });
    }
  }

  /**
   * Exemplo: Aplicar filtros
   */
  aplicarFiltros() {
    const filtros = [
      'nomeUsuario=João',
      'perfilUsuario=Administrador',
      'ativa=true',
      'PageNumber=1',
      'PageSize=25'
    ];
    
    const params = filtros.join('&');

    if (isMockEnabled('sessoes')) {
      this.sessoesMockService.getAll('sessaoRoutes', undefined, params)
        .subscribe({
          next: (response) => {
            console.log('Dados filtrados (mock):', response);
          },
          error: (err) => {
            console.error('Erro ao filtrar (mock):', err);
          }
        });
    } else {
      this.sessoesService.getAll('sessaoRoutes', undefined, params)
        .subscribe({
          next: (response) => {
            console.log('Dados filtrados (real):', response);
          },
          error: (err) => {
            console.error('Erro ao filtrar (real):', err);
          }
        });
    }
  }
}

/**
 * Exemplo de como testar o mock no console do navegador
 */
export function testarMockNoConsole() {
  console.log('=== TESTE DO MOCK DE SESSÕES ===');
  
  // Verificar se mock está habilitado
  console.log('Mock habilitado:', isMockEnabled('sessoes'));
  
  // Criar instância do serviço mock
  const mockService = new SessaoMockService();
  
  // Testar carregamento de dados
  mockService.getAll('sessaoRoutes', undefined, 'PageNumber=1&PageSize=5')
    .subscribe({
      next: (response) => {
        console.log('✅ Dados mock carregados com sucesso:', response);
        console.log('📊 Total de registros:', response.totalCount);
        console.log('📄 Registros na página:', response.items?.length);
        
        if (response.items && response.items.length > 0) {
          console.log('👤 Primeiro usuário:', response.items[0].nomeUsuario);
          console.log('💻 Dispositivo:', response.items[0].dispositivo);
          console.log('🌐 Navegador:', response.items[0].navegador);
        }
      },
      error: (err) => {
        console.error('❌ Erro ao carregar dados mock:', err);
      }
    });
  
  // Testar filtros
  mockService.getAll('sessaoRoutes', undefined, 'nomeUsuario=João&ativa=true')
    .subscribe({
      next: (response) => {
        console.log('🔍 Filtros aplicados:', response);
      },
      error: (err) => {
        console.error('❌ Erro ao aplicar filtros:', err);
      }
    });
  
  // Testar exportação
  mockService.exportarExcel('sessaoRoutes', ['exportar-excel'], 'PageNumber=1', 'PageSize=10')
    .subscribe({
      next: (blob) => {
        console.log('📁 Arquivo mock gerado:', blob);
        console.log('📏 Tamanho do arquivo:', blob.size, 'bytes');
      },
      error: (err) => {
        console.error('❌ Erro ao exportar:', err);
      }
    });
}

/**
 * Exemplo de como verificar a configuração do mock
 */
export function verificarConfiguracaoMock() {
  console.log('=== CONFIGURAÇÃO DO MOCK ===');
  
  // Importar configuração (em um ambiente real, você importaria do arquivo)
  const mockConfig = {
    useMock: true,
    sessoes: {
      useMock: true,
      delayMs: 800
    }
  };
  
  console.log('🔧 Configuração global:', mockConfig.useMock);
  console.log('📋 Mock de sessões:', mockConfig.sessoes.useMock);
  console.log('⏱️ Delay simulado:', mockConfig.sessoes.delayMs, 'ms');
  
  if (mockConfig.useMock && mockConfig.sessoes.useMock) {
    console.log('✅ Mock de sessões está ATIVO');
  } else {
    console.log('❌ Mock de sessões está INATIVO');
  }
}