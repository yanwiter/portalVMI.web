import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';
import { EnderecoModel } from '../../models/endereco.model';

/**
 * Serviço para busca de endereços através do ViaCEP API
 * @Injectable Decorator que marca a classe como disponível para injeção de dependência
 * @providedIn 'root' Especifica que o serviço deve ser fornecido no nível raiz da aplicação
 */
@Injectable({
  providedIn: 'root'
})
export class BuscaCepService {
  
  public enderco: EnderecoModel[] = [];
  private readonly viaCepUrl = 'https://viacep.com.br/ws';
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  /**
   * Busca informações de endereço a partir de um CEP
   * @param {string} cep - O CEP a ser consultado (pode conter formatação)
   * @returns {Promise<any>} Uma Promise que resolve com os dados do endereço ou rejeita com um erro
   * @throws {Error} Lança um erro se o CEP for inválido ou não for encontrado
   * @example
   * buscaCepService.buscarCep('01001000')
   *   .then(dados => console.log(dados))
   *   .catch(erro => console.error(erro));
   */
  public buscarCep(cep: string): Promise<any> {
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.messageService.add({
        severity: 'warn',
        summary: 'CEP inválido',
        detail: 'O CEP deve conter 8 dígitos',
        life: 3000
      });
      return Promise.reject('CEP inválido');
    }

    return this.http.get(`${this.viaCepUrl}/${cepNumerico}/json`)
      .pipe(take(1))
      .toPromise()
      .then((dados: any) => {
        if (dados.erro) {
          throw new Error('CEP não encontrado');
        }
        return dados;
      })
      .catch(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao buscar CEP',
          detail: error.message || 'Não foi possível buscar o CEP',
          life: 3000
        });
        throw error;
      });
  }

  /**
   * Preenche um formulário de endereço com os dados obtidos da busca por CEP
   * @param {any} dadosCep - Dados do endereço retornados pela API ViaCEP
   * @param {EnderecoModel} formulario - Objeto do formulário que será preenchido
   * @returns {void}
   * @example
   * const formulario = new EnderecoModel();
   * buscaCepService.preencherCamposEndereco(dadosCep, formulario);
   */
  public preencherCamposEndereco(dadosCep: any, formulario: EnderecoModel): void {
    if (!formulario) return;

    const campos = {
      logradouro: dadosCep.logradouro || '',
      complemento: dadosCep.complemento || '',
      bairro: dadosCep.bairro || '',
      cidade: dadosCep.localidade || '',
      uf: dadosCep.uf || ''
    };

    (Object.keys(campos) as Array<keyof typeof campos>).forEach(campo => {
      if (formulario[campo] !== undefined) {
        formulario[campo] = campos[campo];
      }
    });
  }
}