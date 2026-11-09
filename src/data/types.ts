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

/** Un extrait exécutable (ou non, avec run: false). */
export type Snippet = { code: string; output?: string; run?: false }

export type QuizKind = 'qcm' | 'output' | 'bug'
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
}

export type Piege = {
  id: string
  title: string
  theme: ThemeId
  /** Question posée au-dessus de l'extrait, ex. « Qu'affiche ce code ? » */
  question: string
  code: string
  /** Sortie console exacte, vérifiée. */
  output: string
  explanation: string
  /** Version corrigée facultative (Snippet vérifié comme les autres). */
  fix?: Snippet
}

export type KataTest = { name: string; code: string }
/** Famille d'exercice : utilitaire JS (debounce, curry…) ou algorithmique (tri, parcours, DP…). */
export type KataCategory = 'utilitaire' | 'algo'
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
  hints: string[]
  /** Discussion : complexité, cas limites, variantes à évoquer à l'oral. */
  discussion: string
}

export type Flashcard = { id: string; theme: ThemeId; front: string; back: string } & Partial<Snippet>

export type LexiqueEntry = { term: string; def: string; theme?: ThemeId; see?: string[] } & Partial<Snippet>

export type EntretienSection = 'general' | 'react' | 'vue' | 'angular' | 'comparaison'
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
