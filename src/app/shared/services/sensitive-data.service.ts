import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SensitiveDataLevel, SensitiveDataConfig, SensitiveDataField, SENSITIVE_DATA_LEVELS } from '../models/sensitive-data.model';

@Injectable({
  providedIn: 'root'
})
export class SensitiveDataService {
  private currentUserLevel = new BehaviorSubject<SensitiveDataLevel>(SensitiveDataLevel.PUBLIC);
  private sensitiveFields = new BehaviorSubject<SensitiveDataField[]>([]);

  constructor() {
    this.initializeSensitiveFields();
  }

  /**
   * Define o nível de acesso do usuário atual
   */
  setUserLevel(level: SensitiveDataLevel): void {
    this.currentUserLevel.next(level);
  }

  /**
   * Obtém o nível de acesso do usuário atual
   */
  getUserLevel(): Observable<SensitiveDataLevel> {
    return this.currentUserLevel.asObservable();
  }

  /**
   * Verifica se um campo deve ser borrado baseado no nível do usuário
   */
  shouldBlurField(fieldLevel: SensitiveDataLevel): boolean {
    const userLevel = this.currentUserLevel.value;
    
    if (userLevel === SensitiveDataLevel.CONFIDENTIAL) {
      return false; // Usuário confidencial vê tudo
    }
    
    if (userLevel === SensitiveDataLevel.INTERNAL) {
      return fieldLevel === SensitiveDataLevel.CONFIDENTIAL;
    }
    
    // Usuário público só vê dados públicos
    return fieldLevel !== SensitiveDataLevel.PUBLIC;
  }

  /**
   * Obtém a intensidade do blur para um campo
   */
  getBlurIntensity(fieldLevel: SensitiveDataLevel): number {
    if (this.shouldBlurField(fieldLevel)) {
      return SENSITIVE_DATA_LEVELS[fieldLevel].blurIntensity;
    }
    return 0;
  }

  /**
   * Obtém a configuração de um nível de sensibilidade
   */
  getLevelConfig(level: SensitiveDataLevel): SensitiveDataConfig {
    return SENSITIVE_DATA_LEVELS[level];
  }

  /**
   * Adiciona campos sensíveis ao sistema
   */
  addSensitiveFields(fields: SensitiveDataField[]): void {
    const currentFields = this.sensitiveFields.value;
    this.sensitiveFields.next([...currentFields, ...fields]);
  }

  /**
   * Obtém todos os campos sensíveis
   */
  getSensitiveFields(): Observable<SensitiveDataField[]> {
    return this.sensitiveFields.asObservable();
  }

  /**
   * Inicializa o sistema de dados sensíveis globalmente
   */
  initializeGlobalSensitiveData(): void {
    // Define o nível inicial do usuário (pode vir do sistema de autenticação)
    // Por padrão, define como INTERNAL para demonstração
    this.setUserLevel(SensitiveDataLevel.INTERNAL);
    
    // Adiciona campos sensíveis padrão se ainda não foram adicionados
    if (this.sensitiveFields.value.length === 0) {
      this.initializeSensitiveFields();
    }
  }

  /**
   * Obtém o nível de sensibilidade de um campo específico
   */
  getFieldLevel(fieldName: string): SensitiveDataLevel {
    const field = this.sensitiveFields.value.find(f => f.fieldName === fieldName);
    return field ? field.level : SensitiveDataLevel.PUBLIC;
  }

  /**
   * Inicializa campos sensíveis padrão
   */
  private initializeSensitiveFields(): void {
    const defaultFields: SensitiveDataField[] = [
      { fieldName: 'cpf', level: SensitiveDataLevel.CONFIDENTIAL, displayName: 'CPF' },
      { fieldName: 'rg', level: SensitiveDataLevel.CONFIDENTIAL, displayName: 'RG' },
      { fieldName: 'dataNascimento', level: SensitiveDataLevel.INTERNAL, displayName: 'Data de Nascimento' },
      { fieldName: 'endereco', level: SensitiveDataLevel.INTERNAL, displayName: 'Endereço' },
      { fieldName: 'telefone', level: SensitiveDataLevel.INTERNAL, displayName: 'Telefone' },
      { fieldName: 'email', level: SensitiveDataLevel.INTERNAL, displayName: 'E-mail' },
      { fieldName: 'nome', level: SensitiveDataLevel.PUBLIC, displayName: 'Nome' },
      { fieldName: 'cargo', level: SensitiveDataLevel.PUBLIC, displayName: 'Cargo' }
    ];
    
    this.sensitiveFields.next(defaultFields);
  }
}
