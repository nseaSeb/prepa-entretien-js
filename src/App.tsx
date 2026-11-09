import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_CODE, NavContext, parseHash, type Page } from './lib/nav'
import { useStored } from './lib/storage'
import Home from './pages/Home'

const Method = lazy(() => import('./pages/Method'))
const Lessons = lazy(() => import('./pages/Lessons'))
const Lexicon = lazy(() => import('./pages/Lexicon'))
const Cheatsheet = lazy(() => import('./pages/Cheatsheet'))
const Pieges = lazy(() => import('./pages/Pieges'))
const Playground = lazy(() => import('./pages/Playground'))
const Katas = lazy(() => import('./pages/Katas'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Interview = lazy(() => import('./pages/Interview'))

const pages: { id: Page; label: string; icon: string }[] = [
  { id: 'accueil', label: 'Accueil', icon: '⌂' },
  { id: 'methode', label: 'Méthode', icon: '⇢' },
  { id: 'cours', label: 'Cours', icon: '◧' },
  { id: 'lexique', label: 'Lexique', icon: 'Aa' },
  { id: 'cheatsheet', label: 'Cheatsheet', icon: '⌕' },
  { id: 'pieges', label: 'Pièges', icon: '⚠' },
  { id: 'playground', label: 'Playground', icon: '▶' },
  { id: 'katas', label: 'Katas', icon: '◉' },
  { id: 'quiz', label: 'Auto-évaluation', icon: '✓' },
  { id: 'flashcards', label: 'Flashcards', icon: '❐' },
  { id: 'entretien', label: 'Entretien', icon: '☺' },
]

const pageIds = pages.map((p) => p.id)
const readHash = () => parseHash(location.hash, pageIds)

/** Une page qui plante affiche un message au lieu de vider toute l'application. */
class PageBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
        <div className="font-semibold">Cette page a rencontré une erreur.</div>
        <div className="mt-1 font-mono text-xs">{this.state.error.message}</div>
        <button className="mt-3 rounded bg-rose-600 px-3 py-1 text-sm text-white" onClick={() => this.setState({ error: null })}>
          Réessayer
        </button>
      </div>
    )
  }
}

export default function App() {
  const [page, setPage] = useState<Page>(() => readHash()[0])
  const [code, setCode] = useStored('playground:code', DEFAULT_CODE)

  useEffect(() => {
    const onHash = () => {
      const [p, anchor] = readHash()
      setPage(p)
      if (!anchor) return window.scrollTo({ top: 0 })
      // la page peut être chargée à la demande : on réessaie le temps qu'elle apparaisse
      let tries = 0
      const scroll = () => {
        const el = document.getElementById(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
        else if (tries++ < 20) setTimeout(scroll, 50)
      }
      scroll()
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const label = pages.find((p) => p.id === page)?.label
    document.title = page === 'accueil' ? 'JS — prépa entretien' : `${label} · JS — prépa entretien`
  }, [page])

  const go = useCallback((p: Page, anchor?: string) => {
    location.hash = anchor ? `${p}/${anchor}` : p
  }, [])
  const openInPlayground = useCallback(
    (s: string) => {
      setCode(s)
      go('playground')
    },
    [go, setCode],
  )

  return (
    <NavContext.Provider value={{ page, go, openInPlayground }}>
      <div className="flex min-h-full flex-col md:flex-row">
        <nav className="sticky top-0 z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur md:h-screen md:w-56 md:flex-col md:border-r md:border-b-0 md:px-3 md:py-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-6 hidden px-3 md:block">
            <div className="text-lg font-bold tracking-tight">
              <span className="rounded bg-amber-300 px-1.5 text-slate-900">JS</span> prépa entretien
            </div>
            <div className="mt-1 text-xs text-slate-500">JavaScript · ES2023 · local</div>
          </div>
          {pages.map((p) => (
            <button key={p.id} onClick={() => go(p.id)} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${page === p.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
              <span className="w-4 text-center">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-8 md:px-10">
          <PageBoundary key={page}>
          <Suspense fallback={<div className="text-slate-400">Chargement…</div>}>
            {page === 'accueil' && <Home />}
            {page === 'methode' && <Method />}
            {page === 'cours' && <Lessons />}
            {page === 'lexique' && <Lexicon />}
            {page === 'cheatsheet' && <Cheatsheet />}
            {page === 'pieges' && <Pieges />}
            {page === 'playground' && <Playground code={code} setCode={setCode} />}
            {page === 'katas' && <Katas />}
            {page === 'quiz' && <Quiz />}
            {page === 'flashcards' && <Flashcards />}
            {page === 'entretien' && <Interview />}
          </Suspense>
          </PageBoundary>
        </main>
      </div>
    </NavContext.Provider>
  )
}
