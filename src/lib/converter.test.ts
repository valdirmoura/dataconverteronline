import { describe, expect, it } from 'vitest'
import {
  convertJsonToTable,
  discoverJsonCollections,
  tableToCsv,
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
