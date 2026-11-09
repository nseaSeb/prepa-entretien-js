import type { CoursSection } from './types'

/*
 * Cours « TypeScript » : une sous-partie par notion (ancres #cours/ts-…).
 * Tous les extraits sont `lang: 'ts'` : ils doivent compiler en mode strict (erreurs voulues
 * signalées par @ts-expect-error), les lignes `type X = … // → T` sont vérifiées par le compilateur,
 * et la sortie console du JS transpilé est vérifiée comme pour le reste du cours.
 * `run: false` n'est utilisé que dans les sous-parties frameworks (JSX, imports de bibliothèques).
 */
export const tsSection: CoursSection = {
  id: 'ts',
  title: 'TypeScript',
  summary: 'Un système de types **structurel** et **effacé à la compilation** au-dessus de JavaScript : narrowing, génériques, types utilitaires, types conditionnels et mappés, plus les réglages stricts et l’usage dans React, Vue et Angular.',
  blocks: [
    // ───────────── pourquoi ─────────────
    { h: 'Pourquoi TypeScript ? Le typage structurel', id: 'ts-pourquoi' },
    {
      p: 'TypeScript est un **sur-ensemble** de JavaScript : tout JS valide est du TS syntaxiquement valide, et le compilateur ajoute une **vérification statique** avant d’**effacer** les types. À l’exécution il ne reste que du JavaScript : aucun type n’existe au runtime, on ne peut donc pas faire `if (x instanceof User)` sur un `type` ou une `interface`.',
    },
    {
      p: 'Le typage est **structurel** (*duck typing* vérifié) : deux types sont compatibles s’ils ont la même **forme**, peu importe leur nom. C’est l’inverse du typage **nominal** de Java ou C#. Un objet qui possède au moins les propriétés attendues est accepté.',
    },
    {
      title: 'Compatibilité par la forme, pas par le nom',
      lang: 'ts',
      code: `type Point = { x: number; y: number }
interface Coords { x: number; y: number }

const p: Point = { x: 1, y: 2 }
const c: Coords = p // OK : même forme

const p3 = { x: 1, y: 2, z: 3 }
const flat: Point = p3 // OK : propriétés en plus autorisées (variable, pas littéral)
// @ts-expect-error : sur un littéral « frais », la propriété en trop est signalée
const fresh: Point = { x: 1, y: 2, z: 3 }

function norm(v: Point) {
  return Math.hypot(v.x, v.y)
}
console.log(norm(c), norm(p3))`,
      output: '2.23606797749979 2.23606797749979',
    },
    {
      list: [
        'Bénéfices : erreurs détectées avant l’exécution, autocomplétion, refactorings sûrs, documentation vivante des contrats.',
        'Coût : une étape de build, une courbe d’apprentissage, et une fausse sécurité si l’on abuse de `any` ou de `as`.',
        'Les types ne valident **pas** les données externes (API, `JSON.parse`) : il faut une validation à l’exécution (zod, valibot, gardes de type).',
      ],
    },
    {
      mnemo: '« Si ça a la forme d’un canard, TypeScript dit que c’est un canard. » Les types disparaissent au build : **vérifier à la compilation, valider à l’exécution**.',
      piege: 'Croire que TypeScript protège au runtime : une réponse d’API typée `User` n’est qu’une promesse. Sans validation, un champ manquant passe la compilation et plante plus loin.',
    },

    // ───────────── type vs interface ─────────────
    { h: 'type ou interface ?', id: 'ts-type-interface' },
    {
      p: 'Les deux décrivent la forme d’un objet. `interface` ne décrit **que** des formes d’objets (et de classes), peut être **étendue** avec `extends` et **fusionnée** : deux déclarations du même nom s’additionnent (*declaration merging*, utilisé pour augmenter `Window` ou une bibliothèque). `type` est un **alias** pour n’importe quel type : unions, tuples, primitives, types conditionnels ou mappés, et ne peut pas être redéclaré.',
    },
    {
      title: 'Fusion de déclarations et extends',
      lang: 'ts',
      code: `interface User { id: number }
interface User { name: string } // fusion : User a id ET name

const u: User = { id: 1, name: 'Ada' }

interface Admin extends User { rights: string[] }
type AdminKeys = keyof Admin // → 'id' | 'name' | 'rights'

type Id = string | number // impossible avec une interface
type Pair = [Id, Id]

// type Id = boolean  ← erreur « Duplicate identifier » : un alias ne fusionne pas
console.log(u.name)`,
      output: 'Ada',
    },
    {
      p: '`extends` et l’intersection `&` se ressemblent mais diffèrent en cas de **conflit** : `extends` signale immédiatement une propriété incompatible, alors que `&` produit silencieusement une propriété de type `never`. Les interfaces sont aussi plus rapides à vérifier pour le compilateur sur de grosses hiérarchies (relations mises en cache).',
    },
    {
      lang: 'ts',
      code: `type A = { id: string }
type B = { id: number }

type AB = A & B
type IdOfAB = AB['id'] // → never

interface IA { id: string }
// @ts-expect-error : Interface 'IB' incorrectly extends interface 'IA'
interface IB extends IA { id: number }`,
    },
    {
      table: [
        ['', '`interface`', '`type`'],
        ['Objets, classes (`implements`)', 'oui', 'oui'],
        ['Unions, tuples, primitives, types calculés', 'non', 'oui'],
        ['Fusion de déclarations', 'oui', 'non (erreur de doublon)'],
        ['Héritage', '`extends` (conflit signalé)', '`&` (conflit → `never`)'],
      ],
    },
    {
      mnemo: '**interface** = contrat d’objet, ouvert (fusionnable). **type** = alias pour tout, fermé. Règle d’équipe courante : interface pour les objets publics, type pour le reste.',
      piege: 'La fusion de déclarations peut surprendre : déclarer une `interface Window` ou `interface Request` dans un fichier global **ajoute** des champs à celle de la lib au lieu d’en créer une nouvelle.',
    },

    // ───────────── littéraux ─────────────
    { h: 'Primitives, types littéraux et as const', id: 'ts-litteraux' },
    {
      p: 'Les primitives sont `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`. Un **type littéral** est une valeur précise utilisée comme type : `\'GET\'`, `42`, `true`. L’inférence **élargit** (*widening*) les valeurs d’un `let` ou d’une propriété d’objet vers la primitive, car elles peuvent changer ; une `const` primitive garde son littéral.',
    },
    {
      lang: 'ts',
      code: `const method = 'GET'
let verb = 'GET'
type M = typeof method // → 'GET'
type V = typeof verb // → string

const config = { method: 'GET', retries: 3 }
type C = typeof config // → { method: string; retries: number }

const frozen = { method: 'GET', retries: 3 } as const
type F = typeof frozen // → { readonly method: 'GET'; readonly retries: 3 }

const roles = ['admin', 'user'] as const
type Role = (typeof roles)[number] // → 'admin' | 'user'
console.log(roles.includes('admin'))`,
      output: 'true',
    },
    {
      p: '`as const` fige toute une expression : littéraux conservés, propriétés `readonly`, tableaux transformés en **tuples readonly**. C’est l’idiome pour dériver une union de types d’une liste de valeurs écrite une seule fois (`(typeof roles)[number]`).',
    },
    {
      mnemo: '`let` élargit, `const` garde le littéral, `as const` garde **tout** (et ajoute readonly).',
      piege: 'Passer `{ method: \'GET\' }` stocké dans une variable à une fonction qui attend `method: \'GET\' | \'POST\'` échoue : la propriété a été élargie en `string`. Solution : `as const`, `satisfies` ou une annotation.',
    },

    // ───────────── narrowing ─────────────
    { h: 'Unions et narrowing', id: 'ts-narrowing' },
    {
      p: 'Une **union** `A | B` accepte l’un ou l’autre, mais on ne peut utiliser que ce qui est commun aux deux. Le **narrowing** (rétrécissement) est l’analyse de flux par laquelle TypeScript affine le type dans une branche : `typeof`, `instanceof`, l’opérateur `in`, les comparaisons `===`, la vérité (`if (x)`), et les **unions discriminées** (une propriété littérale commune, le *tag*).',
    },
    {
      lang: 'ts',
      code: `function format(v: string | number | Date | null): string {
  if (v === null) return '∅'
  if (typeof v === 'string') return v.toUpperCase() // v : string
  if (typeof v === 'number') return v.toFixed(1) // v : number
  return v.toISOString().slice(0, 10) // v : Date
}

type Fish = { swim: () => string }
type Bird = { fly: () => string }
function move(a: Fish | Bird) {
  return 'swim' in a ? a.swim() : a.fly()
}
console.log(format('ok'), format(2), format(new Date(0)), format(null))
console.log(move({ fly: () => 'vole' }))`,
      output: 'OK 2.0 1970-01-01 ∅\nvole',
    },
    {
      title: 'Union discriminée et vérification d’exhaustivité',
      lang: 'ts',
      code: `type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number }

function assertNever(x: never): never {
  throw new Error('cas non géré : ' + JSON.stringify(x))
}

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.r ** 2
    case 'rect':
      return s.w * s.h
    default:
      return assertNever(s) // s : never ; un nouveau cas oublié ferait une erreur ici
  }
}
console.log(area({ kind: 'rect', w: 2, h: 3 }))`,
      output: '6',
    },
    {
      p: 'Dans la branche `default`, toutes les variantes ont été éliminées : `s` est de type `never`. Si l’on ajoute `{ kind: \'triangle\' }` à l’union sans traiter le cas, l’appel `assertNever(s)` ne compile plus. C’est **la** réponse attendue à « comment garantir qu’un switch couvre tous les cas ? ».',
    },
    {
      mnemo: 'Union = **OU** à l’entrée, narrowing = **tri** dans chaque branche. Union discriminée : un `kind` littéral commun, un `switch`, et `never` en `default`.',
      piege: '`typeof null === \'object\'` : `if (typeof v === \'object\')` ne retire pas `null` de l’union. Et `if (v)` élimine aussi `0` et `\'\'`, ce qui peut retirer des valeurs légitimes.',
    },

    // ───────────── any / unknown / never ─────────────
    { h: 'any, unknown et never', id: 'ts-any-unknown-never' },
    {
      p: '`any` **désactive** le typage : tout lui est assignable, il est assignable à tout, et on peut tout faire dessus. Il est **contagieux** : une propriété lue sur un `any` est `any`. `unknown` est son équivalent **sûr** : tout lui est assignable, mais il faut le **rétrécir** avant de l’utiliser. `never` est le type **vide** : aucune valeur, retour d’une fonction qui lève toujours, branche impossible.',
    },
    {
      lang: 'ts',
      code: `function demo(a: any, u: unknown) {
  const n1: number = a // accepté sans vérification
  a.foo.bar() // accepté : any se propage
  // @ts-expect-error : unknown doit être rétréci
  const n2: number = u
  // @ts-expect-error : 'u' is of type 'unknown'
  u.foo
  if (typeof u === 'string') return u.toUpperCase() // u : string
}
type Demo = ReturnType<typeof demo> // → string | undefined

type U1 = string | never // → string
type I1 = string & number // → never
type AnyWins = string | any // → any
type UnknownAbsorbs = string | unknown // → unknown`,
    },
    {
      title: 'unknown pour les données externes',
      lang: 'ts',
      code: `function parsePort(raw: string): number {
  const data: unknown = JSON.parse(raw)
  if (typeof data === 'object' && data !== null && 'port' in data && typeof data.port === 'number') {
    return data.port
  }
  throw new Error('config invalide')
}
console.log(parsePort('{"port":8080}'))
try {
  parsePort('{"port":"80"}')
} catch (e) {
  console.log(e instanceof Error ? e.message : e)
}`,
      output: '8080\nconfig invalide',
    },
    {
      mnemo: '**any** = « je débranche TypeScript ». **unknown** = « je ne sais pas encore, je vérifierai ». **never** = « impossible ». Dans une union, `never` disparaît ; dans une intersection, il absorbe tout.',
      piege: 'Un `catch (e)` est `unknown` en mode strict (`useUnknownInCatchVariables`) : `e.message` ne compile pas sans `e instanceof Error`. Et `JSON.parse` renvoie `any`, qui contamine silencieusement tout ce qu’on en dérive.',
    },

    // ───────────── gardes ─────────────
    { h: 'Gardes de type et fonctions d’assertion', id: 'ts-gardes' },
    {
      p: 'Quand le narrowing intégré ne suffit pas, on écrit une **garde de type** : une fonction qui renvoie un booléen avec un **prédicat** `x is T`. Si elle renvoie `true`, TypeScript considère `x` comme `T` dans la branche. Une **fonction d’assertion** (`asserts x is T`) lève une erreur sinon, et rétrécit pour **toute la suite** du bloc.',
    },
    {
      lang: 'ts',
      code: `type User = { id: number; name: string }

function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x && 'name' in x && typeof x.id === 'number' && typeof x.name === 'string'
}

function assertIsDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) throw new Error('valeur absente')
}

const raw: unknown = JSON.parse('{"id":1,"name":"Ada"}')
if (isUser(raw)) console.log(raw.name.toUpperCase())

const items = ['a', null, 'b', undefined]
const clean = items.filter((x): x is string => x != null)
type Clean = typeof clean // → string[]

const maybe: string | undefined = items[0] ?? undefined
assertIsDefined(maybe)
type After = typeof maybe // → string
console.log(clean, maybe)`,
      output: "ADA\n[ 'a', 'b' ] a",
    },
    {
      p: 'Depuis TypeScript 5.5, un `filter(x => x != null)` simple **infère** déjà le prédicat ; l’écrire explicitement reste utile pour des tests plus complexes. Attention : le compilateur **croit** le prédicat sur parole. Une garde fausse est un mensonge aussi dangereux qu’un `as`.',
    },
    {
      mnemo: '`x is T` → rétrécit **dans le if**. `asserts x is T` → rétrécit **après l’appel** (ou lève).',
      piege: 'Une garde de type n’est pas vérifiée : `function isUser(x): x is User { return true }` compile. Les fonctions d’assertion doivent aussi être appelées via un nom explicitement typé (pas une fléché inférée), sinon erreur TS2775.',
    },

    // ───────────── génériques ─────────────
    { h: 'Génériques : paramètres, contraintes, défauts', id: 'ts-generiques' },
    {
      p: 'Un **générique** est un paramètre de type : la fonction ou le type est écrit une fois et fonctionne pour plusieurs types, **en gardant le lien** entre entrée et sortie (là où `any` le perd). TypeScript **infère** généralement le paramètre à partir des arguments. Une **contrainte** `T extends X` limite ce qu’on accepte et donne accès aux membres de `X` ; une **valeur par défaut** `T = X` sert quand rien n’est inféré ni fourni.',
    },
    {
      lang: 'ts',
      code: `function first<T>(xs: readonly T[]): T | undefined {
  return xs[0]
}
const f = first([1, 2, 3])
type F = typeof f // → number | undefined

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
console.log(longest('abc', 'de'), longest([1, 2], [3]))
// @ts-expect-error : number n'a pas de length
longest(1, 2)

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const age = getProp({ name: 'Ada', age: 36 }, 'age')
type Age = typeof age // → number

type ApiResponse<T = unknown> = { ok: boolean; data: T }
type Default = ApiResponse['data'] // → unknown
console.log(age)`,
      output: "abc [ 1, 2 ]\n36",
    },
    {
      p: 'Règle de conception : un paramètre de type doit **relier** au moins deux positions (deux paramètres, ou un paramètre et le retour). Un générique utilisé une seule fois (`function log<T>(x: T): void`) n’apporte rien : `unknown` suffit.',
    },
    {
      mnemo: 'Générique = **variable de type**. `extends` = « au moins ça ». `= X` = « sinon ça ». `K extends keyof T` + `T[K]` : le duo qui type un accès par clé.',
      piege: '`<T>(x: T) => T` appelée avec un littéral garde le littéral (`const` contextuel), mais `T[]` avec `[1, \'a\']` infère `(string | number)[]`. Et dans un fichier `.tsx`, `<T>() => …` est lu comme du JSX : écrire `<T,>`.',
    },

    // ───────────── keyof / typeof ─────────────
    { h: 'keyof, typeof et accès indexé', id: 'ts-keyof-typeof' },
    {
      p: '`keyof T` donne l’union des **clés** de `T`. `typeof x` (en position de type) donne le type d’une **valeur** existante : idéal pour dériver des types d’un objet de configuration. `T[K]` est l’**accès indexé** : le type de la propriété `K` de `T`, avec des unions possibles (`T[\'a\' | \'b\']`) et `T[number]` pour les éléments d’un tableau.',
    },
    {
      lang: 'ts',
      code: `const theme = { primary: '#4f46e5', danger: '#e11d48', radius: 4 }

type Theme = typeof theme // → { primary: string; danger: string; radius: number }
type ThemeKey = keyof typeof theme // → 'primary' | 'danger' | 'radius'
type Color = Theme['primary' | 'danger'] // → string

const users = [{ id: 1, tags: ['a'] }]
type UserT = (typeof users)[number] // → { id: number; tags: string[] }
type Tag = UserT['tags'][number] // → string

function pick<T>(o: T, key: keyof T) {
  return o[key]
}
console.log(pick(theme, 'radius'))`,
      output: '4',
    },
    {
      mnemo: '`typeof` : **valeur → type**. `keyof` : **type → union de clés**. `T[K]` : **type d’une propriété**. Ensemble : `(typeof obj)[keyof typeof obj]` = union des valeurs.',
      piege: '`keyof` d’un type avec signature d’index `{ [k: string]: X }` vaut `string | number` (les clés numériques sont converties en chaînes en JS). Et `typeof` en position de type n’a rien à voir avec l’opérateur `typeof` d’exécution.',
    },

    // ───────────── utilitaires ─────────────
    { h: 'Types utilitaires intégrés', id: 'ts-utilitaires' },
    {
      p: 'TypeScript fournit des transformations prêtes à l’emploi, presque toutes écrites avec des types mappés ou conditionnels (on doit savoir en réécrire certaines en entretien, voir les katas).',
    },
    {
      table: [
        ['Utilitaire', 'Effet'],
        ['`Partial<T>` / `Required<T>`', 'toutes les propriétés optionnelles / obligatoires'],
        ['`Readonly<T>`', 'toutes les propriétés en lecture seule (superficiel)'],
        ['`Pick<T, K>` / `Omit<T, K>`', 'garder / retirer des clés'],
        ['`Record<K, V>`', 'objet dont les clés sont `K` et les valeurs `V`'],
        ['`Exclude<U, X>` / `Extract<U, X>`', 'retirer / garder des membres d’une **union**'],
        ['`NonNullable<T>`', 'retire `null` et `undefined`'],
        ['`ReturnType<F>` / `Parameters<F>`', 'type de retour / tuple des paramètres d’une fonction'],
        ['`Awaited<T>`', 'type résolu d’une promesse (récursivement)'],
      ],
    },
    {
      lang: 'ts',
      code: `type User = { id: number; name: string; email?: string }

type Draft = Partial<User> // → { id?: number; name?: string; email?: string }
type Full = Required<User> // → { id: number; name: string; email: string }
type Frozen = Readonly<Pick<User, 'id'>> // → { readonly id: number }
type NoEmail = Omit<User, 'email'> // → { id: number; name: string }
type Flags = Record<'dark' | 'beta', boolean> // → { dark: boolean; beta: boolean }

type Status = 'idle' | 'loading' | 'success' | 'error'
type Busy = Exclude<Status, 'idle'> // → 'loading' | 'success' | 'error'
type Done = Extract<Status, 'success' | 'error' | 'other'> // → 'success' | 'error'
type Defined = NonNullable<string | null | undefined> // → string

async function fetchUser(id: number, full = false) {
  return { id, name: full ? 'Ada Lovelace' : 'Ada' }
}
type Ret = ReturnType<typeof fetchUser> // → Promise<{ id: number; name: string }>
type Res = Awaited<Ret> // → { id: number; name: string }
type Params = Parameters<typeof fetchUser> // → [id: number, full?: boolean]`,
    },
    {
      mnemo: '**Objet** : Partial, Required, Readonly, Pick, Omit, Record. **Union** : Exclude, Extract, NonNullable. **Fonction** : ReturnType, Parameters, Awaited.',
      piege: '`Omit<T, K>` n’exige pas que `K` soit une clé de `T` (`Omit<User, \'emial\'>` compile et ne retire rien), contrairement à `Pick`. Et `Omit` sur une union aplatit l’union : utiliser un Omit distributif si besoin.',
    },

    // ───────────── mapped ─────────────
    { h: 'Types mappés et remappage de clés', id: 'ts-mapped' },
    {
      p: 'Un **type mappé** parcourt une union de clés : `{ [K in Keys]: … }`. Combiné à `keyof T`, il transforme chaque propriété d’un type. Les modificateurs `readonly` et `?` s’ajoutent ou se retirent avec `+` / `-` (`-?` rend obligatoire). La clause `as` (TS 4.1) **remappe** les clés : renommer avec un template literal, ou filtrer en produisant `never`.',
    },
    {
      lang: 'ts',
      code: `type MyPartial<T> = { [K in keyof T]?: T[K] }
type Mutable<T> = { -readonly [K in keyof T]-?: T[K] }

type Point = { readonly x: number; y?: number }
type P1 = MyPartial<Point> // → { readonly x?: number; y?: number }
type P2 = Mutable<Point> // → { x: number; y: number }

type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] }
type G = Getters<{ name: string; age: number }> // → { getName: () => string; getAge: () => number }

type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] }
type S = OnlyStrings<{ a: string; b: number; c: string }> // → { a: string; c: string }`,
    },
    {
      mnemo: '`[K in keyof T]` = **boucle for sur les clés**. `-?` / `-readonly` = enlever, `as` = renommer ou filtrer (→ `never` supprime la clé).',
      piege: 'Un type mappé **homomorphe** (`[K in keyof T]`) conserve `readonly` et `?` d’origine ; un type mappé sur une union arbitraire (`[K in \'a\' | \'b\']`) ne les connaît pas. Pour filtrer, `as … never` et non une valeur `never` (la clé resterait).',
    },

    // ───────────── conditionnels ─────────────
    { h: 'Types conditionnels, infer et distributivité', id: 'ts-conditionnels' },
    {
      p: '`T extends U ? X : Y` est un **if au niveau des types**. Avec `infer`, on **capture** une partie du type testé : c’est ainsi que sont écrits `ReturnType`, `Awaited` ou `Parameters`. Quand `T` est un **paramètre de type nu** et reçoit une union, le conditionnel est **distributif** : il s’applique à chaque membre puis réunit les résultats. Entourer de crochets `[T] extends [U]` désactive la distribution.',
    },
    {
      lang: 'ts',
      code: `type IsString<T> = T extends string ? true : false
type A = IsString<'a'> // → true
type B = IsString<'a' | 1> // → boolean

type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never
type R1 = MyReturnType<() => Promise<number>> // → Promise<number>

type ElementOf<T> = T extends readonly (infer E)[] ? E : T
type E1 = ElementOf<string[]> // → string

type ToArray<T> = T extends unknown ? T[] : never
type Dist = ToArray<string | number> // → string[] | number[]

type ToArrayNoDist<T> = [T] extends [unknown] ? T[] : never
type NoDist = ToArrayNoDist<string | number> // → (string | number)[]

type IsNever<T> = [T] extends [never] ? true : false
type N1 = IsNever<never> // → true
type Naive<T> = T extends never ? true : false
type N2 = Naive<never> // → never`,
    },
    {
      p: 'Le dernier cas est un classique : `never` est l’**union vide**, donc un conditionnel distributif sur `never` ne s’exécute pour aucun membre et renvoie `never`. D’où l’écriture `[T] extends [never]`.',
    },
    {
      mnemo: '`extends ? :` = if de types. `infer X` = « attrape ce morceau ». Paramètre nu + union = **distribution** ; `[T]` = pas de distribution.',
      piege: '`IsString<string | number>` donne `boolean` (`true | false`) et non `false`, à cause de la distributivité. Et un conditionnel sur `never` renvoie `never`.',
    },

    // ───────────── template literal ─────────────
    { h: 'Types template literal', id: 'ts-template-literal' },
    {
      p: 'Les **template literal types** construisent des chaînes au niveau des types : `\`on\${Capitalize<E>}\`` produit `\'onClick\' | \'onFocus\'` à partir de `\'click\' | \'focus\'`. Une union dans le gabarit se **multiplie** (produit cartésien). Avec `infer`, on peut aussi **analyser** une chaîne : extraire les paramètres d’une route, couper des espaces. Intrinsèques fournis : `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`.',
    },
    {
      lang: 'ts',
      code: `type EventName = 'click' | 'focus'
type Handler = \`on\${Capitalize<EventName>}\` // → 'onClick' | 'onFocus'

type Size = 'sm' | 'lg'
type Color = 'red' | 'blue'
type Variant = \`\${Size}-\${Color}\` // → 'sm-red' | 'sm-blue' | 'lg-red' | 'lg-blue'

type Params<S extends string> = S extends \`\${string}:\${infer P}/\${infer Rest}\`
  ? P | Params<Rest>
  : S extends \`\${string}:\${infer P}\`
    ? P
    : never
type RouteParams = Params<'/users/:id/posts/:postId'> // → 'id' | 'postId'

type CssLength = \`\${number}px\`
const ok: CssLength = '12px'
// @ts-expect-error : '12em' n'est pas de la forme \`\${number}px\`
const ko: CssLength = '12em'
console.log(ok)`,
      output: '12px',
    },
    {
      mnemo: 'Template literal type = **gabarit de chaîne au niveau des types**. Union dedans = toutes les combinaisons ; `infer` dedans = parseur.',
      piege: 'Le produit cartésien explose vite : trois unions de 20 membres font 8 000 chaînes, et TypeScript refuse au-delà de 100 000 membres (« Expression produces a union type that is too complex to represent »).',
    },

    // ───────────── satisfies ─────────────
    { h: 'satisfies, annotation ou as ?', id: 'ts-satisfies' },
    {
      p: 'Trois façons de relier une valeur à un type. L’**annotation** `const x: T = …` vérifie la valeur **et** remplace son type par `T` (on perd la précision inférée). `satisfies T` (TS 4.9) vérifie la valeur **sans** changer le type inféré : on garde les littéraux et les clés exactes. L’**assertion** `as T` ne vérifie presque rien : elle **affirme** au compilateur, qui accepte tant que les types se recouvrent.',
    },
    {
      lang: 'ts',
      code: `type Color = string | [number, number, number]
type Palette = Record<'red' | 'green', Color>

const annotated: Palette = { red: [255, 0, 0], green: '#0f0' }
type A = typeof annotated.red // → Color
// @ts-expect-error : Color peut être un tuple, pas de toUpperCase
annotated.green.toUpperCase()

const checked = { red: [255, 0, 0], green: '#0f0' } satisfies Palette
type S = typeof checked.green // → string
console.log(checked.green.toUpperCase())

// @ts-expect-error : satisfies vérifie les clés (blue en trop)
const typo = { red: '#f00', green: '#0f0', blue: '#00f' } satisfies Palette

const lie = { red: '#f00' } as Palette // aucune erreur : green manque pourtant
console.log(lie.green)`,
      output: '#0F0\nundefined',
    },
    {
      table: [
        ['Forme', 'Vérifie la valeur', 'Type obtenu'],
        ['`const x: T = v`', 'oui', '`T` (élargi)'],
        ['`const x = v satisfies T`', 'oui', 'type inféré de `v` (précis)'],
        ['`const x = v as T`', 'non (seulement un recouvrement)', '`T` (affirmé)'],
      ],
    },
    {
      mnemo: 'Annotation = « **c’est** un T ». satisfies = « **ça respecte** T, mais garde ta forme ». as = « **crois-moi** ».',
      piege: '`as` entre types sans rapport est refusé (`\'a\' as number`), d’où le contournement `x as unknown as T` : s’il apparaît dans une revue de code, c’est un mensonge assumé au compilateur.',
    },

    // ───────────── enums ─────────────
    { h: 'enum ou union de littéraux ?', id: 'ts-enums' },
    {
      p: 'Un `enum` est l’une des rares constructions TypeScript qui **génère du code** (un objet à l’exécution). Les enums **numériques** créent un *reverse mapping* (`Dir[0] === \'Up\'`) et, historiquement, acceptaient n’importe quel nombre. Les enums de **chaînes** sont plus sûrs mais **nominaux** : on ne peut pas passer la chaîne brute. La tendance actuelle (et l’option `erasableSyntaxOnly`) privilégie une **union de littéraux**, éventuellement dérivée d’un objet `as const`.',
    },
    {
      lang: 'ts',
      code: `enum Dir { Up, Down }
console.log(Dir.Up, Dir[0], Object.keys(Dir))

enum Level { Info = 'info', Error = 'error' }
function logAt(l: Level) { return l }
// @ts-expect-error : la chaîne brute n'est pas un Level
logAt('info')
console.log(logAt(Level.Error))

const LEVELS = { Info: 'info', Error: 'error' } as const
type LevelU = (typeof LEVELS)[keyof typeof LEVELS] // → 'info' | 'error'
function logU(l: LevelU) { return l }
console.log(logU('info'), logU(LEVELS.Error))`,
      output: "0 Up [ '0', '1', 'Up', 'Down' ]\nerror\ninfo error",
    },
    {
      mnemo: 'Union de littéraux : **zéro code généré**, chaînes brutes acceptées. Enum numérique : reverse mapping et clés doublées. Objet `as const` + `typeof` : le meilleur des deux.',
      piege: '`Object.keys` d’un enum numérique renvoie aussi les **nombres** (`[\'0\', \'1\', \'Up\', \'Down\']`). Et `const enum` est inliné à la compilation : incompatible avec `isolatedModules` (transpilation fichier par fichier, Babel, esbuild).',
    },

    // ───────────── surcharges ─────────────
    { h: 'Surcharges de fonctions', id: 'ts-surcharges' },
    {
      p: 'Les **surcharges** décrivent plusieurs signatures pour une même fonction quand le type de retour dépend du type d’entrée. On écrit les signatures visibles, puis **une** implémentation compatible avec toutes, qui n’est **pas** appelable directement. Souvent, une union ou un générique conditionnel suffit et reste plus simple.',
    },
    {
      lang: 'ts',
      code: `function parse(input: string): number
function parse(input: string[]): number[]
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input)
}

const one = parse('42')
const many = parse(['1', '2'])
type One = typeof one // → number
type Many = typeof many // → number[]

function demo(either: string | string[]) {
  // @ts-expect-error : aucune surcharge n'accepte string | string[]
  return parse(either)
}
console.log(one, many)`,
      output: '42 [ 1, 2 ]',
    },
    {
      mnemo: 'Surcharges : **N signatures publiques + 1 implémentation cachée**. Ordre : du plus précis au plus général.',
      piege: 'La signature d’implémentation n’est pas visible de l’extérieur : un argument de type union, accepté par l’implémentation, est refusé si aucune signature publique ne l’accepte.',
    },

    // ───────────── classes ─────────────
    { h: 'Classes : modificateurs, abstract, implements', id: 'ts-classes' },
    {
      p: 'TypeScript ajoute aux classes des **modificateurs d’accès** : `public` (défaut), `protected` (classe et sous-classes), `private` (classe seule) et `readonly`. Ils sont **effacés** à l’exécution, contrairement aux champs privés natifs `#x`. Les **propriétés-paramètres** (`constructor(private name: string)`) déclarent et assignent en une fois. `abstract` interdit l’instanciation et impose des méthodes aux sous-classes ; `implements` vérifie qu’une classe respecte une interface (sans rien hériter).',
    },
    {
      lang: 'ts',
      code: `interface Shape { area(): number }

abstract class Base implements Shape {
  constructor(protected readonly name: string) {}
  abstract area(): number
  describe() {
    return \`\${this.name} : \${this.area().toFixed(2)}\`
  }
}

class Circle extends Base {
  #secret = 'vraiment privé'
  private hint = 'privé pour TS seulement'
  constructor(private r: number) {
    super('cercle')
  }
  area() {
    return Math.PI * this.r ** 2
  }
}

const c = new Circle(1)
console.log(c.describe())
// @ts-expect-error : 'r' est private
c.r
// @ts-expect-error : impossible d'instancier une classe abstraite
new Base('x')
console.log((c as any).hint, Object.keys(c))`,
      output: "cercle : 3.14\nprivé pour TS seulement [ 'name', 'r', 'hint' ]",
    },
    {
      mnemo: '`private` = privé **pour le compilateur**, `#x` = privé **pour le moteur JS**. `implements` vérifie, `extends` hérite.',
      piege: '`private` ne protège rien au runtime : `(obj as any).secret` ou `obj[\'secret\']` y accèdent. Et `implements` n’ajoute aucun membre : il faut tout réécrire dans la classe.',
    },

    // ───────────── tsconfig ─────────────
    { h: 'tsconfig : les options strictes', id: 'ts-tsconfig' },
    {
      p: '`strict: true` active une famille d’options, dont les deux essentielles : `noImplicitAny` (un paramètre sans type ni contexte est une erreur au lieu d’un `any` silencieux) et `strictNullChecks` (`null` et `undefined` ne sont plus assignables à tout). Hors de `strict`, deux options très recommandées : `noUncheckedIndexedAccess` (un accès par index peut être `undefined`) et `exactOptionalPropertyTypes` (`a?: string` n’accepte pas `undefined` explicite).',
    },
    {
      title: 'Sans strictNullChecks, null passe partout',
      lang: 'ts',
      code: `// @strictNullChecks: false
function len(s: string) {
  return s.length
}
const n: string = null // accepté : la vérification est désactivée
type T = string | null // → string`,
    },
    {
      title: 'noUncheckedIndexedAccess',
      lang: 'ts',
      code: `// @noUncheckedIndexedAccess: true
const scores: Record<string, number> = { ada: 10 }
const s = scores['bob']
type S = typeof s // → number | undefined
const list = [1, 2, 3]
const x = list[5]
type X = typeof x // → number | undefined
// @ts-expect-error : x peut être undefined
const fixed = () => x.toFixed()
console.log(x ?? 'aucun')`,
      output: 'aucun',
    },
    {
      lang: 'ts',
      code: `// le même code avec la configuration par défaut (strict seul)
const list = [1, 2, 3]
const x = list[5]
type X = typeof x // → number
console.log(x) // undefined à l'exécution malgré le type number`,
      output: 'undefined',
    },
    {
      mnemo: '**strict** pour tout nouveau projet ; ajouter **noUncheckedIndexedAccess** pour les tableaux et dictionnaires. Migrer un vieux projet : activer les options une par une.',
      piege: 'Même en `strict`, `arr[i]` est typé `T` et non `T | undefined` : c’est le trou le plus fréquent du typage des tableaux, fermé seulement par `noUncheckedIndexedAccess`.',
    },

    // ───────────── .d.ts ─────────────
    { h: 'Fichiers .d.ts et déclarations de modules', id: 'ts-dts' },
    {
      p: 'Un fichier `.d.ts` ne contient **que des déclarations** (aucun code exécutable) : il décrit les types d’un code JavaScript existant. Les paquets les publient (`"types"` dans package.json) ou la communauté les fournit dans `@types/xxx` (DefinitelyTyped). `declare module \'nom\'` type un module sans types ; `declare global` ajoute des globales depuis un module ; et la fusion d’interfaces permet d’**augmenter** un module existant.',
    },
    {
      title: 'Typer une bibliothèque JS sans types',
      lang: 'ts',
      code: `// @filename: legacy-slugify.d.ts
declare module 'legacy-slugify' {
  export default function slugify(input: string, opts?: { lower?: boolean }): string
}
// @filename: globals.d.ts
declare const __APP_VERSION__: string
interface Window {
  analytics?: { track(event: string): void }
}
// @filename: main.ts
import slugify from 'legacy-slugify'
const slug = slugify('Hello World', { lower: true })
type Slug = typeof slug // → string
const v: string = __APP_VERSION__
window.analytics?.track('page')
// @ts-expect-error : lower attend un booléen
slugify('x', { lower: 'yes' })`,
    },
    {
      mnemo: '`.d.ts` = **la notice, pas la machine**. `declare` = « ça existe ailleurs, crois-moi ».',
      piege: 'Un `.d.ts` qui contient un `import` ou un `export` au niveau supérieur devient un **module** : ses `interface Window` ne sont plus globales, il faut alors les envelopper dans `declare global { … }`.',
    },

    // ───────────── import type ─────────────
    { h: 'Imports de types : import type', id: 'ts-imports-type' },
    {
      p: '`import type { X }` importe **uniquement** un type : la ligne est entièrement effacée à la compilation, ce qui évite de charger un module pour rien (ou un cycle d’imports à l’exécution). La forme en ligne `import { type X, fn }` garde l’import de `fn`. Avec `verbatimModuleSyntax` (recommandé, utilisé par Vite), un type importé sans `type` est une erreur, pour que chaque outil puisse effacer les imports fichier par fichier sans analyser les types.',
    },
    {
      lang: 'ts',
      code: `// @filename: models.ts
export interface User { id: number; name: string }
export const DEFAULT_USER: User = { id: 0, name: 'invité' }
// @filename: main.ts
import type { User } from './models'
import { type User as U2, DEFAULT_USER } from './models'

const ada: User = { id: 1, name: 'Ada' }
const guest: U2 = DEFAULT_USER
type Same = Expect<Equal<User, U2>>
// @ts-expect-error : un import type ne peut pas servir de valeur
const copy = { ...(null as unknown as typeof import('./models')).DEFAULT_USER } satisfies User & { extra: 1 }`,
    },
    {
      mnemo: '`import type` = **effacé à 100 %**. `import { type X }` = effacé pour X seulement.',
      piege: 'Un import utilisé seulement comme type mais écrit sans `type` peut garder un module (et ses effets de bord) dans le bundle, ou créer une dépendance circulaire à l’exécution.',
    },

    // ───────────── React ─────────────
    { h: 'TypeScript avec React', id: 'ts-react' },
    {
      p: 'Les props se typent avec un type objet ; `children` avec `React.ReactNode`. Les événements ont des types génériques par élément (`React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`). `useState` infère depuis la valeur initiale : il faut un générique quand elle ne dit pas tout (`useState<User | null>(null)`). `useRef<HTMLInputElement>(null)` pour un élément DOM. `useReducer` se type idéalement avec une **union discriminée** d’actions.',
    },
    {
      title: 'Composants, événements, hooks (JSX : non exécuté)',
      lang: 'ts',
      run: false,
      code: `import { useReducer, useRef, useState, type ReactNode, type ChangeEvent } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
} & React.ComponentPropsWithoutRef<'button'>

export function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return <button className={variant} {...rest}>{children}</button>
}

export function Search() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setUser({ name: e.target.value })
  return <input ref={input} onChange={onChange} value={user?.name ?? ''} />
}

// composant générique : T est inféré depuis items
type ListProps<T> = { items: T[]; render: (item: T) => ReactNode }
export function List<T,>({ items, render }: ListProps<T>) {
  return <ul>{items.map((it, i) => <li key={i}>{render(it)}</li>)}</ul>
}`,
    },
    {
      title: 'Le reducer, lui, se vérifie sans React',
      lang: 'ts',
      code: `type State = { count: number; error: string | null }
type Action =
  | { type: 'increment'; by: number }
  | { type: 'reset' }
  | { type: 'fail'; message: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + action.by }
    case 'reset':
      return { count: 0, error: null }
    case 'fail':
      return { ...state, error: action.message }
  }
}

let s: State = { count: 0, error: null }
s = reducer(s, { type: 'increment', by: 2 })
s = reducer(s, { type: 'fail', message: 'oups' })
// @ts-expect-error : 'by' manquant pour increment
reducer(s, { type: 'increment' })
console.log(s)`,
      output: "{ count: 2, error: 'oups' }",
    },
    {
      mnemo: 'Props = type objet, `children: ReactNode`, événements `React.XxxEvent<HTMLElement>`, `useState<T | null>(null)`, actions = union discriminée.',
      piege: '`React.FC` ajoutait autrefois `children` implicitement (retiré en React 18) et gêne les génériques : préférer une fonction aux props typées. Et `useRef<T>(null)` donne un `RefObject` dont `current` peut être `null` : tester avant usage.',
    },

    // ───────────── Vue ─────────────
    { h: 'TypeScript avec Vue 3', id: 'ts-vue' },
    {
      p: 'Avec `<script setup lang="ts">`, `defineProps` et `defineEmits` acceptent une **déclaration de type** : le compilateur de Vue en déduit la validation des props à l’exécution. `withDefaults` fournit les valeurs par défaut. `ref<T>()` et `computed` sont inférés ; `InjectionKey<T>` type `provide` / `inject`.',
    },
    {
      title: 'Composant Vue (macros du compilateur : non exécuté)',
      lang: 'ts',
      run: false,
      code: `// <script setup lang="ts">
import { computed, ref, type InjectionKey } from 'vue'

const props = withDefaults(defineProps<{ title: string; count?: number }>(), { count: 0 })

const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()

const items = ref<string[]>([])
const total = computed(() => props.count + items.value.length)
emit('change', 42)

export const UserKey: InjectionKey<{ name: string }> = Symbol('user')`,
    },
    {
      title: 'La même signature d’événements, vérifiée sans Vue',
      lang: 'ts',
      code: `type Emits = { change: [id: number]; update: [value: string] }
type EmitFn<E extends Record<string, unknown[]>> = <K extends keyof E>(event: K, ...args: E[K]) => void

const calls: string[] = []
const emit: EmitFn<Emits> = (event, ...args) => { calls.push(\`\${String(event)}(\${args.join(', ')})\`) }
emit('change', 42)
emit('update', 'ok')
// @ts-expect-error : change attend un number
const wrong = () => emit('change', '42')
console.log(calls)`,
      output: "[ 'change(42)', 'update(ok)' ]",
    },
    {
      mnemo: '`defineProps<{…}>()` + `withDefaults`, `defineEmits<{ evt: [args] }>()`, `ref<T>()`, `InjectionKey<T>`.',
      piege: 'Les macros `defineProps` / `defineEmits` sont compilées par Vue : le type passé doit être analysable par le compilateur de SFC (types importés complexes ou conditionnels mal supportés selon les versions).',
    },

    // ───────────── Angular ─────────────
    { h: 'TypeScript avec Angular', id: 'ts-angular' },
    {
      p: 'Angular est écrit en TypeScript et s’appuie sur les **décorateurs** et l’**injection de dépendances** : `inject(Service)` ou un paramètre de constructeur typé. Les `Observable<T>` de RxJS sont génériques : chaque opérateur (`map`, `filter`) transforme le type. Depuis Angular 14, les **formulaires réactifs** sont typés (`FormControl<string | null>`, `nonNullable`). `InjectionToken<T>` type une dépendance qui n’est pas une classe.',
    },
    {
      title: 'Service, DI, RxJS et formulaire typé (non exécuté)',
      lang: 'ts',
      run: false,
      code: `import { Injectable, InjectionToken, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FormBuilder } from '@angular/forms'
import { Observable, map } from 'rxjs'

export interface User { id: number; name: string }
export const API_URL = new InjectionToken<string>('API_URL')

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private api = inject(API_URL)

  names$(): Observable<string[]> {
    return this.http.get<User[]>(\`\${this.api}/users\`).pipe(map((users) => users.map((u) => u.name)))
  }
}

export class ProfileForm {
  form = inject(FormBuilder).nonNullable.group({ name: '', age: 0 })
  // this.form.value : Partial<{ name: string; age: number }>
}`,
    },
    {
      title: 'Le principe d’un pipe typé, vérifié sans RxJS',
      lang: 'ts',
      code: `type Op<A, B> = (a: A) => B
function pipe<A, B, C>(a: A, f: Op<A, B>, g: Op<B, C>): C {
  return g(f(a))
}
const users = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Bob' }]
const names = pipe(users, (us) => us.map((u) => u.name), (ns) => ns.join(', '))
type Names = typeof names // → string
console.log(names)`,
      output: 'Ada, Bob',
    },
    {
      mnemo: 'Angular : `inject()` + classes typées, `InjectionToken<T>` pour le reste, `Observable<T>` qui change de type à chaque opérateur, formulaires typés avec `nonNullable`.',
      piege: '`http.get<User[]>()` ne vérifie **rien** : c’est une assertion déguisée, la réponse réelle n’est pas validée. Et `form.value` est `Partial<…>` (les contrôles désactivés en sont exclus) : utiliser `getRawValue()` pour tout avoir.',
    },
  ],
  mnemo: 'TypeScript = **forme** (structurel) + **flux** (narrowing) + **calcul** (génériques, conditionnels, mappés). Tout est effacé au build : vérifier à la compilation, valider à l’exécution.',
  piege: 'Les échappatoires (`any`, `as`, gardes mensongères, `!`) compilent toujours : un code TypeScript n’est sûr que si l’on n’a pas menti au compilateur, et les données externes doivent être validées au runtime.',
}
