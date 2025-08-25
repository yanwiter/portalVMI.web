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
 * Enum para status do perfil
 */
export enum StatusPerfilEnum {
    Ativo = 0,
    Inativo = 1,
    Suspenso = 2
}

/**
 * Enum para tipo de suspensão
 */
export enum TipoSuspensaoEnum {
    Temporaria = 0,
    Permanente = 1
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
    id: string;
    
    /** Nome do perfil */
    nome: string;
    
    /** Descrição detalhada do perfil */
    descricao: string;
    
    /** Status que indica se o perfil está ativo, inativo ou suspenso */
    statusPerfil: StatusPerfilEnum;
    
    /** Modelo de acesso associado ao perfil (opcional) */
    acessoModel?: AcessoModel;
    
    /** Lista de acessos/permissões vinculados ao perfil (opcional) */
    acessos?: AcessoPerfil[];
    
    // Campos para suspensão
    /** Tipo de suspensão (temporária ou permanente) */
    tipoSuspensao?: TipoSuspensaoEnum;
    
    /** Data de início da suspensão */
    dataInicioSuspensao?: Date | string | null;
    
    /** Data de fim da suspensão (opcional para suspensões permanentes) */
    dataFimSuspensao?: Date | string | null;
    
    /** Motivo da suspensão */
    motivoSuspensao?: string;
    
    /** ID do responsável pela suspensão */
    idRespSuspensao?: string;
    
    /** Nome do responsável pela suspensão */
    nomeRespSuspensao?: string;
    
    /** Data em que a suspensão foi aplicada */
    dataSuspensao?: Date | string | null;
    
    // Campos adicionais do backend
    /** Data de inclusão */
    dataInclusao?: Date | string | null;
    
    /** ID do responsável pela inclusão */
    idRespInclusao?: string;
    
    /** Nome do responsável pela inclusão */
    nomeRespInclusao?: string;
    
    /** ID do responsável pela última modificação */
    idRespUltimaModificacao?: string;
    
    /** Nome do responsável pela última modificação */
    nomeRespUltimaModificacao?: string;
    
    /** Data da última modificação */
    dataUltimaModificacao?: Date | string | null;
    
    /** Justificativa para inativação */
    justificativaInativacao?: string;
    
    /** Data de inativação */
    dataInativacao?: Date | string | null;
    
    /** ID do responsável pela inativação */
    idRespInativacao?: string;
    
    /** Nome do responsável pela inativação */
    nomeRespInativacao?: string;
}