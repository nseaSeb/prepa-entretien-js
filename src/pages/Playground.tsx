import { JsEditor } from '../components/JsEditor'
import { ConsoleView } from '../components/ConsoleView'
import { Button, Callout, PageHeader, C } from '../components/ui'
import { DEFAULT_CODE } from '../lib/nav'
import { useRunner } from '../lib/useRunner'

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

export default function Playground({ code, setCode }: { code: string; setCode: (c: string) => void }) {
  const { logs, status, run, clear } = useRunner()
  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Un éditeur JavaScript et une console. Le code s'exécute dans un Web Worker isolé, comme un script classique : la console capture log, warn et error, les minuteurs et promesses sont attendus, et une boucle infinie est interrompue sans geler l'onglet. Ton code est conservé dans ce navigateur."
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => run(code)} disabled={status.state === 'running'}>
          ▶ Exécuter <span className="ml-1 text-xs opacity-70">⌘/Ctrl + Entrée</span>
        </Button>
        <span className="ml-2 text-sm text-slate-500">Exemples :</span>
        {EXAMPLES.map(([label, src]) => (
          <button key={label} onClick={() => setCode(src)} className="rounded-md px-2 py-1 text-sm text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800">
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <JsEditor value={code} onChange={setCode} onRun={() => run(code)} minHeight="420px" />
        <ConsoleView logs={logs} status={status} onClear={clear} />
      </div>
      <Callout tone="info" title="Bon à savoir">
        Le code est évalué comme une balise <C>{'<script>'}</C> non stricte : au niveau supérieur, <C>var</C> crée une propriété globale et <C>this</C> vaut <C>globalThis</C> (alias <C>window</C>). Un <C>await</C> au niveau supérieur est accepté (le code est alors enveloppé dans une fonction async). Il n'y a pas de DOM dans un worker : <C>document</C> n'existe pas. L'exécution s'arrête au bout de 5 secondes, ou 3 secondes après la fin du code synchrone si des minuteurs restent actifs. Les messages d'erreur sont ceux du navigateur (formulation V8 dans Chrome).
      </Callout>
    </div>
  )
}
