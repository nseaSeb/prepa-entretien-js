/**
 * Vérification du contenu (tests uniquement, exclu de tsconfig.app).
 * Voir les règles en tête de src/data/types.ts.
 */
import assert from 'node:assert/strict'
import { formatValue } from './sandbox/format'
import { runKata, runSnippet } from './sandbox/node'
import { getChecker } from './ts/node'
import { extractClaims, stripClaims, validateFlags, type Diag } from './ts/core'
import type { Kata, Snippet } from '../data/types'

const LOGS = /\bconsole\.(log|warn|error|info|debug|table|dir|trace|assert|count|countReset|group|groupCollapsed|timeEnd|timeLog)\b/
const ARROW = /^(\s*)(.*?)\s*;?\s*\/\/\s*→\s*(.+?)\s*$/

/** Remplace `expr // → valeur` par `__arrow((expr))` et collecte les valeurs attendues. */
export function arrowTransform(code: string) {
  const expected: string[] = []
  const lines = code.split('\n').map((line) => {
    const m = ARROW.exec(line)
    if (!m || !m[2].trim()) return line
    expected.push(m[3])
    return `${m[1]}__arrow((${m[2].replace(/;\s*$/, '')}));`
  })
  return { expected, code: lines.join('\n') }
}

export const norm = (s: string) => s.replace(/\r/g, '').replace(/[ \t]+$/gm, '').trim()

export type CheckResult = 'checked' | 'skipped'

/** Vérifie un extrait : sortie exacte si `output`, flèches `// →`, et aucune erreur inattendue. */
export async function checkSnippet(label: string, s: Partial<Snippet>): Promise<CheckResult> {
  if (s.lang === 'ts') return checkTsSnippet(label, s)
  const code = s.code
  if (!code) {
    assert.equal(s.output, undefined, `${label} : output sans code`)
    return 'skipped'
  }
  const arrows = arrowTransform(code)
  if (s.run === false) {
    assert.equal(s.output, undefined, `${label} : run:false interdit toute sortie annoncée (output)`)
    assert.equal(arrows.expected.length, 0, `${label} : run:false interdit les commentaires // →`)
    return 'skipped'
  }
  if (LOGS.test(code)) assert.notEqual(s.output, undefined, `${label} : le code affiche quelque chose, il faut un champ output exact`)

  await checkRuntime(label, code, s.output, arrows)
  return 'checked'
}

/** Exécution d'un code JS (éventuellement issu de TS) : sortie exacte, valeurs `// →`, pas d'erreur imprévue. */
async function checkRuntime(label: string, code: string, output: string | undefined, arrows: { expected: string[]; code: string }) {
  const r = await runSnippet(code)
  assert.ok(r.settled, `${label} : minuteurs jamais terminés`)
  if (output !== undefined) assert.equal(norm(r.output), norm(output), `${label} : sortie console différente`)
  else {
    const errs = r.logs.filter((l) => l.level === 'uncaught')
    assert.equal(errs.length, 0, `${label} : erreur inattendue : ${errs.map((e) => e.text).join(' | ')}`)
  }

  if (arrows.expected.length) {
    const got: string[] = []
    const r2 = await runSnippet(arrows.code, { extraGlobals: { __arrow: (v: unknown) => got.push(formatValue(v, true)) } })
    const errs = r2.logs.filter((l) => l.level === 'uncaught')
    assert.equal(errs.length, 0, `${label} : erreur pendant la vérification des // → : ${errs.map((e) => e.text).join(' | ')}`)
    assert.deepEqual(got, arrows.expected, `${label} : valeurs // → incorrectes`)
  }
}

const fmtDiags = (ds: Diag[]) => ds.map((d) => `\n  ligne ${d.line}:${d.col} TS${d.code} ${d.message}`).join('')

/** Erreurs de compilation d'un code TS (aucune n'est permise : les erreurs voulues passent par @ts-expect-error). */
export function tsErrors(code: string) {
  validateFlags(code)
  return getChecker().check(code).filter((d) => d.category === 'error')
}

