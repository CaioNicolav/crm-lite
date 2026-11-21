# Instalação e configuração (ambiente próprio)

Esta documentação descreve a lógica original, mas os arquivos publicados **não devem ser importados diretamente sobre um ambiente de produção existente**.

## 1. Planilha

Crie uma planilha Google com aba `Leads` e 28 colunas descritas em `dados-ficticios/esquema-28-colunas.json`. Os arquivos de exemplos contêm **apenas pessoas inventadas**.

## 2. Apps Script

1. Abra o Google Apps Script no seu ambiente de testes.
2. Use o código `src/apps-script/acionador-leads-producao-parametrizado.gs` como referência.
3. Substitua `INSIRA_O_ID_DA_SUA_PLANILHA` pelo ID da sua planilha própria.
4. Configure a conta de Gmail que recebe as notificações do formulário.
5. Ajuste `ASSUNTO`, `MARCADOR`, `ABA` e o fuso horário conforme sua implementação.
6. Autorize os escopos necessários ao projeto sob uma conta adequada.
7. Execute um teste controlado com e-mail fictício e confira a criação de protocolo e a regra de deduplicação.
8. Se aplicável, configure acionador temporal para `processarLeads` com intervalo desejado.

## 3. Formulário

O formulário exportado em `config/fluent-forms/formulario-varejo.json` corresponde ao ID 4. O endereço destinatário das notificações foi substituído por `crm@example.org` na cópia pública. Ao importar em ambiente próprio, revise todas as notificações e o redirecionamento de confirmação.

## 4. GTM

As versões em `config/gtm/` documentam a evolução técnica. Os identificadores das contas de mídia nelas contidos são os da referência original; **não importe esses contêineres em sites alheios nem os utilize para enviar eventos**. Para reproduzir, recrie as tags com IDs sob sua própria titularidade e teste com Tag Assistant.

## 5. Landing pages

Os arquivos `landing-pages/revendedor.html` e `landing-pages/distribuidor.html` são capturas de navegador. Podem depender de fontes, imagens, scripts e endpoints do WordPress original. Foram removidos tokens temporários do Google, nonces de formulário e endereço de contato de uma cópia pública; essas alterações não representam um deploy funcional.

## 6. Operação

Os status da planilha permitem acompanhamento manual da evolução de cada oportunidade. Não foi demonstrado sincronismo bidirecional com as plataformas de anúncios ou integração com outro CRM.
