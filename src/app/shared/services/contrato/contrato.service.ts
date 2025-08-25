import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Result } from '../../models/api/result.model';
import { Contrato, StatusContrato, TipoContrato, AcaoAprovacao, FiltroContrato, HistoricoAprovacao } from '../../models/contrato.model';
import { ApiRoutesV1 } from '../../models/api/routes-v1.model';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private http = inject(HttpClient);
  private apiRoutes = new ApiRoutesV1();

  // Dados mock temporários
  private mockContratos: Contrato[] = [
    {
      id: '1',
      numero: 'CTR-2024-001',
      titulo: 'Contrato de Prestação de Serviços',
      descricao: 'Contrato para prestação de serviços de consultoria',
      clienteId: 'CLI-001',
      clienteNome: 'Empresa ABC Ltda',
      valorTotal: 50000.00,
      dataInicio: new Date(2024, 0, 1),
      dataFim: new Date(2024, 11, 31),
      status: StatusContrato.EM_ANALISE,
      tipoContrato: TipoContrato.PRESTACAO_SERVICOS,
      responsavelId: 'USR-001',
      responsavelNome: 'João Silva',
      dataInclusao: new Date(2024, 0, 1),
      idRespInclusao: 'USR-001',
      nomeRespInclusao: 'João Silva'
    },
    {
      id: '2',
      numero: 'CTR-2024-002',
      titulo: 'Contrato de Compra de Equipamentos',
      descricao: 'Contrato para compra de equipamentos de informática',
      clienteId: 'CLI-002',
      clienteNome: 'Empresa XYZ Ltda',
      valorTotal: 75000.00,
      dataInicio: new Date(2024, 1, 1),
      dataFim: new Date(2024, 10, 31),
      status: StatusContrato.APROVADO,
      tipoContrato: TipoContrato.COMPRA,
      responsavelId: 'USR-002',
      responsavelNome: 'Maria Santos',
      dataInclusao: new Date(2024, 1, 1),
      idRespInclusao: 'USR-002',
      nomeRespInclusao: 'Maria Santos'
    }
  ];

  private mockHistorico: HistoricoAprovacao[] = [
    {
      id: '1',
      contratoId: '1',
      acao: AcaoAprovacao.CRIACAO,
      statusNovo: StatusContrato.RASCUNHO,
      observacao: 'Contrato criado',
      responsavelId: 'USR-001',
      responsavelNome: 'João Silva',
      dataAcao: new Date(2024, 0, 1)
    },
    {
      id: '2',
      contratoId: '1',
      acao: AcaoAprovacao.ENVIAR_APROVACAO,
      statusAnterior: StatusContrato.RASCUNHO,
      statusNovo: StatusContrato.EM_ANALISE,
      observacao: 'Enviado para aprovação',
      responsavelId: 'USR-001',
      responsavelNome: 'João Silva',
      dataAcao: new Date(2024, 0, 2)
    }
  ];

  /**
   * Busca todos os contratos com filtros opcionais
   */
  public getAll(filtros?: FiltroContrato, pageNumber: number = 1, pageSize: number = 10): Observable<Result<Contrato[]>> {
    // Mock temporário
    let contratosFiltrados = [...this.mockContratos];
    
    if (filtros) {
      if (filtros.numero) {
        contratosFiltrados = contratosFiltrados.filter(c => 
          c.numero.toLowerCase().includes(filtros.numero!.toLowerCase())
        );
      }
      if (filtros.titulo) {
        contratosFiltrados = contratosFiltrados.filter(c => 
          c.titulo.toLowerCase().includes(filtros.titulo!.toLowerCase())
        );
      }
      if (filtros.status) {
        contratosFiltrados = contratosFiltrados.filter(c => c.status === filtros.status);
      }
    }

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContratos = contratosFiltrados.slice(startIndex, endIndex);

    const result: Result<Contrato[]> = {
      isSuccess: true,
      data: paginatedContratos,
      pagination: {
        pageNumber,
        pageSize,
        totalCount: contratosFiltrados.length
      }
    };

    return of(result);
  }

  /**
   * Busca um contrato específico por ID
   */
  public getById(id: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    const result: Result<Contrato> = {
      isSuccess: !!contrato,
      data: contrato,
      error: !contrato ? { statusCode: 404, message: 'Contrato não encontrado' } : undefined
    };
    return of(result);
  }

  /**
   * Cria um novo contrato
   */
  public create(contrato: Contrato): Observable<Result<Contrato>> {
    const novoContrato = { ...contrato, id: Date.now().toString() };
    this.mockContratos.push(novoContrato);
    
    const result: Result<Contrato> = {
      isSuccess: true,
      data: novoContrato
    };
    return of(result);
  }

  /**
   * Atualiza um contrato existente
   */
  public update(id: string, contrato: Contrato): Observable<Result<Contrato>> {
    const index = this.mockContratos.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockContratos[index] = { ...contrato, id };
      const result: Result<Contrato> = {
        isSuccess: true,
        data: this.mockContratos[index]
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Remove um contrato
   */
  public delete(id: string): Observable<Result<boolean>> {
    const index = this.mockContratos.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockContratos.splice(index, 1);
      const result: Result<boolean> = {
        isSuccess: true,
        data: true
      };
      return of(result);
    }
    
    const result: Result<boolean> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Envia contrato para aprovação
   */
  public sendForApproval(id: string, observacao?: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.EM_ANALISE;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Aprova um contrato
   */
  public approve(id: string, observacao?: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.APROVADO;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Reprova um contrato
   */
  public reject(id: string, observacao: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.REPROVADO;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Ativa um contrato aprovado
   */
  public activate(id: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.EM_VIGOR;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Encerra um contrato em vigor
   */
  public close(id: string, observacao?: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.ENCERRADO;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Cancela um contrato
   */
  public cancel(id: string, observacao: string): Observable<Result<Contrato>> {
    const contrato = this.mockContratos.find(c => c.id === id);
    if (contrato) {
      contrato.status = StatusContrato.CANCELADO;
      const result: Result<Contrato> = {
        isSuccess: true,
        data: contrato
      };
      return of(result);
    }
    
    const result: Result<Contrato> = {
      isSuccess: false,
      error: { statusCode: 404, message: 'Contrato não encontrado' }
    };
    return of(result);
  }

  /**
   * Busca histórico de aprovação de um contrato
   */
  public getHistory(id: string): Observable<Result<HistoricoAprovacao[]>> {
    const historico = this.mockHistorico.filter(h => h.contratoId === id);
    const result: Result<HistoricoAprovacao[]> = {
      isSuccess: true,
      data: historico
    };
    return of(result);
  }

  /**
   * Upload de anexo para contrato
   */
  public uploadAnexo(contratoId: string, file: File): Observable<Result<any>> {
    const result: Result<any> = {
      isSuccess: true,
      data: { id: Date.now().toString(), nome: file.name }
    };
    return of(result);
  }

  /**
   * Remove anexo de contrato
   */
  public removeAnexo(contratoId: string, anexoId: string): Observable<Result<boolean>> {
    const result: Result<boolean> = {
      isSuccess: true,
      data: true
    };
    return of(result);
  }

  /**
   * Busca estatísticas de contratos
   */
  public getEstatisticas(): Observable<Result<any>> {
    const result: Result<any> = {
      isSuccess: true,
      data: {
        total: this.mockContratos.length,
        emAnalise: this.mockContratos.filter(c => c.status === StatusContrato.EM_ANALISE).length,
        aprovados: this.mockContratos.filter(c => c.status === StatusContrato.APROVADO).length,
        emVigor: this.mockContratos.filter(c => c.status === StatusContrato.EM_VIGOR).length
      }
    };
    return of(result);
  }

  /**
   * Busca contratos próximos do vencimento
   */
  public getContratosVencimento(dias: number = 30): Observable<Result<Contrato[]>> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    
    const contratosVencimento = this.mockContratos.filter(c => 
      c.dataFim <= dataLimite && c.status === StatusContrato.EM_VIGOR
    );
    
    const result: Result<Contrato[]> = {
      isSuccess: true,
      data: contratosVencimento
    };
    return of(result);
  }

  /**
   * Busca contratos por status
   */
  public getContratosPorStatus(status: StatusContrato): Observable<Result<Contrato[]>> {
    const contratosPorStatus = this.mockContratos.filter(c => c.status === status);
    
    const result: Result<Contrato[]> = {
      isSuccess: true,
      data: contratosPorStatus
    };
    return of(result);
  }
} 