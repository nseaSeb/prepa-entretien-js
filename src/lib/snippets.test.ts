import { test } from 'node:test'
import { cours } from '../data/cours'
import { cheatsheet } from '../data/cheatsheet'
import { flashcards } from '../data/flashcards'
import { lexique } from '../data/lexique'
import { entretien } from '../data/entretien'
import { checkSnippet } from './contentCheck'
import type { Snippet } from '../data/types'

const all: [string, Partial<Snippet>][] = [
  ...cours.flatMap((s) => s.blocks.filter((b) => 'code' in b).map((b, i) => [`cours ${s.id} #${i + 1}`, b as Snippet] as [string, Snippet])),
  ...cheatsheet.flatMap((s) => s.blocks.filter((b) => b.code).map((b) => [`cheatsheet ${s.id} « ${b.title} »`, b] as [string, Snippet])),
  ...flashcards.filter((f) => f.code).map((f) => [`flashcard ${f.id}`, f] as [string, Snippet]),
  ...lexique.filter((e) => e.code).map((e) => [`lexique « ${e.term} »`, e] as [string, Snippet]),
  ...entretien.filter((e) => e.code).map((e) => [`entretien ${e.id}`, e] as [string, Snippet]),
]

for (const [label, s] of all) {
  test(`${label}${s.run === false ? ' (non exécuté : run:false)' : ''}`, async () => {
    await checkSnippet(label, s)
  })
}
