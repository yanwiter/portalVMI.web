/**
 * Configurações para uso de dados mock
 * 
 * Este arquivo centraliza as configurações de mock para facilitar
 * a alternância entre dados reais e simulados durante o desenvolvimento
 */

export interface MockConfig {
  // Configurações gerais
  useMock: boolean;
  
  // Configurações específicas por módulo
  sessoes: {
    useMock: boolean;
    delayMs: number; // Delay simulado para requisições
  };
  
  usuarios: {
    useMock: boolean;
    delayMs: number;
  };
  
  relatorios: {
    useMock: boolean;
    delayMs: number;
  };
}

/**
 * Configuração padrão para desenvolvimento
 */
export const mockConfig: MockConfig = {
  useMock: true, // Altere para false para desabilitar todos os mocks
  
  sessoes: {
    useMock: true, // Altere para false para usar API real de sessões
    delayMs: 800
  },
  
  usuarios: {
    useMock: true,
    delayMs: 600
  },
  
  relatorios: {
    useMock: true,
    delayMs: 1000
  }
};

/**
 * Função para verificar se o mock está habilitado para um módulo específico
 */
export function isMockEnabled(module: keyof Omit<MockConfig, 'useMock'>): boolean {
  return mockConfig.useMock && mockConfig[module].useMock;
}

/**
 * Função para obter o delay configurado para um módulo
 */
export function getMockDelay(module: keyof Omit<MockConfig, 'useMock'>): number {
  return mockConfig[module].delayMs;
}