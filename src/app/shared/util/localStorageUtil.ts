export function saveUserData(response: any) {
    localStorage.setItem('userData', JSON.stringify({
        idPessoaLogada: response.data.id,
        nomePessoaLogada: response.data.nome,
        emailPessoaLogada: response.data.email,
        perfiliIdPessoaLogada: response.data.perfil_id,
        perfilPessoaLogada: response.data.perfilNome
    }));
}

export function getUserNameFromStorage(): string {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.nomePessoaLogada ?? '';
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
            return parsedData.perfilPessoaLogada ?? '';
        } catch (e) {
            console.error('Erro ao pegar perfil de usuario', e);
            return '';
        }
    }
    return '';
}

export function getUserIdFromStorage(): number {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            return parsedData.idPessoaLogada ?? 0;
        } catch (e) {
            console.error('Erro ao pegar id de usuario', e);
            return 0;
        }
    }
    return 0;
}

export function loadUserDataFromStorage(idPessoaLogada: any): void {
    const userData = localStorage.getItem('userData');
    if(userData) {
        try {
            const parsedData = JSON.parse(userData);
            idPessoaLogada = parsedData.perfiliIdPessoaLogada ?? 0;
        } catch (e) {
            console.error('Erro ao parsear userData do localStorage', e);
        }
    }
}