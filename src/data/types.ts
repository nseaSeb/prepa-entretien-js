/**
 * Types du contenu. RÈGLES DE VÉRIFICATION (appliquées par `npm test`) :
 *
 * - Un champ `code` qui contient `console.log` (ou warn/error/info) doit avoir un champ `output` :
 *   la sortie console EXACTE (lignes séparées par \n), y compris celle des minuteurs et promesses.
 *   Les erreurs non attrapées s'écrivent « Uncaught TypeError: … » (texte V8, Chrome/Node),
 *   les rejets non gérés « Uncaught (in promise) Error: … ».
 * - Une ligne de la forme `expression // → valeur` est vérifiée : `valeur` doit être la valeur
 *   inspectée (chaînes entre apostrophes, tableaux `[ 1, 2 ]`, objets `{ a: 1 }`, comme Node).
 * - `run: false` désactive l'exécution (DOM, fetch, import/export…) : alors aucune affirmation
 *   de sortie n'est permise dans ce code (ni `output`, ni `// →`).
 * - Le code s'exécute comme un script global non strict (balise <script>), dans un realm neuf.
 * - Les textes (`why`, `explanation`, `answer`…) acceptent un markdown minimal :
 *   `code`, **gras**, paragraphes séparés par une ligne vide, listes en lignes « - ».
 *
 * EXTRAITS TYPESCRIPT (`lang: 'ts'`), vérifiés par le compilateur (src/lib/ts/core.ts) :
 * - Configuration : `strict: true`, target ES2022, lib es2022 + dom, chaque extrait est un module.
 * - Le code doit compiler avec **0 diagnostic**. Une erreur voulue se montre avec `// @ts-expect-error`
 *   sur la ligne précédente : TypeScript signale la directive si la ligne ne contient pas d'erreur.
 * - Affirmation de type : `type R = Expr // → T` est vérifié par `Expect<Equal<R, T>>` (égalité stricte :
 *   `{ a: 1 } & { b: 2 }` n'est pas `{ a: 1; b: 2 }`, `readonly` et `?` comptent). `Equal`, `NotEqual`,
 *   `Expect` sont des types globaux disponibles partout. Les autres `// →` restent des valeurs d'exécution.
 *   Uniquement au niveau supérieur du fichier (l'affirmation est ajoutée en fin de fichier).
 * - Une ligne sous `// @ts-expect-error` est quand même exécutée : si elle lèverait, la placer dans une
 *   fonction jamais appelée.
 * - Options propres à un extrait : ligne `// @noUncheckedIndexedAccess: true` (ou exactOptionalPropertyTypes,
 *   strictNullChecks, noImplicitAny…). Plusieurs fichiers : lignes `// @filename: a.d.ts` (ces extraits
 *   sont vérifiés mais non exécutés : ni `output` ni `// →` de valeur).
 * - Sinon le code est transpilé (types effacés) puis exécuté comme un extrait JS : `output` et `// →` exacts.
 * - `run: false` n'est permis en TS que dans les sous-parties « frameworks » du cours (JSX, imports).
 * - Quiz `compile` : chaque choix commence par « Compile » ou cite les lignes en erreur
 *   (« Erreur ligne 3 : … », « Erreurs lignes 2 et 5 ») ; l'ensemble des lignes en erreur est vérifié.
 * - Quiz `type` : `target` est une expression de type (`typeof x`, `R`) ; la bonne réponse doit lui être
 *   Equal, les autres choix doivent être des types valides qui ne le sont pas.
 */

export type ThemeId =
  | 'types'
  | 'scope'
  | 'closures'
  | 'this'
  | 'prototypes'
  | 'eventloop'
  | 'async'
  | 'es6'
  | 'arrays'
  | 'objects'
  | 'modules'
  | 'dom'
  | 'perf'
  | 'web'
  | 'algo'
  | 'ts'

