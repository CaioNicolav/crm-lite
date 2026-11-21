# Formulário de varejo — Fluent Forms

**ID:** 4  
**Título exportado:** QUERO SER UM REVENDEDOR - MENZOIL  
**Estado:** published

O formulário recebe nome, e-mail, telefone, estado, cidade, CNPJ, volume de compra, segmento e interesse comercial. Possui campos ocultos de origem e atribuição, incluindo UTMs, GCLID e FBCLID.

## Integração

- Assunto da notificação: `Revendedor - Formulario LP`.
- Confirmação: redireciona a `/obrigado-pelo-cadastro-varejo/`.
- O Apps Script encontra a notificação usando o assunto configurado.
- O GTM associa a página de confirmação aos eventos de lead Google Ads e Meta Pixel.

## Observações técnicas

- O formulário publicado permitia E-mail e CNPJ sem obrigatoriedade.
- Uma pergunta menciona a opção “OUTROS”, inexistente entre as alternativas da versão exportada.
- A área de texto dessa pergunta não tinha um nome técnico atribuído.
- O destinatário do e-mail da exportação pública foi substituído por um endereço de exemplo.

O arquivo JSON é uma exportação de definição de formulário, **não contém respostas reais**.
