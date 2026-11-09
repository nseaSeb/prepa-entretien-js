import type { CoursSection } from './types'
import { algo } from './coursAlgo'

/*
 * Cours : une section par thème (ordre de themes.ts).
 * Tous les extraits sont vérifiés par src/lib/snippets.test.ts.
 */

const types: CoursSection = {
  id: 'types',
  title: 'Types et coercition',
  summary: 'JavaScript a 7 types primitifs plus les objets, et convertit implicitement les valeurs selon des règles précises qu’il faut savoir expliquer.',
  blocks: [
    { h: 'Les types du langage' },
    {
      p: 'JavaScript possède **sept types primitifs** : `string`, `number`, `bigint`, `boolean`, `undefined`, `null` et `symbol`. Tout le reste (tableaux, fonctions, dates, objets littéraux…) est de type **objet**. Les primitifs sont immuables et comparés par valeur ; les objets sont comparés par référence.',
    },
    {
      title: 'typeof et ses bizarreries',
      code: `typeof 'abc' // → 'string'
typeof 42 // → 'number'
typeof 10n // → 'bigint'
typeof undefined // → 'undefined'
typeof Symbol() // → 'symbol'
typeof null // → 'object'
typeof [] // → 'object'
typeof function () {} // → 'function'
Array.isArray([]) // → true
typeof notDeclared // → 'undefined'`,
    },
    {
      p: '`typeof null === \'object\'` est un bug historique conservé pour la compatibilité : pour tester `null`, on écrit `value === null`. Pour un tableau, on utilise `Array.isArray`. Enfin, `typeof` est le seul opérateur qui ne lève pas d’erreur sur une variable non déclarée (hors TDZ).',
    },
    { h: '== contre ===' },
    {
      p: '`===` (égalité stricte) compare type **et** valeur, sans aucune conversion. `==` (égalité abstraite) convertit d’abord les opérandes selon l’algorithme *Abstract Equality* : `null` et `undefined` ne sont égaux qu’entre eux, un booléen est converti en nombre, une chaîne comparée à un nombre est convertie en nombre, et un objet est converti en primitif (`valueOf` puis `toString`). Ce que le recruteur attend : savoir dérouler ces étapes sur un exemple, et dire qu’en pratique on utilise toujours `===`, sauf l’idiome `x == null` qui teste à la fois `null` et `undefined`.',
    },
    {
      title: 'La coercition en action',
      code: `1 == '1'; // → true
0 == ''; // → true
0 == '0'; // → true
'' == '0'; // → false
null == undefined; // → true
null == 0; // → false
true == '1'; // → true
[] == false; // → true
[1, 2] == '1,2'; // → true
NaN == NaN; // → false`,
    },
    {
      table: [
        ['Opération', 'Règle', 'Exemple'],
        ['`+` avec une chaîne', 'concaténation : l’autre opérande devient chaîne', '`1 + \'2\'` → `\'12\'`'],
        ['`-`, `*`, `/`, `%`', 'conversion en nombre', '`\'6\' / \'2\'` → `3`'],
        ['`+x` (unaire)', 'conversion en nombre', '`+\'\'` → `0`, `+\'a\'` → `NaN`'],
        ['`if`, `!`, `&&`, `||`', 'conversion en booléen', '`!!\'0\'` → `true`'],
        ['objet → primitif', '`valueOf()` puis `toString()`', '`[] + []` → `\'\'`'],
      ],
    },
    {
      title: 'Coercition arithmétique',
      code: `1 + '2'; // → '12'
'3' - 1; // → 2
'3' * '4'; // → 12
true + 1; // → 2
[] + []; // → ''
[] + {}; // → '[object Object]'
+''; // → 0
+' 42 '; // → 42
+'4a'; // → NaN
Number(null); // → 0
Number(undefined); // → NaN`,
    },
    { h: 'Truthy et falsy' },
    {
      p: 'Il existe exactement **huit valeurs falsy** ; toutes les autres sont truthy, y compris `\'0\'`, `\'false\'`, `[]`, `{}` et `function () {}`.',
    },
    { list: ['`false`', '`0`, `-0` et `0n`', '`\'\'` (chaîne vide)', '`null`', '`undefined`', '`NaN`'] },
    {
      title: 'NaN et Object.is',
      code: `const n = 0 / 0
n === n // → false
Number.isNaN(n) // → true
isNaN('hello') // → true
Number.isNaN('hello') // → false
Object.is(NaN, NaN) // → true
Object.is(0, -0) // → false
0 === -0 // → true`,
    },
    {
      p: '`NaN` est la seule valeur différente d’elle-même. Préférez `Number.isNaN`, qui ne convertit pas son argument, à l’ancien `isNaN` global, qui convertit d’abord (d’où `isNaN(\'hello\') === true`).',
    },
    { h: 'Précision des nombres' },
    {
      title: 'Virgule flottante IEEE 754',
      code: `console.log(0.1 + 0.2)
console.log(0.1 + 0.2 === 0.3)
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON)
console.log(Number.MAX_SAFE_INTEGER)
console.log(2 ** 53 === 2 ** 53 + 1)
console.log(2n ** 53n + 1n)`,
      output: `0.30000000000000004
false
true
9007199254740991
true
9007199254740993n`,
    },
    {
      p: 'Tous les `number` sont des flottants 64 bits : `0.1` n’a pas de représentation binaire exacte. On compare avec une tolérance (`Number.EPSILON`), on calcule les montants en centimes entiers, et au-delà de `Number.MAX_SAFE_INTEGER` on passe à `BigInt`.',
    },
  ],
  mnemo: '« 3 égal, 0 surprise » : `===` ne convertit jamais. Et pour les falsy, pensez « 8 vides » : false, 0, -0, 0n, chaîne vide, null, undefined, NaN — tout le reste est truthy, même `[]` et `\'0\'`.',
  piege: '`[] == false` vaut `true` alors que `[]` est truthy (`if ([])` entre dans le bloc) : `==` convertit `false` en `0`, puis `[]` en `\'\'` puis en `0`. La conversion booléenne et l’égalité abstraite sont deux mécanismes différents ; c’est pourquoi on n’utilise jamais `==` avec un booléen.',
}

const scope: CoursSection = {
  id: 'scope',
  title: 'Portée, hoisting, TDZ',
  summary: 'var est portée par la fonction et initialisée à undefined, let/const sont portées par le bloc et inaccessibles avant leur déclaration (TDZ).',
  blocks: [
    { h: 'Trois façons de déclarer' },
    {
      table: [
        ['', '`var`', '`let`', '`const`'],
        ['Portée', 'fonction', 'bloc `{}`', 'bloc `{}`'],
        ['Hoisting', 'oui, initialisée à `undefined`', 'oui, mais en TDZ', 'oui, mais en TDZ'],
        ['Redéclaration', 'autorisée', '`SyntaxError`', '`SyntaxError`'],
        ['Réaffectation', 'oui', 'oui', 'non (`TypeError`)'],
        ['Propriété de `window` au niveau global', 'oui', 'non', 'non'],
      ],
    },
    {
      p: 'Le **hoisting** (remontée) est le fait que les déclarations sont enregistrées lors de la phase de création du contexte d’exécution, avant que la moindre ligne ne s’exécute. Seule la **déclaration** remonte, pas l’affectation. La différence entre `var` et `let`/`const` tient à l’initialisation : `var` vaut `undefined` dès le départ, alors que `let`/`const` restent non initialisées jusqu’à leur ligne de déclaration.',
    },
    {
      title: 'var remonte avec undefined',
      code: `console.log(a)
var a = 1
console.log(a)`,
      output: `undefined
1`,
    },
    { h: 'La Temporal Dead Zone' },
    {
      p: 'La **TDZ** est la période entre le début du bloc et la ligne de déclaration d’une variable `let`, `const` ou `class`. Y accéder lève une `ReferenceError`, même avec `typeof`. Elle existe pour rendre les erreurs d’ordre visibles au lieu de produire un `undefined` silencieux.',
    },
    {
      title: 'Accès en TDZ',
      code: `let x = 'global'
function f() {
  console.log(x)
  let x = 'local'
}
f()`,
      output: `Uncaught ReferenceError: Cannot access 'x' before initialization`,
    },
    {
      p: 'Ici, on pourrait croire que `x` vaut `\'global\'` : mais le `let x` local est remonté au début de `f` et masque la variable externe dès la première ligne de la fonction. Il est simplement inaccessible tant que sa déclaration n’a pas été exécutée.',
    },
    { h: 'Fonctions : déclaration contre expression' },
    {
      title: 'Hoisting des fonctions',
      code: `console.log(declared())
try {
  expressed()
} catch (e) {
  console.log(e.message)
}
function declared() {
  return 'ok'
}
var expressed = function () {
  return 'ko'
}`,
      output: `ok
expressed is not a function`,
    },
    {
      p: 'Une **déclaration** de fonction est remontée entièrement (nom et corps) : on peut l’appeler avant sa définition. Une **expression** de fonction affectée à une `var` ne remonte que comme variable `undefined` : l’appeler lève une `TypeError`. Avec `let`/`const`, ce serait une `ReferenceError` (TDZ).',
    },
    {
      title: 'Classes : TDZ et expression de classe',
      code: `try {
  new Animal()
} catch (e) {
  console.log(e.name + ': ' + e.message)
}
try {
  new Robot()
} catch (e) {
  console.log(e.name + ': ' + e.message)
}
class Animal {}
var Robot = class {}
console.log(typeof new Animal())`,
      output: `ReferenceError: Cannot access 'Animal' before initialization
TypeError: Robot is not a constructor
object`,
    },
    {
      p: 'Une déclaration `class` est remontée comme `let` : elle reste en TDZ jusqu’à sa ligne, donc l’utiliser avant lève une `ReferenceError`, contrairement à une déclaration de fonction remontée entièrement. Une expression de classe affectée à une `var` vaut `undefined` avant l’affectation : `new` lève alors une `TypeError` (« is not a constructor »).',
    },
    { h: 'Portée de bloc' },
    {
      title: 'var ignore les blocs',
      code: `if (true) {
  var v = 'var'
  let l = 'let'
}
console.log(v)
console.log(typeof l)
for (var i = 0; i < 3; i++) {}
console.log(i)`,
      output: `var
undefined
3`,
    },
    {
      p: 'La portée est **lexicale** : elle est déterminée par l’endroit où le code est écrit, pas par l’endroit d’où il est appelé. La recherche d’une variable remonte la chaîne des portées (bloc, fonction, module, global) jusqu’à la trouver ; sinon `ReferenceError` (ou, en mode non strict, une affectation crée une globale implicite).',
    },
    {
      title: 'const n’est pas immuable',
      code: `const user = { role: 'dev' }
user.role = 'lead'
console.log(user)
try {
  user = {}
} catch (e) {
  console.log(e.message)
}`,
      output: `{ role: 'lead' }
Assignment to constant variable.`,
    },
  ],
  mnemo: '« var voyage, let loge » : var traverse les blocs et remonte avec undefined, let/const restent dans leur bloc et dorment en TDZ jusqu’à leur ligne. Par défaut `const`, `let` si on réaffecte, jamais `var`.',
  piege: 'Croire que `let` et `const` ne sont pas hoistées. Elles le sont (sinon `let x` local ne masquerait pas un `x` externe dès le début de la fonction), mais elles ne sont pas initialisées : d’où la `ReferenceError` en TDZ plutôt qu’un `undefined`. Autre piège : `const` empêche la réaffectation de la variable, pas la mutation de l’objet référencé.',
}

