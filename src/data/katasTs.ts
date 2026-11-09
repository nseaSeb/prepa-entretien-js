import type { Kata } from './types'

/** Rappel commun aux katas de types : ce qui est vérifié, et comment. */
const TYPE_LEVEL = 'Kata **de niveau types** : rien ne s’exécute. Les tests cachés sont des lignes `type _x = Expect<Equal<…>>` (et des `// @ts-expect-error`) ajoutées après ton code : un test réussit s’il compile sans erreur, en mode `strict`.'

const base = { theme: 'ts', category: 'ts', lang: 'ts' } as const

export const tsKatas: Kata[] = [
  // ───────────── niveau types ─────────────
  {
    ...base,
    id: 'ts-my-pick',
    title: 'MyPick',
    difficulty: 'facile',
    statement: `Réécris le type utilitaire \`Pick<T, K>\` sans l'utiliser : \`MyPick<T, K>\` construit un type objet ne gardant de \`T\` que les clés \`K\`.

- \`K\` doit être limité aux clés de \`T\` : \`MyPick<Todo, 'inexistant'>\` doit être une erreur ;
- les modificateurs (\`?\`, \`readonly\`) des propriétés gardées sont conservés.

${TYPE_LEVEL}`,
    starter: `type MyPick<T, K> = any`,
    solution: `type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}`,
    tests: [],
    typeTests: [
      { name: 'une clé', code: `type Todo1 = { title: string; done: boolean; tags: string[] }\ntype _1 = Expect<Equal<MyPick<Todo1, 'title'>, { title: string }>>` },
      { name: 'plusieurs clés', code: `type _2 = Expect<Equal<MyPick<{ a: 1; b: 2; c: 3 }, 'a' | 'c'>, { a: 1; c: 3 }>>` },
      { name: 'modificateurs conservés', code: `type _3 = Expect<Equal<MyPick<{ a?: string; readonly b: number; c: 0 }, 'a' | 'b'>, { a?: string; readonly b: number }>>` },
      { name: 'clé inconnue refusée', code: `// @ts-expect-error : 'z' n'est pas une clé de { a: 1 }\ntype _e1 = MyPick<{ a: 1 }, 'z'>` },
    ],
    hints: [
      'Un type mappé parcourt une union de clés : `{ [P in K]: … }`.',
      'Contraignez `K` avec `extends keyof T`, puis la valeur de chaque propriété est `T[P]` (accès indexé).',
    ],
    discussion: `- \`{ [P in K]: T[P] }\` avec \`K extends keyof T\` est un type mappé **homomorphe** : TypeScript recopie les modificateurs \`?\` et \`readonly\` de \`T\` ;
- c'est exactement la définition de \`Pick\` dans lib.es5.d.ts ;
- variante à évoquer : \`Omit<T, K>\` = \`Pick<T, Exclude<keyof T, K>>\`, dont la contrainte \`K extends keyof any\` est volontairement plus lâche.`,
  },
  {
    ...base,
    id: 'ts-my-readonly',
    title: 'MyReadonly',
    difficulty: 'facile',
    statement: `Réécris \`Readonly<T>\` sans l'utiliser : \`MyReadonly<T>\` rend toutes les propriétés de \`T\` en lecture seule (au premier niveau seulement).

${TYPE_LEVEL}`,
    starter: `type MyReadonly<T> = any`,
    solution: `type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}`,
    tests: [],
    typeTests: [
      { name: 'équivalent à Readonly', code: `type Todo2 = { title: string; description?: string }\ntype _1 = Expect<Equal<MyReadonly<Todo2>, Readonly<Todo2>>>` },
      { name: 'superficiel', code: `type _2 = Expect<Equal<MyReadonly<{ a: { b: 1 } }>, { readonly a: { b: 1 } }>>` },
      { name: 'affectation refusée', code: `const t2: MyReadonly<{ x: number }> = { x: 1 }\n// @ts-expect-error : x est en lecture seule\nt2.x = 2` },
    ],
    hints: ['Un type mappé sur `keyof T` avec le modificateur `readonly` devant la clé.'],
    discussion: `- \`readonly\` n'existe qu'à la compilation : à l'exécution l'objet reste modifiable (\`Object.freeze\` pour une garantie réelle, elle aussi superficielle) ;
- l'inverse s'écrit avec le modificateur \`-readonly\` : \`{ -readonly [K in keyof T]: T[K] }\` (souvent appelé \`Mutable<T>\`) ;
- la lecture seule est **superficielle** : voir le kata DeepReadonly.`,
  },
  {
    ...base,
    id: 'ts-deep-readonly',
    title: 'DeepReadonly',
    difficulty: 'moyen',
    statement: `Écris \`DeepReadonly<T>\` : comme \`Readonly\`, mais **récursif**. Toutes les propriétés, à tous les niveaux, deviennent \`readonly\`, et les tableaux deviennent des \`readonly\` tableaux. Les fonctions sont laissées telles quelles, ainsi que les primitifs.

${TYPE_LEVEL}`,
    starter: `type DeepReadonly<T> = Readonly<T>`,
    solution: `type DeepReadonly<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T`,
    tests: [],
    typeTests: [
      { name: 'objets imbriqués', code: `type _1 = Expect<Equal<DeepReadonly<{ a: { b: { c: 1 } } }>, { readonly a: { readonly b: { readonly c: 1 } } }>>` },
      { name: 'tableaux', code: `type _2 = Expect<Equal<DeepReadonly<{ list: string[] }>, { readonly list: readonly string[] }>>` },
      { name: 'fonctions et primitifs intacts', code: `type _3 = Expect<Equal<DeepReadonly<{ f: () => void; n: number }>, { readonly f: () => void; readonly n: number }>>\ntype _4 = Expect<Equal<DeepReadonly<string>, string>>` },
      { name: 'modification profonde refusée', code: `const cfg3: DeepReadonly<{ db: { port: number } }> = { db: { port: 1 } }\n// @ts-expect-error : port est en lecture seule\ncfg3.db.port = 2` },
    ],
    hints: [
      'Un type conditionnel trie les cas : fonction → telle quelle, objet → type mappé récursif, sinon → primitif inchangé.',
      'Testez la fonction **avant** `object` : une fonction est aussi un `object`.',
      'Un type mappé homomorphe appliqué à un tableau produit un tableau (ici `readonly`) : pas besoin de cas spécial.',
    ],
    discussion: `- l'ordre des branches compte : \`(() => void) extends object\` est vrai ;
- un type mappé homomorphe (\`[K in keyof T]\` avec \`T\` paramètre de type) préserve tableaux et tuples : \`DeepReadonly<[1, 2]>\` donne \`readonly [1, 2]\` ;
- limites : \`Map\`, \`Set\` ou \`Date\` sont traités comme des objets quelconques (leurs méthodes restent appelables) ; une version exhaustive ajoute \`ReadonlyMap\` / \`ReadonlySet\` ;
- attention à la profondeur de récursion sur des types très imbriqués (limite d'instanciation du compilateur).`,
  },
  {
    ...base,
    id: 'ts-tuple-to-union',
    title: 'TupleToUnion',
    difficulty: 'facile',
    statement: `Écris \`TupleToUnion<T>\` qui renvoie l'union des types des éléments d'un tuple (ou d'un tableau). \`T\` doit être un tableau : \`TupleToUnion<string>\` est une erreur.

${TYPE_LEVEL}`,
    starter: `type TupleToUnion<T> = any`,
    solution: `type TupleToUnion<T extends readonly unknown[]> = T[number]`,
    tests: [],
    typeTests: [
      { name: 'tuple de littéraux', code: `type _1 = Expect<Equal<TupleToUnion<['a', 'b', 'c']>, 'a' | 'b' | 'c'>>` },
      { name: 'types mélangés', code: `type _2 = Expect<Equal<TupleToUnion<[1, 'x', true]>, 1 | 'x' | true>>` },
      { name: 'tuple vide', code: `type _3 = Expect<Equal<TupleToUnion<[]>, never>>` },
      { name: 'tuple readonly (as const)', code: `const roles4 = ['admin', 'user'] as const\ntype _4 = Expect<Equal<TupleToUnion<typeof roles4>, 'admin' | 'user'>>` },
      { name: 'non-tableau refusé', code: `// @ts-expect-error : string n'est pas un tableau\ntype _e5 = TupleToUnion<string>` },
    ],
    hints: ['L’accès indexé `T[number]` donne le type de « n’importe quel élément ».', 'Contraignez avec `readonly unknown[]` pour accepter aussi les tuples `as const`.'],
    discussion: `- \`T[number]\` est l'idiome à connaître : c'est ainsi qu'on dérive une union d'un tableau \`as const\` (\`(typeof ROLES)[number]\`), au lieu de maintenir un enum à la main ;
- \`readonly unknown[]\` accepte les tableaux mutables **et** readonly ; \`unknown[]\` refuserait un tuple \`as const\` ;
- variante récursive (moins efficace, mais bon exercice) : \`T extends [infer H, ...infer R] ? H | TupleToUnion<R> : never\`.`,
  },
  {
    ...base,
    id: 'ts-my-awaited',
    title: 'MyAwaited',
    difficulty: 'moyen',
    statement: `Écris \`MyAwaited<T>\` : le type obtenu après \`await\`. Si \`T\` est une promesse (ou un *thenable*), on renvoie le type résolu, **récursivement** (\`Promise<Promise<number>>\` → \`number\`) ; sinon \`T\` lui-même.

${TYPE_LEVEL}`,
    starter: `type MyAwaited<T> = T extends Promise<infer U> ? U : T`,
    solution: `type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T`,
    tests: [],
    typeTests: [
      { name: 'promesse simple', code: `type _1 = Expect<Equal<MyAwaited<Promise<string>>, string>>` },
      { name: 'promesses imbriquées', code: `type _2 = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>` },
      { name: 'valeur ordinaire', code: `type _3 = Expect<Equal<MyAwaited<boolean>, boolean>>` },
      { name: 'union', code: `type _4 = Expect<Equal<MyAwaited<Promise<string> | number>, string | number>>` },
      { name: 'comme Awaited', code: `type _5 = Expect<Equal<MyAwaited<Promise<Promise<Promise<'x'>>>>, Awaited<Promise<'x'>>>>` },
    ],
    hints: ['`infer` capture le type contenu : `T extends Promise<infer U> ? … : …`.', 'Rappelez `MyAwaited` sur `U` pour dérouler les promesses imbriquées.', '`PromiseLike` couvre aussi les thenables (objets avec une méthode `then`).'],
    discussion: `- le type conditionnel est **distributif** sur une union nue : \`MyAwaited<Promise<A> | B>\` donne \`A | B\` ;
- c'est ce que fait \`await\` à l'exécution : il déroule les thenables imbriqués, une promesse ne se résout jamais en promesse ;
- le vrai \`Awaited\` (TS 4.5) gère aussi les thenables dont \`then\` a une signature exotique et le cas \`null | undefined\` ; il est utilisé par le typage de \`Promise.all\`.`,
  },
  {
    ...base,
    id: 'ts-my-return-type',
    title: 'MyReturnType',
    difficulty: 'facile',
    statement: `Réécris \`ReturnType<F>\` sans l'utiliser : \`MyReturnType<F>\` renvoie le type de retour d'un type fonction. Un argument qui n'est pas une fonction doit être une erreur.

${TYPE_LEVEL}`,
    starter: `type MyReturnType<F> = any`,
    solution: `type MyReturnType<F extends (...args: any[]) => unknown> = F extends (...args: any[]) => infer R ? R : never`,
    tests: [],
    typeTests: [
      { name: 'fonction simple', code: `type _1 = Expect<Equal<MyReturnType<() => string>, string>>` },
      { name: 'avec paramètres', code: `type _2 = Expect<Equal<MyReturnType<(a: number, b: string) => boolean | undefined>, boolean | undefined>>` },
      { name: 'typeof d’une fonction', code: `const pick3 = (v: boolean) => (v ? 1 : 2)\ntype _3 = Expect<Equal<MyReturnType<typeof pick3>, 1 | 2>>` },
      { name: 'non-fonction refusée', code: `// @ts-expect-error : string n'est pas une fonction\ntype _e4 = MyReturnType<string>` },
    ],
    hints: ['Filtrez avec un type conditionnel et capturez le retour avec `infer R`.', 'Ajoutez une contrainte sur `F` pour refuser les non-fonctions.'],
    discussion: `- \`(...args: any[]) => unknown\` : les paramètres en \`any[]\` sont nécessaires, \`unknown[]\` refuserait les fonctions à paramètres typés (les paramètres sont contravariants) ;
- \`typeof fn\` est indispensable pour passer d'une **valeur** à un **type** : \`MyReturnType<fn>\` ne compile pas ;
- \`Parameters<F>\` s'écrit de la même façon avec \`F extends (...args: infer P) => any ? P : never\`.`,
  },
  {
    ...base,
    id: 'ts-first-last',
    title: 'First et Last d’un tuple',
    difficulty: 'facile',
    statement: `Écris deux types :

- \`First<T>\` : le type du premier élément du tuple \`T\`, \`never\` si le tuple est vide ;
- \`Last<T>\` : le type du dernier élément, \`never\` si le tuple est vide.

Les deux n'acceptent que des tableaux (tuples \`as const\` compris).

${TYPE_LEVEL}`,
    starter: `type First<T extends readonly unknown[]> = T[0]
type Last<T extends readonly unknown[]> = any`,
    solution: `type First<T extends readonly unknown[]> = T extends readonly [infer F, ...unknown[]] ? F : never
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never`,
    tests: [],
    typeTests: [
      { name: 'First', code: `type _1 = Expect<Equal<First<[3, 2, 1]>, 3>>\ntype _2 = Expect<Equal<First<[() => 0, { a: 1 }]>, () => 0>>` },
      { name: 'First d’un tuple vide', code: `type _3 = Expect<Equal<First<[]>, never>>` },
      { name: 'First avec undefined', code: `type _4 = Expect<Equal<First<[undefined, 1]>, undefined>>` },
      { name: 'Last', code: `type _5 = Expect<Equal<Last<[1, 2, 3]>, 3>>\ntype _6 = Expect<Equal<Last<readonly ['a']>, 'a'>>` },
      { name: 'Last d’un tuple vide', code: `type _7 = Expect<Equal<Last<[]>, never>>` },
      { name: 'non-tableau refusé', code: `// @ts-expect-error : 'abc' n'est pas un tableau\ntype _e8 = First<'abc'>` },
    ],
    hints: ['`T[0]` sur un tuple vide donne `undefined`, pas `never` : il faut un type conditionnel.', 'Les tuples variadiques permettent de filtrer : `[infer F, ...unknown[]]` et `[...unknown[], infer L]`.'],
    discussion: `- \`T[0]\` est le piège classique : \`First<[]>\` donnerait \`undefined\`, impossible à distinguer de \`First<[undefined]>\` ;
- autre solution pour First : \`T extends [] ? never : T[0]\` ;
- \`readonly [...]\` dans le motif accepte aussi les tuples \`as const\` (un tuple mutable est assignable à sa version readonly, pas l'inverse) ;
- même mécanique pour \`Pop<T>\` / \`Shift<T>\` avec \`infer Rest\`.`,
  },
  {
    ...base,
    id: 'ts-trim',
    title: 'Trim (template literal types)',
    difficulty: 'moyen',
    statement: `Écris \`Trim<S>\` qui retire, **au niveau des types**, les espaces, tabulations (\`'\\t'\`) et retours à la ligne (\`'\\n'\`) au début et à la fin d'un type chaîne littéral. \`S\` doit être une chaîne.

${TYPE_LEVEL}`,
    starter: `type Trim<S extends string> = any`,
    solution: `type Space = ' ' | '\\n' | '\\t'

type Trim<S extends string> = S extends \`\${Space}\${infer Rest}\` | \`\${infer Rest}\${Space}\` ? Trim<Rest> : S`,
    tests: [],
    typeTests: [
      { name: 'espaces des deux côtés', code: `type _1 = Expect<Equal<Trim<'  hello  '>, 'hello'>>` },
      { name: 'tabulations et retours à la ligne', code: `type _2 = Expect<Equal<Trim<'\\n\\t str \\n'>, 'str'>>` },
      { name: 'chaîne vide ou blanche', code: `type _3 = Expect<Equal<Trim<''>, ''>>\ntype _4 = Expect<Equal<Trim<'   '>, ''>>` },
      { name: 'espaces intérieurs conservés', code: `type _5 = Expect<Equal<Trim<' a b '>, 'a b'>>` },
    ],
    hints: [
      'Un template literal type sert de motif : `S extends \\`${Space}${infer Rest}\\`` reconnaît un espace en tête.',
      'Commencez par `TrimLeft` (récursif), puis faites pareil à droite, ou combinez les deux motifs dans une union.',
    ],
    discussion: `- \`infer\` dans un template literal type capture la plus petite partie possible pour le premier \`infer\`, d'où la récursion un caractère à la fois ;
- le motif en union \`\\\`\${Space}\${infer R}\\\` | \\\`\${infer R}\${Space}\\\`\` traite les deux bords dans le même type ;
- limite : la récursion des types conditionnels est bornée (environ 1000 niveaux avec l'optimisation de récursion terminale), suffisant pour des littéraux ;
- sur un \`string\` non littéral, le résultat reste \`string\` : ces types ne valent que pour des constantes connues à la compilation.`,
  },
  {
    ...base,
    id: 'ts-deep-partial',
    title: 'DeepPartial',
    difficulty: 'moyen',
    statement: `Écris \`DeepPartial<T>\` : comme \`Partial\`, mais récursif. Toutes les propriétés deviennent optionnelles à tous les niveaux d'objets imbriqués. Les fonctions et les primitifs restent inchangés. Utile pour typer une surcharge partielle de configuration.

${TYPE_LEVEL}`,
    starter: `type DeepPartial<T> = Partial<T>`,
    solution: `type DeepPartial<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T`,
    tests: [],
    typeTests: [
      { name: 'objets imbriqués', code: `type Config1 = { db: { host: string; port: number }; debug: boolean }\ntype _1 = Expect<Equal<DeepPartial<Config1>, { db?: { host?: string; port?: number }; debug?: boolean }>>` },
      { name: 'primitifs inchangés', code: `type _2 = Expect<Equal<DeepPartial<number>, number>>\ntype _3 = Expect<Equal<DeepPartial<'a' | null>, 'a' | null>>` },
      { name: 'fonctions inchangées', code: `type _4 = Expect<Equal<DeepPartial<{ log: (m: string) => void }>, { log?: (m: string) => void }>>` },
      { name: 'surcharge partielle profonde', code: `type Config5 = { db: { host: string; port: number } }\nconst over5: DeepPartial<Config5> = { db: { port: 5433 } }\n// @ts-expect-error : port doit rester un number\nconst bad5: DeepPartial<Config5> = { db: { port: 'x' } }` },
    ],
    hints: ['Même squelette que DeepReadonly : type conditionnel, puis type mappé récursif.', 'Le modificateur `?` se place après la clé : `[K in keyof T]?:`.'],
    discussion: `- même ordre des branches que DeepReadonly : les fonctions sont des objets ;
- \`DeepPartial<null>\` : le type conditionnel est distributif, \`null\` n'étend pas \`object\` et reste \`null\` ;
- les tableaux passent par le type mappé homomorphe : \`DeepPartial<string[]>\` donne \`(string | undefined)[]\`, ce qui n'est pas toujours souhaité (une version fine traite \`T extends readonly (infer U)[]\` à part) ;
- en pratique : fusion profonde d'une configuration par défaut avec une configuration utilisateur.`,
  },
  {
    ...base,
    id: 'ts-is-never',
    title: 'IsNever (distributivité)',
    difficulty: 'moyen',
    statement: `Écris \`IsNever<T>\` qui vaut \`true\` si \`T\` est \`never\`, \`false\` sinon (y compris pour \`any\` et \`unknown\`).

Le code de départ contient la version naïve : comprends pourquoi elle échoue.

${TYPE_LEVEL}`,
    starter: `type IsNever<T> = T extends never ? true : false`,
    solution: `type IsNever<T> = [T] extends [never] ? true : false`,
    tests: [],
    typeTests: [
      { name: 'never', code: `type _1 = Expect<Equal<IsNever<never>, true>>` },
      { name: 'types ordinaires', code: `type _2 = Expect<Equal<IsNever<string>, false>>\ntype _3 = Expect<Equal<IsNever<undefined>, false>>\ntype _4 = Expect<Equal<IsNever<null>, false>>` },
      { name: 'any et unknown', code: `type _5 = Expect<Equal<IsNever<any>, false>>\ntype _6 = Expect<Equal<IsNever<unknown>, false>>` },
      { name: 'union', code: `type _7 = Expect<Equal<IsNever<'a' | never>, false>>\ntype _8 = Expect<Equal<IsNever<Exclude<'a', 'a'>>, true>>` },
    ],
    hints: [
      'Un type conditionnel sur un paramètre nu est **distributif** : appliqué à `never` (l’union vide), il renvoie `never` sans évaluer aucune branche.',
      'Emballer `T` dans un tuple `[T]` désactive la distributivité.',
    ],
    discussion: `- \`never\` est l'union vide : distribuer sur zéro membre donne \`never\`, d'où \`IsNever<never>\` = \`never\` avec la version naïve ;
- \`any\` dans un type conditionnel distributif renvoie l'union des deux branches (\`boolean\`) : le tuple règle aussi ce cas ;
- \`[T] extends [U]\` est l'idiome général pour comparer sans distribuer ; à rapprocher de \`Equal\`, qui utilise des fonctions génériques pour une égalité stricte (\`any\` ≠ \`unknown\`) ;
- usage : détecter une branche impossible, ou rendre une erreur lisible quand un filtre ne laisse rien.`,
  },

  // ───────────── types + exécution ─────────────
  {
    ...base,
    id: 'ts-typed-emitter',
    title: 'EventEmitter typé',
    difficulty: 'moyen',
    statement: `Écris une classe \`TypedEmitter<Events>\` dont le paramètre \`Events\` décrit, pour chaque nom d'événement, le **tuple** des arguments de ses listeners, par exemple \`{ login: [user: string]; logout: []; move: [x: number, y: number] }\`.

- \`on(event, listener)\` abonne \`listener\` et renvoie une fonction de désabonnement ;
- \`off(event, listener)\` désabonne ;
- \`emit(event, ...args)\` appelle les listeners dans l'ordre d'abonnement et renvoie \`true\` s'il y en avait au moins un, \`false\` sinon ;
- un listener qui se désabonne pendant un \`emit\` ne doit pas faire sauter le suivant.

Typage attendu : les arguments de \`emit\` et des listeners sont déduits de \`Events\`, un événement inconnu ou un argument du mauvais type est une erreur de compilation. Les tests vérifient le comportement à l'exécution **et** le typage (code compilé en strict).`,
    starter: `class TypedEmitter<Events> {
  on(event: string, listener: (...args: any[]) => void): () => void {
    throw new Error('à implémenter')
  }

  off(event: string, listener: (...args: any[]) => void): void {
    throw new Error('à implémenter')
  }

  emit(event: string, ...args: any[]): boolean {
    throw new Error('à implémenter')
  }
}`,
    solution: `type Listener<A extends unknown[]> = (...args: A) => void

class TypedEmitter<Events extends Record<string, unknown[]>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {}

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    ;(this.listeners[event] ??= []).push(listener)
    return () => this.off(event, listener)
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const list = this.listeners[event]
    if (!list) return
    const i = list.indexOf(listener)
    if (i !== -1) list.splice(i, 1)
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    const list = this.listeners[event]
    if (!list || list.length === 0) return false
    for (const listener of [...list]) listener(...args)
    return true
  }
}`,
    tests: [
      { name: 'emit transmet les arguments', code: `const e = new TypedEmitter()
const got = []
e.on('move', (x, y) => got.push(x + y))
assertEqual(e.emit('move', 1, 2), true)
assertEqual(got, [3])` },
      { name: 'emit sans listener renvoie false', code: `const e = new TypedEmitter()
assertEqual(e.emit('logout'), false)` },
      { name: 'ordre d’abonnement', code: `const e = new TypedEmitter()
const order = []
e.on('a', () => order.push(1))
e.on('a', () => order.push(2))
e.emit('a')
assertEqual(order, [1, 2])` },
      { name: 'on renvoie un désabonnement, off retire', code: `const e = new TypedEmitter()
let n = 0
const f = () => n++
const unsubscribe = e.on('a', f)
e.emit('a')
unsubscribe()
e.emit('a')
e.on('a', f)
e.off('a', f)
assertEqual(e.emit('a'), false)
assertEqual(n, 1)` },
      { name: 'désabonnement pendant emit', code: `const e = new TypedEmitter()
const calls = []
const first = () => { calls.push('first'); e.off('a', first) }
e.on('a', first)
e.on('a', () => calls.push('second'))
e.emit('a')
e.emit('a')
assertEqual(calls, ['first', 'second', 'second'])` },
    ],
    typeTests: [
      { name: 'type : arguments des listeners déduits', code: `const em1 = new TypedEmitter<{ login: [user: string]; move: [x: number, y: number] }>()
em1.on('login', (user) => {
  type _1 = Expect<Equal<typeof user, string>>
})
em1.on('move', (x, y) => {
  type _2 = Expect<Equal<[typeof x, typeof y], [number, number]>>
})` },
      { name: 'type : mauvais argument refusé', code: `const em2 = new TypedEmitter<{ login: [user: string] }>()
// @ts-expect-error : 42 n'est pas une string
em2.emit('login', 42)` },
      { name: 'type : événement inconnu refusé', code: `const em3 = new TypedEmitter<{ login: [user: string] }>()
// @ts-expect-error : 'logout' n'est pas un événement déclaré
em3.emit('logout')` },
      { name: 'type : nombre d’arguments vérifié', code: `const em4 = new TypedEmitter<{ move: [x: number, y: number]; logout: [] }>()
em4.emit('logout')
// @ts-expect-error : il manque y
em4.emit('move', 1)` },
    ],
    hints: [
      'Contraignez la carte : `Events extends Record<string, unknown[]>`, puis rendez chaque méthode générique sur `K extends keyof Events`.',
      'Le reste typé par un tuple donne arité et types : `emit<K extends keyof Events>(event: K, ...args: Events[K])`.',
      'Stockez les listeners dans un type mappé `{ [K in keyof Events]?: Listener<Events[K]>[] }` et itérez sur une copie dans `emit`.',
    ],
    discussion: `- les tuples nommés (\`[user: string]\`) servent de documentation : les noms apparaissent dans l'autocomplétion de \`emit\` ;
- une \`interface\` n'est pas assignable à \`Record<string, unknown[]>\` (pas de signature d'index implicite), un alias \`type\` l'est : piège fréquent avec ce genre de contrainte ;
- itérer sur \`[...list]\` évite qu'un \`splice\` pendant la boucle décale les index ;
- c'est le motif des émetteurs typés des bibliothèques (mitt, socket.io, \`EventTarget\` typé via \`addEventListener\` surchargé dans lib.dom).`,
  },
  {
    ...base,
    id: 'ts-group-by',
    title: 'groupBy typé',
    difficulty: 'facile',
    statement: `Écris \`groupBy(items, key)\` qui regroupe les éléments de \`items\` dans un objet, selon la clé renvoyée par \`key(item)\`. L'ordre des éléments est conservé dans chaque groupe, \`key\` est appelée une fois par élément.

Typage attendu : \`groupBy\` est générique ; la clé doit être une \`PropertyKey\` (string, number ou symbol) ; le résultat est de type \`Partial<Record<K, T[]>>\`, où \`K\` est le type de clé déduit (un groupe peut ne pas exister, d'où \`Partial\`). N'utilise pas \`Object.groupBy\` (ES2024, absent de la lib ES2022).`,
    starter: `function groupBy(items: any[], key: (item: any) => any): any {
  throw new Error('à implémenter')
}`,
    solution: `function groupBy<T, K extends PropertyKey>(items: readonly T[], key: (item: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {}
  for (const item of items) {
    const k = key(item)
    ;(out[k] ??= []).push(item)
  }
  return out
}`,
    tests: [
      { name: 'regroupe par parité', code: `assertEqual(groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even')), { odd: [1, 3], even: [2, 4] })` },
      { name: 'ordre conservé', code: `const users = [{ n: 'Ada', r: 'a' }, { n: 'Bob', r: 'u' }, { n: 'Cid', r: 'a' }]
assertEqual(groupBy(users, (u) => u.r).a.map((u) => u.n), ['Ada', 'Cid'])` },
      { name: 'tableau vide', code: `assertEqual(groupBy([], (x) => x), {})` },
      { name: 'key appelée une fois par élément', code: `let calls = 0
groupBy(['a', 'bb', 'cc'], (s) => { calls++; return s.length })
assertEqual(calls, 3)` },
    ],
    typeTests: [
      { name: 'type : union de clés déduite', code: `type U1 = { name: string; role: 'admin' | 'user' }
declare const users1: U1[]
const g1 = groupBy(users1, (u) => u.role)
type _1 = Expect<Equal<typeof g1, Partial<Record<'admin' | 'user', U1[]>>>>` },
      { name: 'type : clé numérique', code: `const g2 = groupBy([1, 2, 3], (n) => n % 2)
type _2 = Expect<Equal<typeof g2, Partial<Record<number, number[]>>>>` },
      { name: 'type : clé non PropertyKey refusée', code: `// @ts-expect-error : un objet ne peut pas servir de clé
groupBy([1, 2], (n) => ({ n }))` },
      { name: 'type : un groupe peut manquer', code: `const g4 = groupBy(['a', 'b'], (s) => s)
// @ts-expect-error : g4.a peut être undefined
g4.a.length` },
    ],
    hints: [
      'Deux paramètres de type : `T` (élément) et `K extends PropertyKey` (clé), déduits des arguments.',
      '`(out[k] ??= []).push(item)` crée le groupe au besoin.',
    ],
    discussion: `- \`K extends PropertyKey\` laisse TypeScript déduire une union de littéraux (\`'admin' | 'user'\`) au lieu de \`string\` ;
- \`Partial<Record<K, T[]>>\` est honnête : rien ne garantit que chaque clé possible a un groupe ; \`Record<K, T[]>\` mentirait ;
- \`readonly T[]\` en paramètre accepte aussi les tableaux \`as const\` et documente que la fonction ne mute pas l'entrée ;
- ES2024 apporte \`Object.groupBy\` (objet sans prototype) et \`Map.groupBy\` (clés quelconques).`,
  },
  {
    ...base,
    id: 'ts-result',
    title: 'Type Result (ok / err)',
    difficulty: 'moyen',
    statement: `Modélise les erreurs attendues par une valeur plutôt que par une exception. Écris :

- \`type Result<T, E = string>\` : une **union discriminée** \`{ ok: true; value: T } | { ok: false; error: E }\` ;
- \`ok(value)\` : \`Result<T, never>\` et \`err(error)\` : \`Result<never, E>\` ;
- \`map(result, fn)\` : applique \`fn\` à la valeur si \`ok\`, renvoie l'erreur telle quelle sinon (sans appeler \`fn\`) ;
- \`unwrapOr(result, fallback)\` : la valeur si \`ok\`, \`fallback\` sinon ;
- \`parseAge(input: string): Result<number, string>\` : un entier entre 0 et 150, sinon une erreur (message libre).

Les tests vérifient le comportement et le typage (le rétrécissement sur \`ok\` doit fonctionner).`,
    starter: `type Result<T, E = string> = any

function ok(value: any): any {
  throw new Error('à implémenter')
}

function err(error: any): any {
  throw new Error('à implémenter')
}

function map(result: any, fn: (value: any) => any): any {
  throw new Error('à implémenter')
}

function unwrapOr(result: any, fallback: any): any {
  throw new Error('à implémenter')
}

function parseAge(input: string): any {
  throw new Error('à implémenter')
}`,
    solution: `type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result
}

function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback
}

function parseAge(input: string): Result<number, string> {
  const n = Number(input)
  if (input.trim() === '' || !Number.isInteger(n)) return err('pas un entier : ' + input)
  if (n < 0 || n > 150) return err('âge hors limites : ' + n)
  return ok(n)
}`,
    tests: [
      { name: 'ok et err', code: `assertEqual(ok(1), { ok: true, value: 1 })
assertEqual(err('x'), { ok: false, error: 'x' })` },
      { name: 'map', code: `assertEqual(map(ok(2), (n) => n * 10), { ok: true, value: 20 })
let called = false
const e = err('boom')
assertEqual(map(e, () => { called = true }), { ok: false, error: 'boom' })
assert(!called, 'fn ne doit pas être appelée sur une erreur')` },
      { name: 'unwrapOr', code: `assertEqual(unwrapOr(ok(3), 0), 3)
assertEqual(unwrapOr(err('x'), 0), 0)` },
      { name: 'parseAge', code: `assertEqual(parseAge('42'), { ok: true, value: 42 })
for (const bad of ['abc', '', '  ', '-3', '151', '4.5']) {
  const r = parseAge(bad)
  assert(r.ok === false && typeof r.error === 'string', 'devrait échouer : ' + JSON.stringify(bad))
}` },
    ],
    typeTests: [
      { name: 'type : rétrécissement sur ok', code: `const r1 = parseAge('42')
if (r1.ok) {
  type _1 = Expect<Equal<typeof r1.value, number>>
} else {
  type _2 = Expect<Equal<typeof r1.error, string>>
}` },
      { name: 'type : value inaccessible sans vérification', code: `// @ts-expect-error : value n'existe que si ok vaut true
parseAge('1').value` },
      { name: 'type : map change le type de la valeur', code: `const r3 = map(parseAge('20'), (n) => n >= 18)
type _3 = Expect<Equal<typeof r3, Result<boolean, string>>>` },
      { name: 'type : ok et err', code: `const r4 = ok(1)
const r5 = err(new Error('x'))
type _4 = Expect<Equal<typeof r4, Result<number, never>>>
type _5 = Expect<Equal<typeof r5, Result<never, Error>>>` },
    ],
    hints: [
      'Le discriminant `ok` (littéraux `true` / `false`) permet à TypeScript de rétrécir l’union après `if (r.ok)`.',
      '`never` comme type d’erreur de `ok()` : un `Result<T, never>` est assignable à n’importe quel `Result<T, E>`.',
      'Dans `map`, la branche erreur peut renvoyer `result` tel quel : son type est déjà `{ ok: false; error: E }`.',
    ],
    discussion: `- l'erreur fait partie de la signature : l'appelant **doit** traiter le cas \`ok: false\` pour accéder à \`value\`, ce qu'une exception ne garantit pas (le \`catch\` reçoit \`unknown\`) ;
- \`never\` est le type « vide » : \`Result<number, never>\` ne peut pas être une erreur, et il s'élargit sans conversion ;
- à réserver aux erreurs **attendues** (validation, parsing, réseau) ; les bugs restent des exceptions ;
- bibliothèques : neverthrow, Effect ; le même motif existe en Rust (\`Result\`) et en Kotlin.`,
  },
  {
    ...base,
    id: 'ts-assert-never',
    title: 'assertNever et switch exhaustif',
    difficulty: 'facile',
    statement: `Le type \`Shape\` est donné. Écris :

- \`assertNever(value: never): never\` : lève une \`Error\` dont le message contient \`JSON.stringify(value)\` ;
- \`area(shape: Shape): number\` : l'aire de la forme (\`circle\` : π × radius², \`square\` : side², \`rect\` : width × height), avec un \`switch\` sur \`kind\` dont la branche \`default\` appelle \`assertNever\`.

Ainsi, ajouter une forme à \`Shape\` sans la traiter devient une erreur de compilation, et une donnée inattendue à l'exécution (JSON mal formé) lève une erreur explicite.`,
    starter: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; width: number; height: number }

function assertNever(value: any): any {
  throw new Error('à implémenter')
}

function area(shape: Shape): number {
  throw new Error('à implémenter')
}`,
    solution: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; width: number; height: number }

function assertNever(value: never): never {
  throw new Error('Cas non géré : ' + JSON.stringify(value))
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.side ** 2
    case 'rect':
      return shape.width * shape.height
    default:
      return assertNever(shape)
  }
}`,
    tests: [
      { name: 'aires', code: `assertEqual(area({ kind: 'circle', radius: 1 }), Math.PI)
assertEqual(area({ kind: 'square', side: 3 }), 9)
assertEqual(area({ kind: 'rect', width: 2, height: 5 }), 10)` },
      { name: 'assertNever lève une erreur explicite', code: `let message = ''
try { assertNever({ kind: 'triangle' }) } catch (e) { message = e.message }
assert(message.includes('{"kind":"triangle"}'), 'message attendu avec la valeur, obtenu : ' + message)` },
      { name: 'forme inconnue à l’exécution', code: `assertThrows(() => area({ kind: 'triangle', base: 1 }))` },
    ],
    typeTests: [
      { name: 'type : assertNever n’accepte que never', code: `type _1 = Expect<Equal<Parameters<typeof assertNever>[0], never>>
type _2 = Expect<Equal<typeof assertNever, (value: never) => never>>` },
      { name: 'type : une Shape n’est pas never', code: `declare const s3: Shape
// @ts-expect-error : sans rétrécissement, Shape n'est pas assignable à never
assertNever(s3)` },
    ],
    hints: [
      'Dans la branche `default` d’un switch qui couvre tous les cas, `shape` est rétréci à `never`.',
      'Un paramètre de type `never` n’accepte que ce qui a été entièrement rétréci : c’est ce qui fait échouer la compilation quand un cas manque.',
    ],
    discussion: `- la vérification est double : **compilation** (un nouveau \`kind\` non traité rend \`shape\` non-\`never\` dans \`default\`) et **exécution** (donnée externe qui ne respecte pas le type) ;
- alternative sans fonction : \`const _exhaustive: never = shape\`, ou \`satisfies never\` (TS 4.9) ;
- avec \`noImplicitReturns\` / un type de retour explicite, oublier un cas sans \`default\` est aussi signalé (« Function lacks ending return statement »), mais sans message à l'exécution ;
- motif clé des réducteurs (\`useReducer\`, Redux) et des machines à états.`,
  },
]
