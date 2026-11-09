import { cours } from '../data/cours'
import type { CoursBlock } from '../data/types'
import { useNav } from '../lib/nav'
import { useStored } from '../lib/storage'
import { KEYS } from '../lib/progress'
import { Callout, Card, Code, H3, PageHeader } from '../components/ui'
import { Rich, inline } from '../components/Rich'

function Block({ b }: { b: CoursBlock }) {
  if ('p' in b) return <Rich text={b.p} className="text-[15px]" />
  if ('h' in b) return <H3 id={b.id}>{b.h}</H3>
  if ('mnemo' in b)
    return (
      <div className="grid gap-x-4 md:grid-cols-2">
        <Callout tone="mnemo" title="Mnémo">
          <Rich text={b.mnemo} />
        </Callout>
        <Callout tone="danger" title="Piège">
          <Rich text={b.piege} />
        </Callout>
      </div>
    )
  if ('list' in b)
    return (
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px] leading-relaxed">
        {b.list.map((l, i) => <li key={i}>{inline(l)}</li>)}
      </ul>
    )
  if ('table' in b) {
    const [head, ...rows] = b.table
    return (
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>{head.map((c, k) => <th key={k} className="border-b border-slate-300 px-3 py-2 text-left font-semibold dark:border-slate-700">{inline(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <tr key={k} className="border-b border-slate-100 dark:border-slate-800">
                {r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{inline(c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return <Code code={b.code} title={b.title} output={b.output} run={b.run !== false} />
}

export default function Lessons() {
  const { go } = useNav()
  const [read, setRead] = useStored<string[]>(KEYS.cours, [])
  const toggle = (id: string) => setRead(read.includes(id) ? read.filter((x) => x !== id) : [...read, id])

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Cours : les fondamentaux"
        subtitle="Les notions sur lesquelles portent presque tous les entretiens JavaScript. Chaque section se termine par un moyen mnémotechnique et par le piège classique à connaître. Les sorties affichées sous les exemples sont vérifiées automatiquement."
      />
      <Card className="mb-8">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-500">Sommaire</span>
          <span className="text-xs text-slate-500">
            {read.filter((id) => cours.some((c) => c.id === id)).length} / {cours.length} sections lues
          </span>
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          {cours.map((c, i) => (
            <button key={c.id} onClick={() => go('cours', c.id)} className="flex items-center gap-2 text-left text-sm text-indigo-700 hover:underline dark:text-indigo-300">
              <span className="w-5 text-xs text-slate-400">{read.includes(c.id) ? '✓' : `${i + 1}.`}</span>
              {c.title}
            </button>
          ))}
        </div>
        {cours.map((c) => {
          const subs = c.blocks.flatMap((b) => ('h' in b && b.id ? [{ id: b.id, label: b.h }] : []))
          if (!subs.length) return null
          return (
            <div key={c.id} className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
              <div className="mb-1 text-xs font-semibold text-slate-500">{c.title} : accès direct</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {subs.map((s) => (
                  <button key={s.id} onClick={() => go('cours', s.id)} className="text-left text-xs text-indigo-700 hover:underline dark:text-indigo-300">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Card>

      {cours.map((c, i) => (
        <section key={c.id} id={c.id} className="mb-14 scroll-mt-6">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              <span className="mr-2 text-slate-400">{i + 1}.</span>
              {c.title}
            </h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" className="accent-indigo-600" checked={read.includes(c.id)} onChange={() => toggle(c.id)} />
              Lu
            </label>
          </div>
          <p className="mb-4 text-slate-600 italic dark:text-slate-400">{inline(c.summary)}</p>
          {c.blocks.map((b, k) => (
            <Block key={k} b={b} />
          ))}
          <div className="grid gap-x-4 md:grid-cols-2">
            <Callout tone="mnemo" title="Mnémo">
              <Rich text={c.mnemo} />
            </Callout>
            <Callout tone="danger" title="Piège">
              <Rich text={c.piege} />
            </Callout>
          </div>
        </section>
      ))}
    </div>
  )
}
