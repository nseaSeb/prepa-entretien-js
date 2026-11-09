import { useNav, type Page } from '../lib/nav'
import { useStored } from '../lib/storage'
import { KEYS, type Leitner } from '../lib/progress'
import { Bar, Card, PageHeader, Tag } from '../components/ui'
import { quiz } from '../data/quiz'
import { katas } from '../data/katas'
import { flashcards } from '../data/flashcards'
import { pieges } from '../data/pieges'
import { cours } from '../data/cours'

const plan: { what: string; page: Page; duration: string }[] = [
  { what: 'Auto-évaluation : faire un premier passage pour repérer tes thèmes faibles', page: 'quiz', duration: '30 min' },
  { what: 'Méthode : relire comment raisonner à voix haute et dérouler un live coding', page: 'methode', duration: '15 min' },
  { what: 'Cours : reprendre en priorité les thèmes où le quiz a été le plus dur', page: 'cours', duration: '1 h' },
  { what: 'Pièges : deviner chaque sortie avant de la révéler', page: 'pieges', duration: '30 min' },
  { what: 'Katas : debounce, deepClone, Promise.all, puis les autres, chrono en main', page: 'katas', duration: '2 h' },
  { what: 'Flashcards : une session par jour, les cartes ratées reviennent plus vite', page: 'flashcards', duration: '10 min/j' },
  { what: 'Entretien : rédiger tes réponses aux questions classiques, puis les dire à voix haute', page: 'entretien', duration: '1 h' },
  { what: 'Cheatsheet : relecture la veille et le matin même', page: 'cheatsheet', duration: '15 min' },
]

function Stat({ label, value, max, page, color, detail }: { label: string; value: number; max: number; page: Page; color: string; detail?: string }) {
  const { go } = useNav()
  return (
    <button onClick={() => go(page)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 mb-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        <span className="text-slate-500"> / {max}</span>
      </div>
      <Bar value={value} max={max} color={color} />
      {detail && <div className="mt-2 text-xs text-slate-500">{detail}</div>}
    </button>
  )
}

export default function Home() {
  const { go } = useNav()
  const [done, setDone] = useStored<number[]>('home:plan', [])
  const [answers] = useStored<Record<string, number>>(KEYS.quiz, {})
  const [solved] = useStored<Record<string, boolean>>(KEYS.katas, {})
  const [boxes] = useStored<Leitner>(KEYS.flashcards, {})
  const [seen] = useStored<string[]>(KEYS.pieges, [])
  const [read] = useStored<string[]>(KEYS.cours, [])

  const answered = quiz.filter((q) => answers[q.id] !== undefined)
  const good = answered.filter((q) => answers[q.id] === q.answer).length
  const mastered = flashcards.filter((f) => (boxes[f.id]?.box ?? 0) >= 4).length
  const due = flashcards.filter((f) => (boxes[f.id]?.due ?? 0) <= Date.now()).length

  return (
    <>
      <PageHeader
        title="Prépa entretien JavaScript & TypeScript"
        subtitle="Tout ce qu'il faut pour aborder sereinement un entretien technique front-end ou JavaScript : les fondamentaux expliqués (JavaScript puis TypeScript, vérifié par le vrai compilateur), les pièges classiques, des exercices de live coding corrigés automatiquement et des questions d'entretien avec des pistes de réponse. Tout fonctionne en local, ta progression reste dans ce navigateur."
      />

      <h2 className="mb-3 text-lg font-semibold">Ta progression</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Cours lus" value={cours.filter((c) => read.includes(c.id)).length} max={cours.length} page="cours" color="bg-sky-500" />
        <Stat label="Quiz répondus" value={answered.length} max={quiz.length} page="quiz" color="bg-indigo-500" detail={answered.length ? `${good} bonnes réponses (${Math.round((100 * good) / answered.length)} %)` : 'Pas encore commencé'} />
        <Stat label="Katas réussis" value={katas.filter((k) => solved[k.id]).length} max={katas.length} page="katas" color="bg-emerald-500" />
        <Stat label="Flashcards maîtrisées" value={mastered} max={flashcards.length} page="flashcards" color="bg-violet-500" detail={`${due} carte(s) à revoir aujourd'hui`} />
        <Stat label="Pièges vus" value={pieges.filter((p) => seen.includes(p.id)).length} max={pieges.length} page="pieges" color="bg-amber-500" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-1 text-lg font-semibold">Plan de révision conseillé</h2>
          <p className="mb-4 text-sm text-slate-500">Coche au fur et à mesure. L'ordre compte : on diagnostique d'abord, on comble ensuite, on s'entraîne enfin en conditions réelles.</p>
          <ol className="space-y-2">
            {plan.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <input type="checkbox" checked={done.includes(i)} onChange={() => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i])} className="h-4 w-4 shrink-0 accent-indigo-600" />
                <button onClick={() => go(p.page)} className={`flex-1 text-left text-sm hover:text-indigo-600 ${done.includes(i) ? 'text-slate-400 line-through' : ''}`}>
                  {p.what}
                </button>
                <Tag>{p.duration}</Tag>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Comment utiliser l'application</h2>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <strong>Chaque bloc de code</strong> a un bouton <Tag color="amber">▶ Playground</Tag> : il ouvre l'extrait dans l'éditeur, où tu peux le modifier et l'exécuter. Le code tourne dans un Web Worker isolé : une boucle infinie est coupée au bout de quelques secondes sans bloquer l'onglet.
            </li>
            <li>
              <strong>Les sorties affichées sont vérifiées</strong> : chaque réponse « qu'affiche ce code ? », chaque piège et chaque kata est rejoué par la suite de tests (<code>npm test</code>). Les messages d'erreur suivent la formulation de V8 (Chrome, Node).
            </li>
            <li>
              <strong>Devine avant de révéler.</strong> Le bénéfice vient de l'effort de prédiction : formule ta réponse à voix haute, comme en entretien, puis compare.
            </li>
            <li>
              <strong>Ta progression</strong> (réponses, katas réussis, boîtes de Leitner, brouillons) est stockée dans le <code>localStorage</code> de ce navigateur.
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['cours', 'Cours', `${cours.length} fondamentaux, avec mnémos et pièges`],
            ['katas', 'Katas', `${katas.length} exercices de live coding testés`],
            ['quiz', 'Auto-évaluation', `${quiz.length} questions, mode « revoir mes erreurs »`],
            ['entretien', 'Entretien', 'Questions classiques et frameworks'],
          ] as [Page, string, string][]
        ).map(([page, t, d]) => (
          <button key={page} onClick={() => go(page)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="font-semibold">{t}</div>
            <div className="mt-1 text-sm text-slate-500">{d}</div>
          </button>
        ))}
      </div>
    </>
  )
}
