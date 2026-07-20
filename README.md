# Vira

## Visão geral

Vira é uma ferramenta web para transformar arquivos entre formatos comuns sem exigir programação. O produto nasce de um caso real: transformar um export do Trello em uma planilha importável pelo Asana, preservando o máximo possível do contexto original.

O nome confirmado é **Vira**. O projeto é um produto independente da Anmaru, com identidade própria e origem local-first.

## Classificação do projeto

- Tipo principal: `new_product_or_feature`.
- Tipos secundários: `website_or_digital_experience`, `technical_delivery`, `data_and_analytics` e `learning_and_experimentation`.
- Fase atual: planejamento e discovery inicial.

## Problema

Ferramentas exportam dados em formatos que outras plataformas não aceitam. Conversores genéricos frequentemente alteram tipos, achatam estruturas sem transparência, perdem listas aninhadas ou entregam arquivos tecnicamente válidos, mas inadequados ao sistema de destino.

## Proposta de valor

Converter arquivos com uma experiência simples, explicando perdas e permitindo adequar o resultado ao destino. A diferenciação não será apenas “JSON para CSV”, mas “dados de uma origem para um arquivo realmente utilizável em outra ferramenta”. A proposta central é: **Seus dados, no formato que você precisa.**

## Objetivos iniciais

- Converter JSON, CSV, XLSX, TSV, YAML, XML e NDJSON.
- Permitir conversões nos dois sentidos quando a estrutura de destino comportar os dados.
- Visualizar e mapear campos antes da exportação.
- Avisar sobre perdas, coerções e limitações da conversão.
- Processar arquivos com segurança e política clara de retenção.
- Oferecer presets orientados a destinos, começando por Trello para Asana.

## Fora do MVP

- Sincronização contínua entre plataformas.
- Integrações autenticadas com Trello, Asana ou Google Drive.
- ETL corporativo e pipelines agendados.
- Edição colaborativa de dados.
- Conversão irrestrita de arquivos muito grandes.

## Públicos iniciais

- Pessoas migrando entre ferramentas de gestão.
- Profissionais de operações, marketing e produto.
- Analistas que recebem exports incompatíveis.
- Pequenas empresas sem equipe técnica dedicada.

## Estrutura

```text
data-converter-online/
├── README.md
├── 01_context/
│   └── project-brief.md
├── 02_research/
│   └── discovery-plan.md
├── 03_strategy/
│   └── format-matrix.md
├── 04_requirements/
│   └── requirements.md
├── 06_technical/
│   └── architecture-notes.md
├── 07_delivery/
│   └── roadmap.md
├── 11_metrics/
│   └── metrics-plan.md
├── decision-log.md
└── archive/
```

As pastas de implementação da aplicação serão criadas somente depois da validação do brief e da arquitetura.

## Documentos-chave

| Documento | Situação | Papel |
| --- | --- | --- |
| `01_context/project-brief.md` | obrigatório | Define problema, público, escopo e sucesso. |
| `02_research/discovery-plan.md` | obrigatório | Valida demanda, linguagem e fluxos prioritários. |
| `03_strategy/format-matrix.md` | obrigatório | Define quais conversões são seguras, parciais ou avançadas. |
| `04_requirements/requirements.md` | obrigatório | Requisitos funcionais e não funcionais do MVP. |
| `06_technical/architecture-notes.md` | obrigatório | Orienta processamento, segurança e evolução técnica. |
| `07_delivery/roadmap.md` | obrigatório | Organiza as fases do produto. |
| `11_metrics/metrics-plan.md` | obrigatório | Define eventos e critérios de validação. |
| `decision-log.md` | obrigatório | Registra decisões de produto e tecnologia. |

## Status

MVP JSON → CSV em implementação. Nome e proposta de valor confirmados; modelo de negócio, limites gratuitos e estratégia de processamento em servidor ainda precisam ser validados.

## Próximos passos

1. Validar o problema com 5 a 8 usuários que já precisaram converter exports.
2. Escolher o recorte do MVP e confirmar a matriz de formatos.
3. Prototipar upload, prévia, mapeamento e download.
4. Testar o preset Trello para Asana com exports variados.
5. Fechar arquitetura e criar a aplicação em uma raiz própria.

## Manutenção

- Toda mudança de escopo deve entrar no `decision-log.md`.
- A matriz de formatos é a fonte de verdade das conversões suportadas.
- Requisitos validados devem ser ligados a métricas e testes.
- Documentos obsoletos devem ser movidos para `archive/`, sem apagar o histórico.
