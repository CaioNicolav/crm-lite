/**
 * AUTOMAÇÃO GRATUITA: Gmail (Fluent Forms) -> Planilha-Ponte Leads Menzoil — CAMPANHAS
 * (nomes com sufixo "Campanha" para conviver com o script dos leads orgânicospraça (uf)
 *  no mesmo projeto, em outro arquivo .gs, sem conflito)
 * ------------------------------------------------------------------------
 * Roda dentro do Google Sheets (Extensões > Apps Script).
 * Busca e-mails com o assunto configurado, extrai os campos e
 * adiciona uma linha nova na aba "Leads". Cada e-mail processado recebe
 * o marcador "Lead-Processado" no Gmail para nunca ser lançado duas vezes.
 */

// ========================= CONFIGURAÇÃO =========================
const CFG_CAMPANHA = {
  PLANILHA_ID: 'INSIRA_O_ID_DA_SUA_PLANILHA', // trecho da URL entre /d/ e /edit
  ASSUNTO: 'Revendedor - Formulario LP',  // <-- troque
  REMETENTE: '',            // opcional: ex. 'crm@example.org'
  ABA: 'Leads',
  MARCADOR: 'Lead-Processado',
  DIAS_BUSCA: 30,           // só olha e-mails dos últimos X dias
  FUSO: 'America/Sao_Paulo',

  // Coluna da planilha -> possíveis rótulos do campo no e-mail.
  // Se o rótulo no e-mail for diferente, basta adicionar na lista.
  CAMPOS: {
    'Empresa':       ['empresa', 'nome da empresa', 'razao social'],
    'CNPJ':          ['cnpj'],
    'Estado':    ['estado', 'praca', 'praca (uf)', 'uf'],
    'Cidade':        ['cidade'],
    'Segmento':      ['qual seu segmento', 'segmento', 'ramo'],
    'Volume Médio':  ['qual a media de litros em lubrificantes costuma comprar', 'volume medio', 'volume'],
    'Interesse':     ['interesse', 'tipo de interesse'],
    'Nome Contato':  ['name', 'nome', 'nome contato', 'nome do contato', 'seu nome'],
    'Telefone':      ['telefone', 'whatsapp', 'celular', 'telefone/whatsapp'],
    'E-mail':        ['e-mail', 'email', 'seu e-mail'],
    'LP Origem':     ['lp origem', 'lp', 'origem', 'landing page'],
    'UTM Source':    ['utm source', 'utm_source'],
    'UTM Medium':    ['utm medium', 'utm_medium'],
    'UTM Campaign':  ['utm campaign', 'utm_campaign'],
    'UTM Content':   ['utm content', 'utm_content'],
    'UTM Term':      ['utm term', 'utm_term'],
    'GCLID':         ['gclid'],
    'FBCLID':        ['fbclid'],
    'Protocolo':     ['protocolo'],
    'Observações':   ['deseja falar com nossa equipe comercial'],
  },
};
// ================================================================


/** Função principal — é ela que o gatilho executa. */
function processarLeads() {
  const aba = SpreadsheetApp.openById(CFG_CAMPANHA.PLANILHA_ID).getSheetByName(CFG_CAMPANHA.ABA);
  if (!aba) throw new Error('Aba "' + CFG_CAMPANHA.ABA + '" não encontrada.');

  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  const marcador = GmailApp.getUserLabelByName(CFG_CAMPANHA.MARCADOR) ||
                   GmailApp.createLabel(CFG_CAMPANHA.MARCADOR);

  // Protocolos já existentes (proteção extra contra duplicidade)
  const ultima = aba.getLastRow();
  const existentes = new Set(
    ultima > 1 ? aba.getRange(2, 1, ultima - 1, 1).getValues().flat().map(String) : []
  );

  let busca = 'subject:"' + CFG_CAMPANHA.ASSUNTO + '" -label:' + CFG_CAMPANHA.MARCADOR +
              ' newer_than:' + CFG_CAMPANHA.DIAS_BUSCA + 'd';
  if (CFG_CAMPANHA.REMETENTE) busca += ' from:' + CFG_CAMPANHA.REMETENTE;
  busca += ' -from:mailer-daemon -from:postmaster';

  const threads = GmailApp.search(busca, 0, 50);
  const novasLinhas = [];
  const threadsParaMarcar = [];

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      if (!ehEmailDoFormularioCampanha(msg)) return;   // ignora bounces, respostas etc.

      const dados = extrairCamposCampanha(msg);
      if (!temDadosDeLeadCampanha(dados)) return;      // e-mail sem campos do formulário
      if (existentes.has(dados['Protocolo'])) return;
      existentes.add(dados['Protocolo']);

            novasLinhas.push(cabecalho.map(function (col) {
        const chave = Object.keys(dados).find(function (k) {
          return normalizarCampanha(k) === normalizarCampanha(col);
        });
        return chave ? dados[chave] : '';
      }));
    });
    threadsParaMarcar.push(thread);
  });

  if (novasLinhas.length) {
    aba.getRange(aba.getLastRow() + 1, 1, novasLinhas.length, cabecalho.length)
       .setValues(novasLinhas);
    SpreadsheetApp.flush(); // força a gravação agora; se falhar, nada é marcado
  }
  // Só marca no Gmail DEPOIS que a planilha gravou com sucesso
  threadsParaMarcar.forEach(function (t) { t.addLabel(marcador); });
  console.log(novasLinhas.length + ' lead(s) adicionado(s).');
}


