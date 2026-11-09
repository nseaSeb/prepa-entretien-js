/**
 * Côté page : accès au worker TypeScript (créé au premier appel, puis réutilisé).
 * N'importe pas le compilateur : seul le worker le charge.
 *
 * Robustesse :
 * - délai maximal par requête, compté pour la requête en tête de file (le worker les traite une par une) :
 *   une file de requêtes rapides ne déclenche pas de faux délai. Délai dépassé : le worker est arrêté,
 *   les requêtes en attente sont rejetées avec un message clair, et un nouveau worker part à l'appel suivant ;
 * - échec au démarrage (erreur ou démarrage trop long avant le message `ready`) : mémorisé, toutes les
 *   requêtes sont rejetées tout de suite (« TypeScript indisponible : … ») jusqu'à `retry()` ;
 * - AbortSignal : la requête est rejetée (AbortError) et sa réponse ignorée.
 */
import type { Diag, TypeTest, TypeTestResult } from './core'
import type { TsRequest, TsResponse } from './worker'

export type { Diag, TypeTest, TypeTestResult }

/** Ce que le client utilise d'un Worker (un faux worker suffit dans les tests). */
export type WorkerLike = {
  postMessage: (m: TsRequest) => void
  terminate: () => void
  onmessage: ((e: { data: TsResponse }) => void) | null
  onerror: ((e: { message?: string; preventDefault?: () => void }) => void) | null
}

type Req = TsRequest extends infer R ? (R extends { id: number } ? Omit<R, 'id'> : never) : never
type Pending = { resolve: (r: TsResponse) => void; reject: (e: Error) => void; cleanup: () => void }

const abortError = () => Object.assign(new Error('Vérification annulée'), { name: 'AbortError' })

export function createTsClient(spawn: () => WorkerLike, { timeoutMs = 10_000, startupMs = 30_000 } = {}) {
  let worker: WorkerLike | null = null
  let ready = false
  let failed: string | null = null
  let nextId = 1
  const pending = new Map<number, Pending>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let timedId = 0

  const unavailable = () => new Error(`TypeScript indisponible : ${failed}`)

  function rejectAll(err: Error) {
    const all = [...pending.values()]
    pending.clear()
    for (const p of all) {
      p.cleanup()
      p.reject(err)
    }
  }

  function stop() {
    if (timer) clearTimeout(timer)
    timer = null
    timedId = 0
    worker?.terminate()
    worker = null
    ready = false
  }

  /** Démarrage raté : mémorisé jusqu'à retry(). */
  function fail(message: string) {
    failed = message
    stop()
    rejectAll(unavailable())
  }

  /** Arme le délai pour la requête en tête de file (si elle a changé). */
  function arm() {
    const head = pending.keys().next()
    if (head.done) {
      if (timer) clearTimeout(timer)
      timer = null
      timedId = 0
      return
    }
    if (head.value === timedId) return
    if (timer) clearTimeout(timer)
    timedId = head.value
    timer = setTimeout(onTimeout, ready ? timeoutMs : startupMs)
  }

  function onTimeout() {
    timer = null
    if (!ready) return fail(`le compilateur n'a pas démarré en ${Math.round(startupMs / 1000)} s`)
    stop()
    rejectAll(new Error(`Le compilateur TypeScript ne répond plus (plus de ${Math.round(timeoutMs / 1000)} s) : il a été redémarré. Relance la vérification.`))
  }

  function getWorker(): WorkerLike {
    if (worker) return worker
    const w = spawn()
    w.onmessage = (e) => {
      if (w !== worker) return
      const d = e.data
      if (d.type === 'ready') {
        ready = true
        // le délai de la requête en tête repart avec le délai normal
        timedId = 0
        arm()
        return
      }
      if (d.type === 'fatal') return fail(d.message)
      const p = pending.get(d.id)
      if (!p) return
      pending.delete(d.id)
      p.cleanup()
      if (d.type === 'error') p.reject(new Error(d.message))
      else p.resolve(d)
      arm()
    }
    w.onerror = (e) => {
      e.preventDefault?.()
      if (w !== worker) return
      const message = e.message || 'erreur du worker'
      if (!ready) return fail(message)
      // plantage après le démarrage : on repartira d'un worker neuf à l'appel suivant
      stop()
      rejectAll(new Error(`Le compilateur TypeScript s'est arrêté : ${message}`))
    }
    worker = w
    ready = false
    return w
  }

  function call<T extends TsResponse['type']>(req: Req & { type: T }, signal?: AbortSignal): Promise<Extract<TsResponse, { type: T }>> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortError())
      if (failed) return reject(unavailable())
      let w: WorkerLike
      try {
        w = getWorker()
      } catch (e) {
        failed = e instanceof Error ? e.message : String(e)
        return reject(unavailable())
      }
      const id = nextId++
      const onAbort = () => {
        if (!pending.delete(id)) return
        reject(abortError())
        arm()
      }
      signal?.addEventListener('abort', onAbort, { once: true })
      pending.set(id, { resolve: resolve as (r: TsResponse) => void, reject, cleanup: () => signal?.removeEventListener('abort', onAbort) })
      w.postMessage({ ...req, id } as TsRequest)
      arm()
    })
  }

  return {
    /** Diagnostics + JS transpilé (`js` null, avec `reason`, si le code n'est pas exécutable). */
    compileTs: (code: string, signal?: AbortSignal) => call({ type: 'compile', code }, signal),
    checkTs: (code: string, signal?: AbortSignal) => call({ type: 'check', code }, signal).then((r) => r.diagnostics),
    quickInfoTs: (code: string, pos: number) => call({ type: 'quickInfo', code, pos }).then((r) => r.info),
    runTypeTestsTs: (code: string, tests: TypeTest[], signal?: AbortSignal) => call({ type: 'typeTests', code, tests }, signal),
    /** Kata : tests de types + erreurs du code (une seule vérification) + JS à exécuter. */
    kataTs: (code: string, typeTests: TypeTest[], signal?: AbortSignal) => call({ type: 'kata', code, typeTests }, signal),
    /** Message de l'échec de démarrage mémorisé (null : pas d'échec). */
    failure: () => failed,
    /** Oublie l'échec de démarrage : le prochain appel relance un worker. */
    retry: () => {
      failed = null
      stop()
    },
  }
}

const client = createTsClient(() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike)

export const { compileTs, checkTs, quickInfoTs, runTypeTestsTs, kataTs, failure: tsFailure, retry: retryTs } = client
