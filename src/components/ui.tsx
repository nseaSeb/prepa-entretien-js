import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNav } from '../lib/nav'
import { highlightJs } from '../lib/highlight'

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">{subtitle}</p>}
      {children}
    </header>
  )
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-10 mb-3 scroll-mt-6 text-xl font-semibold text-slate-900 dark:text-white">
      {children}
    </h2>
  )
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return <h3 id={id} className="mt-6 mb-2 scroll-mt-6 font-semibold text-slate-900 dark:text-white">{children}</h3>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-3 leading-relaxed">{children}</p>
}

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </div>
  )
}

const tones = {
  info: 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100',
  tip: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
  warn: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
  danger: 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100',
  mnemo: 'border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100',
}

export function Callout({ tone = 'info', title, children }: { tone?: keyof typeof tones; title?: string; children: ReactNode }) {
  return (
    <div className={`my-4 rounded-lg border-l-4 px-4 py-3 ${tones[tone]}`}>
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export type TagColor = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet'
export function Tag({ children, color = 'slate' }: { children: ReactNode; color?: TagColor }) {
  const c = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
  }[color]
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${c}`}>{children}</span>
}

/** Code inline */
export function C({ children }: { children: ReactNode }) {
  return <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">{children}</code>
}

const trimCode = (code: string) => code.replace(/^\n+|\s+$/g, '')

/**
 * Bloc JS coloré. Bouton « Copier », et « ▶ Playground » qui l'ouvre dans le playground.
 * `output` : sortie console attendue (vérifiée par les tests), affichée sous le code.
 */
export function Code({ code, title, output, run = true, showOutput = true, lang = 'js', lineNumbers = false }: { code: string; title?: string; output?: string; run?: boolean; showOutput?: boolean; lang?: 'js' | 'ts'; lineNumbers?: boolean }) {
  const { openInPlayground } = useNav()
  const [copied, setCopied] = useState(false)
  const src = trimCode(code)
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-slate-100 dark:border-slate-700">
      {(title || lang === 'ts') && (
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-400">
          {lang === 'ts' && <span className="rounded bg-sky-700 px-1.5 font-semibold text-white">TS</span>}
          {title}
        </div>
      )}
      {lineNumbers ? (
        <div className="flex">
          <pre aria-hidden className="py-3 pr-1 pl-3 text-right font-mono text-[13px] leading-relaxed text-slate-600 select-none">
            {src.split('\n').map((_, i) => `${i + 1}\n`).join('')}
          </pre>
          <pre className="min-w-0 flex-1 overflow-x-auto px-3 py-3 font-mono text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightJs(src, lang) }} />
        </div>
      ) : (
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightJs(src, lang) }} />
      )}
      {output !== undefined && showOutput && <OutputBox text={output} />}
      <div className="flex justify-end gap-2 border-t border-slate-800 px-3 py-1.5">
        <button
          className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          onClick={() => {
            navigator.clipboard?.writeText(src)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? 'Copié ✓' : 'Copier'}
        </button>
        {run && (
          <button className="rounded bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-slate-900 hover:bg-amber-300" onClick={() => openInPlayground(src, lang)}>
            ▶ Playground
          </button>
        )}
      </div>
    </div>
  )
}

/** Sortie console (texte brut, une ligne par entrée). */
export function OutputBox({ text, label = 'Sortie console' }: { text: string; label?: string }) {
  return (
    <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2">
      <div className="mb-1 text-[11px] tracking-wide text-slate-500 uppercase">{label}</div>
      <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre text-emerald-200">
        {text.split('\n').map((l, i) => (
          <div key={i} className={l.startsWith('Uncaught') ? 'text-rose-300' : ''}>
            {l || ' '}
          </div>
        ))}
      </pre>
    </div>
  )
}

/** Contenu masqué (indice, solution) */
export function Reveal({ label, children, tone = 'slate' }: { label: string; children: ReactNode; tone?: 'slate' | 'amber' | 'emerald' }) {
  const [open, setOpen] = useState(false)
  const c = { slate: 'border-slate-300 dark:border-slate-700', amber: 'border-amber-300 dark:border-amber-800', emerald: 'border-emerald-300 dark:border-emerald-800' }[tone]
  return (
    <div className={`my-3 rounded-lg border border-dashed ${c}`}>
      <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium" onClick={() => setOpen(!open)}>
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
        {label}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

export function Button({ children, onClick, variant = 'ghost', disabled, title }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'success'; disabled?: boolean; title?: string }) {
  const v = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50',
    ghost: 'text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50',
  }[variant]
  return (
    <button title={title} disabled={disabled} onClick={onClick} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${v}`}>
      {children}
    </button>
  )
}

/** Barre de progression simple. */
export function Bar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max ? Math.round((100 * value) / max) : 0
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value ? Math.max(pct, 3) : 0}%` }} />
    </div>
  )
}
