import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { checkTs, compileTs, quickInfoTs, type Diag } from './ts/client'
import type { DiagState } from '../components/DiagnosticsView'
import type { EditorDiag, HoverInfo } from '../components/JsEditor'

/**
 * Vérification TypeScript au fil de la frappe (anti-rebond) et compilation pour l'exécution.
 * `enabled` à false : aucun chargement du compilateur.
 */
export function useTsCheck(code: string, enabled: boolean, delayMs = 400) {
  const [diagnostics, setDiagnostics] = useState<Diag[]>([])
  const [state, setState] = useState<DiagState>('idle')
  const [error, setError] = useState<string | null>(null)
  const seq = useRef(0)

  const apply = useCallback((id: number, p: Promise<Diag[]>) => {
    setState((s) => (s === 'idle' ? 'loading' : s))
    return p.then(
      (d) => {
        if (id !== seq.current) return d
        setDiagnostics(d)
        setState('ok')
        setError(null)
        return d
      },
      (e: Error) => {
        if (id === seq.current) {
          setState('error')
          setError(e.message)
        }
        return [] as Diag[]
      },
    )
  }, [])

  useEffect(() => {
    if (!enabled) return
    const id = ++seq.current
    const t = setTimeout(() => void apply(id, checkTs(code)), delayMs)
    return () => clearTimeout(t)
  }, [code, enabled, delayMs, apply])

  /** Diagnostics + JS transpilé (null si l'extrait n'est pas exécutable : multi-fichiers). */
  const compile = useCallback(
    async (src: string) => {
      const id = ++seq.current
      let js: string | null = null
      const d = await apply(
        id,
        compileTs(src).then((r) => {
          js = r.js
          return r.diagnostics
        }),
      )
      return { diagnostics: d, js: js as string | null }
    },
    [apply],
  )

  const onHover = useCallback((src: string, pos: number): Promise<HoverInfo> => quickInfoTs(src, pos).catch(() => null), [])
  const editorDiags = useMemo<EditorDiag[]>(
    () => diagnostics.filter((d) => d.line > 0).map((d) => ({ start: d.start, length: d.length, message: `TS${d.code} : ${d.message}`, severity: d.category === 'error' ? 'error' : 'warning' })),
    [diagnostics],
  )
  return { diagnostics, editorDiags, state, error, compile, onHover }
}
