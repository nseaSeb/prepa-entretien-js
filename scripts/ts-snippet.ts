/**
 * Extrait TypeScript : diagnostics du compilateur (même configuration que les tests et le navigateur),
 * type de chaque alias / variable de premier niveau, puis sortie console exacte du JS transpilé.
 *   npx tsx scripts/ts-snippet.ts fichier.ts
 *   echo "const xs = [1, 'a'] as const" | npx tsx scripts/ts-snippet.ts
 */
import { readFileSync } from 'node:fs'
import { runSnippet } from '../src/lib/sandbox/node'
import { getChecker } from '../src/lib/ts/node'

const file = process.argv[2]
const code = file ? readFileSync(file, 'utf8') : readFileSync(0, 'utf8')
const c = getChecker()
const diags = c.check(code)
process.stdout.write(diags.length ? diags.map((d) => `✗ ligne ${d.line}:${d.col} TS${d.code} ${d.message}`).join('\n') + '\n' : '✓ 0 diagnostic\n')
const names = [...code.matchAll(/^\s*(?:export\s+)?(?:type|const|let|var|function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1])
for (const n of new Set(names)) process.stdout.write(`  ${n} : ${c.typeOf(code, n)}\n`)
const claims = c.checkClaims(code)
if (claims.length) process.stdout.write(claims.map((x) => `✗ ${x}`).join('\n') + '\n')
const exe = c.runnable(code)
if (exe.js === null) process.stdout.write(`(non exécuté : ${exe.reason})\n`)
else {
  const r = await runSnippet(exe.js)
  process.stdout.write('--- sortie ---\n' + r.output + '\n')
}
process.exit(0)
