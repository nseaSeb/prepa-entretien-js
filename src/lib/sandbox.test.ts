/** Tests du bac à sable lui-même (formatage, ordre de la boucle d'événements, erreurs). */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runKata, runSnippet } from './sandbox/node'
import { formatValue } from './sandbox/format'
import { arrowTransform } from './contentCheck'

const out = async (code: string) => (await runSnippet(code)).output

test('formatage des valeurs', () => {
  assert.equal(formatValue([1, 'a', [2, [3, [4]]], { a: 1, 'b-c': undefined }]), "[ 1, 'a', [ 2, [ 3, [Array] ] ], { a: 1, 'b-c': undefined } ]")
  assert.equal(formatValue(new Map([['k', 1]])), "Map(1) { 'k' => 1 }")
  assert.equal(formatValue(new Set([1, 2])), 'Set(2) { 1, 2 }')
  // eslint-disable-next-line no-sparse-arrays
  assert.equal(formatValue([, , 1]), '[ <2 empty items>, 1 ]')
  assert.equal(formatValue(-0), '-0')
  assert.equal(formatValue('x'), 'x')
  assert.equal(formatValue('x', true), "'x'")
  assert.equal(formatValue({}), '{}')
  assert.equal(formatValue([]), '[]')
  assert.equal(formatValue(new TypeError('t')), 'TypeError: t')
})

test('microtâches avant macrotâches', async () => {
  assert.equal(
    await out(`console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); queueMicrotask(() => console.log('D')); console.log('E')`),
    'A\nE\nC\nD\nB',
  )
})

test('var + setTimeout dans une boucle', async () => {
  assert.equal(await out(`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)`), '3\n3\n3')
})

test('script global non strict : var devient propriété globale, this vaut globalThis', async () => {
  assert.equal(await out(`var v = 1; console.log(this.v, this === globalThis, window === globalThis)`), '1 true true')
})

test('TDZ et erreurs non attrapées', async () => {
  assert.equal(await out(`console.log(1); console.log(a); let a = 2`), "1\nUncaught ReferenceError: Cannot access 'a' before initialization")
})

test('rejet non géré', async () => {
  assert.equal(await out(`Promise.reject(new Error('boom')); console.log('après')`), 'après\nUncaught (in promise) Error: boom')
})

test('minuteur long capturé', async () => {
  assert.equal(await out(`setTimeout(() => console.log('fin'), 300)`), 'fin')
})

test('setInterval jamais arrêté : limite atteinte', async () => {
  const r = await runSnippet(`setInterval(() => {}, 50)`, { settleLimitMs: 300 })
  assert.equal(r.settled, false)
})

test('await au niveau supérieur', async () => {
  assert.equal(await out(`const v = await Promise.resolve(42); console.log(v)`), '42')
})

test('flèches // →', () => {
  const t = arrowTransform(`const a = 1\ntypeof null // → 'object'\na + 1; // → 2`)
  assert.deepEqual(t.expected, ["'object'", '2'])
  assert.equal(t.code, `const a = 1\n__arrow((typeof null));\n__arrow((a + 1));`)
})

test('kata : réussite, échec, délai', async () => {
  const { results } = await runKata(`function add(a, b) { return a + b }`, [
    { name: 'ok', code: 'assertEqual(add(1, 2), 3)' },
    { name: 'ko', code: 'assertEqual(add(1, 2), 4)' },
    { name: 'async', code: 'await sleep(10); assert(add(1, 1) === 2)' },
  ])
  assert.deepEqual(results.map((r) => r.ok), [true, false, true])
  assert.equal(results[1].error, 'attendu 4, obtenu 3')
})

test('structuredClone : copies dans le même realm, prototype perdu, cycles, fonctions refusées', async () => {
  assert.equal(
    await out(`class P { constructor() { this.x = 1 } }
const o = { d: new Date(0), m: new Map([[1, { a: [1] }]]), p: new P() }
o.self = o
const c = structuredClone(o)
console.log(c.d instanceof Date, c.d !== o.d, c.m.get(1).a, c.p instanceof P, c.p, c.self === c)
try { structuredClone({ f() {} }) } catch (e) { console.log(e.name) }`),
    'true true [ 1 ] false { x: 1 } true\nDataCloneError',
  )
})

// --- revue de code : régressions ---------------------------------------------

