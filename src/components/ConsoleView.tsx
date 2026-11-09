import type { LogEntry } from '../lib/sandbox/runtime'

const style: Record<LogEntry['level'], string> = {
  log: 'text-slate-100',
  info: 'text-sky-200',
  debug: 'text-slate-400',
  warn: 'bg-amber-950/40 text-amber-200',
  error: 'bg-rose-950/40 text-rose-200',
  uncaught: 'bg-rose-950/60 text-rose-300 font-semibold',
  system: 'text-indigo-300 italic',
}
const icon: Partial<Record<LogEntry['level'], string>> = { warn: '⚠', error: '✖', uncaught: '✖', system: 'ℹ', info: 'ℹ' }

export type ConsoleStatus = { state: 'idle' | 'running' | 'ok' | 'timeout' | 'limit' | 'error' | 'cancelled'; ms?: number }

/** Panneau de sortie console, une ligne par appel. */
export function ConsoleView({ logs, status, onClear }: { logs: LogEntry[]; status: ConsoleStatus; onClear?: () => void }) {
  const badge = {
    idle: ['', ''],
    running: ['Exécution…', 'text-sky-300'],
    ok: [`Terminé${status.ms !== undefined ? ` en ${status.ms} ms` : ''}`, 'text-emerald-300'],
    timeout: ['Timeout : exécution interrompue (boucle infinie ?)', 'text-rose-300'],
    limit: ['Minuteurs encore actifs : arrêt forcé', 'text-amber-300'],
    error: ['Erreur du bac à sable', 'text-rose-300'],
    cancelled: ['Interrompu', 'text-slate-400'],
  }[status.state]
  return (
    <div className="flex min-h-[180px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-xs">
        <span className="font-semibold tracking-wide text-slate-400 uppercase">Console</span>
        <span className={badge[1]}>{badge[0]}</span>
        {onClear && (
          <button onClick={onClear} className="rounded px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            Effacer
          </button>
        )}
      </div>
      <div className="max-h-[60vh] flex-1 overflow-auto py-1 font-mono text-[13px] leading-relaxed">
        {logs.length === 0 && status.state !== 'running' && <div className="px-3 py-2 text-slate-500 italic">{status.state === 'idle' ? 'Lance le code (⌘/Ctrl + Entrée) pour voir la sortie.' : 'Aucune sortie.'}</div>}
        {logs.map((l, i) => (
          <div key={i} className={`flex gap-2 border-b border-slate-900 px-3 py-0.5 whitespace-pre-wrap ${style[l.level]}`}>
            <span className="w-3 shrink-0 text-center opacity-70">{icon[l.level] ?? ''}</span>
            <span className="min-w-0 break-words">{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
