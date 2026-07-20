import { describe, expect, it } from 'vitest'
import { markdownToHtml, markdownToText } from './text'

describe('conversões de texto', () => {
  it('converte Markdown em HTML seguro e estruturado', () => {
    expect(markdownToHtml('# Título\n\n- **um**')).toBe('<h1>Título</h1>\n<ul>\n<li><strong>um</strong></li>\n</ul>')
  })

  it('remove marcas de Markdown para texto simples', () => {
    expect(markdownToText('## Nota\n[site](https://example.com) e **ênfase**')).toBe('Nota\nsite e ênfase')
  })
})