/** Tests du vérificateur TypeScript lui-même (diagnostics, affirmations de type, options, katas). */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getChecker } from './ts/node'
import { checkTsSnippet, parseCompileChoice, runTsKata, tsErrors } from './contentCheck'
import { LIB_FILES, parseFlags, splitFiles, validateFlags } from './ts/core'

const c = getChecker()
const errs = (code: string) => tsErrors(code).map((d) => [d.line, d.col, d.code])

test('ts : code propre → 0 diagnostic (globaux compris)', () => {
  assert.deepEqual(c.check(`const xs: number[] = [1, 2]\nconsole.log(xs.at(-1))`), [])
  assert.deepEqual(c.check(''), [])
})

test('ts : erreur rapportée avec ligne, colonne et code', () => {
  assert.deepEqual(errs(`const ok = 1\nconst x: number = 'a'`), [[2, 7, 2322]])
})

test('ts : @ts-expect-error inutile → TS2578, utile → aucune erreur', () => {
  assert.deepEqual(errs(`// @ts-expect-error\nconst ok = 1`), [[1, 1, 2578]])
  assert.deepEqual(errs(`// @ts-expect-error\nconst ko: number = 'a'`), [])
})

test('ts : strict activé (noImplicitAny, strictNullChecks)', () => {
  assert.deepEqual(errs(`function f(a) { return a }`).map((e) => e[2]), [7006])
  assert.deepEqual(errs(`const s: string = null`).map((e) => e[2]), [2322])
})

