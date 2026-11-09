/** Côté page : lance un worker neuf, collecte la console, le termine au bout du délai. */
import { KATA_PER_TEST_MS, type KataTest, type LogEntry, type TestResult } from './runtime'
import type { WorkerMessage, WorkerRequest } from './worker'

export type RunOutcome = { logs: LogEntry[]; status: 'ok' | 'timeout' | 'limit' | 'error' | 'cancelled'; ms: number }
export type KataOutcome = { logs: LogEntry[]; results: TestResult[] | null; status: 'ok' | 'timeout' | 'error' | 'cancelled'; ms: number }

type SpawnEnd = 'done' | 'timeout' | 'error' | 'cancelled'

/**
 * Budget total d'une exécution de katas : chaque test peut atteindre son délai propre
 * (promesse jamais résolue) sans que le worker soit tué avant de rendre les résultats.
 */
export const kataBudgetMs = (nTests: number, perTestMs = KATA_PER_TEST_MS) => 2000 + nTests * (perTestMs + 500)

function spawn(req: WorkerRequest, timeoutMs: number, opts: { onLog?: (e: LogEntry) => void; signal?: AbortSignal } = {}) {
  const { onLog, signal } = opts
  return new Promise<{ logs: LogEntry[]; last: WorkerMessage | null; end: SpawnEnd; ms: number }>((resolve) => {
    const t0 = performance.now()
    const logs: LogEntry[] = []
    if (signal?.aborted) return resolve({ logs, last: null, end: 'cancelled', ms: 0 })
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    let done = false
    const finish = (last: WorkerMessage | null, end: SpawnEnd) => {
      if (done) return
      done = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      worker.terminate()
      resolve({ logs, last, end, ms: Math.round(performance.now() - t0) })
    }
    const onAbort = () => finish(null, 'cancelled')
    const timer = setTimeout(() => finish(null, 'timeout'), timeoutMs)
    signal?.addEventListener('abort', onAbort)
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data
      if (m.type === 'log') {
        logs.push(m.entry)
        onLog?.(m.entry)
      } else finish(m, 'done')
    }
    // erreurs fatales du worker (chargement du module…) : les erreurs du code utilisateur sont gérées dans le worker
    worker.onerror = (e) => {
      e.preventDefault()
      const entry: LogEntry = { level: 'uncaught', text: `Erreur du worker : ${e.message || "le bac à sable n'a pas pu démarrer"}` }
      logs.push(entry)
      onLog?.(entry)
      finish(null, 'error')
    }
    worker.postMessage(req)
  })
}

/** Exécution du playground : délai total `timeoutMs`, attente des minuteurs jusqu'à `settleMs`. */
export async function runCode(
  code: string,
  opts: { timeoutMs?: number; settleMs?: number; onLog?: (e: LogEntry) => void; signal?: AbortSignal } = {},
): Promise<RunOutcome> {
  const { timeoutMs = 5000, settleMs = 3000, onLog, signal } = opts
  const r = await spawn({ type: 'run', code, settleMs }, timeoutMs, { onLog, signal })
  const status = r.end !== 'done' ? r.end : r.last?.type === 'done' && !r.last.settled ? 'limit' : 'ok'
  return { logs: r.logs, status, ms: r.ms }
}

export async function runTests(code: string, tests: KataTest[], opts: { timeoutMs?: number; signal?: AbortSignal } = {}): Promise<KataOutcome> {
  const { timeoutMs = kataBudgetMs(tests.length), signal } = opts
  const r = await spawn({ type: 'kata', code, tests }, timeoutMs, { signal })
  return { logs: r.logs, results: r.last?.type === 'tests' ? r.last.results : null, status: r.end === 'done' ? 'ok' : r.end, ms: r.ms }
}