const closures: CoursSection = {
  id: 'closures',
  title: 'Closures',
  summary: 'Une closure est une fonction qui garde l’accès aux variables de la portée où elle a été créée, même après la fin de l’exécution de cette portée.',
  blocks: [
    { h: 'Définition' },
    {
      p: 'Quand une fonction est créée, elle mémorise une référence vers son **environnement lexical** (les variables visibles à l’endroit où elle est écrite). Si elle est renvoyée ou passée ailleurs, elle continue d’accéder à ces variables : c’est une **closure** (fermeture). Ce que le recruteur attend : une définition précise (« fonction + environnement lexical capturé »), un exemple concret, et les usages : état privé, fabriques de fonctions, callbacks, mémoïsation, debounce.',
    },
    {
      title: 'Le compteur classique',
      code: `function createCounter() {
  let count = 0
  return function () {
    count++
    return count
  }
}
const c1 = createCounter()
const c2 = createCounter()
console.log(c1(), c1(), c1())
console.log(c2())`,
      output: `1 2 3
1`,
    },
    {
      p: 'Chaque appel à `createCounter` crée un **nouvel** environnement avec son propre `count`. `c1` et `c2` ne partagent rien. La variable n’est pas copiée : la closure capture la variable elle-même (par référence), donc elle voit toujours sa valeur actuelle.',
    },
    { h: 'État privé (module pattern)' },
    {
      title: 'Encapsulation sans classe',
      code: `function createAccount(initial) {
  let balance = initial
  return {
    deposit(amount) {
      balance += amount
      return balance
    },
    getBalance() {
      return balance
    },
  }
}
const account = createAccount(100)
account.deposit(50)
console.log(account.getBalance())
console.log(account.balance)`,
      output: `150
undefined`,
    },
    {
      p: '`balance` n’est accessible qu’à travers les méthodes renvoyées : c’est l’équivalent d’un champ privé. Avant les champs `#private` des classes, c’était la façon standard d’encapsuler un état en JavaScript.',
    },
    { h: 'Le piège de la boucle' },
    {
      title: 'var dans une boucle avec setTimeout',
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var', i))
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let', j))
}`,
      output: `var 3
var 3
var 3
let 0
let 1
let 2`,
    },
    {
      p: 'Avec `var`, il n’existe qu’**une seule** variable `i` pour toute la boucle ; les trois callbacks s’exécutent après la fin de la boucle et lisent tous `i === 3`. Avec `let`, la spécification crée une **nouvelle liaison à chaque itération**, donc chaque callback capture sa propre valeur. Avant ES6, on corrigeait avec une IIFE : `(function (k) { setTimeout(() => console.log(k)) })(i)`.',
    },
    { h: 'Fabriques de fonctions' },
    {
      title: 'Application partielle',
      code: `const multiplier = (factor) => (x) => x * factor
const double = multiplier(2)
const triple = multiplier(3)
double(5) // → 10
triple(5); // → 15
[1, 2, 3].map(double) // → [ 2, 4, 6 ]`,
    },
    { h: 'Closures et mémoire' },
    {
      p: 'Tant qu’une closure est atteignable, les variables qu’elle capture ne peuvent pas être libérées par le ramasse-miettes. Cela devient une **fuite mémoire** quand une closure stockée durablement (écouteur d’événement jamais retiré, `setInterval` jamais arrêté, cache global) retient un gros objet. Les moteurs modernes ne conservent en général que les variables réellement utilisées, mais il faut penser à `removeEventListener`, `clearInterval` et à mettre les références inutiles à `null`.',
    },
    {
      list: [
        'Une closure capture des **variables**, pas des valeurs figées.',
        'Chaque appel de la fonction externe crée un environnement neuf.',
        'Usages : état privé, fabriques, callbacks, `once`, `memoize`, `debounce`.',
        'Coût : la mémoire capturée vit aussi longtemps que la closure.',
      ],
    },
  ],
  mnemo: '« La fonction part avec son sac à dos » : elle emporte les variables de l’endroit où elle est née, pas de l’endroit où elle est appelée.',
  piege: 'La boucle `for (var i…)` avec `setTimeout` qui affiche trois fois `3` : toutes les callbacks partagent la même variable `i`, lue au moment de l’exécution (après la boucle). Solution : `let`, qui crée une liaison par itération, ou une IIFE qui fige la valeur en paramètre.',
}

const thisSection: CoursSection = {
  id: 'this',
  title: 'this',
  summary: 'La valeur de this dépend de la façon dont une fonction est appelée (sauf pour les fonctions fléchées, qui l’héritent lexicalement).',
  blocks: [
    { h: 'Les quatre règles de liaison' },
    {
      p: '`this` n’est pas déterminé là où la fonction est écrite, mais **au moment de l’appel**. Ce que le recruteur attend : connaître les quatre règles, leur ordre de priorité, et le cas particulier des fonctions fléchées.',
    },
    {
      table: [
        ['Règle', 'Forme de l’appel', 'Valeur de `this`'],
        ['1. `new`', '`new Fn()`', 'le nouvel objet créé'],
        ['2. Explicite', '`fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)()`', '`obj`'],
        ['3. Implicite', '`obj.fn()`', 'l’objet avant le point'],
        ['4. Par défaut', '`fn()`', '`undefined` en mode strict, `globalThis` sinon'],
        ['Fléchée', 'n’importe laquelle', 'le `this` de la portée englobante (lexical)'],
      ],
    },
    {
      title: 'Liaison implicite et par défaut',
      code: `var label = 'global'
const obj = {
  label: 'obj',
  show() {
    return this.label
  },
}
obj.show() // → 'obj'
const detached = obj.show
detached() // → 'global'`,
    },
    {
      p: 'En sortant la méthode de l’objet (`const detached = obj.show`), on perd le contexte : l’appel `detached()` n’a plus d’objet avant le point, c’est la règle par défaut qui s’applique. En script non strict, `this` vaut l’objet global, et `var label` y a créé une propriété : on obtient `\'global\'`. En mode strict (modules, classes), `this` serait `undefined` et l’accès lèverait une `TypeError`.',
    },
    { h: 'Liaison explicite : call, apply, bind' },
    {
      title: 'call, apply et bind',
      code: `function greet(greeting, punct) {
  return greeting + ' ' + this.user + punct
}
const ctx = { user: 'Ada' }
greet.call(ctx, 'Bonjour', '!') // → 'Bonjour Ada!'
greet.apply(ctx, ['Salut', '?']) // → 'Salut Ada?'
const bound = greet.bind(ctx, 'Hello')
bound('.') // → 'Hello Ada.'
bound.call({ user: 'Bob' }, '.') // → 'Hello Ada.'`,
    },
    {
      p: '`call` et `apply` appellent immédiatement la fonction (arguments séparés pour **c**all, tableau pour **a**pply). `bind` renvoie une **nouvelle fonction** dont `this` est figé définitivement : un `call` ultérieur ne peut plus le changer. Seul `new` peut passer outre un `bind`.',
    },
    { h: 'new et priorité' },
    {
      title: 'new l’emporte sur bind',
      code: `function Person(first) {
  this.first = first
}
const BoundPerson = Person.bind({ first: 'ignored' })
const p = new BoundPerson('Grace')
console.log(p.first)
console.log(p instanceof Person)`,
      output: `Grace
true`,
    },
    {
      p: 'L’ordre de priorité est donc : **new > explicite (bind/call/apply) > implicite (obj.fn()) > défaut**. `new` crée un objet vide lié au `prototype` du constructeur, l’utilise comme `this`, exécute le corps et renvoie cet objet (sauf si le constructeur renvoie explicitement un autre objet).',
    },
    { h: 'Fonctions fléchées : this lexical' },
    {
      title: 'Fléchée contre fonction classique dans un callback',
      code: `const timer = {
  seconds: 0,
  startClassic() {
    setTimeout(function () {
      console.log('classic', this === globalThis)
    })
  },
  startArrow() {
    setTimeout(() => {
      this.seconds++
      console.log('arrow', this.seconds)
    })
  },
}
timer.startClassic()
timer.startArrow()`,
      output: `classic true
arrow 1`,
    },
    {
      p: 'Une fonction fléchée n’a **pas de `this` propre** (ni `arguments`, ni `prototype`) : elle utilise celui de la portée où elle est écrite, et `call`/`bind` n’y changent rien. C’est idéal pour les callbacks à l’intérieur d’une méthode, mais c’est un piège si on l’utilise **comme méthode** d’un objet littéral : `this` serait alors celui de l’extérieur (le global), pas l’objet.',
    },
    { h: 'Classes et this perdu' },
    {
      title: 'Méthode de classe passée en callback',
      code: `class Counter {
  count = 0
  increment() {
    this.count++
    return this.count
  }
  incrementArrow = () => {
    this.count++
    return this.count
  }
}
const counter = new Counter()
const { increment, incrementArrow } = counter
try {
  increment()
} catch (e) {
  console.log(e.message)
}
console.log(incrementArrow())
console.log(increment.bind(counter)())`,
      output: `Cannot read properties of undefined (reading 'count')
1
2`,
    },
    {
      p: 'Le corps d’une classe est toujours en **mode strict** : une méthode détachée est appelée avec `this === undefined`, d’où la `TypeError`. Trois corrections : `bind` dans le constructeur, un champ de classe fléché (une copie par instance), ou une fléchée au point d’appel (`onClick={() => counter.increment()}`). C’est exactement le problème des handlers dans les anciens composants React en classe.',
    },
  ],
  mnemo: '« Qui appelle ? » : regardez à gauche du point au moment de l’appel. Priorité « N.E.I.D. » : New, Explicite, Implicite, Défaut. Et la fléchée « n’a pas de this, elle emprunte celui de ses parents ».',
  piege: 'Passer une méthode en callback (`setTimeout(obj.method)`, `button.addEventListener(\'click\', this.handle)`, `const { fn } = obj`) détache la fonction de son objet : `this` devient `undefined` (strict) ou le global. Inversement, définir une méthode d’objet littéral avec une fonction fléchée lui fait perdre l’accès à l’objet.',
}

