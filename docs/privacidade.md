# Tratamento de dados na publicação pública

**Nenhum registro de lead real foi incluído neste repositório.**

## Dados fictícios

A base de demonstração contém somente registros inventados. Campos de empresa/CNPJ estão vazios; telefones usam o número inválido `(00) 00000-0000`; e-mails usam o domínio de exemplo `example.org`; protocolos e identificadores de campanha são de teste.

## Preservação técnica e exclusões

Para manter a análise reproduzível, publicamos a estrutura das páginas, o processamento Apps Script, as versões do GTM e a definição do formulário de varejo. Antes da publicação, substituímos:
- O ID da planilha real por `INSIRA_O_ID_DA_SUA_PLANILHA`.
- Endereços de e-mail de contato encontrados no script e na exportação do formulário por `crm@example.org`.
- Tokens Google OAuth encontrados nos HTMLs de navegador por `TOKEN_OAUTH_REMOVIDO`.
- Nonces de formulário da captura HTML por placeholders.

As configurações do GTM mantêm IDs técnicos das tags de marketing e URLs da referência. Esses valores não devem ser reutilizados em contas externas.

## Avisos

Este repositório não disponibiliza uma base de leads reais, arquivos de sessão do navegador, credenciais operacionais ou backup do banco WordPress. A presença de referências a marca/identidade de terceiros decorre dos arquivos técnicos fornecidos; publicação de ativos corporativos depende dos direitos de seus titulares.
