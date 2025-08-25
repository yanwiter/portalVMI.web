export function saveUserData(response: any) {
    localStorage.setItem('userData', JSON.stringify({
        id: response.data.user.id,
        nome: response.data.user.nome,
        email: response.data.user.email,
        perfilId: response.data.user.idPerfil,
        perfil: response.data.user.perfilNome,
        fotoPerfil: response.data.user.fotoPerfil,
        token: response.data.token,
        refreshToken: response.data.refreshToken
    }));
}

export function saveUserId(id: string) {
    localStorage.setItem('userId', id);
}

export function getUserIdFromStorage(): string {
    return localStorage.getItem('userId') || "";
}

export function getUserIdFromStorageII(): string {
    const userData = localStorage.getItem('userId');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.id ?? null;
        } catch (e) {
            console.error('Erro ao pegar id de usuario', e);
            return "";
        }
    }
    return "";
}

export function getUserNameFromStorage(): string {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.nome ?? null;
        } catch (e) {
            console.error('Erro ao pegar nome de usuario', e);
            return '';
        }
    }
    return '';
}

export function getPerfilNameFromStorage(): string {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.perfil ?? null;
        } catch (e) {
            console.error('Erro ao pegar perfil de usuario', e);
            return '';
        }
    }
    return '';
}

export function loadPerfilIdFromStorage(): string | null {
    const userData = localStorage.getItem('userData');
    if(userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.perfilId ?? null;
        } catch (e) {
            console.error('Erro ao parsear userData do localStorage', e);
            return null;
        }
    }
    return null;
}

export function getFotoPerfilFromStorage(): string | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.fotoPerfil ?? null;
        } catch (e) {
            console.error('Erro ao pegar foto de perfil do localStorage', e);
            return null;
        }
    }
    return null;
}

/**
 * Salva os acessos ativos do usuário no localStorage
 */
export function saveUserAcessosToStorage(acessos: any[]): void {
    try {
        const acessosAtivos = acessos.filter(acesso => acesso.ativo === true);
        localStorage.setItem('userAcessos', JSON.stringify(acessosAtivos));
    } catch (e) {
        console.error('Erro ao salvar acessos no localStorage:', e);
    }
}

/**
 * Carrega os acessos do usuário do localStorage
 */
export function loadUserAcessosFromStorage(): any[] | null {
    try {
        const storedAcessos = localStorage.getItem('userAcessos');
        if (storedAcessos) {
            return JSON.parse(storedAcessos);
        }
        return null;
    } catch (e) {
        console.error('Erro ao carregar acessos do localStorage:', e);
        return null;
    }
}

/**
 * Salva as permissões do usuário no localStorage
 */
export function savePermissionsToStorage(permissions: any[]): void {
    try {
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
    } catch (e) {
        console.error('Erro ao salvar permissões no localStorage:', e);
    }
}

/**
 * Carrega as permissões do localStorage
 */
export function loadPermissionsFromStorage(): any[] | null {
    try {
        const storedPermissions = localStorage.getItem('userPermissions');
        if (storedPermissions) {
            return JSON.parse(storedPermissions);
        }
        return null;
    } catch (e) {
        console.error('Erro ao carregar permissões do localStorage:', e);
        return null;
    }
}

/**
 * Obtém o token JWT do localStorage
 */
export function getTokenFromStorage(): string | null {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            return parsedData.token || null;
        }
        return null;
    } catch (e) {
        console.error('Erro ao obter token do localStorage:', e);
        return null;
    }
}

/**
 * Remove o token JWT do localStorage
 */
export function removeTokenFromStorage(): void {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            delete parsedData.token;
            delete parsedData.refreshToken;
            localStorage.setItem('userData', JSON.stringify(parsedData));
        }
    } catch (e) {
        console.error('Erro ao remover token do localStorage:', e);
    }
}

/**
 * Verifica se o usuário está autenticado (tem token válido)
 */
export function isUserAuthenticated(): boolean {
    const token = getTokenFromStorage();
    return token !== null && token !== '';
}