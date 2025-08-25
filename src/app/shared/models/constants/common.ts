import { AcessLevel } from "../enums/acessLevel.enum";
import { ClienteFornecedorEnum } from "../enums/clienteFornecedor.enum";

export const AccessLabel = {
    [AcessLevel.Visualization]: 'Visualização',
    [AcessLevel.Inclusion]: 'Inclusão',
    [AcessLevel.Edition]: 'Edição',
    [AcessLevel.Exclusion]: 'Exclusão',
};

export const ClienteFornecedorLabel = {
    [ClienteFornecedorEnum.Cliente]: 'Cliente',
    [ClienteFornecedorEnum.Fornecedor]: 'Fornecedor'

};
