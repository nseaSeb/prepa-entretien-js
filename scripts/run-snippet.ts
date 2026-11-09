/**
 * Exécute un extrait JS dans le même bac à sable que les tests et affiche la sortie console exacte.
 *   npx tsx scripts/run-snippet.ts fichier.js
 *   echo "console.log(typeof null)" | npx tsx scripts/run-snippet.ts
 */
import { readFileSync } from 'node:fs'
import { runSnippet } from '../src/lib/sandbox/node'

const file = process.argv[2]
const code = file ? readFileSync(file, 'utf8') : readFileSync(0, 'utf8')
const r = await runSnippet(code)
process.stdout.write(r.output + '\n')
if (!r.settled) process.stdout.write('[minuteurs encore actifs : limite atteinte]\n')
process.exit(0)
