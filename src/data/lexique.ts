import type { LexiqueEntry } from './types'
import { tsLexique } from './lexiqueTs'

/** Glossaire A–Z du vocabulaire d'entretien JavaScript. */
const jsLexique: LexiqueEntry[] = [
  {
    term: 'AbortController',
    def: "API standard qui permet d'annuler une opération asynchrone en cours, typiquement un `fetch`. On passe `controller.signal` à l'opération, puis `controller.abort()` la fait échouer avec une `AbortError`. C'est la bonne manière d'éviter des réponses obsolètes quand l'utilisateur relance une recherche ou quitte la page.",
    theme: 'async',
    see: ['Race condition', 'Promise'],
    code: `const controller = new AbortController()
fetch('/api/search?q=js', { signal: controller.signal })
  .catch((err) => console.log(err.name)) // 'AbortError'
controller.abort()`,
    run: false,
  },
  {
    term: 'Arrow function',
    def: "Fonction fléchée (`(a) => a * 2`), syntaxe courte introduite en ES6. Elle n'a pas son propre `this`, ni `arguments`, ni `prototype` : elle capture le `this` du contexte lexical où elle est définie. On ne peut donc pas l'utiliser comme constructeur avec `new`, et elle est mal adaptée aux méthodes d'objet qui doivent utiliser `this`.",
    theme: 'this',
    see: ['this', 'Lexical scope', 'Bind'],
    code: `const timer = {
  seconds: 0,
  start() {
    const tick = () => ++this.seconds
    return tick()
  },
}
timer.start() // → 1`,
  },
  {
    term: 'Async/await',
    def: "Syntaxe construite sur les promesses : une fonction `async` renvoie toujours une promesse, et `await` suspend son exécution jusqu'à ce que la promesse attendue soit réglée, sans bloquer le thread. Le code asynchrone se lit alors comme du code séquentiel, et les erreurs se gèrent avec un `try/catch` classique. La reprise après un `await` passe par la file des microtâches.",
    theme: 'async',
    see: ['Promise', 'Microtask', 'Event loop'],
    code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function main() {
  console.log('début')
  await wait(10)
  console.log('fin')
}
main()
console.log('pendant')`,
    output: 'début\npendant\nfin',
  },
  {
    term: 'BigInt',
    def: "Type primitif pour les entiers de taille arbitraire, écrit avec un suffixe `n` (`10n`). Il sert dès qu'on dépasse `Number.MAX_SAFE_INTEGER` (2^53 − 1), au-delà duquel les `number` perdent en précision. On ne peut pas mélanger directement `BigInt` et `number` dans une opération arithmétique : cela lève une `TypeError`.",
    theme: 'types',
    code: `Number.MAX_SAFE_INTEGER + 2 // → 9007199254740992
2n ** 64n // → 18446744073709551616n
typeof 10n // → 'bigint'`,
  },
  {
    term: 'Bind',
    def: "Méthode `Function.prototype.bind` qui renvoie une nouvelle fonction dont le `this` est fixé définitivement (et éventuellement certains arguments pré-remplis). Contrairement à `call` et `apply`, qui appellent la fonction immédiatement, `bind` ne l'exécute pas. C'est la solution classique quand on passe une méthode en callback et qu'on perd son `this`.",
    theme: 'this',
    see: ['this', 'Arrow function', 'Currying'],
    code: `const user = { first: 'Ada', hello() { return this.first } }
const loose = user.hello
const bound = user.hello.bind(user)
loose() // → undefined
bound() // → 'Ada'`,
  },
  {
    term: 'Bubbling',
    def: "Remontée (bouillonnement) d'un événement DOM : après avoir atteint sa cible, l'événement remonte vers ses ancêtres jusqu'à `document` et `window`, en déclenchant les écouteurs de chacun. C'est la phase par défaut des écouteurs et le mécanisme qui rend possible la délégation d'événements. `event.stopPropagation()` interrompt cette remontée.",
    theme: 'dom',
    see: ['Capture', "Délégation d'événements", 'stopPropagation'],
  },
  {
    term: 'Bundler',
    def: "Outil (Vite/Rollup, webpack, esbuild…) qui part d'un point d'entrée, suit le graphe des imports et produit un petit nombre de fichiers optimisés pour le navigateur. Il applique au passage la transpilation, le tree shaking, la minification et le découpage en chunks. En développement, il fournit aussi un serveur avec rechargement à chaud.",
    theme: 'modules',
    see: ['Tree shaking', 'Code splitting', 'Minification', 'Transpilation'],
  },
  {
    term: 'Call stack',
    def: "Pile d'appels : structure LIFO où le moteur empile un contexte d'exécution à chaque appel de fonction et le dépile à son retour. JavaScript n'en a qu'une par thread, d'où son caractère mono-thread : tant que la pile n'est pas vide, aucun callback de l'event loop ne peut s'exécuter. Une récursion sans condition d'arrêt la fait déborder (`RangeError`).",
    theme: 'eventloop',
    see: ['Event loop', 'Execution context'],
    code: `function loop() {
  loop()
}
loop()`,
    output: 'Uncaught RangeError: Maximum call stack size exceeded',
  },
  {
    term: 'Callback',
    def: "Fonction passée en argument à une autre fonction, qui l'appellera plus tard : immédiatement (callback synchrone, comme dans `map`) ou à la fin d'une opération (callback asynchrone, comme dans `setTimeout`). Les callbacks asynchrones imbriqués produisent le « callback hell », que les promesses et `async/await` ont largement remplacé.",
    theme: 'async',
    see: ['Higher-order function', 'Promise'],
    code: `function greet(format) {
  return format('Ada')
}
greet((who) => 'Salut ' + who) // → 'Salut Ada'`,
  },
  {
    term: 'Capture',
    def: "Première phase de propagation d'un événement DOM : il descend de `window` jusqu'au parent de la cible, avant la phase cible puis la remontée. Un écouteur ne s'y déclenche que s'il est enregistré avec `{ capture: true }` (ou `true` en troisième argument). Elle sert par exemple à intercepter un événement avant que les enfants ne le reçoivent.",
    theme: 'dom',
    see: ['Bubbling', 'Event listener'],
  },
  {
    term: 'Class',
    def: "Syntaxe ES6 (`class`, `constructor`, `extends`, `super`, champs, `#privé`, `static`) qui simplifie l'écriture de constructeurs et d'héritage. Sous le capot, c'est toujours de l'héritage prototypal : une classe est une fonction et ses méthodes vivent sur `Classe.prototype`. Différences notables : le corps est en mode strict, et une classe ne peut pas être appelée sans `new`.",
    theme: 'prototypes',
    see: ['Prototype', 'Strict mode'],
    code: `class Animal {
  speak() { return 'bruit' }
}
typeof Animal // → 'function'
typeof Animal.prototype.speak // → 'function'`,
  },
  {
    term: 'Closure',
    def: "Fermeture en français : une fonction associée à l'environnement lexical dans lequel elle a été créée. Elle garde accès aux variables de sa portée englobante même après la fin de l'exécution de celle-ci. Les closures servent à encapsuler un état privé, créer des fabriques de fonctions, ou implémenter debounce et memoization.",
    theme: 'closures',
    see: ['Lexical scope', 'IIFE', 'Memoization'],
    code: `function counter() {
  let count = 0
  return () => ++count
}
const next = counter()
next() // → 1
next() // → 2`,
  },
  {
    term: 'Code splitting',
    def: "Découpage du bundle en plusieurs morceaux (chunks) chargés à la demande, généralement via l'import dynamique `import()`. On réduit ainsi le JavaScript à télécharger et analyser au premier chargement, en différant les routes ou composants lourds. C'est l'une des premières optimisations à citer pour une page lente.",
    theme: 'perf',
    see: ['Bundler', 'Lazy loading'],
    code: `button.addEventListener('click', async () => {
  const { openEditor } = await import('./editor.js')
  openEditor()
})`,
    run: false,
  },
  {
    term: 'Coercion',
    def: "Coercition : conversion implicite d'une valeur d'un type vers un autre, par exemple lors de `==`, de `+` avec une chaîne, ou dans un `if`. Les règles sont précises mais peu intuitives : `+` concatène dès qu'un opérande est une chaîne, alors que `-` convertit toujours en nombre. On l'évite avec `===` et des conversions explicites (`Number()`, `String()`).",
    theme: 'types',
    see: ['Truthy', 'Falsy', 'NaN'],
    code: `'5' + 1 // → '51'
'5' - 1 // → 4
'' == 0 // → true
null == undefined // → true
null === undefined // → false`,
  },
  {
    term: 'CommonJS',
    def: "Système de modules historique de Node.js : `require()` pour importer, `module.exports` pour exporter. Le chargement est synchrone et dynamique (on peut appeler `require` n'importe où), et l'import est une copie de la valeur exportée au moment de l'appel. Il cède progressivement la place aux modules ES (ESM), standard du langage.",
    theme: 'modules',
    see: ['ESM', 'Live binding'],
    code: `// math.js
module.exports = { add: (a, b) => a + b }

// app.js
const { add } = require('./math')`,
    run: false,
  },
  {
    term: 'Cookie',
    def: "Petite donnée (environ 4 Ko) stockée par le navigateur pour un domaine et renvoyée automatiquement dans chaque requête HTTP vers ce domaine. C'est ce qui le rend adapté aux sessions, mais aussi exposé au CSRF. Les attributs `HttpOnly` (inaccessible au JS), `Secure` (HTTPS seulement) et `SameSite` sont essentiels pour la sécurité.",
    theme: 'web',
    see: ['Web Storage', 'CSRF', 'XSS'],
  },
  {
    term: 'CORS',
    def: "Cross-Origin Resource Sharing : mécanisme par lequel un serveur autorise explicitement, via des en-têtes comme `Access-Control-Allow-Origin`, des pages d'une autre origine à lire ses réponses. Il assouplit la same-origin policy de manière contrôlée. C'est le navigateur qui applique la règle : l'erreur CORS se règle côté serveur, pas dans le code front.",
    theme: 'web',
    see: ['Same-origin policy', 'Preflight'],
  },
  {
    term: 'CSP',
    def: "Content Security Policy : en-tête HTTP qui indique au navigateur quelles sources de scripts, styles, images ou connexions sont autorisées. En interdisant les scripts inline et les domaines inconnus, elle limite fortement l'impact d'une faille XSS. C'est une défense en profondeur, qui ne remplace pas l'échappement des données.",
    theme: 'web',
    see: ['XSS'],
  },
  {
    term: 'CSR',
    def: "Client-Side Rendering : le serveur envoie une page HTML quasi vide et un bundle JavaScript qui construit toute l'interface dans le navigateur. La navigation est ensuite fluide, mais le premier affichage est plus lent et le référencement plus délicat. C'est le mode par défaut d'une SPA classique.",
    theme: 'web',
    see: ['SSR', 'SSG', 'Hydratation'],
  },
  {
    term: 'CSRF',
    def: "Cross-Site Request Forgery : attaque où un site malveillant fait envoyer par le navigateur de la victime une requête vers un site où elle est connectée, en profitant de l'envoi automatique des cookies. Les défenses sont l'attribut `SameSite` des cookies, les jetons anti-CSRF et la vérification de l'origine. Elle se distingue de la XSS, qui injecte du code dans le site lui-même.",
    theme: 'web',
    see: ['Cookie', 'XSS'],
  },
  {
    term: 'Currying',
    def: "Curryfication : transformation d'une fonction à plusieurs arguments en une suite de fonctions à un seul argument, `f(a, b)` devenant `f(a)(b)`. Elle repose sur les closures et permet l'application partielle, c'est-à-dire créer des fonctions spécialisées à partir d'une fonction générique.",
    theme: 'closures',
    see: ['Closure', 'Higher-order function'],
    code: `const add = (a) => (b) => a + b
const addTen = add(10)
addTen(5) // → 15
add(2)(3) // → 5`,
  },
  {
    term: 'Debounce',
    def: "Technique qui retarde l'exécution d'une fonction jusqu'à ce qu'un certain délai se soit écoulé sans nouvel appel : chaque appel relance le minuteur. Seul le dernier appel d'une rafale est donc exécuté. Usage typique : lancer une recherche quand l'utilisateur a fini de taper.",
    theme: 'perf',
    see: ['Throttle', 'Closure'],
    code: `function debounce(fn, ms) {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
}
const search = debounce((q) => console.log('recherche', q), 50)
search('a')
search('ab')
search('abc')`,
    output: 'recherche abc',
  },
  {
    term: 'Deep copy',
    def: "Copie profonde : duplication récursive d'un objet et de tous les objets qu'il contient, de sorte que la copie ne partage aucune référence avec l'original. La solution moderne est `structuredClone`. L'astuce `JSON.parse(JSON.stringify(x))` perd les fonctions, `undefined`, les `Date` (transformées en chaînes) et échoue sur les références circulaires.",
    theme: 'objects',
    see: ['Shallow copy', 'structuredClone'],
  },
  {
    term: "Délégation d'événements",
    def: "Event delegation : au lieu d'attacher un écouteur à chaque élément enfant, on en attache un seul sur un parent commun et on identifie la cible réelle avec `event.target` (souvent `closest()`). Grâce au bubbling, cela fonctionne aussi pour les éléments ajoutés plus tard, et consomme moins de mémoire.",
    theme: 'dom',
    see: ['Bubbling', 'Event listener'],
    code: `list.addEventListener('click', (event) => {
  const item = event.target.closest('li')
  if (item) console.log('clic sur', item.dataset.id)
})`,
    run: false,
  },
  {
    term: 'Destructuring',
    def: "Affectation par décomposition : syntaxe qui extrait des valeurs d'un tableau (par position) ou d'un objet (par nom de propriété) dans des variables. Elle accepte des valeurs par défaut, le renommage et le rest. Très utilisée pour les paramètres de fonctions et les props de composants.",
    theme: 'es6',
    see: ['Rest', 'Spread'],
    code: `const { a, b: [first], c = 3 } = { a: 1, b: [2, 9] }
a + first + c // → 6`,
  },
  {
    term: 'DOM',
    def: "Document Object Model : représentation en arbre d'objets de la page HTML, exposée par le navigateur au JavaScript (`document`, `querySelector`, `appendChild`…). Le DOM n'appartient pas au langage JavaScript lui-même : c'est une API du navigateur. Le manipuler peut déclencher des recalculs de mise en page coûteux.",
    theme: 'dom',
    see: ['Reflow', 'Virtual DOM'],
  },
  {
    term: 'ESM',
    def: "ECMAScript Modules, le système de modules standard : `import` et `export`. Les imports sont statiques (analysables avant exécution, ce qui permet le tree shaking), les modules sont en mode strict, chargés de façon asynchrone et exécutés une seule fois. Les imports sont des live bindings, pas des copies.",
    theme: 'modules',
    see: ['CommonJS', 'Live binding', 'Tree shaking'],
    code: `// math.js
export const add = (a, b) => a + b
export default function multiply(a, b) { return a * b }

// app.js
import multiply, { add } from './math.js'`,
    run: false,
  },
  {
    term: 'Event emitter',
    def: "Patron de conception publication/abonnement : un objet expose `on` pour enregistrer des écouteurs sur un nom d'événement et `emit` pour les déclencher. On le retrouve dans Node.js (`EventEmitter`), dans le DOM (`addEventListener`) et dans de nombreuses bibliothèques. Il découple ceux qui émettent de ceux qui réagissent.",
    theme: 'objects',
    code: `class Emitter {
  constructor() { this.handlers = {} }
  on(evt, fn) { (this.handlers[evt] ??= []).push(fn) }
  emit(evt, ...args) { (this.handlers[evt] ?? []).forEach((fn) => fn(...args)) }
}
const bus = new Emitter()
bus.on('login', (user) => console.log('bienvenue', user))
bus.emit('login', 'Ada')`,
    output: 'bienvenue Ada',
  },
  {
    term: 'Event listener',
    def: "Écouteur d'événement : fonction enregistrée avec `addEventListener(type, handler, options)` et appelée quand l'événement se produit sur l'élément. Les options utiles sont `once`, `passive` (améliore le défilement) et `capture`. Pour le retirer avec `removeEventListener`, il faut passer exactement la même référence de fonction.",
    theme: 'dom',
    see: ['Bubbling', 'Capture', 'preventDefault'],
  },
  {
    term: 'Event loop',
    def: "Boucle d'événements : mécanisme qui permet à JavaScript, mono-thread, de gérer l'asynchrone. Quand la call stack est vide, elle exécute d'abord **toutes** les microtâches en attente (promesses), puis éventuellement un rendu, puis **une** macrotâche (minuteur, événement), et recommence. C'est pourquoi un `then` passe avant un `setTimeout(…, 0)`.",
    theme: 'eventloop',
    see: ['Call stack', 'Microtask', 'Macrotask'],
    code: `console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')`,
    output: 'A\nD\nC\nB',
  },
  {
    term: 'Execution context',
    def: "Contexte d'exécution : environnement créé par le moteur pour exécuter du code global ou une fonction. Il contient l'environnement des variables (avec le lien vers la portée parente), la valeur de `this` et, pour une fonction, ses arguments. Sa phase de création, qui enregistre les déclarations avant d'exécuter le code, explique le hoisting.",
    theme: 'scope',
    see: ['Call stack', 'Hoisting', 'this'],
  },
  {
    term: 'Falsy',
    def: "Valeur considérée comme fausse dans un contexte booléen. Il y en a exactement huit : `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` et `NaN`. Toutes les autres valeurs sont truthy, y compris `[]`, `{}` et la chaîne `'0'`.",
    theme: 'types',
    see: ['Truthy', 'Coercion', 'Nullish coalescing'],
    code: `Array.of(false, 0, -0, 0n, '', null, undefined, NaN).filter(Boolean) // → []`,
  },
  {
    term: 'Garbage collector',
    def: "Ramasse-miettes : partie du moteur qui libère automatiquement la mémoire des objets devenus inaccessibles. Les moteurs modernes utilisent un algorithme de marquage-balayage (mark-and-sweep) à partir des racines (objet global, pile d'appels) : ce qui n'est plus atteignable est libéré, même en cas de références circulaires. On ne le déclenche pas soi-même, mais on peut l'empêcher de travailler en gardant des références inutiles.",
    theme: 'perf',
    see: ['Memory leak', 'WeakMap'],
  },
  {
    term: 'Generator',
    def: "Fonction déclarée avec `function*` qui peut suspendre son exécution avec `yield` et la reprendre plus tard. L'appeler ne l'exécute pas : cela renvoie un itérateur dont chaque `next()` avance jusqu'au prochain `yield`. Les générateurs permettent des séquences paresseuses, voire infinies.",
    theme: 'es6',
    see: ['Iterator', 'Symbol'],
    code: `function* ids() {
  let i = 1
  while (true) yield i++
}
const gen = ids()
gen.next().value // → 1
gen.next().value // → 2`,
  },
  {
    term: 'globalThis',
    def: "Référence standard à l'objet global, quel que soit l'environnement (`window` dans un navigateur, `global` dans Node, `self` dans un worker). Dans un script classique, les `var` et déclarations de fonction de niveau supérieur deviennent des propriétés de l'objet global, mais pas les `let`, `const` ni `class`.",
    theme: 'scope',
    code: `var legacy = 1
let modern = 2
globalThis.legacy // → 1
globalThis.modern // → undefined`,
  },
  {
    term: 'Higher-order function',
    def: "Fonction d'ordre supérieur : fonction qui prend une fonction en argument, en renvoie une, ou les deux. `map`, `filter`, `reduce`, `debounce` ou `bind` en sont des exemples. C'est possible parce que les fonctions sont des valeurs comme les autres en JavaScript (« first-class citizens »).",
    theme: 'closures',
    see: ['Callback', 'Currying', 'Closure'],
    code: `const twice = (f) => (x) => f(f(x))
twice((n) => n + 3)(10) // → 16`,
  },
  {
    term: 'Hoisting',
    def: "Remontée : comportement selon lequel les déclarations sont enregistrées dès la création de leur portée, avant l'exécution du code. Les déclarations de fonction sont utilisables avant leur ligne, les `var` existent mais valent `undefined`, et `let`/`const`/`class` sont aussi remontés mais restent inaccessibles jusqu'à leur déclaration (TDZ).",
    theme: 'scope',
    see: ['TDZ', 'Execution context', 'Scope'],
    code: `console.log(x)
var x = 5
console.log(double(2))
function double(n) { return n * 2 }`,
    output: 'undefined\n4',
  },
  {
    term: 'Hydratation',
    def: "Hydration : étape où le JavaScript côté client reprend le HTML déjà rendu par le serveur, attache les écouteurs d'événements et reconstruit l'état pour rendre la page interactive. Tant qu'elle n'est pas terminée, la page est visible mais pas réactive. Les techniques d'hydratation partielle ou progressive (îlots, resumability) cherchent à en réduire le coût.",
    theme: 'web',
    see: ['SSR', 'CSR', 'SSG'],
  },
  {
    term: 'IIFE',
    def: "Immediately Invoked Function Expression : fonction définie et appelée immédiatement, `(() => { … })()`. Avant `let`/`const` et les modules, c'était le moyen standard de créer une portée privée et d'éviter de polluer l'objet global (le « module pattern »).",
    theme: 'closures',
    see: ['Closure', 'Scope'],
    code: `const counter = (() => {
  let n = 0
  return () => ++n
})()
counter() // → 1
counter() // → 2`,
  },
  {
    term: 'Immutabilité',
    def: "Principe consistant à ne jamais modifier une donnée existante, mais à en créer une nouvelle version (avec le spread, `map`, `filter`, `toSorted`…). Les changements deviennent détectables par simple comparaison de références, ce sur quoi reposent React et beaucoup de gestionnaires d'état, et le code est plus prévisible. `Object.freeze` peut l'imposer, mais de façon superficielle seulement.",
    theme: 'arrays',
    see: ['Mutation', 'Object.freeze', 'Spread', 'Pure function'],
    code: `const state = { count: 1, tags: ['js'] }
const next = { ...state, count: state.count + 1 }
state.count // → 1
next.count // → 2
next.tags === state.tags // → true`,
  },
  {
    term: 'instanceof',
    def: "Opérateur qui teste si le `prototype` d'un constructeur apparaît dans la chaîne de prototypes d'un objet. Il ne fonctionne pas avec les primitives et peut échouer entre deux realms (iframes), d'où `Array.isArray` pour les tableaux.",
    theme: 'prototypes',
    see: ['Prototype', 'typeof'],
    code: `const list = []
list instanceof Array // → true
list instanceof Object // → true
'texte' instanceof String // → false`,
  },
  {
    term: 'Iterator',
    def: "Itérateur : objet doté d'une méthode `next()` qui renvoie `{ value, done }`. Un objet est itérable s'il possède une méthode `[Symbol.iterator]` renvoyant un itérateur ; c'est ce protocole qu'utilisent `for…of`, le spread et la décomposition de tableau. Tableaux, chaînes, `Map` et `Set` sont itérables, les objets littéraux ne le sont pas.",
    theme: 'es6',
    see: ['Generator', 'Symbol', 'Spread'],
    code: `const it = [10, 20][Symbol.iterator]()
it.next() // → { value: 10, done: false }
it.next() // → { value: 20, done: false }
it.next() // → { value: undefined, done: true }`,
  },
  {
    term: 'JSON',
    def: "JavaScript Object Notation : format texte d'échange de données, inspiré des littéraux JavaScript mais plus strict (clés entre guillemets doubles, pas de fonctions, pas de `undefined`). `JSON.stringify` sérialise une valeur en ignorant les propriétés `undefined` et les fonctions, et `JSON.parse` fait l'inverse.",
    theme: 'objects',
    see: ['Deep copy'],
    code: `JSON.stringify({ a: 1, b: undefined, c: [1, 2] }) // → '{"a":1,"c":[1,2]}'
JSON.parse('{"ok":true}').ok // → true`,
  },
  {
    term: 'Layout thrashing',
    def: "Enchaînement, souvent dans une boucle, de lectures de géométrie (`offsetHeight`, `getBoundingClientRect`) et d'écritures de style qui force le navigateur à recalculer la mise en page de façon synchrone à chaque lecture. La solution est de regrouper toutes les lectures puis toutes les écritures, ou de passer par `requestAnimationFrame`.",
    theme: 'perf',
    see: ['Reflow', 'Repaint'],
  },
  {
    term: 'Lazy loading',
    def: "Chargement paresseux : ne charger une ressource (image, composant, module) qu'au moment où elle devient nécessaire, par exemple quand elle approche de la zone visible. Pour les images, l'attribut `loading=\"lazy\"` suffit ; pour le code, on utilise l'import dynamique. Cela réduit le temps de chargement initial.",
    theme: 'perf',
    see: ['Code splitting'],
  },
  {
    term: 'Lexical scope',
    def: "Portée lexicale : la portée d'une variable est déterminée par l'endroit où le code est écrit, et non par l'endroit d'où la fonction est appelée. Une fonction voit donc les variables des blocs qui l'entourent dans le texte source. C'est le fondement des closures.",
    theme: 'scope',
    see: ['Scope', 'Closure', 'Shadowing'],
    code: `const level = 'global'
function show() { return level }
function run() {
  const level = 'local'
  return show()
}
run() // → 'global'`,
  },
  {
    term: 'Live binding',
    def: "Liaison vivante : avec les modules ES, un import n'est pas une copie de la valeur mais une vue en lecture seule sur la variable exportée. Si le module exportateur modifie la variable, l'importateur voit la nouvelle valeur. Avec CommonJS au contraire, on récupère la valeur au moment du `require`.",
    theme: 'modules',
    see: ['ESM', 'CommonJS'],
    code: `// counter.js
export let count = 0
export const increment = () => { count++ }

// app.js
import { count, increment } from './counter.js'
increment()
console.log(count) // 1 : l'import suit la variable`,
    run: false,
  },
  {
    term: 'Macrotask',
    def: "Macrotâche (ou simplement tâche) : unité de travail placée dans une file de l'event loop par `setTimeout`, `setInterval`, un événement utilisateur ou un message réseau. L'event loop en exécute une seule par tour, puis vide entièrement la file des microtâches avant la suivante.",
    theme: 'eventloop',
    see: ['Microtask', 'Event loop'],
  },
  {
    term: 'Map',
    def: "Collection clé-valeur où les clés peuvent être de n'importe quel type (y compris des objets), qui conserve l'ordre d'insertion et expose sa taille via `size`. Elle est préférable à un objet littéral pour un dictionnaire dynamique : pas de clés héritées du prototype, ajouts et suppressions fréquents optimisés.",
    theme: 'es6',
    see: ['Set', 'WeakMap'],
    code: `const key = { id: 1 }
const roles = new Map([[key, 'admin']])
roles.get(key) // → 'admin'
roles.size // → 1`,
  },
  {
    term: 'Memoization',
    def: "Mémoïsation : technique d'optimisation qui met en cache le résultat d'une fonction pour des arguments donnés, afin de ne pas refaire un calcul coûteux. Elle n'a de sens que pour des fonctions pures. React l'applique avec `useMemo`, `useCallback` et `memo`.",
    theme: 'perf',
    see: ['Pure function', 'Closure', 'Programmation dynamique'],
    code: `function memoize(fn) {
  const cache = new Map()
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n))
    return cache.get(n)
  }
}
let calls = 0
const square = memoize((n) => { calls++; return n * n })
square(4) // → 16
square(4) // → 16
calls // → 1`,
  },
  {
    term: 'Memory leak',
    def: "Fuite mémoire : mémoire qui reste occupée parce que des objets inutiles restent atteignables, si bien que le garbage collector ne peut pas les libérer. Causes classiques : écouteurs ou `setInterval` jamais retirés, caches qui grossissent sans limite, closures qui retiennent de gros objets, références à des nœuds DOM supprimés. On les traque avec l'onglet Memory des DevTools.",
    theme: 'perf',
    see: ['Garbage collector', 'WeakMap', 'Closure'],
  },
  {
    term: 'Microtask',
    def: "Microtâche : callback placé dans une file prioritaire, par exemple par `then`/`catch`/`finally`, la reprise après un `await` ou `queueMicrotask`. Dès que la call stack se vide, l'event loop exécute toutes les microtâches, y compris celles ajoutées entre-temps, avant toute macrotâche ou tout rendu.",
    theme: 'eventloop',
    see: ['Macrotask', 'Event loop', 'Promise'],
    code: `setTimeout(() => console.log('macro'), 0)
queueMicrotask(() => console.log('micro'))
console.log('sync')`,
    output: 'sync\nmicro\nmacro',
  },
  {
    term: 'Minification',
    def: "Transformation du code pour en réduire la taille sans changer son comportement : suppression des espaces et commentaires, renommage des variables locales en noms courts, simplification d'expressions. Réalisée par le bundler en production (Terser, esbuild), elle s'accompagne de source maps pour garder un débogage lisible.",
    theme: 'perf',
    see: ['Bundler'],
  },
  {
    term: 'Mutation',
    def: "Modification en place d'un objet ou d'un tableau existant (`push`, `sort`, `splice`, affectation de propriété…). Comme les objets sont manipulés par référence, une mutation est visible partout où cette référence est partagée, ce qui est source de bugs et empêche la détection de changements par comparaison de références.",
    theme: 'arrays',
    see: ['Immutabilité', 'Side effect'],
    code: `const a = [3, 1, 2]
const b = a
b.sort()
a // → [ 1, 2, 3 ]
a === b // → true`,
  },
  {
    term: 'NaN',
    def: "« Not a Number » : valeur de type `number` qui représente le résultat d'une opération numérique invalide, comme `Number('abc')` ou `0 / 0`. C'est la seule valeur qui n'est pas égale à elle-même. On la teste avec `Number.isNaN`, et non avec la fonction globale `isNaN`, qui convertit d'abord son argument.",
    theme: 'types',
    see: ['Coercion', 'typeof'],
    code: `typeof NaN // → 'number'
NaN === NaN // → false
Number.isNaN('abc') // → false
isNaN('abc') // → true`,
  },
  {
    term: 'Nullish coalescing',
    def: "Opérateur `??` : renvoie l'opérande de droite uniquement si celui de gauche vaut `null` ou `undefined`. Contrairement à `||`, il conserve les valeurs falsy légitimes comme `0`, `''` ou `false`, ce qui en fait le bon choix pour les valeurs par défaut. Il existe aussi en affectation : `??=`.",
    theme: 'es6',
    see: ['Optional chaining', 'Falsy', 'Short-circuit'],
    code: `0 ?? 42 // → 0
0 || 42 // → 42
null ?? 'défaut' // → 'défaut'`,
  },
  {
    term: 'Object.freeze',
    def: "Rend un objet non modifiable : on ne peut plus ajouter, supprimer ni modifier ses propriétés. En mode non strict, les tentatives échouent silencieusement ; en mode strict, elles lèvent une `TypeError`. Le gel est superficiel : les objets imbriqués restent modifiables.",
    theme: 'objects',
    see: ['Immutabilité', 'Strict mode'],
    code: `const config = Object.freeze({ port: 80, db: { host: 'local' } })
config.port = 8080
config.db.host = 'prod'
config.port // → 80
config.db.host // → 'prod'`,
  },
  {
    term: 'Optional chaining',
    def: "Opérateur `?.` : accède à une propriété, un index (`?.[i]`) ou appelle une méthode (`?.()`) seulement si la valeur à gauche n'est ni `null` ni `undefined` ; sinon toute l'expression renvoie `undefined` au lieu de lever une `TypeError`. On le combine souvent avec `??` pour fournir une valeur par défaut.",
    theme: 'es6',
    see: ['Nullish coalescing'],
    code: `const config = { db: null }
config.db?.host // → undefined
config.cache?.size ?? 0 // → 0`,
  },
  {
    term: 'Polyfill',
    def: "Code qui implémente une fonctionnalité standard absente d'un environnement ancien, en la définissant seulement si elle n'existe pas. Un polyfill ajoute des API (`Array.prototype.at`, `Promise`…), alors que le transpileur réécrit la syntaxe (`?.`, classes…) : les deux sont complémentaires pour supporter de vieux navigateurs.",
    theme: 'web',
    see: ['Transpilation'],
    code: `if (!Array.prototype.at) {
  Array.prototype.at = function (i) {
    return this[i < 0 ? this.length + i : i]
  }
}
[1, 2, 3].at(-1) // → 3`,
  },
  {
    term: 'Preflight',
    def: "Requête préliminaire `OPTIONS` envoyée automatiquement par le navigateur avant une requête cross-origin « non simple » (méthode comme `PUT` ou `DELETE`, en-tête personnalisé, `Content-Type: application/json`…). Le serveur doit répondre avec les en-têtes `Access-Control-Allow-*` adéquats, sinon la vraie requête n'est jamais envoyée.",
    theme: 'web',
    see: ['CORS', 'Same-origin policy'],
  },
  {
    term: 'preventDefault',
    def: "Méthode `event.preventDefault()` qui annule l'action par défaut du navigateur associée à un événement : soumission d'un formulaire, suivi d'un lien, cochage d'une case… Elle n'arrête pas la propagation de l'événement, ce qui est le rôle de `stopPropagation`.",
    theme: 'dom',
    see: ['stopPropagation', 'Event listener'],
  },
  {
    term: 'Promise',
    def: "Promesse : objet représentant le résultat futur d'une opération asynchrone, dans l'un de trois états : en attente (pending), tenue (fulfilled) ou rompue (rejected). Une fois réglée, elle ne change plus. On enchaîne les traitements avec `then`, `catch` et `finally`, dont les callbacks sont toujours exécutés de manière asynchrone, en microtâche.",
    theme: 'async',
    see: ['Async/await', 'Promise.all', 'Microtask', 'Unhandled rejection'],
    code: `const p = new Promise((resolve) => setTimeout(() => resolve('ok'), 10))
p.then((value) => console.log(value))
console.log('avant')`,
    output: 'avant\nok',
  },
  {
    term: 'Promise.all',
    def: "Combinateur qui prend un itérable de promesses et renvoie une promesse tenue avec le tableau de leurs résultats, dans l'ordre d'origine, une fois toutes tenues. Il échoue dès le premier rejet. Ses cousins : `allSettled` (attend tout, sans jamais rejeter), `race` (première promesse réglée) et `any` (première tenue).",
    theme: 'async',
    see: ['Promise', 'Async/await'],
    code: `const slow = new Promise((resolve) => setTimeout(() => resolve('lent'), 20))
Promise.all([slow, 'direct', Promise.resolve(3)]).then((values) => console.log(values))`,
    output: "[ 'lent', 'direct', 3 ]",
  },
  {
    term: 'Prototype',
    def: "Objet dont un autre objet hérite ses propriétés. Chaque objet possède un lien interne `[[Prototype]]` (lisible via `Object.getPrototypeOf`) ; si une propriété est absente de l'objet, le moteur la cherche en remontant cette chaîne de prototypes jusqu'à `null`. C'est le mécanisme d'héritage natif de JavaScript, sur lequel reposent les classes.",
    theme: 'prototypes',
    see: ['Class', 'instanceof'],
    code: `const animal = { speak() { return 'bruit' } }
const dog = Object.create(animal)
dog.speak() // → 'bruit'
Object.getPrototypeOf(dog) === animal // → true
dog.hasOwnProperty('speak') // → false`,
  },
  {
    term: 'Proxy',
    def: "Objet qui enveloppe une cible et intercepte les opérations fondamentales effectuées sur elle (lecture, écriture, suppression, `in`…) grâce à des « trappes » définies dans un handler. C'est la base de la réactivité de Vue 3 : le framework détecte ainsi les lectures et les écritures pour savoir quoi mettre à jour.",
    theme: 'objects',
    see: ['Signal'],
    code: `const target = { a: 1 }
const p = new Proxy(target, {
  get: (obj, key) => (key in obj ? obj[key] : 'absent'),
})
p.a // → 1
p.b // → 'absent'`,
  },
  {
    term: 'Pure function',
    def: "Fonction pure : fonction dont le résultat dépend uniquement de ses arguments et qui ne produit aucun effet de bord (pas de mutation de ses entrées, d'état global, d'appel réseau ou d'affichage). Elle est prévisible, facile à tester et peut être mémoïsée sans risque. Les reducers et les composants React doivent être purs.",
    theme: 'arrays',
    see: ['Side effect', 'Immutabilité', 'Memoization'],
  },
  {
    term: 'Race condition',
    def: "Situation de compétition : le résultat dépend de l'ordre, non garanti, dans lequel se terminent des opérations asynchrones. Exemple typique : deux recherches successives dont la première répond après la seconde et écrase un résultat plus récent. On s'en protège en ignorant les réponses obsolètes (identifiant de requête, flag dans le cleanup d'un effet) ou en annulant avec `AbortController`.",
    theme: 'async',
    see: ['AbortController', 'Promise'],
    code: `let latest = 0
async function search(q, ms) {
  const id = ++latest
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (id !== latest) return console.log('ignoré', q)
  console.log('affiché', q)
}
search('a', 50)
search('ab', 10)`,
    output: 'affiché ab\nignoré a',
  },
  {
    term: 'Reconciliation',
    def: "Réconciliation : algorithme par lequel React compare le nouvel arbre virtuel produit par un rendu avec le précédent, afin de calculer le minimum de modifications à appliquer au vrai DOM. Il suppose qu'un changement de type d'élément remplace tout le sous-arbre, et s'appuie sur les `key` pour identifier les éléments d'une liste.",
    see: ['Virtual DOM', 'DOM'],
  },
  {
    term: 'Reflow',
    def: "Recalcul de la mise en page (layout) : le navigateur recalcule la position et la taille des éléments, souvent pour une grande partie de la page. Il est déclenché par un changement de géométrie (taille, contenu, police, ajout de nœuds) ou par la lecture d'une propriété de géométrie après une modification. C'est l'une des opérations les plus coûteuses du rendu.",
    theme: 'perf',
    see: ['Repaint', 'Layout thrashing', 'DOM'],
  },
  {
    term: 'Repaint',
    def: "Redessin : le navigateur repeint les pixels d'éléments dont l'apparence change sans modification de géométrie (couleur, ombre, visibilité). Moins coûteux qu'un reflow, il reste à limiter. Les propriétés `transform` et `opacity` peuvent souvent être animées par le compositeur, sans reflow ni repaint.",
    theme: 'perf',
    see: ['Reflow', 'Layout thrashing'],
  },
  {
    term: 'Rest',
    def: "Syntaxe `...` utilisée pour **regrouper** plusieurs éléments en un seul : les arguments restants d'une fonction dans un vrai tableau (`function f(...args)`), ou les propriétés restantes lors d'une décomposition. Même syntaxe que le spread, mais rôle inverse : le rest rassemble, le spread étale.",
    theme: 'es6',
    see: ['Spread', 'Destructuring'],
    code: `function sum(...nums) {
  return nums.reduce((total, n) => total + n, 0)
}
sum(1, 2, 3) // → 6
const { id, ...others } = { id: 1, a: 2, b: 3 }
others // → { a: 2, b: 3 }`,
  },
  {
    term: 'Same-origin policy',
    def: "Politique de même origine : règle de sécurité du navigateur qui empêche un script de lire les réponses ou le DOM d'une autre origine. Une origine est le triplet protocole + domaine + port : `https://a.com` et `https://a.com:8080` sont donc deux origines différentes. CORS permet d'assouplir cette règle à la demande du serveur.",
    theme: 'web',
    see: ['CORS', 'Preflight'],
  },
  {
    term: 'Scope',
    def: "Portée : zone du code dans laquelle une variable est accessible. On distingue la portée globale, la portée de fonction (`var`) et la portée de bloc (`let`, `const`, `class`, délimitée par des accolades). Les portées s'emboîtent : une recherche de variable remonte la chaîne des portées englobantes jusqu'au global.",
    theme: 'scope',
    see: ['Lexical scope', 'Hoisting', 'Shadowing'],
    code: `for (var i = 0; i < 3; i++) {}
for (let j = 0; j < 3; j++) {}
typeof i // → 'number'
typeof j // → 'undefined'`,
  },
  {
    term: 'Service Worker',
    def: "Script exécuté par le navigateur en arrière-plan, séparément de la page, qui agit comme un proxy réseau programmable. Il peut intercepter les requêtes et servir des réponses depuis un cache, ce qui permet le fonctionnement hors ligne et les Progressive Web Apps, ainsi que les notifications push. Il nécessite HTTPS et n'a pas accès au DOM.",
    theme: 'web',
    see: ['Web Worker'],
  },
  {
    term: 'Set',
    def: "Collection de valeurs uniques (comparées avec l'algorithme SameValueZero, donc par référence pour les objets), qui conserve l'ordre d'insertion. `has` est en temps constant, ce qui la rend bien plus efficace que `includes` sur un grand tableau. Idiome classique : dédoublonner un tableau.",
    theme: 'es6',
    see: ['Map'],
    code: `Array.from(new Set([1, 2, 2, 3, 1])) // → [ 1, 2, 3 ]
new Set([{}, {}]).size // → 2`,
  },
  {
    term: 'Shadowing',
    def: "Masquage : une variable déclarée dans une portée interne porte le même nom qu'une variable d'une portée externe et la cache dans cette portée interne. La variable externe n'est pas modifiée. C'est légal, mais cela nuit souvent à la lisibilité.",
    theme: 'scope',
    see: ['Scope', 'Lexical scope'],
    code: `let label = 'externe'
function read() {
  let label = 'interne'
  return label
}
read() // → 'interne'
label // → 'externe'`,
  },
  {
    term: 'Shallow copy',
    def: "Copie superficielle : nouvel objet (ou tableau) dont les propriétés de premier niveau sont copiées, mais dont les objets imbriqués restent partagés par référence avec l'original. Le spread `{ ...obj }`, `Object.assign`, `slice` et `Array.from` produisent des copies superficielles.",
    theme: 'objects',
    see: ['Deep copy', 'Spread', 'structuredClone'],
    code: `const original = { name: 'Ada', address: { city: 'Paris' } }
const copy = { ...original }
copy.name = 'Grace'
copy.address.city = 'Lyon'
original.name // → 'Ada'
original.address.city // → 'Lyon'`,
  },
  {
    term: 'Short-circuit',
    def: "Évaluation en court-circuit : `&&` et `||` n'évaluent leur opérande de droite que si c'est nécessaire, et renvoient la valeur d'un des opérandes (pas forcément un booléen). `a || b` renvoie `a` s'il est truthy, sinon `b` ; `a && b` renvoie `a` s'il est falsy, sinon `b`. D'où des idiomes comme `user && user.name` ou le rendu conditionnel en JSX.",
    theme: 'types',
    see: ['Truthy', 'Falsy', 'Nullish coalescing'],
    code: `null || 'défaut' // → 'défaut'
0 && 'jamais évalué' // → 0
'a' && 'b' // → 'b'`,
  },
  {
    term: 'Side effect',
    def: "Effet de bord : toute interaction d'une fonction avec l'extérieur au-delà du calcul de sa valeur de retour, comme modifier une variable externe ou un argument, écrire dans le DOM, faire une requête réseau, journaliser ou lancer un minuteur. Les effets sont indispensables, mais on cherche à les isoler (par exemple dans `useEffect`) pour garder le reste du code pur.",
    see: ['Pure function', 'Mutation'],
  },
  {
    term: 'Signal',
    def: "Primitive de réactivité fine : une valeur observable qui connaît les calculs et les effets qui la lisent, et ne met à jour qu'eux lorsqu'elle change, sans re-rendre un composant entier ni comparer d'arbre virtuel. On la retrouve dans Solid, Preact Signals, Angular (`signal()`), Svelte 5 (runes) et, sous une autre forme, dans les `ref` de Vue.",
    see: ['Virtual DOM', 'Proxy'],
    code: `function signal(value) {
  const subscribers = new Set()
  return {
    get: () => value,
    set(next) {
      value = next
      subscribers.forEach((fn) => fn(next))
    },
    subscribe: (fn) => subscribers.add(fn),
  }
}
const count = signal(0)
count.subscribe((v) => console.log('count =', v))
count.set(1)
count.set(2)`,
    output: 'count = 1\ncount = 2',
  },
  {
    term: 'Spread',
    def: "Syntaxe `...` utilisée pour **étaler** un itérable en éléments individuels (dans un appel de fonction ou un littéral de tableau) ou les propriétés d'un objet dans un nouvel objet. Elle sert à copier superficiellement, fusionner ou passer un tableau comme liste d'arguments. Lors d'une fusion d'objets, la dernière propriété l'emporte.",
    theme: 'es6',
    see: ['Rest', 'Shallow copy', 'Iterator'],
    code: `Math.max(...[3, 7, 2]) // → 7
const merged = { ...{ a: 1, b: 2 }, ...{ b: 3 } }
merged // → { a: 1, b: 3 }`,
  },
  {
    term: 'SSG',
    def: "Static Site Generation : les pages HTML sont générées une fois pour toutes au moment du build, puis servies telles quelles depuis un CDN. C'est le mode le plus rapide et le moins coûteux, idéal pour du contenu qui change peu (documentation, blog). La régénération incrémentale (ISR) permet de rafraîchir certaines pages sans tout reconstruire.",
    theme: 'web',
    see: ['SSR', 'CSR', 'Hydratation'],
  },
  {
    term: 'SSR',
    def: "Server-Side Rendering : le serveur exécute les composants et renvoie un HTML complet à chaque requête, ce qui améliore le premier affichage et le référencement. Le JavaScript client doit ensuite hydrater la page pour la rendre interactive. Next.js, Nuxt, SvelteKit ou Angular SSR proposent ce mode.",
    theme: 'web',
    see: ['Hydratation', 'CSR', 'SSG'],
  },
  {
    term: 'stopPropagation',
    def: "Méthode `event.stopPropagation()` qui empêche l'événement de poursuivre sa propagation (capture ou remontée) vers d'autres éléments. Les autres écouteurs du même élément s'exécutent encore, sauf avec `stopImmediatePropagation`. À utiliser avec parcimonie, car elle casse la délégation d'événements et les écouteurs globaux.",
    theme: 'dom',
    see: ['Bubbling', 'preventDefault', "Délégation d'événements"],
  },
  {
    term: 'Strict mode',
    def: "Mode strict, activé par `'use strict'` en tête de fichier ou de fonction, et automatiquement dans les modules ES et les classes. Il transforme des erreurs silencieuses en exceptions (affectation à une variable non déclarée, écriture sur une propriété en lecture seule) et laisse `this` à `undefined` dans une fonction appelée sans objet, au lieu de l'objet global.",
    theme: 'scope',
    see: ['this', 'ESM'],
    code: `function loose() { return this === globalThis }
function strict() {
  'use strict'
  return this
}
loose() // → true
strict() // → undefined`,
  },
  {
    term: 'structuredClone',
    def: "Fonction globale qui réalise une copie profonde d'une valeur grâce à l'algorithme de clonage structuré. Elle gère les objets imbriqués, les tableaux, `Date`, `Map`, `Set` et les références circulaires, mais lève une erreur sur les fonctions et les nœuds DOM, et ne conserve pas les prototypes des classes personnalisées.",
    theme: 'objects',
    see: ['Deep copy', 'Shallow copy'],
    code: `const original = { user: { age: 30 }, since: new Date(0) }
const copy = structuredClone(original)
copy.user.age = 31
original.user.age // → 30
copy.since instanceof Date // → true
copy.since === original.since // → false`,
  },
  {
    term: 'Symbol',
    def: "Type primitif dont chaque valeur est unique, créée par `Symbol('description')`. Les symboles servent de clés de propriété qui ne peuvent pas entrer en collision et sont ignorées par `Object.keys`, `for…in` et `JSON.stringify`. Les symboles bien connus, comme `Symbol.iterator`, permettent de personnaliser le comportement des objets.",
    theme: 'types',
    see: ['Iterator'],
    code: `const id = Symbol('id')
const obj = { [id]: 1, visible: 2 }
Object.keys(obj) // → [ 'visible' ]
Symbol('x') === Symbol('x') // → false`,
  },
  {
    term: 'TDZ',
    def: "Temporal Dead Zone, zone morte temporelle : période entre le début d'une portée et la ligne où une variable `let`, `const` ou `class` y est déclarée. La variable existe déjà (elle est remontée), mais y accéder pendant cette période lève une `ReferenceError`, contrairement à `var` qui renverrait `undefined`.",
    theme: 'scope',
    see: ['Hoisting', 'Scope'],
    code: `try {
  console.log(total)
  let total = 1
} catch (e) {
  console.log(e.name + ': ' + e.message)
}`,
    output: "ReferenceError: Cannot access 'total' before initialization",
  },
  {
    term: 'this',
    def: "Mot-clé dont la valeur dépend de la manière dont une fonction est appelée, pas de l'endroit où elle est définie : l'objet avant le point (`obj.m()`), l'objet passé à `call`/`apply`/`bind`, la nouvelle instance avec `new`, sinon l'objet global (ou `undefined` en mode strict). Les fonctions fléchées font exception : elles reprennent le `this` de leur portée lexicale.",
    theme: 'this',
    see: ['Bind', 'Arrow function', 'Strict mode'],
    code: `const user = { first: 'Ada', hello() { return this.first } }
user.hello() // → 'Ada'
const detached = user.hello
detached() // → undefined
detached.call({ first: 'Grace' }) // → 'Grace'`,
  },
  {
    term: 'Throttle',
    def: "Technique qui limite l'exécution d'une fonction à au plus une fois par intervalle de temps, quel que soit le nombre d'appels. Contrairement au debounce, qui attend la fin d'une rafale, le throttle s'exécute régulièrement pendant la rafale. Usage typique : réagir au défilement ou au redimensionnement.",
    theme: 'perf',
    see: ['Debounce', 'Closure'],
    code: `function throttle(fn, ms) {
  let last = -Infinity
  return (...args) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    }
  }
}
const onScroll = throttle((y) => console.log('scroll', y), 1000)
onScroll(10)
onScroll(20)
onScroll(30)`,
    output: 'scroll 10',
  },
  {
    term: 'Transpilation',
    def: "Traduction d'un code source vers un autre code source de niveau d'abstraction comparable : TypeScript vers JavaScript, JSX vers des appels de fonctions, ou syntaxe ES récente vers une syntaxe compatible avec d'anciens navigateurs. Babel, esbuild, SWC et `tsc` sont des transpileurs. La transpilation réécrit la syntaxe ; les API manquantes nécessitent des polyfills.",
    theme: 'modules',
    see: ['Polyfill', 'Bundler', 'TypeScript'],
  },
  {
    term: 'Tree shaking',
    def: "Élimination du code mort par le bundler : les exports jamais importés sont retirés du bundle final. Elle repose sur la structure statique des modules ES (impossible à garantir avec `require` dynamique) et suppose que les modules n'aient pas d'effets de bord à l'import, ce que l'on déclare avec `\"sideEffects\": false` dans le `package.json`.",
    theme: 'modules',
    see: ['ESM', 'Bundler'],
  },
  {
    term: 'Truthy',
    def: "Valeur considérée comme vraie dans un contexte booléen (`if`, `&&`, `||`, `!`) : toute valeur qui n'est pas falsy. Attention aux cas contre-intuitifs : un tableau vide, un objet vide, la chaîne `'0'` ou `'false'` sont tous truthy.",
    theme: 'types',
    see: ['Falsy', 'Coercion'],
    code: `Boolean([]) // → true
Boolean('0') // → true
Boolean({}) // → true`,
  },
  {
    term: 'Two-way binding',
    def: "Liaison bidirectionnelle : la vue et l'état sont synchronisés dans les deux sens, une saisie dans un champ mettant automatiquement à jour la donnée, et inversement. Vue (`v-model`) et Angular (`[(ngModel)]`) la proposent, en tant que sucre syntaxique au-dessus d'une liaison descendante et d'un événement. React impose un flux unidirectionnel avec des composants contrôlés.",
    see: ['Signal'],
  },
  {
    term: 'typeof',
    def: "Opérateur qui renvoie une chaîne indiquant le type d'une valeur : `'string'`, `'number'`, `'bigint'`, `'boolean'`, `'undefined'`, `'symbol'`, `'object'` ou `'function'`. Deux pièges classiques : `typeof null` vaut `'object'` (bug historique) et les tableaux sont aussi `'object'`. Il ne lève pas d'erreur sur une variable non déclarée.",
    theme: 'types',
    see: ['instanceof', 'NaN'],
    code: `typeof null // → 'object'
typeof [] // → 'object'
typeof function () {} // → 'function'
typeof notDeclared // → 'undefined'`,
  },
  {
    term: 'TypeScript',
    def: "Surcouche typée de JavaScript développée par Microsoft : on ajoute des annotations et des types que le compilateur vérifie statiquement, puis ils sont effacés à la transpilation. Il détecte de nombreuses erreurs avant l'exécution, documente le code et améliore fortement l'autocomplétion et les refactorings. Les types n'existent pas à l'exécution : il faut toujours valider les données externes.",
    theme: 'modules',
    see: ['Transpilation'],
  },
  {
    term: 'Unhandled rejection',
    def: "Rejet non géré : une promesse rompue sans aucun `catch` (ni `try/catch` autour d'un `await`). Le navigateur l'affiche dans la console (« Uncaught (in promise) ») et émet l'événement `unhandledrejection` ; dans Node récent, cela termine le processus par défaut. Toute chaîne de promesses doit se terminer par une gestion d'erreur.",
    theme: 'async',
    see: ['Promise', 'Async/await'],
    code: `async function load() {
  throw new Error('réseau indisponible')
}
load()`,
    output: 'Uncaught (in promise) Error: réseau indisponible',
  },
  {
    term: 'Virtual DOM',
    def: "DOM virtuel : représentation légère de l'interface sous forme d'objets JavaScript. À chaque changement d'état, le framework (React, Vue) produit un nouvel arbre virtuel, le compare au précédent (diffing) et n'applique au vrai DOM que les différences. Ce n'est pas « plus rapide que le DOM » en soi : c'est un compromis qui permet d'écrire l'UI de façon déclarative avec des performances correctes.",
    theme: 'dom',
    see: ['Reconciliation', 'DOM', 'Signal'],
  },
  {
    term: 'WeakMap',
    def: "Variante de `Map` dont les clés doivent être des objets et sont référencées faiblement : si la clé n'est plus référencée ailleurs, l'entrée peut être supprimée par le garbage collector. Elle n'est ni itérable ni dénombrable. Usage typique : associer des métadonnées ou un cache à des objets sans provoquer de fuite mémoire.",
    theme: 'objects',
    see: ['Map', 'Garbage collector', 'Memory leak'],
    code: `const cache = new WeakMap()
const node = { id: 1 }
cache.set(node, 'calculé')
cache.get(node) // → 'calculé'
cache.has({ id: 1 }) // → false`,
  },
  {
    term: 'Web Storage',
    def: "API `localStorage` et `sessionStorage` : stockage clé-valeur de chaînes (environ 5 Mo par origine), synchrone et accessible uniquement en JavaScript. `localStorage` persiste indéfiniment, `sessionStorage` disparaît à la fermeture de l'onglet. Comme tout script de la page peut le lire, on n'y stocke jamais de jeton sensible.",
    theme: 'web',
    see: ['Cookie', 'XSS', 'JSON'],
    code: `localStorage.setItem('theme', 'dark')
localStorage.getItem('theme') // 'dark'
sessionStorage.setItem('cart', JSON.stringify([1, 2]))`,
    run: false,
  },
  {
    term: 'Web Worker',
    def: "Script exécuté dans un thread séparé du thread principal, pour effectuer des calculs lourds sans bloquer l'interface. Un worker n'a pas accès au DOM et communique avec la page uniquement par messages (`postMessage` et l'événement `message`), les données étant copiées par clonage structuré.",
    theme: 'perf',
    see: ['Service Worker', 'structuredClone', 'Event loop'],
    code: `const worker = new Worker('heavy.js')
worker.postMessage({ numbers: [1, 2, 3] })
worker.onmessage = (event) => console.log('résultat', event.data)`,
    run: false,
  },
  {
    term: 'XSS',
    def: "Cross-Site Scripting : injection de code JavaScript malveillant dans une page, généralement en affichant sans échappement une donnée fournie par un utilisateur. Le script injecté s'exécute avec les droits de la page (vol de session, actions à la place de l'utilisateur). On s'en protège en échappant les sorties (`textContent` plutôt qu'`innerHTML`, échappement automatique des frameworks), en assainissant le HTML (DOMPurify) et avec une CSP.",
    theme: 'web',
    see: ['CSP', 'CSRF', 'Cookie'],
    code: `const comment = '<img src=x onerror="alert(1)">'
el.innerHTML = comment // dangereux : le script s'exécute
el.textContent = comment // sûr : affiché comme du texte`,
    run: false,
  },
  {
    term: 'Big O',
    def: "Notation qui décrit comment le temps d'exécution (ou la mémoire) d'un algorithme **croît** avec la taille n de l'entrée, en gardant le terme dominant et en ignorant les constantes. Ordre usuel : O(1) constant, O(log n) logarithmique (dichotomie), O(n) linéaire, O(n log n) (bons tris), O(n²) quadratique (boucles imbriquées), O(2ⁿ) exponentiel (sous-ensembles). En entretien, on donne la complexité en temps **et** en mémoire de chaque solution.",
    theme: 'algo',
    see: ['Two pointers', 'Programmation dynamique'],
  },
  {
    term: 'Two pointers',
    def: "Deux pointeurs : technique qui parcourt un tableau ou une chaîne avec deux indices, soit depuis les deux extrémités vers le centre (paire de somme donnée dans un tableau trié, palindrome), soit dans le même sens à des vitesses différentes (compactage en place, suppression de doublons). Elle remplace souvent une double boucle en O(n²) par un seul passage en O(n), avec O(1) de mémoire.",
    theme: 'algo',
    see: ['Sliding window', 'Big O'],
    code: `function isPalindrome(s) {
  let i = 0
  let j = s.length - 1
  while (i < j) if (s[i++] !== s[j--]) return false
  return true
}
isPalindrome('kayak') // → true
isPalindrome('kayaks') // → false`,
  },
  {
    term: 'Sliding window',
    def: "Fenêtre glissante : variante des deux pointeurs pour les problèmes de **sous-tableau ou sous-chaîne contigu** (« le plus long », « de taille k », « somme maximale »). La fenêtre s'étend à droite et se réduit à gauche quand une contrainte est violée ; son état (somme, `Map` des caractères) est mis à jour de façon incrémentale au lieu d'être recalculé. Chaque indice avance au plus n fois : O(n).",
    theme: 'algo',
    see: ['Two pointers', 'Map'],
    code: `function maxSumOfK(nums, k) {
  let sum = 0
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    if (i >= k) sum -= nums[i - k]
    if (i >= k - 1) best = Math.max(best, sum)
  }
  return best
}
maxSumOfK([2, 1, 5, 1, 3, 2], 3) // → 9`,
  },
  {
    term: 'Backtracking',
    def: "Retour sur trace : exploration récursive de toutes les solutions possibles où l'on **choisit** une option, **explore** la suite, puis **annule** ce choix pour essayer la suivante. On élague les branches qui ne peuvent pas mener à une solution. Utilisé pour les permutations (O(n · n!)), les sous-ensembles (O(n · 2ⁿ)), les combinaisons, le sudoku ou les N reines.",
    theme: 'algo',
    see: ['DFS', 'Call stack'],
    code: `function subsets(items) {
  const result = []
  const current = []
  function explore(start) {
    result.push([...current])
    for (let i = start; i < items.length; i++) {
      current.push(items[i])
      explore(i + 1)
      current.pop()
    }
  }
  explore(0)
  return result
}
subsets(['a', 'b']) // → [ [], [ 'a' ], [ 'a', 'b' ], [ 'b' ] ]`,
  },
  {
    term: 'BFS',
    def: "Breadth-First Search, parcours en largeur : on visite un graphe ou un arbre **niveau par niveau** à l'aide d'une **file** (FIFO), en marquant les sommets visités. Il donne le plus court chemin en nombre d'arêtes dans un graphe non pondéré, et le parcours par niveaux d'un arbre. Complexité O(V + E). Piège en JS : `shift()` est en O(n), préférer un indice de tête.",
    theme: 'algo',
    see: ['DFS', 'Set'],
    code: `const graph = { a: ['b', 'c'], b: ['d'], c: ['d'], d: [] }
function bfs(start) {
  const seen = new Set([start])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    for (const next of graph[queue[head]]) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return queue
}
bfs('a') // → [ 'a', 'b', 'c', 'd' ]`,
  },
  {
    term: 'DFS',
    def: "Depth-First Search, parcours en profondeur : on descend le plus loin possible dans une branche avant de revenir en arrière, par récursion ou avec une **pile** explicite (LIFO), en marquant les sommets visités. Adapté à l'exploration exhaustive, aux composantes connexes (nombre d'îles), à la détection de cycles, au tri topologique et au backtracking. Complexité O(V + E), mémoire O(profondeur).",
    theme: 'algo',
    see: ['BFS', 'Backtracking', 'Call stack'],
    code: `const tree = { value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } }
const preorder = (node) => (node ? [node.value, ...preorder(node.left), ...preorder(node.right)] : [])
const depth = (node) => (node ? 1 + Math.max(depth(node.left), depth(node.right)) : 0)
preorder(tree) // → [ 1, 2, 3 ]
depth(tree) // → 2`,
  },
  {
    term: 'Programmation dynamique',
    def: "Technique de résolution des problèmes dont la solution se construit à partir de **sous-problèmes qui se recoupent**. On ne calcule chaque sous-problème qu'une fois : soit en **descendant** (récursion + mémoïsation, *top-down*), soit en **remontant** (tabulation : on remplit un tableau du plus petit sous-problème au plus grand, *bottom-up*). Elle transforme souvent une récursion exponentielle en algorithme polynomial (escaliers, rendu de monnaie, plus longue sous-séquence commune).",
    theme: 'algo',
    see: ['Memoization', 'Backtracking'],
    code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1)
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
coinChange([1, 2, 5], 11) // → 3
coinChange([2], 3) // → -1`,
  },
]

export const lexique: LexiqueEntry[] = [...jsLexique, ...tsLexique]
