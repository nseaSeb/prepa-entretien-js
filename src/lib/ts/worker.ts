/// <reference lib="es2023" />
/**
 * Web Worker TypeScript : compilateur + fichiers lib en mémoire. Chargé à la demande (pages et modes TS),
 * donc le compilateur reste hors du bundle principal. Un seul worker, réutilisé entre les requêtes.
 */
import ts from 'typescript'
import { createChecker, LIB_FILES, type Diag, type TypeTest, type TypeTestResult } from './core'

const raw = import.meta.glob(
  ['/node_modules/typescript/lib/lib.es5.d.ts', '/node_modules/typescript/lib/lib.es20{15,16,17,18,19,20,21,22}*.d.ts', '/node_modules/typescript/lib/lib.dom*.d.ts', '/node_modules/typescript/lib/lib.decorators*.d.ts', '!**/*.full.d.ts'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>
const byName = new Map(Object.entries(raw).map(([path, text]) => [path.split('/').pop()!, text]))
const checker = createChecker(ts, (name) => (LIB_FILES.includes(name) ? byName.get(name) : undefined))

export type TsRequest =
  | { id: number; type: 'compile'; code: string }
  | { id: number; type: 'check'; code: string }
  | { id: number; type: 'quickInfo'; code: string; pos: number }
  | { id: number; type: 'typeTests'; code: string; tests: TypeTest[] }
export type TsResponse =
  | { id: number; type: 'compile'; diagnostics: Diag[]; js: string | null }
  | { id: number; type: 'check'; diagnostics: Diag[] }
  | { id: number; type: 'quickInfo'; info: { text: string; doc: string; start: number; length: number } | null }
  | { id: number; type: 'typeTests'; results: TypeTestResult[]; codeErrors: Diag[] }
  | { id: number; type: 'error'; message: string }

const scope = self as unknown as { postMessage: (m: TsResponse) => void; addEventListener: (t: 'message', fn: (e: MessageEvent<TsRequest>) => void) => void }

scope.addEventListener('message', (e) => {
  const r = e.data
  try {
    if (r.type === 'compile') {
      const diagnostics = checker.check(r.code)
      scope.postMessage({ id: r.id, type: 'compile', diagnostics, js: checker.isMultiFile(r.code) ? null : checker.transpile(r.code) })
    } else if (r.type === 'check') scope.postMessage({ id: r.id, type: 'check', diagnostics: checker.check(r.code) })
    else if (r.type === 'quickInfo') scope.postMessage({ id: r.id, type: 'quickInfo', info: checker.quickInfo(r.code, r.pos) })
    else scope.postMessage({ id: r.id, type: 'typeTests', ...checker.runTypeTests(r.code, r.tests) })
  } catch (err) {
    scope.postMessage({ id: r.id, type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
})
