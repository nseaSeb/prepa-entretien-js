/**
 * Vérificateur TypeScript partagé : Web Worker du navigateur (ts/worker.ts) et tests Node (ts/node.ts).
 * Aucun import du compilateur ici (type seulement) : `ts` est passé en paramètre, ce qui garde le
 * compilateur hors du bundle principal. Même configuration et même liste de fichiers lib des deux côtés,
 * sur un système de fichiers virtuel (pas de @types/node ni de node_modules).
 *
 * Conventions des extraits (voir aussi src/data/types.ts) :
 * - `// @noUncheckedIndexedAccess: true` (etc.) : option du compilateur propre à l'extrait ;
 * - `// @filename: a.ts` : découpe l'extrait en plusieurs fichiers (numéros de ligne conservés) ;
 * - `type R = … // → T` : affirmation de type, vérifiée par Expect<Equal<R, T>> ;
 * - `Equal`, `NotEqual`, `Expect` sont des types globaux (prélude).
 */
import type * as TS from 'typescript'

/** Options du compilateur, au format tsconfig.json. */
export const COMPILER_JSON = {
  strict: true,
  target: 'es2022',
  lib: ['es2022', 'dom'],
  module: 'esnext',
  moduleResolution: 'bundler',
  moduleDetection: 'force',
  isolatedModules: true,
  skipLibCheck: true,
  noEmit: true,
  types: [] as string[],
} as const

const ES_YEARS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
const ES_PARTS: Record<string, string[]> = {
  '2015': ['core', 'collection', 'generator', 'iterable', 'promise', 'proxy', 'reflect', 'symbol', 'symbol.wellknown'],
  '2016': ['array.include', 'intl'],
  '2017': ['arraybuffer', 'date', 'intl', 'object', 'sharedmemory', 'string', 'typedarrays'],
  '2018': ['asyncgenerator', 'asynciterable', 'intl', 'promise', 'regexp'],
  '2019': ['array', 'intl', 'object', 'string', 'symbol'],
  '2020': ['bigint', 'date', 'intl', 'number', 'promise', 'sharedmemory', 'string', 'symbol.wellknown'],
  '2021': ['intl', 'promise', 'string', 'weakref'],
  '2022': ['array', 'error', 'intl', 'object', 'regexp', 'string'],
}
/** Liste exacte des fichiers lib chargés (navigateur et Node). */
export const LIB_FILES = [
  'lib.es5.d.ts',
  'lib.decorators.d.ts',
  'lib.decorators.legacy.d.ts',
  'lib.dom.d.ts',
  'lib.dom.iterable.d.ts',
  'lib.dom.asynciterable.d.ts',
  ...ES_YEARS.flatMap((y) => [`lib.es${y}.d.ts`, ...ES_PARTS[y].map((p) => `lib.es${y}.${p}.d.ts`)]),
]

/** Types utilitaires de test, disponibles partout (playground, extraits, katas). */
export const PRELUDE = `/** true si A et B sont exactement le même type (any, readonly et ? compris). */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
type NotEqual<A, B> = true extends Equal<A, B> ? false : true
/** Ne compile que si T vaut true. */
type Expect<T extends true> = T
`

/** Options booléennes modifiables par un en-tête `// @option: true|false`. */
const FLAGS = [
  'strict',
  'strictNullChecks',
  'noImplicitAny',
  'strictFunctionTypes',
  'strictPropertyInitialization',
  'useUnknownInCatchVariables',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noImplicitReturns',
  'noImplicitOverride',
  'noPropertyAccessFromIndexSignature',
  'allowUnreachableCode',
]

/** line/col : base 1 (0 pour une erreur globale) ; start/length : position dans l'extrait. */
export type Diag = { file: string; line: number; col: number; start: number; length: number; code: number; message: string; category: 'error' | 'warning' | 'suggestion' | 'message' }
export type TypeTest = { name: string; code: string }
export type TypeTestResult = { name: string; ok: boolean; error?: string }
export type TypeClaim = { line: number; name: string; expected: string }

const FLAG_RE = /^\s*\/\/\s*@(\w+)\s*:\s*(\S+)\s*$/
const FILENAME_RE = /^\s*\/\/\s*@filename\s*:\s*(\S+)\s*$/i
const CLAIM_RE = /^(\s*(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=\s*.+?)\s*\/\/\s*→\s*(.+?)\s*$/

/** Options `// @flag: valeur` de l'extrait (inconnues : erreur). */
export function parseFlags(code: string): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const line of code.split('\n')) {
    const m = FLAG_RE.exec(line)
    if (!m || m[1].toLowerCase() === 'filename') continue
    if (!FLAGS.includes(m[1])) throw new Error(`option inconnue // @${m[1]} (autorisées : ${FLAGS.join(', ')})`)
    if (m[2] !== 'true' && m[2] !== 'false') throw new Error(`// @${m[1]} : valeur true ou false attendue`)
    out[m[1]] = m[2] === 'true'
  }
  return out
}

