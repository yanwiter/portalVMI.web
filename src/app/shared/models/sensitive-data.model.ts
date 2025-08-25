export enum SensitiveDataLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential'
}

export interface SensitiveDataConfig {
  level: SensitiveDataLevel;
  label: string;
  color: string;
  requiresBlur: boolean;
  blurIntensity: number;
  description: string;
}

export interface SensitiveDataField {
  fieldName: string;
  level: SensitiveDataLevel;
  displayName?: string;
}

export const SENSITIVE_DATA_LEVELS: Record<SensitiveDataLevel, SensitiveDataConfig> = {
  [SensitiveDataLevel.PUBLIC]: {
    level: SensitiveDataLevel.PUBLIC,
    label: 'Público',
    color: '#28a745',
    requiresBlur: false,
    blurIntensity: 0,
    description: 'Acesso completo aos dados'
  },
  [SensitiveDataLevel.INTERNAL]: {
    level: SensitiveDataLevel.INTERNAL,
    label: 'Interno',
    color: '#ffc107',
    requiresBlur: true,
    blurIntensity: 3,
    description: 'Acesso limitado - dados confidenciais ocultos'
  },
  [SensitiveDataLevel.CONFIDENTIAL]: {
    level: SensitiveDataLevel.CONFIDENTIAL,
    label: 'Confidencial',
    color: '#dc3545',
    requiresBlur: true,
    blurIntensity: 8,
    description: 'Acesso restrito - apenas dados públicos visíveis'
  }
};
