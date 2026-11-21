/**
 * AUTOMAÇÃO DE LEADS DE CAMPANHA - MENZOIL (Revendedor/Varejo)
 * ---------------------------------------------------
 * VERSÃO FINAL (com todas as correções dos testes)
 *
 * 1. Procura no Gmail os e-mails do formulário "Revendedor - Formulario LP"
 * 2. Em cada thread, localiza a mensagem que contém os dados do formulário
 *    (ignora bounces/respostas automáticas que entram na mesma thread)
 * 3. Extrai todos os pares rótulo/valor do HTML (field-label / field-value)
 * 4. Gera Protocolo único e Data de Envio automaticamente
 * 5. Insere a linha na Planilha-Ponte casando pelo NOME da coluna
 * 6. Marca a thread com label no Gmail para nunca processar 2x
 * 7. Roda a cada 30 minutos (função criarGatilhos)
 *
 * COMO CONFIGURAR:
 * 1. Preencha ID_PLANILHA com o ID da planilha (URL: .../d/AQUI-O-ID/edit)
 * 2. Confirme NOME_ABA com o nome exato da aba de leads
 * 3. Rode "testarExtracaoUmEmail" para conferir a leitura (não grava nada)
 * 4. Rode "processarLeadsLP" uma vez manualmente
 * 5. Rode "criarGatilhos" uma vez para deixar automático
 */

// ============ CONFIGURAÇÕES ============

const FILTRO_BUSCA_GMAIL = 'from:crm@example.org subject:"Revendedor - Formulario LP"';
const LABEL_PROCESSADO = 'Leads-LP-Processados-v2';

const ID_PLANILHA = 'COLE_AQUI_O_ID_DA_PLANILHA';
const NOME_ABA = 'Leads';

// Rótulo do campo NO E-MAIL (exatamente como aparece) -> nome EXATO da coluna na planilha
const MAPEAMENTO_COLUNAS = {
  'Name':                                                      'Nome Contato',
  'E-mail':                                                    'E-mail',
  'CNPJ':                                                      'CNPJ',
  'Telefone':                                                  'Telefone',
  'Estado':                                                    'Praça (UF)',
  'Cidade':                                                    'Cidade',
  'Qual a média de litros em lubrificantes costuma comprar ?': 'Volume Médio',
  'Qual seu segmento ?':                                       'Segmento',
  'Deseja falar com nossa equipe comercial?':                  'Interesse',
  'UTM Source':                                                'UTM Source',
  'UTM Medium':                                                'UTM Medium',
  'UTM Campaign':                                               'UTM Campaign',
  'UTM Content':                                                'UTM Content',
  'UTM Term':                                                   'UTM Term',
  'GCLID':                                                      'GCLID',
  'FBCLID':                                                     'FBCLID',
  'LP Origem':                                                  'LP Origem',
};

const COLUNA_PROTOCOLO = 'Protocolo';
const COLUNA_DATA_ENVIO = 'Data Envio';

// ============ FUNÇÃO PRINCIPAL ============

