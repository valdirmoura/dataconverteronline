import { describe, expect, it } from 'vitest'
import { convertJsonToTable, tableToCsv } from './converter'

describe('convertJsonToTable', () => {
  it('turns an array of objects into a table and flattens nested fields', () => {
    const table = convertJsonToTable([
      { name: 'Ana', profile: { city: 'Contagem' } },
      { name: 'Beto', profile: { city: 'Belo Horizonte' } },
    ])

    expect(table).toEqual({
      columns: ['name', 'profile.city'],
      rows: [
        { name: 'Ana', 'profile.city': 'Contagem' },
        { name: 'Beto', 'profile.city': 'Belo Horizonte' },
      ],
      sourcePath: '$',
      warnings: [],
    })
  })

  it('finds the largest object collection in a JSON export', () => {
    const table = convertJsonToTable({
      name: 'Meu quadro',
      lists: [{ id: 'l1', name: 'Backlog' }],
      cards: [
        { id: 'c1', name: 'Primeiro cartão' },
        { id: 'c2', name: 'Segundo cartão' },
      ],
    })

    expect(table.sourcePath).toBe('$.cards')
    expect(table.rows).toHaveLength(2)
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
})