const prototypes: CoursSection = {
  id: 'prototypes',
  title: 'Prototypes et classes',
  summary: 'Chaque objet a un prototype vers lequel la recherche de propriétés est déléguée ; la syntaxe class n’est qu’une écriture plus claire de ce mécanisme.',
  blocks: [
    { h: 'La chaîne de prototypes' },
    {
      p: 'Chaque objet possède un lien interne `[[Prototype]]` vers un autre objet (ou `null`). Quand on lit une propriété absente de l’objet, le moteur la cherche dans son prototype, puis dans le prototype du prototype, et ainsi de suite jusqu’à `null` : c’est la **chaîne de prototypes**. L’écriture, elle, crée toujours la propriété sur l’objet lui-même (on parle de *shadowing*).',
    },
    {
      title: 'Délégation avec Object.create',
      code: `const animal = {
  speak() {
    return this.sound
  },
}
const dog = Object.create(animal)
dog.sound = 'wouf'
dog.speak() // → 'wouf'
Object.getPrototypeOf(dog) === animal // → true
dog.hasOwnProperty('speak') // → false
'speak' in dog // → true
Object.keys(dog) // → [ 'sound' ]`,
    },
    { h: '__proto__ contre prototype' },
    {
      table: [
        ['Propriété', 'Présente sur', 'Rôle'],
        ['`obj.__proto__`', 'tout objet (accesseur hérité, déprécié)', 'le prototype de **cet** objet ; préférer `Object.getPrototypeOf`'],
        ['`Fn.prototype`', 'les fonctions constructeurs et classes', 'l’objet qui deviendra le `[[Prototype]]` des instances créées par `new Fn()`'],
      ],
    },
    {
      title: 'Constructeur et prototype',
      code: `function User(first) {
  this.first = first
}
User.prototype.hello = function () {
  return 'Hi ' + this.first
}
const u = new User('Linus')
u.hello() // → 'Hi Linus'
Object.getPrototypeOf(u) === User.prototype // → true
User.prototype.constructor === User // → true
Object.getPrototypeOf(User.prototype) === Object.prototype // → true
Object.getPrototypeOf(Object.prototype) // → null`,
    },
    {
      p: 'Les méthodes sont placées sur `User.prototype` pour être **partagées** par toutes les instances au lieu d’être recréées à chaque `new`. La chaîne de `u` est : `u` → `User.prototype` → `Object.prototype` → `null`.',
    },
    { h: 'class : du sucre syntaxique' },
    {
      title: 'Classes, héritage, champs privés et statiques',
      code: `class Shape {
  static count = 0
  #id
  constructor(label) {
    this.label = label
    this.#id = ++Shape.count
  }
  describe() {
    return this.label + ' #' + this.#id
  }
  static create(label) {
    return new this(label)
  }
}
class Circle extends Shape {
  constructor(r) {
    super('cercle')
    this.r = r
  }
  describe() {
    return super.describe() + ' r=' + this.r
  }
}
const c = new Circle(2)
console.log(c.describe())
console.log(Shape.create('carré').describe())
console.log(typeof Shape, Shape.count)
console.log(Object.getPrototypeOf(Circle.prototype) === Shape.prototype)
console.log(c)`,
      output: `cercle #1 r=2
carré #2
function 2
true
Circle { label: 'cercle', r: 2 }`,
    },
    {
      list: [
        '`class` crée une fonction constructeur : `typeof Shape === \'function\'`, les méthodes vont sur `Shape.prototype`.',
        'Différences réelles avec une fonction : appel sans `new` interdit (`TypeError`), corps en mode strict, méthodes non énumérables, déclaration en TDZ (pas de hoisting utilisable).',
        '`extends` relie `Circle.prototype` à `Shape.prototype` (et `Circle` à `Shape` pour les statiques).',
        'Dans une classe dérivée, `super()` doit être appelé **avant** tout accès à `this`.',
        '`#champ` est réellement privé (vérifié par le moteur, invisible hors de la classe), contrairement à la convention `_champ`.',
        '`static` place le membre sur la classe elle-même, pas sur les instances.',
      ],
    },
    {
      title: 'super() oublié',
      code: `class Base {}
class Child extends Base {
  constructor() {
    this.x = 1
  }
}
new Child()`,
      output: `Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`,
    },
  ],
  mnemo: '« prototype est le moule, __proto__ est le lien » : `Fn.prototype` sert de modèle aux futures instances, `obj.__proto__` (ou `Object.getPrototypeOf(obj)`) pointe vers le modèle dont l’objet hérite.',
  piege: 'Confondre `prototype` et `__proto__`, ou affirmer que JavaScript a des classes « comme Java ». Une classe JS reste une fonction constructeur et l’héritage passe par délégation dynamique : modifier `Shape.prototype` après coup affecte immédiatement toutes les instances existantes.',
}

const eventloop: CoursSection = {
  id: 'eventloop',
  title: 'Event loop',
  summary: 'JavaScript exécute un seul fil : l’event loop vide la pile d’appels, puis toutes les microtâches, puis éventuellement un rendu, avant de prendre la tâche suivante.',
  blocks: [
    { h: 'Les acteurs' },
    {
      list: [
        '**Call stack** (pile d’appels) : le code synchrone en cours ; une seule chose s’exécute à la fois.',
        '**Web APIs** (ou API de Node) : minuteurs, réseau, événements DOM… gérés hors du fil JS ; à la fin, ils déposent un callback dans une file.',
        '**Task queue** (macrotâches) : callbacks de `setTimeout`, `setInterval`, événements, messages, I/O.',
        '**Microtask queue** : réactions de promesses (`then`, `catch`, `finally`, suite d’un `await`), `queueMicrotask`, `MutationObserver`.',
        '**Rendu** : le navigateur peut recalculer styles, layout et peindre entre deux tâches (environ 60 fois par seconde), juste après les callbacks `requestAnimationFrame`.',
      ],
    },
    { h: 'L’algorithme d’un tour de boucle' },
    {
      p: '1) Exécuter **une** macrotâche (le script initial en est une) jusqu’à ce que la pile soit vide. 2) Vider **toute** la file des microtâches, y compris celles ajoutées pendant ce vidage. 3) Si c’est le moment, effectuer un rendu (rAF, style, layout, paint). 4) Recommencer avec la macrotâche suivante. Ce que le recruteur attend : savoir prédire l’ordre d’un mélange de `console.log`, `setTimeout` et `Promise`, et justifier chaque ligne.',
    },
    {
      title: 'Le puzzle classique',
      code: `console.log('1 sync')
setTimeout(() => console.log('5 timeout'), 0)
Promise.resolve().then(() => console.log('3 micro'))
queueMicrotask(() => console.log('4 micro'))
console.log('2 sync')`,
      output: `1 sync
2 sync
3 micro
4 micro
5 timeout`,
    },
    {
      p: '`setTimeout(fn, 0)` ne signifie pas « tout de suite » mais « dans une prochaine macrotâche, au plus tôt ». Les microtâches passent toujours avant, dès que la pile est vide.',
    },
    { h: 'async/await dans l’ordre' },
    {
      title: 'Ce qui suit await est une microtâche',
      code: `async function run() {
  console.log('B run start')
  await null
  console.log('E after await')
}
console.log('A start')
setTimeout(() => console.log('G timeout'))
run()
Promise.resolve().then(() => console.log('F then'))
console.log('C end')
console.log('D still sync')`,
      output: `A start
B run start
C end
D still sync
E after await
F then
G timeout`,
    },
    {
      p: 'Le début d’une fonction `async` s’exécute **de façon synchrone** jusqu’au premier `await`. La suite est planifiée comme une microtâche : elle a été mise en file avant le `then` écrit plus bas, donc elle passe en premier.',
    },
    { h: 'Microtâches imbriquées' },
    {
      title: 'Une microtâche peut en planifier d’autres',
      code: `setTimeout(() => console.log('timeout'))
Promise.resolve()
  .then(() => {
    console.log('then 1')
    queueMicrotask(() => console.log('nested micro'))
  })
  .then(() => console.log('then 2'))
console.log('sync')`,
      output: `sync
then 1
nested micro
then 2
timeout`,
    },
    {
      p: 'La file des microtâches est vidée **entièrement**, même si elle se remplit pendant qu’on la vide. Le `setTimeout`, programmé en premier, attend donc la fin de toute cette cascade.',
    },
    { h: 'Famine (starvation) et blocage' },
    {
      p: 'Comme les microtâches sont toutes exécutées avant le prochain rendu, une boucle infinie de microtâches (une promesse qui se re-planifie sans fin) **gèle la page** exactement comme un `while (true)` : aucun clic, aucun rendu, aucun minuteur. À l’inverse, une boucle de `setTimeout` laisse respirer le navigateur entre chaque tâche. De même, un long calcul synchrone bloque tout : on le découpe en morceaux (`setTimeout`, `scheduler.yield`) ou on le déplace dans un Web Worker.',
    },
    {
      title: 'Un timer ne garantit qu’un délai minimum',
      code: `const start = Date.now()
setTimeout(() => {
  const waited = Date.now() - start
  console.log(waited >= 100)
}, 10)
while (Date.now() - start < 100) {}
console.log('loop done')`,
      output: `loop done
true`,
    },
    {
      table: [
        ['Source', 'File', 'Exemples'],
        ['Code synchrone', 'pile d’appels', 'script, corps des fonctions, début d’une `async`'],
        ['Microtâches', 'microtask queue', '`then`/`catch`/`finally`, après `await`, `queueMicrotask`'],
        ['Rendu', 'étape de rendu', '`requestAnimationFrame`, style, layout, paint'],
        ['Macrotâches', 'task queue', '`setTimeout`, `setInterval`, événements, `MessageChannel`'],
      ],
    },
  ],
  mnemo: '« Synchrone, micro, (rendu), macro » : on vide la pile, puis TOUTES les promesses, puis le navigateur peut peindre, puis UN seul timer, et on recommence.',
  piege: 'Penser que `setTimeout(fn, 0)` s’exécute avant un `.then()` parce qu’il est écrit plus haut, ou que le délai d’un timer est garanti. Les microtâches passent toujours avant la macrotâche suivante, et le délai n’est qu’un minimum : si la pile est occupée, le callback attend.',
}

