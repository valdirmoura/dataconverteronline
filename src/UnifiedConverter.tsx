import { useRef, useState } from 'react'
import { convertCsvToTable, convertJsonToTable, tableToCsv, tableToJson } from './lib/converter'
import {
  flattenJson,
  jsonToGoStruct,
  jsonToPythonClass,
  jsonToTypeScript,
  jsonToXml,
  jsonToYaml,
  tableToXml,
  unflattenJson,
} from './lib/structured'

type SourceFormat = 'JSON' | 'CSV'

type Tool = {
  id: string
  source: SourceFormat
  target: string
  extension: string
  run: (input: string) => string
}

const sampleJson = JSON.stringify({
  project: 'Vira',
  active: true,
  records: [{ name: 'Planejar migração', done: false }],
}, null, 2)
const sampleCsv = 'name,done\nPlanejar migração,false\nValidar resultado,true'

const tools: Tool[] = [
  { id: 'json-csv', source: 'JSON', target: 'CSV', extension: 'csv', run: (input) => tableToCsv(convertJsonToTable(JSON.parse(input))) },
  { id: 'csv-json', source: 'CSV', target: 'JSON', extension: 'json', run: (input) => tableToJson(convertCsvToTable(input)) },
  { id: 'json-xml', source: 'JSON', target: 'XML', extension: 'xml', run: (input) => jsonToXml(JSON.parse(input)) },
  { id: 'json-yaml', source: 'JSON', target: 'YAML', extension: 'yaml', run: (input) => jsonToYaml(JSON.parse(input)) },
  { id: 'csv-xml', source: 'CSV', target: 'XML', extension: 'xml', run: (input) => tableToXml(convertCsvToTable(input)) },
  { id: 'flatten', source: 'JSON', target: 'JSON achatado', extension: 'json', run: (input) => JSON.stringify(flattenJson(JSON.parse(input)), null, 2) },
  { id: 'unflatten', source: 'JSON', target: 'JSON reconstruído', extension: 'json', run: (input) => JSON.stringify(unflattenJson(JSON.parse(input) as Record<string, unknown>), null, 2) },
  { id: 'typescript', source: 'JSON', target: 'TypeScript', extension: 'ts', run: (input) => jsonToTypeScript(JSON.parse(input)) },
  { id: 'go', source: 'JSON', target: 'Go', extension: 'go', run: (input) => jsonToGoStruct(JSON.parse(input)) },
  { id: 'python', source: 'JSON', target: 'Python', extension: 'py', run: (input) => jsonToPythonClass(JSON.parse(input)) },
]

function sampleFor(source: SourceFormat) {
  return source === 'JSON' ? sampleJson : sampleCsv
}

export function UnifiedConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [toolId, setToolId] = useState('json-csv')
  const [input, setInput] = useState(sampleJson)
  const [output, setOutput] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const tool = tools.find((item) => item.id === toolId)!
  const availableTargets = tools.filter((item) => item.source === tool.source)
  const reverseTool = tools.find((item) => item.source === tool.target && item.target === tool.source)

  function selectTool(nextId: string) {
    const nextTool = tools.find((item) => item.id === nextId)!
    setToolId(nextId)
    setInput(sampleFor(nextTool.source))
    setOutput('')
    setFileName('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  function changeSource(source: SourceFormat) {
    const nextTool = tools.find((item) => item.source === source)!
    selectTool(nextTool.id)
  }

  async function loadFile(file?: File) {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('O arquivo ultrapassa o limite atual de 50 MB.')
      return
    }
    const expected = tool.source === 'JSON' ? '.json' : '.csv'
    if (!file.name.toLowerCase().endsWith(expected)) {
      setError(`Para esta conversão, escolha um arquivo ${expected}.`)
      return
    }
    setInput(await file.text())
    setFileName(file.name)
    setOutput('')
    setError('')
  }

  function convert() {
    try {
      setOutput(tool.run(input))
      setError('')
    } catch (caught) {
      setOutput('')
      setError(caught instanceof Error ? caught.message : 'Não foi possível processar o conteúdo.')
    }
  }

  function download() {
    const type = tool.extension === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8'
    const blob = new Blob(tool.extension === 'csv' ? ['\uFEFF', output] : [output], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName.replace(/\.[^.]+$/, '') || 'vira-resultado'}.${tool.extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="converter unified-converter" aria-labelledby="converter-title">
      <div className="converter-heading">
        <div>
          <p className="step">CONVERSÃO DE ARQUIVOS</p>
          <h2 id="converter-title">
            <span>{tool.source}</span>
            <button
              className="direction-toggle"
              type="button"
              onClick={() => reverseTool && selectTool(reverseTool.id)}
              disabled={!reverseTool}
              aria-label={reverseTool ? `Inverter direção: converter ${tool.target} para ${tool.source}` : 'Esta conversão não possui direção inversa'}
              title={reverseTool ? 'Inverter direção da conversão' : 'Esta conversão não possui direção inversa'}
            >
              <span aria-hidden="true">→</span>
            </button>
            <span>{tool.target}</span>
          </h2>
        </div>
        <p className="converter-note">Escolha o caminho, cole o conteúdo ou carregue um arquivo. Tudo acontece no seu navegador.</p>
      </div>

      <div className="conversion-selectors" aria-label="Escolha da conversão">
        <label>
          Origem
          <select value={tool.source} onChange={(event) => changeSource(event.target.value as SourceFormat)}>
            <option value="JSON">JSON</option>
            <option value="CSV">CSV</option>
          </select>
        </label>
        <span aria-hidden="true">→</span>
        <label>
          Destino ou operação
          <select value={tool.id} onChange={(event) => selectTool(event.target.value)}>
            {availableTargets.map((item) => <option key={item.id} value={item.id}>{item.target}</option>)}
          </select>
        </label>
      </div>

      <div className="unified-workbench">
        <div className="unified-input">
          <div className="input-heading">
            <div>
              <p className="result-kicker">ENTRADA · {tool.source}</p>
              <p>{fileName || `Cole um conteúdo ${tool.source} ou carregue um arquivo.`}</p>
            </div>
            <input ref={inputRef} className="visually-hidden" type="file" accept={tool.source === 'JSON' ? 'application/json,.json' : 'text/csv,.csv'} onChange={(event) => void loadFile(event.target.files?.[0])} />
            <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>Carregar arquivo</button>
          </div>
          <textarea value={input} onChange={(event) => { setInput(event.target.value); setFileName(''); setOutput('') }} aria-label={`Conteúdo ${tool.source}`} spellCheck="false" />
          <div className="workbench-actions">
            <button className="text-button" type="button" onClick={() => { setInput(sampleFor(tool.source)); setFileName(''); setOutput(''); setError('') }}>Usar exemplo</button>
            <button className="primary-button" type="button" onClick={convert}>Converter para {tool.target}</button>
          </div>
        </div>
        <div className="structured-output unified-output" aria-live="polite">
          <p className="result-kicker">RESULTADO · {tool.target}</p>
          {output ? <pre>{output}</pre> : <p>O resultado da conversão aparece aqui.</p>}
          {output && <button className="download-button" type="button" onClick={download}>Baixar {tool.extension.toUpperCase()} <span aria-hidden="true">↓</span></button>}
          {error && <p className="structured-error" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  )
}