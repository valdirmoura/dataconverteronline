import { useRef, useState } from 'react'
import './App.css'
import { StructuredTools } from './StructuredTools'
import {
  convertCsvToTable,
  convertJsonToTable,
  discoverJsonCollections,
  tableToCsv,
  tableToJson,
  type ConversionTable,
  type JsonCollection,
} from './lib/converter'

const demoData = {
  board: 'Meu quadro',
  cards: [
    {
      name: 'Planejar migração',
      list: { name: 'Em andamento' },
      labels: ['prioridade'],
      done: false,
    },
    {
      name: 'Validar arquivo convertido',
      list: { name: 'Próximos passos' },
      labels: ['dados', 'teste'],
      done: true,
    },
  ],
}

const demoCsv = 'name,list,labels,done\nPlanejar migração,Em andamento,prioridade,false\nValidar arquivo convertido,Próximos passos,dados | teste,true'

type ConversionDirection = 'json-to-csv' | 'csv-to-json'

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function downloadOutput(
  table: ConversionTable,
  sourceName: string,
  direction: ConversionDirection,
) {
  const isJsonToCsv = direction === 'json-to-csv'
  const content = isJsonToCsv ? tableToCsv(table) : tableToJson(table)
  const blob = new Blob(isJsonToCsv ? ['\uFEFF', content] : [content], {
    type: isJsonToCsv ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  const baseName = sourceName.replace(/\.(json|csv)$/i, '') || 'dados-convertidos'
  anchor.download = `${baseName}.${isJsonToCsv ? 'csv' : 'json'}`
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [direction, setDirection] = useState<ConversionDirection>('json-to-csv')
  const [table, setTable] = useState<ConversionTable | null>(null)
  const [jsonInput, setJsonInput] = useState<unknown>(null)
  const [collections, setCollections] = useState<JsonCollection[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function processJson(content: string, name: string) {
    try {
      const parsed = JSON.parse(content) as unknown
      const availableCollections = discoverJsonCollections(parsed)
      if (!availableCollections.length) {
        throw new Error('Não encontramos uma lista preenchida de objetos nesse arquivo.')
      }
      setJsonInput(parsed)
      setCollections(availableCollections)
      setTable(convertJsonToTable(parsed, availableCollections[0].path))
      setFileName(name)
      setError('')
    } catch (caught) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError(
        caught instanceof SyntaxError
          ? 'O arquivo não contém um JSON válido. Verifique se o download foi concluído e tente novamente.'
          : caught instanceof Error
            ? caught.message
            : 'Não foi possível interpretar este arquivo.',
      )
    }
  }

  function processCsv(content: string, name: string) {
    try {
      setTable(convertCsvToTable(content))
      setJsonInput(null)
      setCollections([])
      setFileName(name)
      setError('')
    } catch (caught) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError(caught instanceof Error ? caught.message : 'Não foi possível interpretar este arquivo.')
    }
  }

  async function processFile(file?: File) {
    if (!file) return
    const expectedExtension = direction === 'json-to-csv' ? '.json' : '.csv'
    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError(`Para esta conversão, envie um arquivo com extensão ${expectedExtension}.`)
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError('O arquivo ultrapassa o limite atual de 50 MB.')
      return
    }
    const content = await file.text()
    if (direction === 'json-to-csv') processJson(content, file.name)
    else processCsv(content, file.name)
  }

  function reset() {
    setTable(null)
    setJsonInput(null)
    setCollections([])
    setFileName('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const sourceFormat = direction === 'json-to-csv' ? 'JSON' : 'CSV'
  const targetFormat = direction === 'json-to-csv' ? 'CSV' : 'JSON'

  function toggleDirection() {
    reset()
    setDirection((current) => current === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Vira — início">
          <span className="brand-mark" aria-hidden="true">V/</span>
          <span>Vira</span>
        </a>
        <span className="privacy-note"><span aria-hidden="true">●</span> Seus dados não saem do navegador</span>
      </header>

      <main id="top">
        <section className="hero-copy" aria-labelledby="page-title">
          <p className="eyebrow">UTILIDADE DIGITAL · ACESSO ABERTO</p>
          <h1 id="page-title">Seus dados, no formato que você precisa.</h1>
          <p className="lede">
            Transforme um arquivo que você já possui em um formato realmente útil —
            sem assinatura extra e sem precisar programar.
          </p>
        </section>

        <section className="converter" aria-labelledby="converter-title">
          <div className="converter-heading">
            <div>
              <p className="step">CONVERSÃO DE ARQUIVOS</p>
              <h2 id="converter-title">
                <span>{sourceFormat}</span>
                <button
                  className="direction-toggle"
                  type="button"
                  onClick={toggleDirection}
                  aria-label={`Inverter direção: converter ${targetFormat} para ${sourceFormat}`}
                  title="Inverter direção da conversão"
                >
                  <span aria-hidden="true">→</span>
                </button>
                <span>{targetFormat}</span>
              </h2>
            </div>
          </div>

          {!table ? (
            <div
              className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                void processFile(event.dataTransfer.files[0])
              }}
            >
              <span className="file-glyph" aria-hidden="true">{sourceFormat === 'JSON' ? '{ }' : 'A,B'}</span>
              <h3>Solte seu arquivo {sourceFormat} aqui</h3>
              <p>ou escolha um arquivo do seu computador</p>
              <input
                ref={inputRef}
                className="visually-hidden"
                type="file"
                accept={direction === 'json-to-csv' ? 'application/json,.json' : 'text/csv,.csv'}
                onChange={(event) => void processFile(event.target.files?.[0])}
              />
              <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
                Escolher arquivo
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => direction === 'json-to-csv'
                  ? processJson(JSON.stringify(demoData), 'exemplo.json')
                  : processCsv(demoCsv, 'exemplo.csv')}
              >
                Testar com dados de exemplo
              </button>
            </div>
          ) : (
            <div className="result-panel">
              <div className="result-summary" aria-live="polite">
                <div>
                  <span className="result-kicker">{sourceFormat} ANALISADO · PRONTO PARA {targetFormat}</span>
                  <strong>{fileName}</strong>
                  <span>{table.rows.length} linhas · {table.columns.length} colunas</span>
                  {collections.length > 1 && (
                    <label className="collection-picker">
                      Coleção do JSON
                      <select
                        value={table.sourcePath}
                        onChange={(event) => {
                          if (jsonInput) setTable(convertJsonToTable(jsonInput, event.target.value))
                        }}
                      >
                        {collections.map((collection) => (
                          <option key={collection.path} value={collection.path}>
                            {collection.path} — {collection.recordCount} registros
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <button className="secondary-button" type="button" onClick={reset}>Trocar arquivo</button>
              </div>

              {table.warnings.length > 0 && (
                <div className="warning-panel" role="status">
                  <strong>Antes de baixar</strong>
                  <ul>{table.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                </div>
              )}

              <div className="table-wrap" tabIndex={0} aria-label="Prévia dos dados convertidos">
                <table>
                  <thead>
                    <tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {table.rows.slice(0, 8).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {table.columns.map((column) => <td key={column}>{formatCell(row[column])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.rows.length > 8 && <p className="preview-note">Prévia das primeiras 8 linhas.</p>}
              <button className="download-button" type="button" onClick={() => downloadOutput(table, fileName, direction)}>
                Baixar {targetFormat} <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        <StructuredTools />

        <section className="manifesto" aria-labelledby="manifesto-title">
          <p className="eyebrow">POR QUE EXISTE</p>
          <div>
            <h2 id="manifesto-title">A tecnologia deve devolver autonomia, não criar mais uma barreira.</h2>
            <p>
              Este projeto nasceu quando um arquivo legítimo só podia ser exportado em JSON
              no plano gratuito de uma plataforma. A IA tornou viável criar uma ferramenta
              simples para transformar esses dados — e compartilhar esse acesso com outras pessoas.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <span>Vira · Versão beta</span>
        <span>Conversão local · nenhum upload para servidor</span>
      </footer>
    </div>
  )
}

export default App