const asyncSection: CoursSection = {
  id: 'async',
  title: 'Promesses et async/await',
  summary: 'Une promesse représente une valeur future ; async/await permet d’écrire du code asynchrone séquentiel, avec try/catch pour les erreurs.',
  blocks: [
    { h: 'États d’une promesse' },
    {
      p: 'Une promesse est d’abord **pending** (en attente), puis devient définitivement **fulfilled** (tenue, avec une valeur) ou **rejected** (rompue, avec une raison). On dit qu’elle est **settled** une fois tenue ou rompue ; elle ne change plus jamais d’état. Les callbacks passés à `then` s’exécutent toujours de façon asynchrone (microtâche), même si la promesse est déjà résolue.',
    },
    {
      title: 'Créer et consommer une promesse',
      code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms))
const p = new Promise((resolve, reject) => {
  resolve('first')
  resolve('ignored')
  reject(new Error('ignored too'))
})
p.then((v) => console.log(v))
wait(10, 'later').then((v) => console.log(v))
console.log('sync')`,
      output: `sync
first
later`,
    },
    { h: 'Chaînage et propagation des erreurs' },
    {
      p: '`then` renvoie toujours une **nouvelle** promesse, résolue avec la valeur retournée par le callback (ou adoptant la promesse retournée). Une exception levée dans un callback rejette la promesse suivante, et le rejet saute les `then` jusqu’au prochain `catch`. `finally` ne reçoit aucun argument et laisse passer la valeur ou l’erreur.',
    },
    {
      title: 'then, catch, finally',
      code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => {
    throw new Error('boom at ' + x)
  })
  .then(() => console.log('skipped'))
  .catch((e) => {
    console.log('caught:', e.message)
    return 'recovered'
  })
  .finally(() => console.log('finally'))
  .then((v) => console.log(v))`,
      output: `caught: boom at 2
finally
recovered`,
    },
    {
      p: 'Erreur fréquente : oublier le `return` dans un `then`. La promesse suivante est alors résolue avec `undefined` sans attendre l’opération asynchrone lancée à l’intérieur.',
    },
    { h: 'Les combinateurs' },
    {
      table: [
        ['Méthode', 'Résout quand', 'Rejette quand', 'Usage'],
        ['`Promise.all`', 'toutes sont tenues (tableau ordonné)', 'la première rompue', 'requêtes parallèles toutes nécessaires'],
        ['`Promise.allSettled`', 'toutes sont réglées (jamais de rejet)', 'jamais', 'rapport complet succès/échecs'],
        ['`Promise.race`', 'la première réglée est tenue', 'la première réglée est rompue', 'timeout'],
        ['`Promise.any`', 'la première tenue', 'toutes rompues (`AggregateError`)', 'miroirs, premier serveur qui répond'],
      ],
    },
    {
      title: 'Combinateurs en pratique',
      code: `const ok = (v, ms) => new Promise((res) => setTimeout(() => res(v), ms))
const ko = (msg, ms) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))
async function demo() {
  console.log(await Promise.all([ok('a', 20), ok('b', 10)]))
  try {
    await Promise.all([ok('a', 20), ko('fail', 10)])
  } catch (e) {
    console.log('all:', e.message)
  }
  const settled = await Promise.allSettled([ok('a', 10), ko('fail', 5)])
  console.log(settled.map((r) => r.status))
  console.log(await Promise.race([ok('slow', 30), ok('fast', 5)]))
  console.log(await Promise.any([ko('x', 5), ok('first ok', 20)]))
  try {
    await Promise.any([ko('x', 5), ko('y', 10)])
  } catch (e) {
    console.log(e.constructor.name, e.errors.length)
  }
}
demo()`,
      output: `[ 'a', 'b' ]
all: fail
[ 'fulfilled', 'rejected' ]
fast
first ok
AggregateError 2`,
    },
    { h: 'async/await et try/catch' },
    {
      p: 'Une fonction `async` renvoie **toujours** une promesse : sa valeur de retour la résout, une exception la rejette. `await` suspend la fonction (sans bloquer le fil) jusqu’au règlement de la promesse, renvoie sa valeur ou lève son erreur, ce qui permet d’utiliser un `try/catch` ordinaire.',
    },
    {
      title: 'Séquentiel contre parallèle',
      code: `const task = (label, ms) => {
  console.log('start', label)
  return new Promise((res) => setTimeout(() => {
    console.log('end', label)
    res(label)
  }, ms))
}
async function sequential() {
  await task('a', 20)
  await task('b', 10)
}
async function parallel() {
  const results = await Promise.all([task('c', 20), task('d', 10)])
  console.log(results)
}
sequential().then(() => console.log('---')).then(parallel)`,
      output: `start a
end a
start b
end b
---
start c
start d
end d
end c
[ 'c', 'd' ]`,
    },
    {
      p: 'En séquentiel, `b` ne démarre qu’après la fin de `a` : deux `await` successifs sur des opérations indépendantes additionnent leurs durées. En parallèle, `c` et `d` démarrent ensemble et `Promise.all` renvoie les résultats dans l’ordre du tableau, pas dans l’ordre d’arrivée. Si elles ne dépendent pas l’une de l’autre, on les lance d’abord, puis on attend avec `Promise.all`. Attention : `forEach` n’attend pas les callbacks `async` ; utiliser `for…of` (séquentiel) ou `Promise.all(arr.map(…))` (parallèle).',
    },
    {
      title: 'Rejet non géré',
      code: `async function load() {
  throw new Error('network down')
}
load()
console.log('continues')`,
      output: `continues
Uncaught (in promise) Error: network down`,
    },
    {
      p: 'Une promesse rompue sans `catch` provoque un **unhandled rejection** : avertissement dans la console du navigateur (événement `unhandledrejection`), et arrêt du processus par défaut dans Node récent. Toute chaîne de promesses doit se terminer par un `catch`, ou être attendue dans un `try/catch`.',
    },
  ],
  mnemo: '« All : tous ou rien ; AllSettled : tout le monde ; Race : le premier qui finit ; Any : le premier qui réussit ». Et pour les `await` : « indépendants ? on lance tout, puis on attend ensemble ».',
  piege: 'Enchaîner des `await` sur des opérations indépendantes (lenteur inutile), ou utiliser `forEach` avec un callback `async` en croyant qu’il attend. Autre classique : un `try/catch` autour d’une promesse **non attendue** (`try { fetchData() } catch {}`) n’attrape rien, il faut `await fetchData()`.',
}

