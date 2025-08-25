import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * Serviço para interação com a API de CNAE (Classificação Nacional de Atividades Econômicas) do IBGE.
 * Fornece métodos para obter informações de atividades econômicas com base em códigos CNAE.
 */
@Injectable({
  providedIn: 'root'
})
export class CnaeService {
  /** URL base da API de CNAE do IBGE */
  private readonly API_URL = 'https://servicodados.ibge.gov.br/api/v2/cnae/subclasses';
  
  /** Instância do HttpClient para fazer requisições HTTP */
  private readonly http = inject(HttpClient);

  /**
   * Busca informações de atividade econômica para um determinado código CNAE.
   * 
   * @param {string} codigoCnae - O código CNAE para consulta (pode conter caracteres de formatação)
   * @returns {Observable<any>} Um Observable que emite as informações da atividade.
   *                            Se a API retornar um array, emite o primeiro elemento.
   * @throws Lança um erro se a requisição HTTP falhar.
   * 
   * @example
   * // Exemplo de uso:
   * this.cnaeService.buscarAtividadeCnae('01.11-1')
   *   .subscribe(atividade => console.log(atividade));
   */
  public buscarAtividadeCnae(codigoCnae: string): Observable<any> {
    const codigoLimpo = codigoCnae.replace(/\D/g, '');
    return this.http.get(`${this.API_URL}/${codigoLimpo}`).pipe(
      map((response: any) => Array.isArray(response) ? response[0] : response)
    );
  }
}