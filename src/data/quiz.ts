import type { QuizItem } from './types'

const OUT = "Qu'affiche ce code ?"
const BUG = 'Où est le bug ?'

export const quiz: QuizItem[] = [
  // ───────────── types ─────────────
  {
    id: 'q1',
    theme: 'types',
    kind: 'output',
    q: OUT,
    code: `console.log([] + {})
console.log([] == ![])
console.log(null == undefined, null === undefined)`,
    choices: [
      '[object Object]\nfalse\ntrue false',
      '[object Object]\ntrue\ntrue false',
      '0\ntrue\ntrue true',
      '{}\nfalse\nfalse false',
    ],
    answer: 1,
    why: "Avec `+`, les deux objets sont convertis en primitives : `[]` devient `''` et `{}` devient `'[object Object]'`, d'où une concaténation. Pour `[] == ![]`, `![]` vaut `false` (un tableau est truthy), puis `==` convertit tout en nombre : `[]` → `''` → `0` et `false` → `0`, donc `true`. Enfin `null == undefined` est un cas spécial de `==` (ils ne sont égaux qu'entre eux), mais leurs types diffèrent pour `===`.",
  },
  {
    id: 'q2',
    theme: 'types',
    kind: 'output',
    q: OUT,
    code: `console.log('5' - 2, '5' + 2, '5' * '2', +'')`,
    choices: ['3 7 10 0', '3 52 10 NaN', '3 52 10 0', 'NaN 52 NaN 0'],
    answer: 2,
    why: "Le `+` binaire concatène dès qu'un opérande est une chaîne : `'5' + 2` donne `'52'`. Les autres opérateurs arithmétiques (`-`, `*`) convertissent toujours en nombre, d'où `3` et `10`. Le `+` unaire convertit en nombre et la chaîne vide vaut `0`.",
  },
  {
    id: 'q3',
    theme: 'types',
    kind: 'output',
    q: OUT,
    code: `console.log(typeof null, typeof NaN, typeof function () {}, typeof [])`,
    choices: ['null NaN function array', 'object number object object', 'object number function object', 'null number function array'],
    answer: 2,
    why: "`typeof null` vaut `'object'` : c'est un bug historique de JavaScript conservé pour la compatibilité. `NaN` est une valeur du type **number**. Les fonctions ont leur propre résultat `'function'`, alors que les tableaux sont des objets (on les détecte avec `Array.isArray`).",
  },
  {
    id: 'q4',
    theme: 'types',
    kind: 'output',
    q: OUT,
    code: `console.log(NaN === NaN, Object.is(NaN, NaN), 0 === -0, Object.is(0, -0))`,
    choices: ['false true true false', 'true true true true', 'false false true true', 'false true false false'],
    answer: 0,
    why: "`NaN` est la seule valeur différente d'elle-même avec `===` (on la teste avec `Number.isNaN`). `Object.is` implémente l'algorithme **SameValue** : il considère `NaN` égal à `NaN` mais distingue `0` et `-0`, que `===` considère égaux.",
  },
  {
    id: 'q5',
    theme: 'types',
    kind: 'qcm',
    q: 'Laquelle de ces valeurs est truthy ?',
    choices: ['0', "''", "'0'", 'NaN'],
    answer: 2,
    why: "Il n'y a que 8 valeurs falsy : `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` et `NaN`. Tout le reste est truthy, y compris la chaîne `'0'`, la chaîne `'false'`, `[]` et `{}`.",
  },
  {
    id: 'q6',
    theme: 'types',
    kind: 'qcm',
    q: 'Pourquoi `0.1 + 0.2 === 0.3` vaut-il `false` ?',
    choices: [
      'Parce que `===` compare aussi les types et que le résultat est un flottant',
      'Parce que les nombres sont stockés en virgule flottante binaire (IEEE 754) et que 0,1 et 0,2 ne sont pas représentables exactement',
      'Parce que JavaScript arrondit les additions à 15 décimales',
      "C'est un bug du moteur V8, corrigé dans les navigateurs récents",
    ],
    answer: 1,
    why: "Tous les `number` sont des flottants double précision IEEE 754 : `0.1` et `0.2` n'ont pas de représentation binaire finie, et leur somme vaut `0.30000000000000004`. Pour comparer, on utilise une tolérance (`Math.abs(a - b) < Number.EPSILON`) ou on travaille en entiers (centimes).",
  },
  {
    id: 'q7',
    theme: 'types',
    kind: 'qcm',
    q: 'Quelle est la différence entre `==` et `===` ?',
    choices: [
      '`===` compare les références, `==` compare les valeurs',
      "`==` applique des conversions de type avant de comparer, `===` exige le même type et la même valeur",
      "Aucune pour les primitives, seulement pour les objets",
      '`==` est plus rapide car il ne vérifie pas les types',
    ],
    answer: 1,
    why: "`==` (égalité abstraite) convertit les opérandes selon des règles complexes (`'1' == 1`, `null == undefined`, `[] == false`). `===` (égalité stricte) ne convertit rien : types différents, résultat `false`. Pour les objets, les deux comparent les références. On utilise `===` par défaut, avec l'exception courante `x == null` pour tester `null` ou `undefined`.",
  },

  // ───────────── scope ─────────────
  {
    id: 'q8',
    theme: 'scope',
    kind: 'output',
    q: OUT,
    code: `console.log(a)
var a = 1
console.log(a)`,
    choices: ['Uncaught ReferenceError: a is not defined', 'undefined\n1', '1\n1', "Uncaught ReferenceError: Cannot access 'a' before initialization"],
    answer: 1,
    why: "Les déclarations `var` sont **hissées** (hoisting) en haut de leur portée et initialisées à `undefined` ; seule l'affectation `a = 1` reste à sa place. Le premier `console.log` affiche donc `undefined` sans erreur.",
  },
  {
    id: 'q9',
    theme: 'scope',
    kind: 'output',
    q: OUT,
    code: `console.log(typeof b)
let b = 2`,
    choices: ['undefined', 'number', 'Uncaught ReferenceError: b is not defined', "Uncaught ReferenceError: Cannot access 'b' before initialization"],
    answer: 3,
    why: "`let` et `const` sont aussi hissés, mais restent non initialisés jusqu'à leur déclaration : c'est la **TDZ** (zone morte temporelle). Y accéder, même avec `typeof`, lève une `ReferenceError`. `typeof` ne renvoie `'undefined'` sans erreur que pour une variable jamais déclarée.",
  },
  {
    id: 'q10',
    theme: 'scope',
    kind: 'output',
    q: OUT,
    code: `console.log(f())
console.log(typeof g)
function f() { return 'f' }
var g = function () { return 'g' }`,
    choices: ['f\nundefined', 'f\nfunction', 'Uncaught TypeError: f is not a function', 'undefined\nundefined'],
    answer: 0,
    why: "Une **déclaration** de fonction est hissée entièrement (nom et corps) : on peut l'appeler avant sa ligne. Une **expression** de fonction affectée à `var g` suit les règles de `var` : seule la variable est hissée, elle vaut `undefined` jusqu'à l'affectation.",
  },
  {
    id: 'q11',
    theme: 'scope',
    kind: 'output',
    q: OUT,
    code: `var x = 1
{
  let x = 2
  console.log(x)
}
console.log(x)
if (true) { var y = 3 }
console.log(y)`,
    choices: ['2\n2\n3', '2\n1\nUncaught ReferenceError: y is not defined', '2\n1\n3', '1\n1\n3'],
    answer: 2,
    why: "`let` a une portée de **bloc** : le `x` intérieur masque le `x` global uniquement dans les accolades. `var` ignore les blocs (portée de fonction ou globale) : `y` déclaré dans le `if` reste accessible après.",
  },
  {
    id: 'q12',
    theme: 'scope',
    kind: 'bug',
    q: BUG,
    code: `const user = 'Alice'
function greet() {
  console.log('Bonjour ' + user)
  let user = 'Bob'
}
greet()`,
    choices: [
      "`const user` ne peut pas être lu depuis une fonction",
      "Le `let user` interne masque la variable externe dans toute la fonction : la lecture tombe dans la TDZ et lève une ReferenceError",
      "Le code affiche « Bonjour undefined » à cause du hoisting",
      "Il manque `return` dans `greet`",
    ],
    answer: 1,
    why: "La déclaration `let user` est hissée en haut de la portée de `greet` : dès l'entrée dans la fonction, `user` désigne la variable locale, encore non initialisée. La ligne `console.log` lève donc `ReferenceError: Cannot access 'user' before initialization`. Il faut renommer la variable locale ou la déclarer avant usage.",
  },
  {
    id: 'q13',
    theme: 'scope',
    kind: 'bug',
    q: BUG,
    code: `function sumAll(list) {
  total = 0
  for (const n of list) total += n
  return total
}`,
    choices: [
      '`for...of` ne fonctionne pas sur les tableaux',
      "`total` n'est pas déclaré : en mode non strict il devient une variable globale implicite (et lève une ReferenceError en mode strict)",
      '`return` est placé hors de la boucle',
      '`const n` devrait être `let n` car `n` change à chaque tour',
    ],
    answer: 1,
    why: "Affecter une variable jamais déclarée crée une propriété de l'objet global en mode non strict : fuite d'état, collisions entre appels. En mode strict (modules, classes), c'est une `ReferenceError`. Il faut écrire `let total = 0`. Quant à `const n` dans un `for...of`, il est valide : une nouvelle liaison est créée à chaque itération.",
  },
  {
    id: 'q14',
    theme: 'scope',
    kind: 'qcm',
    q: 'Quelle affirmation sur `const` est vraie ?',
    choices: [
      'Un objet déclaré avec `const` ne peut pas être modifié',
      "`const` empêche la réaffectation de la variable, mais pas la mutation de l'objet qu'elle référence",
      '`const` est hissé et initialisé à `undefined` comme `var`',
      '`const` a une portée de fonction',
    ],
    answer: 1,
    why: "`const` rend la **liaison** immuable : `obj = {}` lève une `TypeError`, mais `obj.a = 1` ou `arr.push(1)` restent permis. Pour geler le contenu, il faut `Object.freeze` (superficiel). Comme `let`, `const` a une portée de bloc et une TDZ.",
  },

  // ───────────── closures ─────────────
  {
    id: 'q15',
    theme: 'closures',
    kind: 'output',
    q: OUT,
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))`,
    choices: [
      'var 0\nvar 1\nvar 2\nlet 0\nlet 1\nlet 2',
      'var 3\nvar 3\nvar 3\nlet 3\nlet 3\nlet 3',
      'var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2',
      'var 2\nvar 2\nvar 2\nlet 0\nlet 1\nlet 2',
    ],
    answer: 2,
    why: "Les callbacks s'exécutent après la fin des boucles. Avec `var`, il n'existe qu'**une seule** variable `i`, partagée par toutes les closures, qui vaut `3` à la fin. Avec `let` dans l'en-tête d'un `for`, une nouvelle liaison `j` est créée à chaque itération : chaque closure capture sa propre valeur.",
  },
  {
    id: 'q16',
    theme: 'closures',
    kind: 'output',
    q: OUT,
    code: `function makeCounter() {
  let count = 0
  return () => ++count
}
const a = makeCounter()
const b = makeCounter()
a()
a()
console.log(a(), b())`,
    choices: ['3 1', '3 4', '1 1', '2 1'],
    answer: 0,
    why: "Chaque appel à `makeCounter` crée un nouvel environnement avec son propre `count`. La fonction retournée le capture (closure) : `a` et `b` ont des compteurs indépendants. `a` a déjà été appelé deux fois, le troisième appel renvoie `3`, et le premier appel de `b` renvoie `1`.",
  },
  {
    id: 'q17',
    theme: 'closures',
    kind: 'output',
    q: OUT,
    code: `const makeAdder = (x) => (y) => x + y
