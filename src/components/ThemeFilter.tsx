import { themes } from '../data/themes'

/** Filtre par thème (pastilles), avec le nombre d'éléments par thème. */
export function ThemeFilter({ value, onChange, counts }: { value: string; onChange: (v: string) => void; counts: Record<string, number> }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1.5">
      {[{ id: 'all', label: 'Tous' }, ...themes].filter((t) => t.id === 'all' || counts[t.id]).map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${value === t.id ? 'bg-indigo-600 text-white ring-indigo-600' : 'text-slate-600 ring-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'}`}
        >
          {t.label} {t.id !== 'all' && <span className="opacity-60">{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  )
}
