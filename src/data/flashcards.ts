import type { Flashcard } from './types'
import { tsFlashcards } from './flashcardsTs'

const jsFlashcards: Flashcard[] = [
  // ——— Types et coercition ———
  {
    id: 'f1',
    theme: 'types',
    front: 'Quels sont les types primitifs de JavaScript ?',
    back: "Il y en a sept : `string`, `number`, `bigint`, `boolean`, `undefined`, `null` et `symbol`. Tout le reste (tableaux, fonctions, dates…) est un **objet**. Les primitives sont immuables et comparées par valeur ; les objets sont manipulés par référence. Attention : `typeof null` renvoie `'object'` (bug historique).",
    code: `typeof 10n // → 'bigint'
typeof Symbol('id') // → 'symbol'
typeof null // → 'object'`,
  },
  {
    id: 'f2',
    theme: 'types',
    front: 'Quelle différence entre `==` et `===` ?',
    back: "`===` (égalité stricte) compare type et valeur, sans aucune conversion. `==` (égalité abstraite) convertit d'abord les opérandes selon des règles complexes (booléens et chaînes en nombres, objets en primitives). Seule exception utile de `==` : `x == null` teste à la fois `null` et `undefined`. Par défaut, toujours utiliser `===`.",
    code: `0 == '' // → true
0 === '' // → false
null == undefined // → true
null === undefined // → false`,
  },
  {
    id: 'f3',
    theme: 'types',
    front: 'Quelles sont les valeurs falsy ?',
    back: "`false`, `0`, `-0`, `0n`, `''` (chaîne vide), `null`, `undefined` et `NaN`. **Toutes les autres** valeurs sont truthy, y compris `'0'`, `'false'`, `[]` et `{}`. Piège fréquent : `if (arr)` est toujours vrai pour un tableau, même vide ; tester `arr.length`.",
    code: `Boolean('0') // → true
Boolean([]) // → true
Boolean(NaN) // → false`,
  },
  {
    id: 'f4',
    theme: 'types',
    front: 'Quelle différence entre `??` et `||` ?',
    back: "`a || b` renvoie `b` dès que `a` est **falsy** (`0`, `''`, `false`…). `a ?? b` (coalescence des nuls) ne renvoie `b` que si `a` est `null` ou `undefined`. Pour une valeur par défaut où `0` ou `''` sont légitimes, utiliser `??`. Il existe aussi `??=` et `||=`.",
    code: `0 || 10 // → 10
0 ?? 10 // → 0
'' ?? 'défaut' // → ''
null ?? 'défaut' // → 'défaut'`,
  },
  {
    id: 'f5',
    theme: 'types',
    front: 'Quelle différence entre `isNaN` et `Number.isNaN` ?',
    back: "La globale `isNaN(x)` convertit d'abord `x` en nombre : elle répond `true` pour tout ce qui n'est pas convertible (`'abc'`, `undefined`). `Number.isNaN(x)` ne convertit rien et ne répond `true` que si `x` est exactement la valeur `NaN`. Comme `NaN !== NaN`, on ne peut pas tester `x === NaN`.",
    code: `isNaN('abc') // → true
Number.isNaN('abc') // → false
Number.isNaN(0 / 0) // → true`,
  },

  // ——— Portée, hoisting, TDZ ———
  {
    id: 'f6',
    theme: 'scope',
    front: 'Quelles différences entre `var`, `let` et `const` ?',
    back: "- `var` : portée de **fonction**, hissée et initialisée à `undefined`, redéclarable ; au niveau global, crée une propriété de `window`.\n- `let` : portée de **bloc**, soumise à la TDZ, réaffectable.\n- `const` : comme `let`, mais non réaffectable (l'objet référencé reste modifiable).\n\nUsage moderne : `const` par défaut, `let` si réaffectation, jamais `var`.",
    code: `if (true) {
  var v = 1
  let l = 2
}
console.log(v, typeof l)
console.log(window.v)`,
    output: `1 undefined
1`,
  },
  {
    id: 'f7',
    theme: 'scope',
    front: "Qu'est-ce que le hoisting ?",
    back: "Avant d'exécuter une portée, le moteur enregistre toutes ses déclarations : c'est comme si elles étaient « remontées » en haut. Les déclarations de fonction sont hissées **avec leur corps** ; les `var` sont hissées et initialisées à `undefined` (l'affectation reste à sa place) ; `let`, `const` et `class` sont hissées mais **non initialisées** (TDZ).",
    code: `console.log(a)
var a = 1
console.log(a)`,
    output: `undefined
1`,
  },
  {
    id: 'f8',
    theme: 'scope',
    front: "Qu'est-ce que la TDZ (zone morte temporelle) ?",
    back: "C'est la période entre le début d'une portée et la ligne où une variable `let`/`const`/`class` est déclarée. La variable existe déjà (elle masque une éventuelle variable externe de même nom) mais tout accès lève une `ReferenceError`, même `typeof`. Elle rend visibles les usages avant déclaration, que `var` cachait sous un `undefined`.",
    code: `let x = 'externe'
{
  console.log(x)
  let x = 'interne'
}`,
    output: `Uncaught ReferenceError: Cannot access 'x' before initialization`,
  },
  {
    id: 'f9',
    theme: 'scope',
    front: "Quelle différence entre déclaration de fonction et expression de fonction ?",
    back: "Une **déclaration** (`function f() {}`) est hissée avec son corps : on peut l'appeler avant sa ligne. Une **expression** (`const f = function () {}` ou une fléchée) suit les règles de la variable qui la reçoit : avec `var`, la variable vaut `undefined` avant l'affectation (d'où « is not a function ») ; avec `let`/`const`, c'est la TDZ.",
    code: `console.log(hello())
function hello() {
  return 'ok'
}
console.log(typeof greet)
greet()
var greet = function () {
  return 'ok'
}`,
    output: `ok
undefined
Uncaught TypeError: greet is not a function`,
  },
  {
    id: 'f10',
    theme: 'scope',
    front: "Qu'est-ce que la portée lexicale ?",
    back: "La portée d'une variable est déterminée par **l'endroit où le code est écrit**, pas par l'endroit d'où une fonction est appelée. Une fonction résout ses variables libres en remontant les portées qui l'entourent dans le source (la chaîne de portées). C'est ce mécanisme qui rend les closures possibles.",
    code: `const x = 'global'
function show() {
  return x
}
function run() {
  const x = 'local'
  return show()
}
console.log(run())`,
    output: `global`,
  },

  // ——— Closures ———
  {
    id: 'f11',
    theme: 'closures',
    front: "Qu'est-ce qu'une closure ?",
    back: "C'est une fonction associée à l'**environnement lexical** dans lequel elle a été créée. Elle garde accès aux variables de la portée englobante même après la fin de l'exécution de celle-ci. Elle capture les **variables** (vivantes, modifiables), pas une copie de leurs valeurs.",
    code: `function makeCounter() {
  let count = 0
  return () => ++count
}
const counter = makeCounter()
counter()
console.log(counter())`,
    output: `2`,
  },
  {
    id: 'f12',
    theme: 'closures',
    front: 'À quoi servent les closures en pratique ?',
    back: "- **Encapsulation** : état privé inaccessible de l'extérieur (pattern module, fabriques).\n- **Fonctions configurées** : application partielle, curryfication (`multiplyBy(2)`).\n- **Mémoire entre appels** : `memoize`, `once`, `debounce`, `throttle`.\n- **Callbacks** qui se souviennent de leur contexte (gestionnaires, minuteurs, hooks React).",
  },
  {
    id: 'f13',
    theme: 'closures',
    front: 'Comment écrire une fonction `once` ?',
    back: "On retourne une nouvelle fonction qui garde, par closure, un indicateur `done` et le résultat du premier appel. Au premier appel elle exécute `fn` et mémorise le résultat ; ensuite elle renvoie toujours ce résultat sans rappeler `fn`.",
    code: `function once(fn) {
  let done = false
  let result
  return (...args) => {
    if (!done) {
      done = true
      result = fn(...args)
    }
    return result
  }
}
const init = once(() => {
  console.log('init')
  return 42
})
console.log(init(), init())`,
    output: `init
42 42`,
  },
  {
    id: 'f14',
    theme: 'closures',
    front: 'Les closures peuvent-elles provoquer des fuites mémoire ?',
    back: "Oui : tant qu'une closure est accessible, les variables qu'elle capture ne peuvent pas être libérées par le ramasse-miettes. Cas typiques : un gestionnaire d'événement ou un `setInterval` jamais retiré qui référence de grosses données ou des nœuds DOM supprimés. Remède : `removeEventListener`, `clearInterval`, `AbortController`, et les fonctions de nettoyage des frameworks (`useEffect`, `onUnmounted`).",
  },
  {
    id: 'f15',
    theme: 'closures',
    front: "Qu'est-ce qu'une IIFE et à quoi sert-elle ?",
    back: "Une *Immediately Invoked Function Expression* est une fonction appelée dès sa définition : `(() => { ... })()`. Avant `let` et les modules ES, c'était le seul moyen de créer une portée privée et d'éviter de polluer l'espace global (pattern module). Aujourd'hui, un bloc `{ }` avec `let`/`const` ou un module suffit le plus souvent.",
    code: `const counter = (() => {
  let count = 0
  return { inc: () => ++count }
})()
counter.inc()
console.log(counter.inc(), typeof count)`,
    output: `2 undefined`,
  },

  // ——— this ———
  {
    id: 'f16',
    theme: 'this',
    front: 'Comment est déterminé `this` dans une fonction classique ?',
    back: "Par la **façon dont la fonction est appelée**, par ordre de priorité :\n- `new f()` : le nouvel objet ;\n- `f.call(obj)`, `f.apply(obj)`, `f.bind(obj)` : `obj` ;\n- `obj.f()` : `obj` ;\n- appel simple `f()` : `undefined` en mode strict, l'objet global sinon.\n\nLes fonctions fléchées échappent à ces règles : elles prennent le `this` de leur portée de définition.",
  },
  {
    id: 'f17',
    theme: 'this',
    front: 'Quelle différence entre `call`, `apply` et `bind` ?',
    back: "Les trois fixent `this`. `call(thisArg, a, b)` appelle immédiatement avec des arguments séparés ; `apply(thisArg, [a, b])` appelle immédiatement avec un tableau d'arguments ; `bind(thisArg, a)` n'appelle pas : il renvoie une **nouvelle fonction** liée (avec d'éventuels arguments pré-remplis), dont le `this` ne pourra plus changer.",
    code: `function intro(greeting, punct) {
  return greeting + ', ' + this.firstName + punct
}
const ada = { firstName: 'Ada' }
intro.call(ada, 'Bonjour', '!') // → 'Bonjour, Ada!'
intro.apply(ada, ['Salut', '.']) // → 'Salut, Ada.'
intro.bind(ada, 'Hello')('?') // → 'Hello, Ada?'`,
  },
  {
    id: 'f18',
    theme: 'this',
    front: 'Que vaut `this` dans une fonction fléchée ?',
    back: "Une fléchée n'a pas de `this` propre : elle utilise celui de la portée **lexicale** où elle est définie, et ni `call`, ni `bind`, ni `new` ne peuvent le changer (elle n'est d'ailleurs pas constructible). C'est idéal pour un callback **dans** une méthode, mais à éviter **comme** méthode d'objet littéral.",
    code: `const timer = {
  seconds: 0,
  start() {
    setTimeout(() => {
      this.seconds++
      console.log(this.seconds)
    }, 0)
  },
}
timer.start()`,
    output: `1`,
  },
  {
    id: 'f19',
    theme: 'this',
    front: 'Pourquoi une méthode de classe passée en callback perd-elle `this` ?',
    back: "Extraire la méthode (`const { tick } = c`, `onClick={this.tick}`) la détache de l'instance. Le corps d'une classe est toujours en **mode strict** : appelée seule, la méthode reçoit `this === undefined`, d'où une `TypeError`. Solutions : `bind` dans le constructeur, une fléchée à l'appel, ou un champ de classe fléché (`tick = () => {}`), créé par instance.",
    code: `class Clock {
  label = 'horloge'
  tick() {
    return this.label
  }
  tickArrow = () => this.label
}
const c = new Clock()
const { tick, tickArrow } = c
console.log(tickArrow())
tick()`,
    output: `horloge
Uncaught TypeError: Cannot read properties of undefined (reading 'label')`,
  },
  {
    id: 'f20',
    theme: 'this',
    front: "Que vaut `this` dans un gestionnaire d'événement DOM ?",
    back: "Avec une fonction classique passée à `addEventListener`, `this` vaut `event.currentTarget`, l'élément sur lequel l'écouteur est attaché. Avec une fléchée, `this` est celui de la portée englobante. Le plus lisible est de ne pas dépendre de `this` et d'utiliser `event.currentTarget` (élément de l'écouteur) ou `event.target` (élément d'origine).",
    code: `button.addEventListener('click', function (event) {
  console.log(this === event.currentTarget)
})`,
    run: false,
  },

  // ——— Prototypes et classes ———
  {
    id: 'f21',
    theme: 'prototypes',
    front: "Qu'est-ce que la chaîne de prototypes ?",
    back: "Chaque objet a un lien interne `[[Prototype]]` vers un autre objet (ou `null`). Quand une propriété est absente de l'objet, le moteur la cherche dans son prototype, puis dans le prototype du prototype, jusqu'à `Object.prototype` puis `null`. C'est le mécanisme d'héritage de JavaScript ; `class` repose dessus.",
    code: `const animal = { eats: true }
const rabbit = Object.create(animal)
rabbit.jumps = true
rabbit.eats // → true
Object.getPrototypeOf(rabbit) === animal // → true
Object.hasOwn(rabbit, 'eats') // → false
'eats' in rabbit // → true`,
  },
  {
    id: 'f22',
    theme: 'prototypes',
    front: 'Quelle différence entre `prototype` et `__proto__` ?',
    back: "`F.prototype` est une propriété des **fonctions constructeurs** : c'est l'objet qui deviendra le prototype des instances créées par `new F()`. `obj.__proto__` (accesseur historique, préférer `Object.getPrototypeOf`) désigne le prototype **effectif** d'un objet. Donc `Object.getPrototypeOf(new F()) === F.prototype`.",
    code: `function Dog() {}
const d = new Dog()
Object.getPrototypeOf(d) === Dog.prototype // → true
Dog.prototype.constructor === Dog // → true
d.prototype // → undefined`,
  },
  {
    id: 'f23',
    theme: 'prototypes',
    front: '`class` est-il seulement du sucre syntaxique ?',
    back: "Pour l'essentiel oui : une classe est une fonction constructeur et ses méthodes vivent sur `prototype`. Mais il y a des différences réelles : appel sans `new` interdit, corps en mode strict, méthodes non énumérables, déclaration soumise à la TDZ, champs et membres privés `#x`, et `super`/`extends` qui gèrent proprement l'héritage (y compris des classes natives comme `Error` ou `Array`).",
    code: `class Foo {}
console.log(typeof Foo)
try {
  Foo()
} catch (e) {
  console.log(e.message)
}`,
    output: `function
Class constructor Foo cannot be invoked without 'new'`,
  },
  {
    id: 'f24',
    theme: 'prototypes',
    front: 'Que fait exactement `new` ?',
    back: "1. Crée un objet vide dont le prototype est `Constructeur.prototype`.\n2. Appelle le constructeur avec `this` lié à cet objet.\n3. Si le constructeur renvoie un **objet**, c'est lui le résultat ; sinon, c'est l'objet créé.",
    code: `function Person(firstName) {
  this.firstName = firstName
}
Person.prototype.hi = function () {
  return 'Salut ' + this.firstName
}
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype)
  const result = Ctor.apply(obj, args)
  return result !== null && typeof result === 'object' ? result : obj
}
myNew(Person, 'Ada').hi() // → 'Salut Ada'`,
  },
  {
    id: 'f25',
    theme: 'prototypes',
    front: 'Comment fonctionnent `extends` et `super` ?',
    back: "`class B extends A` relie `B.prototype` à `A.prototype` (héritage des méthodes) et `B` à `A` (héritage des statiques). Dans le constructeur d'une sous-classe, `super(...)` doit être appelé **avant** tout usage de `this`. Dans une méthode, `super.m()` appelle la version du parent.",
    code: `class Animal {
  constructor(label) {
    this.label = label
  }
  speak() {
    return this.label + ' fait du bruit'
  }
}
class Dog extends Animal {
  speak() {
    return super.speak() + ' : wouf'
  }
}
console.log(new Dog('Rex').speak())`,
    output: `Rex fait du bruit : wouf`,
  },

  // ——— Event loop ———
  {
    id: 'f26',
    theme: 'eventloop',
    front: "Qu'est-ce que l'event loop ?",
    back: "JavaScript exécute le code sur **un seul thread** avec une pile d'appels. Les opérations longues (réseau, minuteurs, événements) sont gérées par l'environnement, qui place leurs callbacks dans des files. L'event loop, quand la pile est vide, vide toutes les **microtâches**, laisse éventuellement le navigateur faire un rendu, puis prend la **macrotâche** suivante, et recommence.",
  },
  {
    id: 'f27',
    theme: 'eventloop',
    front: 'Quelle différence entre microtâche et macrotâche ?',
    back: "- **Macrotâches** : script initial, `setTimeout`, `setInterval`, événements, messages. Une seule par tour de boucle.\n- **Microtâches** : callbacks de promesses (`then`, suite d'un `await`), `queueMicrotask`, `MutationObserver`. La file est vidée **entièrement** après chaque macrotâche, avant le rendu.\n\nDonc une promesse résolue passe toujours avant un `setTimeout(fn, 0)`.",
    code: `setTimeout(() => console.log('macro'), 0)
Promise.resolve().then(() => console.log('micro'))
console.log('sync')`,
    output: `sync
micro
macro`,
  },
  {
    id: 'f28',
    theme: 'eventloop',
    front: 'Quand s\u2019exécute vraiment `setTimeout(fn, 0)` ?',
    back: "Au plus tôt après la fin du code synchrone en cours **et** de toutes les microtâches, quand l'event loop arrive à cette macrotâche. Le délai est un **minimum**, pas une garantie : un thread occupé le retarde, les navigateurs imposent au moins 4 ms après plusieurs minuteurs imbriqués, et les onglets en arrière-plan sont fortement ralentis.",
  },
  {
    id: 'f29',
    theme: 'eventloop',
    front: 'Où se place `requestAnimationFrame` dans la boucle ?',
    back: "Son callback est exécuté juste **avant le prochain rendu** (en général 60 fois par seconde), après les microtâches. C'est le bon endroit pour les animations et les lectures/écritures de styles synchronisées avec l'affichage, contrairement à `setTimeout` qui n'est pas aligné sur l'écran. Il est mis en pause dans les onglets cachés.",
  },
  {
    id: 'f30',
    theme: 'eventloop',
    front: "Pourquoi un calcul long fige-t-il la page et comment l'éviter ?",
    back: "Tant que la pile d'appels n'est pas vide, l'event loop ne peut traiter ni événement, ni minuteur, ni rendu : la page ne répond plus. Solutions :\n- découper le travail en morceaux rendant la main entre chaque (`setTimeout`, `scheduler.yield()`) ;\n- déplacer le calcul dans un **Web Worker** (autre thread) ;\n- réduire le travail (algorithme, virtualisation de listes).",
  },

  // ——— Promesses et async/await ———
  {
    id: 'f31',
    theme: 'async',
    front: "Quels sont les états d'une promesse ?",
    back: "`pending` (en attente), puis une seule fois et définitivement `fulfilled` (tenue, avec une valeur) ou `rejected` (rompue, avec une raison). On dit qu'elle est *settled* une fois tenue ou rompue. Les appels suivants à `resolve`/`reject` sont ignorés.",
    code: `const p = new Promise((resolve, reject) => {
  resolve('ok')
  reject(new Error('ignoré'))
})
p.then((v) => console.log(v))`,
    output: `ok`,
  },
  {
    id: 'f32',
    theme: 'async',
    front: 'Quelle différence entre `Promise.all`, `allSettled`, `race` et `any` ?',
    back: "- `all` : tableau des valeurs quand **toutes** sont tenues ; rejette dès le **premier** rejet.\n- `allSettled` : attend toutes, renvoie `{ status, value | reason }` pour chacune, ne rejette jamais.\n- `race` : adopte le résultat de la **première** promesse réglée (tenue ou rompue).\n- `any` : première promesse **tenue** ; rejette avec une `AggregateError` si toutes échouent.",
    code: `const ok = Promise.resolve(1)
const ko = () => Promise.reject(new Error('échec'))
async function demo() {
  try {
    await Promise.all([ok, ko()])
  } catch (e) {
    console.log('all :', e.message)
  }
  const settled = await Promise.allSettled([ok, ko()])
  console.log(settled.map((x) => x.status))
  console.log('any :', await Promise.any([ko(), ok]))
  console.log('race :', await Promise.race([ok, new Promise(() => {})]))
}
demo()`,
    output: `all : échec
[ 'fulfilled', 'rejected' ]
any : 1
race : 1`,
  },
  {
    id: 'f33',
    theme: 'async',
    front: 'Comment gérer les erreurs avec `async`/`await` ?',
    back: "Un `await` sur une promesse rompue **lève** la raison comme une exception : on l'attrape avec `try/catch` (et `finally` pour le nettoyage). Sans `try`, la promesse renvoyée par la fonction `async` est rompue et c'est à l'appelant de gérer (`.catch`). Une promesse jamais gérée produit une *unhandled rejection*.",
    code: `async function load() {
  throw new Error('réseau')
}
async function main() {
  try {
    await load()
  } catch (e) {
    console.log('attrapé :', e.message)
  }
}
main()`,
    output: `attrapé : réseau`,
  },
  {
    id: 'f34',
    theme: 'async',
    front: 'Comment exécuter plusieurs `await` en parallèle plutôt qu\u2019en séquence ?',
    back: "`const a = await f(); const b = await g()` attend `f` avant même de lancer `g` : les durées s'additionnent. Si les opérations sont indépendantes, on les lance d'abord, puis on attend l'ensemble : `const [a, b] = await Promise.all([f(), g()])`. La durée totale est alors celle de la plus lente. Garder le séquentiel quand `g` dépend du résultat de `f`.",
  },
  {
    id: 'f35',
    theme: 'async',
    front: 'Que renvoie une fonction `async` ?',
    back: "**Toujours une promesse** : une valeur retournée devient la valeur de résolution, une exception levée devient un rejet. Elle s'exécute de manière synchrone jusqu'au premier `await`, puis rend la main à l'appelant. Oublier `await` à l'appel donne donc une promesse au lieu de la valeur.",
    code: `async function getAnswer() {
  return 42
}
typeof getAnswer().then // → 'function'
getAnswer().then((v) => console.log(v))`,
    output: `42`,
  },
  {
    id: 'f36',
    theme: 'async',
    front: "Qu'est-ce qu'un rejet non géré (*unhandled rejection*) ?",
    back: "Une promesse rompue sans aucun `.catch` ni `try/catch` autour de son `await`. Le navigateur affiche « Uncaught (in promise) » et émet l'événement `unhandledrejection` ; Node termine le processus par défaut. Toujours terminer une chaîne de promesses par un `.catch`, ou `await` la promesse dans un `try`.",
    code: `Promise.reject(new Error('perdu'))
console.log('suite')`,
    output: `suite
Uncaught (in promise) Error: perdu`,
  },

  // ——— ES6+ ———
  {
    id: 'f37',
    theme: 'es6',
    front: 'Comment fonctionne la déstructuration avec valeurs par défaut et renommage ?',
    back: "On extrait des propriétés (`{ a, b }`) ou des positions (`[x, y]`) dans des variables. `{ a: alpha }` renomme, `= valeur` donne un défaut appliqué seulement si la valeur est `undefined`, `...rest` récupère le reste. On peut sauter des positions de tableau avec des virgules.",
    code: `const { a: alpha = 1, b = 2, ...rest } = { a: undefined, c: 3, d: 4 }
console.log(alpha, b, rest)
const [first, , third = 'z'] = ['x', 'y']
console.log(first, third)`,
    output: `1 2 { c: 3, d: 4 }
x z`,
  },
  {
    id: 'f38',
    theme: 'es6',
    front: 'Quelle différence entre rest et spread ?',
    back: "Même syntaxe `...`, rôles inverses. Le **rest** *rassemble* plusieurs éléments en un tableau ou objet : paramètres (`function f(...args)`) ou déstructuration. Le **spread** *étale* un itérable ou un objet : arguments d'appel (`Math.max(...nums)`), littéraux (`[...a, ...b]`, `{ ...obj, x: 1 }`). Les deux copies sont superficielles.",
    code: `const sum = (...nums) => nums.reduce((a, b) => a + b, 0)
sum(...[1, 2, 3]); // → 6
[...'abc']; // → [ 'a', 'b', 'c' ]
({ ...{ a: 1, b: 2 }, b: 3 }) // → { a: 1, b: 3 }`,
  },
  {
    id: 'f39',
    theme: 'es6',
    front: "Qu'est-ce qu'un template literal étiqueté (*tagged template*) ?",
    back: "Une fonction placée devant un template literal reçoit le tableau des morceaux de texte (`strings`, avec `strings.raw`) puis les valeurs interpolées, et renvoie ce qu'elle veut. Usages : échappement HTML, requêtes SQL paramétrées, `styled-components`, `String.raw`, `gql`.",
    code: `const tag = (strings, ...values) => strings.join('|') + ' / ' + values.join(',')
console.log(tag\`a\${1}b\${2}c\`)
console.log(String.raw\`C:\\n\`)`,
    output: `a|b|c / 1,2
C:\\n`,
  },
  {
    id: 'f40',
    theme: 'es6',
    front: 'À quoi sert `Symbol` ?',
    back: "Un `Symbol` est une valeur primitive **unique**, utilisable comme clé de propriété sans risque de collision. Ces clés sont ignorées par `Object.keys`, `for...in` et `JSON.stringify`. Les symboles bien connus (`Symbol.iterator`, `Symbol.toPrimitive`…) permettent de personnaliser le comportement natif d'un objet.",
    code: `const id = Symbol('id')
const user = { firstName: 'Ada', [id]: 42 }
console.log(Object.keys(user), user[id])
console.log(JSON.stringify(user))
console.log(Symbol('x') === Symbol('x'))`,
    output: `[ 'firstName' ] 42
{"firstName":"Ada"}
false`,
  },
  {
    id: 'f41',
    theme: 'es6',
    front: 'Que fait le chaînage optionnel `?.` ?',
    back: "`a?.b` renvoie `undefined` au lieu de lever une erreur si `a` est `null` ou `undefined`, et **court-circuite** le reste de l'expression. Il existe aussi `a?.[clé]` et `f?.()` (appelle seulement si `f` existe). À ne pas abuser : un `?.` partout masque des données qui devraient exister.",
    code: `const user = { address: null, getAge: undefined }
user.address?.city // → undefined
user.getAge?.() // → undefined
user.address?.city.toUpperCase() // → undefined`,
  },
  {
    id: 'f42',
    theme: 'es6',
    front: 'Que sont les itérateurs et les générateurs ?',
    back: "Un **itérable** possède une méthode `[Symbol.iterator]()` qui renvoie un **itérateur**, objet dont `next()` renvoie `{ value, done }`. `for...of`, le spread et la déstructuration s'appuient dessus. Une fonction **génératrice** (`function*`) produit un itérateur : chaque `yield` met l'exécution en pause jusqu'au `next()` suivant, ce qui permet des séquences paresseuses, voire infinies.",
    code: `function* ids() {
  let i = 1
  while (true) yield i++
}
const gen = ids()
console.log(gen.next())
console.log(gen.next().value, gen.next().value)`,
    output: `{ value: 1, done: false }
2 3`,
  },
  {
    id: 'f43',
    theme: 'es6',
    front: 'À quoi servent `Set` et `WeakMap` ?',
    back: "Un `Set` stocke des valeurs **uniques** (égalité SameValueZero), avec `add`, `has`, `delete` en temps constant et un ordre d'insertion conservé. Une `WeakMap` associe des données à des **objets** sans les retenir en mémoire : si la clé n'est plus référencée ailleurs, l'entrée disparaît. Elle n'est pas itérable ; usage typique : métadonnées ou cache attachés à des objets ou nœuds DOM.",
    code: `new Set([1, 1, 2, NaN, NaN]).size // → 3
new Set('hello').has('l'); // → true
[...new Set([3, 1, 3])] // → [ 3, 1 ]`,
  },

  // ——— Tableaux et immutabilité ———
  {
    id: 'f44',
    theme: 'arrays',
    front: 'Quelle différence entre `map`, `filter` et `reduce` ?',
    back: "Les trois renvoient un résultat sans muter le tableau. `map` transforme chaque élément (même longueur) ; `filter` garde les éléments pour lesquels le prédicat est truthy ; `reduce` accumule tout le tableau en **une seule valeur** de n'importe quel type. Toujours donner une valeur initiale à `reduce` : sans elle, un tableau vide lève une `TypeError`.",
    code: `[1, 2, 3].map((n) => n * 2); // → [ 2, 4, 6 ]
[1, 2, 3, 4].filter((n) => n % 2 === 0); // → [ 2, 4 ]
[1, 2, 3].reduce((acc, n) => acc + n, 0) // → 6`,
  },
  {
    id: 'f45',
    theme: 'arrays',
    front: 'Quelles méthodes de tableau mutent le tableau d\u2019origine ?',
    back: "Mutent : `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`. Ne mutent pas : `map`, `filter`, `slice`, `concat`, `flat`, et les versions ES2023 `toSorted`, `toReversed`, `toSpliced`, `with`. Dans un state React/Vue/Redux, utiliser les versions non mutantes ou copier d'abord.",
    code: `const arr = [3, 1, 2]
arr.toSorted() // → [ 1, 2, 3 ]
arr.with(0, 9) // → [ 9, 1, 2 ]
arr // → [ 3, 1, 2 ]`,
  },
  {
    id: 'f46',
    theme: 'arrays',
    front: 'Quelle différence entre `find`, `filter`, `some` et `findIndex` ?',
    back: "`find` renvoie le **premier élément** qui satisfait le prédicat (ou `undefined`) ; `findIndex` renvoie son **indice** (ou `-1`) ; `filter` renvoie **tous** les éléments correspondants dans un nouveau tableau ; `some` renvoie un **booléen**. `find`, `findIndex` et `some` s'arrêtent dès la première correspondance. Il existe aussi `every`, `findLast` et `findLastIndex`.",
    code: `const nums = [5, 12, 8, 130]
nums.find((n) => n > 10) // → 12
nums.findIndex((n) => n > 10) // → 1
nums.filter((n) => n > 10) // → [ 12, 130 ]
nums.some((n) => n > 100) // → true`,
  },
  {
    id: 'f47',
    theme: 'arrays',
    front: 'Quelle différence entre `slice` et `splice` ?',
    back: "`slice(début, fin)` renvoie une **copie** d'une portion (fin exclue, indices négatifs acceptés) sans toucher au tableau. `splice(début, nb, ...ajouts)` **modifie** le tableau en place (suppression et/ou insertion) et renvoie les éléments supprimés. Sa version non mutante est `toSpliced`.",
    code: `const arr = ['a', 'b', 'c', 'd']
console.log(arr.slice(1, 3), arr)
console.log(arr.splice(1, 2, 'X'), arr)`,
    output: `[ 'b', 'c' ] [ 'a', 'b', 'c', 'd' ]
[ 'b', 'c' ] [ 'a', 'X', 'd' ]`,
  },
  {
    id: 'f48',
    theme: 'arrays',
    front: 'Comment dédoublonner ou aplatir un tableau ?',
    back: "Dédoublonner des primitives : `[...new Set(arr)]` (ordre conservé). Pour des objets, dédoublonner selon une clé avec une `Map`. Aplatir : `flat(profondeur)` (1 par défaut, `Infinity` pour tout aplatir) ; `flatMap(fn)` fait un `map` suivi d'un `flat(1)`, pratique pour produire 0, 1 ou plusieurs éléments par entrée.",
    code: `[...new Set([1, 2, 2, 3, 1])]; // → [ 1, 2, 3 ]
[1, [2, [3, [4]]]].flat(); // → [ 1, 2, [ 3, [ 4 ] ] ]
[1, [2, [3, [4]]]].flat(Infinity); // → [ 1, 2, 3, 4 ]
['a b', 'c'].flatMap((s) => s.split(' ')) // → [ 'a', 'b', 'c' ]`,
  },

  // ——— Objets, références, copies ———
  {
    id: 'f49',
    theme: 'objects',
    front: 'Quelle différence entre copie superficielle et copie profonde ?',
    back: "Une copie **superficielle** (`{ ...obj }`, `Object.assign`, `[...arr]`, `slice`) crée un nouvel objet de premier niveau, mais les objets imbriqués restent **partagés**. Une copie **profonde** duplique récursivement tous les niveaux : `structuredClone(obj)` (gère `Date`, `Map`, `Set`, cycles, pas les fonctions). `JSON.parse(JSON.stringify(obj))` perd `undefined`, fonctions et dates.",
    code: `const a = { n: { v: 1 } }
const shallow = { ...a }
const deep = structuredClone(a)
a.n.v = 2
console.log(shallow.n.v, deep.n.v)`,
    output: `2 1`,
  },
  {
    id: 'f50',
    theme: 'objects',
    front: 'Quelle différence entre `Object.freeze`, `Object.seal` et `Object.preventExtensions` ?',
    back: "- `preventExtensions` : interdit d'**ajouter** des propriétés.\n- `seal` : en plus, interdit d'en **supprimer** (les valeurs restent modifiables).\n- `freeze` : en plus, interdit de **modifier** les valeurs.\n\nTous sont **superficiels** et, hors mode strict, les écritures interdites échouent silencieusement.",
    code: `const o = Object.freeze({ a: 1, nested: { b: 1 } })
o.a = 2
o.nested.b = 2
delete o.a
console.log(o)
console.log(Object.isFrozen(o), Object.isFrozen(o.nested))`,
    output: `{ a: 1, nested: { b: 2 } }
true false`,
  },
  {
    id: 'f51',
    theme: 'objects',
    front: 'Dans quel ordre sont énumérées les clés d\u2019un objet ?',
    back: "D'abord les clés **entières** (de type index de tableau) en ordre croissant, puis les autres clés chaînes dans l'**ordre d'insertion**, puis les symboles (seulement via `Reflect.ownKeys` ou `Object.getOwnPropertySymbols`). `Object.keys`, `values`, `entries` et `for...in` suivent cet ordre, `for...in` ajoutant les clés énumérables héritées.",
    code: `Object.keys({ b: 1, 2: 'x', a: 2, 1: 'y' }) // → [ '1', '2', 'b', 'a' ]
Object.entries({ x: 1, y: 2 }) // → [ [ 'x', 1 ], [ 'y', 2 ] ]
Object.fromEntries([['k', 'v']]) // → { k: 'v' }`,
  },
  {
    id: 'f52',
    theme: 'objects',
    front: 'JavaScript passe-t-il les objets par référence ?',
    back: "Non, tout est passé **par valeur**, mais la valeur d'un objet est une **référence** (on parle de *call by sharing*). La fonction peut donc **muter** l'objet reçu, visible par l'appelant, mais **réaffecter** son paramètre n'a aucun effet à l'extérieur.",
    code: `function reassign(o) {
  o = { v: 2 }
}
function mutate(o) {
  o.v = 3
}
const obj = { v: 1 }
reassign(obj)
console.log(obj.v)
mutate(obj)
console.log(obj.v)`,
    output: `1
3`,
  },
  {
    id: 'f53',
    theme: 'objects',
    front: 'Quand préférer une `Map` à un objet ?',
    back: "Une `Map` accepte des clés de **tout type** (objets, nombres sans conversion en chaîne), conserve l'ordre d'insertion, expose `size`, est directement itérable et n'a pas de clés héritées (pas de risque avec `'__proto__'` ou `'constructor'`). Elle est optimisée pour les ajouts et suppressions fréquents. L'objet reste préférable pour une structure fixe et la sérialisation JSON.",
    code: `new Map([[1, 'a'], ['1', 'b']]).size // → 2
Object.keys({ 1: 'a', '1': 'b' }).length // → 1
new Map([[{}, 'x']]).size // → 1`,
  },

  // ——— Modules ———
  {
    id: 'f54',
    theme: 'modules',
    front: 'Quelle différence entre modules ES (ESM) et CommonJS ?',
    back: "- **ESM** (`import`/`export`) : standard du langage, structure **statique** analysable à la compilation (tree shaking), chargement asynchrone, liaisons vivantes, mode strict par défaut, `await` possible au niveau supérieur.\n- **CommonJS** (`require`/`module.exports`) : historique de Node, chargement **synchrone** et dynamique, exporte une copie de valeur (l'objet `exports`).",
  },
  {
    id: 'f55',
    theme: 'modules',
    front: 'Quelle différence entre export nommé et export par défaut ?',
    back: "Un module peut avoir plusieurs exports **nommés**, importés avec leur nom exact entre accolades (renommables avec `as`), et au plus un export **par défaut**, importé sous le nom de son choix. Beaucoup d'équipes préfèrent les exports nommés : meilleure autocomplétion, renommages fiables, pas d'incohérence de nom d'un fichier à l'autre.",
    code: `// math.js
export const add = (a, b) => a + b
export default function multiply(a, b) {
  return a * b
}

// main.js
import multiply, { add as sum } from './math.js'`,
    run: false,
  },
  {
    id: 'f56',
    theme: 'modules',
    front: 'À quoi sert `import()` dynamique ?',
    back: "`import('./module.js')` charge un module **à la demande** et renvoie une promesse de son objet module. Il permet le **code splitting** : les bundlers créent un fichier séparé, chargé seulement quand nécessaire (route, modale, bibliothèque lourde). Il est utilisable partout, y compris hors module ES et avec un chemin calculé.",
    code: `button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js')
  renderChart(data)
})`,
    run: false,
  },
  {
    id: 'f57',
    theme: 'modules',
    front: 'Que signifie « les imports ES sont des liaisons vivantes » ?',
    back: "Un `import` ne copie pas la valeur exportée : c'est une vue **en lecture seule** sur la variable du module exportateur. Si le module modifie sa variable, l'importateur voit la nouvelle valeur ; mais l'importateur ne peut pas la réaffecter (`TypeError`). En CommonJS, `require` renvoie au contraire une copie figée au moment de l'appel.",
    code: `// counter.js
export let count = 0
export const inc = () => count++

// main.js
import { count, inc } from './counter.js'
inc()
console.log(count)`,
    run: false,
  },
  {
    id: 'f58',
    theme: 'modules',
    front: "Qu'est-ce que le tree shaking ?",
    back: "L'élimination, par le bundler (Rollup, Vite, webpack, esbuild), du code exporté mais **jamais importé**. Elle repose sur la structure statique des modules ES : on sait à la compilation ce qui est utilisé. Elle échoue face aux effets de bord au chargement, à CommonJS ou à `import * as` utilisé dynamiquement ; le champ `sideEffects` du `package.json` aide le bundler.",
  },
  {
    id: 'f59',
    theme: 'modules',
    front: 'Que change `<script type="module">` ?',
    back: "Le script est traité comme un module ES : `import`/`export` autorisés, **mode strict**, portée propre (les variables de haut niveau ne deviennent pas globales, `this` vaut `undefined`), exécution **différée** comme `defer`, une seule exécution même s'il est inclus deux fois, et chargement soumis à **CORS**.",
  },

  // ——— DOM et événements ———
  {
    id: 'f60',
    theme: 'dom',
    front: "Quelles sont les phases de propagation d'un événement ?",
    back: "1. **Capture** : de `window` vers la cible, en descendant.\n2. **Cible** : l'élément d'origine (`event.target`).\n3. **Bouillonnement** (*bubbling*) : de la cible vers `window`, en remontant.\n\nPar défaut, `addEventListener` écoute pendant le bouillonnement ; `{ capture: true }` écoute pendant la capture. Certains événements ne bouillonnent pas (`focus`, `blur` : utiliser `focusin`/`focusout`).",
  },
  {
    id: 'f61',
    theme: 'dom',
    front: "Qu'est-ce que la délégation d'événements ?",
    back: "Au lieu d'attacher un écouteur à chaque enfant, on en attache **un seul au parent** et on identifie l'enfant concerné via `event.target` (souvent avec `closest`). Grâce au bouillonnement, cela fonctionne aussi pour les éléments ajoutés plus tard, et économise de la mémoire.",
    code: `list.addEventListener('click', (event) => {
  const item = event.target.closest('li[data-id]')
  if (!item || !list.contains(item)) return
  selectItem(item.dataset.id)
})`,
    run: false,
  },
  {
    id: 'f62',
    theme: 'dom',
    front: 'Quelle différence entre `preventDefault` et `stopPropagation` ?',
    back: "`preventDefault()` annule l'**action par défaut** du navigateur (envoi d'un formulaire, suivi d'un lien, case cochée) mais l'événement continue de se propager. `stopPropagation()` arrête la **propagation** vers les autres éléments, sans annuler l'action par défaut. `stopImmediatePropagation()` empêche aussi les autres écouteurs du même élément.",
  },
  {
    id: 'f63',
    theme: 'dom',
    front: 'Quelle différence entre `<script>`, `async` et `defer` ?',
    back: "- `<script>` seul : bloque l'analyse du HTML pendant le téléchargement et l'exécution.\n- `async` : téléchargement en parallèle, exécution **dès que prêt** (ordre non garanti) ; pour les scripts indépendants (analytics).\n- `defer` : téléchargement en parallèle, exécution **après l'analyse** du HTML, **dans l'ordre**, avant `DOMContentLoaded`. Les modules sont différés par défaut.",
  },
  {
    id: 'f64',
    theme: 'dom',
    front: 'Quelle différence entre `innerHTML` et `textContent` ?',
    back: "`innerHTML` lit ou écrit du **HTML** analysé par le navigateur : y injecter une donnée utilisateur ouvre la porte aux **failles XSS**, et le réécrire recrée tous les nœuds (écouteurs perdus). `textContent` traite la chaîne comme du **texte brut** : sûr et rapide. Pour insérer du HTML non fiable, le nettoyer (DOMPurify) ou construire les nœuds avec `createElement`.",
    code: `const comment = '<img src=x onerror=alert(1)>'
el.textContent = comment // affiché tel quel
el.innerHTML = comment // le script s'exécute`,
    run: false,
  },

  // ——— Performance ———
  {
    id: 'f65',
    theme: 'perf',
    front: 'Quelle différence entre debounce et throttle ?',
    back: "**Debounce** : on n'exécute la fonction qu'après un délai **sans nouvel appel** ; chaque appel relance le compte à rebours (recherche à la frappe, redimensionnement terminé). **Throttle** : on exécute au plus **une fois par intervalle**, quel que soit le nombre d'appels (scroll, mousemove). Les deux limitent les traitements coûteux sur des événements fréquents.",
    code: `function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
const search = debounce((q) => console.log('recherche', q), 50)
search('a')
search('ab')
search('abc')`,
    output: `recherche abc`,
  },
  {
    id: 'f66',
    theme: 'perf',
    front: "Qu'est-ce que le reflow et le layout thrashing ?",
    back: "Le **reflow** (layout) est le recalcul de la géométrie des éléments, suivi du **repaint**. Lire une mesure (`offsetHeight`, `getBoundingClientRect`) après une modification de style force un reflow **synchrone**. Alterner lectures et écritures dans une boucle provoque un reflow à chaque tour : c'est le *layout thrashing*. Solution : grouper toutes les lectures, puis toutes les écritures, et animer `transform`/`opacity`.",
    code: `// Mauvais : lecture puis écriture à chaque tour
items.forEach((el) => {
  el.style.height = el.offsetHeight * 2 + 'px'
})
// Mieux : lire tout, puis écrire tout
const heights = items.map((el) => el.offsetHeight)
items.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px'
})`,
    run: false,
  },
  {
    id: 'f67',
    theme: 'perf',
    front: "Qu'est-ce que la mémoïsation ?",
    back: "Mettre en cache le résultat d'une fonction **pure** selon ses arguments, pour ne pas le recalculer. Utile pour les calculs coûteux appelés souvent avec les mêmes entrées. Contreparties : mémoire consommée, clé de cache à bien choisir (les objets se comparent par référence). En React : `useMemo`, `useCallback`, `React.memo`.",
    code: `function memoize(fn) {
  const cache = new Map()
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n))
    return cache.get(n)
  }
}
let calls = 0
const square = memoize((n) => {
  calls++
  return n * n
})
square(4)
square(4)
console.log(square(4), calls)`,
    output: `16 1`,
  },
  {
    id: 'f68',
    theme: 'perf',
    front: 'Comment réduire le temps de chargement initial d\u2019une application JavaScript ?',
    back: "- **Code splitting** par route avec `import()` dynamique, et lazy loading des composants lourds.\n- Tree shaking, minification, compression (gzip, brotli).\n- Images optimisées (formats modernes, `loading=\"lazy\"`, tailles adaptées).\n- Cache HTTP long sur les fichiers versionnés, CDN.\n- Mesurer avant d'optimiser : Lighthouse, Core Web Vitals (LCP, INP, CLS).",
  },
  {
    id: 'f69',
    theme: 'perf',
    front: 'À quoi sert un Web Worker ?',
    back: "À exécuter du JavaScript sur un **autre thread**, pour qu'un calcul lourd (parsing, compression, traitement d'image) ne bloque pas le thread principal et l'interface. Un worker n'a **pas accès au DOM** ; il communique avec la page par messages (`postMessage` / `onmessage`), les données étant copiées (structured clone) ou transférées.",
  },

  // ——— Bases du web ———
  {
    id: 'f70',
    theme: 'web',
    front: "Qu'est-ce que CORS ?",
    back: "La *same-origin policy* empêche un script de lire la réponse d'une requête vers une **autre origine** (protocole + domaine + port). **CORS** permet au serveur de l'autoriser avec des en-têtes comme `Access-Control-Allow-Origin`. Pour les requêtes non simples (méthode `PUT`, en-tête `Authorization`, JSON…), le navigateur envoie d'abord une requête **preflight** `OPTIONS`. C'est le serveur qu'on configure, pas le client.",
  },
  {
    id: 'f71',
    theme: 'web',
    front: 'Quelle différence entre cookies, `localStorage` et `sessionStorage` ?',
    back: "- **Cookies** : petits (~4 Ko), **envoyés automatiquement** au serveur à chaque requête, avec expiration et options `HttpOnly`, `Secure`, `SameSite`. Idéal pour la session d'authentification.\n- `localStorage` : ~5 Mo par origine, persistant, jamais envoyé, accessible en JS (donc exposé au XSS).\n- `sessionStorage` : comme `localStorage`, mais limité à l'onglet et effacé à sa fermeture.",
  },
  {
    id: 'f72',
    theme: 'web',
    front: 'Comment fonctionne le cache HTTP ?',
    back: "`Cache-Control` fixe la politique : `max-age=31536000, immutable` pour les fichiers versionnés (hash dans le nom), `no-cache` pour revalider à chaque fois (HTML), `no-store` pour ne rien stocker. Pour la revalidation, le serveur envoie un `ETag` (ou `Last-Modified`) ; le navigateur le renvoie dans `If-None-Match` et reçoit `304 Not Modified` si rien n'a changé.",
  },
  {
    id: 'f73',
    theme: 'web',
    front: 'Quelle différence entre XSS et CSRF ?',
    back: "- **XSS** : un attaquant fait **exécuter son script** dans votre page (contenu non échappé). Défenses : échapper les sorties, éviter `innerHTML`, Content Security Policy, cookies `HttpOnly`.\n- **CSRF** : un site tiers fait envoyer au navigateur une **requête authentifiée** à votre insu (les cookies partent automatiquement). Défenses : cookies `SameSite`, jeton anti-CSRF, vérification de l'origine.",
  },
  {
    id: 'f74',
    theme: 'web',
    front: 'Que se passe-t-il quand on tape une URL dans le navigateur ?',
    back: "Résolution **DNS** du domaine en adresse IP, connexion **TCP** (ou QUIC pour HTTP/3) et négociation **TLS**, envoi de la requête **HTTP**, réception du HTML. Le navigateur l'analyse et construit le **DOM**, charge CSS (CSSOM), scripts et images, combine DOM et CSSOM en arbre de rendu, calcule la mise en page (**layout**), puis peint et compose les calques à l'écran.",
  },
  {
    id: 'f75',
    theme: 'web',
    front: 'Que signifient les familles de codes HTTP et l\u2019idempotence ?',
    back: "`2xx` succès (`200`, `201 Created`, `204 No Content`), `3xx` redirection ou cache (`301`, `304`), `4xx` erreur du client (`400`, `401` non authentifié, `403` interdit, `404`), `5xx` erreur du serveur. Une méthode est **idempotente** si la répéter produit le même effet : `GET`, `PUT`, `DELETE` le sont, `POST` non (d'où le risque de double envoi).",
  },
  // ——— Algorithmique ———
  {
    id: 'f76',
    theme: 'algo',
    front: 'Que mesure la notation Big O ?',
    back: "La façon dont le temps (ou la mémoire) d'un algorithme **croît** quand la taille n de l'entrée augmente, dans le pire cas sauf mention contraire. On garde le terme dominant et on ignore les constantes : `3n² + 5n + 2` est en O(n²). Ordre à connaître : O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).",
  },
  {
    id: 'f77',
    theme: 'algo',
    front: 'Comment calculer la complexité de boucles imbriquées, d’une boucle qui divise par deux, d’une récursion ?',
    back: "- Boucles **successives** : on additionne, et le plus grand terme l'emporte (O(n) + O(n) = O(n)).\n- Boucles **imbriquées** sur n : on multiplie, O(n²).\n- Boucle qui **divise** la taille par deux à chaque tour : O(log n).\n- Récursion : nombre d'appels × coût d'un appel. Deux appels récursifs par niveau sur n niveaux donnent O(2ⁿ) ; diviser en deux moitiés puis fusionner en O(n) donne O(n log n) (tri fusion).",
  },
  {
    id: 'f78',
    theme: 'algo',
    front: 'Quel est le coût de `push`, `pop`, `shift`, `unshift`, `includes`, `sort` et `Set.has` ?',
    back: "`push` et `pop` : O(1) amorti (on agit sur la fin). `shift` et `unshift` : O(n), car tous les indices sont décalés. `includes`, `indexOf`, `find` : O(n). `sort` : O(n log n). `Set.has`, `Map.get`, `Map.set` : O(1) en moyenne. Réflexe : un `includes` dans une boucle devient un `Set` construit avant la boucle.",
  },
  {
    id: 'f79',
    theme: 'algo',
    front: 'Que signifie « O(1) amorti » ?',
    back: "Le coût **moyen par opération sur une longue suite d'opérations** est constant, même si certaines opérations isolées coûtent cher. Exemple : `push` sur un tableau dynamique ; quand la capacité est pleine, le moteur réalloue un bloc plus grand (souvent le double) et recopie tout en O(n), mais cela arrive si rarement que n `push` coûtent O(n) au total.",
  },
  {
    id: 'f80',
    theme: 'algo',
    front: 'Quand penser à une table de hachage (`Map`, `Set`, objet de comptage) ?',
    back: "Dès que l'énoncé parle de **doublons**, de **fréquences**, d'**anagrammes**, de « déjà vu », ou de retrouver un complément (two-sum). On échange de la mémoire (O(n)) contre du temps : une recherche en O(1) en moyenne au lieu d'un parcours en O(n), ce qui fait souvent passer de O(n²) à O(n).",
    code: `const freq = new Map()
for (const w of ['a', 'b', 'a']) freq.set(w, (freq.get(w) ?? 0) + 1)
freq.get('a') // → 2
new Set([3, 1, 3]).size // → 2`,
  },
  {
    id: 'f81',
    theme: 'algo',
    front: 'Quels signaux évoquent la technique des deux pointeurs ?',
    back: "Un tableau ou une chaîne **trié** (ou dont on peut parcourir les deux bouts), une recherche de **paire** vérifiant une condition, un palindrome, une fusion de deux listes triées, ou une modification **en place** (supprimer les doublons, déplacer les zéros). Deux indices avancent l'un vers l'autre ou dans le même sens : O(n) en temps, O(1) en mémoire.",
  },
  {
    id: 'f82',
    theme: 'algo',
    front: 'Quels signaux évoquent une fenêtre glissante ?',
    back: "Un **sous-tableau ou une sous-chaîne contigu**, avec « le plus long », « le plus court », « de taille k » ou « somme maximale ». On étend la fenêtre à droite et on la réduit à gauche quand une contrainte est violée, en mettant à jour l'état (somme, `Map` des caractères) de façon incrémentale. Chaque indice avance au plus n fois : O(n).",
  },
  {
    id: 'f83',
    theme: 'algo',
    front: 'Comment écrire une recherche dichotomique sans erreur de bornes ?',
    back: "Sur un tableau trié : `lo = 0`, `hi = n - 1`, boucle `while (lo <= hi)`, `mid = Math.floor((lo + hi) / 2)`, puis `lo = mid + 1` ou `hi = mid - 1`. Les deux bornes doivent **toujours bouger**, sinon boucle infinie. Complexité O(log n). Pour trouver la **première** occurrence, on continue à gauche après une égalité au lieu de s'arrêter.",
    code: `function search(arr, target) {
  let lo = 0
  let hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}
search([1, 3, 5, 7, 9], 7) // → 3
search([1, 3, 5, 7, 9], 4) // → -1`,
  },
  {
    id: 'f84',
    theme: 'algo',
    front: 'Tri fusion ou tri rapide : quelles différences ?',
    back: "- **Tri fusion** (*merge sort*) : coupe en deux, trie chaque moitié, fusionne. Toujours O(n log n), **stable**, mais O(n) de mémoire supplémentaire.\n- **Tri rapide** (*quicksort*) : partitionne autour d'un pivot. O(n log n) en moyenne, **O(n²)** dans le pire cas (mauvais pivot), pas stable, en place (pile O(log n) en moyenne).\n\nEn JavaScript, `Array.prototype.sort` est stable depuis ES2019 (V8 utilise TimSort).",
  },
  {
    id: 'f85',
    theme: 'algo',
    front: 'Pourquoi `[10, 9, 1].sort()` ne trie-t-il pas les nombres correctement ?',
    back: "Sans comparateur, `sort` compare les éléments **convertis en chaînes** : `'10' < '9'`. Il faut un comparateur qui renvoie un nombre : `(a, b) => a - b` pour l'ordre croissant, `b - a` pour le décroissant, `a.localeCompare(b)` pour des chaînes. Un comparateur qui renvoie un booléen (`a > b`) est un bug. Et `sort` modifie le tableau : `toSorted()` (ES2023) renvoie une copie.",
    code: `[10, 9, 1].sort(); // → [ 1, 10, 9 ]
[10, 9, 1].sort((a, b) => a - b) // → [ 1, 9, 10 ]`,
  },
  {
    id: 'f86',
    theme: 'algo',
    front: 'Qu’est-ce que le retour sur trace (*backtracking*) ?',
    back: "Une exploration récursive de toutes les solutions candidates : on **choisit** une option, on **explore** récursivement, puis on **annule** le choix pour essayer la suivante. On élague (*pruning*) les branches qui ne peuvent pas aboutir. Usages : permutations (O(n · n!)), sous-ensembles (O(n · 2ⁿ)), combinaisons, sudoku, N reines. Penser à copier la solution partielle quand on l'enregistre.",
  },
  {
    id: 'f87',
    theme: 'algo',
    front: 'Pourquoi `array.shift()` est-il un piège pour implémenter une file ?',
    back: "`shift` retire le premier élément et **décale tous les autres** : O(n) par appel, donc O(n²) pour vider une file de n éléments (un BFS sur un gros graphe devient lent). Solution : garder un **indice de tête** qu'on incrémente (et compacter de temps en temps), utiliser une liste chaînée, ou deux piles. On obtient un `dequeue` en O(1) (amorti).",
    code: `const queue = [1, 2, 3]
let head = 0
queue[head++] // → 1
queue[head++] // → 2
queue.length - head // → 1`,
  },
  {
    id: 'f88',
    theme: 'algo',
    front: 'BFS ou DFS : lequel choisir ?',
    back: "- **BFS** (largeur, avec une **file**) : visite niveau par niveau ; donne le **plus court chemin** en nombre d'arêtes dans un graphe non pondéré, et le parcours par niveaux d'un arbre.\n- **DFS** (profondeur, récursion ou **pile**) : descend jusqu'au bout avant de revenir ; adapté à l'exploration exhaustive, aux composantes connexes, à la détection de cycles, au tri topologique, au backtracking.\n\nLes deux sont en O(V + E) avec un ensemble de sommets visités.",
  },
  {
    id: 'f89',
    theme: 'algo',
    front: 'Qu’est-ce que la programmation dynamique ?',
    back: "Une technique pour les problèmes dont la solution se construit à partir de **sous-problèmes qui se recoupent** (*overlapping subproblems*) et dont l'optimum se compose d'optimums de sous-problèmes. Deux styles :\n- **descendant** (*top-down*) : récursion + mémoïsation ;\n- **ascendant** (*bottom-up*) : on remplit un tableau du plus petit sous-problème au plus grand (tabulation), sans récursion.\n\nExemples : escaliers, rendu de monnaie, plus longue sous-séquence commune.",
    code: `function climbStairs(n) {
  let prev = 1
  let curr = 1
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr]
  return curr
}
climbStairs(5) // → 8
climbStairs(45) // → 1836311903`,
  },
  {
    id: 'f90',
    theme: 'algo',
    front: 'Quelle mémoire consomme une fonction récursive ?',
    back: "Chaque appel en cours occupe un cadre sur la **pile d'appels** : la mémoire est O(profondeur maximale), par exemple O(h) pour un parcours d'arbre de hauteur h (O(log n) s'il est équilibré, O(n) s'il est dégénéré en liste). Au-delà d'environ 10 000 niveaux (selon le moteur), on obtient `RangeError: Maximum call stack size exceeded` : passer alors à une version itérative avec une pile explicite.",
  },
]

export const flashcards: Flashcard[] = [...jsFlashcards, ...tsFlashcards]
