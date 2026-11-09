import type { ThemeId } from './types'

/** Thèmes = sections du cours (ancre #cours/<id>). */
export const themes: { id: ThemeId; label: string }[] = [
  { id: 'types', label: 'Types et coercition' },
  { id: 'scope', label: 'Portée, hoisting, TDZ' },
  { id: 'closures', label: 'Closures' },
  { id: 'this', label: 'this' },
  { id: 'prototypes', label: 'Prototypes et classes' },
  { id: 'eventloop', label: 'Event loop' },
  { id: 'async', label: 'Promesses et async/await' },
  { id: 'es6', label: 'ES6+' },
  { id: 'arrays', label: 'Tableaux et immutabilité' },
  { id: 'objects', label: 'Objets, références, copies' },
  { id: 'modules', label: 'Modules' },
  { id: 'dom', label: 'DOM et événements' },
  { id: 'perf', label: 'Performance' },
  { id: 'web', label: 'Bases du web' },
  { id: 'algo', label: 'Algorithmique' },
  { id: 'ts', label: 'TypeScript' },
]

export const themeLabel = (id: string) => themes.find((t) => t.id === id)?.label ?? id
