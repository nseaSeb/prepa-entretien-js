import { useState } from 'react'
import { quiz } from '../data/quiz'
import { themeLabel, themes } from '../data/themes'
import type { QuizItem, QuizKind } from '../data/types'
import { useStored } from '../lib/storage'
import { KEYS } from '../lib/progress'
import { useNav } from '../lib/nav'
import { Bar, Button, Callout, Card, Code, PageHeader, Tag, type TagColor } from '../components/ui'
import { Rich } from '../components/Rich'
import { ThemeFilter } from '../components/ThemeFilter'

const kindLabel: Record<QuizKind, [string, TagColor]> = {
  qcm: ['QCM', 'indigo'],
  output: ["Qu'affiche ce code ?", 'sky'],
  bug: ['Trouve le bug', 'rose'],
  compile: ['Ce code compile-t-il ?', 'amber'],
  type: ['Quel type est inféré ?', 'violet'],
}

function Question({ q, n, picked, onPick, onRetry }: { q: QuizItem; n: number; picked: number | undefined; onPick: (i: number) => void; onRetry: () => void }) {
  const { go } = useNav()
  const done = picked !== undefined
  const [kl, kc] = kindLabel[q.kind]
  const mono = q.kind === 'output' || q.kind === 'type'
  const ts = q.lang === 'ts' || q.kind === 'compile' || q.kind === 'type'
  return (
    <Card id={q.id}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-slate-400">#{n}</span>
        <Tag color={kc}>{kl}</Tag>
        <Tag>{themeLabel(q.theme)}</Tag>
        {done && (
          <button onClick={onRetry} className="ml-auto text-slate-500 hover:text-indigo-600 hover:underline">
            Réessayer
          </button>
        )}
      </div>
      <p className="mt-2 font-medium">{q.q}</p>
      {q.code && <Code code={q.code} run={done} lang={ts ? 'ts' : 'js'} lineNumbers={q.kind === 'compile'} />}
      <div className="mt-3 grid gap-2">
        {q.choices.map((c, j) => {
          const isAnswer = j === q.answer
          const style = !done
            ? 'ring-slate-200 hover:bg-indigo-50 hover:ring-indigo-300 dark:ring-slate-700 dark:hover:bg-slate-800'
            : isAnswer
              ? 'bg-emerald-50 ring-emerald-400 dark:bg-emerald-950/40 dark:ring-emerald-700'
              : j === picked
                ? 'bg-rose-50 ring-rose-400 dark:bg-rose-950/40 dark:ring-rose-700'
                : 'opacity-50 ring-slate-200 dark:ring-slate-800'
          return (
            <button key={j} disabled={done} onClick={() => onPick(j)} className={`flex items-start rounded-lg px-3 py-2 text-left text-sm ring-1 transition ${style}`}>
              <span className="mt-0.5 mr-3 font-mono text-xs text-slate-400">{String.fromCharCode(65 + j)}</span>
              <span className={`flex-1 ${mono ? 'font-mono text-[13px] whitespace-pre-wrap' : ''}`}>{c}</span>
              {done && isAnswer && <span className="ml-2">✓</span>}
              {done && j === picked && !isAnswer && <span className="ml-2">✗</span>}
            </button>
          )
        })}
      </div>
      {done && (
        <Callout tone={picked === q.answer ? 'tip' : 'warn'} title={picked === q.answer ? 'Exact' : 'Pas tout à fait'}>
          <Rich text={q.why} />
          <button className="mt-1 underline" onClick={() => go('cours', q.theme)}>
            → cours : {themeLabel(q.theme)}
          </button>
        </Callout>
      )}
    </Card>
  )
}