const es6: CoursSection = {
  id: 'es6',
  title: 'ES6+',
  summary: 'Les apports d’ES2015 et suivantes (déstructuration, spread/rest, opérateurs ?. ?? ??=, Map/Set, itérateurs) rendent le code plus concis et plus sûr.',
  blocks: [
    { h: 'Déstructuration' },
    {
      title: 'Déstructuration, valeurs par défaut, spread et rest',
      code: `const user = { id: 1, profile: { city: 'Lyon' }, tags: ['a', 'b'] }
const { id, role = 'guest', profile: { city }, tags: [firstTag] } = user
console.log(id, role, city, firstTag)
const { missing = 'default', id: renamed } = user
console.log(missing, renamed)
const { x = 'def' } = { x: null }
console.log(x)
let a = 1
let b = 2
;[a, b] = [b, a]
console.log(a, b)
const sum = (...nums) => nums.reduce((acc, n) => acc + n, 0)
const { password, ...safeUser } = { login: 'ada', password: 'secret' }
console.log(sum(1, 2, 3), Math.max(...[4, 9, 2]), safeUser)
console.log({ ...{ a: 1, b: 2 }, ...{ b: 3 } }, [...'hi', ...[1, 2]])`,
      output: `1 guest Lyon a
default 1
null
2 1
6 9 { login: 'ada' }
{ a: 1, b: 3 } [ 'h', 'i', 1, 2 ]`,
    },
    {
      p: 'Une valeur par défaut ne s’applique que si la valeur est **`undefined`**, pas `null`. On peut renommer (`id: renamed`), imbriquer et déstructurer directement dans les paramètres : `function draw({ x = 0, y = 0 } = {}) {}`.',
    },
    {
      p: '**Spread** (`...` à droite, dans un appel ou un littéral) étale les éléments ; **rest** (`...` à gauche, dans des paramètres ou une déstructuration) les regroupe. Pour un objet, en cas de clé en double, la dernière gagne.',
    },
    { h: 'Opérateurs modernes' },
    {
      title: '?. ?? et affectations logiques',
      code: `const config = { server: { port: 0 }, retries: null }
config.server?.port // → 0
config.db?.host // → undefined
config.getUrl?.() // → undefined
config.server.port || 3000 // → 3000
config.server.port ?? 3000 // → 0
config.retries ??= 3
config.retries // → 3
let title = ''
title ||= 'Sans titre'
title // → 'Sans titre'
let count = 5
count &&= count * 2
count // → 10`,
    },
    {
      table: [
        ['Opérateur', 'Remplace quand la gauche est…'],
        ['`a || b`', 'falsy (`0`, `\'\'`, `false`, `null`, `undefined`, `NaN`)'],
        ['`a ?? b`', '`null` ou `undefined` uniquement (nullish)'],
        ['`a ||= b`', 'falsy → affecte `b`'],
        ['`a ??= b`', 'nullish → affecte `b`'],
        ['`a &&= b`', 'truthy → affecte `b`'],
        ['`a?.b`', 'court-circuite à `undefined` si `a` est nullish'],
      ],
    },
    { h: 'Littéraux et objets' },
    {
      title: 'Template literals, raccourcis, clés calculées',
      code: `const lang = 'js'
const level = 3
const key = 'score_' + lang
const obj = { lang, level, [key]: 42, describe() { return \`\${this.lang} niveau \${this.level}\` } }
console.log(obj.describe())
console.log(obj)
console.log(\`ligne 1
ligne 2\`.split('\\n').length)`,
      output: `js niveau 3
{ lang: 'js', level: 3, score_js: 42, describe: [Function: describe] }
2`,
    },
    { h: 'Symbol, itérateurs et générateurs' },
    {
      p: 'Un `Symbol` est une valeur primitive **unique**, utilisée comme clé de propriété sans risque de collision (et ignorée par `Object.keys` et `JSON.stringify`). Des symboles bien connus permettent de personnaliser le langage, notamment `Symbol.iterator`, qui rend un objet utilisable dans `for…of` et avec le spread. Une fonction **génératrice** (`function*`) produit un itérateur dont l’exécution se met en pause à chaque `yield`.',
    },
    {
      title: 'Générateur et protocole d’itération',
      code: `function* range(start, end) {
  for (let i = start; i < end; i++) yield i
}
const it = range(0, 2)
it.next() // → { value: 0, done: false }
it.next() // → { value: 1, done: false }
it.next() // → { value: undefined, done: true }
const team = { members: ['Ada', 'Linus'], *[Symbol.iterator]() { yield* this.members } };
[...team] // → [ 'Ada', 'Linus' ]
Symbol('id') === Symbol('id') // → false`,
    },
    { h: 'Map et Set' },
    {
      title: 'Collections modernes',
      code: `const visits = new Map()
const page = { url: '/home' }
visits.set(page, 1).set('total', 10)
console.log(visits.get(page), visits.size)
const unique = [...new Set([3, 1, 3, 2, 1])]
console.log(unique)
const s = new Set(['a'])
s.add('a').add('b')
console.log(s.has('b'), s)`,
      output: `1 2
[ 3, 1, 2 ]
true Set(2) { 'a', 'b' }`,
    },
    {
      p: '`Map` accepte **n’importe quel type de clé** (y compris des objets), conserve l’ordre d’insertion et expose `size` ; c’est préférable à un objet comme dictionnaire dynamique. `Set` stocke des valeurs uniques (comparées avec SameValueZero, donc `NaN` est égal à lui-même). `WeakMap`/`WeakSet` n’acceptent que des objets comme clés, sans empêcher leur ramasse-miettes.',
    },
  ],
  mnemo: '« ?? ne s’occupe que du vide (null/undefined), || s’occupe de tout ce qui est faux ». Et « les trois points étalent à droite, ramassent à gauche ».',
  piege: 'Utiliser `||` pour une valeur par défaut alors que `0`, `\'\'` ou `false` sont des valeurs légitimes : `port || 3000` remplace un port `0` valide. Il faut `??`. De même, une valeur par défaut de déstructuration ne s’applique pas à `null`.',
}

const arrays: CoursSection = {
  id: 'arrays',
  title: 'Tableaux et immutabilité',
  summary: 'Savoir quelles méthodes de tableau mutent l’original et lesquelles renvoient une copie est indispensable, notamment avec React où l’état doit rester immuable.',
  blocks: [
    { h: 'Les méthodes d’itération' },
    {
      title: 'map, filter, reduce, find, some, every, flatMap',
      code: `const products = [
  { label: 'clavier', price: 50, stock: 3 },
  { label: 'souris', price: 20, stock: 0 },
  { label: 'écran', price: 200, stock: 1 },
]
products.map((p) => p.label) // → [ 'clavier', 'souris', 'écran' ]
products.filter((p) => p.stock > 0).length // → 2
products.reduce((total, p) => total + p.price * p.stock, 0) // → 350
products.find((p) => p.price > 100).label // → 'écran'
products.findIndex((p) => p.stock === 0) // → 1
products.some((p) => p.stock === 0) // → true
products.every((p) => p.price > 10); // → true
[[1, 2], [3]].flat(); // → [ 1, 2, 3 ]
['a b', 'c'].flatMap((s) => s.split(' ')) // → [ 'a', 'b', 'c' ]`,
    },
    {
      list: [
        '`map` : transforme chaque élément, même longueur.',
        '`filter` : garde les éléments dont le prédicat est truthy.',
        '`reduce(fn, initial)` : accumule en une seule valeur ; toujours fournir la valeur initiale (sinon `TypeError` sur un tableau vide).',
        '`find` / `findIndex` / `findLast` : premier (ou dernier) élément trouvé, `undefined` / `-1` sinon.',
        '`some` / `every` : s’arrêtent dès que la réponse est connue ; sur un tableau vide, `some` vaut `false` et `every` vaut `true`.',
        '`flatMap` : `map` puis `flat` d’un niveau, pratique pour produire 0, 1 ou plusieurs éléments par entrée.',
      ],
    },
    { h: 'Mutation ou copie ?' },
    {
      table: [
        ['Mutent le tableau', 'Équivalent non mutant'],
        ['`push`, `pop`, `shift`, `unshift`', '`[...arr, x]`, `arr.slice(0, -1)`, `arr.slice(1)`, `[x, ...arr]`'],
        ['`splice`', '`toSpliced` (ES2023) ou `slice` + spread'],
        ['`sort`', '`toSorted` (ES2023) ou `[...arr].sort()`'],
        ['`reverse`', '`toReversed` (ES2023)'],
        ['`arr[i] = x`', '`arr.with(i, x)` (ES2023) ou `map`'],
        ['`fill`, `copyWithin`', '`Array.from({ length }, fn)`'],
      ],
    },
    {
      p: 'Ne mutent **pas** : `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, `flatMap`, `find`, `includes`, `indexOf`, `join`, `toSorted`, `toReversed`, `toSpliced`, `with`. Ce que le recruteur attend : savoir que `sort` et `reverse` mutent **et** renvoient le même tableau, ce qui piège souvent dans un rendu React.',
    },
    {
      title: 'Les nouvelles méthodes non mutantes',
      code: `const original = [3, 1, 2]
const sorted = original.toSorted()
const reversed = original.toReversed()
const replaced = original.with(0, 99)
const removed = original.toSpliced(1, 1)
console.log(original, sorted, reversed, replaced, removed)
const same = original.sort()
console.log(same === original, original)`,
      output: `[ 3, 1, 2 ] [ 1, 2, 3 ] [ 2, 1, 3 ] [ 99, 1, 2 ] [ 3, 2 ]
true [ 1, 2, 3 ]`,
    },
    { h: 'Le comparateur de sort' },
    {
      title: 'sort trie des chaînes par défaut',
      code: `const nums = [10, 9, 1, 100]
const words = ['é', 'z', 'a']
nums.slice().sort() // → [ 1, 10, 100, 9 ]
nums.slice().sort((a, b) => a - b) // → [ 1, 9, 10, 100 ]
nums.slice().sort((a, b) => b - a) // → [ 100, 10, 9, 1 ]
words.slice().sort() // → [ 'a', 'z', 'é' ]
words.slice().sort((a, b) => a.localeCompare(b)) // → [ 'a', 'é', 'z' ]`,
    },
    {
      p: 'Sans comparateur, `sort` convertit les éléments en chaînes et les compare par unités UTF-16 : `10` passe avant `9`. Le comparateur renvoie un nombre **négatif** si `a` doit précéder `b`, **positif** si `b` doit précéder `a`, `0` sinon. Pour du texte, `localeCompare` respecte les accents. Depuis ES2019, `sort` est **stable** (les éléments égaux gardent leur ordre).',
    },
    { h: 'Immutabilité en pratique' },
    {
      title: 'Mises à jour immuables',
      code: `const todos = [
  { id: 1, done: false },
  { id: 2, done: false },
]
const toggled = todos.map((t) => (t.id === 2 ? { ...t, done: true } : t))
const added = [...todos, { id: 3, done: false }]
const without = todos.filter((t) => t.id !== 1)
console.log(todos[1].done, toggled[1].done, added.length, without.length)
console.log(toggled[0] === todos[0])`,
      output: `false true 3 1
true`,
    },
    {
      p: 'On ne recopie que ce qui change : les éléments non modifiés gardent la même référence (*structural sharing*), ce qui permet aux comparaisons `===` (React, `memo`, sélecteurs) de détecter les changements à moindre coût.',
    },
  ],
  mnemo: '« Les verbes d’action mutent » (push, pop, shift, unshift, splice, sort, reverse, fill) ; « to-quelque-chose copie » (toSorted, toReversed, toSpliced) et « with remplace sans toucher ».',
  piege: '`[10, 9, 1].sort()` donne `[ 1, 10, 9 ]` : sans comparateur, le tri est lexicographique. Et `sort` mute le tableau d’origine : trier une prop ou un état React directement (`props.items.sort()`) modifie la donnée partagée. Utiliser `toSorted` ou `[...arr].sort((a, b) => a - b)`.',
}

