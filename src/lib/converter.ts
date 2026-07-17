export type TableCell = string | number | boolean | null
export type TableRow = Record<string, TableCell>

export type ConversionTable = {
  columns: string[]
  rows: TableRow[]
  sourcePath: string
  warnings: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeCell(value: unknown): TableCell {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return value as TableCell
  }

  return JSON.stringify(value)
}

function flattenRecord(
  record: Record<string, unknown>,
  prefix = '',
  result: TableRow = {},
): TableRow {
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (isRecord(value)) {
      flattenRecord(value, path, result)
    } else {
      result[path] = normalizeCell(value)
    }
  }

  return result
}

type CollectionCandidate = {
  path: string
  value: Record<string, unknown>[]
}

function findCollections(input: unknown, path = '$'): CollectionCandidate[] {
  if (Array.isArray(input)) {
    if (input.every(isRecord)) {
      return [{ path, value: input }]
    }

    return input.flatMap((item, index) => findCollections(item, `${path}[${index}]`))
  }

  if (!isRecord(input)) return []

  return Object.entries(input).flatMap(([key, value]) =>
    findCollections(value, `${path}.${key}`),
  )
}

export function convertJsonToTable(input: unknown): ConversionTable {
  const candidates = findCollections(input)
  const selected = candidates.sort((a, b) => b.value.length - a.value.length)[0]

  if (!selected) {
    throw new Error('Não encontramos uma lista de objetos que possa virar tabela.')
  }

  const rows = selected.value.map((item) => flattenRecord(item))
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))

  return {
    columns,
    rows,
    sourcePath: selected.path,
    warnings: [],
  }
}

function protectSpreadsheetFormula(value: string): string {
  if (/^[=+\-@]/.test(value)) return `'${value}`
  return value
}

function encodeCsvCell(value: TableCell): string {
  if (value === null) return ''

  const raw = protectSpreadsheetFormula(String(value))
  const escaped = raw.replaceAll('"', '""')
  const needsQuotes = /[",\r\n]/.test(escaped) || /^[=+\-@]/.test(String(value))

  return needsQuotes ? `"${escaped}"` : escaped
}

export function tableToCsv(table: ConversionTable): string {
  const header = table.columns.map((column) => encodeCsvCell(column)).join(',')
  const rows = table.rows.map((row) =>
    table.columns.map((column) => encodeCsvCell(row[column] ?? null)).join(','),
  )

  return [header, ...rows].join('\r\n')
}
