/// <reference lib="es2023" />
/**
 * Web Worker TypeScript : compilateur + fichiers lib en mémoire. Chargé à la demande (pages et modes TS),
 * donc le compilateur reste hors du bundle principal. Un seul worker, réutilisé entre les requêtes.
 * Envoie `ready` une fois le compilateur prêt (ou `fatal` si son initialisation échoue).
 */
import ts from 'typescript'
import { createChecker, LIB_FILES, type Checker, type Diag, type TypeTest, type TypeTestResult } from './core'

export type TsRequest =
  | { id: number; type: 'compile'; code: string }
  | { id: number; type: 'check'; code: string }
  | { id: number; type: 'quickInfo'; code: string; pos: number }
  | { id: number; type: 'typeTests'; code: string; tests: TypeTest[] }
  | { id: number; type: 'kata'; code: string; typeTests: TypeTest[] }
export type TsResponse =
  | { id: number; type: 'compile'; diagnostics: Diag[]; js: string | null; reason: string | null }
  | { id: number; type: 'check'; diagnostics: Diag[] }
  | { id: number; type: 'quickInfo'; info: { text: string; doc: string; start: number; length: number } | null }
  | { id: number; type: 'typeTests'; results: TypeTestResult[]; codeErrors: Diag[] }
  | { id: number; type: 'kata'; typeResults: TypeTestResult[]; codeErrors: Diag[]; js: string | null; reason: string | null }
  | { id: number; type: 'error'; message: string }
  | { id: 0; type: 'ready' }
  | { id: 0; type: 'fatal'; message: string }

const scope = self as unknown as { postMessage: (m: TsResponse) => void; addEventListener: (t: 'message', fn: (e: MessageEvent<TsRequest>) => void) => void }

let checker: Checker | null = null
try {
  const raw = import.meta.glob(
    ['/node_modules/typescript/lib/lib.es5.d.ts', '/node_modules/typescript/lib/lib.es20{15,16,17,18,19,20,21,22}*.d.ts', '/node_modules/typescript/lib/lib.dom*.d.ts', '/node_modules/typescript/lib/lib.decorators*.d.ts', '!**/*.full.d.ts'],
    { query: '?raw', import: 'default', eager: true },
  ) as Record<string, string>
  const byName = new Map(Object.entries(raw).map(([path, text]) => [path.split('/').pop()!, text]))
  checker = createChecker(ts, (name) => (LIB_FILES.includes(name) ? byName.get(name) : undefined))
  scope.postMessage({ id: 0, type: 'ready' })
} catch (err) {
  scope.postMessage({ id: 0, type: 'fatal', message: err instanceof Error ? err.message : String(err) })
}

scope.addEventListener('message', (e) => {
  const r = e.data
  if (!checker) return
  try {
    if (r.type === 'compile') {
      const diagnostics = checker.check(r.code)
      scope.postMessage({ id: r.id, type: 'compile', diagnostics, ...checker.runnable(r.code) })
    } else if (r.type === 'check') scope.postMessage({ id: r.id, type: 'check', diagnostics: checker.check(r.code) })
    else if (r.type === 'quickInfo') scope.postMessage({ id: r.id, type: 'quickInfo', info: checker.quickInfo(r.code, r.pos) })
    else if (r.type === 'kata') scope.postMessage({ id: r.id, type: 'kata', ...checker.kata(r.code, r.typeTests) })
    else scope.postMessage({ id: r.id, type: 'typeTests', ...checker.runTypeTests(r.code, r.tests) })
  } catch (err) {
    scope.postMessage({ id: r.id, type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
})
