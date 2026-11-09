import { test } from 'node:test'
import { pieges } from '../data/pieges'
import { checkSnippet } from './contentCheck'

for (const p of pieges) {
  test(`piège ${p.id} : sortie exacte`, async () => {
    await checkSnippet(`piège ${p.id}`, { code: p.code, output: p.output })
    if (p.fix) await checkSnippet(`piège ${p.id} (correction)`, p.fix)
  })
}
