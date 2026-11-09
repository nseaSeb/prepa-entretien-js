import { test } from 'node:test'
import assert from 'node:assert/strict'
import { katas } from '../data/katas'
import { runKata } from './sandbox/node'

for (const k of katas) {
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
