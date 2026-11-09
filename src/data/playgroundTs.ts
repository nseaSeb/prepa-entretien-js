import { DEFAULT_TS_CODE } from '../lib/nav'

/** Exemples TypeScript (le premier compile sans erreur, « Erreurs de type » en montre volontairement). */
export const TS_EXAMPLES: [string, string][] = [
  ['Bases', DEFAULT_TS_CODE],
  [
    'Narrowing',
    `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number }

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.r ** 2 // ici s : { kind: 'circle'; r: number }
    case 'square':
      return s.side ** 2
    default: {
      const never: never = s // vérification d'exhaustivité
      return never
    }
  }
}

console.log(area({ kind: 'square', side: 3 }))
console.log(area({ kind: 'circle', r: 1 }).toFixed(2))`,
  ],
  [
    'Génériques',
    `function groupBy<T, K extends PropertyKey>(items: readonly T[], key: (item: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {}
  for (const item of items) (out[key(item)] ??= []).push(item)
  return out
}

const users = [
  { name: 'Ada', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Cid', role: 'user' },
] as const

const byRole = groupBy(users, (u) => u.role) // survole byRole
console.log(byRole.user?.map((u) => u.name))`,
  ],
  [
    'Types utilitaires',
    `type User = { id: number; name: string; email?: string }

type Draft = Partial<User>
type Public = Omit<User, 'email'>
type Keys = keyof User
type Getters = { [K in keyof User as \`get\${Capitalize<K>}\`]: () => User[K] }

type _1 = Expect<Equal<Public, { id: number; name: string }>>
type _2 = Expect<Equal<Keys, 'id' | 'name' | 'email'>>
// survole Getters pour voir le type calculé
const draft: Draft = {}
console.log(Object.keys(draft).length)`,
  ],
  [
    'Erreurs de type',
    `type User = { id: number; name: string }

const u: User = { id: 1, name: 'Ada', age: 36 } // propriété en trop sur un littéral frais
const id: string = u.id // number n'est pas string
u.nmae // faute de frappe repérée

function len(s: string | null) {
  return s.length // s peut être null (strictNullChecks)
}
console.log('le JS est quand même émis et exécuté :', len('abc'))`,
  ],
]