export default function Quiz() {
  const [answers, setAnswers] = useStored<Record<string, number>>(KEYS.quiz, {})
  const [theme, setTheme] = useState('all')
  const [kind, setKind] = useState<'all' | QuizKind>('all')
  const [mode, setMode] = useState<'all' | 'todo' | 'errors'>('all')
  // liste figée à l'entrée du mode : une question réussie reste affichée avec son explication
  const [errorIds, setErrorIds] = useState<string[]>([])
  const { go } = useNav()

  const isWrong = (q: QuizItem) => answers[q.id] !== undefined && answers[q.id] !== q.answer
  const stats = themes.map((t) => {
    const qs = quiz.filter((q) => q.theme === t.id)
    const done = qs.filter((q) => answers[q.id] !== undefined)
    const ok = done.filter((q) => answers[q.id] === q.answer)
    return { ...t, total: qs.length, done: done.length, ok: ok.length }
  })
  const answered = quiz.filter((q) => answers[q.id] !== undefined).length
  const good = quiz.filter((q) => answers[q.id] === q.answer).length
  const errors = quiz.filter(isWrong).length
  const weak = stats.filter((s) => s.done > 0 && s.ok / s.done < 0.67)

  const counts = Object.fromEntries(themes.map((t) => [t.id, quiz.filter((q) => q.theme === t.id).length]))
  const list = quiz.filter(
    (q) =>
      (theme === 'all' || q.theme === theme) &&
      (kind === 'all' || q.kind === kind) &&
      (mode === 'all' || (mode === 'todo' && answers[q.id] === undefined) || (mode === 'errors' && errorIds.includes(q.id))),
  )
  const retry = (id: string) =>
    setAnswers((a) => {
      const { [id]: _, ...rest } = a
      void _
      return rest
    })

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Auto-évaluation"
        subtitle={`${quiz.length} questions sur les ${themes.length} thèmes du cours : QCM, « qu'affiche ce code ? » (sorties vérifiées automatiquement), « trouve le bug » et, pour TypeScript, « ce code compile-t-il ? » et « quel type est inféré ? » (réponses vérifiées par le compilateur). Réponds sans exécuter le code, lis l'explication, puis repasse sur tes erreurs.`}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{good}</span>
            <span className="text-slate-500"> / {answered} bonnes réponses</span>
            <span className="ml-3 text-sm text-slate-500">
              ({answered}/{quiz.length} répondues{answered > 0 && `, ${Math.round((100 * good) / answered)} %`})
            </span>
          </div>
          <Button onClick={() => confirm('Effacer toutes tes réponses ?') && setAnswers({})}>Remettre à zéro</Button>
        </div>
        <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {stats
            .filter((s) => s.total)
            .map((s) => {
              const pct = s.done ? Math.round((100 * s.ok) / s.done) : 0
              const color = !s.done ? 'bg-slate-300 dark:bg-slate-700' : pct >= 67 ? 'bg-emerald-500' : pct >= 34 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={s.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="text-xs text-slate-500">
                      {s.ok}/{s.done} {s.done < s.total && `· ${s.total - s.done} restante(s)`}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Bar value={s.done ? s.ok : 0} max={s.done || 1} color={color} />
                  </div>
                </div>
              )
            })}
        </div>
        {weak.length > 0 && (
          <Callout tone="warn" title="À réviser en priorité">
            {weak.map((w, i) => (
              <span key={w.id}>
                {i > 0 && ', '}
                <button className="font-semibold underline" onClick={() => go('cours', w.id)}>
                  {w.label}
                </button>{' '}
                ({w.ok}/{w.done})
              </span>
            ))}
          </Callout>
        )}
      </Card>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(
          [
            ['all', 'Toutes'],
            ['todo', 'Non répondues'],
            ['errors', `Revoir mes erreurs (${errors})`],
          ] as const
        ).map(([m, label]) => (
          <Button
            key={m}
            variant={mode === m ? 'primary' : 'ghost'}
            onClick={() => {
              if (m === 'errors') setErrorIds(quiz.filter(isWrong).map((q) => q.id))
              setMode(m)
            }}
          >
            {label}
          </Button>
        ))}
        <select value={kind} onChange={(e) => setKind(e.target.value as 'all' | QuizKind)} className="ml-auto rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="all">Tous les types</option>
          <option value="qcm">QCM</option>
          <option value="output">Qu'affiche ce code ?</option>
          <option value="bug">Trouve le bug</option>
          <option value="compile">Ce code compile-t-il ? (TS)</option>
          <option value="type">Quel type est inféré ? (TS)</option>
        </select>
      </div>
      <ThemeFilter value={theme} onChange={setTheme} counts={counts} />

      {mode === 'errors' && list.length > 0 && (
        <Callout tone="info" title="Mode révision">
          Relis l'explication de chaque erreur, puis clique sur « Réessayer » pour reposer la question. La liste est figée à l'ouverture de ce mode : reclique sur « Revoir mes erreurs » pour la mettre à jour.
        </Callout>
      )}
      {list.length === 0 && <p className="text-slate-500">{mode === 'errors' ? 'Aucune erreur à revoir avec ces filtres. Bravo !' : 'Aucune question avec ces filtres.'}</p>}
      <div className="space-y-5">
        {list.map((q) => (
          <Question key={q.id} q={q} n={quiz.indexOf(q) + 1} picked={answers[q.id]} onPick={(j) => setAnswers({ ...answers, [q.id]: j })} onRetry={() => retry(q.id)} />
        ))}
      </div>
    </div>
  )
}
