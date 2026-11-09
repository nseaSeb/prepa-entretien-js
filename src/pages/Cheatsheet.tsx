import { cheatsheet } from '../data/cheatsheet'
import { highlightJs } from '../lib/highlight'
import { useNav } from '../lib/nav'
import { PageHeader } from '../components/ui'
import { inline } from '../components/Rich'

export default function Cheatsheet() {
  const { openInPlayground } = useNav()
  return (
    <div>
      <PageHeader
        title="Cheatsheet"
        subtitle="L'essentiel sur une page, à relire la veille et le matin de l'entretien. Les valeurs notées « // → » dans le code sont vérifiées par les tests. Astuce : imprime la page (⌘/Ctrl + P)."
      />
      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {cheatsheet.map((s) => (
          <section key={s.id} id={s.id} className="mb-4 break-inside-avoid rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{s.title}</h2>
            {s.blocks.map((b, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">{b.title}</div>
                {b.items && (
                  <ul className="list-disc space-y-0.5 pl-4 text-[13px] leading-snug">
                    {b.items.map((it, k) => <li key={k}>{inline(it)}</li>)}
                  </ul>
                )}
                {b.code && (
                  <div className="group relative mt-1">
                    <pre className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 font-mono text-[12px] leading-relaxed text-slate-100" dangerouslySetInnerHTML={{ __html: highlightJs(b.code.trim(), b.lang) }} />
                    {b.run !== false && (
                      <button onClick={() => openInPlayground(b.code!.trim(), b.lang)} className="absolute top-1 right-1 hidden rounded bg-amber-400 px-1.5 text-[11px] font-semibold text-slate-900 group-hover:block">
                        ▶
                      </button>
                    )}
                    {b.output && <pre className="mt-1 rounded-md bg-slate-950 px-3 py-1.5 font-mono text-[12px] text-emerald-200">{b.output}</pre>}
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
