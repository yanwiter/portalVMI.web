/**
 * Enum para os diferentes status que um perfil pode ter
 */
export enum StatusPerfilEnum {
    /** Perfil ativo e funcionando normalmente */
    ATIVO = 0,
    
    /** Perfil inativo (desabilitado permanentemente) */
    INATIVO = 1,
    
    /** Perfil suspenso temporariamente ou permanentemente */
    SUSPENSO = 2
}

/**
 * Enum para os tipos de suspensão
 */
export enum TipoSuspensaoEnum {
    /** Suspensão temporária com data de fim definida */
    TEMPORARIA = 0,
    
    /** Suspensão permanente sem data de fim */
    PERMANENTE = 1
}

