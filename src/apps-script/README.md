# Automação de leads — Apps Script

**Rotina:** `processarLeads`

Lê notificações de formulários na caixa do Gmail, extrai campos do e-mail, verifica duplicidade, gera protocolo, insere os registros na aba `Leads` da planilha e aplica etiqueta à mensagem processada.

Arquivos:
- `acionador-leads-producao-parametrizado.gs`: base original do acionador temporal, com ID de planilha substituído por placeholder.
- `automacao-leads-referencia.gs`: outra versão original de referência, igualmente parametrizada.

**Atenção:** são alternativas históricas da mesma automação, não scripts para executar simultaneamente. Utilize a versão mais recente em um projeto próprio e revise o comportamento antes de instalar o acionador.

É necessário configurar `PLANILHA_ID` localmente e usar uma conta de Gmail autorizada. Não há credenciais ou registros reais neste repositório.
