import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ColumnConfig } from '../../models/column-config.model';
import { ColumnPreferenceRequest } from '../../models/columnPreferenceRequest.model';
import { ColumnPreferenceUpdateRequest } from '../../models/column-preference-update-request.model';
import { ColumnPreferenceModel } from '../../models/columnPreference.model';
import { GenericService } from '../generic/generic.service';
import { Result } from '../../models/api/result.model';
import { getUserIdFromStorage, getUserNameFromStorage } from '../../util/localStorageUtil';
import { generateUniqueId } from '../../util/util';
@Injectable({
  providedIn: 'root'
})
export class ColumnPreferencesService {
  private readonly STORAGE_KEY = 'column_preferences';
  private readonly genericService = new GenericService<any>();
  
  private preferencesSubject = new BehaviorSubject<ColumnPreferenceModel[]>([]);
  private currentPreferenceSubject = new BehaviorSubject<ColumnPreferenceModel | null>(null);
  
  public preferences$ = this.preferencesSubject.asObservable();
  public currentPreference$ = this.currentPreferenceSubject.asObservable();

  public screenKey: string = '';
  public columns: ColumnConfig[] = [];

  /**
   * Carrega todas as preferências salvas
   */
  public loadPreferences(screenKey: string, columns: ColumnConfig[]): ColumnConfig[] {
    try {
      const savedPreferences = localStorage.getItem(this.STORAGE_KEY);
      let preferences: ColumnPreferenceModel[] = [];
      
      if (savedPreferences) {
        preferences = JSON.parse(savedPreferences);
      }
      
      let defaultPref = preferences.find(p => p.isDefault && p.screenKey === screenKey);
      
      if (!defaultPref) {
        const defaultColumns = this.getDefaultColumns(columns);
        defaultPref = {
          id: `default-${screenKey}`,
          namePreference: 'Padrão',
          description: 'Configuração padrão do sistema',
          screenKey: screenKey,
          idUser: "",
          columns: defaultColumns,
          isFavorite: false,
          isPinned: false,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        };
        
        preferences = [defaultPref, ...preferences];
        
        this.savePreferences(preferences);
      }
      
      this.preferencesSubject.next(preferences);
      
      const currentPref = defaultPref || 
                         preferences.find(p => p.isPinned && p.screenKey === screenKey) || 
                         preferences.find(p => p.screenKey === screenKey);
      
      if (currentPref) {
        this.currentPreferenceSubject.next(currentPref);
      }

      return currentPref ? currentPref.columns : this.getDefaultColumns(columns);
    } catch (error) {
      console.error('Erro ao carregar preferências de colunas:', error);
      
      const defaultColumns = this.getDefaultColumns(columns);
      const defaultPref: ColumnPreferenceModel = {
        id: `default-${screenKey}`,
        namePreference: 'Padrão',
        description: 'Configuração padrão do sistema',
        screenKey: screenKey,
        idUser: "",
        columns: defaultColumns,
        isFavorite: false,
        isPinned: false,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      };
      
      this.preferencesSubject.next([defaultPref]);
      this.currentPreferenceSubject.next(defaultPref);
      
      return defaultColumns;
    }
  }

  /**
   * Salva as preferências no localStorage
   */
  public savePreferences(preferences: ColumnPreferenceModel[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.preferencesSubject.next(preferences);
    } catch (error) {
      console.error('Erro ao salvar preferências de colunas:', error);
    }
  }

  /**
   * Salva preferências de colunas para uma tela específica
   * @param screenKey Chave da tela
   * @param columns Colunas a serem salvas
   */
  public savePreferencesForScreen(screenKey: string, columns: ColumnConfig[]): void {
    try {
      const savedPreferences = localStorage.getItem(this.STORAGE_KEY);
      let preferences: ColumnPreferenceModel[] = [];
      
      if (savedPreferences) {
        preferences = JSON.parse(savedPreferences);
      }

      preferences = preferences.filter(p => p.screenKey !== screenKey);
      
      const newPreference: ColumnPreferenceModel = {
        id: generateUniqueId(),
        namePreference: `Configuração ${screenKey}`,
        description: `Configuração personalizada para ${screenKey}`,
        screenKey: screenKey,
        idUser: getUserIdFromStorage(),
        columns: columns.map((col, index) => ({ ...col, order: index })),
        isFavorite: false,
        isPinned: false,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: getUserNameFromStorage()
      };
      
      preferences.push(newPreference);
      this.savePreferences(preferences);
    } catch (error) {
      console.error('Erro ao salvar preferências da tela:', error);
    }
  }

