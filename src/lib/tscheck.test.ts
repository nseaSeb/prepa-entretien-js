/** Tests du vérificateur TypeScript lui-même (diagnostics, affirmations de type, options, katas). */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getChecker } from './ts/node'
import { checkTsSnippet, parseCompileChoice, tsErrors } from './contentCheck'
import { LIB_FILES, parseFlags, splitFiles } from './ts/core'

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
  assert.throws(() => parseFlags('// @nimporteQuoi: true'), /option inconnue/)
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
