import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ColumnPreferencesService } from '../../services/columns-preference/columnPreferences.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColumnConfig } from '../../models/column-config.model';
import { ColumnPreferenceRequest } from '../../models/columnPreferenceRequest.model';
import { ColumnPreferenceModel, ColumnPreferenceApiModel } from '../../models/columnPreference.model';
import { GenericService } from '../../services/generic/generic.service';
import { Result } from '../../models/api/result.model';
import { getUserIdFromStorage, getUserNameFromStorage, getTokenFromStorage } from '../../util/localStorageUtil';

/**
 * Componente para configuração de colunas de tabelas com suporte a preferências salvas.
 * Permite configurar visibilidade, ordem e salvar configurações personalizadas.
 * 
 * @example
 * ```html
 * <app-column-config
 *   [componentName]="'minha-tabela'"
 *   [columns]="colunas"
 *   [defaultColumns]="colunasPadrao"
 *   (preferencesSaved)="onPreferencesSaved()"
 *   (columnsChanged)="onColumnsChanged($event)"
 *   (closeModal)="onCloseModal()">
 * </app-column-config>
 * ```
 */
@Component({
  selector: 'app-column-config',
  templateUrl: './column-config.component.html',
  styleUrl: './column-config.component.scss'
})
export class ColumnConfigComponent implements OnInit, OnDestroy {

  /** Serviço para gerenciar preferências de colunas */
  private readonly columnPrefsService = inject(ColumnPreferencesService);
  
  /** Serviço de confirmação do PrimeNG */
  private readonly confirmationService = inject(ConfirmationService);
  
  /** Serviço de mensagens do PrimeNG */
  private readonly messageService = inject(MessageService);
  
  /** Serviço genérico para operações HTTP */
  private readonly genericService = inject(GenericService<any>);
  
  /** Referência para detecção de mudanças */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Nome do componente para identificar as preferências */
  @Input() componentName!: string;
  
  /** Evento emitido quando as preferências são salvas */
  @Output() preferencesSaved = new EventEmitter<void>();
  
  /** Evento emitido quando as colunas são alteradas */
  @Output() columnsChanged = new EventEmitter<ColumnConfig[]>();
  
  /** Evento emitido quando o modal é fechado */
  @Output() closeModal = new EventEmitter<void>();

  /** Colunas atuais do componente */
  private _columns: ColumnConfig[] = [];
  
  /** Colunas padrão do componente */
  private _defaultColumns: ColumnConfig[] = [];

  /**
   * Define as colunas do componente
   * @param value - Array de configurações de colunas
   */
  @Input() 
  set columns(value: ColumnConfig[]) {
    this._columns = value;
    if (value && value.length > 0) {
      this.originalColumns = JSON.parse(JSON.stringify(value));
    }
  }
  
  /**
   * Obtém as colunas do componente
   * @returns Array de configurações de colunas
   */
  get columns(): ColumnConfig[] {
    return this._columns;
  }

  /**
   * Define as colunas padrão do componente
   * @param value - Array de configurações de colunas padrão
   */
  @Input()
  set defaultColumns(value: ColumnConfig[]) {
    if (value && value.length > 0) {
      this._defaultColumns = JSON.parse(JSON.stringify(value));
    }
  }
  
  /**
   * Obtém as colunas padrão do componente
   * @returns Array de configurações de colunas padrão
   */
  get defaultColumns(): ColumnConfig[] {
    return this._defaultColumns;
  }

  /** Flag para exibir o modal de preferências */
  public showPreferencesModal = false;
  
  /** Flag para exibir o modal de salvar preferência */
  public showSavePreferenceModal = false;
  
  /** Flag para exibir o modal de duplicar preferência */
  public showDuplicateModal = false;
  
  /** Flag indicando se está ocorrendo drag and drop */
  public isDragging = false;
  
  /** Flag indicando se está salvando */
  public isSaving = false;
  
  /** Flag indicando se há mudanças não salvas */
  public hasUnsavedChanges = false;
  
  /** Nome da nova preferência a ser salva */
  public newPreferenceName = '';
  
  /** Descrição da nova preferência a ser salva */
  public newPreferenceDescription = '';
  
  /** Nome da preferência duplicada */
  public duplicatePreferenceName = '';
  
  /** Preferência selecionada para duplicação */
  public selectedPreferenceToDuplicate: ColumnPreferenceModel | null = null;
  