  /**
   * Método simplificado para salvar preferências de colunas (usado pelo componente)
   * @param screenKey Chave da tela
   * @param columns Colunas a serem salvas
   */
  public savePreferencesForScreenSimple(screenKey: string, columns: ColumnConfig[]): void {
    this.savePreferencesForScreen(screenKey, columns);
  }

  /**
   * Cria uma nova preferência
   */
  createPreference(request: ColumnPreferenceRequest): ColumnPreferenceModel {
    const newPreference: ColumnPreferenceModel = {
      id: generateUniqueId(),
      namePreference: request.name,
      description: request.description,
      screenKey: request.screenKey || 'default',
      idUser: getUserIdFromStorage(),
      columns: request.columns.map((col, index) => ({ ...col, order: index })),
      isFavorite: request.isFavorite,
      isPinned: request.isPinned,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getUserNameFromStorage()
    };

    const currentPreferences = this.preferencesSubject.value;
    const updatedPreferences = [...currentPreferences, newPreference];
    
    this.savePreferences(updatedPreferences);
    return newPreference;
  }

  /**
   * Atualiza uma preferência existente
   */
  updatePreference(request: ColumnPreferenceUpdateRequest): ColumnPreferenceModel | null {
    const currentPreferences = this.preferencesSubject.value;
    const index = currentPreferences.findIndex(p => p.id === request.id);
    
    if (index === -1) return null;

    const updatedPreference: ColumnPreferenceModel = {
      ...currentPreferences[index],
      ...request,
      updatedAt: new Date()
    };

    if (request.columns) {
      updatedPreference.columns = request.columns.map((col, idx) => ({ ...col, order: idx }));
    }

    const updatedPreferences = [...currentPreferences];
    updatedPreferences[index] = updatedPreference;
    
    this.savePreferences(updatedPreferences);
    
    if (this.currentPreferenceSubject.value?.id === request.id) {
      this.currentPreferenceSubject.next(updatedPreference);
    }
    
    return updatedPreference;
  }

