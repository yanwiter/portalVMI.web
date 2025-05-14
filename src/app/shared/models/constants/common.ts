import { AcessLevel } from "../enums/acessLevel.enum";
import { ClienteFornecedor } from "../enums/clienteFornecedor.enum";

export const AccessLabel = {
    [AcessLevel.Visualization]: 'Visualização',
    [AcessLevel.Inclusion]: 'Inclusão',
    [AcessLevel.Edition]: 'Edição',
    [AcessLevel.Exclusion]: 'Exclusão',
};

export const ClienteFornecedorLabel = {
    [ClienteFornecedor.Cliente]: 'Cliente',
    [ClienteFornecedor.Fornecedor]: 'Fornecedor'

};
