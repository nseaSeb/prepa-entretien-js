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
    if (q.kind === 'type') assert.ok(q.target, `${q.id} : target obligatoire pour type`)
    else assert.equal(q.target, undefined, `${q.id} : target réservé aux questions type`)
    if (q.kind === 'compile' || q.kind === 'type') assert.equal(q.theme, 'ts', `${q.id} : thème ts attendu`)
    // l'affichage retire les lignes vides initiales : les numéros de ligne doivent coïncider
    if (q.kind === 'compile') assert.ok(!/^\s*\n/.test(q.code!), `${q.id} : pas de ligne vide en tête (numéros de ligne affichés)`)
    checkText(`quiz ${q.id}`, q.why)
  }
})

test('katas : au moins 3 tests, noms uniques, indices et discussion', () => {
  for (const k of katas) {
    const all = [...k.tests, ...(k.typeTests ?? [])]
    assert.ok(all.length >= 3, `${k.id} : au moins 3 tests`)
    assert.ok(['utilitaire', 'algo', 'ts'].includes(k.category), `${k.id} : catégorie inconnue ${k.category}`)
    assert.equal(k.category === 'ts', k.lang === 'ts', `${k.id} : catégorie ts ⇔ lang ts`)
    if (k.typeTests) assert.equal(k.lang, 'ts', `${k.id} : typeTests réservés aux katas TS`)
    unique(`kata ${k.id}`, all.map((t) => t.name))
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

test('pièges : sortie obligatoire en JS', () => {
  for (const p of pieges) if (p.lang !== 'ts') assert.notEqual(p.output, undefined, `${p.id} : output obligatoire`)
})

test('TypeScript : run:false seulement dans les sous-parties « frameworks » du cours', () => {
  const allowed = /^ts-(react|vue|angular|frameworks)/
  const offenders: string[] = []
  for (const c of cours) {
    let sub = ''
    for (const b of c.blocks) {
      if ('h' in b) sub = b.id ?? ''
      if ('code' in b && b.lang === 'ts' && b.run === false && !allowed.test(sub)) offenders.push(`cours ${c.id} (${sub || 'sans ancre'})`)
    }
  }
  const others = [...cheatsheet.flatMap((s) => s.blocks), ...flashcards, ...lexique, ...entretien, ...pieges.flatMap((p) => (p.fix ? [p.fix] : []))]
  for (const x of others) if (x.lang === 'ts' && x.run === false) offenders.push(x.code?.slice(0, 40) ?? '?')
  assert.deepEqual(offenders, [])
})

test('textes sans bloc ```', () => {
  for (const p of pieges) checkText(`piège ${p.id}`, p.explanation)
  for (const f of flashcards) checkText(`flashcard ${f.id}`, f.back)
  for (const e of lexique) checkText(`lexique ${e.term}`, e.def)
  for (const e of entretien) checkText(`entretien ${e.id}`, e.answer)
})
