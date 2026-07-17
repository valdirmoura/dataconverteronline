import { describe, expect, it } from 'vitest'
import {
  convertCsvToTable,
  convertJsonToTable,
  discoverJsonCollections,
  tableToCsv,
  tableToJson,
} from './converter'

describe('JSON collection discovery', () => {
  const exportData = {
    name: 'Meu quadro',
    lists: [{ id: 'l1', name: 'Backlog' }],
    cards: [
      { id: 'c1', name: 'Primeiro cartão' },
      { id: 'c2', name: 'Segundo cartão' },
    ],
  }

  it('lists available object collections ordered by record count', () => {
    expect(discoverJsonCollections(exportData)).toEqual([
      { path: '$.cards', recordCount: 2 },
      { path: '$.lists', recordCount: 1 },
    ])
  })

  it('converts the collection selected by its public path', () => {
    const table = convertJsonToTable(exportData, '$.lists')
    expect(table.sourcePath).toBe('$.lists')
    expect(table.rows).toEqual([{ id: 'l1', name: 'Backlog' }])
  })

  it('rejects empty collections instead of creating an empty file', () => {
    expect(() => convertJsonToTable({ cards: [] })).toThrow(
      'Não encontramos uma lista preenchida',
    )
  })
})

describe('convertJsonToTable', () => {
  it('flattens nested fields and warns about the transformation', () => {
    const table = convertJsonToTable([
      { name: 'Ana', profile: { city: 'Contagem' }, tags: ['cliente'] },
      { name: 'Beto', profile: { city: 'Belo Horizonte' }, tags: [] },
    ])

    expect(table.columns).toEqual(['name', 'profile.city', 'tags'])
    expect(table.rows[0]).toEqual({
      name: 'Ana',
      'profile.city': 'Contagem',
      tags: '["cliente"]',
    })
    expect(table.warnings).toHaveLength(2)
  })
})

describe('tableToCsv', () => {
  it('escapes delimiters, quotes, new lines and spreadsheet formulas', () => {
    const csv = tableToCsv({
      columns: ['name', 'note'],
      rows: [{ name: '=2+2', note: 'texto, com "aspas"\ne linha' }],
      sourcePath: '$',
      warnings: [],
    })

    expect(csv).toBe(
      'name,note\r\n"\'=2+2","texto, com ""aspas""\ne linha"',
    )
  })

  it('protects formulas hidden behind control whitespace', () => {
    const csv = tableToCsv({
      columns: ['value'],
      rows: [{ value: '\t=CMD()' }],
      sourcePath: '$',
      warnings: [],
    })

    expect(csv).toBe('value\r\n"\'\t=CMD()"')
  })
})
describe('convertCsvToTable', () => {
  it('parses quoted CSV cells, escaped quotes and line breaks', () => {
    const table = convertCsvToTable('name,note\r\nAna,"texto, com ""aspas"""\r\nBeto,"duas\nlinhas"')

    expect(table.columns).toEqual(['name', 'note'])
    expect(table.rows).toEqual([
      { name: 'Ana', note: 'texto, com "aspas"' },
      { name: 'Beto', note: 'duas\nlinhas' },
    ])
  })

  it('detects semicolon delimiters and preserves values as strings', () => {
    const table = convertCsvToTable('id;active\n001;true')
    expect(table.rows).toEqual([{ id: '001', active: 'true' }])
  })

  it('renames empty and duplicate headers', () => {
    const table = convertCsvToTable('name,name,\nAna,A.,extra')
    expect(table.columns).toEqual(['name', 'name_2', 'coluna_3'])
    expect(table.warnings).toHaveLength(1)
  })

  it('serializes table rows as formatted JSON', () => {
    const table = convertCsvToTable('name,city\nAna,Contagem')
    expect(tableToJson(table)).toBe('[\n  {\n    "name": "Ana",\n    "city": "Contagem"\n  }\n]')
  })
})
