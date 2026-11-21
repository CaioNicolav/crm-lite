# Scripts de tracking — GTM

- `utm-capture.gtm.html`: identifica `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid` e `fbclid`; salva em cookies de 90 dias; preenche campos ocultos em formulário.
- `lp-origem.gtm.html`: define `window.LP_ORIGEM` como varejo ou distribuidor de acordo com o caminho da página.

Esses scripts foram extraídos das tags HTML personalizadas da versão 6 do GTM. O formulário deve disponibilizar `input[name]` compatíveis com a implementação.
