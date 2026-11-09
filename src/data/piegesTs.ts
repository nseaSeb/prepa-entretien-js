import type { Piege } from './types'

const Q = "Ce code compile. Qu'affiche-t-il ?"

/** Pièges TypeScript : chaque code compile (erreurs voulues en @ts-expect-error), la sortie montre la surprise à l'exécution. */
export const tsPieges: Piege[] = [
  {
    id: "ts-p-any-contagion",
    title: "`any` est contagieux",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `function parse(raw: string): any {
  return JSON.parse(raw)
}

const user = parse('{"name": "Ada"}')
const upper: string = user.nmae.toUpperCase()
console.log(upper)`,
    output: "Uncaught TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    explanation: `\`parse\` renvoie \`any\` : à partir de là, **tout** ce qui en dérive est \`any\` aussi. \`user.nmae\` (faute de frappe) est accepté, \`.toUpperCase()\` aussi, et l'annotation \`: string\` est satisfaite puisque \`any\` est assignable à tout. Le compilateur ne vérifie plus rien, et l'erreur arrive à l'exécution : \`user.nmae\` vaut \`undefined\`.

\`any\` désactive le typage et se propage silencieusement : un seul \`any\` en entrée (souvent \`JSON.parse\`, une réponse \`fetch\` ou une lib mal typée) contamine les variables, les retours de fonction et les paramètres qui en dépendent.

Correction : renvoyer \`unknown\`, le « any sûr » : on peut tout y mettre, mais rien n'est permis dessus tant qu'on n'a pas **rétréci** le type (\`typeof\`, \`in\`, garde de type, ou validation avec une bibliothèque comme zod). Activer aussi \`noImplicitAny\` (inclus dans \`strict\`) et la règle ESLint \`no-explicit-any\`.`,
    fix: { lang: 'ts', code: `function parse(raw: string): unknown {
  return JSON.parse(raw)
}

const user = parse('{"name": "Ada"}')
// @ts-expect-error : unknown interdit l'accès sans vérification
user.nmae
if (typeof user === 'object' && user !== null && 'name' in user && typeof user.name === 'string') {
  console.log(user.name.toUpperCase())
}`, output: "ADA" },
  },
  {
    id: "ts-p-as-lies",
    title: "`as` ment au compilateur",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type User = { name: string; tags: string[] }

const data = { name: 'Ada' } as User
console.log(data.name)
console.log(data.tags.length)`,
    output: "Ada\nUncaught TypeError: Cannot read properties of undefined (reading 'length')",
    explanation: `Une **assertion de type** (\`x as T\`) ne convertit rien et ne vérifie rien à l'exécution : elle dit au compilateur « fais-moi confiance ». TypeScript accepte \`{ name: 'Ada' } as User\` car les deux types se recouvrent (l'objet est un sous-ensemble de \`User\`). \`data.tags\` est alors typé \`string[]\`… mais vaut \`undefined\`.

Les types sont **effacés** à la compilation : seul le JavaScript s'exécute, et il n'a jamais entendu parler de \`User\`.

Correction : préférer une **annotation** (\`const data: User = …\`), qui vérifie que la valeur est complète, ou \`satisfies User\`, qui vérifie sans élargir le type. Réserver \`as\` aux cas où l'on sait réellement quelque chose que le compilateur ignore (par exemple \`document.getElementById('app') as HTMLDivElement\`), et ne jamais l'utiliser pour faire taire une erreur.`,
    fix: { lang: 'ts', code: `type User = { name: string; tags: string[] }

// @ts-expect-error : sans as, l'oubli de tags est détecté
const data: User = { name: 'Ada' }
const ok = { name: 'Ada', tags: [] } satisfies User
console.log(ok.tags.length)`, output: "0" },
  },
  {
    id: "ts-p-excess-property",
    title: "Propriétés en trop : seulement sur les littéraux frais",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type Point = { x: number; y: number }

// @ts-expect-error : littéral frais, propriété en trop
const a: Point = { x: 1, y: 2, z: 3 }

const tmp = { x: 1, y: 2, z: 3 }
const b: Point = tmp // compile : pas de vérification d'excès
console.log(Object.keys(b))`,
    output: "[ 'x', 'y', 'z' ]",
    explanation: `La vérification des **propriétés en excès** (*excess property check*) ne s'applique qu'à un objet littéral « frais », écrit directement à l'endroit où un type est attendu : \`{ x: 1, y: 2, z: 3 }\` assigné à \`Point\` est refusé (probable faute de frappe).

Dès que l'objet passe par une variable intermédiaire, on retombe sur le **typage structurel** : \`tmp\` a au moins \`x\` et \`y\`, il est donc compatible avec \`Point\`. La propriété \`z\` reste bien présente à l'exécution, comme le montre \`Object.keys\`.

Conséquence : un type TypeScript décrit un **minimum**, pas une forme exacte. Ne jamais supposer qu'un objet typé \`Point\` n'a que \`x\` et \`y\` (attention en l'envoyant à une API ou en le sérialisant). Pour ne garder que certaines clés, il faut les recopier explicitement (\`{ x: tmp.x, y: tmp.y }\`).`,
  },
  {
    id: "ts-p-numeric-enum",
    title: "Enum numérique : mapping inverse et nombres acceptés",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `enum Status {
  Active,
  Banned,
}

function label(s: Status) {
  return Status[s]
}

console.log(Status.Banned, Status[1])
console.log(Object.keys(Status))
const fromApi: number = 42
console.log(label(fromApi))`,
    output: "1 Banned\n[ '0', '1', 'Active', 'Banned' ]\nundefined",
    explanation: `Un \`enum\` numérique génère un **objet réel** à l'exécution, avec un **mapping inverse** : \`Status.Banned\` vaut \`1\` et \`Status[1]\` vaut \`'Banned'\`. \`Object.keys(Status)\` contient donc les clés numériques **et** les noms, ce qui surprend quand on veut lister les valeurs.

Autre faiblesse : un \`number\` quelconque est assignable à un enum numérique. Depuis TypeScript 5.0, un littéral hors bornes (\`label(42)\`) est refusé, mais une variable typée \`number\` (une valeur venant d'une API) passe toujours, et \`Status[42]\` renvoie \`undefined\`.

Correction courante : une **union de littéraux**, éventuellement dérivée d'un objet \`as const\` pour garder des noms (\`Status.Banned\`). Aucun code généré pour le type, pas de mapping inverse, et seules les valeurs listées sont acceptées. Les \`enum\` de chaînes n'ont pas de mapping inverse, mais tout \`enum\` génère du code : l'option \`erasableSyntaxOnly\` (TS exécuté directement par Node, types simplement effacés) les refuse, et les \`const enum\` posent problème avec \`isolatedModules\`.`,
    fix: { lang: 'ts', code: `const Status = { Active: 'active', Banned: 'banned' } as const
type Status = (typeof Status)[keyof typeof Status] // → 'active' | 'banned'

function label(s: Status) {
  return s.toUpperCase()
}

console.log(label(Status.Banned))
// @ts-expect-error : seules les deux chaînes sont acceptées
label('deleted')`, output: "BANNED" },
  },
  {
    id: "ts-p-empty-object-type",
    title: "`{}`, `object` et `Object`",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `const a: {} = 'texte'
const b: Object = 42
// @ts-expect-error : object exclut les primitives
const c: object = 'texte'
const d: object = [1, 2]

function size(v: {}) {
  return String(v).length
}
console.log(size(a), size(b), size(d))
// @ts-expect-error : seuls null et undefined sont refusés par {}
size(null)`,
    output: "5 2 3",
    explanation: `Le type \`{}\` ne veut pas dire « objet vide » : il signifie « n'importe quelle valeur **sauf \`null\` et \`undefined\`** ». Une chaîne, un nombre ou un booléen y sont assignables. \`Object\` (majuscule) se comporte presque pareil (il décrit les méthodes de \`Object.prototype\`, que les primitives ont via leur enveloppe).

Seul \`object\` (minuscule) exclut les primitives : il accepte objets, tableaux et fonctions.

Règles pratiques :
- pour « une valeur non nulle quelconque », \`{}\` ou mieux \`NonNullable<unknown>\` ;
- pour « un objet non primitif », \`object\` ;
- pour un dictionnaire, \`Record<string, unknown>\` ;
- pour un objet vraiment vide, \`Record<string, never>\` ;
- ne jamais utiliser \`Object\`, \`String\`, \`Number\` (types enveloppes).`,
  },
  {
    id: "ts-p-narrowing-callback",
    title: "Le narrowing ne survit pas dans un callback",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type User = { name: string; nickname?: string }

function greetLater(user: User) {
  if (user.nickname) {
    const short = user.nickname.slice(0, 3) // ok : narrowing
    setTimeout(() => {
      // @ts-expect-error : dans le callback, nickname redevient string | undefined
      console.log(user.nickname.toUpperCase(), short)
    }, 0)
    user.nickname = undefined
  }
}
greetLater({ name: 'Ada', nickname: 'Lovelace' })`,
    output: "Uncaught TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    explanation: `Le **narrowing** (\`if (user.nickname)\`) vaut pour le code qui s'exécute **tout de suite**. Dans un callback (\`setTimeout\`, \`then\`, gestionnaire d'événement), TypeScript ne sait pas *quand* la fonction sera appelée : entre-temps, la propriété d'un objet mutable a pu changer. Il « oublie » donc le rétrécissement pour les propriétés et les variables \`let\` réassignées, et \`user.nickname\` redevient \`string | undefined\` dans la flèche : d'où l'erreur signalée (masquée ici par \`@ts-expect-error\`).

L'exécution donne raison au compilateur : \`user.nickname = undefined\` s'exécute avant le minuteur, et le callback plante.

Correction : copier la valeur dans une **constante locale** avant le callback. Une \`const\` ne peut pas changer, le narrowing est conservé dans les fonctions imbriquées (et depuis TS 5.4, aussi pour les \`let\` non réassignées après la fermeture).`,
    fix: { lang: 'ts', code: `type User = { name: string; nickname?: string }

function greetLater(user: User) {
  const nickname = user.nickname // copie locale constante : le narrowing survit
  if (nickname) {
    setTimeout(() => console.log(nickname.toUpperCase()), 0)
    user.nickname = undefined
  }
}
greetLater({ name: 'Ada', nickname: 'Lovelace' })`, output: "LOVELACE" },
  },
  {
    id: "ts-p-exact-optional",
    title: "Optionnel `?` n’est pas `| undefined`",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `// @exactOptionalPropertyTypes: true
type Options = { timeout?: number }

const a: Options = {}
// @ts-expect-error : « absent » n'est plus synonyme de « undefined »
const b: Options = { timeout: undefined }

console.log('timeout' in a, 'timeout' in b)`,
    output: "false true",
    explanation: `Par défaut, \`timeout?: number\` accepte une propriété **absente** comme une propriété **présente valant \`undefined\`**. Ce n'est pourtant pas la même chose à l'exécution : \`'timeout' in b\` vaut \`true\`, \`Object.keys(b)\` contient \`timeout\`, et une fusion \`{ ...defaults, ...b }\` écrase la valeur par défaut par \`undefined\`.

L'option \`exactOptionalPropertyTypes\` (hors \`strict\`, à activer à part) distingue les deux : \`?\` signifie alors seulement « peut être absente », et écrire \`timeout: undefined\` est refusé, sauf si le type dit explicitement \`timeout?: number | undefined\`.

Question d'entretien fréquente : « quelle différence entre \`a?: T\` et \`a: T | undefined\` ? » La seconde oblige à **écrire** la propriété (même à \`undefined\`), la première permet de l'omettre ; avec \`exactOptionalPropertyTypes\`, la première n'accepte plus \`undefined\` explicite.`,
  },
  {
    id: "ts-p-unchecked-index",
    title: "Index de tableau : `number`, pas `number | undefined`",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `const scores = [10, 20, 30]
const fourth = scores[3] // type : number
type Fourth = typeof fourth // → number
console.log(fourth.toFixed(1))`,
    output: "Uncaught TypeError: Cannot read properties of undefined (reading 'toFixed')",
    explanation: `Sans option particulière, TypeScript considère qu'un accès \`scores[i]\` renvoie toujours un \`number\` : le type de l'élément, sans \`undefined\`. C'est un compromis de confort (sinon chaque accès indexé demanderait une vérification), mais il est **faux** dès qu'on sort des bornes : \`scores[3]\` vaut \`undefined\` et \`.toFixed\` plante. Même chose pour les dictionnaires \`Record<string, T>\` ou les signatures d'index.

L'option \`noUncheckedIndexedAccess\` (non incluse dans \`strict\`) ajoute \`| undefined\` aux accès indexés, ce qui oblige à gérer l'absence (\`?.\`, \`??\`, test explicite). Les itérations \`for…of\` et les méthodes comme \`map\` ne sont pas concernées, seuls les accès par index le sont.`,
    fix: { lang: 'ts', code: `// @noUncheckedIndexedAccess: true
const scores = [10, 20, 30]
const fourth = scores[3]
type Fourth = typeof fourth // → number | undefined
console.log(fourth?.toFixed(1) ?? 'aucun score')`, output: "aucun score" },
  },
  {
    id: "ts-p-object-keys",
    title: "`Object.keys` renvoie `string[]`",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type Prices = { apple: number; pear: number }

function total(p: Prices) {
  let sum = 0
  for (const key of Object.keys(p)) {
    // @ts-expect-error : key est string, pas keyof Prices
    sum += p[key]
  }
  return sum
}

const basket = { apple: 1, pear: 2, discount: 'none' }
console.log(total(basket))`,
    output: "3none",
    explanation: `On s'attendrait à ce que \`Object.keys(p)\` soit typé \`(keyof Prices)[]\`, c'est-à-dire \`('apple' | 'pear')[]\`. C'est volontairement \`string[]\` : à cause du **typage structurel**, un objet typé \`Prices\` peut avoir **d'autres** clés. C'est exactement ce qui se passe ici : \`basket\` a une clé \`discount\` en plus, il est accepté par \`total\`, et la boucle additionne \`'none'\`… par concaténation : \`3 + 'none'\` donne \`'3none'\`.

Le \`@ts-expect-error\` montre l'erreur que TypeScript signale sur \`p[key]\` (on ne peut pas indexer \`Prices\` par un \`string\` quelconque). La forcer avec \`key as keyof Prices\` ferait taire l'erreur sans régler le problème.

Correction : itérer sur une liste **explicite** des clés attendues (ou utiliser une \`Map\`), et valider les données externes. La signature \`Object.keys(o): string[]\` est une protection, pas un oubli.`,
    fix: { lang: 'ts', code: `type Prices = { apple: number; pear: number }

function total(p: Prices) {
  const keys: (keyof Prices)[] = ['apple', 'pear'] // liste explicite des clés attendues
  return keys.reduce((sum, k) => sum + p[k], 0)
}

const basket = { apple: 1, pear: 2, discount: 'none' }
console.log(total(basket))`, output: "3" },
  },
  {
    id: "ts-p-method-bivariance",
    title: "Syntaxe méthode : paramètres bivariants",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type Animal = { name: string }
type Dog = Animal & { bark(): string }

type MethodHandler = { handle(a: Animal): void } // syntaxe méthode : bivariante
type PropHandler = { handle: (a: Animal) => void } // propriété fonction : contravariante

const dogOnly = (d: Dog) => console.log(d.bark())

const m: MethodHandler = { handle: dogOnly } // compile !
// @ts-expect-error : strictFunctionTypes s'applique aux propriétés fonction
const p: PropHandler = { handle: dogOnly }

m.handle({ name: 'Rex' })`,
    output: "Uncaught TypeError: d.bark is not a function",
    explanation: `Avec \`strictFunctionTypes\` (inclus dans \`strict\`), les paramètres de fonction sont vérifiés de façon **contravariante** : un gestionnaire attendu pour tout \`Animal\` ne peut pas être remplacé par une fonction qui exige un \`Dog\` (elle pourrait recevoir un chat). C'est ce qui est refusé pour \`PropHandler\`.

Mais cette règle ne s'applique qu'aux types écrits comme **propriété fonction** (\`handle: (a: Animal) => void\`). Les **méthodes** (\`handle(a: Animal): void\`) restent **bivariantes**, pour des raisons de compatibilité (notamment \`Array<T>\` et les API du DOM). \`MethodHandler\` accepte donc \`dogOnly\`, et l'appel avec un simple animal plante.

À retenir : dans ses propres interfaces de callbacks, préférer la syntaxe propriété (\`onChange: (v: string) => void\`) pour bénéficier de la vérification stricte.`,
    fix: { lang: 'ts', code: `type Animal = { name: string }

type Handler = { handle: (a: Animal) => void } // propriété fonction : vérification stricte

const anyAnimal = (a: Animal) => console.log(a.name)
const h: Handler = { handle: anyAnimal }
h.handle({ name: 'Rex' })`, output: "Rex" },
  },
  {
    id: "ts-p-readonly-shallow",
    title: "`readonly` est superficiel",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type Config = {
  readonly name: string
  readonly tags: string[]
  readonly db: { host: string }
}

const config: Config = { name: 'app', tags: ['a'], db: { host: 'localhost' } }
// @ts-expect-error : name est readonly
config.name = 'autre'
config.tags.push('b') // compile : readonly ne protège que la propriété
config.db.host = 'prod.example.com' // compile aussi
console.log(config.tags, config.db.host)`,
    output: "[ 'a', 'b' ] prod.example.com",
    explanation: `\`readonly\` interdit seulement de **réassigner la propriété** (\`config.name = …\`). Il ne dit rien du contenu : \`config.tags.push('b')\` modifie le tableau référencé, et \`config.db.host = …\` modifie l'objet imbriqué. C'est la même chose que \`const\` en JavaScript, ou que \`Object.freeze\`, qui sont superficiels.

Par ailleurs, \`readonly\` n'existe qu'à la compilation : aucun gel n'a lieu à l'exécution (\`Object.isFrozen\` reste \`false\` dans la correction).

Pour une immutabilité profonde au niveau des types : \`readonly string[]\` (ou \`ReadonlyArray<string>\`) pour les tableaux, \`as const\` sur un littéral, ou un type récursif \`DeepReadonly<T>\` comme dans la correction. Pour une garantie à l'exécution, il faut en plus \`Object.freeze\` (récursif) ou une structure immuable.`,
    fix: { lang: 'ts', code: `type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] }
type Config = { name: string; tags: string[]; db: { host: string } }

const config: DeepReadonly<Config> = { name: 'app', tags: ['a'], db: { host: 'localhost' } }
// @ts-expect-error : tags est un readonly string[]
config.tags.push('b')
// @ts-expect-error : db.host est readonly
config.db.host = 'prod.example.com'
console.log(Object.isFrozen(config))`, output: "false" },
  },
  {
    id: "ts-p-json-parse-as",
    title: "`JSON.parse(…) as T` ne valide rien",
    theme: 'ts',
    lang: 'ts',
    question: Q,
    code: `type Order = { id: number; total: number }

const raw = '{"id": "42", "total": "19.90"}' // l'API renvoie des chaînes
const order = JSON.parse(raw) as Order
console.log(order.total + 10)
console.log(order.id === 42)`,
    output: "19.9010\nfalse",
    explanation: `\`JSON.parse\` renvoie \`any\`, et \`as Order\` se contente de **déclarer** la forme attendue. Si l'API envoie \`"19.90"\` (une chaîne) au lieu de \`19.9\`, TypeScript continue de croire que \`total\` est un \`number\` : \`order.total + 10\` concatène et donne \`'19.9010'\`, et \`order.id === 42\` est faux. Aucune erreur, juste des données corrompues qui se propagent.

Les types s'arrêtent à la frontière du programme : tout ce qui vient de l'extérieur (réseau, \`localStorage\`, formulaire, fichier) doit être **validé à l'exécution**.

Correction : typer le résultat brut en \`unknown\`, puis le vérifier et le convertir (à la main comme ici, ou avec une bibliothèque de schéma comme zod ou valibot, qui produit à la fois la validation et le type).`,
    fix: { lang: 'ts', code: `type Order = { id: number; total: number }

function parseOrder(raw: string): Order {
  const data: unknown = JSON.parse(raw)
  if (typeof data === 'object' && data !== null && 'id' in data && 'total' in data) {
    const id = Number(data.id)
    const total = Number(data.total)
    if (Number.isFinite(id) && Number.isFinite(total)) return { id, total }
  }
  throw new Error('commande invalide')
}

const order = parseOrder('{"id": "42", "total": "19.90"}')
console.log(order.total + 10)
console.log(order.id === 42)`, output: "29.9\ntrue" },
  },
]
