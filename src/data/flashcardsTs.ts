import type { Flashcard } from './types'

export const tsFlashcards: Flashcard[] = [
  {
    id: 'ts-f1',
    theme: 'ts',
    front: 'Typage structurel : qu’est-ce que cela veut dire ?',
    back: "Deux types sont compatibles s'ils ont la **même forme**, quel que soit leur nom : un objet qui possède au moins les propriétés attendues est accepté. C'est le *duck typing* vérifié à la compilation (Java ou C# sont nominaux).",
    lang: 'ts',
    code: `type Point = { x: number; y: number }
class Vec { constructor(public x: number, public y: number) {} }

const p: Point = new Vec(1, 2) // accepté : même forme
console.log(p.x + p.y)`,
    output: '3',
  },
  {
    id: 'ts-f2',
    theme: 'ts',
    front: '`interface` ou `type` : quelles différences ?',
    back: "- `interface` : formes d'objets, **fusion de déclarations**, `extends` (erreur en cas de conflit) ;\n- `type` : n'importe quel type (unions, tuples, conditionnels, mapped), pas de fusion, combinaison par `&`.\n\nRègle courante : `interface` pour les objets publics extensibles, `type` pour le reste.",
  },
  {
    id: 'ts-f3',
    theme: 'ts',
    front: '`any`, `unknown`, `never` en une phrase chacun',
    back: "- `any` : désactive la vérification et se propage (à éviter) ;\n- `unknown` : accepte tout, mais oblige à rétrécir avant usage (données externes) ;\n- `never` : aucune valeur (branche impossible, fonction qui ne rend jamais la main).",
    lang: 'ts',
    code: `const raw: unknown = JSON.parse('42')
// @ts-expect-error : unknown doit être rétréci
raw.toFixed()
if (typeof raw === 'number') console.log(raw.toFixed(1))`,
    output: '42.0',
  },
  {
    id: 'ts-f4',
    theme: 'ts',
    front: 'Qu’est-ce que le narrowing (rétrécissement) ?',
    back: "L'analyse de flux de contrôle affine le type d'une variable après un test : `typeof`, `instanceof`, `in`, égalité, test de vérité, propriété discriminante, garde de type. Dans chaque branche, la variable a le type restant.",
    lang: 'ts',
    code: `function show(v: string | number[]) {
  if (typeof v === 'string') return v.toUpperCase()
  return v.join('-') // ici v : number[]
}
console.log(show('ts'), show([1, 2]))`,
    output: 'TS 1-2',
  },
  {
    id: 'ts-f5',
    theme: 'ts',
    front: 'Union discriminée et vérification d’exhaustivité',
    back: "Une union d'objets qui partagent une propriété littérale (`kind`, `type`, `status`). Un `switch` sur cette propriété rétrécit chaque cas ; dans `default`, affecter la valeur à une variable `never` fait échouer la compilation si un cas est oublié.",
    lang: 'ts',
    code: `type Result = { ok: true; value: number } | { ok: false; error: string }

function unwrap(r: Result): number {
  if (r.ok) return r.value
  throw new Error(r.error)
}
console.log(unwrap({ ok: true, value: 7 }))`,
    output: '7',
  },
  {
    id: 'ts-f6',
    theme: 'ts',
    front: 'Que fait `as const` ?',
    back: "Il empêche l'élargissement : les littéraux gardent leur type exact (`'GET'` et non `string`), les propriétés deviennent `readonly` et les tableaux des tuples en lecture seule.",
    lang: 'ts',
    code: `const methods = ['GET', 'POST'] as const
type Method = (typeof methods)[number] // → "GET" | "POST"`,
  },
  {
    id: 'ts-f7',
    theme: 'ts',
    front: '`satisfies` vs annotation vs `as`',
    back: "- annotation `const x: T = …` : vérifie **et** impose le type `T` (on perd la précision) ;\n- `… satisfies T` : vérifie, mais garde le type inféré ;\n- `… as T` : ne vérifie presque rien, on affirme au compilateur (à réserver aux cas où l'on sait mieux que lui).",
    lang: 'ts',
    code: `type Colors = Record<string, string>
const palette = { primary: '#4f46e5' } satisfies Colors
type P = keyof typeof palette // → "primary"`,
  },
  {
    id: 'ts-f8',
    theme: 'ts',
    front: 'Génériques : à quoi servent `extends` et une valeur par défaut ?',
    back: "`<T extends Contrainte>` limite les types acceptés et donne accès à leurs membres dans le corps. `<T = Défaut>` fournit un type quand il n'est ni passé ni inférable. L'inférence déduit `T` des arguments.",
    lang: 'ts',
    code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
console.log(longest('abc', 'de'), longest([1], [1, 2]))`,
    output: 'abc [ 1, 2 ]',
  },
  {
    id: 'ts-f9',
    theme: 'ts',
    front: '`keyof`, `typeof` et accès indexé `T[K]`',
    back: "- `keyof T` : union des clés de `T` ;\n- `typeof valeur` (en position de type) : type d'une variable ;\n- `T[K]` : type de la propriété `K` (et `T[number]` pour les éléments d'un tableau).",
    lang: 'ts',
    code: `const user = { id: 1, name: 'Ada' }
type User = typeof user
type Keys = keyof User // → "id" | "name"
type Name = User['name'] // → string`,
  },
  {
    id: 'ts-f10',
    theme: 'ts',
    front: 'Les types utilitaires à connaître',
    back: "`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`. Tous sont écrits en TypeScript lui-même (mapped et conditional types).",
    lang: 'ts',
    code: `type User = { id: number; name: string }
type Patch = Partial<User> // → { id?: number; name?: string }
type Ids = Record<'a' | 'b', number> // → { a: number; b: number }
type N = NonNullable<string | null> // → string`,
  },
  {
    id: 'ts-f11',
    theme: 'ts',
    front: 'Mapped type et remappage de clés (`as`)',
    back: "`{ [K in keyof T]: … }` transforme chaque propriété (en gardant `?` et `readonly`, modifiables avec `+`/`-`). La clause `as` renomme ou filtre les clés (`never` supprime la clé).",
    lang: 'ts',
    code: `type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] }
type G = Getters<{ name: string }> // → { getName: () => string }`,
  },
  {
    id: 'ts-f12',
    theme: 'ts',
    front: 'Types conditionnels, `infer` et distributivité',
    back: "`T extends U ? X : Y` choisit un type ; `infer R` capture une partie du type testé. Sur un paramètre nu, la condition **se distribue** sur chaque membre d'une union ; l'entourer de crochets (`[T] extends [U]`) l'empêche.",
    lang: 'ts',
    code: `type Unpack<T> = T extends Promise<infer V> ? V : T
type A = Unpack<Promise<number> | string> // → number | string`,
  },
  {
    id: 'ts-f13',
    theme: 'ts',
    front: 'Template literal types',
    back: "Des types chaînes construits comme des gabarits : `` `on${string}` ``, combinaisons d'unions, et les intrinsèques `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Avec `infer`, on peut aussi découper une chaîne au niveau des types.",
    lang: 'ts',
    code: `type Size = 'sm' | 'lg'
type Cls = \`btn-\${Size}\` // → "btn-sm" | "btn-lg"`,
  },
  {
    id: 'ts-f14',
    theme: 'ts',
    front: 'Garde de type vs fonction d’assertion',
    back: "- garde : `function isX(v: unknown): v is X` renvoie un booléen, le type est rétréci dans le `if` ;\n- assertion : `function assertX(v: unknown): asserts v is X` lève sinon, le type est rétréci **après** l'appel.\n\nDans les deux cas, TypeScript fait confiance au corps : un test faux ment autant qu'un `as`.",
  },
  {
    id: 'ts-f15',
    theme: 'ts',
    front: 'Propriété optionnelle `a?: T` vs `a: T | undefined`',
    back: "`a?: T` : la propriété peut être **absente** (ou valoir `undefined`, sauf avec `exactOptionalPropertyTypes`). `a: T | undefined` : la propriété est **obligatoire**, mais sa valeur peut être `undefined`.",
    lang: 'ts',
    code: `type A = { a?: string }
type B = { a: string | undefined }
const ok: A = {}
// @ts-expect-error : a est obligatoire dans B
const ko: B = {}`,
  },
  {
    id: 'ts-f16',
    theme: 'ts',
    front: '`enum` ou union de littéraux ?',
    back: "Un `enum` émet du code (objet, mapping inverse pour les numériques), un enum de chaînes est nominal, et ils ne sont pas compatibles avec `erasableSyntaxOnly`. Une union de littéraux n'émet rien ; pour une valeur à l'exécution, on dérive l'union d'un objet `as const`.",
    lang: 'ts',
    code: `enum Dir { Up, Down }
console.log(Dir[0], Dir.Down) // mapping inverse des enums numériques

const DIRS = { Up: 'up', Down: 'down' } as const
type D = (typeof DIRS)[keyof typeof DIRS] // → "up" | "down"`,
    output: 'Up 1',
  },
  {
    id: 'ts-f17',
    theme: 'ts',
    front: 'Surcharges de fonctions',
    back: "Plusieurs signatures suivies d'**une** implémentation compatible avec toutes. Seules les signatures de surcharge sont visibles par l'appelant, pas celle de l'implémentation. Souvent, une union ou un générique suffit et reste plus simple.",
    lang: 'ts',
    code: `function parse(v: string): number
function parse(v: number): string
function parse(v: string | number) {
  return typeof v === 'string' ? Number(v) : String(v)
}
const n = parse('42')
type N = typeof n // → number`,
  },
  {
    id: 'ts-f18',
    theme: 'ts',
    front: 'Classes TypeScript : modificateurs et propriétés de paramètre',
    back: "`public` (défaut), `protected`, `private` (vérifiés à la compilation seulement, contrairement à `#private`), `readonly`, `abstract`, `implements` (contrat vérifié, n'ajoute rien). Une propriété de paramètre (`constructor(private name: string)`) déclare et affecte en une fois.",
    lang: 'ts',
    code: `abstract class Animal {
  constructor(protected readonly name: string) {}
  abstract speak(): string
}
class Dog extends Animal {
  speak() { return \`\${this.name} : wouf\` }
}
console.log(new Dog('Rex').speak())`,
    output: 'Rex : wouf',
  },
  {
    id: 'ts-f19',
    theme: 'ts',
    front: 'Que fait `noUncheckedIndexedAccess` ?',
    back: "Un accès par index (`arr[i]`, `record[key]`) renvoie `T | undefined` au lieu de `T` : on doit traiter l'absence. Cette option n'est **pas** incluse dans `strict`, mais elle est recommandée.",
    lang: 'ts',
    code: `// @noUncheckedIndexedAccess: true
const list = ['a', 'b']
const first = list[0]
type F = typeof first // → string | undefined
console.log(first?.toUpperCase() ?? 'vide')`,
    output: 'A',
  },
  {
    id: 'ts-f20',
    theme: 'ts',
    front: '`import type` : à quoi ça sert ?',
    back: "Importer uniquement des types : l'import est garanti effacé à la compilation (aucun module chargé à l'exécution, pas de cycle d'import créé). Avec `verbatimModuleSyntax`, TypeScript **exige** `import type` pour ce qui n'est qu'un type.",
  },
  {
    id: 'ts-f21',
    theme: 'ts',
    front: 'Un fichier `.d.ts`, c’est quoi ?',
    back: "Un fichier de **déclarations** : uniquement des types, pas de code. Il décrit une bibliothèque JavaScript (`declare module 'lib'`), des globales (`declare global`) ou augmente un module existant. Les paquets les publient eux-mêmes ou via `@types/…`.",
  },
]