const add5 = makeAdder(5)
let x = 100
console.log(add5(2), makeAdder(10)(1))`,
    choices: ['102 101', '7 11', '7 101', 'NaN NaN'],
    answer: 1,
    why: "La portée est **lexicale** : `x` dans la fonction interne désigne le paramètre de `makeAdder`, capturé au moment de la création, pas le `x` global déclaré plus tard. `add5(2)` vaut `5 + 2`, et `makeAdder(10)(1)` vaut `11`.",
  },
  {
    id: 'q18',
    theme: 'closures',
    kind: 'bug',
    q: BUG,
    code: `var buttons = []
for (var i = 0; i < 3; i++) {
  buttons.push(function () { return 'bouton ' + i })
}
// on attend « bouton 0 », mais :
buttons[0]() // 'bouton 3'`,
    choices: [
      "`push` copie la fonction, il faudrait `concat`",
      "`var i` est unique pour toute la boucle : toutes les fonctions lisent la même variable, qui vaut 3 après la boucle. Il faut `let i`",
      "Il faut appeler la fonction au moment du `push`",
      "Les fonctions anonymes ne capturent pas les variables",
    ],
    answer: 1,
    why: "Une closure capture la **variable**, pas sa valeur. Avec `var`, il n'y a qu'un `i` pour toutes les itérations. Remplacer par `let i` crée une liaison par itération ; l'ancienne solution était une IIFE (`(function (j) { ... })(i)`) qui fige la valeur dans un paramètre.",
  },
  {
    id: 'q19',
    theme: 'closures',
    kind: 'qcm',
    q: "Qu'est-ce qu'une closure ?",
    choices: [
      'Une fonction qui se termine immédiatement après son appel',
      "Une fonction associée à l'environnement lexical où elle a été créée, ce qui lui permet d'accéder à ses variables même après la fin de la fonction englobante",
      "Une fonction qui ne peut pas accéder aux variables globales",
      "Un objet créé avec `Object.freeze`",
    ],
    answer: 1,
    why: "Toute fonction JavaScript garde une référence vers la portée où elle a été définie. Si elle survit à la fonction englobante (retournée, passée en callback), les variables capturées restent vivantes. Usages : données privées, fabriques (`makeCounter`), mémoïsation, `debounce`. Revers : une closure qui retient un gros objet l'empêche d'être collecté.",
  },
  {
    id: 'q20',
    theme: 'closures',
    kind: 'qcm',
    q: 'Comment obtenir une variable vraiment privée sans classe ?',
    choices: [
      'La préfixer par `_`',
      'La déclarer avec `const` dans un objet',
      "La déclarer dans une fonction fabrique et n'exposer que des fonctions qui la lisent ou la modifient (pattern module)",
      "Utiliser `Object.seal`",
    ],
    answer: 2,
    why: "Une variable locale à une fonction est inaccessible de l'extérieur ; seules les closures retournées y ont accès. C'est le **module pattern** (ou fabrique). Le préfixe `_` n'est qu'une convention. Dans une classe, l'équivalent natif est le champ privé `#count`.",
  },

  // ───────────── this ─────────────
  {
    id: 'q21',
    theme: 'this',
    kind: 'output',
    q: OUT,
    code: `var label = 'global'
const obj = {
  label: 'obj',
  getLabel() { return this.label },
}
const detached = obj.getLabel
console.log(obj.getLabel(), detached())`,
    choices: ['obj obj', 'obj undefined', 'obj global', 'Uncaught TypeError: Cannot read properties of undefined (reading \'label\')'],
    answer: 2,
    why: "`this` dépend de **la façon dont la fonction est appelée**, pas de l'endroit où elle est définie. `obj.getLabel()` : `this` vaut `obj`. `detached()` est un appel simple : en mode non strict, `this` vaut l'objet global, et `var label` au niveau global en est une propriété. En mode strict, `this` serait `undefined` et l'appel lèverait une `TypeError`.",
  },
  {
    id: 'q22',
    theme: 'this',
    kind: 'output',
    q: OUT,
    code: `const o = {
  v: 1,
  arrow: () => typeof this.v,
  method() { return this.v },
}
console.log(o.arrow(), o.method())`,
    choices: ['number 1', 'undefined 1', 'undefined undefined', 'number undefined'],
    answer: 1,
    why: "Une fonction fléchée n'a pas son propre `this` : elle prend celui de la portée englobante au moment de sa définition. Ici c'est la portée globale (un littéral d'objet ne crée pas de portée), donc `this` est l'objet global, qui n'a pas de `v`. La méthode classique reçoit `o` comme `this`.",
  },
  {
    id: 'q23',
    theme: 'this',
    kind: 'output',
    q: OUT,
    code: `function show() { return this.x }
const a = { x: 1 }
const b = { x: 2 }
const bound = show.bind(a)
console.log(show.call(b), bound.call(b), bound.bind(b)())`,
    choices: ['2 2 2', '2 1 2', '1 1 1', '2 1 1'],
    answer: 3,
    why: "`call` fixe `this` pour un appel. `bind` crée une nouvelle fonction dont le `this` est définitivement fixé : ni `call`, ni `apply`, ni un second `bind` ne peuvent le changer. Seul `new` passe outre un `bind`.",
  },
  {
    id: 'q24',
    theme: 'this',
    kind: 'output',
    q: OUT,
    code: `const timer = {
  seconds: 42,
  start() {
    setTimeout(() => console.log('fléchée', this.seconds))
    setTimeout(function () { console.log('classique', this.seconds) })
  },
}
timer.start()`,
    choices: ['fléchée 42\nclassique 42', 'fléchée undefined\nclassique 42', 'fléchée 42\nclassique undefined', 'fléchée undefined\nclassique undefined'],
    answer: 2,
    why: "La fléchée capture le `this` de `start`, c'est-à-dire `timer`. La fonction classique est appelée plus tard par le minuteur comme une fonction simple : son `this` n'est plus `timer` (c'est l'objet global dans un navigateur), qui n'a pas de propriété `seconds`. C'est le cas d'usage typique des fonctions fléchées.",
  },
  {
    id: 'q25',
    theme: 'this',
    kind: 'bug',
    q: BUG,
    code: `class Counter {
  count = 0
  inc() { this.count++ }
}
const c = new Counter()
;[1, 2, 3].forEach(c.inc)
// Uncaught TypeError: Cannot read properties of undefined (reading 'count')`,
    choices: [
      "Les champs de classe (`count = 0`) ne sont pas supportés",
      "`c.inc` est passé détaché : `forEach` l'appelle sans receveur et, le corps d'une classe étant en mode strict, `this` vaut `undefined`",
      "Il faut déclarer `count` dans le constructeur",
      "`forEach` ne passe pas d'argument à la fonction",
    ],
    answer: 1,
    why: "Passer `c.inc` en callback ne transmet que la fonction, pas l'objet. Le code des classes est toujours en mode strict, donc `this` vaut `undefined` au lieu de l'objet global. Solutions : `forEach(() => c.inc())`, `forEach(c.inc, c)`, `c.inc.bind(c)`, ou définir la méthode en champ fléché `inc = () => { this.count++ }`.",
  },
  {
    id: 'q26',
    theme: 'this',
    kind: 'qcm',
    q: 'Dans quel ordre de priorité `this` est-il déterminé pour une fonction classique ?',
    choices: [
      'Appel simple > méthode > `call`/`bind` > `new`',
      '`new` > liaison explicite (`bind`, `call`, `apply`) > appel comme méthode (`obj.f()`) > appel simple (global ou `undefined` en strict)',
      "`this` est toujours l'objet dans lequel la fonction est écrite",
      'Liaison explicite > `new` > méthode > appel simple',
    ],
    answer: 1,
    why: "`new` crée un nouvel objet et l'utilise comme `this`, même sur une fonction liée par `bind`. Ensuite viennent `bind`/`call`/`apply`, puis le receveur implicite (`obj.f()`), et enfin l'appel simple. Les fonctions fléchées sortent de ce schéma : leur `this` est lexical.",
  },

  // ───────────── prototypes ─────────────
  {
    id: 'q27',
    theme: 'prototypes',
    kind: 'output',
    q: OUT,
    code: `function Animal(nickname) { this.nickname = nickname }
Animal.prototype.speak = function () { return this.nickname + ' parle' }
const d = new Animal('Rex')
console.log(d.speak(), d.hasOwnProperty('speak'), 'speak' in d)`,
    choices: ['Rex parle true true', 'Rex parle false true', 'Rex parle false false', 'undefined parle false true'],
    answer: 1,
    why: "`speak` n'est pas copiée sur l'instance : elle vit sur `Animal.prototype`, et `d` y accède via la **chaîne de prototypes**. `hasOwnProperty` ne regarde que les propriétés propres (`false`), alors que l'opérateur `in` parcourt toute la chaîne (`true`).",
  },
  {
    id: 'q28',
    theme: 'prototypes',
    kind: 'output',
    q: OUT,
    code: `class A { hi() { return 'A' } }
class B extends A { hi() { return 'B>' + super.hi() } }
const b = new B()
console.log(b.hi(), b instanceof A, Object.getPrototypeOf(B.prototype) === A.prototype)`,
    choices: ['B>A true true', 'B>A false true', 'B true false', 'A true true'],
    answer: 0,
    why: "`extends` relie `B.prototype` à `A.prototype` : la chaîne est `b` → `B.prototype` → `A.prototype` → `Object.prototype`. `super.hi()` appelle la méthode du parent. `instanceof` vérifie si `A.prototype` apparaît dans la chaîne de prototypes de `b`.",
  },
  {
    id: 'q29',
    theme: 'prototypes',
    kind: 'output',
    q: OUT,
    code: `const base = { greet() { return 'salut' }, kind: 'base' }
const child = Object.create(base)
child.kind = 'child'
delete child.kind
console.log(child.kind, child.greet(), Object.keys(child))`,
    choices: ['undefined salut []', "child salut [ 'kind' ]", 'base salut []', "base salut [ 'greet', 'kind' ]"],
    answer: 2,
    why: "`Object.create(base)` crée un objet vide dont le prototype est `base`. Écrire `child.kind` crée une propriété propre qui **masque** celle du prototype ; la supprimer fait réapparaître `base.kind`. `Object.keys` ne liste que les propriétés propres énumérables, donc `[]`.",
  },
  {
    id: 'q30',
    theme: 'prototypes',
    kind: 'bug',
    q: BUG,
    code: `class Shape {
  constructor() { this.kind = 'shape' }
}
class Circle extends Shape {
  constructor(r) {
    this.r = r
    super()
  }
}
new Circle(2)`,
    choices: [
      "Une classe fille ne peut pas avoir de constructeur",
      "`this` est utilisé avant `super()` : dans une classe dérivée, l'instance n'existe pas tant que le constructeur parent n'a pas été appelé (ReferenceError)",
      "Il faut passer `r` à `super(r)`",
      "`kind` doit être déclaré en champ de classe",
    ],
    answer: 1,
    why: "Dans un constructeur de classe dérivée, c'est `super()` qui crée et initialise `this`. Tout accès à `this` avant lève `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`. Il faut appeler `super()` en premier.",
  },
  {
    id: 'q31',
    theme: 'prototypes',
    kind: 'qcm',
    q: 'Que sont réellement les classes ES6 ?',
    choices: [
      "Un nouveau modèle objet basé sur des classes, comme en Java",
      "Principalement du sucre syntaxique sur les fonctions constructrices et les prototypes, avec quelques différences (mode strict, pas de hoisting utilisable, appel sans `new` interdit)",
      "Des objets gelés avec `Object.freeze`",
      "Des fonctions fléchées nommées",
    ],
    answer: 1,
    why: "`typeof MaClasse` vaut `'function'` et les méthodes sont posées sur `MaClasse.prototype`. Les classes ajoutent toutefois de vraies garanties : corps en mode strict, TDZ (pas utilisables avant leur déclaration), `TypeError` si appelées sans `new`, méthodes non énumérables, champs privés `#x`.",
  },

  // ───────────── eventloop ─────────────
  {
    id: 'q32',
    theme: 'eventloop',
    kind: 'output',
    q: OUT,
    code: `console.log(1)
setTimeout(() => console.log(2))
Promise.resolve().then(() => console.log(3))
console.log(4)`,
    choices: ['1\n2\n3\n4', '1\n4\n2\n3', '1\n3\n4\n2', '1\n4\n3\n2'],
    answer: 3,
    why: "Le code synchrone s'exécute d'abord (`1`, `4`). Une fois la pile vide, la boucle d'événements vide **toute** la file des microtâches (callbacks de promesses : `3`) avant de prendre la tâche suivante (le minuteur : `2`).",
  },
  {
    id: 'q33',
    theme: 'eventloop',
    kind: 'output',
    q: OUT,
    code: `async function run() {
  console.log('a')
  await null
  console.log('b')
}
console.log('start')
run()
console.log('end')`,
    choices: ['start\na\nb\nend', 'start\na\nend\nb', 'start\nend\na\nb', 'a\nstart\nend\nb'],
    answer: 1,
    why: "Une fonction `async` s'exécute de manière **synchrone** jusqu'au premier `await`. `await` suspend la fonction et programme la suite comme une microtâche, même si la valeur attendue n'est pas une promesse. `end` s'affiche donc avant `b`.",
  },
  {
    id: 'q34',
    theme: 'eventloop',
    kind: 'output',
    q: OUT,
    code: `setTimeout(() => console.log('t1'))
Promise.resolve()
  .then(() => {
    console.log('p1')
    setTimeout(() => console.log('t2'))
  })
  .then(() => console.log('p2'))
queueMicrotask(() => console.log('m'))`,
    choices: ['p1\np2\nm\nt1\nt2', 'p1\nm\np2\nt1\nt2', 't1\np1\nm\np2\nt2', 'm\np1\np2\nt1\nt2'],
    answer: 1,
    why: "Au départ, la file de microtâches contient le premier `then` puis `m`. Le premier `then` affiche `p1`, programme `t2` et, en se terminant, met le second `then` en fin de file, **derrière** `m`. Une fois les microtâches épuisées, les minuteurs s'exécutent dans leur ordre de création : `t1` puis `t2`.",
  },
  {
    id: 'q35',
    theme: 'eventloop',
    kind: 'output',
    q: OUT,
    code: `new Promise((resolve) => {
  console.log('executor')
  resolve('ok')
  console.log('après resolve')
}).then((v) => console.log(v))
console.log('sync')`,
    choices: ['executor\nsync\nok\naprès resolve', 'executor\naprès resolve\nsync\nok', 'sync\nexecutor\naprès resolve\nok', 'executor\nok\naprès resolve\nsync'],
    answer: 1,
    why: "La fonction passée à `new Promise` (l'exécuteur) s'exécute immédiatement et de façon synchrone. `resolve` n'interrompt pas l'exécuteur : la ligne suivante s'exécute aussi. Le callback du `then` est une microtâche, exécutée après le code synchrone.",
  },
  {
    id: 'q36',
    theme: 'eventloop',
    kind: 'output',
    q: OUT,
    code: `async function first() {
  console.log('1')
  await second()
  console.log('2')
}
async function second() { console.log('3') }
first()
Promise.resolve().then(() => console.log('4'))
console.log('5')`,
    choices: ['1\n3\n5\n2\n4', '1\n3\n2\n5\n4', '1\n3\n5\n4\n2', '1\n5\n3\n2\n4'],
    answer: 0,
    why: "`first` affiche `1` puis appelle `second`, qui s'exécute aussitôt et affiche `3`. `second()` renvoie une promesse déjà résolue, donc la suite de `first` (après `await`) est mise en microtâche **avant** le `then` qui affiche `4`. Le code synchrone affiche `5`, puis les microtâches s'exécutent dans l'ordre : `2`, `4`.",
  },
  {
    id: 'q37',
    theme: 'eventloop',
    kind: 'qcm',
    q: "Que se passe-t-il pour un `setTimeout(fn, 0)` si le code synchrone qui suit prend 2 secondes ?",
    choices: [
      '`fn` interrompt le code synchrone au bout de 0 ms',
      "`fn` s'exécute après environ 2 secondes, une fois la pile d'appels vide et les microtâches traitées",
      "`fn` est annulé car le délai est dépassé",
      "`fn` s'exécute dans un autre thread en parallèle",
    ],
    answer: 1,
    why: "JavaScript est mono-thread et une tâche s'exécute toujours jusqu'au bout. Le délai d'un minuteur est un **minimum** : le callback n'est placé dans la file des tâches qu'après le délai, et n'est exécuté que lorsque la pile est vide et que les microtâches sont vidées. Un long calcul synchrone bloque donc minuteurs, événements et rendu.",
  },
  {
    id: 'q38',
    theme: 'eventloop',
    kind: 'qcm',
    q: 'Lequel de ces callbacks est une **microtâche** ?',
    choices: ['`setTimeout(fn)`', '`setInterval(fn, 10)`', '`promise.then(fn)`', "Un gestionnaire d'événement `click`"],
    answer: 2,
    why: "Les microtâches regroupent les réactions de promesses (`then`, `catch`, `finally`, suite d'un `await`), `queueMicrotask` et `MutationObserver`. Minuteurs, événements utilisateur et messages sont des tâches (macrotâches). Après chaque tâche, la file des microtâches est vidée entièrement, y compris celles ajoutées pendant ce vidage.",
  },

  // ───────────── async ─────────────
  {
    id: 'q39',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `Promise.all([Promise.resolve(1), Promise.reject(new Error('x')), Promise.resolve(3)])
  .then((v) => console.log('ok', v))
  .catch((e) => console.log('erreur', e.message))`,
    choices: ['ok [ 1, 3 ]', 'erreur x', 'ok [ 1, undefined, 3 ]', "ok [ 1, Error: x, 3 ]"],
    answer: 1,
    why: "`Promise.all` rejette dès que **l'une** des promesses rejette, avec cette raison ; les résultats des autres sont perdus. Pour obtenir le résultat de chacune, réussite ou échec, on utilise `Promise.allSettled`.",
  },
  {
    id: 'q40',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('x'))])
  .then((results) => console.log(results.map((r) => r.status)))`,
    choices: ["[ 'fulfilled', 'rejected' ]", "[ 'resolved', 'rejected' ]", "[ 'ok', 'error' ]", 'Uncaught (in promise) Error: x'],
    answer: 0,
    why: "`Promise.allSettled` ne rejette jamais : elle attend que toutes les promesses soient terminées et renvoie un tableau d'objets `{ status: 'fulfilled', value }` ou `{ status: 'rejected', reason }`. Le rejet est considéré comme géré, il n'y a donc pas d'erreur non gérée.",
  },
  {
    id: 'q41',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `const wait = (ms, v) => new Promise((resolve) => setTimeout(() => resolve(v), ms))
