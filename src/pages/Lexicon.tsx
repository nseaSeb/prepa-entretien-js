import { useMemo, useState } from 'react'
import { lexique } from '../data/lexique'
import { themeLabel } from '../data/themes'
import { useNav } from '../lib/nav'
import { Code, PageHeader, Tag } from '../components/ui'
import { Rich } from '../components/Rich'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
const slug = (term: string) => 'x-' + norm(term).replace(/[^a-z0-9]+/g, '-')
const letterOf = (term: string) => {
  const c = norm(term).replace(/[^a-z]/g, '')[0]
  return c ? c.toUpperCase() : '#'
}

export default function Lexicon() {
  const { go } = useNav()
  const [q, setQ] = useState('')
  const sorted = useMemo(() => [...lexique].sort((a, b) => norm(a.term).localeCompare(norm(b.term))), [])
  const filtered = useMemo(() => {
    const n = norm(q.trim())
    if (!n) return sorted
    return sorted.filter((e) => norm(e.term).includes(n) || norm(e.def).includes(n))
  }, [q, sorted])
  const letters = [...new Set(sorted.map((e) => letterOf(e.term)))]
  const groups = letters.map((l) => [l, filtered.filter((e) => letterOf(e.term) === l)] as const).filter(([, es]) => es.length)

  return (
    <div className="max-w-4xl">
      <PageHeader title="Lexique" subtitle={`${lexique.length} termes du vocabulaire JavaScript et front-end, de A à Z. La recherche porte sur le terme et sur sa définition.`} />
      <div className="sticky top-14 z-[5] -mx-2 mb-6 bg-slate-50/95 px-2 py-2 backdrop-blur md:top-0 dark:bg-slate-950/95">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un terme (closure, hoisting, CORS…)"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {letters.map((l) => (
            <button key={l} onClick={() => document.getElementById(`lettre-${l}`)?.scrollIntoView({ behavior: 'smooth' })} className="w-7 rounded py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-slate-800">
              {l}
            </button>
          ))}
        </div>
      </div>
      {groups.length === 0 && <p className="text-slate-500">Aucun terme ne correspond à « {q} ».</p>}
      {groups.map(([l, es]) => (
        <section key={l} id={`lettre-${l}`} className="mb-8 scroll-mt-32">
          <h2 className="mb-3 text-2xl font-bold text-slate-300 dark:text-slate-700">{l}</h2>
          <div className="space-y-3">
            {es.map((e) => (
              <article key={e.term} id={slug(e.term)} className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-mono text-lg font-bold text-indigo-700 dark:text-indigo-300">{e.term}</h3>
                  {e.theme && (
                    <button onClick={() => go('cours', e.theme)} title="Voir la section du cours">
                      <Tag color="sky">{themeLabel(e.theme)}</Tag>
                    </button>
                  )}
                </div>
                <Rich text={e.def} className="text-[15px]" />
                {e.code && <Code code={e.code} output={e.output} run={e.run !== false} lang={e.lang} />}
                {e.see && e.see.length > 0 && (
                  <div className="mt-2 text-sm text-slate-500">
                    Voir aussi :{' '}
                    {e.see.map((s, i) => (
                      <span key={s}>
                        {i > 0 && ', '}
                        <button
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                          onClick={() => {
                            setQ('')
                            setTimeout(() => document.getElementById(slug(s))?.scrollIntoView({ behavior: 'smooth' }), 0)
                          }}
                        >
                          {s}
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