const objects: CoursSection = {
  id: 'objects',
  title: 'Objets, références, copies',
  summary: 'Les primitifs sont copiés par valeur, les objets sont manipulés par référence ; copier un objet en profondeur demande un outil adapté (structuredClone).',
  blocks: [
    { h: 'Valeur contre référence' },
    {
      p: 'Une variable contenant un primitif contient la valeur elle-même. Une variable contenant un objet contient une **référence** vers cet objet : l’affecter à une autre variable ou le passer à une fonction copie la référence, pas l’objet. JavaScript passe tous les arguments **par valeur**, mais pour un objet cette valeur est une référence (on parle parfois de *call by sharing*).',
    },
    {
      title: 'Partage de référence',
      code: `let n = 1
let m = n
m++
const a = { score: 1 }
const b = a
b.score++
function mutate(obj) {
  obj.score = 100
}
function reassign(obj) {
  obj = { score: -1 }
}
mutate(a)
reassign(a)
console.log(n, m, a.score, a === b)`,
      output: `1 2 100 true`,
    },
    {
      p: 'Une fonction peut **muter** l’objet reçu (l’appelant le voit), mais **réaffecter** son paramètre ne change que sa copie locale de la référence.',
    },
    { h: 'Égalité' },
    {
      title: 'Comparer des objets',
      code: `({ a: 1 }) === ({ a: 1 }) // → false
[1, 2] === [1, 2] // → false
const ref = { a: 1 }
ref === ref // → true
JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 }) // → false`,
    },
    {
      p: '`===` compare les **identités** : deux objets distincts ne sont jamais égaux, même avec le même contenu. Une égalité profonde demande une fonction dédiée (récursive, ou `isEqual` de lodash) ; comparer des `JSON.stringify` est fragile car l’ordre des clés compte.',
    },
    { h: 'Copie superficielle (shallow)' },
    {
      title: 'Spread et Object.assign',
      code: `const original = { user: 'ada', prefs: { theme: 'dark' } }
const copy = { ...original }
const copy2 = Object.assign({}, original)
copy.user = 'bob'
copy.prefs.theme = 'light'
console.log(original.user, original.prefs.theme)
console.log(copy.prefs === original.prefs, copy2.prefs === original.prefs)`,
      output: `ada light
true true`,
    },
    {
      p: 'Le spread `{ ...obj }`, `Object.assign`, `[...arr]`, `arr.slice()` et `Array.from` ne copient que le **premier niveau** : les objets imbriqués restent partagés. Pour une mise à jour immuable imbriquée, on recopie chaque niveau modifié : `{ ...state, prefs: { ...state.prefs, theme: \'light\' } }`.',
    },
    { h: 'Copie profonde (deep)' },
    {
      title: 'structuredClone contre JSON',
      code: `const source = { date: new Date(0), set: new Set([1]), nested: { n: 1 }, nothing: undefined, big: NaN }
const viaJson = JSON.parse(JSON.stringify(source))
console.log(viaJson)
const clone = structuredClone(source)
clone.nested.n = 2
console.log(source.nested.n, clone.date instanceof Date, clone.date !== source.date, clone.set)
try {
  structuredClone({ fn() {} })
} catch (e) {
  console.log(e.name)
}`,
      output: `{ date: '1970-01-01T00:00:00.000Z', set: {}, nested: { n: 1 }, big: null }
1 true true Set(1) { 1 }
DataCloneError`,
    },
    {
      table: [
        ['Méthode', 'Profondeur', 'Limites'],
        ['`{ ...obj }`, `Object.assign`', '1 niveau', 'imbriqués partagés'],
        ['`JSON.parse(JSON.stringify(x))`', 'profonde', 'perd `undefined`, fonctions, symboles ; `Date` → chaîne ; `Map`/`Set` → `{}` ; `NaN`/`Infinity` → `null` ; erreur sur références circulaires'],
        ['`structuredClone(x)`', 'profonde', 'gère `Date`, `Map`, `Set`, cycles ; `DataCloneError` sur fonctions et nœuds DOM ; perd le prototype des classes et les getters'],
      ],
    },
    { h: 'Object.freeze est superficiel' },
    {
      title: 'Gel d’un seul niveau',
      code: `const settings = Object.freeze({ lang: 'fr', limits: { max: 10 } })
settings.lang = 'en'
settings.limits.max = 99
console.log(settings.lang, settings.limits.max, Object.isFrozen(settings))`,
      output: `fr 99 true`,
    },
    {
      p: '`Object.freeze` empêche d’ajouter, supprimer ou modifier les propriétés **directes** ; en mode non strict, les tentatives échouent silencieusement (en mode strict : `TypeError`). Les objets imbriqués restent modifiables : il faut un *deep freeze* récursif. `Object.seal` interdit seulement l’ajout et la suppression.',
    },
  ],
  mnemo: '« Copier un objet, c’est copier l’adresse, pas la maison ». Spread = copie du rez-de-chaussée ; structuredClone = toute la maison (sauf les fonctions).',
  piege: 'Croire que `{ ...obj }` ou `Object.freeze(obj)` agissent en profondeur. Les deux s’arrêtent au premier niveau : modifier `copy.prefs.theme` modifie aussi l’original, et un objet gelé peut voir ses objets imbriqués changer. Autre piège : utiliser `JSON.parse(JSON.stringify())` sur des dates, des `Map` ou des `undefined`.',
}

const modules: CoursSection = {
  id: 'modules',
  title: 'Modules',
  summary: 'Les modules ES (import/export) sont statiques, stricts et à liaisons vivantes ; CommonJS (require) est dynamique et copie les valeurs exportées.',
  blocks: [
    { h: 'ESM contre CommonJS' },
    {
      table: [
        ['', 'ES Modules (ESM)', 'CommonJS (CJS)'],
        ['Syntaxe', '`import` / `export`', '`require()` / `module.exports`'],
        ['Chargement', 'statique, analysé avant exécution, asynchrone', 'dynamique, synchrone, à l’exécution'],
        ['Liaisons', 'vivantes (live bindings), en lecture seule', 'copie de la valeur au moment du `require`'],
        ['Mode', 'toujours strict, `this` vaut `undefined` au niveau du module', 'non strict par défaut, `this` vaut `module.exports`'],
        ['Top-level `await`', 'oui', 'non'],
        ['Environnement', 'navigateurs, Node (`.mjs` ou `"type": "module"`), bundlers', 'Node historique'],
      ],
    },
    { h: 'Exports nommés et export par défaut' },
    {
      title: 'math.js puis app.js',
      run: false,
      code: `// math.js
export const PI = 3.14159
export function area(r) {
  return PI * r * r
}
export default function sum(a, b) {
  return a + b
}

// app.js
import add, { area, PI as pi } from './math.js'
import * as math from './math.js'
console.log(add(1, 2), area(1), pi, math.default === add)`,
    },
    {
      p: 'Un module peut avoir **plusieurs exports nommés** et **un seul export par défaut**. Les exports nommés s’importent avec leur nom exact (renommage possible avec `as`) entre accolades, ce qui aide l’autocomplétion et le refactoring ; l’export par défaut s’importe sans accolades sous le nom qu’on veut. Beaucoup d’équipes préfèrent les exports nommés pour la cohérence des noms dans tout le projet.',
    },
    { h: 'Liaisons vivantes' },
    {
      title: 'counter.js',
      run: false,
      code: `// counter.js
export let count = 0
export function increment() {
  count++
}

// main.js
import { count, increment } from './counter.js'
increment()
console.log(count)
count = 10`,
    },
    {
      p: 'Ici, `main.js` affiche `1` : l’import est une **vue vivante** sur la variable du module exportateur, pas une copie. En revanche, la dernière ligne lève une `TypeError` (affectation à une constante) car un import est en lecture seule. Avec CommonJS, `const { count } = require(\'./counter\')` aurait copié la valeur `0` et afficherait toujours `0`.',
    },
    { h: 'import statique et import() dynamique' },
    {
      title: 'Chargement à la demande',
      run: false,
      code: `button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js')
  renderChart(data)
})`,
    },
    {
      list: [
        'Les `import` statiques sont remontés et résolus avant toute exécution ; ils doivent être au niveau supérieur et leur chemin doit être une chaîne littérale.',
        '`import()` est une expression qui renvoie une **promesse** du module ; on peut l’appeler n’importe où, avec un chemin calculé.',
        'Usage : *code splitting*, chargement à la demande (routes, `React.lazy`), modules optionnels.',
        'Un module n’est évalué **qu’une seule fois**, même s’il est importé à plusieurs endroits (cache par URL).',
      ],
    },
    { h: 'Tree shaking et navigateur' },
    {
      p: 'Comme la structure des imports et exports ESM est connue sans exécuter le code, les bundlers (Vite/Rollup, webpack, esbuild) peuvent supprimer les exports jamais importés : c’est le **tree shaking**. Il fonctionne mal avec CommonJS et avec les modules ayant des effets de bord au chargement (d’où le champ `"sideEffects": false` du package.json).',
    },
    {
      title: 'Dans une page HTML',
      run: false,
      code: `<script type="module" src="./app.js"></script>
<script nomodule src="./legacy.js"></script>`,
    },
    {
      p: 'Un script `type="module"` est **différé par défaut** (comme `defer`), s’exécute en mode strict, a sa propre portée (ses variables ne deviennent pas globales), est soumis à CORS pour les ressources d’une autre origine, et n’est exécuté qu’une fois même s’il est inclus plusieurs fois.',
    },
  ],
  mnemo: '« ESM est un contrat signé à l’avance (statique), CommonJS une commande passée en direct (dynamique) ». Et « import = fenêtre sur la variable, require = photo de la valeur ».',
  piege: 'Croire qu’un import ESM est une copie : c’est une liaison vivante et en lecture seule. Autre piège : mélanger `export default` et import nommé (`import { sum } from \'./math\'` alors que `sum` est l’export par défaut) donne `undefined` ou une erreur de liaison.',
}

