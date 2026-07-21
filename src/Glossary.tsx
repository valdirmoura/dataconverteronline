const entries = [
  ['Conversão de arquivo', 'A transformação de um arquivo de um formato para outro, como JSON para CSV. O conteúdo pode mudar de organização para caber no destino.'],
  ['Formato e extensão', 'O formato define como os dados são guardados. A extensão é a parte final do nome, como .csv ou .json, que ajuda programas a reconhecer o arquivo.'],
  ['JSON', 'Formato de dados estruturados, comum em exportações de sistemas e APIs. Pode guardar listas, objetos e relações aninhadas.'],
  ['CSV', 'Planilha em texto simples: cada linha é um registro e as colunas são separadas por vírgulas ou outro delimitador.'],
  ['XML', 'Formato estruturado que usa tags, como <item>. É comum em integrações e sistemas mais antigos.'],
  ['YAML', 'Formato de texto legível para pessoas, usado com frequência em configurações. Mantém hierarquias por indentação.'],
  ['Markdown', 'Forma simples de escrever texto com estrutura: títulos, listas, links e destaque, sem precisar de editor visual.'],
  ['UTF-8', 'A codificação de texto mais comum na web. Ela preserva acentos e caracteres especiais quando o arquivo é aberto em outro programa.'],
  ['Dados tabulares', 'Dados organizados em linhas e colunas, como uma planilha. CSV funciona melhor para esse tipo de estrutura.'],
  ['Dados hierárquicos', 'Dados com níveis e relações internas, como um projeto que contém tarefas e cada tarefa contém etiquetas. JSON, XML e YAML representam isso melhor.'],
  ['Achatar dados', 'Transformar uma estrutura com níveis em colunas. Por exemplo, pessoa.endereço.cidade pode virar uma coluna chamada endereço.cidade.'],
  ['Conversão local', 'O arquivo é processado no seu próprio navegador e não é enviado para o servidor do Vira.'],
]

export function Glossary() {
  return (
    <section className="glossary" aria-labelledby="glossary-title">
      <div className="glossary-heading">
        <p className="eyebrow">GLOSSÁRIO</p>
        <div>
          <h2 id="glossary-title">Entenda o arquivo antes de transformar.</h2>
          <p>Explicações curtas para escolher o formato certo e saber o que pode mudar na conversão.</p>
        </div>
      </div>
      <div className="glossary-list">
        {entries.map(([term, definition]) => (
          <details key={term}>
            <summary>{term}<span aria-hidden="true">+</span></summary>
            <p>{definition}</p>
          </details>
        ))}
      </div>
    </section>
  )
}