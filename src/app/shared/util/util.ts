export function getSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
  switch (type.toUpperCase()) {
    case 'INCLUSÃO':
      return 'success';
    case 'EXCLUSÃO':
      return 'danger';
    case 'EDIÇÃO':
      return 'warning';
    case 'VISUALIZAÇÃO':
      return 'info';
    default:
      return 'contrast';
  }
}

export function getAccessLabel(type: string): string {
  switch (type.toUpperCase()) {
    case 'INCLUSÃO': return 'Inclusão';
    case 'EXCLUSÃO': return 'Exclusão';
    case 'EDIÇÃO': return 'Edição';
    case 'VISUALIZAÇÃO': return 'Visualização';
    default: return type;
  }
}