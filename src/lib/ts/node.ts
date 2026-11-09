/**
 * Vérificateur TypeScript côté Node (tests, scripts). Même cœur et mêmes fichiers lib que le worker.
 * Fichier réservé aux tests (exclu de tsconfig.app).
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import ts from 'typescript'
import { createChecker, type Checker } from './core'

const libDir = dirname(createRequire(import.meta.url).resolve('typescript/lib/lib.es5.d.ts'))
let checker: Checker | null = null

export function getChecker(): Checker {
  checker ??= createChecker(ts, (name) => {
    try {
      return readFileSync(join(libDir, name), 'utf8')
    } catch {
      return undefined
    }
  })
  return checker
}
