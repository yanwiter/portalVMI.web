import { NotaFiscal } from '../models/notaFiscal.model';

/**
 * Gera XML da Nota Fiscal Eletrônica
 * @param notaFiscal Dados da nota fiscal
 * @returns String XML formatada
 */
export function gerarXmlNotaFiscal(notaFiscal: NotaFiscal): string {
  const dataEmissao = new Date(notaFiscal.dataEmissao).toISOString().split('T')[0];
  const chaveAcesso = gerarChaveAcesso(notaFiscal);
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${notaFiscal.numero.padStart(8, '0')}</cNF>
        <natOp>${notaFiscal.naturezaOperacao}</natOp>
        <indPag>0</indPag>
        <mod>55</mod>
        <serie>${notaFiscal.serie}</serie>
        <nNF>${notaFiscal.numero}</nNF>
        <dhEmi>${new Date(notaFiscal.dataEmissao).toISOString()}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>VMI MÉDICA LTDA</xNome>
        <xFant>VMI MÉDICA</xFant>
        <enderEmit>
          <xLgr>Rua das Flores</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234-567</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderEmit>
        <IE>123456789</IE>
        <IEST>123456789</IEST>
        <IM>123456</IM>
        <CNAE>4751201</CNAE>
        <CRT>1</CRT>
      </emit>
      <dest>
        <CNPJ>${notaFiscal.clienteCnpjCpf?.replace(/\D/g, '') || '00000000000000'}</CNPJ>
        <xNome>${notaFiscal.clienteNome}</xNome>
        <enderDest>
          <xLgr>Endereço do Cliente</xLgr>
          <nro>1</nro>
          <xBairro>Bairro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234-567</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      <det>
        ${gerarItensXml(notaFiscal)}
      </det>
      <total>
        <ICMSTot>
          <vBC>${notaFiscal.valorBaseIcms?.toFixed(2) || '0.00'}</vBC>
          <vICMS>${notaFiscal.valorIcms?.toFixed(2) || '0.00'}</vICMS>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>${notaFiscal.valorTotal?.toFixed(2) || '0.00'}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>${notaFiscal.valorIpi?.toFixed(2) || '0.00'}</vIPI>
          <vPIS>${notaFiscal.valorPis?.toFixed(2) || '0.00'}</vPIS>
          <vCOFINS>${notaFiscal.valorCofins?.toFixed(2) || '0.00'}</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${notaFiscal.valorTotal?.toFixed(2) || '0.00'}</vNF>
          <vTotTrib>0.00</vTotTrib>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <cobr>
        <fat>
          <nFat>NF${notaFiscal.numero}</nFat>
          <vOrig>${notaFiscal.valorTotal?.toFixed(2) || '0.00'}</vOrig>
          <vDesc>0.00</vDesc>
          <vLiq>${notaFiscal.valorTotal?.toFixed(2) || '0.00'}</vLiq>
        </fat>
        <dup>
          <nDup>001</nDup>
          <dVenc>${new Date(notaFiscal.dataVencimento || notaFiscal.dataEmissao).toISOString().split('T')[0]}</dVenc>
          <vDup>${notaFiscal.valorTotal?.toFixed(2) || '0.00'}</vDup>
        </dup>
      </cobr>
      <infAdic>
        <infAdFisco>Nota fiscal eletrônica gerada pelo sistema VMI Médica</infAdFisco>
        <infCpl>${notaFiscal.observacoes || ''}</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>1.0</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${new Date().toISOString()}</dhRecbto>
      <nProt>${gerarProtocolo()}</nProt>
      <digVal>${gerarDigestValue()}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  return xml;
}

/**
 * Gera itens XML da nota fiscal
 * @param notaFiscal Dados da nota fiscal
 * @returns String XML dos itens
 */
function gerarItensXml(notaFiscal: NotaFiscal): string {
  if (!notaFiscal.itens || notaFiscal.itens.length === 0) {
    return '';
  }

  return notaFiscal.itens.map((item, index) => `
        <det nItem="${index + 1}">
          <prod>
            <cProd>${item.produtoCodigo}</cProd>
            <xProd>${item.produtoDescricao}</xProd>
            <NCM>${item.ncm}</NCM>
            <CFOP>${item.cfop}</CFOP>
            <uCom>${item.unidadeComercial}</uCom>
            <qCom>${item.quantidade}</qCom>
            <vUnCom>${item.valorUnitario?.toFixed(2) || '0.00'}</vUnCom>
            <vProd>${item.valorTotal?.toFixed(2) || '0.00'}</vProd>
            <uTrib>${item.unidadeComercial}</uTrib>
            <qTrib>${item.quantidade}</qTrib>
            <vUnTrib>${item.valorUnitario?.toFixed(2) || '0.00'}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <ICMS>
              <ICMS00>
                <orig>0</orig>
                <CST>00</CST>
                <modBC>0</modBC>
                <vBC>${item.valorBaseIcms?.toFixed(2) || '0.00'}</vBC>
                <pICMS>${item.aliquotaIcms?.toFixed(2) || '18.00'}</pICMS>
                <vICMS>${item.valorIcms?.toFixed(2) || '0.00'}</vICMS>
              </ICMS00>
            </ICMS>
            <PIS>
              <CST>01</CST>
              <vBC>${item.valorTotal?.toFixed(2) || '0.00'}</vBC>
              <pPIS>0.65</pPIS>
              <vPIS>${((item.valorTotal || 0) * 0.0065).toFixed(2)}</vPIS>
            </PIS>
            <COFINS>
              <CST>01</CST>
              <vBC>${item.valorTotal?.toFixed(2) || '0.00'}</vBC>
              <pCOFINS>3.00</pCOFINS>
              <vCOFINS>${((item.valorTotal || 0) * 0.03).toFixed(2)}</vCOFINS>
            </COFINS>
          </imposto>
        </det>`).join('');
}

/**
 * Gera chave de acesso da nota fiscal
 * @param notaFiscal Dados da nota fiscal
 * @returns Chave de acesso formatada
 */
function gerarChaveAcesso(notaFiscal: NotaFiscal): string {
  const cUF = '35';
  const aamm = new Date(notaFiscal.dataEmissao).getFullYear().toString().slice(-2) + 
               (new Date(notaFiscal.dataEmissao).getMonth() + 1).toString().padStart(2, '0');
  const cnpj = '12345678000195';
  const mod = '55';
  const serie = notaFiscal.serie.padStart(3, '0');
  const nNF = notaFiscal.numero.padStart(9, '0');
  const tpEmis = '1';
  const cNF = notaFiscal.numero.padStart(8, '0');
  const cDV = '1';
  
  return `${cUF}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}${cDV}`;
}

/**
 * Gera número de protocolo
 * @returns Número de protocolo
 */
function gerarProtocolo(): string {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
}

/**
 * Gera digest value para assinatura
 * @returns Digest value
 */
function gerarDigestValue(): string {
  return 'DigestValue_' + Math.random().toString(36).substring(2, 15);
} 