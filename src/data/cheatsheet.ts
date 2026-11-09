import type { CheatSection } from './types'

/*
 * Antisèche : résumé dense sur une page. Les lignes `expression // → valeur` sont vérifiées.
 */
export const cheatsheet: CheatSection[] = [
  {
    id: 'types-coercion',
    title: 'Types et coercition',
    blocks: [
      {
        title: 'typeof',
        code: `typeof null // → 'object'
typeof [] // → 'object'
typeof (() => {}) // → 'function'
typeof NaN // → 'number'
typeof 1n // → 'bigint'
typeof undeclaredVar // → 'undefined'`,
      },
      {
        title: 'Coercition à connaître',
        code: `1 + '2' // → '12'
'5' - 2 // → 3
true + true // → 2
null == undefined // → true
null == 0 // → false
'' == 0 // → true
NaN === NaN // → false
0.1 + 0.2 === 0.3 // → false`,
      },
      {
        title: 'Valeurs falsy (8)',
        items: ['`false`, `0`, `-0`, `0n`', '`\'\'`, `null`, `undefined`, `NaN`', 'Tout le reste est truthy : `\'0\'`, `\'false\'`, `[]`, `{}`'],
      },
      {
        title: 'Réflexes',
        items: [
          'Toujours `===` ; exception tolérée : `x == null` (null ou undefined)',
          '`Number.isNaN(x)` plutôt que `isNaN(x)`',
          '`Object.is(NaN, NaN)` → true, `Object.is(0, -0)` → false',
          'Argent : centimes entiers ; grands entiers : `BigInt`',
        ],
      },
    ],
  },
  {
    id: 'scope-hoisting',
    title: 'Portée et hoisting',
    blocks: [
      {
        title: 'var / let / const',
        items: [
          '`var` : portée fonction, hoistée à `undefined`, redéclarable, propriété de `window`',
          '`let` : portée bloc, TDZ avant la déclaration, réaffectable',
          '`const` : portée bloc, TDZ, non réaffectable (mais l’objet reste mutable)',
          'Déclaration de fonction : hoistée entièrement ; expression de fonction : non',
        ],
      },
      {
        title: 'Hoisting en un coup d’œil',
        code: `console.log(typeof hoisted, typeof notYet)
var notYet = function () {}
function hoisted() {}`,
        output: `function undefined`,
      },
    ],
  },
  {
    id: 'closures-this',
    title: 'Closures et this',
    blocks: [
      {
        title: 'Closure',
        code: `const makeId = () => {
  let id = 0
  return () => ++id
}
const nextId = makeId()
nextId() // → 1
nextId() // → 2`,
      },
      {
        title: 'this : ordre de priorité',
        items: [
          '1. `new Fn()` → le nouvel objet',
          '2. `fn.call(o)` / `apply(o)` / `bind(o)` → `o`',
          '3. `o.fn()` → `o`',
          '4. `fn()` → `undefined` (strict) ou `globalThis`',
          'Fléchée : `this` de la portée englobante, non modifiable',
          'Méthode passée en callback = `this` perdu → `bind` ou fléchée',
        ],
      },
      {
        title: 'call / apply / bind',
        code: `function intro(greeting) {
  return greeting + ', ' + this.who
}
intro.call({ who: 'Ada' }, 'Salut') // → 'Salut, Ada'
intro.apply({ who: 'Bob' }, ['Hello']) // → 'Hello, Bob'
intro.bind({ who: 'Eve' })('Hi') // → 'Hi, Eve'`,
      },
    ],
  },
  {
    id: 'prototypes-classes',
    title: 'Prototypes et classes',
    blocks: [
      {
        title: 'Chaîne de prototypes',
        code: `class A {}
class B extends A {}
const b = new B()
Object.getPrototypeOf(b) === B.prototype // → true
Object.getPrototypeOf(B.prototype) === A.prototype // → true
b instanceof A // → true
typeof B // → 'function'`,
      },
      {
        title: 'À retenir',
        items: [
          '`Fn.prototype` : modèle des instances ; `Object.getPrototypeOf(obj)` (ex-`__proto__`) : lien de l’objet',
          '`Object.create(proto)` : objet dont le prototype est `proto`',
          '`super()` avant `this` dans un constructeur dérivé',
          '`#champ` : privé réel ; `static` : sur la classe',
        ],
      },
    ],
  },
  {
    id: 'event-loop',
    title: 'Event loop',
    blocks: [
      {
        title: 'Ordre d’exécution',
        items: [
          '1. Code synchrone (pile d’appels)',
          '2. Toutes les microtâches : `then`, `catch`, `finally`, suite d’`await`, `queueMicrotask`',
          '3. Rendu éventuel : `requestAnimationFrame`, style, layout, paint',
          '4. Une macrotâche : `setTimeout`, `setInterval`, événements, puis retour en 2',
        ],
      },
      {
        title: 'Puzzle type',
        code: `setTimeout(() => console.log('D'))
Promise.resolve().then(() => console.log('C'))
;(async () => {
  console.log('A')
  await null
  console.log('C2')
})()
console.log('B')`,
        output: `A
B
C
C2
D`,
      },
    ],
  },
  {
    id: 'promises',
    title: 'Promesses et async/await',
    blocks: [
      {
        title: 'Combinateurs',
        items: [
          '`Promise.all` : toutes tenues, ou rejet au premier échec',
          '`Promise.allSettled` : attend tout, ne rejette jamais (`status`, `value`/`reason`)',
          '`Promise.race` : la première réglée (succès ou échec)',
          '`Promise.any` : la première tenue ; `AggregateError` si toutes échouent',
        ],
      },
      {
        title: 'Réflexes async',
        items: [
          'Une fonction `async` renvoie toujours une promesse',
          'Opérations indépendantes : lancer puis `await Promise.all([...])`',
          '`forEach` n’attend pas : `for...of` ou `Promise.all(arr.map(...))`',
          'Toujours un `catch` (ou `try/catch` autour de `await`)',
          '`then` sans `return` = la suite n’attend rien',
        ],
      },
      {
        title: 'Propagation d’erreur',
        code: `Promise.reject(new Error('x'))
  .then(() => console.log('jamais'))
  .catch((e) => e.message + '!')
  .then((v) => console.log(v))`,
        output: `x!`,
      },
    ],
  },
  {
    id: 'es6',
    title: 'ES6+',
    blocks: [
      {
        title: 'Opérateurs',
        code: `const conf = { port: 0, retries: null }
conf.port || 8080 // → 8080
conf.port ?? 8080 // → 0
conf.db?.host // → undefined
conf.retries ??= 3
conf.retries // → 3
const { port, debug = false, ...others } = conf
others // → { retries: 3 }
Math.max(...[1, 5, 3]) // → 5`,
      },
      {
        title: 'Collections',
        code: `[...new Set([1, 1, 2])] // → [ 1, 2 ]
new Map([['k', 1]]).get('k') // → 1
Object.entries({ a: 1 }) // → [ [ 'a', 1 ] ]
Object.fromEntries([['b', 2]]) // → { b: 2 }`,
      },
      {
        title: 'À retenir',
        items: [
          'Défaut de déstructuration : seulement si `undefined` (pas `null`)',
          '`...` à droite étale (spread), à gauche ramasse (rest)',
          '`a ||= b` (falsy), `a ??= b` (nullish), `a &&= b` (truthy)',
          '`Symbol` : clé unique ; `function*` + `yield` : générateur',
        ],
      },
    ],
  },
  {
    id: 'arrays',
    title: 'Tableaux',
    blocks: [
      {
        title: 'Mutent / ne mutent pas',
        items: [
          'Mutent : `push` `pop` `shift` `unshift` `splice` `sort` `reverse` `fill`',
          'Copient : `map` `filter` `slice` `concat` `flat` `toSorted` `toReversed` `toSpliced` `with`',
          '`sort()` sans comparateur = tri de chaînes',
          '`reduce` : toujours une valeur initiale',
        ],
      },
      {
        title: 'Exemples',
        code: `const nums = [10, 1, 5]
nums.toSorted() // → [ 1, 10, 5 ]
nums.toSorted((a, b) => a - b) // → [ 1, 5, 10 ]
nums.with(0, 0) // → [ 0, 1, 5 ]
nums // → [ 10, 1, 5 ]
nums.reduce((acc, n) => acc + n, 0) // → 16
nums.flatMap((n) => [n, n]).length; // → 6
[].every((n) => n > 0) // → true`,
      },
    ],
  },
  {
    id: 'copies',
    title: 'Objets et copies',
    blocks: [
      {
        title: 'Méthodes de copie',
        items: [
          '`{ ...o }`, `Object.assign({}, o)`, `[...a]`, `a.slice()` : superficielle (1 niveau)',
          '`structuredClone(o)` : profonde, gère Date/Map/Set/cycles, pas les fonctions',
          '`JSON.parse(JSON.stringify(o))` : perd undefined, fonctions, Date, Map/Set',
          '`Object.freeze` : superficiel aussi',
        ],
      },
      {
        title: 'Références',
        code: `const orig = { deep: { n: 1 } }
const shallow = { ...orig }
const deep = structuredClone(orig)
shallow.deep === orig.deep // → true
deep.deep === orig.deep; // → false
({ a: 1 }) === ({ a: 1 }) // → false`,
      },
    ],
  },
  {
    id: 'modules',
    title: 'Modules',
    blocks: [
      {
        title: 'ESM contre CommonJS',
        items: [
          'ESM : `import`/`export`, statique, strict, liaisons vivantes en lecture seule, top-level `await`',
          'CJS : `require`/`module.exports`, dynamique, synchrone, copie des valeurs',
          'Plusieurs exports nommés, un seul `export default`',
          '`import()` dynamique renvoie une promesse : code splitting',
          'Tree shaking grâce à la structure statique ESM',
          '`<script type="module">` : différé, strict, portée propre',
        ],
      },
    ],
  },
  {
    id: 'dom-events',
    title: 'DOM et événements',
    blocks: [
      {
        title: 'Événements',
        items: [
          'Phases : capture (descente) → cible → bouillonnement (remontée)',
          '`addEventListener(type, fn, { capture, once, passive, signal })`',
          '`preventDefault()` : annule l’action du navigateur',
          '`stopPropagation()` : arrête la remontée',
          '`target` = élément d’origine, `currentTarget` = élément écouteur',
          'Délégation : un écouteur sur le parent + `event.target.closest(sel)`',
          '`DOMContentLoaded` (DOM prêt) avant `load` (images et CSS chargées)',
          '`querySelectorAll` statique, `getElementsBy*` vivant',
        ],
      },
      {
        title: 'Délégation',
        run: false,
        code: `list.addEventListener('click', (e) => {
  const item = e.target.closest('li')
  if (item) select(item.dataset.id)
})`,
      },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    blocks: [
      {
        title: 'Debounce et throttle',
        code: `const debounce = (fn, ms) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
const throttle = (fn, ms) => {
  let last = 0
  return (...args) => {
    if (Date.now() - last >= ms) {
      last = Date.now()
      fn(...args)
    }
  }
}
const log = debounce((v) => console.log('debounced', v), 20)
log(1)
log(2)
const tick = throttle((v) => console.log('throttled', v), 1000)
tick(1)
tick(2)`,
        output: `throttled 1
debounced 2`,
      },
      {
        title: 'Réflexes',
        items: [
          'Debounce : recherche, autosave, resize terminé ; throttle : scroll, mousemove',
          'Mémoïser les fonctions pures coûteuses (cache `Map`)',
          'Lire tout le layout, puis écrire tout (pas de thrashing)',
          'Animations : `requestAnimationFrame`, `transform`/`opacity`',
          '`includes` dans une boucle = O(n²) → `Set`',
          'Calcul lourd → Web Worker (pas d’accès au DOM)',
        ],
      },
    ],
  },
  {
    id: 'web-security',
    title: 'Web et sécurité',
    blocks: [
      {
        title: 'fetch',
        items: [
          'Rejette seulement sur erreur réseau : tester `response.ok` pour les 4xx/5xx',
          '`await res.json()` est aussi asynchrone',
          'Annulation : `AbortController` / `AbortSignal.timeout(ms)`',
        ],
      },
      {
        title: 'Stockage',
        items: [
          'Cookie : 4 Ko, envoyé à chaque requête, `HttpOnly; Secure; SameSite`',
          '`localStorage` : permanent, par origine, lisible par tout script',
          '`sessionStorage` : par onglet, effacé à la fermeture',
        ],
      },
      {
        title: 'Sécurité',
        items: [
          'XSS : `textContent` plutôt que `innerHTML`, assainir, CSP',
          'CSRF : `SameSite`, jeton anti-CSRF, vérifier `Origin`, pas de GET modifiant',
          'CORS : autorisation donnée par le **serveur** (`Access-Control-Allow-Origin`)',
          'Preflight `OPTIONS` : méthodes non simples, JSON, en-têtes personnalisés',
          'HTTPS + HSTS : chiffrement, intégrité, authentification du serveur',
        ],
      },
    ],
  },
  {
    id: 'algo',
    title: 'Algorithmique',
    blocks: [
      {
        title: 'Complexités à connaître',
        items: [
          'O(1) accès `arr[i]`, `push`/`pop` (amorti), `Map.get`/`Set.has` (en moyenne)',
          'O(log n) recherche dichotomique, boucle qui divise par 2',
          'O(n) un parcours, `includes`, `indexOf`, `shift`, `unshift`',
          'O(n log n) `sort`, tri fusion ; tri rapide en moyenne (pire cas O(n²))',
          'O(n²) boucles imbriquées sur toutes les paires',
          'O(2ⁿ) sous-ensembles, récursion naïve à deux appels ; O(n!) permutations',
          'BFS / DFS : O(V + E) ; grille : O(lignes × colonnes)',
        ],
      },
      {
        title: 'Reconnaître le motif',
        items: [
          'doublons, fréquences, anagrammes, complément → `Map` / `Set`',
          'tableau trié, paire, palindrome, en place → deux pointeurs',
          'sous-tableau contigu « le plus long / de taille k » → fenêtre glissante',
          'trié, « minimum tel que » → recherche dichotomique',
          'toutes les combinaisons / permutations → backtracking',
          'parenthèses, annuler, « plus proche précédent » → pile',
          'plus court chemin non pondéré, par niveaux → BFS (file)',
          'sous-problèmes qui se recoupent, « nombre de façons », « minimum de » → programmation dynamique',
        ],
      },
      {
        title: 'Gabarits',
        code: `const sorted = [10, 9, 1].sort((a, b) => a - b)
sorted // → [ 1, 9, 10 ]

function lowerBound(arr, target) {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}
lowerBound([1, 2, 2, 2, 5], 2) // → 1

const queue = ['a', 'b']
let head = 0
queue[head++] // → 'a'

const memo = new Map()
const fib = (n) => (n < 2 ? n : memo.get(n) ?? (memo.set(n, fib(n - 1) + fib(n - 2)), memo.get(n)))
fib(50) // → 12586269025`,
      },
      {
        title: 'Réflexes',
        items: [
          'Annoncer la solution naïve et sa complexité, puis optimiser',
          'Toujours donner temps **et** mémoire',
          'Cas limites : vide, un élément, doublons, négatifs, déjà trié',
          '`sort()` sans comparateur trie des chaînes ; il modifie le tableau (`toSorted()` copie)',
          'Une file avec `shift()` est en O(n) par retrait : indice de tête',
          'Récursion profonde (≈ 10 000 niveaux) → pile explicite',
        ],
      },
    ],
  },
  {
    id: 'mnemotechniques',
    title: 'Mnémotechniques',
    blocks: [
      {
        title: 'Phrases à retenir',
        items: [
          '« 3 égal, 0 surprise » : `===` ne convertit jamais',
          '« 8 vides » : false, 0, -0, 0n, chaîne vide, null, undefined, NaN',
          '« var voyage, let loge » : var traverse les blocs, let reste dans le sien',
          '« La fonction part avec son sac à dos » : closure',
          '« Qui appelle ? » et « N.E.I.D. » : New, Explicite, Implicite, Défaut',
          '« prototype est le moule, __proto__ est le lien »',
          '« Synchrone, micro, rendu, macro » : l’event loop',
          '« All tous, AllSettled tout le monde, Race le premier, Any le premier qui réussit »',
          '« ?? pour le vide, || pour le faux »',
          '« Les verbes d’action mutent, to-quelque-chose copie »',
          '« Copier un objet, c’est copier l’adresse, pas la maison »',
          '« import = fenêtre, require = photo »',
          '« preventDefault empêche le navigateur, stopPropagation empêche les parents »',
          '« Debounce attend que tu te taises, throttle te laisse parler une fois par seconde »',
          '« fetch ne pleure que si le réseau meurt »',
          '« XSS = son code chez vous ; CSRF = votre session chez lui »',
          '« Trié ? Pense dichotomie ou deux pointeurs. Contigu ? Fenêtre. Déjà vu ? Map. »',
        ],
      },
    ],
  },
]
