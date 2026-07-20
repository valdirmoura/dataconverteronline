function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const output: string[] = []
  let listOpen = false

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    const item = line.match(/^[-*]\s+(.+)$/)
    if (heading) {
      if (listOpen) { output.push('</ul>'); listOpen = false }
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`)
    } else if (item) {
      if (!listOpen) { output.push('<ul>'); listOpen = true }
      output.push(`<li>${inlineMarkdown(item[1])}</li>`)
    } else if (line.trim()) {
      if (listOpen) { output.push('</ul>'); listOpen = false }
      output.push(`<p>${inlineMarkdown(line)}</p>`)
    } else if (listOpen) {
      output.push('</ul>')
      listOpen = false
    }
  }
  if (listOpen) output.push('</ul>')
  return output.join('\n')
}

export function markdownToText(markdown: string) {
  return markdown
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/[`*_>]/g, '')
}