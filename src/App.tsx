import { useRef, useState } from 'react'
import './App.css'
import {
  convertJsonToTable,
  discoverJsonCollections,
  tableToCsv,
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

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function downloadCsv(table: ConversionTable, sourceName: string) {
  const blob = new Blob(['\uFEFF', tableToCsv(table)], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${sourceName.replace(/\.json$/i, '') || 'dados-convertidos'}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
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

  async function processFile(file?: File) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError('Nesta primeira versão, envie um arquivo com extensão .json.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setTable(null)
      setJsonInput(null)
      setCollections([])
      setError('O arquivo ultrapassa o limite atual de 50 MB.')
      return
    }
    processJson(await file.text(), file.name)
  }

  function reset() {
    setTable(null)
    setJsonInput(null)
    setCollections([])
    setFileName('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Data Converter Online — início">
          <span className="brand-mark" aria-hidden="true">D/C</span>
          <span>Data Converter Online</span>
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
              <p className="step">CONVERSOR 01</p>
              <h2 id="converter-title">JSON → CSV</h2>
            </div>
            <span className="status">FUNCIONAL</span>
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
              <span className="file-glyph" aria-hidden="true">{'{ }'}</span>
              <h3>Solte seu arquivo JSON aqui</h3>
              <p>ou escolha um arquivo do seu computador</p>
              <input
                ref={inputRef}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={(event) => void processFile(event.target.files?.[0])}
              />
              <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
                Escolher arquivo
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => processJson(JSON.stringify(demoData), 'exemplo.json')}
              >
                Testar com dados de exemplo
              </button>
            </div>
          ) : (
            <div className="result-panel">
              <div className="result-summary" aria-live="polite">
                <div>
                  <span className="result-kicker">ARQUIVO ANALISADO</span>
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
              <button className="download-button" type="button" onClick={() => downloadCsv(table, fileName)}>
                Baixar CSV <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

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
        <span>Data Converter Online · MVP 0.1</span>
        <span>Conversão local · nenhum upload para servidor</span>
      </footer>
    </div>
  )
}

export default App
