# Teste simples da base de demonstração
import csv
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "dados-ficticios" / "leads-exemplos.csv"
with PATH.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))
assert rows, "A base de exemplo deve conter linhas"
assert len(rows[0].keys()) == 28, "Esquema deve possuir 28 colunas"
for row in rows:
    assert not row["CNPJ"], "Nenhum documento real deve constar"
    assert row["E-mail"].endswith("@example.org"), "Use apenas endereços de exemplo"
    assert row["Telefone"] == "(00) 00000-0000", "Use apenas telefone inválido"
    assert row["Protocolo"].startswith("LEAD-"), "Protocolo obrigatório"
print(f"{len(rows)} registros de demonstração aprovados")
