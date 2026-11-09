import type { EntretienQ } from './types'

/** Questions d'entretien TypeScript (les extraits sont vérifiés par le compilateur puis exécutés). */
export const tsEntretien: EntretienQ[] = [
  {
    id: 'ts-e1',
    section: 'typescript',
    q: 'Qu’apporte TypeScript par rapport à JavaScript ? Quelles sont ses limites ?',
    answer:
      "TypeScript est un **sur-ensemble typé** de JavaScript : tout JS valide est du TS valide (aux erreurs de type près), et le compilateur produit du JavaScript standard en **effaçant les types**. Il apporte :\n- la détection d'erreurs avant l'exécution (fautes de frappe, `undefined` non géré, mauvais arguments) ;\n- une documentation vivante des contrats (paramètres, retours, formes des données) ;\n- un outillage bien meilleur : autocomplétion, navigation, renommage et refactoring sûrs ;\n- plus de confiance pour faire évoluer une grosse base de code à plusieurs.\n\nLimites : les types **n'existent pas à l'exécution** (aucune validation des données externes), le système est volontairement **non sûr** à certains endroits (`any`, `as`, index de tableau, bivariance des méthodes), il ajoute une étape de build et une courbe d'apprentissage, et des types trop sophistiqués peuvent nuire à la lisibilité.",
    attendu: "Une vision équilibrée : les bénéfices concrets (bugs évités, refactoring, DX) et la limite majeure, l'effacement des types, qui impose de valider les entrées à l'exécution.",
  },
  {
    id: 'ts-e2',
    section: 'typescript',
    q: 'Quelle différence entre any et unknown ? Quand (ne pas) utiliser any ?',
    answer:
      "Les deux acceptent n'importe quelle valeur. Mais `any` **désactive** la vérification : on peut tout faire dessus, et il se propage aux valeurs qui en dérivent. `unknown` est le « any sûr » : on ne peut **rien** faire dessus avant d'avoir rétréci son type par un test (`typeof`, `in`, `instanceof`, garde de type, schéma de validation).\n\nJe n'utilise pas `any` pour faire taire une erreur, ni pour typer des données externes (là, `unknown` puis validation). Cas acceptables : une migration progressive depuis JS, un contournement temporaire documenté d'une lib mal typée, ou des tests. Je l'encadre avec `noImplicitAny` (dans `strict`) et la règle ESLint `no-explicit-any`, et j'utilise `unknown` dans les `catch` (`useUnknownInCatchVariables`).",
    attendu: '« unknown force à vérifier, any supprime la vérification », un exemple de contagion, et une règle d’équipe claire.',
    lang: 'ts',
    code: `function toText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message
  return JSON.stringify(value)
}
toText(new Error('oups')) // → 'oups'
toText({ a: 1 }) // → '{"a":1}'`,
  },
  {
    id: 'ts-e3',
    section: 'typescript',
    q: 'interface ou type : lequel choisir ?',
    answer:
      "Pour décrire la forme d'un objet, les deux sont presque équivalents. Différences :\n- seul `type` peut nommer une **union**, un tuple, un type primitif, un mapped type ou un type conditionnel ;\n- seule `interface` bénéficie de la **fusion de déclarations** (deux `interface Window` se combinent), utile pour augmenter une lib ou `globalThis` ;\n- l'héritage : `interface B extends A` signale un conflit de propriété par une erreur, alors que `type B = A & {…}` produit silencieusement une intersection (une propriété en conflit peut devenir `never`) ;\n- les messages d'erreur et les performances du compilateur sont souvent meilleurs avec `extends` sur de grosses hiérarchies.\n\nRègle pratique : `interface` pour les objets publics et extensibles (API d'une lib, props), `type` pour tout le reste ; surtout, être cohérent dans un projet.",
    attendu: "Connaître la fusion de déclarations, le fait que les unions demandent `type`, et la différence `extends` / `&`. Ne pas en faire une guerre de religion.",
    lang: 'ts',
    code: `interface Box { width: number }
interface Box { height: number } // fusion de déclarations
const b: Box = { width: 1, height: 2 }

type A = { id: number }
type B = A & { id: string } // pas d'erreur…
type Id = B['id'] // → never

// @ts-expect-error : avec extends, le conflit est signalé (C étend mal A)
interface C extends A {
  id: string
}`,
  },
  {
    id: 'ts-e4',
    section: 'typescript',
    q: 'Que signifie « typage structurel » ? Quelles conséquences ?',
    answer:
      "TypeScript compare les types par leur **forme**, pas par leur nom : un objet est compatible avec un type s'il possède au moins les propriétés demandées, avec des types compatibles. Deux interfaces différentes mais identiques sont interchangeables, et une classe est compatible avec un objet littéral de même forme.\n\nConséquences :\n- un type décrit un **minimum** : un objet peut avoir des propriétés en plus (d'où `Object.keys` typé `string[]`) ;\n- la vérification des propriétés en excès ne vaut que pour les littéraux frais ;\n- pour distinguer deux identifiants de même forme (`UserId` et `OrderId`, deux `string`), il faut simuler un typage nominal avec un **type marqué** (*branded type*).",
    attendu: 'Une définition correcte, l’opposition avec le typage nominal (Java, C#) et au moins une conséquence pratique (propriétés en trop, branded types).',
    lang: 'ts',
    code: `type UserId = string & { readonly __brand: 'UserId' }
type OrderId = string & { readonly __brand: 'OrderId' }
const userId = (s: string) => s as UserId

function loadUser(id: UserId) {
  return 'user ' + id
}
const u = userId('u1')
const o = 'o1' as OrderId
loadUser(u) // → 'user u1'
// @ts-expect-error : OrderId n'est pas UserId malgré la même forme de base
loadUser(o)`,
  },
  {
    id: 'ts-e5',
    section: 'typescript',
    q: 'À quoi servent les génériques ? Donne un exemple avec une contrainte.',
    answer:
      "Un générique est un **paramètre de type** : il permet d'écrire une fonction, une classe ou un type réutilisable sans perdre l'information de type, en reliant entrées et sorties. Sans générique, on aurait le choix entre dupliquer le code ou retomber sur `any`/`unknown`.\n\nOn peut **contraindre** le paramètre (`T extends { id: number }`, `K extends keyof T`) pour avoir accès à certaines propriétés, et lui donner une **valeur par défaut**. Le plus souvent, il est **inféré** à l'appel. Bonne pratique : un paramètre de type doit apparaître au moins deux fois (sinon, un type simple suffit).",
    attendu: 'Le lien entrée/sortie conservé, la contrainte `extends`, `keyof` pour typer un accès par clé, et l’inférence à l’appel.',
    lang: 'ts',
    code: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}
const users = [{ name: 'Ada', age: 36 }, { name: 'Alan', age: 41 }]
const names = pluck(users, 'name')
type Names = typeof names // → string[]
names // → [ 'Ada', 'Alan' ]
// @ts-expect-error : 'email' n'est pas une clé de l'objet
pluck(users, 'email')`,
  },
  {
    id: 'ts-e6',
    section: 'typescript',
    q: 'Qu’est-ce que le narrowing ? Quels outils as-tu pour rétrécir un type ?',
    answer:
      "Le compilateur suit le **flux de contrôle** : après un test, il réduit le type d'une variable dans la branche correspondante. Outils :\n- `typeof` pour les primitives, `instanceof` pour les classes, `Array.isArray` ;\n- l'opérateur `in` (`'kind' in x`) ;\n- l'égalité avec un littéral, notamment sur le **discriminant** d'une union discriminée ;\n- les tests de vérité et `!== null` ;\n- les **gardes de type** (`x is T`) et les **fonctions d'assertion** (`asserts x is T`) ;\n- la vérification d'exhaustivité avec `never` dans le `default` d'un `switch`.\n\nPiège à citer : le rétrécissement d'une propriété est perdu dans un callback, d'où l'intérêt de copier la valeur dans une constante.",
    attendu: 'Plusieurs mécanismes cités, l’union discriminée et l’exhaustivité avec never ; bonus : la limite des callbacks.',
    lang: 'ts',
    code: `type Event =
  | { type: 'click'; x: number; y: number }
  | { type: 'key'; key: string }

function describe(e: Event): string {
  switch (e.type) {
    case 'click':
      return 'clic en ' + e.x + ',' + e.y
    case 'key':
      return 'touche ' + e.key
    default: {
      const unreachable: never = e
      return unreachable
    }
  }
}
describe({ type: 'key', key: 'Enter' }) // → 'touche Enter'`,
  },
  {
    id: 'ts-e7',
    section: 'typescript',
    q: 'Différence entre une annotation, satisfies et as ?',
    answer:
      "- **Annotation** (`const x: T = …`) : vérifie la valeur **et** fixe le type de la variable à `T` (on perd les informations plus précises, comme les clés exactes ou les littéraux).\n- **`satisfies T`** : vérifie que la valeur est compatible avec `T`, mais **conserve** le type inféré, plus précis.\n- **`as T`** : ne vérifie presque rien (seulement un recouvrement minimal entre les types) ; c'est une affirmation du développeur, qui peut mentir.\n\nJe préfère l'annotation aux frontières (paramètres, retours), `satisfies` pour des objets de configuration dont je veux garder les clés, et `as` seulement quand j'ai une information que le compilateur ne peut pas avoir.",
    attendu: 'Comprendre que satisfies vérifie sans élargir, et que as n’est pas une conversion.',
    lang: 'ts',
    code: `type Theme = Record<'primary' | 'secondary', string | [number, number, number]>

const annotated: Theme = { primary: '#06f', secondary: [255, 0, 0] }
const checked = { primary: '#06f', secondary: [255, 0, 0] } satisfies Theme

checked.primary.toUpperCase() // → '#06F'
// @ts-expect-error : annoté, primary est string | [number, number, number]
annotated.primary.toUpperCase()`,
  },
  {
    id: 'ts-e8',
    section: 'typescript',
    q: 'enum ou union de littéraux ?',
    answer:
      "Un `enum` génère un **objet à l'exécution** (avec un mapping inverse pour les enums numériques), est **nominal** (on doit passer `Status.Active`, pas `'active'`) et, en version numérique, accepte n'importe quel `number`. Les `const enum` posent problème avec `isolatedModules`, et l'option `erasableSyntaxOnly` (exécution directe du TS par Node) refuse les enums.\n\nUne **union de littéraux** (`'active' | 'banned'`) n'a aucun coût à l'exécution, se lit directement dans les données JSON et se combine avec les autres types. Si l'on veut des noms et une liste itérable, on dérive le type d'un objet `as const`.\n\nJe privilégie les unions ; un `enum` peut se justifier pour la compatibilité avec un code existant.",
    attendu: 'Savoir que l’enum existe à l’exécution, citer le mapping inverse et proposer l’alternative as const.',
    lang: 'ts',
    code: `const Role = { Admin: 'admin', User: 'user' } as const
type Role = (typeof Role)[keyof typeof Role] // → 'admin' | 'user'

const roles = Object.values(Role)
roles // → [ 'admin', 'user' ]
const canEdit = (r: Role) => r === Role.Admin
canEdit('admin') // → true`,
  },
  {
    id: 'ts-e9',
    section: 'typescript',
    q: 'Que fait strict: true ? Quelles options ajoutes-tu en plus ?',
    answer:
      "`strict` active une famille d'options, dont :\n- `strictNullChecks` : `null` et `undefined` ne sont plus assignables à tout type ;\n- `noImplicitAny` : un paramètre non annoté et non inférable est une erreur ;\n- `strictFunctionTypes` : paramètres de fonction vérifiés de façon contravariante ;\n- `strictPropertyInitialization` : les propriétés de classe doivent être initialisées ;\n- `useUnknownInCatchVariables`, `strictBindCallApply`, `alwaysStrict`…\n\nJ'ajoute souvent `noUncheckedIndexedAccess` (un accès indexé peut être `undefined`), parfois `exactOptionalPropertyTypes`, `noImplicitOverride` et `noFallthroughCasesInSwitch`. Pour un projet existant, on peut activer ces options une par une.",
    attendu: 'Citer strictNullChecks et noImplicitAny avec ce qu’elles évitent, et connaître noUncheckedIndexedAccess (hors strict).',
    lang: 'ts',
    code: `// @noUncheckedIndexedAccess: true
const env: Record<string, string> = { MODE: 'dev' }
const port = env.PORT
type Port = typeof port // → string | undefined
Number(port ?? 3000) // → 3000`,
  },
  {
    id: 'ts-e10',
    section: 'typescript',
    q: 'Comment typer la réponse d’une API ? Le type suffit-il ?',
    answer:
      "Non : un type ne vérifie rien à l'exécution. `await res.json()` renvoie `any`, et `as User` se contente de **croire** le serveur. Si l'API change ou renvoie une erreur, les données fausses se propagent jusqu'à l'interface.\n\nBonne pratique : considérer les données externes comme `unknown` et les **valider** à la frontière. À la main pour un cas simple, sinon avec une bibliothèque de schéma (zod, valibot, ArkType) qui fournit à la fois la validation et le type inféré (`z.infer<typeof schema>`), ce qui évite de décrire deux fois la même forme. Alternative : générer les types depuis un contrat (OpenAPI, GraphQL), mais la validation reste utile pour les données non fiables.",
    attendu: 'Distinguer le typage statique de la validation à l’exécution, et citer une approche (schéma, garde de type, génération depuis un contrat).',
    lang: 'ts',
    code: `type User = { id: number; name: string }

function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null && 'id' in v && typeof v.id === 'number' && 'name' in v && typeof v.name === 'string'
}

const ok: unknown = JSON.parse('{"id": 1, "name": "Ada"}')
const ko: unknown = JSON.parse('{"id": "1"}')
isUser(ok) // → true
isUser(ko) // → false`,
  },
  {
    id: 'ts-e11',
    section: 'typescript',
    q: 'Qu’est-ce qu’un fichier .d.ts ? D’où viennent les types d’une bibliothèque JavaScript ?',
    answer:
      "Un fichier `.d.ts` ne contient que des **déclarations de types**, sans code : il décrit l'API d'un module JavaScript. Trois cas :\n- la bibliothèque est écrite en TS ou publie ses propres `.d.ts` (champ `types` du `package.json`) ;\n- sinon, la communauté les maintient dans **DefinitelyTyped**, installés via `@types/nom-du-paquet` ;\n- à défaut, on écrit soi-même une déclaration (`declare module 'lib' { … }`) dans un `.d.ts` du projet, ou un simple `declare module 'lib'` qui type tout en `any`.\n\nOn utilise aussi les `.d.ts` pour **augmenter** des types existants (`declare global`, fusion d'interfaces comme `Window`) et pour déclarer les imports non-JS (`*.svg`, `*.css`). `skipLibCheck` évite de revérifier tous ces fichiers à chaque compilation.",
    attendu: 'Connaître DefinitelyTyped / @types, savoir écrire un declare module et citer l’augmentation de types.',
    lang: 'ts',
    code: `// @filename: env.d.ts
declare global {
  interface Window {
    analytics?: { track(event: string): void }
  }
}
export {}
// @filename: main.ts
window.analytics?.track('page_view')
// @ts-expect-error : track attend une chaîne
window.analytics?.track(42)`,
  },
  {
    id: 'ts-e12',
    section: 'typescript',
    q: 'Quels utility types utilises-tu au quotidien ? Sais-tu en réécrire un ?',
    answer:
      "Les plus courants : `Partial<T>` (formulaire de modification, patch), `Required<T>`, `Readonly<T>`, `Pick<T, K>` et `Omit<T, K>` (dériver un DTO d'un modèle), `Record<K, V>` (dictionnaires), `ReturnType` et `Parameters` (réutiliser la signature d'une fonction), `Awaited` (résultat d'une promesse), `NonNullable`, `Exclude` et `Extract` (filtrer une union).\n\nIls sont écrits avec des **mapped types** et des **types conditionnels** : `Pick` parcourt les clés `K` contraintes à `keyof T` ; `Exclude` est un type conditionnel distributif qui renvoie `never` pour les membres à retirer. L'intérêt est de **dériver** les types d'une source unique plutôt que de les dupliquer.",
    attendu: 'Des cas d’usage concrets, puis la réécriture de Pick ou Readonly avec un mapped type.',
    lang: 'ts',
    code: `type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type MyExclude<T, U> = T extends U ? never : T

type User = { id: number; name: string; password: string }
type PublicUser = MyPick<User, 'id' | 'name'> // → { id: number; name: string }
type Safe = MyExclude<keyof User, 'password'> // → 'id' | 'name'`,
  },
  {
    id: 'ts-e13',
    section: 'typescript',
    q: 'Pourquoi l’erreur d’un catch est-elle de type unknown ?',
    answer:
      "En JavaScript, on peut lancer **n'importe quoi** : `throw 'oups'`, `throw 42`, `throw { code: 1 }`, et une bibliothèque peut le faire. Rien ne garantit donc qu'une erreur attrapée soit une instance de `Error`. Avec `useUnknownInCatchVariables` (inclus dans `strict`), la variable du `catch` est `unknown` au lieu de `any`, ce qui oblige à la vérifier avant d'utiliser `.message`.\n\nOn ne peut pas annoter `catch (e: Error)` : seules les annotations `any` et `unknown` sont permises, puisque le compilateur ne peut pas savoir ce qui sera lancé. Le même raisonnement vaut pour le motif de rejet d'une promesse (`reason` est `any` dans `.catch`).",
    attendu: 'Savoir qu’on peut lancer n’importe quelle valeur, et montrer le test instanceof Error.',
    lang: 'ts',
    code: `function message(fn: () => void): string {
  try {
    fn()
    return 'ok'
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}
message(() => { throw new Error('boum') }) // → 'boum'
message(() => { throw 'chaîne' }) // → 'chaîne'`,
  },
  {
    id: 'ts-e14',
    section: 'typescript',
    q: 'Comment migrerais-tu progressivement un projet JavaScript vers TypeScript ?',
    answer:
      "Étapes classiques :\n1. ajouter un `tsconfig.json` avec `allowJs` (et éventuellement `checkJs`) : le compilateur accepte les `.js` existants, et le build continue de fonctionner ;\n2. typer d'abord les **fondations** : modèles de données, utilitaires, couche d'accès à l'API, puis renommer les fichiers en `.ts` au fil de l'eau, en commençant par les feuilles du graphe d'imports ;\n3. installer les `@types/…` manquants, écrire des déclarations pour le reste ;\n4. durcir progressivement : `noImplicitAny`, puis `strictNullChecks`, puis `strict` complet, en suivant le nombre d'erreurs ;\n5. tolérer temporairement des `any` explicites ou `// @ts-expect-error` commentés, et les suivre (règle ESLint, compteur en CI).\n\nLes JSDoc (`/** @type {…} */`) permettent aussi de vérifier du JS sans le renommer.",
    attendu: 'Une approche incrémentale (allowJs, durcissement option par option), sans « big bang », et un moyen de suivre la dette.',
  },
  {
    id: 'ts-e15',
    section: 'typescript',
    q: 'Les types existent-ils à l’exécution ? Que reste-t-il après compilation ?',
    answer:
      "Non. La compilation **efface** les annotations, les `interface`, les `type`, les génériques, les `as` et `satisfies` : il reste le JavaScript tel quel. On ne peut donc pas écrire `if (x instanceof User)` quand `User` est un type, ni lire un type générique à l'exécution, ni compter sur `as` pour convertir une valeur.\n\nQuelques constructions produisent du code : les `enum`, les `namespace` non ambiants, les **propriétés de paramètre** de constructeur (`constructor(private x: number)`) et les décorateurs. C'est pourquoi l'option `erasableSyntaxOnly` existe : elle les interdit pour que le TS puisse être exécuté par simple effacement des types (comme le fait Node.js).\n\nConséquence pratique : pour tester un type à l'exécution, il faut une valeur discriminante (champ `kind`), une classe (`instanceof`) ou une validation explicite.",
    attendu: 'Comprendre l’effacement des types, citer les exceptions (enum, parameter properties) et ses conséquences (validation, discriminants).',
    lang: 'ts',
    code: `type User = { kind: 'user'; name: string }
type Admin = { kind: 'admin'; name: string; level: number }

class Point {
  constructor(public x: number, public y: number) {} // génère this.x = x…
}

const isAdmin = (p: User | Admin): p is Admin => p.kind === 'admin' // on teste une valeur
isAdmin({ kind: 'admin', name: 'Ada', level: 1 }) // → true
Object.keys(new Point(1, 2)) // → [ 'x', 'y' ]`,
  },
]
