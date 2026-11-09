/**
 * Cœur du bac à sable, partagé par le Web Worker (navigateur) et par les tests (Node, module vm).
 * Seule différence entre les deux : la fonction `evalScript` (indirect eval vs vm.runInContext).
 * Le code utilisateur est évalué comme un script global non strict : `var` crée une propriété
 * globale, `this` au niveau supérieur vaut l'objet global, comme dans une balise <script>.
 */
import { formatArgs, formatError, formatValue } from './format'

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'uncaught' | 'system'
export type LogEntry = { level: LogLevel; text: string }
export type KataTest = { name: string; code: string }
export type TestResult = { name: string; ok: boolean; error?: string }

type Timer = unknown
export type HostTimers = {
  setTimeout: (fn: () => void, ms?: number) => Timer
  clearTimeout: (id: Timer) => void
  setInterval: (fn: () => void, ms?: number) => Timer
  clearInterval: (id: Timer) => void
  queueMicrotask: (fn: () => void) => void
}

export type Runtime = ReturnType<typeof createRuntime>

export function createRuntime(host: HostTimers, onLog: (e: LogEntry) => void) {
  const pending = new Map<Timer, 'timeout' | 'interval'>()
  let indent = ''
  const counts = new Map<string, number>()
  const times = new Map<string, number>()
  const emit = (level: LogLevel, args: unknown[]) => {
    const text = formatArgs(args)
    onLog({ level, text: indent ? text.split('\n').map((l) => indent + l).join('\n') : text })
  }
  const reportUncaught = (err: unknown, inPromise = false) =>
    onLog({ level: 'uncaught', text: `Uncaught ${inPromise ? '(in promise) ' : ''}${formatError(err)}` })
  const guard = (fn: unknown, args: unknown[]) => () => {
    try {
      if (typeof fn === 'function') fn(...args)
    } catch (e) {
      reportUncaught(e)
    }
  }

  const console = {
    log: (...a: unknown[]) => emit('log', a),
    info: (...a: unknown[]) => emit('info', a),
    debug: (...a: unknown[]) => emit('debug', a),
    warn: (...a: unknown[]) => emit('warn', a),
    error: (...a: unknown[]) => emit('error', a),
    trace: (...a: unknown[]) => emit('log', ['Trace:', ...a]),
    dir: (v: unknown) => emit('log', [typeof v === 'string' ? formatValue(v, true) : v]),
    table: (...a: unknown[]) => emit('log', a),
    assert: (cond: unknown, ...a: unknown[]) => {
      if (!cond) emit('error', a.length ? ['Assertion failed:', ...a] : ['Assertion failed'])
    },
    count: (label = 'default') => {
      const n = (counts.get(label) ?? 0) + 1
      counts.set(label, n)
      emit('log', [`${label}: ${n}`])
    },
    countReset: (label = 'default') => counts.delete(label),
    time: (label = 'default') => times.set(label, Date.now()),
    timeEnd: (label = 'default') => {
      const t = times.get(label)
      if (t !== undefined) emit('log', [`${label}: ${Date.now() - t} ms`])
      times.delete(label)
    },
    timeLog: (label = 'default', ...a: unknown[]) => {
      const t = times.get(label)
      if (t !== undefined) emit('log', [`${label}: ${Date.now() - t} ms`, ...a])
    },
    group: (...a: unknown[]) => {
      if (a.length) emit('log', a)
      indent += '  '
    },
    groupCollapsed: (...a: unknown[]) => {
      if (a.length) emit('log', a)
      indent += '  '
    },
    groupEnd: () => {
      indent = indent.slice(2)
    },
  }

  const globals = {
    console,
    setTimeout(fn: unknown, ms?: number, ...args: unknown[]) {
      const id = host.setTimeout(() => {
        pending.delete(id)
        guard(fn, args)()
      }, ms)
      pending.set(id, 'timeout')
      return id
    },
    clearTimeout(id: Timer) {
      pending.delete(id)
      host.clearTimeout(id)
    },
    setInterval(fn: unknown, ms?: number, ...args: unknown[]) {
      const id = host.setInterval(guard(fn, args), ms)
      pending.set(id, 'interval')
      return id
    },
    clearInterval(id: Timer) {
      pending.delete(id)
      host.clearInterval(id)
    },
    queueMicrotask(fn: unknown) {
      host.queueMicrotask(guard(fn, []))
    },
  }

  const tick = (ms = 0) => new Promise<void>((r) => host.setTimeout(r, ms))

  return {
    globals,
    reportUncaught,
    log: (level: LogLevel, text: string) => onLog({ level, text }),
    pendingCount: () => pending.size,
    tick,
    /**
     * Attend que la file d'événements se vide : plus aucun minuteur en attente
     * (les microtâches passent avant chaque vérification, qui est une macrotâche).
     * Rend false si la limite est atteinte avec des minuteurs encore actifs.
     */
    async settle(limitMs: number): Promise<boolean> {
      const start = Date.now()
      for (;;) {
        await tick(0)
        if (pending.size === 0) {
          // un dernier tour pour laisser passer les rejets non gérés signalés en fin de tour
          await tick(0)
          if (pending.size === 0) return true
        }
        if (Date.now() - start >= limitMs) return false
        await tick(5)
      }
    },
    /** Annule tous les minuteurs encore programmés (fin d'exécution). */
    dispose() {
      for (const [id, kind] of pending) (kind === 'interval' ? host.clearInterval : host.clearTimeout)(id)
      pending.clear()
    },
  }
}

