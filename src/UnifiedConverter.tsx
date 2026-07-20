import { useEffect, useMemo, useRef, useState } from 'react'
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
import { markdownToHtml, markdownToText } from './lib/text'

type SourceFormat = 'JSON' | 'CSV' | 'Markdown' | 'Texto' | 'PNG' | 'JPEG' | 'WebP'
type ToolKind = 'text' | 'image'
type Tool = { id: string; source: SourceFormat; target: string; extension: string; kind: ToolKind; run?: (input: string) => string; imageType?: string }

const sampleJson = JSON.stringify({ project: 'Vira', active: true, records: [{ name: 'Planejar migração', done: false }] }, null, 2)
const sampleCsv = 'name,done\nPlanejar migração,false\nValidar resultado,true'
const sampleMarkdown = '# Uma nota útil\n\n- Escrever uma ideia\n- Compartilhar sem complicação'
const sampleText = 'Uma nota simples.\n\nSem formatação, pronta para virar Markdown.'

const tools: Tool[] = [
  { id: 'json-csv', source: 'JSON', target: 'CSV', extension: 'csv', kind: 'text', run: (input) => tableToCsv(convertJsonToTable(JSON.parse(input))) },
  { id: 'csv-json', source: 'CSV', target: 'JSON', extension: 'json', kind: 'text', run: (input) => tableToJson(convertCsvToTable(input)) },
  { id: 'json-xml', source: 'JSON', target: 'XML', extension: 'xml', kind: 'text', run: (input) => jsonToXml(JSON.parse(input)) },
  { id: 'json-yaml', source: 'JSON', target: 'YAML', extension: 'yaml', kind: 'text', run: (input) => jsonToYaml(JSON.parse(input)) },
  { id: 'csv-xml', source: 'CSV', target: 'XML', extension: 'xml', kind: 'text', run: (input) => tableToXml(convertCsvToTable(input)) },
  { id: 'flatten', source: 'JSON', target: 'JSON achatado', extension: 'json', kind: 'text', run: (input) => JSON.stringify(flattenJson(JSON.parse(input)), null, 2) },
  { id: 'unflatten', source: 'JSON', target: 'JSON reconstruído', extension: 'json', kind: 'text', run: (input) => JSON.stringify(unflattenJson(JSON.parse(input) as Record<string, unknown>), null, 2) },
  { id: 'typescript', source: 'JSON', target: 'TypeScript', extension: 'ts', kind: 'text', run: (input) => jsonToTypeScript(JSON.parse(input)) },
  { id: 'go', source: 'JSON', target: 'Go', extension: 'go', kind: 'text', run: (input) => jsonToGoStruct(JSON.parse(input)) },
  { id: 'python', source: 'JSON', target: 'Python', extension: 'py', kind: 'text', run: (input) => jsonToPythonClass(JSON.parse(input)) },
  { id: 'txt-markdown', source: 'Texto', target: 'Markdown', extension: 'md', kind: 'text', run: (input) => input },
  { id: 'markdown-text', source: 'Markdown', target: 'Texto', extension: 'txt', kind: 'text', run: markdownToText },
  { id: 'markdown-html', source: 'Markdown', target: 'HTML', extension: 'html', kind: 'text', run: markdownToHtml },
  { id: 'png-jpeg', source: 'PNG', target: 'JPEG', extension: 'jpg', kind: 'image', imageType: 'image/jpeg' },
  { id: 'png-webp', source: 'PNG', target: 'WebP', extension: 'webp', kind: 'image', imageType: 'image/webp' },
  { id: 'jpeg-png', source: 'JPEG', target: 'PNG', extension: 'png', kind: 'image', imageType: 'image/png' },
  { id: 'webp-png', source: 'WebP', target: 'PNG', extension: 'png', kind: 'image', imageType: 'image/png' },
]

function sampleFor(source: SourceFormat) {
  if (source === 'CSV') return sampleCsv
  if (source === 'Markdown') return sampleMarkdown
  if (source === 'Texto') return sampleText
  return sampleJson
}

function isImageSource(source: SourceFormat) {
  return source === 'PNG' || source === 'JPEG' || source === 'WebP'
}

function acceptedFiles(source: SourceFormat) {
  if (source === 'JSON') return 'application/json,.json'
  if (source === 'CSV') return 'text/csv,.csv'
  if (source === 'Markdown') return 'text/markdown,.md,.markdown'
  if (source === 'Texto') return 'text/plain,.txt'
  if (source === 'PNG') return 'image/png,.png'
  if (source === 'JPEG') return 'image/jpeg,.jpg,.jpeg'
  return 'image/webp,.webp'
}

