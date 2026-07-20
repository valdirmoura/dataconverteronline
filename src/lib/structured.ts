import { XMLBuilder } from 'fast-xml-parser'
import { dump } from 'js-yaml'
import type { ConversionTable } from './converter'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeIdentifier(value: string, fallback: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
  return /^[a-zA-Z_]/.test(normalized) ? normalized || fallback : `_${normalized || fallback}`
}

function pascalCase(value: string): string {
  const identifier = sanitizeIdentifier(value, 'Data')
  return identifier.replace(/(^|_)([a-zA-Z0-9])/g, (_, __, character: string) => character.toUpperCase())
}

export function jsonToXml(input: unknown, rootName = 'data'): string {
  const builder = new XMLBuilder({
    format: true,
    indentBy: '  ',
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build({ [rootName]: input })}`
}

export function jsonToYaml(input: unknown): string {
  return dump(input, { indent: 2, lineWidth: 100, noRefs: true })
}

export function tableToXml(table: ConversionTable): string {
  return jsonToXml({ row: table.rows }, 'rows')
}

export function flattenJson(input: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  function visit(value: unknown, path: string) {
    if (Array.isArray(value)) {
      if (!value.length) result[path] = []
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }
    if (isRecord(value)) {
      const entries = Object.entries(value)
      if (!entries.length) result[path] = {}
      entries.forEach(([key, item]) => visit(item, path ? `${path}.${key}` : key))
      return
    }
    result[path] = value
  }

  visit(input, '')
  return result
}

export function unflattenJson(input: Record<string, unknown>): unknown {
  const root: Record<string, unknown> = {}

  for (const [path, value] of Object.entries(input)) {
    const tokens = path.match(/[^.[\]]+/g) ?? []
    if (!tokens.length) continue
    let cursor: Record<string, unknown> | unknown[] = root

    tokens.forEach((token, index) => {
      const isLast = index === tokens.length - 1
      const nextIsIndex = /^\d+$/.test(tokens[index + 1] ?? '')
      const key: string | number = /^\d+$/.test(token) ? Number(token) : token
      const target = cursor as Record<string | number, unknown>
      if (isLast) {
        target[key] = value
        return
      }
      if (target[key] === undefined) target[key] = nextIsIndex ? [] : {}
      cursor = target[key] as Record<string, unknown> | unknown[]
    })
  }

  return root
}

function inferType(value: unknown, language: 'ts' | 'go' | 'python', name: string): string {
  if (value === null) return language === 'ts' ? 'unknown' : language === 'go' ? 'any' : 'Any'
  if (Array.isArray(value)) {
    const itemType = inferType(value[0], language, `${name}Item`)
    return language === 'ts' ? `${itemType}[]` : language === 'go' ? `[]${itemType}` : `list[${itemType}]`
  }
  if (isRecord(value)) return pascalCase(name)
  if (typeof value === 'string') return language === 'go' ? 'string' : 'string'
  if (typeof value === 'number') return language === 'go' ? 'float64' : language === 'python' ? 'float' : 'number'
  if (typeof value === 'boolean') return language === 'go' ? 'bool' : language === 'python' ? 'bool' : 'boolean'
  return 'unknown'
}

export function jsonToTypeScript(input: unknown, rootName = 'Data'): string {
  const definitions: string[] = []
  const seen = new Set<string>()

  function define(value: unknown, name: string) {
    if (!isRecord(value) || seen.has(name)) return
    seen.add(name)
    Object.entries(value).forEach(([key, child]) => define(child, pascalCase(key)))
    definitions.push(`export interface ${pascalCase(name)} {\n${Object.entries(value)
      .map(([key, child]) => `  '${key.replaceAll("'", "\\'")}'?: ${inferType(child, 'ts', key)}`)
      .join('\n')}\n}`)
  }

  const sample = Array.isArray(input) ? input[0] : input
  define(sample, rootName)
  return definitions.reverse().join('\n\n')
}

export function jsonToGoStruct(input: unknown, rootName = 'Data'): string {
  const sample = Array.isArray(input) ? input[0] : input
  if (!isRecord(sample)) throw new Error('Para gerar uma struct Go, o JSON precisa conter um objeto ou uma lista de objetos.')
  const lines = Object.entries(sample).map(([key, value]) =>
    `  ${pascalCase(key)} ${inferType(value, 'go', key)} \`json:"${key}"\``,
  )
  return `type ${pascalCase(rootName)} struct {\n${lines.join('\n')}\n}`
}

export function jsonToPythonClass(input: unknown, rootName = 'Data'): string {
  const sample = Array.isArray(input) ? input[0] : input
  if (!isRecord(sample)) throw new Error('Para gerar uma classe Python, o JSON precisa conter um objeto ou uma lista de objetos.')
  const lines = Object.entries(sample).map(([key, value]) =>
    `    ${sanitizeIdentifier(key, 'field')}: ${inferType(value, 'python', key)}`,
  )
  return `from dataclasses import dataclass\nfrom typing import Any\n\n@dataclass\nclass ${pascalCase(rootName)}:\n${lines.join('\n') || '    pass'}`
}