import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../../../shared/services/theme/theme.service';

interface FileNode extends TreeNode {
  selected?: boolean;
  creationDate?: Date;
  description?: string;
  status?: string;
  uploadDate?: Date;
  filename?: string;
}

interface AdvancedFilter {
  id: number;
  field: string;
  operator: string;
  value: any;
  enabled: boolean;
}

interface AvailableField {
  key: string;
  label: string;
  type: string;
  operators: Array<{label: string, value: string}>;
  options?: Array<{label: string, value: string}>;
}

@Component({
  selector: 'app-teste-pw',
  templateUrl: './teste-pw.component.html',
  styleUrl: './teste-pw.component.scss'
})
export class TestePwComponent implements OnInit {
  files: FileNode[] = [];
  selectedFiles: FileNode[] = [];
  selectAll: boolean = false;
  breadcrumbItems: MenuItem[] = [];
  currentTheme: string = 'light';
  
  // Filtros para cada coluna
  filters = {
    tipoArquivo: '',
    nome: '',
    criacao: '',
    descricao: '',
    estado: '',
    upload: '',
    nomeArquivo: ''
  };

  // Dados filtrados
  filteredFiles: FileNode[] = [];

  // Busca geral
  generalSearch: string = '';

  // Controle de visibilidade dos filtros de coluna
  visibleColumnFilters: { [key: string]: boolean } = {
    tipoArquivo: false,
    nome: false,
    criacao: false,
    descricao: false,
    estado: false,
    upload: false,
    nomeArquivo: false
  };

  // Modal de filtros avançados
  showAdvancedFiltersModal: boolean = false;

  // Filtros avançados
  advancedFilters: {
    filters: AdvancedFilter[];
    logic: string;
    caseSensitive: boolean;
  } = {
    filters: [],
    logic: 'AND',
    caseSensitive: false
  };

  // Campos disponíveis para filtros
  availableFields: AvailableField[] = [
    { 
      key: 'nomeArquivo', 
      label: 'Nome do Arquivo', 
      type: 'text',
      operators: [
        { label: 'Contém', value: 'contains' },
        { label: 'Não Contém', value: 'not_contains' },
        { label: 'Igual a', value: 'equals' },
        { label: 'Diferente de', value: 'not_equals' },
        { label: 'Começa com', value: 'starts_with' },
        { label: 'Termina com', value: 'ends_with' }
      ]
    },
    { 
      key: 'descricao', 
      label: 'Descrição', 
      type: 'text',
      operators: [
        { label: 'Contém', value: 'contains' },
        { label: 'Não Contém', value: 'not_contains' },
        { label: 'Igual a', value: 'equals' },
        { label: 'Diferente de', value: 'not_equals' }
      ]
    },
    { 
      key: 'criacao', 
      label: 'Data de Criação', 
      type: 'date',
      operators: [
        { label: 'Igual a', value: 'equals' },
        { label: 'Diferente de', value: 'not_equals' },
        { label: 'Antes de', value: 'before' },
        { label: 'Depois de', value: 'after' },
        { label: 'Entre', value: 'between' }
      ]
    },
    { 
      key: 'estado', 
      label: 'Estado', 
      type: 'selection',
      operators: [
        { label: 'Igual a', value: 'equals' },
        { label: 'Diferente de', value: 'not_equals' }
      ],
      options: [
        { label: 'Ativo', value: 'ativo' },
        { label: 'Inativo', value: 'inativo' },
        { label: 'Pendente', value: 'pendente' },
        { label: 'Arquivado', value: 'arquivado' }
      ]
    }
  ];

  // Operadores de lógica
  logicOptions = [
    { label: 'E (AND)', value: 'AND' },
    { label: 'OU (OR)', value: 'OR' }
  ];

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Inicializar selectedFiles como array vazio
    this.selectedFiles = [];
    
