# Project Brief — Data Converter Online

## Contexto

O projeto surgiu durante a migração de um quadro do Trello para o Asana. O Trello exportou JSON, enquanto o Asana aceitava CSV, XLSX e TXT. Uma transformação simples de formato não bastava: era necessário mapear listas, cartões, descrições, datas, etiquetas, responsáveis e checklists para a estrutura esperada pelo destino.

## Hipótese de problema

Usuários não técnicos perdem tempo, dados e confiança quando precisam transferir informações entre ferramentas que usam formatos ou estruturas incompatíveis.

## Hipótese de solução

Uma ferramenta web que detecta a estrutura do arquivo, mostra uma prévia, permite mapear campos e gera um resultado adequado ao formato ou aplicativo de destino reduz esforço e erros de migração.

## Proposta de valor

“Converta seus dados para um arquivo que a ferramenta de destino realmente consiga usar, com prévia, mapeamento e avisos claros sobre o que será preservado.”

## Segmento inicial

Profissionais e pequenas equipes migrando dados entre ferramentas SaaS, começando por gestão de projetos e produtividade.

## Jobs to be done

- Quando uma plataforma não aceita meu arquivo, quero convertê-lo sem programar.
- Quando os dados são aninhados, quero decidir como eles serão organizados.
- Quando posso perder informação, quero saber antes de baixar o resultado.
- Quando migro entre ferramentas conhecidas, quero um modelo pronto para o destino.

## Escopo do MVP

- Upload por arrastar e soltar.
- Detecção de formato e codificação.
- Prévia tabular dos dados.
- JSON, CSV, XLSX e TSV como formatos principais.
- YAML, XML e NDJSON como formatos complementares.
- Escolha do objeto ou array a ser convertido em tabela.
- Mapeamento, renomeação e ordenação de colunas.
- Estratégias para dados aninhados: achatar, serializar ou separar.
- Validação antes da exportação.
- Download do arquivo convertido.
- Preset Trello JSON para Asana XLSX/CSV.
- Processamento local no navegador para arquivos compatíveis com esse modelo.

## Não objetivos do MVP

- Substituir ferramentas completas de ETL.
- Garantir reversibilidade perfeita entre formatos tabulares e hierárquicos.
- Fazer login nas plataformas do usuário.
- Armazenar arquivos indefinidamente.
- Suportar documentos, imagens, áudio ou vídeo.

## Premissas

- Nome e domínio ainda serão escolhidos.
- Conteúdo e interface serão inicialmente em português, preparados para inglês.
- O modelo gratuito terá limites de tamanho e uso ainda não definidos.
- O produto será independente, mas seguirá as diretrizes visuais do Anmaru enquanto não houver marca própria.

## Critérios de sucesso do MVP

- Pelo menos 80% dos usuários de teste concluem uma conversão sem ajuda.
- Pelo menos 95% das conversões válidas geram arquivo que abre corretamente.
- O usuário entende os avisos de perda antes de exportar.
- O preset Trello para Asana importa cartões, seções, datas e descrições corretamente em testes reais.
- Nenhum arquivo de usuário fica retido além da política declarada.

## Riscos principais

- A expressão “converter formato” esconder diferenças estruturais difíceis de resolver.
- Arquivos grandes travarem o navegador ou elevarem custos do servidor.
- Fórmulas maliciosas em CSV/XLSX causarem CSV injection.
- XML vulnerável, arquivos compactados ou conteúdo inesperado causarem ataques.
- Usuários presumirem reversibilidade sem perda.
- Presets quebrarem quando plataformas alterarem seus importadores.