/** Installe console, minuteurs et aides de test sur l'objet global cible (worker ou contexte vm). */
export function installGlobals(target: object, rt: Runtime) {
  const define = (name: string, value: unknown) =>
    Object.defineProperty(target, name, { value, writable: true, configurable: true, enumerable: false })
  for (const [name, value] of Object.entries(rt.globals)) define(name, value)
  define('window', target)
  // Aides disponibles dans les tests de katas
  define('__deepEqual', deepEqual)
  define('assert', (cond: unknown, msg?: string) => {
    if (!cond) throw new Error(msg ?? 'assertion fausse')
  })
  define('assertEqual', (actual: unknown, expected: unknown, msg?: string) => {
    if (!deepEqual(actual, expected))
      throw new Error(`${msg ? msg + ' : ' : ''}attendu ${formatValue(expected, true)}, obtenu ${formatValue(actual, true)}`)
  })
  define('assertThrows', (fn: () => unknown, msg?: string) => {
    try {
      fn()
    } catch {
      return
    }
    throw new Error(msg ?? 'une exception était attendue')
  })
  define('sleep', (ms: number) => new Promise((r) => rt.globals.setTimeout(r, ms)))
}

export type EvalScript = (code: string) => unknown

/** Exécute un programme de playground : script, puis attente de la fin des minuteurs. */
export async function executeProgram(rt: Runtime, evalScript: EvalScript, code: string, settleLimitMs: number) {
  try {
    evalScript(code)
  } catch (e) {
    // `await` au niveau supérieur : on retente dans une fonction async (les `var` deviennent locales)
    if (isSyntaxError(e) && /await/.test(String((e as Error).message))) {
      try {
        const p = evalScript(`(async () => {\n${code}\n})()`) as Promise<unknown>
        p.then(undefined, (err) => rt.reportUncaught(err, true))
      } catch (e2) {
        rt.reportUncaught(e2)
      }
    } else rt.reportUncaught(e)
  }
  const done = await rt.settle(settleLimitMs)
  if (!done) rt.log('system', `Minuteurs encore actifs après ${settleLimitMs / 1000} s (setInterval jamais arrêté ?) : exécution interrompue.`)
  rt.dispose()
  return done
}

/** Délai par test de kata ; le budget total du worker (client.ts) en dépend. */
export const KATA_PER_TEST_MS = 2000

const isSyntaxError = (e: unknown) => e !== null && typeof e === 'object' && (e as Error).name === 'SyntaxError'

