import { createContext, useContext } from 'react'

export type Page =
  | 'accueil'
  | 'methode'
  | 'cours'
  | 'lexique'
  | 'cheatsheet'
  | 'pieges'
  | 'playground'
  | 'katas'
  | 'quiz'
  | 'flashcards'
  | 'entretien'

type Nav = {
  page: Page
  go: (page: Page, anchor?: string) => void
  /** Charge du code dans le playground et y bascule */
  openInPlayground: (code: string) => void
}

export const NavContext = createContext<Nav>(null as unknown as Nav)
export const useNav = () => useContext(NavContext)

export const DEFAULT_CODE = `// Écris du JavaScript ici, puis ⌘/Ctrl + Entrée.
console.log('Début')
setTimeout(() => console.log('Macrotâche (setTimeout)'), 0)
Promise.resolve().then(() => console.log('Microtâche (promesse)'))
console.log('Fin du code synchrone')
`

/** `#page/ancre` → [page, ancre décodée]. Une ancre mal encodée (`#cours/%`) est rendue telle quelle. */
export function parseHash(hash: string, pageIds: readonly string[]): [Page, string | undefined] {
  const [p, anchor] = hash.replace(/^#/, '').split('/')
  let decoded = anchor
  if (anchor) {
    try {
      decoded = decodeURIComponent(anchor)
    } catch {
      decoded = anchor
    }
  }
  return [pageIds.includes(p) ? (p as Page) : 'accueil', decoded || undefined]
}
