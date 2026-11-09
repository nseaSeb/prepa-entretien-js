import { useState } from 'react'
import { entretien } from '../data/entretien'
import type { EntretienQ, EntretienSection } from '../data/types'
import { useStored } from '../lib/storage'
import { useNav } from '../lib/nav'
import { Callout, Card, Code, H2, P, PageHeader, Reveal, Tag } from '../components/ui'
import { Rich } from '../components/Rich'

const SECTIONS: { id: EntretienSection; title: string; intro: string }[] = [
  {
    id: 'general',
    title: 'Questions classiques JavaScript',
    intro: "Les questions qui reviennent dans presque tous les entretiens. Rédige d'abord ta propre réponse dans le champ prévu, à voix haute si possible, puis compare avec la piste proposée.",
  },
  {
    id: 'react',
    title: 'Frameworks · React',
    intro: 'Le niveau attendu : comprendre le modèle de rendu, les hooks et leurs pièges, sans réciter la documentation.',
  },
  {
    id: 'vue',
    title: 'Frameworks · Vue',
    intro: 'Réactivité, computed et watch, communication entre composants : les notions qui distinguent Vue de React.',
  },
  {
    id: 'angular',
    title: 'Frameworks · Angular',
    intro: "Injection de dépendances, détection de changements et RxJS : les trois piliers sur lesquels on t'interrogera.",
  },
  {
    id: 'comparaison',
    title: 'Frameworks · Comparaisons',
    intro: 'Les questions transversales : savoir expliquer les choix d’architecture des frameworks, leurs compromis, et justifier un choix.',
  },
]

function Draft({ id }: { id: string }) {
  const [value, setValue] = useStored(`entretien:${id}`, '')
  return (
    <textarea
      className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed shadow-inner outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
      rows={value ? Math.min(12, Math.max(3, value.split('\n').length + 1)) : 3}
      value={value}
      placeholder="Ton brouillon de réponse (conservé dans ce navigateur)…"
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

function QuestionCard({ q, n, ready, toggleReady }: { q: EntretienQ; n: number; ready: boolean; toggleReady: () => void }) {
  return (
    <Card id={q.id}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-mono text-sm text-slate-400">{n}.</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">{q.q}</h3>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-slate-500">
              <input type="checkbox" className="accent-emerald-600" checked={ready} onChange={toggleReady} />
              Prête
            </label>
          </div>
          {q.attendu && <p className="mt-1 text-sm text-slate-500 italic">Ce qui est évalué : {q.attendu}</p>}
          <Draft id={q.id} />
          <Reveal label="Piste de réponse" tone="emerald">
            <Rich text={q.answer} className="text-[15px]" />
            {q.code && <Code code={q.code} output={q.output} run={q.run !== false} />}
          </Reveal>
        </div>
      </div>
    </Card>
  )
}

export default function Interview() {
  const { go } = useNav()
  const [ready, setReady] = useStored<string[]>('entretien:ready', [])
  const [filter, setFilter] = useState<'all' | 'todo'>('all')
  const toggle = (id: string) => setReady(ready.includes(id) ? ready.filter((x) => x !== id) : [...ready, id])

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Questions d'entretien"
        subtitle={`${entretien.length} questions classiques avec une piste de réponse à révéler, et une partie frameworks (React, Vue, Angular, comparaisons) au niveau des concepts. Tes brouillons sont conservés dans ce navigateur.`}
      >
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            {ready.filter((id) => entretien.some((q) => q.id === id)).length} / {entretien.length} réponses prêtes
          </span>
          <button className={`underline ${filter === 'todo' ? 'font-semibold text-indigo-600' : ''}`} onClick={() => setFilter(filter === 'all' ? 'todo' : 'all')}>
            {filter === 'all' ? 'Masquer les réponses prêtes' : 'Tout afficher'}
          </button>
        </div>
      </PageHeader>

      <Card className="mb-8">
        <div className="mb-2 text-sm font-semibold text-slate-500">Sommaire</div>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => go('entretien', `section-${s.id}`)}>
              <Tag color="indigo">
                {s.title} ({entretien.filter((q) => q.section === s.id).length})
              </Tag>
            </button>
          ))}
        </div>
      </Card>

      <Callout tone="tip" title="Comment structurer une réponse orale">
        Une définition en une phrase, un exemple minimal, à quoi ça sert concrètement, le piège ou la limite, et si possible un lien avec ton expérience. Visez une à deux minutes par question. La page{' '}
        <button className="font-semibold underline" onClick={() => go('methode', 'expliquer')}>
          Méthode
        </button>{' '}
        détaille cette structure.
      </Callout>

      {SECTIONS.map((s) => {
        const qs = entretien.filter((q) => q.section === s.id)
        const shown = qs.filter((q) => filter === 'all' || !ready.includes(q.id))
        if (!qs.length) return null
        return (
          <section key={s.id}>
            <H2 id={`section-${s.id}`}>{s.title}</H2>
            <P>{s.intro}</P>
            <div className="space-y-4">
              {shown.map((q) => (
                <QuestionCard key={q.id} q={q} n={qs.indexOf(q) + 1} ready={ready.includes(q.id)} toggleReady={() => toggle(q.id)} />
              ))}
              {shown.length === 0 && <p className="text-sm text-slate-500">Toutes les réponses de cette section sont prêtes.</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
