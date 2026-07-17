# Matriz de formatos

## Princípio

Nem toda conversão é simétrica. JSON, YAML, XML e NDJSON podem representar hierarquias; CSV, TSV e XLSX são predominantemente tabulares. A interface deve classificar cada conversão como direta, configurável ou potencialmente destrutiva.

## Formatos recomendados

| Formato | Prioridade | Uso principal | Observação |
| --- | --- | --- | --- |
| JSON | MVP | APIs e exports de SaaS | Suporta estruturas aninhadas. |
| CSV | MVP | Importação e interoperabilidade | Exige proteção contra formula injection. |
| XLSX | MVP | Planilhas com tipos e múltiplas abas | Preferível a `XLS`, que é legado. |
| TSV | MVP | Dados tabulares com vírgulas no conteúdo | Simples e útil para dados técnicos. |
| YAML | MVP complementar | Configuração e dados legíveis | Preserva hierarquia, mas requer parser seguro. |
| XML | MVP complementar | Sistemas legados e integrações | Desativar entidades externas e DTDs. |
| NDJSON/JSONL | MVP complementar | Logs e grandes coleções | Adequado a processamento em fluxo. |
| TXT delimitado | Depois do MVP | Arquivos com delimitador customizado | Precisa de detecção e configuração. |
| ODS | Depois do MVP | Ecossistema LibreOffice | Menor demanda inicial. |
| Parquet | Avançado | Analytics e grandes volumes | Binário, tipado e mais complexo no navegador. |
| SQL | Avançado | Export/import de bancos | Requer definição de dialeto e esquema. |

## Conversões do MVP

| Origem | Destino | Nível | Regra |
| --- | --- | --- | --- |
| JSON | CSV/TSV | configurável | Escolher array raiz e estratégia de achatamento. |
| JSON | XLSX | configurável | Permitir uma tabela ou múltiplas abas. |
| CSV/TSV | JSON | direta | Gerar array de objetos e inferir tipos com confirmação. |
| XLSX | JSON/CSV/TSV | configurável | Escolher aba, cabeçalho e intervalo. |
| YAML | JSON | direta | Preservar tipos e hierarquia. |
| JSON | YAML | direta | Alertar para tipos ou chaves incompatíveis. |
| XML | JSON | configurável | Definir tratamento de atributos, texto e nós repetidos. |
| JSON | XML | configurável | Definir elemento raiz e nomes válidos. |
| NDJSON | JSON/CSV/XLSX | configurável | Validar cada linha e unir campos. |
| CSV/XLSX | YAML/XML | configurável | Criar estrutura baseada em linhas e colunas. |

## Presets orientados a destino

1. Trello JSON para Asana CSV/XLSX.
2. Notion CSV para planilha limpa.
3. Export de formulário JSON para XLSX.
4. API JSON para CSV/XLSX.
5. Planilha para JSON pronto para API.

Presets só entram como “suportados” depois de testes com exports reais e documentação atual do destino.

## Estratégias para dados aninhados

- `Flatten`: transformar caminhos em colunas, como `member.name`.
- `Serialize`: manter objetos e arrays como JSON dentro da célula.
- `Explode`: criar uma linha por item de uma lista.
- `Separate`: criar abas ou arquivos relacionados com uma chave de ligação.
- `Ignore`: remover o campo somente após confirmação explícita.

## Política de reversibilidade

- Nunca prometer conversão sem perda de forma genérica.
- Registrar tipos inferidos e transformações realizadas.
- Oferecer um relatório de conversão junto ao download quando houver perdas.
- Para conversão de volta, usar um mapa de estrutura salvo pelo usuário quando disponível.

