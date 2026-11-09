/**
 * Exécution dans Node pour les tests : un contexte vm neuf par extrait, même cœur que le worker.
 * Fichier réservé aux tests (exclu de tsconfig.app).
 */
import vm from 'node:vm'
import { createRuntime, executeProgram, installGlobals, runKataTests, type KataTest, type LogEntry, type TestResult } from './runtime'

/**
 * structuredClone évalué DANS le contexte vm : les copies appartiennent au même realm que le code
 * (instanceof Date, Map… restent vrais, comme dans le navigateur). Couvre les types usuels de
 * l'algorithme : primitives, Array, objets simples (prototype perdu), Date, RegExp, Map, Set,
 * Error, wrappers, références circulaires ; fonctions et symboles lèvent DataCloneError.
 */
const STRUCTURED_CLONE = `(() => {
  const tag = (v) => Object.prototype.toString.call(v).slice(8, -1)
  const fail = (v) => {
    const e = new Error(String(v) + ' could not be cloned.')
    e.name = 'DataCloneError'
    throw e
  }
  return function structuredClone(value) {
    if (arguments.length === 0) throw new TypeError("Failed to execute 'structuredClone': 1 argument required, but only 0 present.")
    const seen = new Map()
    const clone = (v) => {
      if (typeof v === 'function' || typeof v === 'symbol') fail(typeof v === 'symbol' ? v.toString() : v)
      if (v === null || typeof v !== 'object') return v
      if (seen.has(v)) return seen.get(v)
      const t = tag(v)
      let out
      switch (t) {
        case 'Date': out = new Date(v.getTime()); break
        case 'RegExp': out = new RegExp(v.source, v.flags); break
        case 'Boolean': case 'Number': case 'String': out = Object(v.valueOf()); break
        case 'Map': out = new Map(); seen.set(v, out); for (const [k, x] of v) out.set(clone(k), clone(x)); return out
        case 'Set': out = new Set(); seen.set(v, out); for (const x of v) out.add(clone(x)); return out
        case 'Error': {
          const C = { EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError }[v.name] || Error
          out = new C(v.message); seen.set(v, out)
          if ('cause' in v) out.cause = clone(v.cause)
          return out
        }
        case 'Array': out = new Array(v.length); break
        case 'Object': out = {}; break
        default: fail('#<' + t + '>')
      }
      seen.set(v, out)
      for (const k of Object.keys(v)) out[k] = clone(v[k])
      return out
    }
    return clone(value)
  }
})()`

const host = {
  setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, ms),
  clearTimeout: (id: unknown) => clearTimeout(id as NodeJS.Timeout),
  setInterval: (fn: () => void, ms?: number) => setInterval(fn, ms),
  clearInterval: (id: unknown) => clearInterval(id as NodeJS.Timeout),
  queueMicrotask: (fn: () => void) => queueMicrotask(fn),
}

function makeContext(logs: LogEntry[], extra: Record<string, unknown> = {}) {
  const rt = createRuntime(host, (e) => logs.push(e))
  const ctx = vm.createContext({})
  const g = vm.runInContext('globalThis', ctx) as object
  installGlobals(g, rt)
  const sc = vm.runInContext(STRUCTURED_CLONE, ctx) as unknown
  for (const [k, v] of Object.entries({ structuredClone: sc, ...extra })) Object.defineProperty(g, k, { value: v, writable: true, configurable: true })
  const evalScript = (code: string) => vm.runInContext(code, ctx, { timeout: 2000, filename: 'snippet.js' })
  // Le lanceur de tests a son propre écouteur (qui ferait échouer le test) : on le met de côté
  const previous = process.listeners('unhandledRejection')
  process.removeAllListeners('unhandledRejection')
  const onRejection = (reason: unknown) => rt.reportUncaught(reason, true)
  process.on('unhandledRejection', onRejection)
  return {
    rt,
    evalScript,
    cleanup: () => {
      process.off('unhandledRejection', onRejection)
      for (const l of previous) process.on('unhandledRejection', l)
    },
  }
}

/** Exécute un extrait et rend la sortie console complète (une entrée par ligne). */
export async function runSnippet(code: string, opts: { settleLimitMs?: number; extraGlobals?: Record<string, unknown> } = {}): Promise<{ output: string; logs: LogEntry[]; settled: boolean }> {
  const { settleLimitMs = 3000, extraGlobals } = opts
  const logs: LogEntry[] = []
  const { rt, evalScript, cleanup } = makeContext(logs, extraGlobals)
  try {
    const settled = await executeProgram(rt, evalScript, code, settleLimitMs)
    return { output: logs.filter((l) => l.level !== 'system').map((l) => l.text).join('\n'), logs, settled }
  } finally {
    cleanup()
  }
}

export async function runKata(code: string, tests: KataTest[]): Promise<{ results: TestResult[]; logs: LogEntry[] }> {
  const logs: LogEntry[] = []
  const { rt, evalScript, cleanup } = makeContext(logs)
  try {
    return { results: await runKataTests(rt, evalScript, code, tests), logs }
  } finally {
    cleanup()
  }
}
