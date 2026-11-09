import type { Diag } from '../lib/ts/client'

export type DiagState = 'idle' | 'loading' | 'ok' | 'error'

/** Panneau des diagnostics du compilateur TypeScript. */
export function DiagnosticsView({ diagnostics, state, error, onRetry }: { diagnostics: Diag[]; state: DiagState; error?: string | null; onRetry?: () => void }) {
  const errors = diagnostics.filter((d) => d.category === 'error')
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100 dark:border-slate-700" data-testid="ts-diagnostics">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-xs">
        <span className="font-semibold tracking-wide text-slate-400 uppercase">Compilateur TypeScript</span>
        <span className={state === 'loading' ? 'text-sky-300' : errors.length || state === 'error' ? 'text-rose-300' : 'text-emerald-300'}>
          {state === 'loading' ? 'Vérification…' : state === 'error' ? 'Indisponible' : state === 'idle' ? '' : errors.length ? `${errors.length} erreur${errors.length > 1 ? 's' : ''} de type` : '✓ Aucune erreur de type'}
        </span>
      </div>
      <div className="max-h-56 overflow-y-auto px-3 py-2 font-mono text-[12.5px] leading-relaxed">
        {state === 'error' && (
          <div className="flex flex-wrap items-center gap-2 text-rose-300">
            <span>{error}</span>
            {onRetry && (
              <button onClick={onRetry} className="rounded bg-slate-800 px-2 py-0.5 font-sans text-xs text-slate-100 hover:bg-slate-700">
                Réessayer
              </button>
            )}
          </div>
        )}
        {state === 'idle' && <div className="text-slate-500 italic">Le compilateur se charge à la première vérification (quelques secondes).</div>}
        {state !== 'error' && diagnostics.length === 0 && state === 'ok' && <div className="text-slate-500">strict: true · target ES2022 · lib es2022 + dom</div>}
        {diagnostics.map((d, i) => (
          <div key={i} className={`py-0.5 ${d.category === 'error' ? 'text-rose-300' : 'text-amber-200'}`}>
            <span className="text-slate-500">{d.line ? `ligne ${d.line}:${d.col}` : 'global'}</span> <span className="text-slate-400">TS{d.code}</span> {d.message}
          </div>
        ))}
      </div>
    </div>
  )
}
