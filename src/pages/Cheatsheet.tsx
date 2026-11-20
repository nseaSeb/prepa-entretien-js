import { useEffect, useMemo, useRef, useState } from 'react'
import { cheatsheet } from '../data/cheatsheet'
import type { CheatBlock, CheatSection } from '../data/types'
import { highlightJs } from '../lib/highlight'
import { useNav } from '../lib/nav'
import { Callout, Code, PageHeader, Tag } from '../components/ui'
import { inline, Rich } from '../components/Rich'

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function blockText(b: CheatBlock) {
  const d = b.detail
  const examples = (d?.examples ?? []).flatMap((e) => [e.title ?? '', e.code, e.output ?? ''])
  return fold([b.title, ...(b.items ?? []), b.code ?? '', b.output ?? '', d?.signature ?? '', d?.returns ?? '', d?.explain ?? '', d?.pitfall ?? '', ...examples].join('\n'))
}

type Open = { section: CheatSection; block: CheatBlock }

export default function Cheatsheet() {
  const { openInPlayground } = useNav()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Open | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || e.isComposing || openRef.current) return
      const t = e.target
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      if (!typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Les blocs non trouvés sont masqués à l'écran seulement : l'impression et les ancres restent complètes.
  const visible = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return null
    const set = new Set<CheatBlock>()
    for (const s of cheatsheet) for (const b of s.blocks) if (fold(s.title).includes(q) || blockText(b).includes(q)) set.add(b)
    return set
  }, [query])
  const shown = (b: CheatBlock) => !visible || visible.has(b)

  return (
    <div>
      <PageHeader
        title="Cheatsheet"
        subtitle="L'essentiel sur une page, à relire la veille et le matin de l'entretien. Les valeurs notées « // → » dans le code sont vérifiées par les tests. Clique sur un titre marqué › pour ouvrir sa fiche détaillée. Astuce : imprime la page (⌘/Ctrl + P)."
      />
      <div className="mb-4 print:hidden">
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une méthode, un concept… (ex. split, padStart, this)   —   raccourci : /"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-900"
        />
        {visible?.size === 0 && <p className="mt-2 text-sm text-slate-500">Aucun résultat pour « {query} ».</p>}
      </div>
      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {cheatsheet.map((s) => (
          <section key={s.id} id={s.id} className={`${s.blocks.some(shown) ? '' : 'hidden print:block'} mb-4 break-inside-avoid rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
            <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{s.title}</h2>
            {s.blocks.map((b, i) => (
              <div key={`${i}-${b.title}`} className={`${shown(b) ? '' : 'hidden print:block'} mb-3 last:mb-0`}>
                {b.detail ? (
                  <button
                    onClick={() => setOpen({ section: s, block: b })}
                    title="Ouvrir la fiche détaillée"
                    className="mb-1 text-left text-xs font-semibold tracking-wide text-indigo-700 uppercase hover:underline dark:text-indigo-300"
                  >
                    {b.title} <span aria-hidden>›</span>
                  </button>
                ) : (
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">{b.title}</div>
                )}
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
      {open && <DetailPanel {...open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function DetailPanel({ section, block, onClose }: Open & { onClose: () => void }) {
  const { go } = useNav()
  const d = block.detail!
  const asideRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Modale : focus initial, Tab piégé dans le panneau, page figée, focus rendu à l'ouvreur.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !asideRef.current) return
      const items = asideRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => {
      document.removeEventListener('keydown', onTab)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex justify-end print:hidden" role="dialog" aria-modal="true" aria-label={block.title}>
      <div className="absolute inset-0 bg-slate-950/50" onClick={onClose} />
      <aside ref={asideRef} className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{section.title}</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{block.title}</h2>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Fermer" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            ✕
          </button>
        </div>
        {d.mutates !== undefined && (
          <div className="mb-3">
            {d.mutates ? <Tag color="rose">Modifie l'original</Tag> : <Tag color="emerald">Ne modifie pas l'original</Tag>}
          </div>
        )}
        {d.signature && <pre className="overflow-x-auto rounded-md bg-slate-100 px-3 py-2 font-mono text-[13px] text-slate-800 dark:bg-slate-800 dark:text-slate-100">{d.signature}</pre>}
        {d.returns && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">Renvoie : </span>
            {inline(d.returns)}
          </p>
        )}
        <Rich text={d.explain} className="mt-3 text-sm" />
        {d.examples?.map((ex, i) => <Code key={i} code={ex.code} title={ex.title} output={ex.output} run={ex.run !== false} lang={ex.lang} />)}
        {d.pitfall && (
          <Callout tone="danger" title="Piège">
            {inline(d.pitfall)}
          </Callout>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {section.theme && (
            <button
              onClick={() => {
                onClose()
                go('cours', section.theme)
              }}
              className="text-indigo-700 hover:underline dark:text-indigo-300"
            >
              Voir le cours →
            </button>
          )}
          {d.mdn && (
            <a href={d.mdn} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline dark:text-indigo-300">
              Documentation MDN ↗
            </a>
          )}
        </div>
      </aside>
    </div>
  )
}