  /** Flag indicando se todas as colunas estão selecionadas */
  public selectAllChecked = false;
  
  /** Flag indicando estado intermediário do checkbox "selecionar todos" */
  public indeterminateSelectAll = false;
  
  /** Termo de busca para filtrar preferências */
  public searchTerm = '';
  
  /** Flag para mostrar apenas preferências favoritas */
  public showOnlyFavorites = false;
  
  /** Flag para mostrar apenas preferências fixadas */
  public showOnlyPinned = false;
  
  /** Lista de todas as preferências carregadas */
  public preferences: ColumnPreferenceModel[] = [];
  
  /** Preferência atualmente aplicada */
  public currentPreference: ColumnPreferenceModel | null = null;
  
  /** Lista de preferências marcadas como favoritas */
  public favoritePreferences: ColumnPreferenceModel[] = [];
  
  /** Lista de preferências fixadas */
  public pinnedPreferences: ColumnPreferenceModel[] = [];
  
  /** Preferência padrão do sistema */
  public defaultPreference: ColumnPreferenceModel | null = null;
  
  /** Subject para cancelar observables no destroy */
  private destroy$ = new Subject<void>();
  
  /** Cópia das colunas originais para restauração */
  private originalColumns: ColumnConfig[] = [];

  /**
   * Inicializa o componente, carregando preferências e configurações iniciais
   */
  ngOnInit(): void {
    if (this.columns && this.columns.length > 0) {
      this.originalColumns = JSON.parse(JSON.stringify(this.columns));
    }
    
    this.loadPreferencesFromApi();
    this.loadAutoSavedConfiguration();
    this.updateSelectAllState();
    
    if (this.columns && this.columns.length > 0) {
      this.columnsChanged.emit([...this.columns]);
    }
  }

  /**
   * Limpa recursos e cancela observables ao destruir o componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega configurações salvas automaticamente do localStorage
   * e aplica às colunas atuais
   */
  private loadAutoSavedConfiguration(): void {
    if (!this.columns || this.columns.length === 0) return;

    const savedPreferences = this.columnPrefsService.loadPreferences(this.componentName, this.columns);
    if (savedPreferences && savedPreferences.length > 0) {
      this.columns = savedPreferences.map((col, index) => ({
        ...col,
        order: index
      }));
      
      this.updateSelectAllState();
      this.updateLocalPreferenceLists();
      
      this.columnsChanged.emit([...this.columns]);
    }
  }

  /**
   * Atualiza o estado do checkbox "selecionar todos" baseado
   * na visibilidade das colunas atuais
   */
  private updateSelectAllState(): void {
    if (!this.columns || this.columns.length === 0) {
      this.selectAllChecked = false;
      this.indeterminateSelectAll = false;
      return;
    }
    
    const visibleColumns = this.columns.filter(col => col.visible === true);
    this.selectAllChecked = visibleColumns.length === this.columns.length;
    this.indeterminateSelectAll = visibleColumns.length > 0 && visibleColumns.length < this.columns.length;
    
    this.updateLocalPreferenceLists();
  }

  /**
   * Seleciona todas as colunas
   */
  selectAllColumns(): void {
    if (!this.columns || this.columns.length === 0) return;
    
    this.columns = this.columnPrefsService.selectAllColumns(this.columns);
    
    this.updateSelectAllState();
    this.autoSaveColumns();
    
    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
  }

  /**
   * Desmarca todas as colunas
   */
  deselectAllColumns(): void {
    if (!this.columns || this.columns.length === 0) return;
    
    this.columns = this.columnPrefsService.deselectAllColumns(this.columns);
    
    this.updateSelectAllState();
    this.autoSaveColumns();
    
    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
  }

  /**
   * Restaura a configuração padrão das colunas
   * Exibe confirmação antes de restaurar
   */
  restoreDefault(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja restaurar a configuração padrão? Todas as alterações serão perdidas.',
      header: 'Restaurar Padrão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this._defaultColumns && this._defaultColumns.length > 0) {
          this.columns = this._defaultColumns.map((col, index) => ({
            ...col,
            order: index
          }));
        } else if (this.originalColumns && this.originalColumns.length > 0) {
          this.columns = this.originalColumns.map((col, index) => ({
            ...col,
            order: index
          }));
        } else {
          this.columns = this.columnPrefsService.restoreDefault();
        }
        
        this.updateSelectAllState();
        this.autoSaveColumns();
        
