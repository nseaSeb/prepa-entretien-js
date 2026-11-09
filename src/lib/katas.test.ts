import { test } from 'node:test'
import assert from 'node:assert/strict'
import { katas } from '../data/katas'
import { runKata } from './sandbox/node'
import { runTsKata } from './contentCheck'

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