test('ts : une affirmation de type fausse échoue, une juste passe', () => {
  assert.deepEqual(c.checkClaims(`const a = [1, 'x']\ntype A = typeof a // → (string | number)[]`), [])
  const bad = c.checkClaims(`const a = [1, 'x']\ntype A = typeof a // → string[]`)
  assert.equal(bad.length, 1)
  assert.match(bad[0], /ligne 2 : A n'est pas string\[\] \(type réel : \(string \| number\)\[\]\)/)
})

test('ts : Equal distingue any/unknown, optionnel/| undefined, readonly, intersection', () => {
  const eq = (a: string, b: string) => c.check(`type T = Expect<Equal<${a}, ${b}>>`).length === 0
  assert.equal(eq('any', 'unknown'), false)
  assert.equal(eq('{ a?: string }', '{ a: string | undefined }'), false)
  assert.equal(eq('{ readonly a: 1 }', '{ a: 1 }'), false)
  assert.equal(eq('{ a: 1 } & { b: 2 }', '{ a: 1; b: 2 }'), false)
  assert.equal(eq('string | number', 'number | string'), true)
  assert.equal(eq('Pick<{ a: 1; b: 2 }, "a">', '{ a: 1 }'), true)
})

test('ts : lib es2022 + dom présentes, pas de types Node', () => {
  assert.deepEqual(errs(`const a = [1].at(0); Object.hasOwn({}, 'x'); const e = new Error('x', { cause: 1 })\nconst el: HTMLElement | null = document.querySelector('div')`), [])
  assert.deepEqual(errs(`process.exit()`).map((e) => e[2]), [2591])
  assert.deepEqual(errs(`const b = Buffer.from('x')`).map((e) => e[2]), [2591])
  assert.ok(LIB_FILES.includes('lib.dom.d.ts') && LIB_FILES.includes('lib.es2022.d.ts'))
})

test('ts : chaque extrait est un module (pas de conflit avec les globales du DOM)', () => {
  assert.deepEqual(errs(`const name = 1\nconst status = 'ok'\nexport {}`), [])
})

test('ts : en-tête // @option: valeur', () => {
  const code = `const arr = [1]\nconst v = arr[0]\ntype V = typeof v // → number`
  assert.deepEqual(c.checkClaims(code), [])
  assert.equal(c.checkClaims(`// @noUncheckedIndexedAccess: true\n${code}`).length, 1)
  assert.deepEqual(c.checkClaims(`// @noUncheckedIndexedAccess: true\nconst arr = [1]\nconst v = arr[0]\ntype V = typeof v // → number | undefined`), [])
  assert.deepEqual(errs(`// @exactOptionalPropertyTypes: true\nconst o: { a?: string } = { a: undefined }`).map((e) => e[2]), [2375])
  assert.deepEqual(errs(`// @strict: false\nfunction f(a) { return a }`), [])
  assert.throws(() => validateFlags('// @nimporteQuoi: true'), /option inconnue/)
})

test('ts : extrait multi-fichiers (// @filename), lignes conservées', () => {
  const code = `// @filename: legacy.d.ts\ndeclare module 'legacy' {\n  export function f(): string\n}\n// @filename: main.ts\nimport { f } from 'legacy'\nconst n: number = f()`
  assert.equal(splitFiles(code).length, 2)
  assert.deepEqual(errs(code), [[7, 7, 2322]])
})

test('ts : infobulle et type affiché', () => {
  assert.deepEqual(c.quickInfo('const xs = [1, 2]', 7)?.text, 'const xs: number[]')
  assert.equal(c.typeOf(`type P = Pick<{ a: string; b: number }, 'a'>`, 'P'), '{ a: string; }')
})

test('ts : transpilation puis exécution', async () => {
  assert.equal(c.transpile(`type A = 1 // → 1\nconst x: number = 1\nconsole.log(x as number)`), 'const x = 1;\nconsole.log(x);\n')
  await checkTsSnippet('t', { lang: 'ts', code: `const xs: number[] = [1, 2]\nconsole.log(xs.map((x) => x * 2))\nxs.length // → 2`, output: '[ 2, 4 ]' })
  await assert.rejects(checkTsSnippet('t', { lang: 'ts', code: `console.log(1 as number)`, output: '2' }), /sortie console différente/)
  await assert.rejects(checkTsSnippet('t', { lang: 'ts', code: `const x: string = 1` }), /ne compile pas/)
  await assert.rejects(checkTsSnippet('t', { lang: 'ts', code: `type A = string // → number` }), /affirmations de type fausses/)
  await assert.rejects(checkTsSnippet('t', { lang: 'ts', code: `const x = [1]\nx.length // → 2` }), /valeurs \/\/ → incorrectes/)
})

test('ts : tests de types d’un kata', () => {
  const tests = [
    { name: 'pick', code: `type t = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>` },
    { name: 'clé invalide', code: `// @ts-expect-error\ntype e = MyPick<{ a: 1 }, 'z'>` },
  ]
  const ko = c.runTypeTests(`type MyPick<T, K> = any`, tests)
  assert.deepEqual(ko.results.map((r) => r.ok), [false, false])
  const ok = c.runTypeTests(`type MyPick<T, K extends keyof T> = { [P in K]: T[P] }`, tests)
  assert.deepEqual(ok.results.map((r) => r.ok), [true, true])
  assert.deepEqual(ok.codeErrors, [])
  const broken = c.runTypeTests(`type MyPick<T, K extends keyof T> = { [P in K]: T[P] }\nconst z: string = 1`, tests)
  assert.deepEqual(broken.codeErrors.map((d) => d.line), [2])
})

test('quiz compile : lecture des choix', () => {
  assert.deepEqual(parseCompileChoice('Compile sans erreur'), [])
  assert.deepEqual(parseCompileChoice('Erreur ligne 3 : TS2322'), [3])
  assert.deepEqual(parseCompileChoice('Erreurs lignes 5 et 2'), [2, 5])
  assert.deepEqual(parseCompileChoice('Erreurs lignes 2, 4 et 6 : x'), [2, 4, 6])
  assert.equal(parseCompileChoice('Peut-être'), null)
})

test('playground TS : les exemples compilent (sauf « Erreurs de type », qui en montre 4)', async () => {
  const { TS_EXAMPLES } = await import('../data/playgroundTs')
  for (const [label, code] of TS_EXAMPLES) {
    const e = tsErrors(code).map((d) => `${d.line}: TS${d.code} ${d.message}`)
    if (label === 'Erreurs de type') assert.equal(e.length, 4, e.join('\n'))
    else assert.deepEqual(e, [], label)
  }
})

// ───────────── revue de code : régressions ─────────────

test('ts : tests de types, chaque test garde toutes ses lignes (test n°2 et suivants compris)', () => {
  const pick = `type MyPick<T, K extends keyof T> = { [P in K]: T[P] }`
  const r = c.runTypeTests(pick, [
    { name: 't1', code: `type t1 = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>` },
    { name: 't2', code: `type t2 = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'b'>, { b: 3 }>>` },
  ])
  assert.deepEqual(r.results.map((x) => x.ok), [true, false])
  // test multi-lignes au milieu : l'erreur de sa dernière ligne lui revient, pas au suivant
  const r2 = c.runTypeTests(pick, [
    { name: 'a', code: `type a1 = 1` },
    { name: 'b', code: `type b1 = 1\n\ntype b2 = Expect<false>` },
    { name: 'c', code: `type c1 = 1\ntype c2 = 2` },
  ])
  assert.deepEqual(r2.results.map((x) => x.ok), [true, false, true])
  assert.deepEqual(r2.codeErrors, [])
})

test('ts : export retiré à la transpilation, le code s’exécute comme un script', async () => {
  await checkTsSnippet('t', { lang: 'ts', code: `export function f(x: number) {\n  return x\n}\nconsole.log(f(2))`, output: '2' })
  await checkTsSnippet('t', {
    lang: 'ts',
    code: `export const a = 1\nexport enum E { A, B }\nexport class K { v = 3 }\nexport default function () { return 4 }\nexport type T = number\nexport interface I { x: 1 }\nexport { a as b }\nconsole.log(a, E.B, new K().v)`,
    output: '1 1 3',
  })
  await checkTsSnippet('t', { lang: 'ts', code: `export default 41 + 1\nconsole.log('ok')`, output: 'ok' })
  await checkTsSnippet('t', { lang: 'ts', code: `export default class {}\nconsole.log('ok')`, output: 'ok' })
  assert.equal(c.runnable(`export function f(x: number) { return x }`).js, 'function f(x) { return x; }\n')
})

test('ts : import de valeur → message clair (pas de SyntaxError) ; import de type effacé', () => {
  const r = c.runnable(`const x = 1\nimport { f } from 'lib'\nf(x)`)
  assert.equal(r.js, null)
  assert.match(r.reason!, /import.*pas pris en charge.*ligne 2/s)
  assert.throws(() => c.transpile(`import { f } from 'lib'\nf()`), /pas pris en charge/)
  assert.match(c.runnable(`export * from 'z'`).reason!, /pas pris en charge/)
  assert.match(c.runnable(`import 'side-effect'`).reason!, /pas pris en charge/)
  assert.match(c.runnable(`import fs = require('fs')\nconsole.log(fs)`).reason!, /pas pris en charge.*ligne 1/s)
  assert.equal(c.runnable(`import type { X } from 'lib'\nconst v: X | 1 = 1\nconsole.log(v)`).js, 'const v = 1;\nconsole.log(v);\n')
  assert.equal(c.runnable(`import { X } from 'lib'\nconst v: X | 1 = 1`).js, 'const v = 1;\n')
  assert.match(c.runnable(`// @filename: a.ts\nexport const a = 1\n// @filename: b.ts\nconsole.log(2)`).reason!, /multi-fichiers/)
})

test('ts : commentaire // @mot: valeur inconnu ignoré (le compilateur reste utilisable)', () => {
  assert.deepEqual(parseFlags('// @todo: x\n// @strict: maybe\n// @noUncheckedIndexedAccess: true'), { noUncheckedIndexedAccess: true })
  assert.deepEqual(c.check(`// @todo: x\nconst a: number = 1`), [])
  assert.equal(c.quickInfo(`// @todo: x\nconst xs = [1]`, 18)?.text, 'const xs: number[]')
  // contenu du site : une option mal orthographiée reste une erreur
  assert.throws(() => validateFlags('// @noUncheckedIndexAccess: true'), /option inconnue/)
  assert.throws(() => validateFlags('// @strict: maybe'), /true ou false/)
  assert.doesNotThrow(() => validateFlags('// @strict: false\n// @filename: a.ts'))
  assert.throws(() => tsErrors('// @nimporteQuoi: true\nconst a = 1'), /option inconnue/)
  return assert.rejects(checkTsSnippet('t', { lang: 'ts', run: false, code: `// @noUncheckedIndexAccess: true\nconst a = 1` }), /option inconnue/)
})

test('ts : kata multi-fichiers → tests d’exécution non lancés, jamais réussi', async () => {
  const { katas } = await import('../data/katas')
  const k = katas.find((x) => x.lang === 'ts' && x.tests.length > 0)!
  const r = await runTsKata(k, `// @filename: helpers.ts\nexport const unused = 1\n// @filename: main.ts\n${k.solution}`)
  const runtime = r.results.filter((x) => k.tests.some((t) => t.name === x.name))
  assert.equal(runtime.length, k.tests.length)
  assert.ok(runtime.every((x) => !x.ok && /multi-fichiers/.test(x.error ?? '')), JSON.stringify(runtime))
  assert.notEqual(r.summary, '')
})

test('ts : kata avec export → les tests d’exécution tournent et passent', async () => {
  const { katas } = await import('../data/katas')
  const k = katas.find((x) => x.lang === 'ts' && x.tests.length > 0)!
  const r = await runTsKata(k, `${k.solution}\nexport function __f(x: number) {\n  return x\n}`)
  assert.equal(r.summary, '')
})

test('ts : load() ne reconstruit pas le programme si le code n’a pas changé', () => {
  const code = `const xs = [1, 2]\ntype A = typeof xs // → number[]`
  c.check(code)
  const p = c.program()
  assert.equal(c.quickInfo(code, 7)?.text, 'const xs: number[]')
  c.check(code)
  assert.equal(c.program(), p, 'programme reconstruit inutilement')
  c.check(code + '\n')
  assert.notEqual(c.program(), p)
  // checkClaims modifie les fichiers : le check suivant ne doit pas voir ses lignes ajoutées
  assert.deepEqual(c.checkClaims(`type A = string // → number`).length, 1)
  assert.deepEqual(c.check(`type A = string // → number`), [])
})