Promise.race([wait(50, 'lent'), wait(10, 'rapide')]).then((v) => console.log(v))
Promise.any([Promise.reject(new Error('a')), wait(20, 'b')]).then((v) => console.log(v))`,
    choices: ['lent\nb', 'rapide\nb', 'rapide\nUncaught (in promise) Error: a', 'b\nrapide'],
    answer: 1,
    why: "`Promise.race` adopte le résultat de la **première promesse terminée**, réussite ou échec : `'rapide'` après 10 ms. `Promise.any` ignore les rejets et renvoie la première réussite : `'b'` après 20 ms ; elle ne rejette (avec une `AggregateError`) que si toutes échouent.",
  },
  {
    id: 'q42',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `async function boom() { throw new Error('boom') }
boom()
console.log('après')`,
    choices: ['Uncaught Error: boom', 'Uncaught Error: boom\naprès', 'après\nUncaught (in promise) Error: boom', 'après'],
    answer: 2,
    why: "Une exception levée dans une fonction `async` ne remonte pas de façon synchrone : elle **rejette la promesse** renvoyée. Le code continue (`après`), puis, faute de `await` ou de `.catch`, le rejet est signalé comme non géré (`Uncaught (in promise)`).",
  },
  {
    id: 'q43',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `Promise.resolve(1)
  .finally(() => {
    console.log('finally')
    return 2
  })
  .then((v) => console.log(v))`,
    choices: ['finally\n2', 'finally\n1', '1\nfinally', 'finally\nundefined'],
    answer: 1,
    why: "`finally` ne reçoit aucun argument et sa valeur de retour est **ignorée** : la valeur (ou l'erreur) d'origine est transmise telle quelle à la suite de la chaîne. Seule exception : si le callback de `finally` lève une erreur (ou renvoie une promesse rejetée), ce rejet remplace le résultat.",
  },
  {
    id: 'q44',
    theme: 'async',
    kind: 'output',
    q: OUT,
    code: `async function getValue() {
  try {
    return await Promise.reject(new Error('raté'))
  } catch (e) {
    return 'récupéré : ' + e.message
  } finally {
    console.log('nettoyage')
  }
}
getValue().then((v) => console.log(v))`,
    choices: ['récupéré : raté\nnettoyage', 'nettoyage\nrécupéré : raté', 'nettoyage\nUncaught (in promise) Error: raté', 'récupéré : raté'],
    answer: 1,
    why: "Grâce à `await`, le rejet devient une exception attrapée par le `catch`. Le `finally` s'exécute avant que la fonction ne rende effectivement sa valeur, donc `nettoyage` s'affiche d'abord. La promesse se résout ensuite avec la valeur du `catch`.",
  },
  {
    id: 'q45',
    theme: 'async',
    kind: 'bug',
    q: BUG,
    code: `const getPrice = async (id) => id * 10

