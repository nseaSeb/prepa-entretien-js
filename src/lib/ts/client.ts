/**
 * Côté page : accès au worker TypeScript (créé au premier appel, puis réutilisé).
 * N'importe pas le compilateur : seul le worker le charge.
 */
import type { Diag, TypeTest, TypeTestResult } from './core'
import type { TsRequest, TsResponse } from './worker'

export type { Diag, TypeTest, TypeTestResult }

type Pending = { resolve: (r: TsResponse) => void; reject: (e: Error) => void }
let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, Pending>()

function getWorker() {
  if (worker) return worker
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (e: MessageEvent<TsResponse>) => {
    const p = pending.get(e.data.id)
    if (!p) return
    pending.delete(e.data.id)
    if (e.data.type === 'error') p.reject(new Error(e.data.message))
    else p.resolve(e.data)
  }
  w.onerror = (e) => {
    e.preventDefault()
    const err = new Error(`Le compilateur TypeScript n'a pas pu démarrer : ${e.message || 'erreur du worker'}`)
    for (const p of pending.values()) p.reject(err)
    pending.clear()
    worker?.terminate()
    worker = null
  }
  worker = w
  return w
}

type Req = TsRequest extends infer R ? (R extends { id: number } ? Omit<R, 'id'> : never) : never
function call<T extends TsResponse['type']>(req: Req & { type: T }): Promise<Extract<TsResponse, { type: T }>> {
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve: resolve as (r: TsResponse) => void, reject })
    getWorker().postMessage({ ...req, id })
  })
}

/** Diagnostics + JS transpilé (null pour un extrait multi-fichiers, non exécutable). */
export const compileTs = (code: string) => call({ type: 'compile', code })
export const checkTs = (code: string) => call({ type: 'check', code }).then((r) => r.diagnostics)
export const quickInfoTs = (code: string, pos: number) => call({ type: 'quickInfo', code, pos }).then((r) => r.info)
export const runTypeTestsTs = (code: string, tests: TypeTest[]) => call({ type: 'typeTests', code, tests })