const dom: CoursSection = {
  id: 'dom',
  title: 'DOM et événements',
  summary: 'Un événement DOM traverse l’arbre en trois phases (capture, cible, bouillonnement), ce qui permet la délégation d’événements.',
  blocks: [
    { h: 'Sélectionner et modifier' },
    {
      title: 'Les sélecteurs',
      run: false,
      code: `const button = document.querySelector('#save')
const items = document.querySelectorAll('.item')
items.forEach((el) => el.classList.add('ready'))
const live = document.getElementsByClassName('item')
const li = document.createElement('li')
li.textContent = 'Nouveau'
document.querySelector('ul').append(li)`,
    },
    {
      p: '`querySelector` renvoie le premier élément correspondant à un sélecteur CSS (ou `null`), `querySelectorAll` une `NodeList` **statique** (photo au moment de l’appel). `getElementsByClassName` et `children` renvoient des `HTMLCollection` **vivantes**, mises à jour quand le DOM change. Pour du texte, préférer `textContent` à `innerHTML` (sécurité, voir la section web).',
    },
    { h: 'Propagation : capture, cible, bouillonnement' },
    {
      p: 'Un clic sur un bouton dans un `div` déclenche trois phases : **capture** (de `window` jusqu’au parent de la cible), **cible** (l’élément cliqué), puis **bouillonnement** (*bubbling*, de la cible remontant jusqu’à `window`). Par défaut, `addEventListener` écoute la phase de bouillonnement ; avec `{ capture: true }`, l’écouteur se déclenche pendant la descente. `event.target` est l’élément d’origine, `event.currentTarget` celui qui porte l’écouteur en cours. Dans l’exemple ci-dessous, un clic sur le bouton journalise dans l’ordre « parent capture », « child », puis « parent bubble ».',
    },
    {
      title: 'Ordre des écouteurs',
      run: false,
      code: `// <div id="parent"><button id="child">OK</button></div>
parent.addEventListener('click', () => log('parent capture'), { capture: true })
parent.addEventListener('click', () => log('parent bubble'))
child.addEventListener('click', () => log('child'))`,
    },
    { h: 'Options de addEventListener' },
    {
      table: [
        ['Option', 'Effet'],
        ['`capture: true`', 'écoute pendant la phase de capture'],
        ['`once: true`', 'l’écouteur se retire automatiquement après le premier appel'],
        ['`passive: true`', 'promet de ne pas appeler `preventDefault` : le navigateur peut défiler sans attendre (scroll, touch)'],
        ['`signal`', 'un `AbortSignal` : `controller.abort()` retire l’écouteur'],
      ],
    },
    { h: 'Délégation d’événements' },
    {
      title: 'Un seul écouteur pour toute une liste',
      run: false,
      code: `const list = document.querySelector('#todo-list')
list.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('button.delete')
  if (!deleteButton || !list.contains(deleteButton)) return
  deleteButton.closest('li').remove()
})`,
    },
    {
      p: 'Grâce au bouillonnement, on attache **un seul écouteur** sur un ancêtre commun et on identifie l’élément visé avec `event.target.closest(…)`. Avantages : moins d’écouteurs en mémoire, et les éléments ajoutés plus tard sont gérés automatiquement. Ce que le recruteur attend : la définition, l’usage de `closest`, et la limite (certains événements comme `focus` ou `mouseenter` ne bouillonnent pas ; on utilise alors `focusin` ou `mouseover`).',
    },
    { h: 'stopPropagation contre preventDefault' },
    {
      list: [
        '`event.preventDefault()` annule l’**action par défaut du navigateur** (soumission de formulaire, navigation d’un lien, case cochée) mais l’événement continue de se propager.',
        '`event.stopPropagation()` arrête la **propagation** vers les autres éléments, mais l’action par défaut a toujours lieu.',
        '`event.stopImmediatePropagation()` empêche en plus les autres écouteurs du même élément.',
        'Abuser de `stopPropagation` casse la délégation et les analytics : on le réserve aux cas justifiés.',
      ],
    },
    {
      title: 'Formulaire géré en JavaScript',
      run: false,
      code: `form.addEventListener('submit', (event) => {
  event.preventDefault()
  const data = new FormData(form)
  sendToApi(Object.fromEntries(data))
})`,
    },
    { h: 'Cycle de chargement' },
    {
      table: [
        ['Événement', 'Moment'],
        ['`DOMContentLoaded`', 'HTML analysé et DOM construit, scripts `defer` exécutés ; images et feuilles de style peut-être encore en cours'],
        ['`load` (sur `window`)', 'toute la page est chargée, y compris images, iframes et CSS'],
        ['`beforeunload` / `pagehide`', 'l’utilisateur quitte la page'],
      ],
    },
    {
      p: 'Un `<script>` classique bloque l’analyse du HTML. `defer` télécharge en parallèle et exécute dans l’ordre après l’analyse (avant `DOMContentLoaded`) ; `async` exécute dès que le fichier arrive, sans ordre garanti, ce qui convient aux scripts indépendants comme l’analytics.',
    },
  ],
  mnemo: '« L’événement descend en rappel (capture), touche la cible, puis remonte comme une bulle ». Et « preventDefault empêche le navigateur, stopPropagation empêche les parents ».',
  piege: 'Confondre `preventDefault` et `stopPropagation`, ou `event.target` et `event.currentTarget`. Dans une délégation, `event.target` peut être un enfant du bouton (une icône `<svg>` par exemple) : il faut remonter avec `closest(\'button\')` au lieu de tester `event.target.tagName`.',
}

const perf: CoursSection = {
  id: 'perf',
  title: 'Performance',
  summary: 'Limiter le travail inutile (debounce, throttle, mémoïsation), éviter de forcer le layout et ne jamais bloquer le fil principal.',
  blocks: [
    { h: 'Debounce contre throttle' },
    {
      table: [
        ['', 'Debounce', 'Throttle'],
        ['Principe', 'attend un silence de `delay` ms après le dernier appel', 'au plus un appel toutes les `delay` ms'],
        ['Rafale de 50 appels', '1 exécution, à la fin', 'une exécution régulière pendant la rafale'],
        ['Cas d’usage', 'recherche à la frappe, validation, redimensionnement terminé, autosave', 'scroll, `mousemove`, drag, suivi de position'],
      ],
    },
    {
      title: 'Debounce',
      code: `function debounce(fn, delay) {
  let timerId
  return function (...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => fn.apply(this, args), delay)
  }
}
const search = debounce((query) => console.log('search:', query), 50)
search('j')
search('ja')
search('jav')
setTimeout(() => search('javascript'), 100)`,
      output: `search: jav
search: javascript`,
    },
    {
      title: 'Throttle',
      code: `function throttle(fn, delay) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}
const onScroll = throttle((y) => console.log('scroll at', y), 100)
onScroll(0)
onScroll(10)
onScroll(20)
setTimeout(() => onScroll(300), 150)`,
      output: `scroll at 0
scroll at 300`,
    },
    {
      p: 'Dans le debounce, chaque appel annule le minuteur précédent et en relance un nouveau : seule la dernière valeur d’une rafale est traitée. La closure conserve `timerId` entre les appels, et `fn.apply(this, args)` préserve le contexte et les arguments. Le throttle présenté (« leading edge ») exécute immédiatement puis ignore les appels pendant `delay` ms. Une version complète ajoute un appel final (« trailing ») pour ne pas perdre la dernière position. En entretien, savoir écrire les deux de mémoire et expliquer la différence est un grand classique.',
    },
    { h: 'Mémoïsation' },
    {
      title: 'Cache des résultats d’une fonction pure',
      code: `function memoize(fn) {
  const cache = new Map()
  return (n) => {
    if (cache.has(n)) return cache.get(n)
    const result = fn(n)
    cache.set(n, result)
    return result
  }
}
let calls = 0
const slowSquare = (n) => {
  calls++
  return n * n
}
const fastSquare = memoize(slowSquare)
fastSquare(9)
fastSquare(9)
fastSquare(4)
console.log(fastSquare(9), calls)`,
      output: `81 2`,
    },
    {
      p: 'La mémoïsation échange de la **mémoire** contre du **temps** ; elle n’est correcte que pour des fonctions **pures** (même entrée, même sortie, sans effet de bord). Avec des arguments objets, la clé du cache est la référence : il faut des entrées immuables. Penser à borner le cache (LRU) pour éviter qu’il grossisse sans fin. C’est le principe de `useMemo`, `React.memo` et des sélecteurs mémoïsés.',
    },
    { h: 'Rendu : layout thrashing et requestAnimationFrame' },
    {
      p: 'Lire une propriété géométrique (`offsetHeight`, `getBoundingClientRect()`, `scrollTop`) après une écriture de style **force** le navigateur à recalculer le layout immédiatement (*reflow* synchrone). Alterner lectures et écritures dans une boucle provoque un recalcul par itération : c’est le **layout thrashing**. La règle : grouper toutes les lectures, puis toutes les écritures.',
    },
    {
      title: 'Lire puis écrire, et animer avec rAF',
      run: false,
      code: `// Mauvais : lecture et écriture alternées, un reflow par élément
boxes.forEach((box) => {
  box.style.width = box.parentElement.offsetWidth / 2 + 'px'
})

// Bon : toutes les lectures, puis toutes les écritures
const widths = boxes.map((box) => box.parentElement.offsetWidth)
boxes.forEach((box, i) => {
  box.style.width = widths[i] / 2 + 'px'
})

// Animation synchronisée avec l'affichage
function step(timestamp) {
  el.style.transform = 'translateX(' + (timestamp / 10) % 300 + 'px)'
  requestAnimationFrame(step)
}
requestAnimationFrame(step)`,
    },
    {
      list: [
        '`requestAnimationFrame` appelle le callback juste avant le prochain rendu (environ 60 fois par seconde), et se met en pause dans un onglet masqué : idéal pour les animations JS, contrairement à `setInterval`.',
        'Animer `transform` et `opacity` plutôt que `top`, `left` ou `width` : ces propriétés sont gérées par le compositeur sans recalcul de layout.',
        'Pour de longues listes, virtualiser (n’afficher que les éléments visibles).',
        'Écouteurs `scroll`/`touch` en `{ passive: true }`, et `IntersectionObserver` plutôt que des calculs de position au scroll.',
      ],
    },
    { h: 'Complexité des opérations courantes' },
    {
      table: [
        ['Opération', 'Complexité'],
        ['`arr[i]`, `push`, `pop`', 'O(1)'],
        ['`shift`, `unshift`, `splice` au début', 'O(n) (réindexation)'],
        ['`includes`, `indexOf`, `find`', 'O(n)'],
        ['`map`, `filter`, `reduce`, `forEach`', 'O(n)'],
        ['`sort`', 'O(n log n)'],
        ['`Set.has`, `Map.get`, `obj[key]`', 'O(1) en moyenne'],
        ['`a.filter((x) => b.includes(x))`', 'O(n × m) : construire `new Set(b)` puis `has`, O(n + m)'],
      ],
    },
    { h: 'Ne pas bloquer le fil principal : Web Workers' },
    {
      title: 'Déléguer un calcul lourd',
      run: false,
      code: `// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
worker.postMessage({ numbers: hugeArray })
worker.onmessage = (event) => showResult(event.data)

// worker.js
self.onmessage = (event) => {
  const total = event.data.numbers.reduce((acc, n) => acc + n, 0)
  self.postMessage(total)
}`,
    },
    {
      p: 'Un **Web Worker** exécute du JavaScript dans un autre fil, avec sa propre event loop : l’interface reste fluide pendant le calcul. Il n’a **pas accès au DOM** et communique par messages (`postMessage`), les données étant copiées par l’algorithme de clonage structuré (ou transférées, pour les `ArrayBuffer`). À utiliser pour le parsing de gros fichiers, la compression, le traitement d’images, les calculs lourds.',
    },
  ],
  mnemo: '« Debounce attend que tu te taises, throttle te laisse parler une fois par seconde ». Pour le DOM : « on lit tout, puis on écrit tout ».',
  piege: 'Confondre debounce et throttle (une recherche à la frappe veut un debounce, un suivi du scroll un throttle), ou créer la fonction debouncée **à chaque rendu** (dans un composant React sans `useMemo`/`useRef`) : chaque appel a alors son propre minuteur et rien n’est jamais annulé.',
}