    this.files = [
      {
        label: 'Documentos',
        data: 'Documentos Folder',
        icon: 'pi pi-folder',
        children: [
          {
            label: 'Relatórios',
            data: 'Relatórios Folder',
            icon: 'pi pi-folder',
            children: [
              {
                label: 'Canteiro',
                data: 'Canteiro Folder',
                icon: 'pi pi-folder',
                children: [
                  {
                    label: 'Arquivo Morto',
                    data: 'Arquivo Morto Folder',
                    icon: 'pi pi-folder',
                    children: [
                      {
                        label: 'Documentos AF...',
                        data: 'Documentos AF... Folder',
                        icon: 'pi pi-folder',
                        children: [
                          {
                            label: '00 - Geral e Pr...',
                            data: '00 - Geral e Pr... Folder',
                            icon: 'pi pi-folder',
                            children: [
                              {
                                label: '0000-01-0001_r9.pdf',
                                data: '0000-01-0001_r9.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T08:10:00'),
                                description: '0000-01-0001_r9.pdf',
                                status: 'Revisado em outro Projeto',
                                uploadDate: new Date('2012-04-19T08:10:00'),
                                filename: '0000-01-0001_r9.pdf'
                              } as FileNode,
                              {
                                label: '0000-02-0002_r21.pdf',
                                data: '0000-02-0002_r21.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T08:34:00'),
                                description: '0000-02-0002_r21.pdf',
                                status: 'Superado',
                                uploadDate: new Date('2021-12-08T09:58:00'),
                                filename: '0000-02-0002_r21.pdf'
                              } as FileNode,
                              {
                                label: '0000-03-0003_r15.pdf',
                                data: '0000-03-0003_r15.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T09:15:00'),
                                description: '0000-03-0003_r15.pdf',
                                status: 'Emitido e Publicado',
                                uploadDate: new Date('2012-04-19T09:15:00'),
                                filename: '0000-03-0003_r15.pdf'
                              } as FileNode,
                              {
                                label: '0000-04-0004_r8.pdf',
                                data: '0000-04-0004_r8.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T10:22:00'),
                                description: '0000-04-0004_r8.pdf',
                                status: 'Em Revisão',
                                uploadDate: new Date('2012-04-19T10:22:00'),
                                filename: '0000-04-0004_r8.pdf'
                              } as FileNode,
                              {
                                label: '0000-05-0005_r12.pdf',
                                data: '0000-05-0005_r12.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T11:45:00'),
                                description: '0000-05-0005_r12.pdf',
                                status: 'Aprovado',
                                uploadDate: new Date('2012-04-19T11:45:00'),
                                filename: '0000-05-0005_r12.pdf'
                              } as FileNode,
                              {
                                label: '0000-06-0006_r7.pdf',
                                data: '0000-06-0006_r7.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T13:20:00'),
                                description: '0000-06-0006_r7.pdf',
                                status: 'Pendente',
                                uploadDate: new Date('2012-04-19T13:20:00'),
                                filename: '0000-06-0006_r7.pdf'
                              } as FileNode,
                              {
                                label: '0000-07-0007_r18.pdf',
                                data: '0000-07-0007_r18.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T14:30:00'),
                                description: '0000-07-0007_r18.pdf',
                                status: 'Revisado em outro Projeto',
                                uploadDate: new Date('2012-04-19T14:30:00'),
                                filename: '0000-07-0007_r18.pdf'
                              } as FileNode,
                              {
                                label: '0000-08-0008_r11.pdf',
                                data: '0000-08-0008_r11.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T15:45:00'),
                                description: '0000-08-0008_r11.pdf',
                                status: 'Emitido e Publicado',
                                uploadDate: new Date('2012-04-19T15:45:00'),
                                filename: '0000-08-0008_r11.pdf'
                              } as FileNode,
                              {
                                label: '0000-09-0009_r6.pdf',
                                data: '0000-09-0009_r6.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T16:15:00'),
                                description: '0000-09-0009_r6.pdf',
                                status: 'Superado',
                                uploadDate: new Date('2012-04-19T16:15:00'),
                                filename: '0000-09-0009_r6.pdf'
                              } as FileNode,
                              {
                                label: '0000-10-0010_r14.pdf',
                                data: '0000-10-0010_r14.pdf',
                                icon: 'pi pi-file-pdf',
                                selected: false,
                                creationDate: new Date('2012-04-19T17:00:00'),
                                description: '0000-10-0010_r14.pdf',
                                status: 'Em Revisão',
                                uploadDate: new Date('2012-04-19T17:00:00'),
                                filename: '0000-10-0010_r14.pdf'
                              } as FileNode
                            ]
                          } as FileNode,
                          {
                            label: '10 - Civil',
                            data: '10 - Civil Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '20 - Mecanica...',
                            data: '20 - Mecanica... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '30 - Mecanica...',
                            data: '30 - Mecanica... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '40 - Mecanica...',
                            data: '40 - Mecanica... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '50 - Mecanica...',
                            data: '50 - Mecanica... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '60 - Sistema d...',
                            data: '60 - Sistema d... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '70 - Eletricidade',
                            data: '70 - Eletricidade Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '80 - Telecomu...',
                            data: '80 - Telecomu... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: '90 - Diversos',
                            data: '90 - Diversos Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Gerenciais',
                            data: 'Gerenciais Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos For...',
                            data: 'Documentos For... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Cedoc Canteiro',
                            data: 'Cedoc Canteiro Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos AFB/...',
                            data: 'Documentos AFB/... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos Depa...',
                            data: 'Documentos Depa... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos Forn...',
                            data: 'Documentos Forn... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos Gere...',
                            data: 'Documentos Gere... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'NAPs',
                            data: 'NAPs Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'RMA',
                            data: 'RMA Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'RPO',
                            data: 'RPO Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode,
                          {
                            label: 'Documentos AFB/Pr...',
                            data: 'Documentos AFB/Pr... Folder',
                            icon: 'pi pi-folder',
                            children: []
                          } as FileNode
                        ]
                      } as FileNode
                    ]
                  } as FileNode
                ]
              } as FileNode
            ]
          } as FileNode
        ]
      }
    ] as FileNode[];
    
    // Inicializar dados filtrados
    this.filteredFiles = this.getFlattenedFiles();
    
    // Inicializar ícones das pastas
    this.initializeFolderIcons();
    
    // Selecionar automaticamente a pasta "00 - Geral e Pr..." para mostrar os arquivos
    const targetFolder = this.findFolderByName('00 - Geral e Pr...');
    if (targetFolder) {
      this.selectedFiles = [targetFolder];
      this.buildBreadcrumb(targetFolder);
    }
    
    console.log('Arquivos carregados:', this.files);
    console.log('selectedFiles inicializado:', this.selectedFiles);
    
    this.applyFilters();
    this.initializeTheme();
  }

  private initializeTheme() {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  onNodeSelect(event: any) {
    console.log('Nó selecionado:', event.node);
    console.log('Evento completo:', event);
    this.selectedFiles = [event.node as FileNode];
    this.buildBreadcrumb(event.node as FileNode);
    this.applyFilters(); // Aplicar filtros após seleção
    console.log('selectedFiles atualizado:', this.selectedFiles);
  }

  onNodeUnselect(event: any) {
    console.log('Nó desselecionado:', event.node);
    this.selectedFiles = [];
    this.breadcrumbItems = [];
    console.log('selectedFiles limpo:', this.selectedFiles);
  }

  onNodeExpand(event: any) {
    console.log('Nó expandido:', event.node);
    // Atualizar o estado do nó e o ícone
    if (event.node && event.node.children && event.node.children.length > 0) {
      event.node.expanded = true;
      event.node.icon = 'pi pi-folder-open';
    }
    // Forçar atualização da view para refletir mudança no ícone
    this.cdr.detectChanges();
  }

  onNodeCollapse(event: any) {
    console.log('Nó colapsado:', event.node);
    // Atualizar o estado do nó e o ícone
    if (event.node && event.node.children && event.node.children.length > 0) {
      event.node.expanded = false;
      event.node.icon = 'pi pi-folder';
    }
    // Forçar atualização da view para refletir mudança no ícone
    this.cdr.detectChanges();
  }

  private initializeFolderIcons(): void {
    // Inicializar todos os ícones das pastas como fechadas
    this.initializeFolderIconsRecursive(this.files);
  }

  private initializeFolderIconsRecursive(nodes: FileNode[]): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // É uma pasta
        node.icon = 'pi pi-folder';
        node.expanded = false;
        // Recursivamente processar filhos
        this.initializeFolderIconsRecursive(node.children as FileNode[]);
      }
    }
  }

  clearSelection() {
    console.log('Limpando seleção');
    this.selectedFiles = [];
    this.breadcrumbItems = [];
    console.log('selectedFiles após limpeza:', this.selectedFiles);
  }

  getItemIcon(node: FileNode, expanded?: boolean): string {
    // Para pastas, verificar se está expandida
    if (node.children && node.children.length > 0) {
      if (expanded !== undefined) {
        // Usar o valor do template se fornecido
        return expanded ? 'pi pi-folder-open' : 'pi pi-folder';
      } else {
        // Fallback para o valor da propriedade do nó
        return node.expanded ? 'pi pi-folder-open' : 'pi pi-folder';
      }
    }
    
    // Para arquivos, usar o ícone original
    if (node.icon) {
      return node.icon;
    }
    return 'pi pi-file';
  }

  getItemType(node: FileNode): string {
    if (node.children && node.children.length > 0) {
      return 'Pasta';
    }
    
    const label = node.label?.toLowerCase() || '';
    if (label.endsWith('.pdf')) return 'Documento PDF';
    if (label.endsWith('.docx') || label.endsWith('.doc')) return 'Documento Word';
    if (label.endsWith('.png') || label.endsWith('.jpg') || label.endsWith('.jpeg')) return 'Imagem';
    if (label.endsWith('.xlsx') || label.endsWith('.xls')) return 'Planilha Excel';
    
    return 'Arquivo';
  }

  getItemPath(node: FileNode): string {
    const path: string[] = [];
    let currentNode: FileNode | null = node;
    
    // Construir caminho do nó selecionado até a raiz
    while (currentNode) {
      path.unshift(currentNode.label || '');
      // Encontrar o nó pai
      currentNode = this.findParentNode(currentNode);
    }
    
    return path.join(' / ');
  }

  buildBreadcrumb(node: FileNode): void {
    this.breadcrumbItems = [];
    
    if (!node) {
      return;
    }

    // Construir caminho do nó selecionado até a raiz
    const path: FileNode[] = [];
    let currentNode: FileNode | null = node;
    
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = this.findParentNode(currentNode);
    }

    // Adicionar cada nível do caminho
    path.forEach((pathNode, index) => {
      this.breadcrumbItems.push({
        label: pathNode.label || '',
        icon: pathNode.icon || 'pi pi-file',
        command: () => this.selectNode(pathNode)
      });
    });
  }

  selectNode(node: FileNode): void {
    // Selecionar o nó clicado no breadcrumb
    this.selectedFiles = [node];
    console.log('Nó selecionado via breadcrumb:', node);
  }

  // Métodos para filtragem
  getFlattenedFiles(): FileNode[] {
    const flattened: FileNode[] = [];
    this.flattenFilesRecursive(this.files, flattened);
    return flattened;
  }

  private flattenFilesRecursive(nodes: FileNode[], result: FileNode[]): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        this.flattenFilesRecursive(node.children as FileNode[], result);
      } else {
        result.push(node);
      }
    }
  }

  applyFilters(): void {
    this.filteredFiles = this.getFlattenedFiles().filter(file => {
      // Aplicar filtros específicos
      const specificFilters = this.matchesFilter(file, this.filters.tipoArquivo, 'tipoArquivo') &&
                             this.matchesFilter(file, this.filters.nome, 'nome') &&
                             this.matchesFilter(file, this.filters.criacao, 'criacao') &&
                             this.matchesFilter(file, this.filters.descricao, 'descricao') &&
                             this.matchesFilter(file, this.filters.estado, 'estado') &&
                             this.matchesFilter(file, this.filters.upload, 'upload') &&
                             this.matchesFilter(file, this.filters.nomeArquivo, 'nomeArquivo');

      // Aplicar busca geral se houver
      const generalSearchMatch = this.generalSearch ? this.matchesGeneralSearch(file, this.generalSearch) : true;

      return specificFilters && generalSearchMatch;
    });
  }

  private matchesFilter(file: FileNode, filterValue: string, filterType: string): boolean {
    if (!filterValue || filterValue.trim() === '') {
      return true;
    }

    const value = filterValue.toLowerCase().trim();
    
    switch (filterType) {
      case 'tipoArquivo':
        return this.getItemType(file).toLowerCase().includes(value);
      case 'nome':
        return (file.label || '').toLowerCase().includes(value);
      case 'criacao':
        return this.getCreationDate(file).toLowerCase().includes(value);
      case 'descricao':
        return this.getDescription(file).toLowerCase().includes(value);
      case 'estado':
        return this.getStatus(file).toLowerCase().includes(value);
      case 'upload':
        return this.getUploadInfo(file).toLowerCase().includes(value);
      case 'nomeArquivo':
        return this.getFilename(file).toLowerCase().includes(value);
      default:
        return true;
    }
  }

  private matchesGeneralSearch(file: FileNode, searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    
    // Buscar em todos os campos relevantes
    const searchableFields = [
      file.label || '',                                    // Nome
      this.getItemType(file),                              // Tipo de arquivo
      this.getDescription(file),                           // Descrição
      this.getStatus(file),                                // Estado
      this.getFilename(file),                              // Nome do arquivo
      this.getCreationDate(file),                          // Data de criação
      this.getUploadInfo(file)                             // Data de upload
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(searchValue)
    );
  }

  clearFilters(): void {
    this.filters = {
      tipoArquivo: '',
      nome: '',
      criacao: '',
      descricao: '',
      estado: '',
      upload: '',
      nomeArquivo: ''
    };
    this.generalSearch = '';
    
    // Ocultar todos os filtros de coluna
    Object.keys(this.visibleColumnFilters).forEach(key => {
      this.visibleColumnFilters[key] = false;
    });
    
    this.applyFilters();
  }

  // Métodos para busca geral
  onGeneralSearchChange(): void {
    this.applyFilters();
  }

  clearGeneralSearch(): void {
    this.generalSearch = '';
    this.applyFilters();
  }

  // Métodos para controle de filtros de coluna
  toggleColumnFilter(columnKey: string): void {
    this.visibleColumnFilters[columnKey] = !this.visibleColumnFilters[columnKey];
    
    // Se o filtro foi fechado, limpar o valor
    if (!this.visibleColumnFilters[columnKey]) {
      this.filters[columnKey as keyof typeof this.filters] = '';
      this.applyFilters();
    }
  }

  isColumnFilterVisible(columnKey: string): boolean {
    return this.visibleColumnFilters[columnKey] || false;
  }

  getActiveColumnFiltersCount(): number {
    return Object.values(this.visibleColumnFilters).filter(visible => visible).length;
  }

  hasActiveFilters(): boolean {
    // Verificar se há filtros de coluna ativos
    const hasColumnFilters = Object.values(this.filters).some(filter => 
      filter && filter.toString().trim() !== ''
    );
    
    // Verificar se há busca geral ativa
    const hasGeneralSearch = this.generalSearch && this.generalSearch.trim() !== '';
    
    // Verificar se há filtros avançados ativos
    const hasAdvancedFilters = this.advancedFilters.filters.length > 0;
    
    return hasColumnFilters || hasGeneralSearch || hasAdvancedFilters;
  }

  // Métodos para filtros avançados
  showAdvancedFilters(): void {
    this.showAdvancedFiltersModal = true;
  }

  hideAdvancedFilters(): void {
    this.showAdvancedFiltersModal = false;
  }

  clearAdvancedFilters(): void {
    this.advancedFilters = {
      filters: [],
      logic: 'AND',
      caseSensitive: false
    };
  }

  // Métodos para filtros dinâmicos
  addFilter(): void {
    const newFilter = {
      id: Date.now(), // ID único para cada filtro
      field: '',
      operator: '',
      value: null,
      enabled: true
    };
    this.advancedFilters.filters.push(newFilter);
  }

  removeFilter(filterId: number): void {
    this.advancedFilters.filters = this.advancedFilters.filters.filter(f => f.id !== filterId);
  }

  getFieldOperators(fieldKey: string) {
    const field = this.availableFields.find(f => f.key === fieldKey);
    return field ? field.operators : [];
  }

  getFieldOptions(fieldKey: string) {
    const field = this.availableFields.find(f => f.key === fieldKey);
    return field && field.type === 'selection' ? field.options : [];
  }

  getFieldType(fieldKey: string): string {
    const field = this.availableFields.find(f => f.key === fieldKey);
    return field ? field.type : 'text';
  }

  trackByFilterId(index: number, filter: AdvancedFilter): number {
    return filter.id;
  }

  applyAdvancedFilters(): void {
    // Aplicar filtros avançados
    this.applyAdvancedFiltersLogic();
    
    // Fechar modal
    this.hideAdvancedFilters();
    
    // Aplicar filtros na tabela
    this.applyFilters();
  }

  private applyAdvancedFiltersLogic(): void {
    // Limpar filtros simples
    this.filters = {
      tipoArquivo: '',
      nome: '',
      criacao: '',
      descricao: '',
      estado: '',
      upload: '',
      nomeArquivo: ''
    };

    // Aplicar filtros dinâmicos ativos
    this.advancedFilters.filters
      .filter(f => f.enabled && f.field && f.operator)
      .forEach(filter => {
        const fieldKey = filter.field;
        const value = this.formatFilterValue(filter);
        
        // Mapear campos avançados para filtros simples
        switch (fieldKey) {
          case 'nomeArquivo':
            this.filters.nomeArquivo = value;
            break;
          case 'descricao':
            this.filters.descricao = value;
            break;
          case 'tipoArquivo':
            this.filters.tipoArquivo = value;
            break;
          case 'estado':
            this.filters.estado = value;
            break;
          case 'criacao':
            this.filters.criacao = value;
            break;
          case 'upload':
            this.filters.upload = value;
            break;
        }
      });
  }

  private formatFilterValue(filter: any): string {
    if (!filter.value) return '';
    
    if (filter.field === 'criacao' || filter.field === 'upload') {
      return this.formatDateForFilter(filter.value);
    }
    
    return String(filter.value);
  }

  private formatDateForFilter(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  }

  private findParentNode(childNode: FileNode): FileNode | null {
    for (const rootNode of this.files) {
      const parent = this.findParentNodeRecursive(rootNode, childNode);
      if (parent) return parent;
    }
    return null;
  }

  private findParentNodeRecursive(currentNode: FileNode, targetNode: FileNode): FileNode | null {
    if (currentNode.children) {
      for (const child of currentNode.children) {
        if (child === targetNode) {
          return currentNode;
        }
        const parent = this.findParentNodeRecursive(child as FileNode, targetNode);
        if (parent) return parent;
      }
    }
    return null;
  }

  expandAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, true);
    });
    // Forçar atualização da view
    this.cdr.detectChanges();
  }

  collapseAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, false);
    });
    // Forçar atualização da view
    this.cdr.detectChanges();
  }

  private expandRecursive(node: FileNode, isExpand: boolean) {
    node.expanded = isExpand;
    // Atualizar ícone se for uma pasta
    if (node.children && node.children.length > 0) {
      node.icon = isExpand ? 'pi pi-folder-open' : 'pi pi-folder';
    }
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode as FileNode, isExpand);
      });
    }
  }

  toggleSelectAll(event: any) {
    this.selectAll = event.checked;
    this.selectedFiles.forEach(file => {
      file.selected = this.selectAll;
    });
  }

  toggleFileSelection(file: FileNode, event: any) {
    file.selected = event.checked;
    
    // Verificar se todos os arquivos estão selecionados
    this.selectAll = this.selectedFiles.every(f => f.selected);
  }

  getCreationDate(file: FileNode): string {
    if (file.creationDate) {
      const date = file.creationDate;
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      const monthNames = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
      ];
      
      return `${day} de ${monthNames[month]} de ${year}, ${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return 'N/A';
  }

  getDescription(file: FileNode): string {
    if (file.label) {
      return file.label;
    }
    return 'Sem descrição';
  }

  getStatus(file: FileNode): string {
    if (file.status) {
      return file.status;
    }
    return 'Desconhecido';
  }

  getStatusSeverity(file: FileNode): 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'contrast' | 'help' | undefined {
    if (file.status) {
      switch (file.status.toLowerCase()) {
        case 'ativo':
        case 'aprovado':
        case 'emitido e publicado':
          return 'success';
        case 'em revisão':
        case 'pendente':
          return 'warning';
        case 'rejeitado':
        case 'inativo':
        case 'superado':
          return 'danger';
        case 'revisado em outro projeto':
          return 'info';
        default:
          return 'info';
      }
    }
    return 'info';
  }

  getUploadInfo(file: FileNode): string {
    if (file.uploadDate) {
      const date = file.uploadDate;
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      const monthNames = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
      ];
      
      return `${day} de ${monthNames[month]} de ${year}, ${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return 'N/A';
  }

  getFilename(file: FileNode): string {
    // Para arquivos na pasta "00 - Geral e Pr...", retornar "00"
    if (file.label && file.label.includes('0000-')) {
      return '00';
    }
    return 'N/A';
  }

  private findFolderByName(name: string): FileNode | null {
    return this.findFolderByNameRecursive(this.files, name);
  }

  private findFolderByNameRecursive(nodes: FileNode[], name: string): FileNode | null {
    for (const node of nodes) {
      if (node.label === name) {
        return node;
      }
      if (node.children) {
        const found = this.findFolderByNameRecursive(node.children, name);
        if (found) return found;
      }
    }
    return null;
  }
}
