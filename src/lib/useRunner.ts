import { useCallback, useEffect, useRef, useState } from 'react'
import { runCode } from './sandbox/client'
import type { LogEntry } from './sandbox/runtime'
import type { ConsoleStatus } from '../components/ConsoleView'

/** Exécute du code dans le worker et expose la console au fil de l'eau. */
export function useRunner() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<ConsoleStatus>({ state: 'idle' })
  const runId = useRef(0)
  // worker de l'exécution en cours : arrêté dès qu'une nouvelle exécution démarre ou au démontage
  const current = useRef<AbortController | null>(null)
  useEffect(() => () => current.current?.abort(), [])
  const run = useCallback(async (code: string) => {
    const id = ++runId.current
    current.current?.abort()
    const ctrl = new AbortController()
    current.current = ctrl
    setLogs([])
    setStatus({ state: 'running' })
    const r = await runCode(code, { signal: ctrl.signal, onLog: (e) => id === runId.current && setLogs((l) => [...l, e]) })
    if (id !== runId.current) return
    current.current = null
    setLogs(r.logs)
    setStatus({ state: r.status, ms: r.ms })
  }, [])
  const clear = useCallback(() => {
    setLogs([])
    setStatus({ state: 'idle' })
  }, [])
  return { logs, status, run, clear }
}