  /**
   * Remove uma preferência
   */
  deletePreference(id: string): boolean {
    const currentPreferences = this.preferencesSubject.value;
    const updatedPreferences = currentPreferences.filter(p => p.id !== id);
    
    if (updatedPreferences.length !== currentPreferences.length) {
      this.savePreferences(updatedPreferences);
      
      if (this.currentPreferenceSubject.value?.id === id) {
        const newCurrent = updatedPreferences[0] || null;
        this.currentPreferenceSubject.next(newCurrent);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Duplica uma preferência existente
   */
  duplicatePreference(id: string, newName: string): ColumnPreferenceModel | null {
    const original = this.preferencesSubject.value.find(p => p.id === id);
    if (!original) return null;

    const duplicated: ColumnPreferenceModel = {
      ...original,
      id: generateUniqueId(),
      namePreference: newName,
      isDefault: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentPreferences = this.preferencesSubject.value;
    const updatedPreferences = [...currentPreferences, duplicated];
    
    this.savePreferences(updatedPreferences);
    return duplicated;
  }

  /**
   * Define uma preferência como favorita
   */
  toggleFavorite(id: string): boolean {
    const currentPreferences = this.preferencesSubject.value;
    const index = currentPreferences.findIndex(p => p.id === id);
    
    if (index === -1) return false;

    const updatedPreference = {
      ...currentPreferences[index],
      isFavorite: !currentPreferences[index].isFavorite,
      updatedAt: new Date()
    };

    const updatedPreferences = [...currentPreferences];
    updatedPreferences[index] = updatedPreference;
    
    this.savePreferences(updatedPreferences);
    
    if (this.currentPreferenceSubject.value?.id === id) {
      this.currentPreferenceSubject.next(updatedPreference);
    }
    
    return updatedPreference.isFavorite;
  }

  /**
   * Fixa/desfixa uma preferência
   */
  togglePinned(id: string): boolean {
    const currentPreferences = this.preferencesSubject.value;
    const index = currentPreferences.findIndex(p => p.id === id);
    
    if (index === -1) return false;

    const updatedPreference = {
      ...currentPreferences[index],
      isPinned: !currentPreferences[index].isPinned,
      updatedAt: new Date()
    };

    const updatedPreferences = [...currentPreferences];
    updatedPreferences[index] = updatedPreference;
    
    this.savePreferences(updatedPreferences);
    
    if (this.currentPreferenceSubject.value?.id === id) {
      this.currentPreferenceSubject.next(updatedPreference);
    }
    
    return updatedPreference.isPinned;
  }

  /**
   * Define uma preferência como padrão
   */
  setAsDefault(id: string): boolean {
    const currentPreferences = this.preferencesSubject.value;
    const updatedPreferences = currentPreferences.map(p => ({
      ...p,
      isDefault: p.id === id,
      updatedAt: p.id === id ? new Date() : p.updatedAt
    }));
    
    this.savePreferences(updatedPreferences);
    
    const newDefault = updatedPreferences.find(p => p.id === id);
    if (newDefault) {
      this.currentPreferenceSubject.next(newDefault);
    }
    
    return true;
  }

  /**
   * Aplica uma preferência específica
   */
  applyPreference(id: string): ColumnConfig[] | null {
    const preference = this.preferencesSubject.value.find(p => p.id === id);
    if (!preference) return null;

    this.currentPreferenceSubject.next(preference);
    return preference.columns;
  }

  /**
   * Salva a configuração atual das colunas como uma nova preferência
   */
  saveCurrentColumnsAsPreference(columns: ColumnConfig[], name: string, description?: string, screenKey?: string): ColumnPreferenceModel | null {
    if (!columns || columns.length === 0) return null;

    const request: ColumnPreferenceRequest = {
      name: name,
      description: description || 'Configuração atual das colunas',
      columns: columns.map((col, index) => ({ ...col, order: index })),
      isFavorite: false,
      isPinned: false,
      screenKey: screenKey || 'default'
    };

    return this.createPreference(request);
  }

  /**
   * Atualiza a configuração atual das colunas
   */
  updateCurrentColumns(columns: ColumnConfig[]): void {
    if (!columns || columns.length === 0) return;

    const currentPref = this.currentPreferenceSubject.value;
    
    if (currentPref) {
      const updatedPreference: ColumnPreferenceModel = {
        ...currentPref,
        columns: columns.map((col, index) => ({ ...col, order: index })),
        updatedAt: new Date()
      };

      const currentPreferences = this.preferencesSubject.value;
      const index = currentPreferences.findIndex(p => p.id === currentPref.id);
      
      if (index !== -1) {
        const updatedPreferences = [...currentPreferences];
        updatedPreferences[index] = updatedPreference;
        this.savePreferences(updatedPreferences);
      }

      this.currentPreferenceSubject.next(updatedPreference);
    }
  }

  /**
   * Salva automaticamente as configurações de colunas
   */
  autoSaveColumns(columns: ColumnConfig[], screenKey?: string): void {
    if (!columns || columns.length === 0) return;

    try {
      const autoSaveKey = 'auto_saved_columns';
      localStorage.setItem(autoSaveKey, JSON.stringify(columns));
      
      if (screenKey) {
        this.savePreferencesForScreen(screenKey, columns);
      }
    } catch (error) {
      console.error('Erro ao salvar colunas automaticamente:', error);
    }

    this.updateCurrentColumns(columns);
  }

  /**
   * Carrega as configurações de colunas salvas automaticamente
   */
  loadAutoSavedColumns(): ColumnConfig[] | null {
    try {
      const autoSaveKey = 'auto_saved_columns';
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar colunas salvas automaticamente:', error);
    }
    return null;
  }

  /**
   * Obtém a preferência atual
   */
  getCurrentPreference(): ColumnPreferenceModel | null {
    return this.currentPreferenceSubject.value;
  }

  /**
   * Obtém todas as preferências
   */
  getAllPreferences(): ColumnPreferenceModel[] {
    return this.preferencesSubject.value;
  }

  /**
   * Obtém preferências favoritas
   */
  getFavoritePreferences(): ColumnPreferenceModel[] {
    return this.preferencesSubject.value.filter(p => p.isFavorite);
  }

  /**
   * Obtém preferências fixadas
   */
  getPinnedPreferences(): ColumnPreferenceModel[] {
    return this.preferencesSubject.value.filter(p => p.isPinned);
  }

  /**
   * Restaura a configuração padrão
   */
  restoreDefault(): ColumnConfig[] {
    const currentPref = this.currentPreferenceSubject.value;
    if (!currentPref) return [];
    
    const defaultColumns = this.getDefaultColumns(currentPref.columns);
    const defaultPreference: ColumnPreferenceModel = {
      id: `default-${currentPref.screenKey}`,
      namePreference: 'Padrão',
      description: 'Configuração padrão do sistema',
      screenKey: currentPref.screenKey,
      idUser: "",
      columns: defaultColumns,
      isFavorite: false,
      isPinned: false,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.currentPreferenceSubject.next(defaultPreference);
    return defaultColumns;
  }

  /**
   * Restaura a configuração padrão baseada nas colunas fornecidas
   */
  restoreDefaultFromColumns(columns: ColumnConfig[]): ColumnConfig[] {
    if (!columns || columns.length === 0) return this.getDefaultColumns(columns);
    
    return columns.map((col, index) => ({
      ...col,
      visible: col.visible !== undefined ? col.visible : true,
      order: index
    }));
  }

  /**
   * Seleciona todas as colunas
   */
  selectAllColumns(columns: ColumnConfig[]): ColumnConfig[] {
    if (!columns || columns.length === 0) return [];
    return columns.map(col => ({ ...col, visible: true }));
  }

  /**
   * Desmarca todas as colunas
   */
  deselectAllColumns(columns: ColumnConfig[]): ColumnConfig[] {
    if (!columns || columns.length === 0) return [];
    return columns.map(col => ({ ...col, visible: false }));
  }

  /**
   * Reordena as colunas
   */
  reorderColumns(columns: ColumnConfig[], fromIndex: number, toIndex: number): ColumnConfig[] {
    if (!columns || columns.length === 0) return [];
    
    const reordered = [...columns];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);
    
    return reordered.map((col, index) => ({ ...col, order: index }));
  }



  /**
   * Obtém as colunas padrão baseadas nas colunas fornecidas
   */
  private getDefaultColumns(columns: ColumnConfig[]): ColumnConfig[] {
    if (!columns || columns.length === 0) return [];
    
    return columns.map((col, index) => ({
      ...col,
      visible: col.visible !== undefined ? col.visible : true,
      order: index
    }));
  }

  /**
   * Carrega preferências de colunas do localStorage para uma tela específica
   * @param screenKey Chave da tela
   * @param defaultColumns Colunas padrão para fallback
   * @returns Array de preferências
   */
  public loadPreferencesForScreen(screenKey: string, defaultColumns: ColumnConfig[]): ColumnPreferenceModel[] {
    try {
      const savedPreferences = localStorage.getItem(this.STORAGE_KEY);
      let preferences: ColumnPreferenceModel[] = [];
      
      if (savedPreferences) {
        preferences = JSON.parse(savedPreferences);
        preferences = preferences.filter(p => p.screenKey === screenKey);
      }
      
      if (preferences.length === 0) {
        const defaultPref: ColumnPreferenceModel = {
          id: `default-${screenKey}`,
          namePreference: 'Padrão',
          description: 'Configuração padrão do sistema',
          screenKey: screenKey,
          idUser: "",
          columns: defaultColumns,
          isFavorite: false,
          isPinned: false,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        };
        preferences = [defaultPref];
      }
      
      return preferences;
    } catch (error) {
      return [];
    }
  }

  /**
   * Carrega preferências de colunas da API para uma tela específica
   * @param screenKey Chave da tela
   * @param defaultColumns Colunas padrão para fallback
   * @returns Observable com array de preferências
   */
  public loadPreferencesFromApi(screenKey: string, defaultColumns: ColumnConfig[]): Observable<ColumnPreferenceModel[]> {
    return this.genericService.getAll('columnPreferenceRoutes', ['user-screen', screenKey])
      .pipe(
        map((result: Result<ColumnPreferenceModel[]>) => {
          if (result.isSuccess && result.data && result.data.length > 0) {
            return result.data;
          } else {
            const defaultPref: ColumnPreferenceModel = {
              id: `default-${screenKey}`,
              namePreference: 'Padrão',
              description: 'Configuração padrão do sistema',
              screenKey: screenKey,
              idUser: "",
              columns: this.getDefaultColumns(defaultColumns),
              isFavorite: false,
              isPinned: false,
              isDefault: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system'
            };
            return [defaultPref];
          }
        }),
        catchError((error) => {
          const defaultPref: ColumnPreferenceModel = {
            id: `default-${screenKey}`,
            namePreference: 'Padrão',
            description: 'Configuração padrão do sistema',
            screenKey: screenKey,
            idUser: "",
            columns: this.getDefaultColumns(defaultColumns),
            isFavorite: false,
            isPinned: false,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system'
          };
          return of([defaultPref]);
        })
      );
  }
}
