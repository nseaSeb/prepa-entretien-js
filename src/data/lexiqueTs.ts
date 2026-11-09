import type { LexiqueEntry } from './types'

/** Vocabulaire TypeScript (les extraits sont vérifiés par le compilateur). */
export const tsLexique: LexiqueEntry[] = [
  {
    term: 'any',
    def: "Type qui **désactive** la vérification : tout est assignable à `any`, et `any` est assignable à tout ; on peut y lire n'importe quelle propriété ou l'appeler. Il se propage silencieusement aux valeurs qui en dérivent (« contagion »). À réserver aux migrations progressives depuis JavaScript ; pour une valeur de type inconnu, préférer `unknown`.",
    theme: 'ts',
    see: ['unknown', 'Assertion de type'],
  },
  {
    term: 'unknown',
    def: "Le « any sûr » : toute valeur est assignable à `unknown`, mais on ne peut rien en faire (lire une propriété, l'appeler, la passer à une fonction typée) avant de l'avoir **rétrécie** par un test (`typeof`, `in`, `instanceof`, garde de type). C'est le bon type pour les données externes (`JSON.parse`, réponses réseau) et pour la variable d'un `catch` (option `useUnknownInCatchVariables`, incluse dans `strict`).",
    theme: 'ts',
    see: ['any', 'Narrowing', 'Type guard'],
    lang: 'ts',
    code: `function len(v: unknown): number {
  if (typeof v === 'string' || Array.isArray(v)) return v.length
  return 0
}
len('abc') // → 3
len(42) // → 0`,
  },
  {
    term: 'never',
    def: "Le type vide : aucune valeur ne l'habite. C'est le type de retour d'une fonction qui ne rend jamais la main (elle lève toujours une erreur ou boucle à l'infini), le résultat d'un narrowing qui a éliminé tous les cas, et l'élément neutre des unions (`string | never` vaut `string`). On s'en sert pour la **vérification d'exhaustivité** d'un `switch`.",
    theme: 'ts',
    see: ['Union discriminée', 'Narrowing'],
    lang: 'ts',
    code: `type A = string | never // → string
type B = Exclude<'a' | 'b', 'a' | 'b'> // → never

function fail(message: string): never {
  throw new Error(message)
}`,
  },
  {
    term: 'Typage structurel',
    def: "Principe de TypeScript : deux types sont compatibles s'ils ont la **même forme** (les mêmes propriétés avec des types compatibles), quel que soit leur nom ou leur déclaration. On l'appelle aussi *duck typing* statique. À l'opposé, Java ou C# ont un typage **nominal** (un type n'est compatible que s'il est déclaré comme tel). Conséquence : un objet peut avoir plus de propriétés que son type n'en décrit.",
    theme: 'ts',
    see: ['TypeScript', 'Inférence de type'],
    lang: 'ts',
    code: `type Point = { x: number; y: number }
class Vector {
  constructor(public x: number, public y: number) {}
}
const p: Point = new Vector(1, 2) // compatible : même forme
const norm = (pt: Point) => Math.hypot(pt.x, pt.y)
norm({ x: 3, y: 4 }) // → 5`,
  },
  {
    term: 'Inférence de type',
    def: "Capacité du compilateur à déduire un type sans annotation : à partir de l'initialisation (`const n = 1` a le type littéral `1`, `let n = 1` le type `number`), du retour d'une fonction, ou du contexte (le paramètre d'un callback passé à `map` est typé par le tableau). Bonne pratique : annoter les frontières (paramètres, retours exportés), laisser inférer le reste.",
    theme: 'ts',
    see: ['Type littéral', 'Générique'],
    lang: 'ts',
    code: `const a = 1
let b = 1
const xs = [1, 'a']
type A = typeof a // → 1
type B = typeof b // → number
type Xs = typeof xs // → (string | number)[]`,
  },
  {
    term: 'Type littéral',
    def: "Type qui ne contient qu'une seule valeur : `'GET'`, `42`, `true`. Combinés en union (`'GET' | 'POST'`), ils remplacent avantageusement les enums. `as const` fige un littéral : chaînes et nombres gardent leur type littéral, les tableaux deviennent des tuples `readonly`, les propriétés deviennent `readonly`.",
    theme: 'ts',
    see: ['Inférence de type', 'satisfies'],
    lang: 'ts',
    code: `const methods = ['GET', 'POST'] as const
type Method = (typeof methods)[number] // → 'GET' | 'POST'
const config = { retries: 3 } as const
type Config = typeof config // → { readonly retries: 3 }`,
  },
  {
    term: 'Narrowing',
    def: "Rétrécissement : à l'intérieur d'une branche, le compilateur réduit le type d'une variable d'après les tests effectués (`typeof x === 'string'`, `x !== null`, `'kind' in x`, `x instanceof Date`, égalité avec un littéral, garde de type). C'est l'analyse de flux de contrôle (*control flow analysis*). Le rétrécissement des propriétés est perdu dans les callbacks.",
    theme: 'ts',
    see: ['Type guard', 'Union discriminée', 'unknown'],
    lang: 'ts',
    code: `function format(v: string | number | Date): string {
  if (typeof v === 'string') return v.toUpperCase()
  if (v instanceof Date) return v.toISOString().slice(0, 4)
  return v.toFixed(1) // ici v : number
}
format(2.345) // → '2.3'`,
  },
  {
    term: 'Union discriminée',
    def: "Union d'objets qui partagent une propriété littérale, le **discriminant** (souvent `kind`, `type` ou `status`). Tester ce discriminant rétrécit l'objet entier vers le bon membre. Associée à un `switch` et à une vérification d'exhaustivité par `never`, elle modélise proprement des états (chargement / succès / erreur) ou des actions de reducer.",
    theme: 'ts',
    see: ['Narrowing', 'never'],
    lang: 'ts',
    code: `type State =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }

function render(s: State): string {
  switch (s.status) {
    case 'loading': return '…'
    case 'success': return s.data.join(', ')
    case 'error': return 'Erreur : ' + s.message
  }
}
render({ status: 'success', data: ['a', 'b'] }) // → 'a, b'`,
  },
  {
    term: 'Type guard',
    def: "Garde de type : fonction dont le type de retour est un **prédicat** `x is T`. Quand elle renvoie `true`, le compilateur rétrécit l'argument en `T` chez l'appelant. Variante : la **fonction d'assertion** (`asserts x is T`), qui lève une erreur sinon. Attention : le compilateur fait confiance au prédicat, un prédicat faux ment comme un `as`.",
    theme: 'ts',
    see: ['Narrowing', 'Assertion de type'],
    lang: 'ts',
    code: `type Cat = { meow(): string }
type Dog = { bark(): string }
const isCat = (a: Cat | Dog): a is Cat => 'meow' in a

const pets: (Cat | Dog)[] = [{ meow: () => 'miaou' }, { bark: () => 'ouaf' }]
const cats = pets.filter(isCat)
type Cats = typeof cats // → Cat[]
cats.length // → 1`,
  },
  {
    term: 'Assertion de type',
    def: "`valeur as T` (ou `<T>valeur` hors JSX) : on affirme au compilateur le type d'une valeur. Aucune vérification ni conversion à l'exécution : si l'affirmation est fausse, l'erreur arrive plus tard. TypeScript refuse seulement les assertions entre types sans aucun recouvrement (il faut alors passer par `unknown`). Variante : l'opérateur `!` (non-null assertion) retire `null | undefined`.",
    theme: 'ts',
    see: ['satisfies', 'Type guard', 'any'],
    lang: 'ts',
    code: `const asInput = (el: Element | null) => el as HTMLInputElement | null // on « sait » que c'est un input
// @ts-expect-error : aucun recouvrement entre string et number
const n = 'texte' as number
const forced = 'texte' as unknown as number // possible… et dangereux`,
  },
  {
    term: 'satisfies',
    def: "Opérateur (TS 4.9) qui **vérifie** qu'une expression est compatible avec un type sans **changer** son type inféré. Contrairement à une annotation (`const x: T`), on garde les types littéraux et les clés précises ; contrairement à `as`, une erreur est signalée si la valeur ne convient pas.",
    theme: 'ts',
    see: ['Assertion de type', 'Type littéral'],
    lang: 'ts',
    code: `type Routes = Record<string, { path: string }>

const annotated: Routes = { home: { path: '/' } }
const checked = { home: { path: '/' } } satisfies Routes

checked.home.path // → '/'
annotated.about // compile : Record<string, …> accepte n'importe quelle clé
// @ts-expect-error : checked garde ses clés précises, about n'existe pas
checked.about`,
  },
  {
    term: 'Générique',
    def: "Paramètre de type (`<T>`) qui rend une fonction, une classe ou un type réutilisable tout en conservant le lien entre entrées et sorties (`identity<T>(x: T): T`). On peut le **contraindre** (`<T extends { id: number }>`), lui donner une **valeur par défaut** (`<T = string>`), et il est le plus souvent inféré à l'appel.",
    theme: 'ts',
    see: ['Inférence de type', 'Type conditionnel'],
    lang: 'ts',
    code: `function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}
function byId<T extends { id: number }>(items: T[], id: number) {
  return items.find((x) => x.id === id)
}
const f = first(['a', 'b'])
type F = typeof f // → string | undefined
byId([{ id: 1, name: 'Ada' }], 1)?.name // → 'Ada'`,
  },
  {
    term: 'Type conditionnel',
    def: "Type de la forme `T extends U ? X : Y` : un « if » au niveau des types. Avec `infer`, on extrait une partie d'un type (`T extends Promise<infer V> ? V : T`). Appliqué à un paramètre de type nu, il est **distributif** sur les unions (chaque membre est traité séparément) ; l'écrire `[T] extends [U]` désactive la distribution.",
    theme: 'ts',
    see: ['Générique', 'Utility types', 'never'],
    lang: 'ts',
    code: `type Unwrap<T> = T extends Promise<infer V> ? V : T
type A = Unwrap<Promise<number>> // → number
type IsString<T> = T extends string ? 'oui' : 'non'
type D = IsString<string | number> // → 'oui' | 'non'
type ND<T> = [T] extends [string] ? 'oui' : 'non'
type E = ND<string | number> // → 'non'`,
  },
  {
    term: 'Mapped type',
    def: "Type construit en parcourant des clés : `{ [K in keyof T]: … }`. On peut ajouter ou retirer les modificateurs (`readonly`, `?`, avec `+`/`-`) et **renommer les clés** avec `as` (*key remapping*), y compris pour filtrer (une clé remappée vers `never` disparaît). C'est le mécanisme derrière `Partial`, `Readonly`, `Pick` ou `Record`.",
    theme: 'ts',
    see: ['Utility types', 'Type conditionnel'],
    lang: 'ts',
    code: `type User = { id: number; name: string }
type Mutable<T> = { -readonly [K in keyof T]: T[K] }
type Getters<T> = { [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K] }
type G = Getters<User> // → { getId: () => number; getName: () => string }
type M = Mutable<Readonly<User>> // → { id: number; name: string }`,
  },
  {
    term: 'Utility types',
    def: "Types génériques fournis par TypeScript pour transformer des types : `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`… Ils sont écrits avec des mapped types et des types conditionnels, et savoir en réécrire un (`Pick`, `Readonly`) est un exercice d'entretien classique.",
    theme: 'ts',
    see: ['Mapped type', 'Type conditionnel'],
    lang: 'ts',
    code: `type User = { id: number; name: string; email?: string }
type Patch = Partial<Omit<User, 'id'>> // → { name?: string; email?: string }
type Fn = (a: string, b: number) => Promise<boolean>
type P = Parameters<Fn> // → [a: string, b: number]
type R = Awaited<ReturnType<Fn>> // → boolean`,
  },
  {
    term: 'Fichier de déclaration (.d.ts)',
    def: "Fichier qui ne contient que des **types**, sans code exécutable : il décrit l'API d'une bibliothèque JavaScript (`declare function`, `declare module 'lib'`, `declare global`). Les paquets publiés en TS les génèrent (`declaration: true`) ; pour les autres, la communauté les maintient dans DefinitelyTyped (paquets `@types/…`).",
    theme: 'ts',
    see: ['TypeScript', 'Transpilation'],
    lang: 'ts',
    code: `// @filename: legacy.d.ts
declare module 'legacy-slugify' {
  export default function slugify(text: string, sep?: string): string
}
// @filename: main.ts
import slugify from 'legacy-slugify'
const s: string = slugify('Hello World')`,
  },
]
