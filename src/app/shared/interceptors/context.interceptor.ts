import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextService } from '../services/context/context.service';

@Injectable()
export class ContextInterceptor implements HttpInterceptor {
  constructor(private contextService: ContextService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔗 Interceptor de contexto - URL:', request.url);
    console.log('🔗 Interceptor de contexto - Método:', request.method);
    
    // NÃO aplicar contexto para rotas de autenticação
    if (this.isAuthRoute(request.url)) {
      console.log('🔗 Interceptor: Rota de autenticação detectada, pulando contexto');
      return next.handle(request);
    }

    // Obter o contexto da empresa ativa
    const empresaAtiva = this.contextService.obterEmpresaAtiva();
    const usuarioLogado = this.contextService.obterUsuarioLogado();

    // Clonar a requisição e adicionar headers de contexto
    let modifiedRequest = request;

    if (empresaAtiva) {
      console.log('🔗 Interceptor: Aplicando contexto da empresa:', empresaAtiva.nomeFantasia);
      modifiedRequest = request.clone({
        setHeaders: {
          'X-Empresa-Id': empresaAtiva.id,
          'X-Empresa-CNPJ': empresaAtiva.cnpj,
          'X-Empresa-Nome': empresaAtiva.nomeFantasia,
          'X-Contexto': 'multi-tenant'
        }
      });
    } else {
      console.log('🔗 Interceptor: Nenhuma empresa ativa, requisição sem contexto');
    }

    if (usuarioLogado) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          ...modifiedRequest.headers,
          'X-Usuario-Id': usuarioLogado.id,
          'X-Usuario-Empresa': usuarioLogado.empresaId
        }
      });
    }

    // Adicionar parâmetros de contexto na URL se for uma requisição GET
    if (request.method === 'GET' && empresaAtiva) {
      const url = new URL(request.url, window.location.origin);
      url.searchParams.set('empresaId', empresaAtiva.id);
      url.searchParams.set('empresaCNPJ', empresaAtiva.cnpj);
      
      modifiedRequest = modifiedRequest.clone({
        url: url.toString()
      });
    }

    return next.handle(modifiedRequest);
  }

  private isAuthRoute(url: string): boolean {
    // Rotas que NÃO devem receber contexto (autenticação)
    const authRoutes = [
      '/Login',
      '/login',
      '/authenticate',
      '/auth',
      '/register',
      '/forgot-password',
      '/reset-password'
    ];

    return authRoutes.some(route => url.includes(route));
  }
}
