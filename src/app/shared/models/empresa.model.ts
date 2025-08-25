export interface EmpresaModel {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  logo?: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  cnae: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
  };
  contato: {
    telefone: string;
    email: string;
    site?: string;
  };
  regimeTributario: string;
  optanteSimples: boolean;
  optanteMEI: boolean;
}

export const dadosEmpresaVMI: EmpresaModel = {
  id: 'vmi-medica-001',
  razaoSocial: 'VMI MÉDICA LTDA',
  nomeFantasia: 'VMI MÉDICA',
  cnpj: '12.345.678/0001-95',
  logo: 'assets/ketra_logo.png',
  inscricaoEstadual: '123.456.789',
  inscricaoMunicipal: '123.456',
  cnae: '4751201',
  endereco: {
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01234-567',
    pais: 'BRASIL'
  },
  contato: {
    telefone: '(11) 1234-5678',
    email: 'contato@vmimedica.com.br',
    site: 'www.vmimedica.com.br'
  },
  regimeTributario: 'Simples Nacional',
  optanteSimples: true,
  optanteMEI: false
}; 