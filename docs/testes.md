# Testes e evidências

## Teste real observado no Tag Assistant — 21/11/2026

**Cenário:** abrir a LP de varejo no GTM Preview, preencher o formulário com valores de teste, enviar e verificar a página de confirmação.

| Etapa | Evidência observada |
|---|---|
| Conexão do navegador com GTM-MBNGKQS2 | Conectado |
| Página de agradecimento de varejo | Aberta após envio |
| Google Ads — Lead Varejo | Disparou 1 vez |
| Meta Pixel — Lead Varejo | Disparou 1 vez |
| Conversion Linker Global | Disparado |
| Meta Pixel Base | Disparado |
| GA4 Base | Disparada |
| UTM Capture Global | Disparada |
| LP Origem Global | Disparada |

**Limite:** essas evidências são de execução do Tag Assistant. Não comprovam, isoladamente, que o Google Ads e o Meta Ads registraram e atribuíram uma conversão na plataforma.

## Automação de e-mails e planilha

Foram observados testes de notificação Gmail com etiqueta de processado e registro correspondente na Planilha-Ponte, com protocolo e campos de origem. Os casos públicos em `dados-ficticios/` são **ficcionais**, não cópias de pessoas atendidas.

## Pendências / melhorias possíveis

- Validar separadamente as conversões no painel Google Ads/Meta.
- Revisar obrigatoriedade e validação dos campos E-mail e CNPJ.
- Corrigir a pergunta de texto que menciona a opção “OUTROS” sem essa opção correspondente no formulário de varejo.
- Implementar e testar identificadores de protocolo com maior resistência a colisões, se necessário.