/**
 * Découpe un extrait multi-fichiers. Chaque fichier garde la longueur totale de l'extrait (les autres
 * fichiers sont remplacés par des espaces) : lignes, colonnes et positions restent celles de l'extrait.
 */
export function splitFiles(code: string): { name: string; text: string }[] {
  const lines = code.split('\n')
  const marks: { name: string; at: number }[] = []
  lines.forEach((l, i) => {
    const m = FILENAME_RE.exec(l)
    if (m) marks.push({ name: '/' + m[1].replace(/^\.?\//, ''), at: i })
  })
  if (!marks.length) return [{ name: '/input.ts', text: code }]
  if (marks[0].at !== 0 && lines.slice(0, marks[0].at).some((l) => l.trim())) marks.unshift({ name: '/input.ts', at: -1 })
  return marks.map((m, k) => {
    const end = k + 1 < marks.length ? marks[k + 1].at : lines.length
    return { name: m.name, text: lines.map((l, i) => (i > m.at && i < end ? l : ' '.repeat(l.length))).join('\n') }
  })
}

/** Lignes `type X = … // → T` : affirmations de type. */
export function extractClaims(code: string): TypeClaim[] {
  const claims: TypeClaim[] = []
  code.split('\n').forEach((l, i) => {
    const m = CLAIM_RE.exec(l)
    if (m) claims.push({ line: i + 1, name: m[2], expected: m[3] })
  })
  return claims
}

/** Retire les commentaires `// → T` des alias de type (pour l'exécution, qui traite les autres `// →`). */
export const stripClaims = (code: string) => code.split('\n').map((l) => {
  const m = CLAIM_RE.exec(l)
  return m ? m[1] : l
}).join('\n')

export type Checker = ReturnType<typeof createChecker>

export function createChecker(ts: typeof TS, readLib: (name: string) => string | undefined) {
  const parsed = ts.convertCompilerOptionsFromJson(COMPILER_JSON, '/')
  if (parsed.errors.length) throw new Error(parsed.errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'))
  const baseOptions = parsed.options
  const LIB_DIR = '/lib/'
  const libs = new Map<string, string>()
  for (const f of LIB_FILES) {
    const text = readLib(f)
    if (text === undefined) throw new Error(`fichier lib manquant : ${f}`)
    libs.set(LIB_DIR + f, text)
  }

  let options: TS.CompilerOptions = baseOptions
  let user = new Map<string, string>()
  let version = 0
  const read = (f: string) => (f === '/prelude.d.ts' ? PRELUDE : (user.get(f) ?? libs.get(f)))

  const host: TS.LanguageServiceHost = {
    getCompilationSettings: () => options,
    getScriptFileNames: () => ['/prelude.d.ts', ...user.keys()],
    getScriptVersion: (f) => (user.has(f) ? String(version) : '1'),
    getScriptSnapshot: (f) => {
      const t = read(f)
      return t === undefined ? undefined : ts.ScriptSnapshot.fromString(t)
    },
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: (o) => LIB_DIR + ts.getDefaultLibFileName(o),
    fileExists: (f) => read(f) !== undefined,
    readFile: (f) => read(f),
    directoryExists: (d) => d === '/' || d === '/lib' || d === '/lib/',
    getDirectories: () => [],
  }
  const service = ts.createLanguageService(host, ts.createDocumentRegistry())

  function load(code: string) {
    options = { ...baseOptions, ...parseFlags(code) }
    user = new Map(splitFiles(code).map((f) => [f.name, f.text]))
    version++
  }

  const category = (c: TS.DiagnosticCategory): Diag['category'] =>
    c === ts.DiagnosticCategory.Error ? 'error' : c === ts.DiagnosticCategory.Warning ? 'warning' : c === ts.DiagnosticCategory.Suggestion ? 'suggestion' : 'message'

  const toDiag = (d: TS.Diagnostic): Diag => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n')
    if (!d.file || d.start === undefined) return { file: '', line: 0, col: 0, start: 0, length: 0, code: d.code, message, category: category(d.category) }
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start)
    return { file: d.file.fileName, line: line + 1, col: character + 1, start: d.start, length: d.length ?? 0, code: d.code, message, category: category(d.category) }
  }

  function diagnostics(): Diag[] {
    const out: TS.Diagnostic[] = [...service.getCompilerOptionsDiagnostics()]
    for (const f of user.keys()) out.push(...service.getSyntacticDiagnostics(f), ...service.getSemanticDiagnostics(f))
    return out.map(toDiag).sort((a, b) => a.line - b.line || a.col - b.col)
  }

  /** Diagnostics de l'extrait (erreurs globales comprises : ligne 0). */
  function check(code: string): Diag[] {
    load(code)
    return diagnostics()
  }

  /** Infobulle (comme le survol dans VS Code) à la position `pos` de l'extrait. */
  function quickInfo(code: string, pos: number): { text: string; doc: string; start: number; length: number } | null {
    load(code)
    for (const f of user.keys()) {
      if (!user.get(f)!.slice(pos, pos + 1).trim() && !user.get(f)!.slice(pos - 1, pos).trim()) continue
      const q = service.getQuickInfoAtPosition(f, pos)
      if (q) return { text: ts.displayPartsToString(q.displayParts), doc: ts.displayPartsToString(q.documentation), start: q.textSpan.start, length: q.textSpan.length }
    }
    return null
  }

  /** Type d'un alias (non générique) ou d'une variable, en texte, tel qu'affiché au survol. */
  function typeOf(code: string, name: string): string | null {
    load(code)
    const program = service.getProgram()!
    const checker = program.getTypeChecker()
    for (const f of user.keys()) {
      const sf = program.getSourceFile(f)!
      let found: string | null = null
      const visit = (n: TS.Node) => {
        if (found) return
        if ((ts.isTypeAliasDeclaration(n) || ts.isVariableDeclaration(n) || ts.isFunctionDeclaration(n)) && n.name && ts.isIdentifier(n.name) && n.name.text === name) {
          const t = ts.isTypeAliasDeclaration(n) ? checker.getTypeAtLocation(n.name) : checker.getTypeAtLocation(n.name)
          found = checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias)
          return
        }
        ts.forEachChild(n, visit)
      }
      visit(sf)
      if (found) return found
    }
    return null
  }

  /**
   * Vérifie les affirmations `type X = … // → T` : renvoie la liste des échecs (vide si tout est juste).
   * Les lignes ajoutées en fin de fichier n'influencent pas les numéros de ligne de l'extrait.
   */
  function checkClaims(code: string): string[] {
    const claims = extractClaims(code)
    if (!claims.length) return []
    const lines = code.split('\n')
    const files = splitFiles(code)
    // l'affirmation est ajoutée au fichier qui contient sa ligne
    const fileOf = (line: number) => files.find((f) => f.text.split('\n')[line - 1].trim())!.name
    const n = lines.length
    const extra = claims.map((c, i) => ({ c, i, file: fileOf(c.line), text: `type __claim${i} = Expect<Equal<${c.name}, ${c.expected}>>` }))
    load(code)
    const appended = new Map(user)
    for (const e of extra) appended.set(e.file, appended.get(e.file)! + '\n' + e.text)
    user = appended
    version++
    const diags = diagnostics()
    const failures: string[] = []
    extra.forEach((e, k) => {
      const ln = n + 1 + extra.filter((x, j) => j < k && x.file === e.file).length
      const bad = diags.filter((d) => d.file === e.file && d.line === ln)
      if (bad.length) failures.push(`ligne ${e.c.line} : ${e.c.name} n'est pas ${e.c.expected} (type réel : ${typeOf(code, e.c.name) ?? '?'}) ${bad.map((d) => d.message).join(' ; ')}`)
    })
    return failures
  }

  /**
   * Katas de types : le code du candidat suivi de chaque test (lignes Expect<Equal<…>>, @ts-expect-error…).
   * Un test réussit si aucune erreur ne tombe dans ses lignes. Les erreurs dans le code du candidat
   * sont rendues à part (`codeErrors`).
   */
  function runTypeTests(code: string, tests: TypeTest[]): { results: TypeTestResult[]; codeErrors: Diag[] } {
    const codeLines = code.split('\n').length
    let full = code
    const ranges: [number, number][] = []
    let line = codeLines + 1
    for (const t of tests) {
      const body = t.code.replace(/\s+$/, '')
      const start = line + 1
      full += `\n\n${body}`
      line = start + body.split('\n').length - 1
      ranges.push([start, line])
    }
    const diags = check(full).filter((d) => d.category === 'error')
    const results = tests.map((t, i) => {
      const [a, b] = ranges[i]
      const bad = diags.filter((d) => d.line >= a && d.line <= b)
      return bad.length ? { name: t.name, ok: false, error: bad.map((d) => `TS${d.code} : ${d.message}`).join(' ; ') } : { name: t.name, ok: true }
    })
    return { results, codeErrors: diags.filter((d) => d.line <= codeLines) }
  }

  /** TS → JS exécutable par le bac à sable (script) : types effacés, `export {}` final retiré. */
  function transpile(code: string): string {
    const out = ts.transpileModule(stripClaims(code), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, isolatedModules: true, moduleDetection: ts.ModuleDetectionKind.Force },
      reportDiagnostics: false,
    }).outputText
    return out.replace(/^export \{\};\s*$/m, '').replace(/\s+$/, '') + '\n'
  }

  return { check, quickInfo, typeOf, checkClaims, runTypeTests, transpile, isMultiFile: (code: string) => splitFiles(code).length > 1 }
}
