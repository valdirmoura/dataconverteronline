import { useState } from 'react'
import { convertCsvToTable } from './lib/converter'
import { flattenJson, jsonToGoStruct, jsonToPythonClass, jsonToTypeScript, jsonToXml, jsonToYaml, tableToXml, unflattenJson } from './lib/structured'

type Tool = { id: string; label: string; source: 'JSON' | 'CSV'; extension: string; run: (input: string) => string }
const tools: Tool[] = [
  { id: 'json-xml', label: 'JSON → XML', source: 'JSON', extension: 'xml', run: (input) => jsonToXml(JSON.parse(input)) },
  { id: 'json-yaml', label: 'JSON → YAML', source: 'JSON', extension: 'yaml', run: (input) => jsonToYaml(JSON.parse(input)) },
  { id: 'csv-xml', label: 'CSV → XML', source: 'CSV', extension: 'xml', run: (input) => tableToXml(convertCsvToTable(input)) },
  { id: 'flatten', label: 'Achatar JSON', source: 'JSON', extension: 'json', run: (input) => JSON.stringify(flattenJson(JSON.parse(input)), null, 2) },
  { id: 'unflatten', label: 'Desachatar JSON', source: 'JSON', extension: 'json', run: (input) => JSON.stringify(unflattenJson(JSON.parse(input) as Record<string, unknown>), null, 2) },
  { id: 'typescript', label: 'JSON → TypeScript', source: 'JSON', extension: 'ts', run: (input) => jsonToTypeScript(JSON.parse(input)) },
  { id: 'go', label: 'JSON → Go', source: 'JSON', extension: 'go', run: (input) => jsonToGoStruct(JSON.parse(input)) },
  { id: 'python', label: 'JSON → Python', source: 'JSON', extension: 'py', run: (input) => jsonToPythonClass(JSON.parse(input)) },
]
const demo = JSON.stringify({ name: 'Vira', active: true, profile: { city: 'Contagem' }, tags: ['local'] }, null, 2)

export function StructuredTools() {
  const [toolId, setToolId] = useState('json-xml')
  const [input, setInput] = useState(demo)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const tool = tools.find((item) => item.id === toolId)!
  function run() { try { setOutput(tool.run(input)); setError('') } catch (caught) { setOutput(''); setError(caught instanceof Error ? caught.message : 'Não foi possível processar o conteúdo.') } }
  function download() { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' })); link.download = `vira-resultado.${tool.extension}`; link.click(); URL.revokeObjectURL(link.href) }
  return <section className="tool-catalog" aria-labelledby="tools-title"><div className="catalog-heading"><p className="eyebrow">DADOS E ESTRUTURAS</p><div><h2 id="tools-title">Mais formatos, ainda locais.</h2><p>Escolha uma ferramenta, cole o conteúdo e baixe o resultado.</p></div></div><div className="tools-grid">{tools.map((item) => <button key={item.id} className={`tool-card ${item.id === toolId ? 'is-active' : ''}`} type="button" onClick={() => { setToolId(item.id); setOutput(''); setError('') }}><span>{item.source}</span><strong>{item.label}</strong><i aria-hidden="true">→</i></button>)}</div><div className="structured-workbench"><div><p className="result-kicker">{tool.label}</p><textarea value={input} onChange={(event) => setInput(event.target.value)} aria-label={`Conteúdo ${tool.source}`} spellCheck="false"/><button className="primary-button" type="button" onClick={run}>Gerar {tool.extension.toUpperCase()}</button></div><div className="structured-output"><p className="result-kicker">RESULTADO</p>{output ? <pre>{output}</pre> : <p>O resultado aparece aqui.</p>}{output && <button className="download-button" type="button" onClick={download}>Baixar {tool.extension.toUpperCase()} <span aria-hidden="true">↓</span></button>}{error && <p className="structured-error" role="alert">{error}</p>}</div></div></section>
}