/** Un extrait exécutable (ou non, avec run: false). */
/** `lang: 'ts'` : TypeScript, vérifié par le compilateur puis exécuté (voir en tête de fichier). */
export type Snippet = { code: string; output?: string; run?: false; lang?: 'ts' }

/** `compile` et `type` : questions TypeScript (code TS implicite). */
export type QuizKind = 'qcm' | 'output' | 'bug' | 'compile' | 'type'
export type QuizItem = {
  id: string
  theme: ThemeId
  kind: QuizKind
  q: string
  /** Pour 'output' : obligatoire, et la sortie réelle doit être exactement choices[answer]. */
  code?: string
  choices: string[]
  answer: number
  why: string
  /** Code TypeScript (implicite pour `compile` et `type`). */
  lang?: 'ts'
  /** Pour 'type' : expression de type dont on demande le type (ex. `typeof x`). */
  target?: string
}

export type Piege = {
  id: string
  title: string
  theme: ThemeId
  /** Question posée au-dessus de l'extrait, ex. « Qu'affiche ce code ? » */
  question: string
  code: string
  /** Sortie console exacte, vérifiée (facultative en TS si le piège est une erreur de compilation). */
  output?: string
  lang?: 'ts'
  explanation: string
  /** Version corrigée facultative (Snippet vérifié comme les autres). */
  fix?: Snippet
}

export type KataTest = { name: string; code: string }
/** Famille d'exercice : utilitaire JS (debounce, curry…) ou algorithmique (tri, parcours, DP…). */
export type KataCategory = 'utilitaire' | 'algo' | 'ts'
export type Kata = {
  id: string
  title: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  theme: ThemeId
  category: KataCategory
  statement: string
  starter: string
  solution: string
  /**
   * Tests cachés : corps de fonction async exécutés après le code du candidat.
   * Aides disponibles : assert(cond, msg?), assertEqual(actual, expected, msg?) (égalité profonde),
   * assertThrows(fn, msg?), sleep(ms). Prévoir des marges de temps larges (≈ 3× le délai).
   */
  tests: KataTest[]
  /**
   * TypeScript : `lang: 'ts'`. Le code du candidat doit compiler sans erreur (strict), puis il est transpilé
   * et soumis aux `tests` (JS). `typeTests` : lignes de types (Expect<Equal<…>>, @ts-expect-error) ajoutées
   * après le code ; un test réussit si aucune erreur de compilation ne tombe dans ses lignes.
   */
  lang?: 'ts'
  typeTests?: KataTest[]
  hints: string[]
  /** Discussion : complexité, cas limites, variantes à évoquer à l'oral. */
  discussion: string
}

export type Flashcard = { id: string; theme: ThemeId; front: string; back: string } & Partial<Snippet>

export type LexiqueEntry = { term: string; def: string; theme?: ThemeId; see?: string[] } & Partial<Snippet>

export type EntretienSection = 'general' | 'react' | 'vue' | 'angular' | 'comparaison' | 'typescript'
export type EntretienQ = {
  id: string
  section: EntretienSection
  q: string
  /** Piste de réponse (markdown minimal). */
  answer: string
  /** Ce que le recruteur cherche à vérifier. */
  attendu?: string
} & Partial<Snippet>

export type CoursBlock =
  | { p: string }
  /** `id` facultatif : ancre de sous-partie (#cours/<id>), préfixée par le thème (ex. `algo-`). */
  | { h: string; id?: string }
  /** Encadrés « Mnémo » et « Piège » au milieu d'une section (par sous-partie). */
  | { mnemo: string; piege: string }
  | { list: string[] }
  | ({ title?: string } & Snippet)
  | { table: string[][] }

export type CoursSection = {
  id: ThemeId
  title: string
  /** Une phrase de résumé. */
  summary: string
  blocks: CoursBlock[]
  mnemo: string
  piege: string
}

export type CheatBlock = { title: string; items?: string[] } & Partial<Snippet>
export type CheatSection = { id: string; title: string; blocks: CheatBlock[] }
