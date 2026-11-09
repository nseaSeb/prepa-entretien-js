import { useState } from 'react'
import { flashcards } from '../data/flashcards'
import { themeLabel, themes } from '../data/themes'
import { useStored } from '../lib/storage'
import { KEYS, type Leitner } from '../lib/progress'
import { Button, Callout, Card, Code, PageHeader, Tag } from '../components/ui'
import { Rich } from '../components/Rich'
import { ThemeFilter } from '../components/ThemeFilter'

const DAY = 24 * 60 * 60 * 1000
/** Boîte n → délai avant la prochaine révision. Boîte 0 = jamais vue. */
const INTERVALS = [0, 0, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY]
const MAX_BOX = INTERVALS.length - 1
const boxLabel = (b: number) => (b === 0 ? 'Nouvelles' : `Boîte ${b}`)
const delayLabel = (b: number) => (b <= 1 ? 'même session' : `${INTERVALS[b] / DAY} j`)

/** Mélange de Fisher–Yates (uniforme), sur une copie. */
function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards() {
  const [boxes, setBoxes] = useStored<Leitner>(KEYS.flashcards, {})
  const [theme, setTheme] = useState('all')
  const [flipped, setFlipped] = useState(false)
  // file de la session : figée au démarrage, les cartes ratées sont remises en fin de file
  const [queue, setQueue] = useState<string[] | null>(null)
  const [reviewed, setReviewed] = useState({ ok: 0, ko: 0 })

  const pool = flashcards.filter((f) => theme === 'all' || f.theme === theme)
  const boxOf = (id: string) => boxes[id]?.box ?? 0
  const due = pool.filter((f) => (boxes[f.id]?.due ?? 0) <= Date.now())
  const counts = Object.fromEntries(themes.map((t) => [t.id, flashcards.filter((f) => f.theme === t.id).length]))
  const dist = INTERVALS.map((_, b) => pool.filter((f) => boxOf(f.id) === b).length)

  const start = (ids: string[]) => {
    // nouvelles et boîtes basses d'abord ; mélange uniforme puis tri stable par boîte (ordre aléatoire dans chaque boîte)
    const sorted = shuffle(ids).sort((a, b) => boxOf(a) - boxOf(b))
    setQueue(sorted)
    setFlipped(false)
    setReviewed({ ok: 0, ko: 0 })
  }
  const current = queue?.[0] ? flashcards.find((f) => f.id === queue[0]) : undefined

  const answer = (knew: boolean) => {
    if (!current || !queue) return
    // boîte 1 = cartes ratées (même session) ; une réussite mène au moins en boîte 2 (lendemain)
    const box = knew ? Math.min(Math.max(boxOf(current.id) + 1, 2), MAX_BOX) : 1
    setBoxes((b) => ({ ...b, [current.id]: { box, due: Date.now() + INTERVALS[box] } }))
    setReviewed((r) => (knew ? { ...r, ok: r.ok + 1 } : { ...r, ko: r.ko + 1 }))
    setQueue(knew ? queue.slice(1) : [...queue.slice(1), current.id])
    setFlipped(false)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Flashcards"
        subtitle={`${flashcards.length} cartes question/réponse avec répétition espacée (boîtes de Leitner). Une carte réussie monte d'une boîte et revient de plus en plus tard ; une carte ratée retourne en boîte 1 et revient dans la même session.`}
      />
      <ThemeFilter
        value={theme}
        onChange={(t) => {
          setTheme(t)
          setQueue(null)
        }}
        counts={counts}
      />

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {dist.map((n, b) => (
            <div key={b} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/60">
              <div className="text-xl font-bold text-slate-900 dark:text-white">{n}</div>
              <div className="text-xs text-slate-500">{boxLabel(b)}</div>
              <div className="text-[10px] text-slate-400">{b > 0 && delayLabel(b)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" disabled={due.length === 0} onClick={() => start(due.map((f) => f.id))}>
            Réviser les cartes du jour ({due.length})
          </Button>
          <Button onClick={() => start(pool.map((f) => f.id))}>Tout réviser ({pool.length})</Button>
          <Button onClick={() => confirm('Remettre toutes les cartes dans la boîte « Nouvelles » ?') && (setBoxes({}), setQueue(null))}>Réinitialiser</Button>
        </div>
      </Card>

      {queue && !current && (
        <Callout tone="tip" title="Session terminée">
          {reviewed.ok} réponse(s) sue(s), {reviewed.ko} à revoir. Reviens demain : les cartes réapparaîtront selon leur boîte.
        </Callout>
      )}

      {current && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              {queue!.length} carte(s) restante(s) · {reviewed.ok} ✓ · {reviewed.ko} ✗
            </span>
            <span className="flex gap-2">
              <Tag color="sky">{themeLabel(current.theme)}</Tag>
              <Tag>{boxLabel(boxOf(current.id))}</Tag>
            </span>
          </div>
          <Card className="min-h-[220px]">
            <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Question</div>
            <Rich text={current.front} className="mt-1 text-lg font-medium" />
            {!flipped ? (
              <div className="mt-8 text-center">
                <Button variant="primary" onClick={() => setFlipped(true)}>
                  Retourner la carte
                </Button>
                <p className="mt-2 text-xs text-slate-500">Formule ta réponse à voix haute avant de retourner.</p>
              </div>
            ) : (
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Réponse</div>
                <Rich text={current.back} className="mt-1 text-[15px]" />
                {current.code && <Code code={current.code} output={current.output} run={current.run !== false} />}
                <div className="mt-5 flex justify-center gap-3">
                  <Button onClick={() => answer(false)}>✗ À revoir</Button>
                  <Button variant="success" onClick={() => answer(true)}>
                    ✓ Je savais
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
