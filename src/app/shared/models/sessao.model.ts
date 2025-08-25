export interface SessaoModel {
  id: string;
  idUsuario: string;
  nomeUsuario: string;
  emailUsuario: string;
  perfilUsuario: string;
  
  // Informações da sessão
  dataLogin: Date;
  dataUltimaAtividade: Date;
  tempoSessao: string; // Tempo em sessão formatado
  tempoInativo: string; // Tempo inativo formatado
  
  // Informações do dispositivo
  dispositivo: string;
  navegador: string;
  versaoNavegador: string;
  sistemaOperacional: string;
  ipAddress: string;
  userAgent: string;
  
  // Informações de localização
  pais: string;
  cidade: string;
  regiao: string;
  
  // Status da sessão
  ativa: boolean;
  bloqueada: boolean;
  motivoBloqueio?: string;
  
  // Informações de segurança
  tokenJWT: string;
  refreshToken: string;
  expiraEm: Date;
  
  // Metadados
  dataCriacao: Date;
  dataUltimaModificacao: Date;
  idRespCriacao: string;
  nomeRespCriacao: string;
  idRespUltimaModificacao?: string;
  nomeRespUltimaModificacao?: string;
}

export interface SessaoFiltroModel {
  nomeUsuario?: string;
  emailUsuario?: string;
  perfilUsuario?: string;
  dispositivo?: string;
  navegador?: string;
  sistemaOperacional?: string;
  ipAddress?: string;
  pais?: string;
  cidade?: string;
  ativa?: boolean;
  bloqueada?: boolean;
  dataLoginInicio?: Date;
  dataLoginFim?: Date;
  tempoSessaoMinimo?: number; // em minutos
  tempoSessaoMaximo?: number; // em minutos
}

export interface EncerrarSessaoModel {
  idSessao: string;
  motivo: string;
  idRespEncerramento: string;
  nomeRespEncerramento: string;
}

export interface EncerrarMultiplasSessoesModel {
  idsSessoes: string[];
  motivo: string;
  idRespEncerramento: string;
  nomeRespEncerramento: string;
}