import { AcessoModel } from "./acesso.model";
import { AcessoPerfil } from "./AcessoPerfil.model";
import { IApiRouteBase } from "./api/routes.model";

/**
 * Modelo que representa a configuração de rotas de perfil
 * 
 * Implementa a interface de rotas base da API com caminho específico para endpoints de perfil
 * 
 * @class PerfilRouteModel
 * @implements {IApiRouteBase}
 */
export class PerfilRouteModel implements IApiRouteBase {
    /** 
     * Caminho base para os endpoints de perfil na API
     * @type {string}
     */
    basePath = "Perfil";
}

/**
 * Interface que representa um modelo de perfil de usuário
 * 
 * Esta interface define a estrutura dos dados de perfil no sistema,
 * incluindo seus relacionamentos com permissões de acesso
 * 
 * @interface PerfilModel
 */
export interface PerfilModel {
    /** Identificador único do perfil */
    id: number;
    
    /** Nome do perfil */
    nome: string;
    
    /** Descrição detalhada do perfil */
    descricao: string;
    
    /** Status que indica se o perfil está ativo ou não */
    statusPerfil: boolean;
    
    /** Modelo de acesso associado ao perfil (opcional) */
    acessoModel?: AcessoModel;
    
    /** Lista de acessos/permissões vinculados ao perfil (opcional) */
    acessos?: AcessoPerfil[];
}