/** Extrait TS : 0 diagnostic, affirmations de type justes, puis exécution du JS transpilé comme un extrait JS. */
export async function checkTsSnippet(label: string, s: Partial<Snippet>): Promise<CheckResult> {
  const code = s.code
  assert.ok(code, `${label} : extrait TS sans code`)
  const checker = getChecker()
  try {
    validateFlags(code)
  } catch (e) {
    assert.fail(`${label} : ${(e as Error).message}`)
  }
  const runtimeArrows = arrowTransform(stripClaims(code))
  if (s.run === false) {
    // JSX / imports de frameworks : non vérifiable par le compilateur seul
    assert.equal(s.output, undefined, `${label} : run:false interdit toute sortie annoncée (output)`)
    assert.equal(runtimeArrows.expected.length + extractClaims(code).length, 0, `${label} : run:false interdit les commentaires // →`)
    return 'skipped'
  }
  const errs = tsErrors(code)
  assert.equal(errs.length, 0, `${label} : le code TS ne compile pas (utiliser // @ts-expect-error pour une erreur voulue) :${fmtDiags(errs)}`)
  const claims = checker.checkClaims(code)
  assert.deepEqual(claims, [], `${label} : affirmations de type fausses :\n  ${claims.join('\n  ')}`)
  if (checker.isMultiFile(code)) {
    assert.equal(s.output, undefined, `${label} : un extrait multi-fichiers n'est pas exécuté (pas d'output)`)
    assert.equal(runtimeArrows.expected.length, 0, `${label} : un extrait multi-fichiers n'est pas exécuté (pas de // → de valeur)`)
    return 'checked'
  }
  const js = checker.transpile(code)
  if (LOGS.test(js)) assert.notEqual(s.output, undefined, `${label} : le code affiche quelque chose, il faut un champ output exact`)
  await checkRuntime(label, js, s.output, { expected: runtimeArrows.expected, code: checker.transpile(runtimeArrows.code) })
  return 'checked'
}

/** Lignes en erreur annoncées par un choix de quiz `compile` (« Compile » → aucune). */
export function parseCompileChoice(choice: string): number[] | null {
  if (/^Compile\b/.test(choice)) return []
  const m = /^Erreurs?\s+lignes?\s+([\d\s,et]+?)(?:\s*:|$)/.exec(choice)
  if (!m) return null
  return [...new Set(m[1].match(/\d+/g)!.map(Number))].sort((a, b) => a - b)
}

/**
 * Kata TypeScript : compilation stricte (une seule vérification, celle des tests de types s'il y en a),
 * tests de types, puis tests d'exécution sur le JS transpilé. Mêmes étapes que la page Katas : si le code
 * n'est pas exécutable (multi-fichiers, import), chaque test d'exécution échoue avec la raison.
 */
export async function runTsKata(kata: Kata, code: string) {
  validateFlags(code)
  const k = getChecker().kata(code, kata.typeTests ?? [])
  const codeErrors = k.codeErrors
  const run = !kata.tests.length
    ? { results: [], logs: [] }
    : k.js === null
      ? { results: kata.tests.map((t) => ({ name: t.name, ok: false, error: `non exécuté : ${k.reason}` })), logs: [] }
      : await runKata(k.js, kata.tests)
  const results = [...run.results, ...k.typeResults]
  return { codeErrors, results, logs: run.logs, summary: [...results.filter((r) => !r.ok).map((r) => `${r.name} → ${r.error}`), ...codeErrors.map((d) => `compilation ligne ${d.line} TS${d.code} ${d.message}`)].join('\n') }
}

/** Textes : pas de bloc de code ``` (le code va dans les champs `code`). */
export function checkText(label: string, text: string | undefined) {
  if (!text) return
  assert.ok(!text.includes('```'), `${label} : bloc \`\`\` interdit dans le texte, utiliser un champ code`)
}
