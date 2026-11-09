import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quiz } from '../data/quiz'
import { runSnippet } from './sandbox/node'
import { getChecker } from './ts/node'
import { norm, parseCompileChoice, tsErrors } from './contentCheck'

const isTs = (q: (typeof quiz)[number]) => q.lang === 'ts' || q.kind === 'compile' || q.kind === 'type'

for (const q of quiz.filter((x) => x.kind === 'output')) {
  test(`quiz ${q.id} (output) : la sortie réelle est la bonne réponse`, async () => {
    assert.ok(q.code, 'code obligatoire')
    let code = q.code!
    if (isTs(q)) {
      const errs = tsErrors(code)
      assert.deepEqual(errs.map((d) => `${d.line}: ${d.message}`), [], 'le code TS doit compiler')
      code = getChecker().transpile(code)
    }
    const r = await runSnippet(code)
    assert.ok(r.settled, 'minuteurs jamais terminés')
    const out = norm(r.output)
    assert.equal(out, norm(q.choices[q.answer]), `sortie réelle :\n${r.output}`)
    q.choices.forEach((c, i) => {
      if (i !== q.answer) assert.notEqual(norm(c), out, `le choix ${i} est aussi la sortie réelle`)
    })
  })
}

for (const q of quiz.filter((x) => x.kind === 'compile')) {
  test(`quiz ${q.id} (compile) : les lignes en erreur sont celles de la bonne réponse`, () => {
    const lines = [...new Set(tsErrors(q.code!).map((d) => d.line))].sort((a, b) => a - b)
    assert.ok(!lines.includes(0), 'erreur globale du compilateur')
    const parsed = q.choices.map(parseCompileChoice)
    parsed.forEach((p, i) => assert.ok(p, `choix ${i} illisible : « Compile… » ou « Erreur ligne N… » attendu`))
    assert.deepEqual(parsed[q.answer], lines, `lignes réellement en erreur : ${JSON.stringify(lines)}\n${tsErrors(q.code!).map((d) => `${d.line}: TS${d.code} ${d.message}`).join('\n')}`)
    parsed.forEach((p, i) => {
      if (i !== q.answer) assert.notDeepEqual(p, lines, `le choix ${i} est aussi correct`)
    })
  })
}

for (const q of quiz.filter((x) => x.kind === 'type')) {
  test(`quiz ${q.id} (type) : seule la bonne réponse est Equal au type demandé`, () => {
    assert.ok(q.target, 'target obligatoire')
    const c = getChecker()
    const base = q.code!
    assert.deepEqual(tsErrors(base).map((d) => `${d.line}: ${d.message}`), [], 'le code doit compiler')
    q.choices.forEach((choice, i) => {
      assert.deepEqual(tsErrors(`${base}\ntype __Choice = ${choice}`).map((d) => d.message), [], `le choix ${i} n'est pas un type valide`)
      const equal = tsErrors(`${base}\ntype __Check = Expect<Equal<${q.target}, ${choice}>>`).length === 0
      if (i === q.answer) assert.ok(equal, `la bonne réponse ne correspond pas : le type réel est ${c.typeOf(`${base}\ntype __Real = ${q.target}`, '__Real')}`)
      else assert.ok(!equal, `le choix ${i} (${choice}) est aussi Equal au type demandé`)
    })
  })
}

for (const q of quiz.filter((x) => isTs(x) && (x.kind === 'qcm' || x.kind === 'bug') && x.code)) {
  test(`quiz ${q.id} (${q.kind} TS) : le code compile (erreurs voulues en @ts-expect-error)`, () => {
    assert.deepEqual(tsErrors(q.code!).map((d) => `${d.line}: ${d.message}`), [])
  })
}