function processarLeadsLP() {
  const label = getOrCreateLabel_(LABEL_PROCESSADO);
  const query = FILTRO_BUSCA_GMAIL + ' -label:' + LABEL_PROCESSADO.replace(/\s+/g, '-');
  const threads = GmailApp.search(query, 0, 50);

  if (threads.length === 0) {
    Logger.log('Nenhum e-mail novo encontrado.');
    return;
  }

  const ss = SpreadsheetApp.openById(ID_PLANILHA);
  const aba = ss.getSheetByName(NOME_ABA);
  if (!aba) {
    throw new Error('Aba "' + NOME_ABA + '" não encontrada. Confira NOME_ABA.');
  }

  const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  let totalInseridos = 0;
  let totalSemDados = 0;
  let totalComErro = 0;

  threads.forEach(thread => {
    try {
      const mensagens = thread.getMessages();

      // Pega a mensagem que realmente contém os dados do formulário,
      // ignorando bounces (erro de entrega) que entram na mesma thread.
      const msg = mensagens.find(m => m.getBody().indexOf('field-label') !== -1);

      if (!msg) {
        totalSemDados++;
        Logger.log('Thread sem mensagem de formulário (provável bounce), pulada: ' + thread.getId());
        return;
      }

      const campos = extrairCampos_(msg.getBody());
      const algumPreenchido = Object.keys(MAPEAMENTO_COLUNAS).some(k => campos[k]);

      if (!algumPreenchido) {
        totalSemDados++;
        Logger.log('Mensagem sem nenhum campo reconhecido, pulada: ' + msg.getId());
        return;
      }

      const dataEmail = msg.getDate();
      const linha = new Array(cabecalho.length).fill('');

      for (const [campoEmail, nomeColuna] of Object.entries(MAPEAMENTO_COLUNAS)) {
        const idx = cabecalho.indexOf(nomeColuna);
        if (idx !== -1) {
          linha[idx] = campos[campoEmail] || '';
        }
      }

      const idxProtocolo = cabecalho.indexOf(COLUNA_PROTOCOLO);
      if (idxProtocolo !== -1) {
        linha[idxProtocolo] = gerarProtocolo_(dataEmail);
      }

      const idxDataEnvio = cabecalho.indexOf(COLUNA_DATA_ENVIO);
      if (idxDataEnvio !== -1) {
        linha[idxDataEnvio] = dataEmail;
      }

      aba.appendRow(linha);
      totalInseridos++;
      thread.addLabel(label);
    } catch (erro) {
      totalComErro++;
      Logger.log('Erro ao processar uma thread, será tentada novamente depois: ' + erro);
    }
  });

  Logger.log('Inseridos: ' + totalInseridos + ' | Sem dados (puladas): ' + totalSemDados + ' | Com erro: ' + totalComErro);
}

// ============ PROTOCOLO ============

function gerarProtocolo_(data) {
  const timestamp = Utilities.formatDate(data, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const sufixoAleatorio = Math.floor(Math.random() * 900 + 100);
  return 'REV-' + timestamp + '-' + sufixoAleatorio;
}

// ============ EXTRAÇÃO ============

function extrairCampos_(html) {
  const resultado = {};

  const padrao = /<tr class="field-label"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>[\s\S]*?<\/tr>\s*<tr class="field-value"[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;

  let match;
  while ((match = padrao.exec(html)) !== null) {
    const rotulo = limparHtml_(match[1]);
    const valor = limparHtml_(match[2]);
    resultado[rotulo] = valor;
  }

  return resultado;
}

function limparHtml_(texto) {
  return texto
    .replace(/<li[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function getOrCreateLabel_(nome) {
  let label = GmailApp.getUserLabelByName(nome);
  if (!label) label = GmailApp.createLabel(nome);
  return label;
}

// ============ AGENDAMENTO (a cada 30 minutos) ============

function criarGatilhos() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'processarLeadsLP') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('processarLeadsLP')
    .timeBased()
    .everyMinutes(30)
    .create();

  Logger.log('Gatilho criado: a cada 30 minutos.');
}

function listarGatilhos() {
  ScriptApp.getProjectTriggers().forEach(t => {
    Logger.log(t.getHandlerFunction() + ' - ' + t.getTriggerSource());
  });
}

// ============ DIAGNÓSTICO ============

function depurarUmEmail() {
  const threads = GmailApp.search(FILTRO_BUSCA_GMAIL, 0, 1);
  if (threads.length === 0) {
    Logger.log('Nenhum e-mail encontrado com esse filtro.');
    return;
  }
  Logger.log(threads[0].getMessages()[0].getBody());
}

// Testa a extração em UM e-mail (o primeiro que tiver dados de formulário)
// sem gravar nada na planilha.
function testarExtracaoUmEmail() {
  const threads = GmailApp.search(FILTRO_BUSCA_GMAIL, 0, 10);
  for (const thread of threads) {
    const msg = thread.getMessages().find(m => m.getBody().indexOf('field-label') !== -1);
    if (msg) {
      Logger.log(JSON.stringify(extrairCampos_(msg.getBody()), null, 2));
      return;
    }
  }
  Logger.log('Nenhuma mensagem com dados de formulário encontrada nas últimas 10 threads.');
}