test('kata : le budget total couvre le délai par test de chaque test (promesses jamais résolues)', async () => {
  const { kataBudgetMs } = await import('./sandbox/client')
  const { KATA_PER_TEST_MS } = await import('./sandbox/runtime')
  for (let n = 1; n <= 12; n++) assert.ok(kataBudgetMs(n) >= n * KATA_PER_TEST_MS + 1000, `budget insuffisant pour ${n} tests : ${kataBudgetMs(n)} ms`)
  assert.ok(kataBudgetMs(8) <= 30000, 'budget total déraisonnable')
  const t0 = Date.now()
  const hang = { name: 'h', code: 'await new Promise(() => {})' }
  const { results } = await runKata(`function f() {}`, [hang, { ...hang, name: 'h2' }, { ...hang, name: 'h3' }])
  const elapsed = Date.now() - t0
  assert.equal(results.length, 3)
  for (const r of results) assert.match(r.error ?? '', /délai dépassé .*une promesse ne se résout jamais \?/)
  assert.ok(elapsed < kataBudgetMs(3), `les tests (${elapsed} ms) dépassent le budget du worker (${kataBudgetMs(3)} ms)`)
})

test('deepEqual : Set avec appariement un-à-un, primitives encapsulées, cycles', async () => {
  const { deepEqual } = await import('./sandbox/runtime')
  assert.equal(deepEqual(new Set([[1], [1]]), new Set([[1], [2]])), false)
  assert.equal(deepEqual(new Set([[1], [2]]), new Set([[2], [1]])), true)
  assert.equal(deepEqual(new Set([1, NaN, { a: 1 }]), new Set([NaN, { a: 1 }, 1])), true)
  assert.equal(deepEqual(new Number(1), new Number(2)), false)
  assert.equal(deepEqual(new Number(1), new Number(1)), true)
  assert.equal(deepEqual(new String('a'), new String('b')), false)
  assert.equal(deepEqual(new Boolean(true), new Boolean(false)), false)
  assert.equal(deepEqual(Object(1n), Object(2n)), false)
  // une comparaison ratée ne doit pas être mémorisée comme « égale »
  const m1 = { v: 1 }
  const n1 = { v: 2 }
  assert.equal(deepEqual([new Set([{ n: m1 }, { n: { v: 2 } }]), m1], [new Set([{ n: n1 }, { n: m1 }]), n1]), false)
  // cycles
  const a: Record<string, unknown> = { x: 1 }
  a.self = a
  const b: Record<string, unknown> = { x: 1 }
  b.self = b
  assert.equal(deepEqual(a, b), true)
  const c: Record<string, unknown> = { x: 2 }
  c.self = c
  assert.equal(deepEqual(a, c), false)
})

test('formatage : fonctions et classes avec propriétés circulaires ou profondes', async () => {
  assert.equal(await out(`function f() {}; f.self = f; console.log(f)`), '[Function: f] { self: [Circular] }')
  assert.equal(await out(`class A { static me = A }; console.log(A)`), '[class A] { me: [Circular] }')
  assert.equal(await out(`function g() {}; g.x = { y: { z: { w: 1 } } }; console.log(g)`), '[Function: g] { x: { y: { z: [Object] } } }')
  assert.equal(await out(`function h() {}; function g() {}; g.p = 1; console.log({ a: { b: { c: h, e: g } } })`), '{ a: { b: { c: [Function: h], e: [Function] } } }')
})

test('%j : circulaire → [Circular], BigInt → TypeError comme Node', async () => {
  assert.equal(await out(`const o = {}; o.o = o; console.log('%j', o)`), '[Circular]')
  assert.equal(await out(`console.log('%j', { a: 1 })`), '{"a":1}')
  assert.equal(await out(`console.log('%j', 1n)`), 'Uncaught TypeError: Do not know how to serialize a BigInt')
})

test('console : groupCollapsed et timeLog existent', async () => {
  assert.equal(await out(`console.groupCollapsed('g'); console.log('x'); console.groupEnd(); console.log('y')`), 'g\n  x\ny')
  const r = await out(`console.time('t'); console.timeLog('t', 'étape')`)
  assert.match(r, /^t: \d+ ms étape$/)
})

test('règle « output obligatoire » : toutes les méthodes console qui affichent', async () => {
  const { checkSnippet } = await import('./contentCheck')
  for (const code of [`console.count()`, `console.group('g')`, `console.groupCollapsed('g')`, `console.assert(false)`, `console.trace('t')`, `console.time(); console.timeEnd()`, `console.time(); console.timeLog()`, `console.table([1])`, `console.dir({})`, `console.countReset()`])
    await assert.rejects(checkSnippet('t', { code }), /il faut un champ output exact/, code)
})

test('hash : décodage sûr de l’ancre', async () => {
  const { parseHash } = await import('./nav')
  assert.deepEqual(parseHash('#cours/%', ['cours']), ['cours', '%'])
  assert.deepEqual(parseHash('#cours/algo-big-o', ['cours']), ['cours', 'algo-big-o'])
  assert.deepEqual(parseHash('#cours/caf%C3%A9', ['cours']), ['cours', 'café'])
  assert.deepEqual(parseHash('#inconnu', ['cours']), ['accueil', undefined])
})