/** Évalue le code du candidat puis chaque test caché (corps de fonction async). */
export async function runKataTests(rt: Runtime, evalScript: EvalScript, userCode: string, tests: KataTest[], perTestMs = KATA_PER_TEST_MS): Promise<TestResult[]> {
  try {
    evalScript(userCode)
  } catch (e) {
    rt.reportUncaught(e)
    const error = `Le code ne s'exécute pas : ${formatError(e)}`
    return tests.map((t) => ({ name: t.name, ok: false, error }))
  }
  const results: TestResult[] = []
  for (const t of tests) {
    try {
      const fn = evalScript(`(async () => {\n${t.code}\n})`) as () => Promise<unknown>
      let timer: unknown
      const timeout = new Promise((_, reject) => {
        timer = rt.globals.setTimeout(() => reject(new Error(`délai dépassé (${perTestMs / 1000} s) : une promesse ne se résout jamais ?`)), perTestMs)
      })
      try {
        await Promise.race([fn(), timeout])
      } finally {
        rt.globals.clearTimeout(timer)
      }
      results.push({ name: t.name, ok: true })
    } catch (e) {
      // les échecs d'assertion (Error simple) s'affichent sans le préfixe « Error: »
      const plain = e !== null && typeof e === 'object' && (e as Error).name === 'Error' && typeof (e as Error).message === 'string'
      results.push({ name: t.name, ok: false, error: plain ? (e as Error).message : formatError(e) })
    }
  }
  rt.dispose()
  return results
}

// ---------------------------------------------------------------------------

const ttag = (v: unknown) => Object.prototype.toString.call(v)

const BOXED = new Set(['[object Number]', '[object String]', '[object Boolean]', '[object BigInt]', '[object Symbol]'])

/**
 * Égalité profonde entre royaumes (pas d'instanceof, pas de comparaison de prototypes).
 * `stack` = paires en cours de comparaison (cycles) : une paire n'y est supposée égale que
 * pendant sa propre comparaison, jamais après un échec.
 */
export function deepEqual(a: unknown, b: unknown, stack: [object, object][] = []): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (ttag(a) !== ttag(b) || Array.isArray(a) !== Array.isArray(b)) return false
  if (stack.some(([x, y]) => x === a && y === b)) return true
  stack.push([a, b])
  try {
    return compare(a, b, stack)
  } finally {
    stack.pop()
  }
}

function compare(a: object, b: object, stack: [object, object][]): boolean {
  const t = ttag(a)
  if (t === '[object Date]') return Object.is((a as Date).getTime(), (b as Date).getTime())
  if (t === '[object RegExp]') return String(a) === String(b)
  if (BOXED.has(t) && !Object.is((a as { valueOf(): unknown }).valueOf(), (b as { valueOf(): unknown }).valueOf())) return false
  if (t === '[object Map]') {
    const ma = a as Map<unknown, unknown>
    const mb = b as Map<unknown, unknown>
    if (ma.size !== mb.size) return false
    for (const [k, v] of ma) if (!mb.has(k) || !deepEqual(v, mb.get(k), stack)) return false
    return true
  }
  if (t === '[object Set]') {
    const sa = a as Set<unknown>
    const sb = b as Set<unknown>
    if (sa.size !== sb.size) return false
    // appariement un-à-un : d'abord les éléments identiques, puis les égaux en profondeur
    const bs = [...sb]
    const used = bs.map(() => false)
    const rest: unknown[] = []
    for (const v of sa) {
      if (!sb.has(v)) {
        rest.push(v)
        continue
      }
      const i = bs.findIndex((w, j) => !used[j] && (w === v || (v !== v && w !== w)))
      used[i] = true
    }
    for (const v of rest) {
      const i = bs.findIndex((w, j) => !used[j] && deepEqual(v, w, stack))
      if (i < 0) return false
      used[i] = true
    }
    return true
  }
  if (Array.isArray(a) && (a as unknown[]).length !== (b as unknown[]).length) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual((a as never)[k], (b as never)[k], stack))
}
