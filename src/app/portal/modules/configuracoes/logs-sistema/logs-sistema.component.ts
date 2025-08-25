import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Subject, interval, takeUntil } from 'rxjs';
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { Result } from '../../../../shared/models/api/result.model';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Component({
  selector: 'app-logs-sistema',
  templateUrl: './logs-sistema.component.html',
  styleUrls: ['./logs-sistema.component.scss'],
})
export class LogsSistemaComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  isLoading = false;
  isAutoRefresh = true;
  refreshInterval = 5000; // 5 segundos
  
  // Propriedade Math para uso no template
  Math = Math;
  
  // Opções para filtros
  levelOptions: {label: string, value: string}[] = [];
  
  // Filtros
  selectedLevels: string[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  searchTerm = '';
  dateRange: Date[] = [];
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 50;
  totalItems = 0;
  
  // Estatísticas
  stats = {
    total: 0,
    info: 0,
    warn: 0,
    error: 0,
    debug: 0
  };
  
  private destroy$ = new Subject<void>();
  private refreshTimer: any;

  constructor(
    private genericService: GenericService<LogEntry>,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeLevelOptions();
    this.loadLogs();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }

  private initializeLevelOptions(): void {
    this.levelOptions = [
      {label: this.translateService.instant('LOGS.INFO'), value: 'INFO'},
      {label: this.translateService.instant('LOGS.WARNINGS'), value: 'WARN'},
      {label: this.translateService.instant('LOGS.ERRORS'), value: 'ERROR'},
      {label: this.translateService.instant('LOGS.DEBUG'), value: 'DEBUG'}
    ];
  }

  loadLogs(): void {
    this.isLoading = true;
    
    // Simular chamada à API - substitua pela chamada real
    // Por enquanto, vamos usar dados mock diretamente
    setTimeout(() => {
      this.generateMockLogs();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    
    // Quando a API estiver disponível, use:
    // this.genericService.get('logs', '')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response: Result<LogEntry[]>) => {
    //       if (response.isSuccess && response.data) {
    //         this.logs = response.data;
    //         this.applyFilters();
    //         this.updateStats();
    //       } else {
    //         this.generateMockLogs();
    //       }
    //       this.isLoading = false;
    //       this.cdr.detectChanges();
    //     },
    //     error: (error) => {
    //       console.error('Erro ao carregar logs:', error);
    //       this.generateMockLogs();
    //       this.isLoading = false;
    //       this.cdr.detectChanges();
    //     }
    //   });
  }

  generateMockLogs(): void {
    const mockLogs: LogEntry[] = [];
    const levels: ('INFO' | 'WARN' | 'ERROR' | 'DEBUG')[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const sources = ['API', 'Database', 'Authentication', 'FileSystem', 'EmailService'];
    const messages = [
      'Usuário logado com sucesso',
      'Tentativa de acesso negada',
      'Erro na conexão com banco de dados',
      'Arquivo processado com sucesso',
      'Timeout na requisição',
      'Cache atualizado',
      'Backup realizado',
      'Sincronização concluída',
      'Erro de validação',
      'Configuração carregada'
    ];

    for (let i = 0; i < 100; i++) {
      const now = new Date();
      now.setSeconds(now.getSeconds() - Math.random() * 3600); // Última hora
      
      mockLogs.push({
        id: `log-${i}`,
        timestamp: now,
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        userId: `user-${Math.floor(Math.random() * 10)}`,
        userName: `Usuário ${Math.floor(Math.random() * 10)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }

    this.logs = mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.applyFilters();
    this.updateStats();
  }

  applyFilters(): void {
    let filtered = [...this.logs];

    // Filtro por nível
    if (this.selectedLevels.length > 0) {
      filtered = filtered.filter(log => this.selectedLevels.includes(log.level));
    }

    // Filtro por termo de busca
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term) ||
        log.userName?.toLowerCase().includes(term) ||
        log.ipAddress?.includes(term)
      );
    }

    // Filtro por data
    if (this.dateRange && this.dateRange.length === 2) {
      const startDate = new Date(this.dateRange[0]);
      const endDate = new Date(this.dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(log => 
        log.timestamp >= startDate && log.timestamp <= endDate
      );
    }

    this.filteredLogs = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  updateStats(): void {
    this.stats = {
      total: this.logs.length,
      info: this.logs.filter(log => log.level === 'INFO').length,
      warn: this.logs.filter(log => log.level === 'WARN').length,
      error: this.logs.filter(log => log.level === 'ERROR').length,
      debug: this.logs.filter(log => log.level === 'DEBUG').length
    };
  }

  getPaginatedLogs(): LogEntry[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredLogs.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
  }

  onRefresh(): void {
    this.loadLogs();
    this.messageService.add({
      severity: 'info',
      summary: 'Logs atualizados',
      detail: 'Os logs foram atualizados com sucesso',
      life: 2000
    });
  }

  toggleAutoRefresh(): void {
    this.isAutoRefresh = !this.isAutoRefresh;
    if (this.isAutoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  startAutoRefresh(): void {
    this.refreshTimer = interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isAutoRefresh) {
          this.loadLogs();
        }
      });
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
    }
  }

  clearFilters(): void {
    this.selectedLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    this.searchTerm = '';
    this.dateRange = [];
    this.applyFilters();
  }

  exportLogs(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-sistema-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateCSV(): string {
    const headers = ['Timestamp', 'Level', 'Message', 'Source', 'User', 'IP Address'];
    const rows = this.filteredLogs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.message,
      log.source,
      log.userName || '',
      log.ipAddress || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  getLevelClass(level: string): string {
    switch (level) {
      case 'ERROR': return 'level-error';
      case 'WARN': return 'level-warn';
      case 'INFO': return 'level-info';
      case 'DEBUG': return 'level-debug';
      default: return '';
    }
  }

  getLevelIcon(level: string): string {
    switch (level) {
      case 'ERROR': return 'pi pi-exclamation-triangle';
      case 'WARN': return 'pi pi-exclamation-circle';
      case 'INFO': return 'pi pi-info-circle';
      case 'DEBUG': return 'pi pi-bug';
      default: return 'pi pi-circle';
    }
  }
} 