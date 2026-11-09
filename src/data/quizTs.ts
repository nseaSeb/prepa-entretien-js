import type { QuizItem } from './types'

const COMPILE = 'Ce code compile-t-il (strict: true) ?'

export const tsQuiz: QuizItem[] = [
  // ───────────── compile ─────────────
  {
    id: 'ts-q1',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type User = { id: number; name: string }

const u: User = { id: 1, name: 'Ada', age: 36 }

const extra = { id: 2, name: 'Bob', age: 40 }
const v: User = extra`,
    choices: ['Compile sans erreur', 'Erreur ligne 3 : propriété age inconnue', 'Erreur ligne 6 : propriété age inconnue', 'Erreurs lignes 3 et 6'],
    answer: 1,
    why: "Le contrôle des propriétés en trop (*excess property check*) ne s'applique qu'aux **littéraux frais** affectés directement à un type. Ligne 6, `extra` est une variable : son type `{ id; name; age }` est structurellement compatible avec `User` (il a au moins `id` et `name`), donc aucune erreur.",
  },
  {
    id: 'ts-q2',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `function len(s: string | null): number {
  if (typeof s === 'string') {
    return s.length
  }
  return s.length
}`,
    choices: ['Compile sans erreur', 'Erreur ligne 3 : s est possiblement null', 'Erreur ligne 5 : s est possiblement null', 'Erreurs lignes 3 et 5'],
    answer: 2,
    why: "Dans le `if`, `typeof s === 'string'` rétrécit `s` à `string`. Après le `if` (qui se termine par `return`), il ne reste que `null` : ligne 5, `s` est de type `null` et `s.length` est refusé avec `strictNullChecks` (TS18047).",
  },
  {
    id: 'ts-q3',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `function parse(input: unknown) {
  const a = input.toUpperCase()
  if (typeof input === 'string') {
    const b = input.toUpperCase()
  }
  const c = input as string
}`,
    choices: ['Compile sans erreur', 'Erreur ligne 2 : input est de type unknown', 'Erreurs lignes 2 et 6', 'Erreurs lignes 2 et 4'],
    answer: 1,
    why: "On ne peut rien faire d'une valeur `unknown` sans la rétrécir d'abord : ligne 2 est refusée. Ligne 4, `typeof` a rétréci `input` à `string`. Ligne 6, une assertion `as string` depuis `unknown` est toujours permise (c'est justement le danger des assertions).",
  },
  {
    id: 'ts-q4',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number } | { kind: 'tri'; base: number }

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2
    case 'square': return s.side ** 2
    default: {
      const check: never = s
      return check
    }
  }
}`,
    choices: ['Compile sans erreur', 'Erreur ligne 8 : le cas tri n’est pas traité', 'Erreur ligne 3 : la fonction ne renvoie pas toujours un number', 'Erreur ligne 9 : never n’est pas number'],
    answer: 1,
    why: "C'est la vérification d'exhaustivité : dans `default`, `s` vaut ce qui reste de l'union, ici `{ kind: 'tri'; base: number }`, qui n'est pas assignable à `never`. Ajouter le `case 'tri'` fait disparaître l'erreur. `never` est assignable à tout, donc `return check` est accepté.",
  },
  {
    id: 'ts-q5',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `let a = 'GET'
const b = 'GET'

function send(method: 'GET' | 'POST') {}

send(a)
send(b)`,
    choices: ['Compile sans erreur', 'Erreur ligne 6 : string n’est pas assignable à "GET" | "POST"', 'Erreur ligne 7 : string n’est pas assignable à "GET" | "POST"', 'Erreurs lignes 6 et 7'],
    answer: 1,
    why: "`let a = 'GET'` est **élargi** à `string` (la variable pourrait changer), alors que `const b = 'GET'` garde le type littéral `\"GET\"`. Pour un `let`, il faut une annotation (`let a: 'GET' | 'POST'`) ou `as const`.",
  },
  {
    id: 'ts-q6',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `const config = { mode: 'dark', size: 12 } as const

config.size = 14
const copy = { ...config }
copy.size = 14`,
    choices: ['Compile sans erreur', 'Erreur ligne 3 : size est en lecture seule', 'Erreurs lignes 3 et 5', 'Erreur ligne 5 : size est en lecture seule'],
    answer: 2,
    why: "`as const` rend les propriétés `readonly` **et** littérales : `config.size` est de type `12` en lecture seule. La copie par spread conserve les modificateurs `readonly` et les types littéraux des propriétés : `copy.size` est toujours `readonly size: 12`, donc la ligne 5 est aussi refusée.",
  },
  {
    id: 'ts-q7',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `function first<T extends { length: number }>(x: T): number {
  return x.length
}

first('abc')
first([1, 2])
first(42)`,
    choices: ['Compile sans erreur', 'Erreur ligne 7 : number n’a pas de propriété length', 'Erreurs lignes 6 et 7', 'Erreur ligne 2 : T n’a pas de propriété length'],
    answer: 1,
    why: "La contrainte `T extends { length: number }` garantit `x.length` dans le corps et limite les arguments acceptés : chaînes et tableaux ont une propriété `length`, pas `42`.",
  },
  {
    id: 'ts-q8',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `// @noUncheckedIndexedAccess: true
const scores: number[] = [10, 20]
const s = scores[0]
const doubled: number = s * 2
const safe: number = (scores[1] ?? 0) * 2`,
    choices: ['Compile sans erreur', 'Erreur ligne 3 : index hors limites', 'Erreur ligne 4 : s est possiblement undefined', 'Erreurs lignes 4 et 5'],
    answer: 2,
    why: "Avec `noUncheckedIndexedAccess`, un accès par index renvoie `T | undefined` : `s` est `number | undefined`, et `s * 2` est refusé (TS18048). Ligne 5, `?? 0` élimine `undefined`. Sans cette option, TypeScript suppose que l'index existe toujours.",
  },
  {
    id: 'ts-q9',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type Point = { x: number; y: number }
const p: Point = { x: 1, y: 2 }

for (const key of Object.keys(p)) {
  console.log(p[key])
}`,
    choices: ['Compile sans erreur', 'Erreur ligne 4 : Object.keys n’accepte pas Point', 'Erreur ligne 5 : une string ne peut pas indexer Point', 'Erreurs lignes 4 et 5'],
    answer: 2,
    why: "`Object.keys` renvoie `string[]`, pas `(keyof Point)[]` : à l'exécution, un objet peut avoir plus de clés que son type n'en déclare (typage structurel). Indexer `Point` avec une `string` quelconque est donc refusé (TS7053). On écrit `key as keyof Point` en connaissance de cause, ou on utilise `Object.entries`.",
  },
  {
    id: 'ts-q10',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type Theme = 'light' | 'dark'
const a = { theme: 'dark' } satisfies { theme: Theme }
const b: { theme: Theme } = { theme: 'dark' }

const t1: 'dark' = a.theme
const t2: 'dark' = b.theme`,
    choices: ['Compile sans erreur', 'Erreur ligne 5 : Theme n’est pas assignable à "dark"', 'Erreur ligne 6 : Theme n’est pas assignable à "dark"', 'Erreurs lignes 5 et 6'],
    answer: 2,
    why: "`satisfies` vérifie que la valeur respecte le type **sans changer le type inféré** : `a.theme` reste `\"dark\"`. L'annotation, elle, impose le type déclaré : `b.theme` est `Theme`, qui n'est pas assignable à `\"dark\"`.",
  },
  {
    id: 'ts-q11',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `enum Status { Idle, Busy }
const s1: Status = 1
const s2: Status = 5

enum Color { Red = 'RED' }
const c: Color = 'RED'`,
    choices: ['Compile sans erreur', 'Erreur ligne 6 : "RED" n’est pas assignable à Color', 'Erreurs lignes 3 et 6', 'Erreurs lignes 2, 3 et 6'],
    answer: 2,
    why: "Depuis TypeScript 5.0, un enum numérique accepte les nombres qui correspondent à un membre (`1` est `Status.Busy`) mais refuse les littéraux hors des valeurs connues (`5`). Un enum de chaînes est **nominal** : la chaîne `'RED'` n'est pas assignable à `Color`, il faut écrire `Color.Red`.",
  },
  {
    id: 'ts-q12',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `function format(x: string): string
function format(x: number): string
function format(x: string | number): string {
  return String(x)
}

format('a')
format(1)
format(Math.random() > 0.5 ? 'a' : 1)`,
    choices: ['Compile sans erreur', 'Erreur ligne 9 : aucune surcharge n’accepte string | number', 'Erreur ligne 3 : la signature d’implémentation est incompatible', 'Erreurs lignes 8 et 9'],
    answer: 1,
    why: "La signature d'implémentation n'est **pas visible** de l'extérieur : seules les surcharges le sont. Un argument `string | number` ne correspond à aucune des deux surcharges prises séparément. Il faudrait ajouter une troisième surcharge `(x: string | number): string`, ou écrire une seule signature avec l'union.",
  },
  {
    id: 'ts-q13',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type Opts = { label?: string }

const a: Opts = {}
const b: Opts = { label: undefined }

type Strict = { label: string | undefined }
const c: Strict = {}`,
    choices: ['Compile sans erreur', 'Erreur ligne 4 : undefined n’est pas une string', 'Erreur ligne 7 : la propriété label est manquante', 'Erreurs lignes 4 et 7'],
    answer: 2,
    why: "Une propriété optionnelle `label?: string` peut être absente **ou** valoir `undefined` (sauf avec `exactOptionalPropertyTypes`, qui interdirait la ligne 4). À l'inverse, `label: string | undefined` est **obligatoire** : elle doit être présente, même si sa valeur est `undefined`.",
  },
  {
    id: 'ts-q14',
    theme: 'ts',
    kind: 'compile',
    q: COMPILE,
    code: `type ReadonlyUser = Readonly<{ name: string; tags: string[] }>
const u: ReadonlyUser = { name: 'Ada', tags: [] }

u.tags.push('admin')
u.name = 'Grace'`,
    choices: ['Compile sans erreur', 'Erreur ligne 4 : tags est en lecture seule', 'Erreur ligne 5 : name est en lecture seule', 'Erreurs lignes 4 et 5'],
    answer: 2,
    why: "`Readonly<T>` est **superficiel** : il interdit de réaffecter `u.tags` ou `u.name`, mais le tableau lui-même reste un `string[]` mutable, donc `push` passe. Pour un tableau en lecture seule, il faut `readonly string[]`, ou un `DeepReadonly` récursif.",
  },

  // ───────────── type ─────────────
  {
    id: 'ts-q15',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `xs` ?',
    code: `const xs = [1, 'a', true]`,
    target: 'typeof xs',
    choices: ['[number, string, boolean]', '(string | number | boolean)[]', 'readonly [1, "a", true]', 'any[]'],
    answer: 1,
    why: "Sans annotation ni `as const`, un littéral de tableau est inféré comme un **tableau** dont le type d'élément est l'union des types (élargis) des éléments. TypeScript n'infère pas un tuple par défaut.",
  },
  {
    id: 'ts-q16',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `xs` ?',
    code: `const xs = [1, 'a', true] as const`,
    target: 'typeof xs',
    choices: ['[number, string, boolean]', '(string | number | boolean)[]', 'readonly [1, "a", true]', '[1, "a", true]'],
    answer: 2,
    why: "`as const` fige tout : le tableau devient un **tuple en lecture seule** et chaque élément garde son type littéral.",
  },
  {
    id: 'ts-q17',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type ToArray<T> = T extends unknown ? T[] : never
type R = ToArray<string | number>`,
    target: 'R',
    choices: ['(string | number)[]', 'string[] | number[]', 'never', 'unknown[]'],
    answer: 1,
    why: "Un type conditionnel appliqué à un paramètre de type nu est **distributif** : il s'applique à chaque membre de l'union, puis les résultats sont réunis. Pour éviter la distribution, on écrit `[T] extends [unknown] ? T[] : never`, qui donnerait `(string | number)[]`.",
  },
  {
    id: 'ts-q18',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type ElementOf<T> = T extends (infer U)[] ? U : never
type R = ElementOf<string[] | number>`,
    target: 'R',
    choices: ['string', 'string[]', 'never', 'string | number'],
    answer: 0,
    why: "`infer U` capture le type d'élément. La distribution donne `ElementOf<string[]> | ElementOf<number>`, soit `string | never`, et `never` disparaît d'une union : il reste `string`.",
  },
  {
    id: 'ts-q19',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type User = { id: number; name: string; email?: string }
type R = Omit<User, 'email' | 'id'>`,
    target: 'R',
    choices: ['{ name: string }', '{ name: string; email?: string }', '{ id: number; email?: string }', '{ name?: string }'],
    answer: 0,
    why: "`Omit<T, K>` construit un type avec toutes les propriétés de `T` sauf celles de `K`. Il reste `name`, avec son modificateur d'origine (obligatoire).",
  },
  {
    id: 'ts-q20',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type Event = 'click' | 'focus'
type R = \`on\${Capitalize<Event>}\``,
    target: 'R',
    choices: ['string', '"onclick" | "onfocus"', '"onClick" | "onFocus"', '`on${string}`'],
    answer: 2,
    why: "Un template literal type appliqué à une union produit l'union de toutes les combinaisons. `Capitalize` met la première lettre en majuscule : `\"onClick\" | \"onFocus\"`.",
  },
  {
    id: 'ts-q21',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `const config = { host: 'localhost', port: 8080 }
type R = keyof typeof config`,
    target: 'R',
    choices: ['string', '"host" | "port"', '"localhost" | 8080', 'string | number'],
    answer: 1,
    why: "`typeof config` récupère le type de la valeur (`{ host: string; port: number }`), puis `keyof` donne l'union de ses clés. À ne pas confondre avec les valeurs : pour l'union des types des valeurs, on écrirait `(typeof config)[keyof typeof config]`.",
  },
  {
    id: 'ts-q22',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `async function load() {
  return { ok: true, items: [1, 2] }
}
type R = Awaited<ReturnType<typeof load>>`,
    target: 'R',
    choices: ['Promise<{ ok: boolean; items: number[] }>', '{ ok: boolean; items: number[] }', '{ ok: true; items: [1, 2] }', 'unknown'],
    answer: 1,
    why: "`ReturnType` donne `Promise<{ ok: boolean; items: number[] }>` (une fonction `async` renvoie toujours une promesse), puis `Awaited` déballe la promesse. Les littéraux d'un objet renvoyé sont élargis (`true` → `boolean`).",
  },
  {
    id: 'ts-q23',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type Flags<T> = { [K in keyof T]: boolean }
type R = Flags<{ a: string; b?: number }>`,
    target: 'R',
    choices: ['{ a: boolean; b: boolean }', '{ a: boolean; b?: boolean }', '{ a: boolean; b?: boolean | undefined; c: boolean }', 'Record<"a" | "b", boolean>'],
    answer: 1,
    why: "Un mapped type de la forme `{ [K in keyof T]: … }` est **homomorphe** : il conserve les modificateurs `?` et `readonly` des propriétés d'origine. Pour les retirer, on écrit `-?` (comme `Required`).",
  },
  {
    id: 'ts-q24',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `x` à la fin de la fonction ?',
    code: `function f(v: string | number | null) {
  if (v === null) return
  if (typeof v === 'string') return
  const x = v
  return x
}`,
    target: 'NonNullable<ReturnType<typeof f>>',
    choices: ['number', 'string | number', 'number | null', 'never'],
    answer: 0,
    why: "L'analyse de flux de contrôle retire `null` après le premier `return`, puis `string` après le second : il ne reste que `number`. (Ici on lit ce type via le retour de la fonction, qui vaut `number | undefined` à cause du `return` vide.)",
  },
  {
    id: 'ts-q25',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `R` ?',
    code: `type R = Exclude<'a' | 'b' | 'c', 'a' | 'z'>`,
    target: 'R',
    choices: ['"b" | "c"', '"b" | "c" | "z"', '"a"', 'never'],
    answer: 0,
    why: "`Exclude<T, U>` retire de l'union `T` les membres assignables à `U` (c'est un type conditionnel distributif : `T extends U ? never : T`). `'z'` n'étant pas dans `T`, il n'a aucun effet.",
  },
  {
    id: 'ts-q26',
    theme: 'ts',
    kind: 'type',
    q: 'Quel est le type de `p` ?',
    code: `function pair<T>(a: T, b: T) {
  return [a, b]
}
const p = pair(1, 2)`,
    target: 'typeof p',
    choices: ['[number, number]', 'number[]', '[1, 2]', '(1 | 2)[]'],
    answer: 1,
    why: "`T` est inféré à `number` (les littéraux sont élargis car `T` n'est pas contraint à un type littéral), et `[a, b]` dans un `return` sans annotation est inféré comme un tableau `T[]`, pas comme un tuple. Pour un tuple : annoter le retour `: [T, T]` ou écrire `return [a, b] as const`.",
  },

  // ───────────── qcm ─────────────
  {
    id: 'ts-q27',
    theme: 'ts',
    kind: 'qcm',
    q: 'Quelle est la différence entre `any` et `unknown` ?',
    choices: [
      'Aucune : ce sont deux alias du type « n’importe quoi »',
      '`unknown` accepte toute valeur mais oblige à la rétrécir avant de l’utiliser ; `any` désactive la vérification',
      '`unknown` n’accepte que `null` et `undefined`',
      '`any` est réservé aux fichiers JavaScript',
    ],
    answer: 1,
    why: "Les deux sont des types « top » : toute valeur leur est assignable. Mais `any` désactive le typage (et se propage, c'est la *contagion*), alors qu'`unknown` interdit tout usage tant qu'on n'a pas rétréci le type (`typeof`, `instanceof`, garde de type). Pour une donnée externe (`JSON.parse`, `catch`), préférer `unknown`.",
  },
  {
    id: 'ts-q28',
    theme: 'ts',
    kind: 'qcm',
    q: 'Que se passe-t-il à l’exécution quand on écrit `const user = data as User` ?',
    choices: [
      'TypeScript vérifie que `data` a bien la forme de `User` et lève une erreur sinon',
      'Rien : l’assertion est effacée à la compilation, aucune vérification n’a lieu',
      '`data` est converti en `User` (propriétés manquantes ajoutées)',
      'Une exception `TypeError` est levée si les types diffèrent',
    ],
    answer: 1,
    why: "Les types n'existent pas à l'exécution : `as` est une simple affirmation faite au compilateur, effacée dans le JS émis. Si `data` n'a pas la bonne forme, l'erreur surviendra plus loin. Pour valider une donnée externe, il faut une garde de type ou une bibliothèque de validation (Zod, Valibot…).",
  },
  {
    id: 'ts-q29',
    theme: 'ts',
    kind: 'qcm',
    q: 'Laquelle de ces affirmations sur `interface` et `type` est vraie ?',
    choices: [
      'Seul `type` peut décrire la forme d’un objet',
      'Deux `interface` de même nom fusionnent (declaration merging), deux `type` de même nom sont une erreur',
      'Une `interface` peut décrire une union',
      '`extends` et `&` sont strictement équivalents, y compris en cas de conflit de propriétés',
    ],
    answer: 1,
    why: "Les interfaces s'ouvrent : deux déclarations du même nom fusionnent (utile pour augmenter `Window` ou un module). Un alias `type` est fermé, mais peut nommer n'importe quel type (union, tuple, conditionnel…). En cas de conflit, `extends` signale une erreur alors que `&` produit silencieusement un type impossible (`never` pour la propriété).",
  },
  {
    id: 'ts-q30',
    theme: 'ts',
    kind: 'qcm',
    lang: 'ts',
    q: 'Pourquoi préfère-t-on souvent `satisfies` à une annotation pour un objet de configuration ?',
    code: `type Routes = Record<string, { path: string }>

const routes = {
  home: { path: '/' },
  about: { path: '/about' },
} satisfies Routes

routes.home.path // ok
// @ts-expect-error : la clé n'existe pas
routes.contact`,
    choices: [
      'Parce que `satisfies` est plus rapide à l’exécution',
      'Parce que `satisfies` vérifie la conformité tout en gardant le type précis inféré (clés connues, littéraux)',
      'Parce que `satisfies` convertit l’objet au type demandé',
      'Parce qu’une annotation n’accepte pas les objets imbriqués',
    ],
    answer: 1,
    why: "Avec l'annotation `const routes: Routes`, le type devient `Record<string, …>` : on perd la liste des clés et `routes.contact` serait accepté. `satisfies` vérifie que l'objet respecte `Routes` mais conserve son type inféré, donc l'autocomplétion et les erreurs sur les clés inexistantes.",
  },
  {
    id: 'ts-q31',
    theme: 'ts',
    kind: 'qcm',
    q: 'Que fait l’option `strictNullChecks` (incluse dans `strict`) ?',
    choices: [
      'Elle interdit d’utiliser `null` dans le code',
      'Elle retire `null` et `undefined` de tous les types : il faut les déclarer explicitement (`string | null`) et les tester avant usage',
      'Elle convertit `null` en `undefined` à la compilation',
      'Elle ajoute des vérifications de `null` dans le JavaScript émis',
    ],
    answer: 1,
    why: "Sans cette option, `null` et `undefined` sont assignables à tous les types, ce qui laisse passer les « Cannot read properties of null ». Avec, `string` ne contient plus `null` : il faut l'écrire `string | null` et rétrécir (`if (x !== null)`, `?.`, `??`). Rien n'est ajouté au JS émis : tout se passe à la compilation.",
  },
  {
    id: 'ts-q32',
    theme: 'ts',
    kind: 'qcm',
    lang: 'ts',
    q: 'Quel est le rôle de la fonction `isUser` ci-dessous ?',
    code: `type User = { name: string }

function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'name' in x && typeof x.name === 'string'
}

const data: unknown = JSON.parse('{"name":"Ada"}')
if (isUser(data)) console.log(data.name)`,
    choices: [
      'C’est une garde de type : si elle renvoie `true`, TypeScript rétrécit `data` à `User` dans le `if`',
      'Elle convertit `data` en `User`',
      'Elle lève une exception si `data` n’est pas un `User`',
      'Elle ne sert à rien : `JSON.parse` renvoie déjà le bon type',
    ],
    answer: 0,
    why: "Le type de retour `x is User` (prédicat de type) indique au compilateur que la fonction teste la forme de son argument. Attention : TypeScript fait **confiance** au corps de la fonction ; une garde mal écrite ment autant qu'un `as`. Une fonction d'assertion (`asserts x is User`) lèverait une exception au lieu de renvoyer un booléen.",
  },
  {
    id: 'ts-q33',
    theme: 'ts',
    kind: 'qcm',
    q: 'Pourquoi beaucoup d’équipes préfèrent-elles une union de littéraux (`type Dir = \'up\' | \'down\'`) à un `enum` ?',
    choices: [
      'Parce que les `enum` ne fonctionnent pas dans les navigateurs',
      'Parce qu’une union est effacée à la compilation (zéro code émis), reste compatible avec de simples chaînes et avec `isolatedModules`/`erasableSyntaxOnly`',
      'Parce qu’une union est plus rapide à l’exécution qu’un `enum`',
      'Parce que les `enum` ne peuvent pas contenir de chaînes',
    ],
    answer: 1,
    why: "Un `enum` génère un objet JavaScript (et, pour un enum numérique, un mapping inverse), n'est pas du « TypeScript effaçable » (refusé par `erasableSyntaxOnly` et l'exécution native de TS par Node) et un enum de chaînes est nominal. Une union de littéraux n'émet rien ; si l'on veut aussi une valeur à l'exécution, on combine un objet `as const` et `typeof obj[keyof typeof obj]`.",
  },
  {
    id: 'ts-q34',
    theme: 'ts',
    kind: 'qcm',
    q: 'Que signifie le type `never` ?',
    choices: [
      'Une valeur qui vaut `undefined`',
      'Le type vide : aucune valeur ne le possède (fonction qui ne rend jamais la main, branche impossible)',
      'Un synonyme de `void`',
      'Un type qui accepte toutes les valeurs',
    ],
    answer: 1,
    why: "`never` est le type « bottom » : il ne contient aucune valeur. C'est le retour d'une fonction qui lève toujours ou boucle à l'infini, le type d'une variable dans une branche impossible (vérification d'exhaustivité), et l'élément neutre des unions (`string | never` vaut `string`). `void` signifie au contraire « la fonction rend la main sans valeur utile ».",
  },
]
