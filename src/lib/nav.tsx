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
  /** Charge du code dans le playground (onglet JS ou TS) et y bascule */
  openInPlayground: (code: string, lang?: Lang) => void
}

export type Lang = 'js' | 'ts'

export const NavContext = createContext<Nav>(null as unknown as Nav)
export const useNav = () => useContext(NavContext)

export const DEFAULT_CODE = `// Écris du JavaScript ici, puis ⌘/Ctrl + Entrée.
console.log('Début')
setTimeout(() => console.log('Macrotâche (setTimeout)'), 0)
Promise.resolve().then(() => console.log('Microtâche (promesse)'))
console.log('Fin du code synchrone')
`

export const DEFAULT_TS_CODE = `// TypeScript strict (ES2022, lib dom). Erreurs de type à droite, survol = type inféré.
type User = { id: number; name: string; email?: string }

function greet(user: User): string {
  return \`Bonjour \${user.name}\`
}

const ada = { id: 1, name: 'Ada' } satisfies User
console.log(greet(ada))

// @ts-expect-error : name manquant
greet({ id: 2 })

// Equal / Expect sont disponibles pour tester des types
type Keys = keyof User
type _check = Expect<Equal<Keys, 'id' | 'name' | 'email'>>
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
