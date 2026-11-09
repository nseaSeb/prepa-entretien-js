/** Client du worker TypeScript : délai maximal, redémarrage, annulation, échec de démarrage mémorisé. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTsClient, type WorkerLike } from './ts/client'

type Msg = { id: number; type: string; [k: string]: unknown }
/** Faux worker : `reply` décide de la réponse à chaque message (rien : il « pend »). */
function fakeSpawner(opts: { ready?: boolean; failStart?: string; reply?: (m: Msg) => object | null } = {}) {
  const spawned: (WorkerLike & { terminated: boolean; received: Msg[] })[] = []
  const spawn = () => {
    const w = {
      terminated: false,
      received: [] as Msg[],
      onmessage: null as WorkerLike['onmessage'],
      onerror: null as WorkerLike['onerror'],
      postMessage(m: Msg) {
        w.received.push(m)
        const r = opts.reply?.(m)
        if (r) setTimeout(() => w.onmessage?.({ data: { id: m.id, ...r } as never }), 1)
      },
      terminate() {
        w.terminated = true
      },
    }
    spawned.push(w)
    setTimeout(() => {
      if (opts.failStart) w.onerror?.({ message: opts.failStart, preventDefault() {} })
      else if (opts.ready !== false) w.onmessage?.({ data: { id: 0, type: 'ready' } as never })
    }, 1)
    return w
  }
  return { spawn, spawned }
}

test('client TS : réponse normale', async () => {
  const f = fakeSpawner({ reply: () => ({ type: 'check', diagnostics: [] }) })
  const c = createTsClient(f.spawn, { timeoutMs: 50, startupMs: 100 })
  assert.deepEqual(await c.checkTs('x'), [])
  assert.equal(f.spawned.length, 1)
})

test('client TS : requête bloquée → rejet clair après le délai, worker arrêté puis recréé', async () => {
  let hang = true
  const f = fakeSpawner({ reply: () => (hang ? null : { type: 'check', diagnostics: [] }) })
  const c = createTsClient(f.spawn, { timeoutMs: 50, startupMs: 200 })
  const a = c.checkTs('a')
  const b = c.checkTs('b')
  await assert.rejects(a, /ne répond plus/)
  await assert.rejects(b, /ne répond plus/)
  assert.equal(f.spawned[0].terminated, true)
  hang = false
  assert.deepEqual(await c.checkTs('c'), [])
  assert.equal(f.spawned.length, 2)
})

test('client TS : une file de requêtes rapides ne déclenche pas de faux délai', async () => {
  const f = fakeSpawner()
  const c = createTsClient(f.spawn, { timeoutMs: 300, startupMs: 1000 })
  // le worker répond à une requête toutes les 100 ms : chacune < délai, la file entière > délai
  const w = () => f.spawned[0]
  const all = Array.from({ length: 5 }, (_, i) => c.checkTs(String(i)))
  await new Promise((r) => setTimeout(r, 5))
  for (const m of w().received) {
    await new Promise((r) => setTimeout(r, 100))
    w().onmessage?.({ data: { id: m.id, type: 'check', diagnostics: [] } as never })
  }
  assert.equal((await Promise.all(all)).length, 5)
  assert.equal(w().terminated, false)
})

test('client TS : AbortSignal → rejet immédiat (AbortError)', async () => {
  const f = fakeSpawner({ reply: () => null })
  const c = createTsClient(f.spawn, { timeoutMs: 5000, startupMs: 5000 })
  const ctrl = new AbortController()
  const p = c.compileTs('x', ctrl.signal)
  ctrl.abort()
  await assert.rejects(p, (e: Error) => e.name === 'AbortError')
  const ctrl2 = new AbortController()
  ctrl2.abort()
  await assert.rejects(c.kataTs('x', [], ctrl2.signal), (e: Error) => e.name === 'AbortError')
})

test('client TS : échec au démarrage mémorisé (pas de recréation à chaque frappe) jusqu’à retry()', async () => {
  const f = fakeSpawner({ failStart: 'chunk introuvable', reply: () => ({ type: 'check', diagnostics: [] }) })
  const c = createTsClient(f.spawn, { timeoutMs: 50, startupMs: 100 })
  await assert.rejects(c.checkTs('a'), /TypeScript indisponible : .*chunk introuvable/)
  await assert.rejects(c.checkTs('b'), /TypeScript indisponible : .*chunk introuvable/)
  await assert.rejects(c.quickInfoTs('c', 0), /TypeScript indisponible/)
  assert.equal(f.spawned.length, 1)
  assert.match(c.failure() ?? '', /chunk introuvable/)
  c.retry()
  assert.equal(c.failure(), null)
  await assert.rejects(c.checkTs('d'), /TypeScript indisponible/)
  assert.equal(f.spawned.length, 2)
})

test('client TS : démarrage trop long → indisponible (mémorisé)', async () => {
  const f = fakeSpawner({ ready: false, reply: () => null })
  const c = createTsClient(f.spawn, { timeoutMs: 20, startupMs: 60 })
  await assert.rejects(c.checkTs('a'), /TypeScript indisponible/)
  await assert.rejects(c.checkTs('b'), /TypeScript indisponible/)
  assert.equal(f.spawned.length, 1)
})
