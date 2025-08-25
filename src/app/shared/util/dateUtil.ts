export function formatarDataParaDDMMYYYY(date: Date | string): string {
    const data = new Date(date);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

export function getDataAtualFormatada(separator: string = '-') {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  return `${dia}${separator}${mes}${separator}${ano}`;
}

/**
 * Formata uma data para exibição com tratamento de erros
 * @param date - Data a ser formatada
 * @param includeTime - Se deve incluir horário
 * @returns Data formatada ou 'N/A' se inválida
 */
export function formatDate(date: Date | string | null, includeTime: boolean = true): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    if (includeTime) {
      return dateObj.toLocaleDateString('pt-BR') + " às " + dateObj.toLocaleTimeString('pt-BR');
    } else {
      return dateObj.toLocaleDateString('pt-BR');
    }
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Converte uma data para objeto Date válido
 * @param date - Data a ser convertida
 * @returns Objeto Date ou null se inválida
 */
export function parseDate(date: Date | string | null): Date | null {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj;
  } catch (error) {
    return null;
  }
}

/**
 * Converte uma string de data para objeto Date com suporte a múltiplos formatos
 * @param dateString - String de data ou objeto Date
 * @returns Objeto Date ou null se inválida
 */
export function convertStringToDate(dateString: string | Date | null): Date | null {
  if (!dateString) return null;
  
  try {
    // Se já for um objeto Date, retorna ele mesmo
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Se for string, converte para Date
    if (typeof dateString === 'string') {
      // Remove possíveis espaços e caracteres especiais
      const cleanDateString = dateString.trim();
      
      // Tenta diferentes formatos de data
      let date = new Date(cleanDateString);
      
      // Se a data for inválida, tenta outros formatos
      if (isNaN(date.getTime())) {
        // Tenta formato brasileiro dd/mm/yyyy
        if (cleanDateString.includes('/')) {
          const parts = cleanDateString.split('/');
          if (parts.length === 3) {
            date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        }
      }
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.warn(`Data inválida: ${dateString}`);
        return null;
      }
      
      return date;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao converter data: ${dateString}`, error);
    return null;
  }
}