async function total(ids) {
  let sum = 0
  ids.forEach(async (id) => {
    sum += await getPrice(id)
  })
  return sum
}
total([1, 2, 3]).then(console.log) // 0 au lieu de 60`,
    choices: [
      "`getPrice` devrait renvoyer une promesse explicite",
      "`forEach` n'attend pas les callbacks async : il les lance et `total` renvoie `sum` avant qu'aucun `await` ne soit terminé",
      "`sum` devrait être déclaré avec `const`",
      "Il manque `await` devant `total`",
    ],
    answer: 1,
    why: "`forEach` ignore les promesses renvoyées par son callback. On utilise une boucle `for...of` avec `await` (séquentiel), ou `const prices = await Promise.all(ids.map(getPrice))` (parallèle) puis une somme.",
  },
  {
    id: 'q46',
    theme: 'async',
    kind: 'bug',
    q: BUG,
    code: `async function load() {
  try {
    return fetchUser() // renvoie une promesse qui peut rejeter
  } catch (e) {
    return { error: e.message }
  }
}`,
    choices: [
      "`try/catch` est interdit dans une fonction `async`",
      "Sans `await`, la promesse est renvoyée telle quelle : si elle rejette, le rejet a lieu après la sortie du `try` et le `catch` ne l'attrape jamais. Il faut `return await fetchUser()`",
      "Il faut utiliser `.then` au lieu de `return`",
      "`e.message` n'existe pas sur les erreurs asynchrones",
    ],
    answer: 1,
    why: "Le `catch` n'attrape que ce qui se produit **pendant** l'exécution du bloc `try`. Renvoyer une promesse sans l'attendre quitte le bloc immédiatement ; l'appelant reçoit le rejet brut. `return await` dans un `try` est le cas où `await` est indispensable.",
  },
  {
    id: 'q47',
    theme: 'async',
    kind: 'qcm',
    q: "Que renvoie toujours une fonction déclarée avec `async` ?",
    choices: [
      'La valeur passée à `return`, directement',
      "Une promesse, résolue avec la valeur retournée ou rejetée avec l'exception levée",
      "`undefined` tant que tous les `await` ne sont pas terminés",
      'Un générateur',
    ],
    answer: 1,
    why: "Même `async function f() { return 1 }` renvoie `Promise<1>` : il faut `await f()` ou `f().then(...)` pour obtenir `1`. Une exception levée dans la fonction rejette cette promesse. Si la fonction retourne déjà une promesse, celle-ci est adoptée (pas de promesse imbriquée).",
  },
  {
    id: 'q48',
    theme: 'async',
    kind: 'qcm',
    q: 'Deux requêtes indépendantes `a()` et `b()` : quelle écriture est la plus rapide ?',
    choices: [
      'const x = await a(); const y = await b()',
      'const [x, y] = await Promise.all([a(), b()])',
      'Les deux ont la même durée',
      'await a().then(b)',
    ],
    answer: 1,
    why: "Deux `await` successifs attendent la fin de `a()` avant même de **lancer** `b()` : les durées s'additionnent. Avec `Promise.all`, les deux opérations démarrent ensemble et la durée totale est celle de la plus lente. `a().then(b)` est aussi séquentiel.",
  },

  // ───────────── es6 ─────────────
  {
    id: 'q49',
    theme: 'es6',
    kind: 'output',
    q: OUT,
    code: `const { a = 1, b = 2, c = 3 } = { a: undefined, b: null }
console.log(a, b, c)`,
    choices: ['1 2 3', 'undefined null 3', '1 null 3', '1 2 undefined'],
    answer: 2,
    why: "Une valeur par défaut de déstructuration (comme d'un paramètre) ne s'applique que si la valeur est **`undefined`** (absente ou explicitement `undefined`). `null` est une vraie valeur et est conservée.",
  },
  {
    id: 'q50',
    theme: 'es6',
    kind: 'output',
    q: OUT,
    code: `console.log(0 || 'x', 0 ?? 'x', null ?? 'y', '' || 'z', '' ?? 'z')`,
    choices: ['x 0 y z ', 'x x y z z', '0 0 y z ', 'x 0 y z z'],
    answer: 0,
    why: "`||` renvoie l'opérande droit dès que le gauche est **falsy** (`0`, `''`…). `??` (coalescence des nuls) ne le fait que si le gauche est `null` ou `undefined` : `0` et `''` sont conservés. La dernière valeur affichée est donc la chaîne vide.",
  },
  {
    id: 'q51',
    theme: 'es6',
    kind: 'output',
    q: OUT,
    code: `const user = { profile: null, getId: undefined }
console.log(user.profile?.email, user.settings?.theme ?? 'light', user.getId?.())`,
    choices: [
      "Uncaught TypeError: Cannot read properties of null (reading 'email')",
      'undefined light undefined',
      'null light undefined',
      'undefined undefined undefined',
    ],
    answer: 1,
    why: "Le chaînage optionnel `?.` court-circuite et renvoie `undefined` si ce qui précède est `null` ou `undefined`, au lieu de lever une erreur. Il fonctionne aussi pour les appels (`fn?.()`). Combiné avec `??`, il fournit une valeur par défaut.",
  },
  {
    id: 'q52',
    theme: 'es6',
    kind: 'bug',
    q: BUG,
    code: `const toUser = (id) => { id: id, active: true }
const users = [1, 2].map(toUser)`,
    choices: [
      "`map` ne peut pas recevoir une fonction fléchée",
      "Les accolades sont lues comme un corps de fonction, pas comme un objet : il faut entourer l'objet de parenthèses, `(id) => ({ id, active: true })`",
      "Il faut écrire `id: this.id`",
      "Il manque `new` devant l'objet",
    ],
    answer: 1,
    why: "Après `=>`, une accolade ouvre un **bloc**. Ici `id:` est alors interprété comme une étiquette (label) et la virgule suivante provoque une `SyntaxError` ; avec une seule propriété, la fonction renverrait silencieusement `undefined`. Les parenthèses forcent l'interprétation en expression.",
  },
  {
    id: 'q53',
    theme: 'es6',
    kind: 'qcm',
    q: 'Dans `function f(first, ...rest) {}` puis `f(...[1, 2, 3])`, que valent `first` et `rest` ?',
    choices: ['`first = [1, 2, 3]`, `rest = []`', '`first = 1`, `rest = [2, 3]`', '`first = 1`, `rest = 2`', '`first = 1`, `rest = { 0: 2, 1: 3 }`'],
    answer: 1,
    why: "À l'appel, `...` est l'opérateur **spread** : il étale le tableau en arguments séparés (`f(1, 2, 3)`). Dans la signature, `...` est le paramètre **rest** : il rassemble les arguments restants dans un vrai tableau. Même syntaxe, rôles inverses.",
  },
  {
    id: 'q54',
    theme: 'es6',
    kind: 'qcm',
    q: 'Quel est l\'avantage principal de `Map` sur un objet littéral comme dictionnaire ?',
    choices: [
      "Une `Map` est sérialisable directement avec `JSON.stringify`",
      "Les clés peuvent être de n'importe quel type (objets compris), l'ordre d'insertion est garanti, la taille est donnée par `size` et il n'y a pas de clés héritées du prototype",
      "Une `Map` est immuable",
      "Une `Map` utilise moins de mémoire dans tous les cas",
    ],
    answer: 1,
    why: "Un objet convertit ses clés en chaînes (ou symboles) et hérite de `Object.prototype` (risque avec des clés comme `constructor` ou `__proto__`). `Map` accepte toute valeur comme clé, garde l'ordre d'insertion et est optimisée pour les ajouts et suppressions fréquents. En revanche, `JSON.stringify(new Map())` donne `'{}'`.",
  },

  // ───────────── arrays ─────────────
  {
    id: 'q55',
    theme: 'arrays',
    kind: 'output',
    q: OUT,
    code: `console.log([10, 1, 2, 25].sort())
console.log([10, 1, 2, 25].sort((a, b) => a - b))`,
    choices: ['[ 1, 2, 10, 25 ]\n[ 1, 2, 10, 25 ]', '[ 1, 10, 2, 25 ]\n[ 1, 2, 10, 25 ]', '[ 25, 10, 2, 1 ]\n[ 1, 2, 10, 25 ]', '[ 1, 10, 2, 25 ]\n[ 25, 10, 2, 1 ]'],
    answer: 1,
    why: "Sans comparateur, `sort` convertit les éléments en **chaînes** et les trie dans l'ordre lexicographique : `'10'` vient avant `'2'`. Pour des nombres, il faut un comparateur `(a, b) => a - b` (négatif : `a` avant `b`).",
  },
  {
    id: 'q56',
    theme: 'arrays',
    kind: 'output',
    q: OUT,
    code: `console.log(['1', '7', '11'].map(parseInt))`,
    choices: ['[ 1, 7, 11 ]', '[ 1, NaN, 3 ]', '[ NaN, NaN, NaN ]', '[ 1, NaN, NaN ]'],
    answer: 1,
    why: "`map` appelle le callback avec `(element, index, array)`, et `parseInt` interprète son second argument comme la **base**. On obtient `parseInt('1', 0)` (base 0 = auto, donc 1), `parseInt('7', 1)` (base invalide : `NaN`) et `parseInt('11', 2)` (binaire : 3). Il faut écrire `map(Number)` ou `map((s) => parseInt(s, 10))`.",
  },
  {
    id: 'q57',
    theme: 'arrays',
    kind: 'output',
    q: OUT,
    code: `const a = [3, 1, 2]
const b = a.sort()
console.log(a === b, a)
const c = [3, 1, 2]
const d = c.toSorted()
console.log(c, d)`,
    choices: [
      'false [ 3, 1, 2 ]\n[ 3, 1, 2 ] [ 1, 2, 3 ]',
      'true [ 1, 2, 3 ]\n[ 1, 2, 3 ] [ 1, 2, 3 ]',
      'true [ 1, 2, 3 ]\n[ 3, 1, 2 ] [ 1, 2, 3 ]',
      'false [ 1, 2, 3 ]\n[ 3, 1, 2 ] [ 1, 2, 3 ]',
    ],
    answer: 2,
    why: "`sort` trie **en place** et renvoie le même tableau (`a === b`). `toSorted` (ES2023) renvoie une copie triée sans toucher l'original, tout comme `toReversed`, `toSpliced` et `with`. Avant ES2023, on écrivait `[...c].sort()`.",
  },
  {
    id: 'q58',
    theme: 'arrays',
    kind: 'output',
    q: OUT,
    code: `const arr = [1, 2, 3]
arr[5] = 6
console.log(arr.length, arr.filter(() => true).length)
arr.length = 2
console.log(arr)`,
    choices: ['4 4\n[ 1, 2 ]', '6 6\n[ 1, 2 ]', '6 4\n[ 1, 2 ]', '6 4\n[ 1, 2, 3, 6 ]'],
    answer: 2,
    why: "Affecter l'index 5 crée des **trous** aux index 3 et 4 : `length` vaut toujours le plus grand index + 1. Les méthodes comme `filter`, `map` ou `forEach` sautent les trous, d'où 4 éléments. Réduire `length` tronque réellement le tableau.",
  },
  {
    id: 'q59',
    theme: 'arrays',
    kind: 'output',
    q: OUT,
    code: `console.log([1, 2, 3].reduce((acc, n) => acc + n))
console.log([].reduce((acc, n) => acc + n))`,
    choices: ['6\n0', '6\nundefined', 'Uncaught TypeError: Reduce of empty array with no initial value', '6\nUncaught TypeError: Reduce of empty array with no initial value'],
    answer: 3,
    why: "Sans valeur initiale, `reduce` prend le premier élément comme accumulateur et commence au second. Sur un tableau vide, il n'y a rien à prendre : `TypeError`. Il faut toujours fournir une valeur initiale (`reduce(fn, 0)`), ce qui évite aussi les surprises de type.",
  },
  {
    id: 'q60',
    theme: 'arrays',
    kind: 'bug',
    q: BUG,
    code: `function firstTwo(list) {
  return list.splice(0, 2)
}
const items = ['a', 'b', 'c', 'd']
const head = firstTwo(items)
// head est correct, mais items vaut maintenant [ 'c', 'd' ]`,
    choices: [
      "`splice` renvoie le tableau d'origine",
      "`splice` modifie le tableau en place en retirant les éléments ; pour une extraction sans effet de bord il faut `slice(0, 2)`",
      "Les index de `splice` commencent à 1",
      "Il faut copier le résultat avec `[...head]`",
    ],
    answer: 1,
    why: "`splice(start, count)` **mute** le tableau (retire et éventuellement insère) et renvoie les éléments retirés. `slice(start, end)` renvoie une copie partielle sans toucher l'original. Une fonction qui mute ses arguments est une source classique de bugs, notamment avec l'état React.",
  },
  {
    id: 'q61',
    theme: 'arrays',
    kind: 'qcm',
    q: 'Laquelle de ces méthodes ne modifie **pas** le tableau sur lequel elle est appelée ?',
    choices: ['`reverse()`', '`splice()`', '`concat()`', '`fill()`'],
    answer: 2,
    why: "`concat`, `slice`, `map`, `filter`, `toSorted`, `toReversed`, `with` renvoient un nouveau tableau. `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` et `copyWithin` modifient le tableau en place.",
  },
  {
    id: 'q62',
    theme: 'arrays',
    kind: 'qcm',
    q: 'Quelle expression vaut `true` ?',
    choices: ['`[NaN].indexOf(NaN) !== -1`', '`[NaN].includes(NaN)`', '`[{ id: 1 }].includes({ id: 1 })`', '`[1, 2] === [1, 2]`'],
    answer: 1,
    why: "`includes` utilise l'algorithme **SameValueZero**, qui considère `NaN` égal à `NaN`, alors qu'`indexOf` utilise `===`. Les objets et tableaux sont comparés par **référence** : deux littéraux identiques sont deux objets distincts. Pour chercher un objet par contenu, on utilise `some((u) => u.id === 1)`.",
  },

  // ───────────── objects ─────────────
  {
    id: 'q63',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `const a = { x: { y: 1 } }
const b = { ...a }
b.x.y = 2
b.z = 3
console.log(a)`,
    choices: ['{ x: { y: 1 } }', '{ x: { y: 2 } }', '{ x: { y: 2 }, z: 3 }', '{ x: { y: 1 }, z: 3 }'],
    answer: 1,
    why: "Le spread fait une copie **superficielle** : `b` est un nouvel objet (ajouter `z` ne touche pas `a`), mais `b.x` et `a.x` référencent le même objet imbriqué. Modifier `b.x.y` modifie donc aussi `a.x.y`. Pour une copie profonde : `structuredClone(a)`.",
  },
  {
    id: 'q64',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `console.log(JSON.stringify({ a: undefined, b: () => 1, c: null, d: NaN, e: [undefined] }))`,
    choices: [
      '{"a":null,"b":null,"c":null,"d":null,"e":[null]}',
      '{"c":null,"d":null,"e":[null]}',
      '{"c":null,"d":NaN,"e":[]}',
      '{"a":undefined,"c":null,"d":null,"e":[undefined]}',
    ],
    answer: 1,
    why: "`JSON.stringify` **omet** les propriétés dont la valeur est `undefined`, une fonction ou un symbole. Dans un tableau, ces valeurs deviennent `null` pour préserver les index. `NaN` et `Infinity` n'existent pas en JSON et deviennent `null`.",
  },
  {
    id: 'q65',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `const config = Object.freeze({ level: 1, inner: { level: 1 } })
config.level = 2
config.inner.level = 2
console.log(config.level, config.inner.level, Object.isFrozen(config.inner))`,
    choices: ['1 1 true', '2 2 false', '1 2 false', "Uncaught TypeError: Cannot assign to read only property 'level' of object '#<Object>'"],
    answer: 2,
    why: "`Object.freeze` est **superficiel** : les propriétés directes deviennent non modifiables, mais les objets imbriqués ne sont pas gelés. En mode non strict, l'affectation sur l'objet gelé échoue silencieusement ; en mode strict, elle lèverait une `TypeError`.",
  },
  {
    id: 'q66',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `function update(obj) {
  obj.v = 2
  obj = { v: 3 }
  obj.v = 4
}
const p = { v: 1 }
update(p)
console.log(p.v)`,
    choices: ['1', '2', '3', '4'],
    answer: 1,
    why: "JavaScript passe les arguments **par valeur**, mais pour un objet cette valeur est une référence. `obj.v = 2` modifie l'objet partagé. Réaffecter `obj` ne fait que pointer le paramètre local vers un nouvel objet : `p` n'est plus concerné par la suite.",
  },
  {
    id: 'q67',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `console.log(Object.keys({ b: 1, 2: 1, a: 1, 1: 1 }))`,
    choices: ["[ 'b', '2', 'a', '1' ]", "[ '1', '2', 'a', 'b' ]", "[ '1', '2', 'b', 'a' ]", "[ 'b', 'a', '1', '2' ]"],
    answer: 2,
    why: "L'ordre des clés d'un objet est spécifié : d'abord les clés de type **index entier** en ordre croissant, puis les autres chaînes dans l'ordre d'insertion (puis les symboles). Les clés numériques sont toujours converties en chaînes.",
  },
  {
    id: 'q68',
    theme: 'objects',
    kind: 'output',
    q: OUT,
    code: `const original = { date: new Date(0), list: [1] }
const json = JSON.parse(JSON.stringify(original))
const clone = structuredClone(original)
clone.list.push(2)
console.log(typeof json.date, clone.date.getTime(), original.list)`,
    choices: ['object 0 [ 1, 2 ]', 'string 0 [ 1 ]', 'string NaN [ 1 ]', 'object 0 [ 1 ]'],
    answer: 1,
    why: "L'aller-retour JSON transforme une `Date` en chaîne ISO (et perd `undefined`, `Map`, `Set`, les références circulaires). `structuredClone` fait une vraie copie profonde qui préserve `Date` (d'où `getTime()` disponible), `Map`, `Set` et les cycles ; le tableau copié est indépendant de l'original. Il ne copie pas les fonctions ni les prototypes de classes.",
  },
  {
    id: 'q69',
    theme: 'objects',
    kind: 'bug',
    q: BUG,
    code: `const defaults = { theme: 'light', options: { sound: true } }
function makeSettings() {
  return Object.assign({}, defaults)
}
const s1 = makeSettings()
s1.options.sound = false
makeSettings().options.sound // false !`,
    choices: [
      "`Object.assign` renvoie `defaults` lui-même",
      "`Object.assign` (comme le spread) copie superficiellement : `options` est partagé entre `defaults` et toutes les copies. Il faut une copie profonde, par exemple `structuredClone(defaults)`",
      "Il faut appeler `Object.freeze(defaults)` pour que la copie fonctionne",
      "`Object.assign` ne copie pas les booléens",
    ],
    answer: 1,
    why: "Le premier argument `{}` est bien un nouvel objet, mais la valeur de `options` copiée est une **référence** vers le même objet imbriqué. Le muter via `s1` contamine `defaults`. Solutions : `structuredClone(defaults)`, ou recopier explicitement chaque niveau (`{ ...defaults, options: { ...defaults.options } }`).",
  },
  {
    id: 'q70',
    theme: 'objects',
    kind: 'qcm',
    q: "Comment tester qu'un objet possède une propriété **propre** `key` (pas héritée) ?",
    choices: ["`'key' in obj`", '`obj.key !== undefined`', "`Object.hasOwn(obj, 'key')`", '`obj.key in Object`'],
    answer: 2,
    why: "`Object.hasOwn` (ES2022, remplaçant sûr de `obj.hasOwnProperty`) ne regarde que les propriétés propres et fonctionne même sur `Object.create(null)`. `in` inclut la chaîne de prototypes, et `obj.key !== undefined` échoue si la propriété existe avec la valeur `undefined`.",
  },

  // ───────────── modules ─────────────
  {
    id: 'q71',
    theme: 'modules',
    kind: 'qcm',
    q: 'Quelle différence essentielle existe entre les modules ES (`import`/`export`) et CommonJS (`require`/`module.exports`) ?',
    choices: [
      "Aucune, `import` est une simple réécriture de `require`",
      "Les imports ESM sont statiques (analysés avant exécution, ce qui permet le tree shaking) et sont des liaisons vivantes ; `require` est un appel dynamique qui renvoie une copie de la valeur exportée à cet instant",
      "CommonJS fonctionne dans les navigateurs, pas ESM",
      "ESM charge les modules de façon synchrone, CommonJS de façon asynchrone",
    ],
    answer: 1,
    why: "Les déclarations `import` sont hissées et résolues avant l'exécution : les outils peuvent éliminer le code mort. Elles exposent des **live bindings** en lecture seule. `require` s'exécute à l'endroit où il est appelé, de façon synchrone, et renvoie l'objet `module.exports`. ESM est aussi en mode strict par défaut et supporte le `await` au niveau supérieur.",
  },
  {
    id: 'q72',
    theme: 'modules',
    kind: 'qcm',
    q: "Le module `counter.js` contient `export let count = 0` et `export function inc() { count++ }`. Un autre module fait `import { count, inc } from './counter.js'`, appelle `inc()`, puis lit `count`. Que vaut `count` ?",
    choices: ['`0`, car l\'import est une copie', '`1`, car un import ESM est une liaison vivante vers la variable exportée', '`undefined`', "Une erreur, car on ne peut pas exporter un `let`"],
    answer: 1,
    why: "Un import ESM n'est pas une copie mais une **vue** sur la variable du module exportateur : après `inc()`, `count` vaut `1`. En revanche, l'importateur ne peut pas réaffecter `count` (`TypeError: Assignment to constant variable`). Avec CommonJS, on aurait récupéré la valeur `0` au moment du `require`.",
  },
  {
    id: 'q73',
    theme: 'modules',
    kind: 'bug',
    q: BUG,
    code: `<!-- index.html -->
<script src="app.js"></script>

// app.js
import { format } from './utils.js'
console.log(format(42))`,
    choices: [
      "Il faut écrire `require('./utils.js')`",
      "La balise `script` n'a pas `type=\"module\"` : le fichier est chargé comme script classique et `import` provoque « SyntaxError: Cannot use import statement outside a module »",
      "L'extension `.js` est interdite dans un import",
      "Il faut un import par défaut : `import format from './utils.js'`",
    ],
    answer: 1,
    why: "Dans le navigateur, seuls les scripts déclarés avec `type=\"module\"` peuvent utiliser `import`/`export`. Ces scripts sont différés par défaut, en mode strict, avec leur propre portée (pas de variables globales implicites), et doivent être servis en HTTP (pas en `file://`) à cause de CORS.",
  },
  {
    id: 'q74',
    theme: 'modules',
    kind: 'qcm',
    q: 'À quoi sert `import()` (import dynamique) ?',
    choices: [
      "À importer un module de façon synchrone dans une condition",
      "À charger un module à la demande : il renvoie une promesse du namespace du module, ce qui permet le découpage du code (code splitting) et le chargement paresseux",
      "À importer un fichier CommonJS uniquement",
      "C'est un alias de `require`",
    ],
    answer: 1,
    why: "`import('./chart.js')` peut être appelé n'importe où (dans un gestionnaire de clic, une condition) et renvoie une `Promise` du module. Les bundlers (Vite, webpack) en font un fichier séparé chargé seulement si nécessaire : c'est la base de `React.lazy` et des routes chargées à la demande.",
  },

  // ───────────── dom ─────────────
  {
    id: 'q75',
    theme: 'dom',
    kind: 'qcm',
    q: "Un clic sur un `<button>` placé dans une `<div>` : dans quel ordre se déroule la propagation de l'événement ?",
    choices: [
      "Cible, puis remontée jusqu'à `window` uniquement",
      "Capture (de `window` vers la cible), phase cible, puis bouillonnement (de la cible vers `window`)",
      "Bouillonnement puis capture",
      "Seul le gestionnaire du bouton est appelé",
    ],
    answer: 1,
    why: "L'événement descend d'abord de `window` jusqu'au parent de la cible (**capture**), atteint la cible, puis remonte (**bubbling**). Par défaut, `addEventListener` écoute la phase de bouillonnement ; avec `{ capture: true }`, le gestionnaire est appelé pendant la descente. Certains événements ne bouillonnent pas (`focus`, `mouseenter`).",
  },
  {
    id: 'q76',
    theme: 'dom',
    kind: 'qcm',
    q: 'Quelle est la différence entre `event.stopPropagation()` et `event.preventDefault()` ?',
    choices: [
      'Ce sont deux synonymes',
      "`stopPropagation` empêche l'événement d'atteindre les autres éléments (parents) ; `preventDefault` annule l'action par défaut du navigateur (suivre un lien, soumettre un formulaire) sans arrêter la propagation",
      "`preventDefault` arrête la propagation et `stopPropagation` annule l'action par défaut",
      "`stopPropagation` supprime le gestionnaire d'événement",
    ],
    answer: 1,
    why: "Les deux sont indépendants : on peut empêcher la soumission d'un formulaire tout en laissant l'événement remonter, et inversement. `stopImmediatePropagation` empêche en plus les autres gestionnaires du même élément. Avec `{ passive: true }`, `preventDefault` est ignoré.",
  },
  {
    id: 'q77',
    theme: 'dom',
    kind: 'qcm',
    q: "Qu'est-ce que la délégation d'événements ?",
    choices: [
      "Confier la gestion des événements à un Web Worker",
      "Placer un seul écouteur sur un ancêtre commun et identifier l'élément concerné via `event.target` (par exemple avec `closest`), grâce au bouillonnement",
      "Ajouter un écouteur sur chaque élément d'une liste",
      "Déclencher un événement avec `dispatchEvent`",
    ],
    answer: 1,
    why: "Au lieu de 1 000 écouteurs sur 1 000 `<li>`, un seul sur le `<ul>` suffit : `event.target.closest('li')` retrouve l'élément cliqué. Avantages : moins de mémoire et les éléments ajoutés plus tard sont gérés automatiquement. `event.currentTarget` désigne l'élément qui porte l'écouteur.",
  },
  {
    id: 'q78',
    theme: 'dom',
    kind: 'bug',
    q: BUG,
    code: `function handleClick() {
  console.log('cliqué')
}
button.addEventListener('click', handleClick())`,
    choices: [
      "`'click'` doit s'écrire `'onclick'`",
      "`handleClick()` est **appelée** immédiatement, et c'est sa valeur de retour (`undefined`) qui est passée comme écouteur : il faut passer la référence `handleClick`",
      "Il manque le troisième argument `false`",
      "Un écouteur doit obligatoirement être une fonction fléchée",
    ],
    answer: 1,
    why: "Les parenthèses exécutent la fonction au moment de l'enregistrement : « cliqué » s'affiche au chargement et plus jamais au clic. On passe la fonction elle-même (`handleClick`), ou une fléchée si l'on veut des arguments : `() => handleClick(id)`.",
  },

  // ───────────── perf ─────────────
  {
    id: 'q79',
    theme: 'perf',
    kind: 'qcm',
    q: 'Pour lancer une recherche serveur pendant la saisie dans un champ, sans envoyer une requête à chaque touche, on utilise plutôt :',
    choices: [
      "Un **throttle** : la fonction est appelée au plus une fois par intervalle",
      "Un **debounce** : la fonction n'est appelée qu'après une pause de N ms sans nouvelle frappe",
      'Un `setInterval` qui interroge le champ',
      'Un `requestAnimationFrame`',
    ],
    answer: 1,
    why: "Le **debounce** repousse l'appel à chaque nouvel événement : on ne cherche qu'une fois que l'utilisateur a fini de taper. Le **throttle** garantit un appel régulier pendant un flux continu d'événements (scroll, redimensionnement, déplacement de souris), au plus une fois par intervalle.",
  },
  {
    id: 'q80',
    theme: 'perf',
    kind: 'output',
    q: OUT,
    code: `const memoize = (fn) => {
  const cache = new Map()
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n))
    return cache.get(n)
  }
}
let calls = 0
const square = memoize((n) => { calls++; return n * n })
square(3)
square(3)
square(4)
console.log(calls, square(3))`,
    choices: ['3 9', '2 9', '4 9', '1 9'],
    answer: 1,
    why: "La première fois qu'un argument est vu, le résultat est calculé puis stocké dans la `Map` capturée par la closure ; ensuite il est relu sans appeler `fn`. Seuls `square(3)` et `square(4)` ont déclenché un calcul. La mémoïsation n'est correcte que pour des fonctions **pures**.",
  },
  {
    id: 'q81',
    theme: 'perf',
    kind: 'bug',
    q: BUG,
    code: `function debounce(fn, ms) {
  let timer
  return (...args) => {
    setTimeout(() => fn(...args), ms)
  }
}`,
    choices: [
      "`...args` ne fonctionne pas dans une fonction fléchée",
      "Le minuteur précédent n'est jamais annulé (ni mémorisé dans `timer`) : chaque appel finit par exécuter `fn`, avec un simple décalage. Il faut `clearTimeout(timer); timer = setTimeout(...)`",
      "Il faut utiliser `setInterval`",
      "`fn` doit être appelée avec `call(this)`",
    ],
    answer: 1,
    why: "Un debounce repose sur l'annulation : chaque nouvel appel efface le minuteur en attente et en programme un nouveau. Sans `clearTimeout`, 10 appels rapprochés produisent 10 exécutions, toutes retardées de `ms`. La variable `timer`, partagée par closure, sert précisément à retrouver le minuteur en cours.",
  },
  {
    id: 'q82',
    theme: 'perf',
    kind: 'qcm',
    q: "Qu'est-ce qui provoque un « layout thrashing » ?",
    choices: [
      "Utiliser trop de variables globales",
      "Alterner dans une boucle des écritures de style et des lectures de géométrie (`offsetHeight`, `getBoundingClientRect`), ce qui force le navigateur à recalculer la mise en page à chaque lecture",
      "Charger trop d'images",
      "Utiliser `requestAnimationFrame`",
    ],
    answer: 1,
    why: "Le navigateur regroupe normalement les modifications et recalcule la mise en page une seule fois. Lire une propriété géométrique juste après une écriture l'oblige à faire un **reflow** synchrone. Solution : lire toutes les valeurs d'abord, écrire ensuite (ou regrouper les écritures dans `requestAnimationFrame`).",
  },

  // ───────────── web ─────────────
  {
    id: 'q83',
    theme: 'web',
    kind: 'qcm',
    q: "Une requête `fetch` de `https://app.com` vers `https://api.autre.com` échoue avec une erreur CORS. Qui bloque ?",
    choices: [
      "Le serveur `api.autre.com` refuse toujours la requête",
      "Le **navigateur** : il applique la same-origin policy et ne livre la réponse au JavaScript que si le serveur renvoie un en-tête `Access-Control-Allow-Origin` qui autorise `https://app.com`",
      "Le pare-feu de l'utilisateur",
      "Le DNS",
    ],
    answer: 1,
    why: "CORS est un mécanisme côté navigateur : la requête atteint souvent le serveur, mais la réponse est masquée au script si les en-têtes ne l'autorisent pas. Pour les requêtes non simples (méthode `PUT`, en-tête `Authorization`, JSON), le navigateur envoie d'abord une requête de **pré-vérification** `OPTIONS`. Un client hors navigateur (curl, serveur) n'est pas concerné.",
  },
  {
    id: 'q84',
    theme: 'web',
    kind: 'qcm',
    q: 'Quelle affirmation est correcte ?',
    choices: [
      "`localStorage` est envoyé au serveur avec chaque requête",
      "`sessionStorage` est partagé entre tous les onglets du même site",
      "Les cookies sont envoyés automatiquement au serveur avec les requêtes ; `localStorage` persiste sans expiration et `sessionStorage` est limité à l'onglet et disparaît à sa fermeture",
      "Un cookie `HttpOnly` peut être lu par `document.cookie`",
    ],
    answer: 2,
    why: "`localStorage` et `sessionStorage` (environ 5 Mo, synchrones, chaînes uniquement) restent côté client. Les cookies (environ 4 Ko) accompagnent les requêtes HTTP vers leur domaine ; avec `HttpOnly`, ils sont invisibles au JavaScript (protection contre le vol de session par XSS), `Secure` les réserve à HTTPS et `SameSite` limite les envois intersites (CSRF).",
  },
  {
    id: 'q85',
    theme: 'web',
    kind: 'bug',
    q: BUG,
    code: `const comment = new URLSearchParams(location.search).get('c')
document.querySelector('#preview').innerHTML = comment`,
    choices: [
      "`URLSearchParams` ne sait pas lire `location.search`",
      "Insérer une donnée contrôlée par l'utilisateur avec `innerHTML` permet une injection XSS (par exemple `<img src=x onerror=...>`) : il faut `textContent`, ou assainir le HTML",
      "`querySelector` renvoie un tableau",
      "`innerHTML` est plus lent que `innerText`, c'est le seul problème",
    ],
    answer: 1,
    why: "`innerHTML` interprète la chaîne comme du HTML : un attribut `onerror` ou `onclick` injecté exécutera du JavaScript dans la page, avec accès aux données de l'utilisateur. `textContent` insère du texte brut, sans interprétation. Si du HTML est vraiment nécessaire, on l'assainit (DOMPurify) et on ajoute une Content Security Policy.",
  },
  {
    id: 'q86',
    theme: 'web',
    kind: 'qcm',
    q: "Que signifie un code de réponse HTTP **304** ?",
    choices: [
      "La ressource a été déplacée définitivement",
      "Non modifié : la version en cache du navigateur est toujours valide (après une requête conditionnelle avec `If-None-Match` ou `If-Modified-Since`)",
      "Accès refusé",
      "Erreur interne du serveur",
    ],
    answer: 1,
    why: "Lors d'une revalidation, le navigateur envoie l'`ETag` ou la date de sa copie ; si rien n'a changé, le serveur répond 304 sans corps et le cache est réutilisé. À connaître aussi : 301/302 (redirections), 401 (non authentifié), 403 (interdit), 404, 500.",
  },
  // ───────────── algo ─────────────
  {
    id: 'q87',
    theme: 'algo',
    kind: 'output',
    q: OUT,
    code: `console.log([10, 9, 1, 2].sort())
console.log([10, 9, 1, 2].sort((a, b) => a - b))`,
    choices: [
      '[ 1, 2, 9, 10 ]\n[ 1, 2, 9, 10 ]',
      '[ 1, 10, 2, 9 ]\n[ 1, 2, 9, 10 ]',
      '[ 10, 9, 2, 1 ]\n[ 1, 2, 9, 10 ]',
      '[ 1, 10, 2, 9 ]\n[ 10, 9, 2, 1 ]',
    ],
    answer: 1,
    why: "Sans comparateur, `sort` convertit les éléments en **chaînes** et les compare dans l'ordre des unités de code UTF-16 : `'10'` passe avant `'2'` car `'1' < '2'`. Pour des nombres, il faut toujours fournir un comparateur qui renvoie un nombre : `(a, b) => a - b` (négatif si `a` doit venir avant `b`). Rappel : `sort` trie **en place** et renvoie le même tableau.",
  },
  {
    id: 'q88',
    theme: 'algo',
    kind: 'output',
    q: OUT,
    code: `console.log([3, 1, 2].sort((a, b) => a > b))`,
    choices: ['[ 1, 2, 3 ]', '[ 3, 2, 1 ]', '[ 3, 1, 2 ]', 'Uncaught TypeError: The comparison function must return a number'],
    answer: 2,
    why: "Le comparateur doit renvoyer un **nombre** : négatif, nul ou positif. Ici il renvoie un booléen, converti en `1` (`true`) ou `0` (`false`) : il ne dit jamais « `a` avant `b` ». Le moteur considère donc les éléments comme déjà ordonnés ou égaux, et le tableau reste `[3, 1, 2]`. Le résultat d'un tel comparateur dépend de l'algorithme interne, ce qui en fait un bug sournois : écrire `(a, b) => a - b`.",
  },
  {
    id: 'q89',
    theme: 'algo',
    kind: 'output',
    q: "Combien d'opérations ce code compte-t-il ?",
    code: `let ops = 0
const n = 8
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) ops++
}
console.log(ops)`,
    choices: ['8', '28', '56', '64'],
    answer: 1,
    why: "La boucle interne fait `n - 1`, puis `n - 2`, … jusqu'à `0` tours : au total `n(n - 1) / 2 = 8 × 7 / 2 = 28`. C'est le motif « chaque paire une seule fois ». Diviser par deux ne change pas l'ordre de grandeur : la complexité reste **O(n²)**, car on ignore les constantes multiplicatives.",
  },
  {
    id: 'q90',
    theme: 'algo',
    kind: 'output',
    q: "Combien de tours fait cette boucle ?",
    code: `let steps = 0
for (let i = 1024; i > 1; i = Math.floor(i / 2)) steps++
console.log(steps)`,
    choices: ['10', '11', '512', '1024'],
    answer: 0,
    why: "À chaque tour, `i` est divisé par deux : 1024, 512, 256, … 2, soit 10 tours avant d'atteindre 1, car 2¹⁰ = 1024. Une boucle qui **divise** la taille du problème à chaque étape est en **O(log n)** : c'est le principe de la recherche dichotomique.",
  },
  {
    id: 'q91',
    theme: 'algo',
    kind: 'output',
    q: "Quelles valeurs la recherche dichotomique examine-t-elle pour trouver 11 ?",
    code: `const arr = [1, 3, 5, 7, 9, 11, 13]
let lo = 0
let hi = arr.length - 1
const visited = []
while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2)
  visited.push(arr[mid])
  if (arr[mid] === 11) break
  if (arr[mid] < 11) lo = mid + 1
  else hi = mid - 1
}
console.log(visited)`,
    choices: ['[ 7, 11 ]', '[ 7, 9, 11 ]', '[ 1, 3, 5, 7, 9, 11 ]', '[ 7, 13, 11 ]'],
    answer: 0,
    why: "Premier tour : `lo = 0`, `hi = 6`, `mid = 3`, `arr[3] = 7 < 11`, donc on garde la moitié droite (`lo = 4`). Deuxième tour : `mid = Math.floor((4 + 6) / 2) = 5`, `arr[5] = 11`, trouvé. Chaque comparaison élimine la moitié des candidats : au plus ⌈log₂(n + 1)⌉ = 3 comparaisons pour 7 éléments.",
  },
  {
    id: 'q92',
    theme: 'algo',
    kind: 'output',
    q: OUT,
    code: `const stack = []
const queue = []
for (const x of [1, 2, 3]) {
  stack.push(x)
  queue.push(x)
}
console.log(stack.pop(), queue.shift())`,
    choices: ['1 1', '3 3', '3 1', '1 3'],
    answer: 2,
    why: "Une **pile** (*stack*) est LIFO : le dernier entré sort le premier, `pop()` renvoie `3`. Une **file** (*queue*) est FIFO : le premier entré sort le premier, `shift()` renvoie `1`. Attention : `shift` est en O(n) car il réindexe tout le tableau ; pour une vraie file, on avance un indice de tête ou on utilise une liste chaînée.",
  },
  {
    id: 'q93',
    theme: 'algo',
    kind: 'output',
    q: "Dans quel ordre le parcours en largeur (BFS) puis en profondeur (DFS) visitent-ils ce graphe ?",
    code: `const graph = { A: ['B', 'C'], B: ['D'], C: ['D', 'E'], D: [], E: [] }

function bfs(start) {
  const seen = new Set([start])
  const queue = [start]
  for (let i = 0; i < queue.length; i++) {
    for (const next of graph[queue[i]]) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return queue.join('')
}

function dfs(node, seen = new Set()) {
  seen.add(node)
  let order = node
  for (const next of graph[node]) if (!seen.has(next)) order += dfs(next, seen)
  return order
}

console.log(bfs('A'))
console.log(dfs('A'))`,
    choices: ['ABCDE\nABCDE', 'ABDCE\nABCDE', 'ABCDE\nABDCE', 'ABCDDE\nABDCDE'],
    answer: 2,
    why: "Le **BFS** utilise une file : il visite tous les voisins directs de `A` (`B`, `C`) avant ceux du niveau suivant (`D`, `E`). Le **DFS** descend le plus loin possible avant de revenir : `A`, puis `B`, puis `D` (cul-de-sac), retour à `C`, dont `D` est déjà vu, puis `E`. Le `Set` des nœuds visités empêche de traiter `D` deux fois. Les deux parcours sont en O(V + E).",
  },
  {
    id: 'q94',
    theme: 'algo',
    kind: 'output',
    q: "Combien d'appels font la version naïve puis la version mémoïsée ?",
    code: `let calls = 0
function fib(n) {
  calls++
  return n < 2 ? n : fib(n - 1) + fib(n - 2)
}
fib(10)
console.log(calls)

calls = 0
const memo = new Map()
function fibMemo(n) {
  calls++
  if (n < 2) return n
  if (!memo.has(n)) memo.set(n, fibMemo(n - 1) + fibMemo(n - 2))
  return memo.get(n)
}
fibMemo(10)
console.log(calls)`,
    choices: ['177\n19', '89\n11', '1024\n10', '177\n11'],
    answer: 0,
    why: "La version naïve recalcule sans cesse les mêmes sous-problèmes : le nombre d'appels croît exponentiellement (177 pour `n = 10`, 2 692 537 pour `n = 30`). Avec la mémoïsation, chaque valeur de 2 à 10 n'est calculée qu'une fois ; chaque calcul fait deux appels, dont l'un trouve la valeur en cache : 19 appels au total, soit **O(n)**. C'est la programmation dynamique « descendante » (*top-down*).",
  },
  {
    id: 'q95',
    theme: 'algo',
    kind: 'output',
    q: "Quelle est la plus grande somme de 3 éléments consécutifs trouvée par cette fenêtre glissante ?",
    code: `const nums = [2, 1, 5, 1, 3, 2]
const k = 3
let windowSum = 0
let best = -Infinity
for (let i = 0; i < nums.length; i++) {
  windowSum += nums[i]
  if (i >= k) windowSum -= nums[i - k]
  if (i >= k - 1) best = Math.max(best, windowSum)
}
console.log(best)`,
    choices: ['8', '9', '11', '14'],
    answer: 1,
    why: "Les fenêtres successives valent 2+1+5 = 8, 1+5+1 = 7, 5+1+3 = 9 et 1+3+2 = 6. Au lieu de recalculer chaque somme (O(n × k)), la fenêtre **ajoute** l'élément qui entre et **retire** celui qui sort : un seul passage, **O(n)** en temps et O(1) en mémoire.",
  },
  {
    id: 'q96',
    theme: 'algo',
    kind: 'output',
    q: OUT,
    code: `const counts = {}
for (const ch of 'banana') counts[ch] = (counts[ch] ?? 0) + 1
console.log(counts)`,
    choices: ['{ a: 3, b: 1, n: 2 }', "{ b: 1, a: 3, n: 2 }", '{ b: 1, a: 1, n: 1 }', '{ b: NaN, a: NaN, n: NaN }'],
    answer: 1,
    why: "C'est le motif **table de fréquences** : un passage en O(n), chaque mise à jour en O(1). `?? 0` fournit la valeur initiale (sans lui, `undefined + 1` donnerait `NaN`). Les clés non numériques d'un objet gardent leur ordre d'insertion : `b`, puis `a`, puis `n`. Une `Map` conviendrait aussi, et serait préférable pour des clés quelconques.",
  },
  {
    id: 'q97',
    theme: 'algo',
    kind: 'output',
    q: OUT,
    code: `const people = [
  { name: 'Ana', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Cid', age: 30 },
  { name: 'Dan', age: 25 },
]
people.sort((a, b) => a.age - b.age)
console.log(people.map((p) => p.name).join(' '))`,
    choices: ['Bob Dan Ana Cid', 'Dan Bob Cid Ana', 'Bob Dan Cid Ana', 'Ana Cid Bob Dan'],
    answer: 0,
    why: "Depuis ES2019, `Array.prototype.sort` est garanti **stable** : deux éléments égaux pour le comparateur gardent leur ordre relatif d'origine. Bob précède Dan et Ana précède Cid dans l'entrée, c'est donc aussi le cas après le tri par âge. La stabilité permet d'enchaîner des tris (d'abord par nom, puis par âge) pour obtenir un tri multicritère.",
  },
  {
    id: 'q98',
    theme: 'algo',
    kind: 'output',
    q: "Ce code cherche deux nombres de somme 15 dans un tableau trié. Qu'affiche-t-il ?",
    code: `const nums = [1, 2, 4, 7, 11, 15]
let i = 0
let j = nums.length - 1
let steps = 0
while (i < j) {
  steps++
  const sum = nums[i] + nums[j]
  if (sum === 15) break
  if (sum < 15) i++
  else j--
}
console.log(i, j, steps)`,
    choices: ['2 4 4', '0 5 1', '3 4 3', '2 4 15'],
    answer: 0,
    why: "Technique des **deux pointeurs** sur un tableau trié : 1 + 15 = 16 est trop grand, on recule `j` ; 1 + 11 = 12 est trop petit, on avance `i` ; 2 + 11 = 13, on avance encore ; 4 + 11 = 15, trouvé en 4 étapes. Chaque étape élimine définitivement une valeur, donc au plus n − 1 étapes : **O(n)** en temps et O(1) en mémoire, contre O(n²) pour tester toutes les paires.",
  },
  {
    id: 'q99',
    theme: 'algo',
    kind: 'qcm',
    q: "Quelle est la complexité de `a.filter((x) => b.includes(x))`, avec `a` de taille n et `b` de taille m ?",
    choices: ['O(n + m)', 'O(n × m)', 'O(n log m)', 'O(n)'],
    answer: 1,
    why: "`includes` parcourt `b` à chaque élément de `a` : O(m) répété n fois, donc O(n × m). En construisant d'abord `const set = new Set(b)` (O(m)), puis `a.filter((x) => set.has(x))` (O(n), car `has` est en O(1) en moyenne), on passe à **O(n + m)** en temps, au prix de O(m) en mémoire.",
  },
  {
    id: 'q100',
    theme: 'algo',
    kind: 'qcm',
    q: "Quelle condition est indispensable pour appliquer une recherche dichotomique, et quelle est alors sa complexité ?",
    choices: [
      "Aucune condition ; O(log n)",
      "Les données doivent être triées (ou la propriété testée monotone) ; O(log n)",
      "Les données doivent être triées ; O(n log n)",
      "Les éléments doivent être uniques ; O(1)",
    ],
    answer: 1,
    why: "La dichotomie élimine la moitié de l'espace de recherche à chaque comparaison, ce qui n'est valable que si l'on sait de quel côté chercher : tableau trié, ou plus généralement prédicat **monotone** (faux puis vrai). Elle fait alors O(log n) comparaisons. Trier d'abord coûte O(n log n) : cela ne vaut la peine que si l'on fait de nombreuses recherches.",
  },
  {
    id: 'q101',
    theme: 'algo',
    kind: 'qcm',
    q: "Quelle est la complexité en temps du two-sum résolu avec une `Map` (valeur → indice) en un seul passage ?",
    choices: ['O(n²) en temps, O(1) en mémoire', 'O(n log n) en temps, O(1) en mémoire', 'O(n) en temps, O(n) en mémoire', 'O(log n) en temps, O(n) en mémoire'],
    answer: 2,
    why: "Pour chaque nombre, on cherche son complément `target - x` dans la `Map` (O(1) en moyenne), puis on l'y ajoute : un passage, donc **O(n)** en temps, et jusqu'à n entrées stockées, donc O(n) en mémoire. C'est l'échange classique « mémoire contre temps » face à la double boucle en O(n²). Si le tableau est déjà trié, deux pointeurs donnent O(n) en temps et O(1) en mémoire.",
  },
  {
    id: 'q102',
    theme: 'algo',
    kind: 'qcm',
    q: "Quel est le pire cas du tri rapide (*quicksort*) et quand survient-il ?",
    choices: [
      "O(n log n), il n'a pas de pire cas",
      "O(n²), quand le pivot est systématiquement le plus petit ou le plus grand élément (par exemple le premier élément d'un tableau déjà trié)",
      "O(2ⁿ), quand il y a beaucoup de doublons",
      "O(n), quand le tableau est déjà trié",
    ],
    answer: 1,
    why: "Le tri rapide est en O(n log n) **en moyenne**, mais un mauvais pivot produit des partitions de tailles n − 1 et 0 : n niveaux de récursion de coût O(n), soit O(n²). On l'évite avec un pivot aléatoire ou la médiane de trois. Il n'est pas stable, mais trie en place (pile O(log n) en moyenne). Le tri fusion, lui, est toujours en O(n log n), stable, mais utilise O(n) de mémoire.",
  },
  {
    id: 'q103',
    theme: 'algo',
    kind: 'qcm',
    q: "Quelle est la complexité d'un parcours BFS ou DFS d'un graphe stocké en liste d'adjacence (V sommets, E arêtes) ?",
    choices: ['O(V)', 'O(E²)', 'O(V × E)', 'O(V + E)'],
    answer: 3,
    why: "Grâce à l'ensemble des sommets visités, chaque sommet est traité une seule fois (O(V)) et chaque liste de voisins est parcourue une seule fois, soit chaque arête une ou deux fois (O(E)). Total : **O(V + E)** en temps, O(V) en mémoire pour le `Set` et la file ou la pile. Avec une matrice d'adjacence, lister les voisins coûte O(V) par sommet, d'où O(V²).",
  },
  {
    id: 'q104',
    theme: 'algo',
    kind: 'qcm',
    q: "« Trouver la plus longue sous-chaîne sans caractère répété. » Quel motif cet énoncé suggère-t-il en premier ?",
    choices: [
      "Une fenêtre glissante (deux indices qui délimitent une portion contiguë) avec un `Set` ou une `Map` des caractères de la fenêtre",
      "Un tri préalable de la chaîne",
      "Un retour sur trace (*backtracking*) qui énumère toutes les sous-chaînes",
      "Une recherche dichotomique sur les caractères",
    ],
    answer: 0,
    why: "Les signaux « sous-chaîne / sous-tableau **contigu** » et « le plus long / le plus court » désignent la **fenêtre glissante** : on étend la fenêtre à droite, et on la réduit à gauche dès que la contrainte est violée (ici, un doublon). Chaque indice avance au plus n fois : O(n), contre O(n²) ou O(n³) pour l'énumération de toutes les sous-chaînes. Trier détruirait l'ordre, qui est justement ce qui compte.",
  },
]
