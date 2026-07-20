import { describe, expect, it } from 'vitest'
import {
  flattenJson,
  jsonToGoStruct,
  jsonToTypeScript,
  jsonToXml,
  jsonToYaml,
  jsonToPythonClass,
  unflattenJson,
} from './structured'

describe('structured exports', () => {
  const sample = { name: 'Vira', active: true, metrics: { total: 2 }, tags: ['local'] }

  it('exports JSON as XML and YAML', () => {
    expect(jsonToXml(sample)).toContain('<data>')
    expect(jsonToXml(sample)).toContain('<name>Vira</name>')
    expect(jsonToYaml(sample)).toContain('name: Vira')
  })

  it('flattens and restores nested JSON values', () => {
    const flat = flattenJson({ profile: { city: 'Contagem' }, items: [{ id: 1 }] })
    expect(flat).toEqual({ 'profile.city': 'Contagem', 'items[0].id': 1 })
    expect(unflattenJson(flat)).toEqual({ profile: { city: 'Contagem' }, items: [{ id: 1 }] })
  })

  it('generates code declarations from a JSON object', () => {
    expect(jsonToTypeScript(sample)).toContain('export interface Data')
    expect(jsonToGoStruct(sample)).toContain('type Data struct')
    expect(jsonToPythonClass(sample)).toContain('class Data:')
  })
})