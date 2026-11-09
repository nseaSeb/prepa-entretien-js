import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quiz } from '../data/quiz'
import { pieges } from '../data/pieges'
import { katas } from '../data/katas'
import { flashcards } from '../data/flashcards'
import { lexique } from '../data/lexique'
import { entretien } from '../data/entretien'
import { cours } from '../data/cours'
import { cheatsheet } from '../data/cheatsheet'
import { themes } from '../data/themes'
import { checkText } from './contentCheck'

const themeIds = new Set(themes.map((t) => t.id))
const unique = (label: string, ids: string[]) => {
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
  assert.deepEqual(dup, [], `${label} : identifiants en double`)
}

test('identifiants uniques', () => {
  unique('quiz', quiz.map((q) => q.id))
  unique('pièges', pieges.map((p) => p.id))
  unique('katas', katas.map((k) => k.id))
  unique('flashcards', flashcards.map((f) => f.id))
  unique('lexique', lexique.map((e) => e.term.toLowerCase()))
  unique('entretien', entretien.map((e) => e.id))
  unique('cours', cours.map((c) => c.id))
  unique('cheatsheet', cheatsheet.map((c) => c.id))
})

test('thèmes valides', () => {
  for (const x of [...quiz, ...pieges, ...katas, ...flashcards]) assert.ok(themeIds.has(x.theme), `${x.id} : thème inconnu ${x.theme}`)
  for (const e of lexique) if (e.theme) assert.ok(themeIds.has(e.theme), `${e.term} : thème inconnu ${e.theme}`)
})

test('lexique : renvois « voir aussi » existants', () => {
  const terms = new Set(lexique.map((e) => e.term.toLowerCase()))
  for (const e of lexique) for (const s of e.see ?? []) assert.ok(terms.has(s.toLowerCase()), `${e.term} : renvoi inconnu « ${s} »`)
})

test('quiz : réponses dans les bornes, choix uniques, code présent pour output/bug', () => {
  for (const q of quiz) {
    assert.ok(q.choices.length >= 2, `${q.id} : au moins 2 choix`)
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `${q.id} : answer hors bornes`)
    assert.equal(new Set(q.choices).size, q.choices.length, `${q.id} : choix en double`)
    if (q.kind !== 'qcm') assert.ok(q.code, `${q.id} : code obligatoire pour ${q.kind}`)
    checkText(`quiz ${q.id}`, q.why)
  }
})

test('katas : au moins 3 tests, noms uniques, indices et discussion', () => {
  for (const k of katas) {
    assert.ok(k.tests.length >= 3, `${k.id} : au moins 3 tests`)
    assert.ok(k.category === 'utilitaire' || k.category === 'algo', `${k.id} : catégorie inconnue ${k.category}`)
    unique(`kata ${k.id}`, k.tests.map((t) => t.name))
    assert.ok(k.hints.length > 0, `${k.id} : indices`)
    assert.ok(k.discussion.length > 0, `${k.id} : discussion`)
    checkText(`kata ${k.id}`, k.statement)
    checkText(`kata ${k.id}`, k.discussion)
  }
})

test('cours : une section par thème, mnémo et piège', () => {
  assert.deepEqual(cours.map((c) => c.id).sort(), [...themeIds].sort())
  for (const c of cours) {
    assert.ok(c.mnemo && c.piege, `${c.id} : mnémo et piège obligatoires`)
    assert.ok(c.blocks.some((b) => 'code' in b), `${c.id} : au moins un exemple de code`)
    for (const b of c.blocks) if ('p' in b) checkText(`cours ${c.id}`, b.p)
    for (const b of c.blocks) if ('mnemo' in b) {
      assert.ok(b.mnemo && b.piege, `${c.id} : encadré mnémo/piège incomplet`)
      checkText(`cours ${c.id}`, b.mnemo)
      checkText(`cours ${c.id}`, b.piege)
    }
  }
})

test('cours : ancres de sous-parties uniques et préfixées par le thème', () => {
  const ids = cours.flatMap((c) => c.blocks.flatMap((b) => ('h' in b && b.id ? [[c.id, b.id]] : [])))
  unique('ancres du cours', ids.map(([, id]) => id))
  for (const [section, id] of ids) assert.ok(id.startsWith(section + '-'), `${id} : l'ancre doit commencer par « ${section}- »`)
})

test('textes sans bloc ```', () => {
  for (const p of pieges) checkText(`piège ${p.id}`, p.explanation)
  for (const f of flashcards) checkText(`flashcard ${f.id}`, f.back)
  for (const e of lexique) checkText(`lexique ${e.term}`, e.def)
  for (const e of entretien) checkText(`entretien ${e.id}`, e.answer)
})
