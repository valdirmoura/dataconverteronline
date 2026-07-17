# Notas de arquitetura

## Direção recomendada

Arquitetura híbrida com preferência por processamento local:

- Frontend web responsável por upload, detecção, prévia, mapeamento e conversões compatíveis com memória do navegador.
- Web Worker para impedir que arquivos médios bloqueiem a interface.
- Backend isolado apenas para formatos, tamanhos ou operações que não sejam seguros ou viáveis no navegador.
- Armazenamento temporário opcional com expiração automática, criptografia e logs sem conteúdo.

## Componentes lógicos

- `file-intake`: valida arquivo, tipo e limites.
- `format-detector`: identifica formato, codificação e estrutura.
- `schema-profiler`: identifica campos, tipos, profundidade e irregularidades.
- `mapping-engine`: aplica renomeações, seleção e estratégias de aninhamento.
- `converter-core`: adaptadores de leitura e escrita por formato.
- `preset-engine`: regras versionadas para destinos conhecidos.
- `validation-engine`: detecta perdas, coerções e riscos.
- `exporter`: gera o arquivo e o relatório de transformação.

## Modelo de adaptadores

Todo formato deve implementar:

- `detect(input)`
- `parse(input, options)`
- `profile(data)`
- `serialize(data, options)`
- `validate(data, options)`

O núcleo deve trabalhar com uma representação intermediária que suporte tabelas e árvores, evitando transformar tudo prematuramente em linhas e colunas.

## Segurança

- Neutralizar células iniciadas por `=`, `+`, `-` ou `@` em exports tabulares quando representarem texto não confiável.
- Desativar DTD e resolução de entidades externas em XML.
- Limitar profundidade, número de chaves, linhas, colunas e tamanho expandido.
- Rejeitar arquivos protegidos por senha no MVP.
- Não abrir macros nem recalcular fórmulas recebidas.
- Isolar processamento pesado e aplicar timeout.
- Nunca registrar valores dos arquivos em analytics ou logs de erro.

## Decisões técnicas ainda abertas

- Framework web e runtime do backend.
- Bibliotecas de parsing e geração por formato.
- Limites gratuitos e limite máximo absoluto.
- Conversão local versus servidor por formato.
- Persistência opcional de receitas de mapeamento.
- Hospedagem e região de dados.