const web: CoursSection = {
  id: 'web',
  title: 'Bases du web',
  summary: 'fetch, JSON, CORS, stockage côté client et sécurité (XSS, CSRF, CSP, HTTPS) : les fondamentaux attendus de tout développeur front.',
  blocks: [
    { h: 'fetch et la gestion des erreurs HTTP' },
    {
      p: '`fetch` renvoie une promesse qui n’est **rompue qu’en cas d’échec réseau** (DNS, coupure, CORS refusé, requête annulée). Une réponse `404` ou `500` est une réponse valide : la promesse est tenue et il faut tester `response.ok` (vrai pour les statuts 200 à 299). Le corps se lit ensuite avec `response.json()`, qui renvoie lui aussi une promesse.',
    },
    {
      title: 'Un wrapper fetch robuste',
      run: false,
      code: `async function getJson(url, { timeoutMs = 5000, ...options } = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    throw new Error('HTTP ' + response.status + ' on ' + url)
  }
  return response.json()
}

try {
  const users = await getJson('/api/users')
  render(users)
} catch (error) {
  showError(error.message)
}`,
    },
    {
      p: 'Pour envoyer du JSON, on précise `method: \'POST\'`, l’en-tête `\'Content-Type\': \'application/json\'` et `body: JSON.stringify(data)`. Un `AbortController` (ou `AbortSignal.timeout`) permet d’annuler une requête lors d’un changement de page ou d’une nouvelle recherche. Enfin, les cookies ne sont envoyés vers une autre origine qu’avec `credentials: \'include\'` et l’accord du serveur.',
    },
    { h: 'JSON' },
    {
      title: 'JSON.stringify et JSON.parse',
      code: `const data = { id: 1, tags: ['js'], at: new Date(0), skip: undefined, fn() {} }
JSON.stringify(data) // → '{"id":1,"tags":["js"],"at":"1970-01-01T00:00:00.000Z"}'
JSON.stringify({ a: 1, b: [1, 2] }, null, 0) // → '{"a":1,"b":[1,2]}'
JSON.parse('{"ok":true,"n":[1,2]}') // → { ok: true, n: [ 1, 2 ] }
JSON.parse('{"d":"2024-01-01"}').d // → '2024-01-01'
try {
  JSON.parse("{'bad': 1}")
} catch (e) {
  console.log(e.name)
}`,
      output: `SyntaxError`,
    },
    {
      p: 'JSON est un format texte strict : clés et chaînes entre **guillemets doubles**, pas de virgule finale, pas de commentaires, pas de `undefined` ni de fonctions. Les dates deviennent des chaînes et ne sont pas reconverties automatiquement par `JSON.parse` (utiliser un *reviver*). Toujours entourer `JSON.parse` d’un `try/catch` quand la source n’est pas maîtrisée.',
    },
    { h: 'CORS et requêtes preflight' },
    {
      p: 'La **Same-Origin Policy** empêche un script de lire les réponses d’une autre origine (protocole + domaine + port). **CORS** (*Cross-Origin Resource Sharing*) est le mécanisme par lequel le **serveur** autorise explicitement certaines origines, via l’en-tête `Access-Control-Allow-Origin`. C’est le navigateur qui applique la règle : une erreur CORS ne se corrige pas côté front, mais dans la configuration du serveur (ou via un proxy).',
    },
    {
      list: [
        '**Requête simple** (GET/HEAD/POST avec des en-têtes et un `Content-Type` basiques) : envoyée directement, la réponse n’est lisible que si le serveur l’autorise.',
        '**Preflight** : pour les autres cas (PUT, DELETE, `Content-Type: application/json`, en-tête `Authorization`…), le navigateur envoie d’abord une requête `OPTIONS` demandant la permission (`Access-Control-Request-Method`, `Access-Control-Request-Headers`).',
        'Avec des cookies (`credentials: \'include\'`), le serveur doit renvoyer `Access-Control-Allow-Credentials: true` et une origine précise, pas `*`.',
      ],
    },
    { h: 'Stockage côté client' },
    {
      table: [
        ['', 'Cookies', '`localStorage`', '`sessionStorage`'],
        ['Capacité', '≈ 4 Ko par cookie', '≈ 5 à 10 Mo par origine', '≈ 5 Mo par origine'],
        ['Durée de vie', '`Expires` / `Max-Age`, sinon fin de session', 'permanente', 'fermeture de l’onglet'],
        ['Envoyé au serveur', 'oui, à chaque requête', 'non', 'non'],
        ['Accessible en JS', 'oui, sauf `HttpOnly`', 'oui', 'oui (onglet courant uniquement)'],
        ['Usage', 'session, authentification', 'préférences, cache non sensible', 'état temporaire d’un formulaire'],
      ],
    },
    {
      p: 'Un jeton d’authentification stocké dans `localStorage` est lisible par n’importe quel script de la page, donc volable en cas de faille XSS. Un cookie `HttpOnly; Secure; SameSite=Lax` (ou `Strict`) est inaccessible au JavaScript, envoyé uniquement en HTTPS, et protège en grande partie contre le CSRF.',
    },
    { h: 'Sécurité : XSS, CSRF, CSP, HTTPS' },
    {
      title: 'Injecter du texte sans danger',
      run: false,
      code: `const comment = '<img src=x onerror="alert(document.cookie)">'

// Dangereux : le HTML est interprété, le script de l'attaquant s'exécute
container.innerHTML = comment

// Sûr : le texte est affiché tel quel
container.textContent = comment`,
    },
    {
      p: 'Le **XSS** (*Cross-Site Scripting*) consiste à faire exécuter un script malveillant dans la page d’une victime, souvent via une donnée utilisateur insérée sans échappement. Défenses : `textContent` plutôt que `innerHTML`, échappement automatique des frameworks (React échappe les valeurs, sauf `dangerouslySetInnerHTML`), assainissement avec une bibliothèque comme DOMPurify quand le HTML est indispensable, cookies `HttpOnly`, et une CSP.',
    },
    {
      list: [
        '**CSRF** (*Cross-Site Request Forgery*) : un site malveillant fait envoyer par le navigateur de la victime une requête vers votre site, cookies de session inclus. Défenses : cookies `SameSite`, jeton anti-CSRF vérifié par le serveur, vérification de l’en-tête `Origin`, jamais d’action modifiante en GET.',
        '**CSP** (*Content Security Policy*) : en-tête HTTP qui liste les sources autorisées pour les scripts, styles, images… (`script-src \'self\'`). Elle bloque les scripts inline et les domaines inconnus, ce qui limite fortement l’impact d’un XSS.',
        '**HTTPS** : TLS chiffre les échanges, garantit leur intégrité et authentifie le serveur par certificat. Indispensable pour les cookies `Secure`, HTTP/2, les service workers et la plupart des API modernes. L’en-tête HSTS force le navigateur à toujours utiliser HTTPS.',
      ],
    },
  ],
  mnemo: '« fetch ne pleure que si le réseau meurt » : un 404 ne rejette pas, testez `response.ok`. Et « XSS = le code de l’attaquant chez vous ; CSRF = votre session chez l’attaquant ».',
  piege: 'Croire qu’un `catch` après `fetch` attrape les erreurs 404 ou 500 : la promesse est tenue, il faut vérifier `response.ok` et lever soi-même l’erreur. Autre classique : penser qu’une erreur CORS se règle côté client, alors que c’est le serveur qui doit envoyer les en-têtes `Access-Control-Allow-*`.',
}

export const cours: CoursSection[] = [types,scope,closures,thisSection,prototypes,eventloop,asyncSection,es6,arrays,objects,modules,dom,perf,web,algo]
