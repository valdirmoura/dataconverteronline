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