/** true só para o e-mail original do Fluent Forms (não bounce, resposta ou encaminhamento). */
function ehEmailDoFormularioCampanha(msg) {
  const de = msg.getFrom().toLowerCase();
  if (/mailer-daemon|postmaster|mail delivery|microsoftexchange/.test(de)) return false;
  const assunto = msg.getSubject().trim();
  if (assunto.indexOf(CFG_CAMPANHA.ASSUNTO) === -1) return false;
  if (/^(re|res|fw|fwd|enc|undeliverable|n[aã]o entregue|delivery status)\b/i.test(assunto)) return false;
  return true;
}

/** Exige pelo menos nome, e-mail ou telefone para considerar um lead válido. */
function temDadosDeLeadCampanha(dados) {
  return Boolean(dados['Nome Contato'] || dados['E-mail'] || dados['Telefone']);
}

/** Lê o corpo do e-mail e devolve {nomeDaColuna: valor}. */
function extrairCamposCampanha(msg) {
  const linhas = htmlParaLinhasCampanha(msg.getBody() || msg.getPlainBody());
  const dados = {};

  // Índice rótulo normalizado -> coluna
  const indice = {};
  Object.keys(CFG_CAMPANHA.CAMPOS).forEach(function (col) {
    CFG_CAMPANHA.CAMPOS[col].forEach(function (r) { indice[normalizarCampanha(r)] = col; });
  });

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Formato 1: "Rótulo: valor" na mesma linha
    const m = linha.match(/^([^:]{1,40}):\s*(.+)$/);
    if (m && indice[normalizarCampanha(m[1])] && !dados[indice[normalizarCampanha(m[1])]]) {
      dados[indice[normalizarCampanha(m[1])]] = m[2].trim();
      continue;
    }
    // Formato 2 (padrão Fluent Forms {all_data}): rótulo numa linha, valor na seguinte
    const col = indice[normalizarCampanha(linha)];
    if (col && !dados[col] && i + 1 < linhas.length && !indice[normalizarCampanha(linhas[i + 1])]) {
      dados[col] = linhas[i + 1].trim();
      i++;
    }
  }

  // Campos automáticos
  const data = msg.getDate();
  const hoje = Utilities.formatDate(data, CFG_CAMPANHA.FUSO, 'yyyy-MM-dd');
  if (!dados['Protocolo']) {
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, msg.getId())
      .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
      .join('').slice(0, 4).toUpperCase();
    dados['Protocolo'] = 'LEAD-' + hoje.replace(/-/g, '') + '-' + hash;
  }
  dados['Data Envio'] = hoje;
  dados['Status'] = 'Novo';
  dados['Data Status Atualizado'] = hoje;

  // Ajustes para bater com os dropdowns da planilha
  if (dados['Estado']) {
    // "São Paulo — SP" -> "SP"
        dados['Estado'] = dados['Estado'].split(/\s*[—–-]\s*[A-Z]{2}\s*$/)[0].trim();
  }
  if (dados['LP Origem']) {
    const lp = dados['LP Origem'].toUpperCase();
    dados['LP Origem'] = lp.indexOf('DISTRIB') > -1 ? 'DISTRIB' : 'VAREJO';
  }
  // CNPJ: 66750832000133 -> 66.750.832/0001-33
  const cnpj = (dados['CNPJ'] || '').replace(/\D/g, '');
  if (cnpj.length === 14) {
    dados['CNPJ'] = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  // Telefone: 11980424672 -> (11) 98042-4672
  const tel = (dados['Telefone'] || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (tel.length === 11) dados['Telefone'] = tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  else if (tel.length === 10) dados['Telefone'] = tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  if (dados['Observações']) dados['Observações'] = 'Falar c/ comercial: ' + dados['Observações'];
  // Evita que o Sheets transforme telefone/CNPJ em número ou fórmula
  ['CNPJ', 'Telefone'].forEach(function (c) { if (dados[c]) dados[c] = "'" + dados[c]; });

  return dados;
}


/** Converte o HTML do e-mail em uma lista de linhas de texto limpas. */
function htmlParaLinhasCampanha(html) {
  const texto = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(td|th|tr|p|div|li|h\d)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"');
  return texto.split('\n').map(function (l) { return l.trim(); }).filter(String);
}

/** Minúsculas, sem acentos, sem * e : no fim. */
function normalizarCampanha(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[*:?]+\s*$/, '').replace(/\s+\?/, '').replace(/\s+/g, ' ').trim();
}


// ===================== UTILITÁRIOS =====================

/** Rode UMA vez: cria o gatilho que executa a cada 10 minutos. */
function instalarGatilho() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processarLeads') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processarLeads').timeBased().everyMinutes(10).create();
  console.log('Gatilho criado: processarLeads a cada 10 minutos.');
}

/** Teste sem gravar nada: mostra no log o que seria extraído do último e-mail. */
function testarUltimoEmail() {
  const threads = GmailApp.search('subject:"' + CFG_CAMPANHA.ASSUNTO + '"', 0, 10);
  let msg = null;
  for (const t of threads) {
    msg = t.getMessages().reverse().find(ehEmailDoFormularioCampanha);
    if (msg) break;
  }
  if (!msg) { console.log('Nenhum e-mail do formulário encontrado com esse assunto.'); return; }
  console.log('De: ' + msg.getFrom() + ' | Assunto: ' + msg.getSubject());
  console.log('--- LINHAS DO E-MAIL ---\n' + htmlParaLinhasCampanha(msg.getBody()).join('\n'));
  console.log('--- CAMPOS EXTRAÍDOS ---\n' + JSON.stringify(extrairCamposCampanha(msg), null, 2));
}

/** Emergência: tira o marcador de todos os e-mails para reprocessá-los. */
function desfazerMarcadores() {
  const m = GmailApp.getUserLabelByName(CFG_CAMPANHA.MARCADOR);
  if (!m) return;
  let t;
  while ((t = m.getThreads(0, 100)).length) m.removeFromThreads(t);
  console.log('Marcadores removidos.');
}