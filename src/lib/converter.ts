export type TableCell = string | number | boolean | null
export type TableRow = Record<string, TableCell>

export type ConversionTable = {
  columns: string[]
  rows: TableRow[]
  sourcePath: string
  warnings: string[]
}

export type JsonCollection = {
  path: string
  recordCount: number
}

type CollectionCandidate = JsonCollection & {
  value: Record<string, unknown>[]
}

const MAX_DEPTH = 64
const MAX_ROWS = 100_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function findCollections(input: unknown): CollectionCandidate[] {
  const candidates: CollectionCandidate[] = []
  const pending: Array<{ value: unknown; path: string; depth: number }> = [
    { value: input, path: '$', depth: 0 },
  ]

  while (pending.length) {
    const current = pending.pop()
    if (!current) break
    if (current.depth > MAX_DEPTH) {
      throw new Error(`O JSON ultrapassa o limite de ${MAX_DEPTH} níveis.`)
    }

    if (Array.isArray(current.value)) {
      if (current.value.length > 0 && current.value.every(isRecord)) {
        candidates.push({
          path: current.path,
          recordCount: current.value.length,
          value: current.value,
        })
        continue
      }

      current.value.forEach((item, index) => {
        pending.push({
          value: item,
          path: `${current.path}[${index}]`,
          depth: current.depth + 1,
        })
      })
      continue
    }

    if (isRecord(current.value)) {
      Object.entries(current.value).forEach(([key, value]) => {
        pending.push({
          value,
          path: `${current.path}.${key}`,
          depth: current.depth + 1,
        })
      })
    }
  }

  return candidates.sort((a, b) => b.recordCount - a.recordCount)
}

export function discoverJsonCollections(input: unknown): JsonCollection[] {
  return findCollections(input).map(({ path, recordCount }) => ({ path, recordCount }))
}

function normalizeCell(value: unknown, warnings: Set<string>): TableCell {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return value as TableCell
  }

  if (Array.isArray(value)) {
    warnings.add('Listas internas foram preservadas como texto JSON dentro das células.')
  }

  return JSON.stringify(value)
}

function flattenRecord(
  record: Record<string, unknown>,
  warnings: Set<string>,
  prefix = '',
  result: TableRow = {},
): TableRow {
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (isRecord(value)) {
      warnings.add('Objetos internos foram achatados em colunas com nomes separados por ponto.')
      flattenRecord(value, warnings, path, result)
    } else {
      result[path] = normalizeCell(value, warnings)
    }
  }

  return result
}

export function convertJsonToTable(
  input: unknown,
  requestedPath?: string,
): ConversionTable {
  const candidates = findCollections(input)
  const selected = requestedPath
    ? candidates.find((candidate) => candidate.path === requestedPath)
    : candidates[0]

  if (!selected) {
    throw new Error(
      requestedPath
        ? 'A coleção selecionada não está mais disponível.'
        : 'Não encontramos uma lista preenchida de objetos que possa virar tabela.',
    )
  }

  if (selected.recordCount > MAX_ROWS) {
    throw new Error(`A coleção ultrapassa o limite de ${MAX_ROWS.toLocaleString('pt-BR')} linhas.`)
  }

  const warnings = new Set<string>()
  const rows = selected.value.map((item) => flattenRecord(item, warnings))
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))

  return {
    columns,
    rows,
    sourcePath: selected.path,
    warnings: Array.from(warnings),
  }
}

function protectSpreadsheetFormula(value: string): string {
  const normalizedStart = value.trimStart()
  if (/^[=+\-@]/.test(normalizedStart)) return `'${value}`
  return value
}

function encodeCsvCell(value: TableCell): string {
  if (value === null) return ''

  const original = String(value)
  const raw = protectSpreadsheetFormula(original)
  const escaped = raw.replaceAll('"', '""')
  const needsQuotes = /[",\r\n]/.test(escaped) || raw !== original

  return needsQuotes ? `"${escaped}"` : escaped
}

export function tableToCsv(table: ConversionTable): string {
  const header = table.columns.map((column) => encodeCsvCell(column)).join(',')
  const rows = table.rows.map((row) =>
    table.columns.map((column) => encodeCsvCell(row[column] ?? null)).join(','),
  )

  return [header, ...rows].join('\r\n')
}
function countDelimiter(line: string, delimiter: string): number {
  let count = 0
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') index += 1
      else quoted = !quoted
    } else if (!quoted && character === delimiter) {
      count += 1
    }
  }

  return count
}

function detectCsvDelimiter(content: string): string {
  const sample = content.split(/\r?\n/, 1)[0] ?? ''
  const delimiters = [',', ';', '\t']
  return delimiters.reduce((best, current) =>
    countDelimiter(sample, current) > countDelimiter(sample, best) ? current : best,
  )
}

function parseCsvRows(content: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]

    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && character === delimiter) {
      row.push(cell)
      cell = ''
      continue
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      if (character === '\r' && content[index + 1] === '\n') index += 1
      continue
    }

    cell += character
  }

  if (quoted) throw new Error('O CSV contém aspas abertas sem fechamento.')
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function normalizeHeaders(headers: string[]): { columns: string[]; renamed: boolean } {
  const used = new Set<string>()
  let renamed = false
  const columns = headers.map((header, index) => {
    const base = header.trim() || `coluna_${index + 1}`
    let candidate = base
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}_${suffix}`
      suffix += 1
    }
    if (candidate !== header) renamed = true
    used.add(candidate)
    return candidate
  })
  return { columns, renamed }
}

export function convertCsvToTable(input: string): ConversionTable {
  const content = input.replace(/^\uFEFF/, '')
  if (!content.trim()) throw new Error('O arquivo CSV está vazio.')

  const delimiter = detectCsvDelimiter(content)
  const parsedRows = parseCsvRows(content, delimiter)
  if (parsedRows.length < 2) {
    throw new Error('O CSV precisa ter um cabeçalho e pelo menos uma linha de dados.')
  }

  const { columns, renamed } = normalizeHeaders(parsedRows[0])
  const dataRows = parsedRows.slice(1)
  if (dataRows.length > MAX_ROWS) {
    throw new Error(`O arquivo ultrapassa o limite de ${MAX_ROWS.toLocaleString('pt-BR')} linhas.`)
  }

  const warnings: string[] = []
  if (renamed) warnings.push('Cabeçalhos vazios ou repetidos foram renomeados para gerar chaves JSON válidas.')
  if (dataRows.some((row) => row.length !== columns.length)) {
    warnings.push('Algumas linhas têm uma quantidade de células diferente do cabeçalho; valores ausentes ficaram vazios.')
  }

  const rows = dataRows.map((values) =>
    Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ''])) as TableRow,
  )

  return { columns, rows, sourcePath: '$', warnings }
}

export function tableToJson(table: ConversionTable): string {
  return JSON.stringify(table.rows, null, 2)
}
