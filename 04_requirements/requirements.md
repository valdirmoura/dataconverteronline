# Requisitos do MVP

## Requisitos funcionais

### Entrada e detecção

- RF-01: aceitar upload por seletor e arrastar e soltar.
- RF-02: validar extensão, MIME, assinatura e tamanho.
- RF-03: detectar formato, codificação, delimitador, cabeçalho e tipos prováveis.
- RF-04: rejeitar arquivos inválidos com mensagem acionável.

### Exploração e transformação

- RF-05: exibir uma prévia limitada antes do processamento completo.
- RF-06: permitir escolher aba, intervalo, objeto ou array raiz.
- RF-07: permitir renomear, reordenar, incluir e excluir campos.
- RF-08: permitir selecionar a estratégia para objetos e listas aninhadas.
- RF-09: mostrar avisos sobre perdas, coerções, truncamentos e linhas inválidas.
- RF-10: preservar datas, booleanos e números sempre que o destino permitir.
- RF-11: permitir configurar delimitador, decimal, data e codificação quando aplicável.

### Exportação

- RF-12: gerar JSON, CSV, XLSX, TSV, YAML, XML e NDJSON conforme a matriz aprovada.
- RF-13: gerar nomes de arquivo claros e manter o original intacto.
- RF-14: permitir baixar relatório resumido da transformação.
- RF-15: oferecer preset Trello para Asana.

### Histórico local

- RF-16: permitir repetir uma configuração sem reenviar dados ao servidor, quando tecnicamente possível.
- RF-17: salvar preferências apenas com consentimento e sem armazenar o conteúdo do arquivo por padrão.

## Requisitos não funcionais

- RNF-01: priorizar processamento no navegador para arquivos pequenos e médios.
- RNF-02: informar claramente quando um arquivo será enviado ao servidor.
- RNF-03: excluir arquivos temporários do servidor automaticamente em prazo curto e documentado.
- RNF-04: proteger contra CSV formula injection, XXE, zip bombs e payloads excessivos.
- RNF-05: não executar macros, scripts ou fórmulas provenientes do arquivo.
- RNF-06: estabelecer limites de tamanho, linhas, profundidade e tempo de processamento.
- RNF-07: cumprir WCAG 2.2 AA nos fluxos principais.
- RNF-08: funcionar nas versões atuais dos principais navegadores desktop.
- RNF-09: permitir internacionalização desde a base, começando por `pt-BR`.
- RNF-10: registrar métricas sem capturar conteúdo sensível dos arquivos.

## Fluxo principal

1. Usuário envia o arquivo.
2. Sistema detecta e valida o conteúdo.
3. Usuário escolhe o formato ou destino.
4. Sistema apresenta prévia e mapeamento sugerido.
5. Usuário ajusta opções.
6. Sistema valida riscos e mostra o que poderá ser perdido.
7. Usuário confirma e baixa o resultado.

## Critérios de aceite do preset Trello para Asana

- Cada cartão vira uma tarefa.
- A lista vira seção.
- Descrição e URL original são preservadas.
- Datas válidas são exportadas no formato esperado pelo Asana.
- Etiquetas são mapeáveis como campo adicional.
- Checklists são preservados na descrição ou, futuramente, como subtarefas.
- Cartões arquivados podem ser incluídos ou excluídos.
- Responsáveis sem e-mail não são atribuídos silenciosamente.
- O arquivo final passa pela prévia do importador do Asana sem erro estrutural.

