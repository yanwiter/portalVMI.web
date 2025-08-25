import { Component, DestroyRef, inject, ViewChild, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { FileUploadEvent } from 'primeng/fileupload';
import { TabView } from 'primeng/tabview';

// Models
import { EnderecoModel } from '../../../../shared/models/endereco.model';
import { ContatoModel } from '../../../../shared/models/contato.model';
import { DadoFinanceiroModel } from '../../../../shared/models/dadoFinanceiro.model';
import { ClientesFornecedoresModel } from '../../../../shared/models/clientesFornecedores.model';

// Enums
import { TipoPessoaEnum } from '../../../../shared/models/enums/tipoPessoa.enum';
import { ClienteFornecedorEnum } from '../../../../shared/models/enums/clienteFornecedor.enum';

// Services
import { GenericService } from '../../../../shared/services/generic/generic.service';
import { SpinnerService } from '../../../../shared/services/spinner/spinner.service';
import { BuscaCepService } from '../../../../shared/services/buscaCep/buscaCep.Service';
import { CnaeService } from '../../../../shared/services/BuscaCnae/cnae.service';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';

// Options
import { clienteFornecedorOptions } from '../../../../shared/models/options/clienteFornecedor.options';
import { inativoAtivoOptions } from '../../../../shared/models/options/inativoAtivo.options';
import { tipoPessoaOptions } from '../../../../shared/models/options/tipoPessoa.options';
import { tipoRegimeTributarioOptions } from '../../../../shared/models/options/tipoRegimeTributario.options';
import { ufOptions } from '../../../../shared/models/options/uf.options';
import { tipoEnderecoOptions } from '../../../../shared/models/options/tipoEndereco.options';
import { bancoOptions } from '../../../../shared/models/options/banco.options';
import { condicaoPagamentoOptions } from '../../../../shared/models/options/condicaoPagamento.options';
import { tipoContaOptions } from '../../../../shared/models/options/tipoConta.options';
import { porteEmpresaOptions } from '../../../../shared/models/options/porteEmpresa.options';
import { tipoEmpresaOptions } from '../../../../shared/models/options/tipoEmpresa.options';
import { naturezaJuridicaOptions } from '../../../../shared/models/options/naturezaJuridica.options';
import { simNaoOptions } from '../../../../shared/models/options/simNao.options';

// Utils
import {
  validarCPF,
  validarCNPJ,
  formataCPFCNPJ,
  getTipoCadastroText,
  getTipoPessoaText,
  handleExcelExportSuccess,
  messageOfReturns,
} from '../../../../shared/util/util';
import {
  getUserIdFromStorage,
  getUserNameFromStorage
} from '../../../../shared/util/localStorageUtil';
import { AnexosModel } from '../../../../shared/models/anexos.model';

interface UploadedFile extends File {
  objectURL?: string;
}

@Component({
  selector: 'app-clientes-fornecedores',
  templateUrl: './clientes-fornecedores.component.html',
  styleUrls: ['./clientes-fornecedores.component.scss']
})
export class ClientesFornecedoresComponent implements OnInit {
  @ViewChild('tabView') tabView: TabView | undefined;

  // Services
  private readonly cepService = inject(BuscaCepService);
  private readonly messageService = inject(MessageService);
  private readonly clienteFornecedorService = inject(GenericService<ClientesFornecedoresModel>);
  private readonly destroy = inject(DestroyRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly cnaeService = inject(CnaeService);
  private readonly permissionsService = inject(PermissionsService);

  // Properties
  public uploadedFiles: any[] = [];
  public clientesFornecedores: ClientesFornecedoresModel[] = [];
  public customQueryParams?: string;
  public queryFilterParams?: Map<string, string>;
  public currentRowsPerPage = 10;
  public currentFirstRows = 1;
  public displayModal: boolean = false;
  public tblLazyLoading: boolean = false;
  public rows = 10;
  public rowsPerPage = [10, 25, 50, 100];
  public totalRecords: number = 0;
  public minDate = new Date(2024, 0, 1);
  public maxDate = new Date();
  public calendarRange: Date[] = [];
  public isCadastroInativo: boolean = false;
  public cpfCnpjInvalido: boolean = false;
  public mask: string = '';
  public modalTitle: string = '';
  public isEditando: boolean = false;
  public displayConfirmation: boolean = false;
  public displayConfirmationforInativacao: boolean = false;
  public tempInativoValue: boolean = false;
  public clienteFornecedorParaExcluir: ClientesFornecedoresModel | null = null;
  public modalTitleDelete: string = 'Confirmar Exclusão';
  public clienteFornecedor: ClientesFornecedoresModel = this.createEmptyClienteFornecedor();

  // Properties para controle de permissões
  public canCreate: boolean = false;
  public canEdit: boolean = false;
  public canDelete: boolean = false;
  public canView: boolean = false;
  public hasAnyPermission: boolean = false;
  public showActionsColumn: boolean = false;

  // Options
  public ufOptions = ufOptions;
  public tipoEnderecoOptions = tipoEnderecoOptions;
  public tipoPessoaOptions = tipoPessoaOptions;
  public tipoRegimeTributarioOptions = tipoRegimeTributarioOptions;
  public statusOptions = inativoAtivoOptions;
  public clienteFornecedorOptions = clienteFornecedorOptions;
  public condicaoPagamentoOptions = condicaoPagamentoOptions;
  public bancoOptions = bancoOptions;
  public tipoContaOptions = tipoContaOptions;
  public porteEmpresaOptions = porteEmpresaOptions;
  public tipoEmpresaOptions = tipoEmpresaOptions;
  public naturezaJuridicaOptions = naturezaJuridicaOptions;
  public simNaoOptions = simNaoOptions;

  // Filters
  public filtros = {
    nome: '',
    cpfCnpj: '',
    statusCadastro: null,
    tipoCadastro: null,
    tipoPessoa: null
  };

  ngOnInit(): void {
    this.loadUserPermissions();
    this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
  }

  /**
   * Recarrega as permissões do usuário (útil para casos de mudança de perfil)
   */
  public reloadPermissions(): void {
    this.permissionsService.reloadPermissions();
    this.loadUserPermissions();
  }

  /**
   * Carrega as permissões do usuário
   */
  private loadUserPermissions(): void {
    const rotinaId = '391A6C2C-5CED-4E85-B8FC-6F258A0C75F9';
    
    setTimeout(() => {
      this.canView = this.permissionsService.canView(rotinaId);
      this.canCreate = this.permissionsService.canCreate(rotinaId);
      this.canEdit = this.permissionsService.canEdit(rotinaId);
      this.canDelete = this.permissionsService.canDelete(rotinaId);
      this.hasAnyPermission = this.permissionsService.hasAnyPermission(rotinaId);
      this.showActionsColumn = this.canEdit || this.canDelete;
    }, 10);
  }

  // Initialization methods
  private createEmptyClienteFornecedor(): ClientesFornecedoresModel {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      tipoCadastro: 0,
      tipoPessoa: 0,
      cpfCnpj: '',
      porteEmpresa: 0,
      tipoEmpresa: 0,
      rg: '',
      razaoSocial: '',
      nomeFantasia: '',
      naturezaJuridica: 0,
      optanteMEI: undefined,
      optanteSimples: undefined,
      regimeTributario: 0,
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      cnae: '',
      atividadeCnae: '',
      site: '',
      statusCadastro: true,
      dataInclusao: undefined,
      idRespInclusao: '',
      nomeRespInclusao: '',
      dataUltimaModificacao: undefined,
      idRespUltimaModificacao: '00000000-0000-0000-0000-000000000000',
      nomeRespUltimaModificacao: '',
      dataInativacao: undefined,
      idRespInativacao: '00000000-0000-0000-0000-000000000000',
      nomeRespInativacao: '',
      justificativaInativacao: '',
      observacoes: '',
      enderecos: [this.createEmptyEndereco()],
      contatos: [this.createEmptyContato()],
      dadosFinanceiros: [this.createEmptyDadoFinanceiro()],
      anexos: [this.createEmptyAnexos()]
    };
  }

  private createEmptyEndereco(): EnderecoModel {
    return {
      cep: '',
      logradouro: '',
      complemento: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      tipoEndereco: '',
      referencia: ''
    };
  }

  private createEmptyContato(): ContatoModel {
    return {
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
      celular: '',
      ramal: ''
    };
  }

  private createEmptyDadoFinanceiro(): DadoFinanceiroModel {
    return {
      limiteCredito: 0,
      condicaoPagamento: null,
      banco: null,
      agencia: '',
      conta: '',
      tipoConta: null,
      chavePix: ''
    };
  }

  private createEmptyAnexos(): AnexosModel {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      idClienteFornecedor: '00000000-0000-0000-0000-000000000000',
      nome: '',
      conteudo: '',
      extensao: '',
      idRespInclusao: '00000000-0000-0000-0000-000000000000',
      dataInclusao: new Date(),
      nomeRespInclusao: ''
    };
  }

  // Table methods
  public loadTableData(event: TableLazyLoadEvent) {
    this.spinnerService.show();
    this.tblLazyLoading = true;

    const pageNumber = Math.floor(event.first! / event.rows!) + 1;
    const pageSize = event.rows!;

    let params = `PageNumber=${pageNumber}&PageSize=${pageSize}`;
    const filters = this.buildFiltersParams();

    if (filters) {
      params += filters.startsWith('&') ? filters : `&${filters}`;
    }

    this.clienteFornecedorService.getAll('clientesAndFornecedoresRoutes', undefined, params)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (err) => this.handleError(err),
        complete: () => this.handleComplete()
      });
  }

  private handleResponse(response: any) {
    if (response.items && Array.isArray(response.items)) {
      this.clientesFornecedores = this.formatTableData(response.items);
    } else {
      this.clientesFornecedores = [];
    }
    this.totalRecords = response.totalCount ?? 0;
    this.tblLazyLoading = false;
    this.spinnerService.hide();
  }

  private handleError(err: any) {
    messageOfReturns(this.messageService, 'error', 'Erro', err.error?.message ?? 'Erro ao tentar registrar esta ação!', 3000);
    this.tblLazyLoading = false;
    this.spinnerService.hide();
  }

  private handleComplete() {
    this.spinnerService.hide();
  }

  private formatTableData(data: any[]): ClientesFornecedoresModel[] {
    return data.map((item) => ({
      ...item,
      dataInclusao: item.dataInclusao ? new Date(item.dataInclusao) : null,
      dataUltimaModificacao: item.dataUltimaModificacao ? new Date(item.dataUltimaModificacao) : null,
      dataInativacao: item.dataInativacao ? new Date(item.dataInativacao) : null,
      enderecos: item.enderecos ?? [this.createEmptyEndereco()],
      contatos: item.contatos ?? [this.createEmptyContato()],
      dadosFinanceiros: item.dadosFinanceiros ?? [this.createEmptyDadoFinanceiro()],
    }));
  }

  public handlePageChange(event: any) {
    this.currentFirstRows = event.first;
    this.currentRowsPerPage = event.rows;
  }

  // Filter methods
  buildFiltersParams(): string {
    const params = new URLSearchParams();

    if (this.filtros.nome) {
      params.append('razaoSocial', this.filtros.nome);
    }

    if (this.filtros.cpfCnpj) {
      params.append('cpfCnpj', this.filtros.cpfCnpj);
    }

    if (this.filtros.tipoCadastro !== null) {
      params.append('tipoCadastro', String(this.filtros.tipoCadastro));
    }

    if (this.filtros.tipoPessoa !== null) {
      params.append('tipoPessoa', String(this.filtros.tipoPessoa));
    }

    if (this.filtros.statusCadastro !== null) {
      params.append('statusCadastro', String(this.filtros.statusCadastro));
    }

    return params.toString();
  }

  filtrar() {
    let queryParams = [];

    if (this.filtros.nome) {
      queryParams.push(`RazaoSocial=${this.filtros.nome}`);
    }

    if (this.filtros.tipoCadastro) {
      queryParams.push(`TipoCadastro=${this.filtros.tipoCadastro}`);
    }

    if (this.filtros.tipoPessoa) {
      queryParams.push(`TipoPessoa=${this.filtros.tipoPessoa}`);
    }

    if (this.filtros.cpfCnpj !== null) {
      queryParams.push(`CpfCnpj=${this.filtros.cpfCnpj}`);
    }

    if (this.filtros.statusCadastro !== null) {
      queryParams.push(`StatusCadastro=${this.filtros.statusCadastro}`);
    }

    this.customQueryParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  limparFiltros() {
    this.filtros = {
      nome: '',
      cpfCnpj: '',
      statusCadastro: null,
      tipoCadastro: null,
      tipoPessoa: null
    };
    this.customQueryParams = undefined;
    this.loadTableData({ first: 0, rows: this.currentRowsPerPage });
  }

  getFiltrosHeader(): string {
    const activeFiltersCount = this.getActiveFilters().length;
    return activeFiltersCount === 0 ? 'Filtros ' :
      activeFiltersCount === 1 ? 'Filtro Ativo: ' : 'Filtros Ativos: ';
  }

  getActiveFilters(): { label: string, value: string }[] {
    const filters = [];

    if (this.filtros.nome) {
      filters.push({ label: 'Nome/Razão Social', value: this.filtros.nome });
    }

    if (this.filtros.tipoCadastro) {
      filters.push({
        label: 'Tipo Cadastro',
        value: this.filtros.tipoCadastro === 1 ? 'Fornecedor' : 'Cliente'
      });
    }

    if (this.filtros.tipoPessoa) {
      filters.push({
        label: 'Tipo Pessoa',
        value: this.filtros.tipoPessoa === 0 ? 'Física' : 'Jurídica'
      });
    }

    if (this.filtros.cpfCnpj) {
      filters.push({ label: 'CPF/CNPJ', value: this.filtros.cpfCnpj });
    }

    if (this.filtros.statusCadastro) {
      filters.push({
        label: 'Status Cadastro',
        value: this.filtros.statusCadastro ? 'Ativo' : 'Inativo'
      });
    }

    return filters;
  }

  showDialog(clienteFornecedor?: ClientesFornecedoresModel) {
    this.isEditando = !!clienteFornecedor;
    this.updateModalTitle();

    if (this.isEditando && clienteFornecedor) {
      this.clienteFornecedor = { ...clienteFornecedor };
      this.atualizarMascaraCPFCNPJ();
      this.isCadastroInativo = !this.clienteFornecedor.statusCadastro;
    } else {
      this.resetForm();
    }

    this.displayModal = true;
  }

  resetForm() {
    this.clienteFornecedor = this.createEmptyClienteFornecedor();
    this.atualizarMascaraCPFCNPJ();
    this.updateModalTitle();
    this.isCadastroInativo = false;
    this.uploadedFiles = [];
  }

  updateModalTitle() {
    const tipo = this.clienteFornecedor.tipoCadastro === 0 ? 'Cliente' : 'Fornecedor';
    this.modalTitle = `${this.isEditando ? 'Editar' : 'Incluir Novo'} ${tipo}`;
  }

  onTipoChange(event: any) {
    this.clienteFornecedor.tipoCadastro = event.value;
    this.updateModalTitle();
  }

  resetTabView() {
    if (this.tabView) {
      this.tabView.activeIndex = 0;
    }
  }

  iniciarEdicao(clienteFornecedor: ClientesFornecedoresModel) {
    this.showDialog(clienteFornecedor);
  }

  confirmarExclusao(clienteFornecedor: ClientesFornecedoresModel) {
    this.clienteFornecedorParaExcluir = clienteFornecedor;
    this.displayConfirmation = true;
  }

  cancelarExclusao() {
    this.displayConfirmation = false;
    this.clienteFornecedorParaExcluir = null;
  }

  confirmarExclusaoDialog() {
    if (this.clienteFornecedorParaExcluir) {
      this.excluirClienteFornecedor(this.clienteFornecedorParaExcluir);
    }
    this.displayConfirmation = false;
    this.clienteFornecedorParaExcluir = null;
  }

  public excluirClienteFornecedor(clienteFornecedor: ClientesFornecedoresModel) {
    this.spinnerService.show();

    this.clienteFornecedorService.delete('clientesAndFornecedoresRoutes', clienteFornecedor.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
          messageOfReturns(
            this.messageService,
            'success',
            'Sucesso',
            clienteFornecedor.tipoCadastro === 0 ? 'Cliente excluído com sucesso' : 'Fornecedor excluído com sucesso',
            3000
          );
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', err.error?.message ?? 'Erro ao tentar registrar esta ação!', 3000);
          this.spinnerService.hide();
        }
      });
  }

  salvarClienteFornecedor() {
    const dadosParaEnviar = this.removeMascaras(this.clienteFornecedor);

    const endereco = dadosParaEnviar.enderecos[0];
    if (!endereco || !endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.uf) {
      messageOfReturns(
        this.messageService,
        'warn',
        'Campos obrigatórios',
        'Por favor, preencha todos os campos obrigatórios do endereço (CEP, Logradouro, Número, Bairro, Cidade e UF)',
        3000
      );
      return;
    }

    this.spinnerService.show();

    if (this.clienteFornecedor.tipoPessoa === 0) {
      dadosParaEnviar.nomeFantasia = null;
      dadosParaEnviar.tipoEmpresa = null;
      dadosParaEnviar.porteEmpresa = null;
      dadosParaEnviar.naturezaJuridica = null;
      dadosParaEnviar.optanteMEI = null;
      dadosParaEnviar.optanteSimples = null;
    }

    if (this.isEditando) {
      dadosParaEnviar.idRespUltimaModificacao = getUserIdFromStorage();
      dadosParaEnviar.nomeRespUltimaModificacao = getUserNameFromStorage();
      dadosParaEnviar.dataUltimaModificacao = new Date();
    } else {
      dadosParaEnviar.idRespInclusao = getUserIdFromStorage();
      dadosParaEnviar.nomeRespInclusao = getUserNameFromStorage();
      dadosParaEnviar.dataInclusao = new Date();
    }

    if (this.isCadastroInativo) {
      dadosParaEnviar.statusCadastro = false;
      dadosParaEnviar.dataInativacao = new Date();
      dadosParaEnviar.idRespInativacao = getUserIdFromStorage();
      dadosParaEnviar.nomeRespInativacao = getUserNameFromStorage();
      dadosParaEnviar.justificativaInativacao = this.clienteFornecedor.justificativaInativacao;
    } else {
      dadosParaEnviar.statusCadastro = true;
    }

    // Processar anexos antes de enviar
    if (dadosParaEnviar.anexos && dadosParaEnviar.anexos.length > 0) {
      // Filtrar apenas anexos válidos (com conteúdo)
      dadosParaEnviar.anexos = dadosParaEnviar.anexos.filter(anexo => 
        anexo.conteudo && anexo.conteudo.trim() !== ''
      );
    }

    const service = this.isEditando
      ? this.clienteFornecedorService.update('clientesAndFornecedoresRoutes', dadosParaEnviar.id, dadosParaEnviar)
      : this.clienteFornecedorService.post('clientesAndFornecedoresRoutes', dadosParaEnviar);

    service
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          const successMessage = `${this.clienteFornecedor.tipoCadastro === ClienteFornecedorEnum.Cliente ? 'Cliente' : 'Fornecedor'} ${this.isEditando ? 'atualizado' : 'cadastrado'} com sucesso`;
          messageOfReturns(this.messageService, 'success', 'Sucesso', successMessage, 3000);
          this.displayModal = false;
          this.loadTableData({ first: this.currentFirstRows, rows: this.currentRowsPerPage });
        },
        error: (err) => {
          messageOfReturns(this.messageService, 'error', 'Erro', err.error?.message ?? 'Erro ao tentar registrar esta ação!', 3000);
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide()
      });
  }

  removeMascaras(clienteFornecedor: ClientesFornecedoresModel): ClientesFornecedoresModel {
    const cleaned = { ...clienteFornecedor };

    if (cleaned.cpfCnpj) cleaned.cpfCnpj = cleaned.cpfCnpj.replace(/\D/g, '');
    if (cleaned.rg) cleaned.rg = cleaned.rg.replace(/\D/g, '');
    if (cleaned.cnae) cleaned.cnae = cleaned.cnae.replace(/\D/g, '');
    if (cleaned.inscricaoEstadual) cleaned.inscricaoEstadual = cleaned.inscricaoEstadual.replace(/\D/g, '');
    if (cleaned.inscricaoMunicipal) cleaned.inscricaoMunicipal = cleaned.inscricaoMunicipal.replace(/\D/g, '');

    if (cleaned.enderecos) {
      cleaned.enderecos = cleaned.enderecos.map(endereco => ({
        ...endereco,
        cep: endereco.cep ? endereco.cep.replace(/\D/g, '') : ''
      }));
    }

    if (cleaned.contatos) {
      cleaned.contatos = cleaned.contatos.map(contato => ({
        ...contato,
        telefone: contato.telefone ? contato.telefone.replace(/\D/g, '') : '',
        celular: contato.celular ? contato.celular.replace(/\D/g, '') : '',
        ramal: contato.ramal ? contato.ramal.replace(/\D/g, '') : ''
      }));
    }

    if (cleaned.dadosFinanceiros) {
      cleaned.dadosFinanceiros = cleaned.dadosFinanceiros.map(dado => ({
        ...dado,
        agencia: dado.agencia ? dado.agencia.replace(/\D/g, '') : '',
        conta: dado.conta ? dado.conta.replace(/\D/g, '') : ''
      }));
    }

    return cleaned;
  }

  atualizarMascaraCPFCNPJ() {
    this.mask = this.clienteFornecedor.tipoPessoa === 0 ? '999.999.999-99' : '99.999.999/9999-99';
    this.cpfCnpjInvalido = false;
  }

  validarCPFCNPJ(): boolean {
    const documento = this.clienteFornecedor.cpfCnpj.replace(/\D/g, '');
    let valido = false;
    let mensagem = '';

    if (this.clienteFornecedor.tipoPessoa === 0) {
      valido = validarCPF(documento);
      mensagem = 'CPF inválido';
    } else {
      valido = validarCNPJ(documento);
      mensagem = 'CNPJ inválido';
    }

    this.cpfCnpjInvalido = !valido;

    if (!valido) {
      messageOfReturns(
        this.messageService,
        'warn',
        mensagem,
        `O ${this.clienteFornecedor.tipoPessoa === 0 ? 'CPF' : 'CNPJ'} informado não é válido`,
        3000
      );
    }

    return valido;
  }

  formatDocument(value: string): string {
    return formataCPFCNPJ(value);
  }

  public async buscarCep(): Promise<void> {
    try {
      const cep = this.clienteFornecedor.enderecos[0].cep;

      if (!cep || cep.replace(/\D/g, '').length !== 8) {
        messageOfReturns(this.messageService, 'warn', 'CEP inválido', 'O CEP deve conter 8 dígitos', 3000);
        return;
      }

      const dadosCep = await this.cepService.buscarCep(cep);

      this.clienteFornecedor.enderecos[0] = {
        ...this.clienteFornecedor.enderecos[0],
        logradouro: dadosCep.logradouro ?? '',
        bairro: dadosCep.bairro ?? '',
        cidade: dadosCep.localidade ?? '',
        uf: dadosCep.uf ?? ''
      };

    } catch (error) {
      messageOfReturns(this.messageService, 'error', 'Erro ao buscar CEP', 'Descrição do erro:' + error, 3000);
    }
  }

  buscarAtividadeCNAE() {
    if (!this.clienteFornecedor.cnae) return;

    const cnaeNumeros = this.clienteFornecedor.cnae.replace(/\D/g, '');

    if (cnaeNumeros.length !== 7) {
      this.clienteFornecedor.atividadeCnae = '';
      return;
    }

    this.spinnerService.show();

    this.cnaeService.buscarAtividadeCnae(cnaeNumeros)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response) => {
          if (response?.descricao) {
            this.clienteFornecedor.atividadeCnae =
              response.descricao.charAt(0).toUpperCase() +
              response.descricao.slice(1).toLowerCase();
          } else {
            messageOfReturns(
              this.messageService,
              'warn',
              'CNAE não encontrado',
              'Não foi possível encontrar a descrição para o CNAE informado',
              3000
            );
            this.clienteFornecedor.atividadeCnae = '';
          }
        },
        error: (err) => {
          messageOfReturns(
            this.messageService,
            'error',
            'Erro ao buscar CNAE',
            err.message ?? 'Ocorreu um erro ao buscar a atividade do CNAE',
            3000
          );
          this.clienteFornecedor.atividadeCnae = '';
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide()
      });
  }

  toggleInativacao(event: any) {
    if (event.checked) {
      this.displayConfirmationforInativacao = true;
      this.tempInativoValue = true;
    } else {
      this.isCadastroInativo = false;
    }
  }

  confirmarInativacaoDialog() {
    this.isCadastroInativo = this.tempInativoValue;
    this.displayConfirmationforInativacao = false;
    this.tempInativoValue = false;
  }

  cancelarInativacao() {
    this.displayConfirmationforInativacao = false;
    this.isCadastroInativo = false;
    this.tempInativoValue = false;
  }

  /*   onUpload(event: FileUploadEvent) {
      this.uploadedFiles = event.files;
      messageOfReturns(this.messageService, 'info', 'Arquivo enviado', 'Arquivo enviado com sucesso', 3000);
    } */

  public exportarParaExcel() {
    this.spinnerService.show();

    const queryParams = this.buildFiltersParams();
    const args = queryParams.split('&');

    this.clienteFornecedorService.exportarExcel('clientesAndFornecedoresRoutes', ['exportar-excel'], ...args)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (blob) => {
          handleExcelExportSuccess(blob, "Relatório de clientes e fornecedores");
          messageOfReturns(this.messageService, 'success', 'Sucesso', 'Dados exportados com sucesso.', 3000);
          this.spinnerService.hide();
        },
        error: (err) => {
          messageOfReturns(
            this.messageService,
            'error',
            'Erro',
            'Falha ao exportar dados para Excel: ' + (err.message ?? 'Erro desconhecido'),
            3000
          );
          this.spinnerService.hide();
        }
      });
  }

  getTipoPessoaSeverity(tipo: TipoPessoaEnum): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return tipo === TipoPessoaEnum.Fisica ? 'info' : 'warning';
  }

  getTipoCadastroSeverity(tipo: ClienteFornecedorEnum): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return tipo === ClienteFornecedorEnum.Cliente ? 'info' : 'warning';
  }

  getTipoPessoa(tipo: TipoPessoaEnum): string {
    return getTipoPessoaText(tipo);
  }

  getTipoCadastro(tipo: ClienteFornecedorEnum): string {
    return getTipoCadastroText(tipo);
  }

  public onFileSelect(event: { files: File[] }): void {
    if (!event.files || event.files.length === 0) {
      return;
    }

    // Limite de 5 arquivos
    if (this.uploadedFiles.length + event.files.length > 5) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Limite de arquivos',
        detail: 'Você pode adicionar no máximo 5 arquivos',
        life: 3000
      });
      return;
    }

    // Validar tamanho dos arquivos (10MB cada)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    const invalidFiles = event.files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo muito grande',
        detail: `Os seguintes arquivos excedem o limite de 10MB: ${invalidFiles.map(f => f.name).join(', ')}`,
        life: 5000
      });
      return;
    }

    // Validar tipos de arquivo permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidTypeFiles = event.files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidTypeFiles.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de arquivo não permitido',
        detail: `Os seguintes arquivos não são permitidos: ${invalidTypeFiles.map(f => f.name).join(', ')}. Formatos aceitos: JPEG, PNG, PDF, DOC, DOCX`,
        life: 5000
      });
      return;
    }

    // Verificar se já existe arquivo com o mesmo nome
    const existingFiles = [...this.uploadedFiles, ...(this.clienteFornecedor.anexos || [])];
    const duplicateFiles = event.files.filter(file => 
      existingFiles.some(existing => existing.name === file.name)
    );

    if (duplicateFiles.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Arquivo duplicado',
        detail: `Os seguintes arquivos já existem: ${duplicateFiles.map(f => f.name).join(', ')}`,
        life: 5000
      });
      return;
    }

    // Adicionar arquivos válidos
    this.uploadedFiles = [...this.uploadedFiles, ...event.files];
    
    this.messageService.add({
      severity: 'info',
      summary: 'Arquivos selecionados',
      detail: `${event.files.length} arquivo(s) selecionado(s) com sucesso`,
      life: 3000
    });
  }

  public removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  public removeExistingAnexo(index: number): void {
    const anexo = this.clienteFornecedor.anexos[index];
    
    this.messageService.add({
      severity: 'info',
      summary: 'Anexo removido',
      detail: `O anexo "${anexo.nome}" foi removido`,
      life: 3000
    });
    
    this.clienteFornecedor.anexos.splice(index, 1);
  }

  public async onUpload(): Promise<void> {
    if (this.uploadedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Nenhum arquivo selecionado para upload',
        life: 3000
      });
      return;
    }

    this.spinnerService.show();

    try {
      const newAnexos = await Promise.all(
        this.uploadedFiles.map(async file => {
          const base64 = await this.fileToBase64(file);
          const extension = file.name.split('.').pop()?.toLowerCase() || '';

          return {
            id: this.isEditando ? undefined : '00000000-0000-0000-0000-000000000000',
            idClienteFornecedor: this.clienteFornecedor.id,
            nome: file.name,
            conteudo: base64.split(',')[1], // Remove o prefixo data:...
            extensao: extension,
            idRespInclusao: getUserIdFromStorage(),
            dataInclusao: new Date(),
            nomeRespInclusao: getUserNameFromStorage()
          } as AnexosModel;
        })
      );

      // Inicializar array de anexos se não existir
      if (!this.clienteFornecedor.anexos) {
        this.clienteFornecedor.anexos = [];
      }

      // Adicionar novos anexos
      this.clienteFornecedor.anexos = [...this.clienteFornecedor.anexos, ...newAnexos];
      this.uploadedFiles = [];

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `${newAnexos.length} arquivo(s) adicionado(s) com sucesso`,
        life: 3000
      });
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao processar os arquivos. Tente novamente.',
        life: 3000
      });
    } finally {
      this.spinnerService.hide();
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  public downloadAnexo(anexo: AnexosModel): void {
    if (!anexo.conteudo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Conteúdo do arquivo não disponível',
        life: 3000
      });
      return;
    }

    const byteCharacters = atob(anexo.conteudo);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: this.getMimeType(anexo.extensao) });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = anexo.nome;
    link.click();

    setTimeout(() => window.URL.revokeObjectURL(link.href), 100);
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  public getFileIcon(extension: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'pi pi-file-pdf',
      'jpg': 'pi pi-image',
      'jpeg': 'pi pi-image',
      'png': 'pi pi-image',
      'doc': 'pi pi-file-word',
      'docx': 'pi pi-file-word'
    };

    return icons[extension.toLowerCase()] || 'pi pi-file';
  }
}