async function convertImage(file: File, outputType: string) {
  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Não foi possível ler esta imagem.'))
      element.src = sourceUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Não foi possível gerar a imagem.')), outputType, 0.92))
    return blob
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export function UnifiedConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [toolId, setToolId] = useState('json-csv')
  const [input, setInput] = useState(sampleJson)
  const [file, setFile] = useState<File | null>(null)
  const [output, setOutput] = useState('')
  const [imageOutput, setImageOutput] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const tool = tools.find((item) => item.id === toolId)!
  const availableTargets = tools.filter((item) => item.source === tool.source)
  const reverseTool = tools.find((item) => item.source === tool.target && item.target === tool.source)
  const imageMode = tool.kind === 'image'
  const imagePreview = useMemo(() => imageOutput ? URL.createObjectURL(imageOutput) : '', [imageOutput])

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  function clearResult() {
    setOutput('')
    setImageOutput(null)
    setError('')
  }

  function selectTool(nextId: string) {
    const nextTool = tools.find((item) => item.id === nextId)!
    setToolId(nextId)
    setInput(sampleFor(nextTool.source))
    setFile(null)
    clearResult()
    if (inputRef.current) inputRef.current.value = ''
  }

  function changeSource(source: SourceFormat) {
    selectTool(tools.find((item) => item.source === source)!.id)
  }

  async function loadFile(nextFile?: File) {
    if (!nextFile) return
    if (nextFile.size > 50 * 1024 * 1024) { setError('O arquivo ultrapassa o limite atual de 50 MB.'); return }
    if (isImageSource(tool.source)) {
      if (!nextFile.type.startsWith('image/')) { setError(`Para esta conversão, escolha uma imagem ${tool.source}.`); return }
      setFile(nextFile)
    } else {
      setInput(await nextFile.text())
      setFile(nextFile)
    }
    clearResult()
  }

  async function convert() {
    try {
      if (imageMode) {
        if (!file || !tool.imageType) throw new Error(`Carregue uma imagem ${tool.source} para converter.`)
        setImageOutput(await convertImage(file, tool.imageType))
      } else if (tool.run) {
        setOutput(tool.run(input))
      }
      setError('')
    } catch (caught) {
      setOutput('')
      setImageOutput(null)
      setError(caught instanceof Error ? caught.message : 'Não foi possível processar o conteúdo.')
    }
  }

  function download() {
    const blob = imageOutput ?? new Blob(tool.extension === 'csv' ? ['\uFEFF', output] : [output], { type: tool.extension === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file?.name.replace(/\.[^.]+$/, '') || 'vira-resultado'}.${tool.extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const hasResult = Boolean(output || imageOutput)

  return (
    <section className="converter unified-converter" aria-labelledby="converter-title">
      <div className="converter-heading">
        <div>
          <p className="step">CONVERSÃO DE ARQUIVOS</p>
          <h2 id="converter-title"><span>{tool.source}</span><button className="direction-toggle" type="button" onClick={() => reverseTool && selectTool(reverseTool.id)} disabled={!reverseTool} aria-label={reverseTool ? `Inverter direção: converter ${tool.target} para ${tool.source}` : 'Esta conversão não possui direção inversa'} title={reverseTool ? 'Inverter direção da conversão' : 'Esta conversão não possui direção inversa'}><span aria-hidden="true">→</span></button><span>{tool.target}</span></h2>
        </div>
        <p className="converter-note">Escolha o caminho, cole o conteúdo ou carregue um arquivo. Tudo acontece no seu navegador.</p>
      </div>
      <div className="conversion-selectors" aria-label="Escolha da conversão">
        <label>Origem<select value={tool.source} onChange={(event) => changeSource(event.target.value as SourceFormat)}>{(['JSON', 'CSV', 'Markdown', 'Texto', 'PNG', 'JPEG', 'WebP'] as SourceFormat[]).map((source) => <option key={source} value={source}>{source}</option>)}</select></label>
        <span aria-hidden="true">→</span>
        <label>Destino ou operação<select value={tool.id} onChange={(event) => selectTool(event.target.value)}>{availableTargets.map((item) => <option key={item.id} value={item.id}>{item.target}</option>)}</select></label>
      </div>
      <div className="unified-workbench">
        <div className="unified-input">
          <div className="input-heading"><div><p className="result-kicker">ENTRADA · {tool.source}</p><p>{file?.name || (imageMode ? `Carregue uma imagem ${tool.source}.` : `Cole um conteúdo ${tool.source} ou carregue um arquivo.`)}</p></div><input ref={inputRef} className="visually-hidden" type="file" accept={acceptedFiles(tool.source)} onChange={(event) => void loadFile(event.target.files?.[0])} /><button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>Carregar arquivo</button></div>
          {imageMode ? <div className="image-drop-hint"><span className="file-glyph" aria-hidden="true">▧</span><strong>{file ? file.name : `Imagem ${tool.source} necessária`}</strong><p>As imagens são convertidas no próprio navegador.</p></div> : <textarea value={input} onChange={(event) => { setInput(event.target.value); setFile(null); clearResult() }} aria-label={`Conteúdo ${tool.source}`} spellCheck="false" />}
          <div className="workbench-actions">{!imageMode && <button className="text-button" type="button" onClick={() => { setInput(sampleFor(tool.source)); setFile(null); clearResult() }}>Usar exemplo</button>}<button className="primary-button" type="button" onClick={() => void convert()}>Converter para {tool.target}</button></div>
        </div>
        <div className="structured-output unified-output" aria-live="polite"><p className="result-kicker">RESULTADO · {tool.target}</p>{imageOutput ? <img className="image-result" src={imagePreview} alt={`Prévia convertida em ${tool.target}`} /> : output ? <pre>{output}</pre> : <p>O resultado da conversão aparece aqui.</p>}{hasResult && <button className="download-button" type="button" onClick={download}>Baixar {tool.extension.toUpperCase()} <span aria-hidden="true">↓</span></button>}{error && <p className="structured-error" role="alert">{error}</p>}</div>
      </div>
    </section>
  )
}