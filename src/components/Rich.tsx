import type { ReactNode } from 'react'
import { C } from './ui'

/** `code` et **gras** dans une ligne de texte. */
export function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{inline(part.slice(2, -2))}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <C key={i}>{part.slice(1, -1)}</C>
    return part
  })
}

/** Markdown minimal des contenus : paragraphes (ligne vide), listes « - » ou « 1. », `code`, **gras**. */
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split('\n')
        if (lines.every((l) => /^\s*[-*]\s/.test(l)))
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {lines.map((l, k) => <li key={k}>{inline(l.replace(/^\s*[-*]\s/, ''))}</li>)}
            </ul>
          )
        if (lines.every((l) => /^\s*\d+[.)]\s/.test(l)))
          return (
            <ol key={i} className="my-2 list-decimal space-y-1 pl-5">
              {lines.map((l, k) => <li key={k}>{inline(l.replace(/^\s*\d+[.)]\s/, ''))}</li>)}
            </ol>
          )
        // paragraphe suivi éventuellement d'une liste
        const firstItem = lines.findIndex((l) => /^\s*([-*]|\d+[.)])\s/.test(l))
        if (firstItem > 0) {
          const ordered = /^\s*\d/.test(lines[firstItem])
          const items = lines.slice(firstItem).map((l) => l.replace(/^\s*([-*]|\d+[.)])\s/, ''))
          const List = ordered ? 'ol' : 'ul'
          return (
            <div key={i}>
              <p className="my-2 leading-relaxed">{inline(lines.slice(0, firstItem).join(' '))}</p>
              <List className={`my-2 space-y-1 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>
                {items.map((l, k) => <li key={k}>{inline(l)}</li>)}
              </List>
            </div>
          )
        }
        return (
          <p key={i} className="my-2 leading-relaxed">
            {inline(lines.join(' '))}
          </p>
        )
      })}
    </div>
  )
}
