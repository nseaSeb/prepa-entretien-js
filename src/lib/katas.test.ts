import { test } from 'node:test'
import assert from 'node:assert/strict'
import { katas } from '../data/katas'
import { runKata } from './sandbox/node'
import { runTsKata } from './contentCheck'
import { getChecker } from './ts/node'

for (const k of katas.filter((x) => x.lang !== 'ts')) {
  test(`kata ${k.id} : la solution de référence passe tous les tests`, async () => {
    const { results, logs } = await runKata(k.solution, k.tests)
    const failed = results.filter((r) => !r.ok)
    assert.equal(failed.length, 0, failed.map((f) => `${f.name} → ${f.error}`).join('\n') + logs.map((l) => `\n[${l.level}] ${l.text}`).join(''))
  })
  test(`kata ${k.id} : le code de départ échoue à au moins un test`, async () => {
    const { results } = await runKata(k.starter, k.tests)
    assert.ok(results.some((r) => !r.ok), 'les tests ne vérifient rien : le code de départ les passe tous')
  })
}

for (const k of katas.filter((x) => x.lang === 'ts')) {
  test(`kata TS ${k.id} : la solution compile (strict) et passe tous les tests`, async () => {
    const r = await runTsKata(k, k.solution)
    assert.equal(r.results.length, k.tests.length + (k.typeTests?.length ?? 0))
    assert.equal(r.summary, '', r.summary + r.logs.map((l) => `\n[${l.level}] ${l.text}`).join(''))
  })
  test(`kata TS ${k.id} : le code de départ compile mais échoue à au moins un test`, async () => {
    const r = await runTsKata(k, k.starter)
    assert.deepEqual(r.codeErrors.map((d) => `${d.line}: ${d.message}`), [], 'le code de départ doit compiler')
    assert.ok(r.results.some((t) => !t.ok), 'les tests ne vérifient rien : le code de départ les passe tous')
  })
}

/**
 * Chaque test de types est bien relié à ses propres lignes : une mutation dans le test i
 * (sur sa dernière ligne, ou sur chacune de ses lignes Expect / @ts-expect-error) fait échouer
 * le test i, et lui seul, sur la solution de référence.
 */
for (const k of katas.filter((x) => x.typeTests?.length)) {
  test(`kata TS ${k.id} : chaque mutation d’un test de types est détectée par ce test`, () => {
    const c = getChecker()
    const tests = k.typeTests!
    const expectOnly = (i: number, mutated: string, what: string) => {
      const r = c.runTypeTests(k.solution, tests.map((t, j) => (j === i ? { ...t, code: mutated } : t)))
      assert.deepEqual(r.codeErrors.map((d) => `${d.line}: ${d.message}`), [], `${what} : erreur attribuée au code du candidat`)
      assert.deepEqual(r.results.map((x) => x.ok), tests.map((_, j) => j !== i), `${what} : seul le test « ${tests[i].name} » doit échouer`)
    }
    tests.forEach((t, i) => {
      expectOnly(i, `${t.code.replace(/\s+$/, '')}\ntype __mut = Expect<false>`, `ligne fausse ajoutée en fin de « ${t.name} »`)
      const lines = t.code.split('\n')
      lines.forEach((l, n) => {
        let m: string | null = null
        if (/Expect<Equal</.test(l)) m = l.replace(/Expect<Equal</g, 'Expect<NotEqual<')
        else if (/Expect<NotEqual</.test(l)) m = l.replace(/Expect<NotEqual</g, 'Expect<Equal<')
        else if (/^\s*\/\/\s*@ts-expect-error/.test(l)) m = ''
        if (m === null) return
        expectOnly(i, lines.map((x, j) => (j === n ? m : x)).join('\n'), `« ${t.name} » ligne ${n + 1} inversée`)
      })
    })
  })
}
