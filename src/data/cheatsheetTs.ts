import type { CheatSection } from './types'

/*
 * Antisèche TypeScript : extraits `lang: 'ts'`, compilés en mode strict ;
 * les lignes `type X = … // → T` sont vérifiées par le compilateur.
 */
export const tsCheatsheet: CheatSection[] = [
  {
    id: 'ts',
    title: 'TypeScript',
    blocks: [
      {
        title: 'Inférence et littéraux',
        lang: 'ts',
        code: `let a = 'x'
const b = 'x'
const c = ['x', 1] as const
type A = typeof a // → string
type B = typeof b // → 'x'
type C = typeof c // → readonly ['x', 1]`,
      },
      {
        title: 'any / unknown / never',
        items: [
          '`any` : plus de vérification, contagieux',
          '`unknown` : tout entre, rien ne sort sans narrowing',
          '`never` : aucune valeur ; disparaît dans une union',
          'données externes (`JSON.parse`, API) → `unknown` + garde',
        ],
      },
      {
        title: 'Narrowing',
        items: [
          '`typeof x === \'string\'`, `x instanceof Date`, `\'k\' in x`',
          'union discriminée : `switch (x.kind)`',
          'exhaustivité : `const n: never = x` en `default`',
          'garde : `(x: unknown): x is T` ; assertion : `asserts x is T`',
        ],
      },
      {
        title: 'Génériques',
        lang: 'ts',
        code: `function get<T, K extends keyof T>(o: T, k: K): T[K] {
  return o[k]
}
const n = get({ id: 1, name: 'Ada' }, 'id')
type N = typeof n // → number
type Box<T = string> = { value: T }
type D = Box['value'] // → string`,
      },
      {
        title: 'keyof / typeof / T[K]',
        lang: 'ts',
        code: `const cfg = { port: 80, host: 'localhost' }
type Keys = keyof typeof cfg // → 'port' | 'host'
type Values = (typeof cfg)[Keys] // → number | string
type Item = string[][number] // → string`,
      },
      {
        title: 'Types utilitaires',
        lang: 'ts',
        code: `type U = { id: number; name?: string }
type P = Partial<U> // → { id?: number; name?: string }
type R = Required<U> // → { id: number; name: string }
type O = Omit<U, 'name'> // → { id: number }
type E = Exclude<'a' | 'b' | 'c', 'a'> // → 'b' | 'c'
type Ret = ReturnType<() => Promise<U>> // → Promise<U>
type Aw = Awaited<Promise<Promise<number>>> // → number`,
      },
      {
        title: 'Mappés, conditionnels, template',
        lang: 'ts',
        code: `type RO<T> = { readonly [K in keyof T]: T[K] }
type Opt<T> = { [K in keyof T]-?: T[K] }
type Elem<T> = T extends (infer E)[] ? E : never
type On<T extends string> = \`on\${Capitalize<T>}\`
type X1 = RO<{ a: 1 }> // → { readonly a: 1 }
type X2 = Elem<number[]> // → number
type X3 = On<'click' | 'blur'> // → 'onClick' | 'onBlur'
type X4 = Elem<string[] | boolean[]> // → string | boolean`,
      },
      {
        title: 'Annotation, satisfies, as',
        items: [
          '`const x: T = v` : vérifie, type élargi à `T`',
          '`v satisfies T` : vérifie, garde le type précis',
          '`v as T` : affirme, ne vérifie (presque) rien',
          '`x!` : retire `null | undefined` sans vérifier',
        ],
      },
      {
        title: 'type vs interface',
        items: [
          '`interface` : objets/classes, `extends`, fusion de déclarations',
          '`type` : tout (unions, tuples, calculs), pas de fusion',
          '`A & B` en conflit → propriété `never` ; `extends` → erreur',
        ],
      },
      {
        title: 'tsconfig à connaître',
        items: [
          '`strict` : `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`…',
          '`noUncheckedIndexedAccess` : `arr[i]` est `T | undefined`',
          '`exactOptionalPropertyTypes` : `a?: T` refuse `undefined` explicite',
          '`verbatimModuleSyntax` / `isolatedModules` : `import type` obligatoire pour les types',
        ],
      },
    ],
  },
]
