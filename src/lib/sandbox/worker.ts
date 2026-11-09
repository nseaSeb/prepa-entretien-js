/// <reference lib="es2023" />
/**
 * Web Worker du bac à sable. Un worker neuf par exécution : le thread principal le termine
 * en cas de dépassement du délai (boucle infinie), sans bloquer l'onglet.
 */
import { createRuntime, executeProgram, installGlobals, runKataTests, type KataTest, type LogEntry } from './runtime'

export type WorkerRequest = { type: 'run'; code: string; settleMs: number } | { type: 'kata'; code: string; tests: KataTest[] }
export type WorkerMessage =
  | { type: 'log'; entry: LogEntry }
  | { type: 'done'; settled: boolean }
  | { type: 'tests'; results: import('./runtime').TestResult[] }

type Scope = {
  postMessage(m: WorkerMessage): void
  addEventListener(type: string, fn: (e: { data?: unknown; reason?: unknown; error?: unknown; message?: string; preventDefault(): void }) => void): void
  setTimeout: (fn: () => void, ms?: number) => unknown
  clearTimeout: (id: unknown) => void
  setInterval: (fn: () => void, ms?: number) => unknown
  clearInterval: (id: unknown) => void
  queueMicrotask: (fn: () => void) => void
}

const scope = self as unknown as Scope
// On capture tout ce dont on a besoin AVANT que le code utilisateur puisse l'écraser
const post = scope.postMessage.bind(scope)
const host = {
  setTimeout: scope.setTimeout.bind(scope),
  clearTimeout: scope.clearTimeout.bind(scope),
  setInterval: scope.setInterval.bind(scope),
  clearInterval: scope.clearInterval.bind(scope),
  queueMicrotask: scope.queueMicrotask.bind(scope),
}
const rt = createRuntime(host, (entry) => post({ type: 'log', entry }))
const evalScript = (code: string) => (0, eval)(code)

scope.addEventListener('unhandledrejection', (e) => {
  e.preventDefault()
  rt.reportUncaught(e.reason, true)
})
scope.addEventListener('error', (e) => {
  e.preventDefault()
  rt.reportUncaught(e.error ?? e.message)
})

const WORKER_ONLY = ['name', 'close', 'postMessage', 'onmessage', 'onmessageerror', 'onerror', 'location', 'navigator', 'origin', 'status', 'importScripts', 'self']

let started = false
scope.addEventListener('message', async (e) => {
  if (started) return
  started = true
  const req = e.data as WorkerRequest
  // Globales propres aux workers, absentes d'un realm neuf (vm) : on les masque pour que
  // `var name`, `this.name` ou `close` se comportent comme dans les tests Node.
  for (const g of WORKER_ONLY) {
    try {
      Object.defineProperty(scope, g, { value: undefined, writable: true, configurable: true })
    } catch {
      /* propriété non configurable : on la laisse */
    }
  }
  installGlobals(scope, rt)
  if (req.type === 'run') {
    const settled = await executeProgram(rt, evalScript, req.code, req.settleMs)
    post({ type: 'done', settled })
  } else {
    const results = await runKataTests(rt, evalScript, req.code, req.tests)
    post({ type: 'tests', results })
  }
})
