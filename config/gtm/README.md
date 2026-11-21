# Google Tag Manager — histórico de versões

- `versao-2.json`: conversões Google Ads das duas LPs.
- `versao-3.json`: inclusão do Meta Pixel e eventos Lead.
- `versao-4.json`: correção do timing da captura UTM.
- `versao-5.json`: identificação da LP por `window.LP_ORIGEM`.
- `versao-6.json`: configuração cumulativa com eventos de inscrição da Live.

A **versão 6** é a referência final exportada em 21/11/2026. A funcionalidade da Live não faz parte do escopo principal do CRM Lite.

As duas LPs têm tags Google Ads/Meta acionadas por páginas de confirmação específicas. O export não comprova sozinho a recepção na plataforma; consulte `docs/testes.md`.

**Importante:** os JSONs contêm IDs de contas de marketing da implementação original. Não os importe em sites alheios sem substituir os IDs e revisar permissões.
