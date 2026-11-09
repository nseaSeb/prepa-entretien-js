import { useEffect, useRef } from 'react'
import { JsEditor } from '../components/JsEditor'
import { ConsoleView } from '../components/ConsoleView'
import { DiagnosticsView } from '../components/DiagnosticsView'
import { Button, Callout, PageHeader, C } from '../components/ui'
import { DEFAULT_CODE, type Lang } from '../lib/nav'
import { TS_EXAMPLES } from '../data/playgroundTs'
import { useRunner } from '../lib/useRunner'
import { useTsCheck } from '../lib/useTsCheck'

const EXAMPLES: [string, string][] = [
  ['Event loop', DEFAULT_CODE],
  [
    'async / await',
    `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms))

async function main() {
  console.log('avant')
  const [a, b] = await Promise.all([wait(200, 'A'), wait(100, 'B')])
  console.log(a, b)
  try {
    await Promise.reject(new Error('oups'))
  } catch (e) {
    console.error('attrapée :', e.message)
  }
}
main()
console.log('main() rend la main tout de suite')`,
  ],
  [
    'this',
    `const user = {
  first: 'Ada',
  hello() { return 'Bonjour ' + this.first },
}
const detached = user.hello
console.log(user.hello())
console.log(detached()) // this = globalThis : first est undefined
console.log(detached.call({ first: 'Grace' }))`,
  ],
  ['Boucle infinie', `console.log('je vais boucler…')\nwhile (true) {}`],
  [
    'Formatage',
    `console.log([1, 'a', null, undefined, [2, [3]]])
console.log({ id: 1, tags: new Set(['js']), meta: new Map([['k', 'v']]) })
console.warn('un avertissement')
console.error(new TypeError('une erreur'))
undefinedFunction()`,
  ],
]

export default function Playground({ code, setCode, tsCode, setTsCode, lang, setLang }: { code: string; setCode: (c: string) => void; tsCode: string; setTsCode: (c: string) => void; lang: Lang; setLang: (l: Lang) => void }) {
  const { logs, status, run, clear, notice } = useRunner()
  const isTs = lang === 'ts'
  const ts = useTsCheck(tsCode, isTs)
  const current = isTs ? tsCode : code
  const setCurrent = isTs ? setTsCode : setCode
  const examples = isTs ? TS_EXAMPLES : EXAMPLES
  // une nouvelle exécution annule la compilation TS précédente encore en cours
  const compiling = useRef<AbortController | null>(null)
  useEffect(() => () => compiling.current?.abort(), [])
  const exec = async () => {
    if (!isTs) return run(code)
    compiling.current?.abort()
    const ctrl = new AbortController()
    compiling.current = ctrl
    const r = await ts.compile(tsCode, ctrl.signal)
    if (ctrl.signal.aborted) return
    compiling.current = null
    if (r.js !== null) run(r.js)
    else notice(`Rien n'a été exécuté. ${r.reason ?? 'Le code TypeScript n’a pas pu être transpilé.'}`)
  }
  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Un éditeur JavaScript ou TypeScript et une console. Le code s'exécute dans un Web Worker isolé, comme un script classique : la console capture log, warn et error, les minuteurs et promesses sont attendus, et une boucle infinie est interrompue sans geler l'onglet. En TypeScript, le compilateur vérifie les types au fil de la frappe, puis le code transpilé s'exécute. Ton code est conservé dans ce navigateur, pour chaque langage."
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="mr-2 inline-flex overflow-hidden rounded-md ring-1 ring-slate-300 dark:ring-slate-700" role="group" aria-label="Langage">
          {(['js', 'ts'] as const).map((l) => (
            <button
              key={l}
              aria-pressed={lang === l}
              onClick={() => {
                setLang(l)
                clear()
              }}
              className={`px-3 py-1.5 text-sm font-semibold ${lang === l ? (l === 'ts' ? 'bg-sky-600 text-white' : 'bg-amber-400 text-slate-900') : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {l === 'js' ? 'JavaScript' : 'TypeScript'}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={exec} disabled={status.state === 'running'}>
          ▶ Exécuter <span className="ml-1 text-xs opacity-70">⌘/Ctrl + Entrée</span>
        </Button>
        <span className="ml-2 text-sm text-slate-500">Exemples :</span>
        {examples.map(([label, src]) => (
          <button key={label} onClick={() => setCurrent(src)} className="rounded-md px-2 py-1 text-sm text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800">
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <JsEditor key={lang} lang={lang} value={current} onChange={setCurrent} onRun={exec} minHeight="420px" diagnostics={isTs ? ts.editorDiags : undefined} onHover={isTs ? ts.onHover : undefined} />
        <div className="flex min-w-0 flex-col gap-4">
          {isTs && <DiagnosticsView diagnostics={ts.diagnostics} state={ts.state} error={ts.error} onRetry={ts.retry} />}
          <ConsoleView logs={logs} status={status} onClear={clear} />
        </div>
      </div>
      {isTs ? (
        <Callout tone="info" title="TypeScript ici">
          Compilateur TypeScript officiel (paquet <C>typescript</C>, chargé à la demande dans un worker) avec <C>strict: true</C>, cible ES2022, lib <C>es2022</C> + <C>dom</C> ; chaque fichier est un module. Survole un identifiant pour voir son type inféré. Comme <C>tsc</C>, une erreur de type n'empêche pas l'exécution : le JS transpilé (types effacés) part quand même dans le bac à sable. Les types <C>Equal</C>, <C>NotEqual</C> et <C>Expect</C> sont disponibles pour tester des types, et une ligne <C>// @noUncheckedIndexedAccess: true</C> (ou une autre option stricte) change la configuration.
        </Callout>
      ) : (
        <Callout tone="info" title="Bon à savoir">
        Le code est évalué comme une balise <C>{'<script>'}</C> non stricte : au niveau supérieur, <C>var</C> crée une propriété globale et <C>this</C> vaut <C>globalThis</C> (alias <C>window</C>). Un <C>await</C> au niveau supérieur est accepté (le code est alors enveloppé dans une fonction async). Il n'y a pas de DOM dans un worker : <C>document</C> n'existe pas. L'exécution s'arrête au bout de 5 secondes, ou 3 secondes après la fin du code synchrone si des minuteurs restent actifs. Les messages d'erreur sont ceux du navigateur (formulation V8 dans Chrome).
      </Callout>
      )}
    </div>
  )
}
