import { StatusFuncionario } from '../ponto.model';

export const statusFuncionarioOptions = [
  { label: 'Ativo', value: StatusFuncionario.ATIVO },
  { label: 'Inativo', value: StatusFuncionario.INATIVO },
  { label: 'Férias', value: StatusFuncionario.FERIAS },
  { label: 'Licença', value: StatusFuncionario.LICENCA }
]; 