        this.preferencesSaved.emit();
        this.columnsChanged.emit([...this.columns]);
        
        this.updateLocalPreferenceLists();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Configuração Restaurada',
          detail: 'A configuração padrão foi restaurada com sucesso.'
        });
      }
    });
  }

  /**
   * Alterna o status de favorito de uma preferência
   * @param preference - Preferência a ter o status alterado
   */
  toggleFavorite(preference: ColumnPreferenceModel): void {
    if (!preference) return;
    
    this.isSaving = true;
    
    const newStatus = !preference.isFavorite;
    preference.isFavorite = newStatus;
    
    const index = this.preferences.findIndex(p => p.id === preference.id);
    if (index !== -1) {
      this.preferences[index] = { ...preference };
    }
    this.updateLocalPreferenceLists();
    
    this.genericService.patch('columnPreferenceRoutes', `${preference.id}/toggle-favorite`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Result<boolean>) => {
          if (result.isSuccess && result.data) {
            this.messageService.add({
              severity: 'success',
              summary: 'Favorito Atualizado',
              detail: `A preferência "${preference.namePreference}" foi ${newStatus ? 'adicionada aos' : 'removida dos'} favoritos.`
            });
          } else {
            preference.isFavorite = !newStatus;
            this.updateLocalPreferenceLists();
            
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: result.error?.message || 'Erro ao atualizar o status de favorito.'
            });
          }
        },
        error: (error: any) => {
          preference.isFavorite = !newStatus;
          this.updateLocalPreferenceLists();
          
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar o status de favorito. Tente novamente. ' + error
          });
        },
        complete: () => {
          this.isSaving = false;
        }
      });
  }

  /**
   * Alterna o status de fixado de uma preferência
   * @param preference - Preferência a ter o status alterado
   */
  togglePinned(preference: ColumnPreferenceModel): void {
    if (!preference) return;
    
    this.isSaving = true;
    
    const newStatus = !preference.isPinned;
    preference.isPinned = newStatus;
    
    const index = this.preferences.findIndex(p => p.id === preference.id);
    if (index !== -1) {
      this.preferences[index] = { ...preference };
    }
    this.updateLocalPreferenceLists();
    
    this.genericService.patch('columnPreferenceRoutes', `${preference.id}/toggle-pinned`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Result<boolean>) => {
          if (result.isSuccess && result.data) {
            this.messageService.add({
              severity: 'success',
              summary: 'Fixação Atualizada',
              detail: `A preferência "${preference.namePreference}" foi ${newStatus ? 'fixada' : 'desfixada'}.`
            });
          } else {
            preference.isPinned = !newStatus;
            this.updateLocalPreferenceLists();
            
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: result.error?.message || 'Erro ao atualizar o status de fixação.'
            });
          }
        },
        error: (error: any) => {
          preference.isPinned = !newStatus;
          this.updateLocalPreferenceLists();
          
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar o status de fixação. Tente novamente. ' + error
          });
        },
        complete: () => {
          this.isSaving = false;
        }
      });
  }

  /**
   * Define uma preferência como padrão do sistema
   * @param preference - Preferência a ser definida como padrão
   */
  setAsDefault(preference: ColumnPreferenceModel): void {
    if (!preference) return;
    
    this.confirmationService.confirm({
      message: `Tem certeza que deseja definir "${preference.namePreference}" como preferência padrão?`,
      header: 'Definir como Padrão',
      icon: 'pi pi-star',
      accept: () => {
        this.isSaving = true;
        
        const url = `${preference.id}/set-default?screenKey=${encodeURIComponent(this.componentName || '')}`;
        
        this.genericService.patch('columnPreferenceRoutes', url, {})
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result: Result<boolean>) => {
              if (result.isSuccess && result.data) {
                this.loadPreferencesFromApi();
                
                this.messageService.add({
                  severity: 'success',
                  summary: 'Preferência Padrão',
                  detail: `A preferência "${preference.namePreference}" foi definida como padrão com sucesso.`
                });
                
                this.closePreferencesModal();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: result.error?.message || 'Erro ao definir a preferência como padrão.'
                });
              }
            },
            error: (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao definir a preferência como padrão. Tente novamente. ' + error
              });
            },
            complete: () => {
              this.isSaving = false;
            }
          });
      }
    });
  }

  /**
   * Atualiza as listas locais de preferências após mudanças
   */
  private updateLocalPreferenceLists(): void {
    if (this.preferences && this.preferences.length > 0) {
      this.favoritePreferences = this.preferences.filter(p => p.isFavorite);
      this.pinnedPreferences = this.preferences.filter(p => p.isPinned);
      this.defaultPreference = this.preferences.find(p => p.isDefault) ?? null;
    } else {
      this.favoritePreferences = [];
      this.pinnedPreferences = [];
      this.defaultPreference = null;
    }
  }

  /**
   * Aplica uma preferência específica às colunas atuais
   * @param preference - Preferência a ser aplicada
   */
  applyPreference(preference: ColumnPreferenceModel): void {
    if (!preference) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'A preferência selecionada não é válida.'
      });
      return;
    }

    try {
      let columns: ColumnConfig[] = [];
      
      if (typeof preference.columns === 'string') {
        try {
          columns = JSON.parse(preference.columns);
        } catch (parseError) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao processar as configurações da preferência.'
          });
          return;
        }
      } else if (Array.isArray(preference.columns)) {
        columns = preference.columns;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'A preferência selecionada não possui configurações de colunas válidas.'
        });
        return;
      }

      if (!columns || columns.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'A preferência selecionada não possui colunas configuradas.'
        });
        return;
      }

      this.columns = columns.map((col, index) => ({
        ...col,
        order: index
      }));
      
      this.currentPreference = preference;
      this.updateSelectAllState();
      this.cdr.detectChanges();

      setTimeout(() => {
        this.autoSaveColumns();
        
        this.preferencesSaved.emit();
        this.columnsChanged.emit([...this.columns]);
        
        this.updateLocalPreferenceLists();
        
        this.cdr.detectChanges();
      }, 0);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Preferência Aplicada',
        detail: `A preferência "${preference.namePreference}" foi aplicada com sucesso.`
      });

    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível aplicar a preferência. Tente novamente.'
      });
    }
  }

  /**
   * Salva a configuração atual como uma nova preferência
   * Valida nome e descrição antes de salvar
   */
  saveAsPreference(): void {
    if (!this.newPreferenceName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, informe um nome para a preferência.'
      });
      return;
    }

    const existingPreference = this.preferences.find(preferences => 
      preferences.namePreference.toLowerCase() === this.newPreferenceName.trim().toLowerCase()
    );

    if (existingPreference) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Preferência Existente',
        detail: 'Já existe uma preferência com este nome. Por favor, escolha outro nome.'
      });
      return;
    }

    if (!this.columns || this.columns.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não há colunas para salvar na preferência.'
      });
      return;
    }

    const request: ColumnPreferenceRequest = {
      name: this.newPreferenceName.trim(),
      description: this.newPreferenceDescription.trim(),
      columns: [...this.columns],
      isFavorite: false,
      isPinned: false
    };

    this.savePreference(request);
  }

  /**
   * Duplica uma preferência existente com novo nome
   * Cria cópia exata da preferência selecionada
   */
  duplicatePreference(): void {
    if (!this.selectedPreferenceToDuplicate || !this.duplicatePreferenceName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, selecione uma preferência e informe um nome para a cópia.'
      });
      return;
    }

    const existingPreference = this.preferences.find(p => 
      p.namePreference.toLowerCase() === this.duplicatePreferenceName.trim().toLowerCase()
    );

    if (existingPreference) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome Duplicado',
        detail: 'Já existe uma preferência com este nome. Por favor, escolha outro nome.'
      });
      return;
    }

    this.isSaving = true;

    let columnsToSave: ColumnConfig[] = [];
    if (typeof this.selectedPreferenceToDuplicate.columns === 'string') {
      try {
        columnsToSave = JSON.parse(this.selectedPreferenceToDuplicate.columns);
      } catch (parseError) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao processar as colunas da preferência a ser duplicada.'
        });
        this.isSaving = false;
        return;
      }
    } else if (Array.isArray(this.selectedPreferenceToDuplicate.columns)) {
      columnsToSave = this.selectedPreferenceToDuplicate.columns;
    }

    const duplicatedPreference: ColumnPreferenceApiModel = {
      namePreference: this.duplicatePreferenceName.trim(),
      description: `Cópia de ${this.selectedPreferenceToDuplicate.namePreference}`,
      screenKey: this.componentName,
      idUser: getUserIdFromStorage(),
      columns: JSON.stringify(columnsToSave.map((col, index) => ({ ...col, order: index }))),
      isFavorite: false,
      isPinned: false,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getUserNameFromStorage()
    };


    this.genericService.post('columnPreferenceRoutes', duplicatedPreference)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Result<ColumnPreferenceModel>) => {
          if (result.isSuccess && result.data) {
            const newPreference = result.data;
            this.preferences = [...this.preferences, newPreference];
            this.updateLocalPreferenceLists();
            
            this.messageService.add({
              severity: 'success',
              summary: 'Preferência Duplicada',
              detail: `A preferência "${newPreference.namePreference}" foi criada com sucesso.`
            });
            
            this.duplicatePreferenceName = '';
            this.selectedPreferenceToDuplicate = null;
            
            this.closeDuplicateModal();
            
            if (this.showPreferencesModal) {
              this.closePreferencesModal();
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: result.error?.message || 'Erro ao duplicar preferência.'
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao duplicar preferência. Tente novamente. ' + error
          });
        },
        complete: () => {
          this.isSaving = false;
        }
      });
  }

  /**
   * Remove uma preferência (exceto a padrão)
   * @param preference - Preferência a ser removida
   */
  deletePreference(preference: ColumnPreferenceModel): void {
    if (!preference) return;

    if (preference.isDefault) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Não Permitido',
        detail: 'Não é possível remover a preferência padrão do sistema.'
      });
      return;
    }
  
    this.deletePreferenceFromApi(preference.id);
  }

  /**
   * Manipula mudanças nas colunas
   * Atualiza estado e salva automaticamente
   */
  onColumnChange(): void {
    if (!this.columns || this.columns.length === 0) return;
    
    this.updateSelectAllState();
    this.hasUnsavedChanges = true;
    
    this.autoSaveColumns();
    
    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
  }

  /**
   * Manipula o drop do drag and drop
   * Reordena colunas e salva automaticamente
   * @param event - Evento de drop do CDK
   */
  onDrop(event: CdkDragDrop<ColumnConfig[]>): void {
    if (!this.columns || this.columns.length === 0) return;
    
    if (event.previousIndex === event.currentIndex) return;
    
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    
    this.columns = this.columns.map((col, index) => ({ ...col, order: index }));

    this.autoSaveColumns();
    
    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
    
    this.updateLocalPreferenceLists();
    
    this.messageService.add({
      severity: 'info',
      summary: 'Colunas Reordenadas',
      detail: 'A ordem das colunas foi atualizada com sucesso.'
    });
  }

  /**
   * Inicia o processo de arraste
   */
  onDragStart(): void {
    this.isDragging = true;
  }

  /**
   * Finaliza o processo de arraste
   */
  onDragEnd(): void {
    this.isDragging = false;
  }

  /**
   * Abre o modal de preferências
   */
  openPreferencesModal(): void {
    this.showPreferencesModal = true;
    this.updateLocalPreferenceLists();
  }

  /**
   * Fecha o modal de preferências
   */
  closePreferencesModal(): void {
    this.showPreferencesModal = false;
    this.clearFilters();
  }

  /**
   * Abre o modal para salvar nova preferência
   */
  openSavePreferenceModal(): void {
    this.newPreferenceName = '';
    this.newPreferenceDescription = '';
    this.showSavePreferenceModal = true;
  }

  /**
   * Fecha o modal de salvar preferência
   */
  closeSavePreferenceModal(): void {
    this.showSavePreferenceModal = false;
    this.newPreferenceName = '';
    this.newPreferenceDescription = '';
    this.hasUnsavedChanges = false;
  }

  /**
   * Abre o modal para duplicar preferência
   * @param preference - Preferência a ser duplicada
   */
  openDuplicateModal(preference: ColumnPreferenceModel): void {
    if (!preference) return;
    
    this.selectedPreferenceToDuplicate = preference;
    this.duplicatePreferenceName = `${preference.namePreference} (Cópia)`;
    this.showDuplicateModal = true;
  }

  /**
   * Fecha o modal de duplicar preferência
   */
  closeDuplicateModal(): void {
    this.showDuplicateModal = false;
    this.selectedPreferenceToDuplicate = null;
    this.duplicatePreferenceName = '';
  }

  /**
   * Obtém o ícone apropriado para o tipo de preferência
   * @param preference - Preferência para obter o ícone
   * @returns Nome da classe do ícone PrimeNG
   */
  getPreferenceIcon(preference: ColumnPreferenceModel): string {
    if (!preference) return 'pi pi-cog';
    
    if (preference.isDefault) return 'pi pi-star-fill';
    if (preference.isPinned) return 'pi pi-thumbtack';
    if (preference.isFavorite) return 'pi pi-heart-fill';
    return 'pi pi-cog';
  }

  /**
   * Obtém a cor apropriada para o tipo de preferência
   * @param preference - Preferência para obter a cor
   * @returns Variável CSS de cor
   */
  getPreferenceColor(preference: ColumnPreferenceModel): string {
    if (!preference) return 'var(--text-color-secondary)';
    
    if (preference.isDefault) return 'var(--primary-color)';
    if (preference.isPinned) return 'var(--orange-500)';
    if (preference.isFavorite) return 'var(--pink-500)';
    return 'var(--text-color-secondary)';
  }

  /**
   * Obtém o número de colunas visíveis
   * @returns Quantidade de colunas com visible = true
   */
  getVisibleColumnsCount(): number {
    if (!this.columns || this.columns.length === 0) return 0;
    return this.columns.filter(col => col.visible === true).length;
  }

  /**
   * Obtém as preferências filtradas baseadas nos filtros ativos
   * @returns Lista filtrada de preferências
   */
  get filteredPreferences(): ColumnPreferenceModel[] {
    if (!this.preferences || this.preferences.length === 0) return [];
    
    let filtered = [...this.preferences];

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pref => 
        pref.namePreference.toLowerCase().includes(searchLower) ||
        (pref.description && pref.description.toLowerCase().includes(searchLower))
      );
    }

    if (this.showOnlyFavorites) {
      filtered = filtered.filter(pref => pref.isFavorite);
    }

    if (this.showOnlyPinned) {
      filtered = filtered.filter(pref => pref.isPinned);
    }

    return filtered;
  }

  /**
   * Alterna o filtro para mostrar apenas preferências favoritas
   */
  toggleShowOnlyFavorites(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    if (this.showOnlyFavorites) {
      this.showOnlyPinned = false;
    }
  }

  /**
   * Alterna o filtro para mostrar apenas preferências fixadas
   */
  toggleShowOnlyPinned(): void {
    this.showOnlyPinned = !this.showOnlyPinned;
    if (this.showOnlyPinned) {
      this.showOnlyFavorites = false;
    }
  }

  /**
   * Limpa todos os filtros ativos
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.showOnlyFavorites = false;
    this.showOnlyPinned = false;
  }

  /**
   * Aplica e salva as configurações atuais
   * Fecha o modal após salvar
   */
  applyAndSave(): void {
    if (!this.columns || this.columns.length === 0) return;
    
    this.autoSaveColumns();

    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
  
    this.closeModal.emit();
    this.updateLocalPreferenceLists();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Configuração Aplicada',
      detail: 'As configurações das colunas foram aplicadas e salvas com sucesso.'
    });
  }

  /**
   * Salva automaticamente as configurações de colunas no localStorage
   * com delay para evitar múltiplas chamadas
   */
  private autoSaveColumns(): void {
    if (!this.columns || this.columns.length === 0) return;
    
    this.isSaving = true;
    
    setTimeout(() => {
      this.columnPrefsService.autoSaveColumns(this.columns, this.componentName);
      
      this.isSaving = false;
      this.hasUnsavedChanges = false;
      this.updateLocalPreferenceLists();

    }, 300);
  }

  /**
   * Carrega todas as preferências da API
   * Aplica preferência padrão se disponível
   */
  loadPreferencesFromApi(): void {
    this.isSaving = true;

    this.genericService.getAll('columnPreferenceRoutes', ['user-screen', this.componentName])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Result<ColumnPreferenceModel[]>) => {
          if (result.isSuccess && result.data && result.data.length > 0) {
            this.preferences = result.data;
            this.updateLocalPreferenceLists();

            const defaultPref = this.preferences.find(p => p.isDefault);
            if (defaultPref) {
              this.currentPreference = defaultPref;
              this.applyPreferenceQuietly(defaultPref);
            } else {
              this.useDefaultColumns();
            }
          } else {
            this.useDefaultColumns();
          }
        },
        error: (error) => {
          this.useDefaultColumns();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar preferências: ' + error
          });
        },
        complete: () => {
          this.isSaving = false;
        }
      });
  }

  /**
   * Salva uma nova preferência na API
   * @param request - Dados da preferência a ser salva
   */
  savePreference(request: ColumnPreferenceRequest): void {
    if (!request.name.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, informe um nome para a preferência.'
      });
      return;
    }

    this.isSaving = true;

    const preferenceToSave: ColumnPreferenceApiModel = {
      namePreference: request.name,
      description: request.description,
      screenKey: this.componentName,
      idUser: getUserIdFromStorage(),
      columns: JSON.stringify(request.columns.map((col, index) => ({ ...col, order: index }))),
      isFavorite: request.isFavorite,
      isPinned: request.isPinned,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getUserNameFromStorage()
    };

    this.genericService.post('columnPreferenceRoutes', preferenceToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Result<ColumnPreferenceModel>) => {
          if (result.isSuccess && result.data) {
            const newPreference = result.data;
            this.preferences = [...this.preferences, newPreference];
            this.updateLocalPreferenceLists();
            
            this.messageService.add({
              severity: 'success',
              summary: 'Preferência Salva',
              detail: `A preferência "${newPreference.namePreference}" foi salva com sucesso.`
            });

            this.newPreferenceName = '';
            this.newPreferenceDescription = '';
            this.closeSavePreferenceModal();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: result.error?.message || 'Erro ao salvar preferência.'
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao salvar preferência. Tente novamente. ' + error
          });
        },
        complete: () => {
          this.isSaving = false;
        }
      });
  }

  /**
   * Remove uma preferência da API
   * @param id - ID da preferência a ser removida
   */
  deletePreferenceFromApi(id: string): void {
    if (!id) return;

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover esta preferência? Esta ação não pode ser desfeita.',
      header: 'Remover Preferência',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isSaving = true;

        this.genericService.delete('columnPreferenceRoutes', id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result: Result<ColumnPreferenceModel>) => {
              if (result.isSuccess) {
                this.preferences = this.preferences.filter(p => p.id !== id);
                this.updateLocalPreferenceLists();
                
                if (this.currentPreference?.id === id) {
                  const defaultPref = this.preferences.find(p => p.isDefault);
                  this.currentPreference = defaultPref || null;
                }
                
                this.messageService.add({
                  severity: 'success',
                  summary: 'Preferência Removida',
                  detail: 'A preferência foi removida com sucesso.'
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: result.error?.message || 'Erro ao remover preferência.'
                });
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao remover preferência. Tente novamente. ' + error
              });
            },
            complete: () => {
              this.isSaving = false;
            }
          });
      }
    });
  }

  /**
   * Aplica uma preferência às colunas sem mostrar mensagem de sucesso
   * Usado para carregamento inicial silencioso
   * @param preference - Preferência a ser aplicada
   */
  private applyPreferenceQuietly(preference: ColumnPreferenceModel): void {
    if (!preference) {
      this.useDefaultColumns();
      return;
    }

    try {
      let columns: ColumnConfig[] = [];
      
      if (typeof preference.columns === 'string') {
        try {
          columns = JSON.parse(preference.columns);
        } catch (parseError) {
          this.useDefaultColumns();
          return;
        }
      } else if (Array.isArray(preference.columns)) {
        columns = preference.columns;
      } else {
        this.useDefaultColumns();
        return;
      }

      if (!columns || columns.length === 0) {
        this.useDefaultColumns();
        return;
      }

      this.columns = columns.map((col, index) => ({
        ...col,
        order: index
      }));
      
      this.currentPreference = preference;
      
      this.updateSelectAllState();
      this.preferencesSaved.emit();
      this.columnsChanged.emit([...this.columns]);
      this.updateLocalPreferenceLists();

    } catch (error) {
      this.useDefaultColumns();
    }
  }

  /**
   * Usa as colunas padrão do componente
   * Fallback quando não há preferências disponíveis
   */
  private useDefaultColumns(): void {
    if (this._defaultColumns && this._defaultColumns.length > 0) {
      this.columns = this._defaultColumns.map((col, index) => ({
        ...col,
        order: index
      }));
    } else if (this.originalColumns && this.originalColumns.length > 0) {
      this.columns = this.originalColumns.map((col, index) => ({
        ...col,
        order: index
      }));
    }
    
    this.updateSelectAllState();
    this.preferencesSaved.emit();
    this.columnsChanged.emit([...this.columns]);
    this.updateLocalPreferenceLists();
  }
}
