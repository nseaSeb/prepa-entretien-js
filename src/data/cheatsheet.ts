import type { CheatSection } from './types'
import { tsCheatsheet } from './cheatsheetTs'

/*
 * Antisèche : résumé dense sur une page. Les lignes `expression // → valeur` sont vérifiées.
 */
const jsCheatsheet: CheatSection[] = [
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
    id: 'strings',
    title: 'Chaînes',
    blocks: [
      {
        title: 'Découper / assembler : split, join',
        code: `'a,b,c'.split(',') // → [ 'a', 'b', 'c' ]
'a,b,'.split(',') // → [ 'a', 'b', '' ]
'abc'.split('') // → [ 'a', 'b', 'c' ]
'a b   c'.split(/\\s+/) // → [ 'a', 'b', 'c' ]
'a,b,c'.split(',', 2) // → [ 'a', 'b' ]
'a,b'.split(',').join(' / ') // → 'a / b'`,
        detail: {
          signature: 'str.split(separator?, limit?)\narr.join(separator = \',\')',
          returns: '`split` : un nouveau tableau de chaînes ; `join` : une nouvelle chaîne',
          mutates: false,
          explain: `\`split\` coupe la chaîne à chaque occurrence du séparateur (chaîne ou regex) et renvoie les morceaux. Le séparateur disparaît du résultat, sauf s'il est capturé par un groupe \`( )\` dans la regex.

\`limit\` tronque le tableau renvoyé (il ne regroupe pas le reste). Sans argument, \`split()\` renvoie la chaîne entière dans un tableau.

\`join\` fait l'inverse sur un tableau : séparateur par défaut \`,\` ; \`null\` et \`undefined\` deviennent des chaînes vides.`,
          examples: [
            {
              title: 'Cas utiles',
              code: `'abc'.split() // → [ 'abc' ]
'a1b2c'.split(/(\\d)/) // → [ 'a', '1', 'b', '2', 'c' ]
'abc'.split('').reverse().join('') // → 'cba'
'mot clé'.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') // → 'Mot Clé'`,
            },
            {
              title: 'Pièges',
              code: `''.split(',') // → [ '' ]
'👋'.split('').length // → 2
const chars = [...'👋']
chars.length // → 1
const parts = [1, null, undefined, 2]
parts.join('-') // → '1---2'`,
            },
          ],
          pitfall: 'Un séparateur en fin de chaîne produit un `\'\'` final, et `\'\'.split(\',\')` renvoie `[\'\']`, pas `[]`. Filtrer avec `.filter(Boolean)` si besoin. `split(\'\')` coupe par unité UTF-16 et casse les emojis : utiliser `[...str]` ou `Array.from(str)`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/split',
        },
      },
      {
        title: 'Extraire : slice, substring, at',
        code: `const s = 'JavaScript'
s.slice(0, 4) // → 'Java'
s.slice(-6) // → 'Script'
s.substring(4, 0) // → 'Java'
s.at(-1) // → 't'
s[0] // → 'J'`,
        detail: {
          signature: 'str.slice(start, end?)\nstr.substring(start, end?)\nstr.at(index)',
          returns: 'Une nouvelle chaîne (`at` : un caractère ou `undefined`)',
          mutates: false,
          explain: `Les trois lisent sans modifier : une chaîne est **immuable**. \`end\` est toujours **exclu**.

- \`slice\` accepte les indices négatifs (comptés depuis la fin) : c'est le réflexe par défaut, même logique que \`Array.prototype.slice\`.
- \`substring\` traite les négatifs comme 0 et **inverse** start et end si start > end.
- \`at\` lit un caractère, négatif autorisé ; \`str[i]\` ne l'accepte pas.

\`substr(start, length)\` est déprécié : ne pas l'utiliser.`,
          examples: [
            {
              code: `const s = 'JavaScript'
s.slice(4, 0) // → ''
s.substring(-3) // → 'JavaScript'
s.slice(-3) // → 'ipt'
s[-1] // → undefined
s.at(99) // → undefined
s.charAt(99) // → ''`,
            },
          ],
          pitfall: '`str[-1]` renvoie `undefined` (c\'est une propriété « -1 » inexistante) : utiliser `str.at(-1)` ou `str.slice(-1)`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/slice',
        },
      },
      {
        title: 'Chercher : includes, indexOf, startsWith',
        code: `const s = 'Hello world'
s.includes('world') // → true
s.indexOf('o') // → 4
s.lastIndexOf('o') // → 7
s.indexOf('z') // → -1
s.startsWith('Hell') // → true
s.endsWith('d') // → true`,
        detail: {
          signature: 'str.includes(search, position?)\nstr.indexOf(search, fromIndex?)\nstr.startsWith(search, position?)\nstr.endsWith(search, length?)\nstr.search(regex)',
          returns: '`includes` / `startsWith` / `endsWith` : booléen ; `indexOf` / `search` : position ou `-1`',
          mutates: false,
          explain: `Pour une question oui/non, préférer \`includes\`, \`startsWith\`, \`endsWith\` : plus lisibles qu'un test sur \`indexOf\`.

\`indexOf\` sert quand on a besoin de la **position**. \`search\` fait pareil avec une regex.

Toutes ces méthodes sont **sensibles à la casse** : normaliser avec \`toLowerCase()\` avant de comparer.`,
          examples: [
            {
              code: `const s = 'Hello world'
s.toLowerCase().includes('hello') // → true
s.startsWith('world', 6) // → true
s.search(/w\\w+/) // → 6
s.indexOf('H') // → 0
Boolean(s.indexOf('H')) // → false
Boolean(s.indexOf('z')) // → true`,
            },
          ],
          pitfall: '`if (s.indexOf(x))` est faux quand x est au début (0) et vrai quand il est absent (-1). Écrire `s.includes(x)` ou `s.indexOf(x) !== -1`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/includes',
        },
      },
      {
        title: 'Remplacer : replace, replaceAll',
        code: `'a-b-c'.replace('-', '+') // → 'a+b-c'
'a-b-c'.replaceAll('-', '+') // → 'a+b+c'
'a-b-c'.replace(/-/g, '+') // → 'a+b+c'
'hello'.replace(/l/g, (m) => m.toUpperCase()) // → 'heLLo'`,
        detail: {
          signature: 'str.replace(pattern, replacement)\nstr.replaceAll(pattern, replacement)',
          returns: 'Une nouvelle chaîne',
          mutates: false,
          explain: `Avec une **chaîne** comme motif, \`replace\` ne remplace que la **première** occurrence ; \`replaceAll\` les remplace toutes. Avec une **regex**, c'est le drapeau \`g\` qui décide.

Le remplacement peut être une chaîne avec des motifs spéciaux (\`$1\`, \`$2\` pour les groupes, \`$&\` pour la correspondance entière) ou une fonction \`(match, ...groupes) => string\`.`,
          examples: [
            {
              title: 'Groupes capturés',
              code: `'2026-11-20'.replace(/(\\d+)-(\\d+)-(\\d+)/, '$3/$2/$1') // → '20/11/2026'
'Jean Dupont'.replace(/(\\w+) (\\w+)/, (_, first, last) => \`\${last.toUpperCase()} \${first}\`) // → 'DUPONT Jean'`,
            },
            {
              title: 'replaceAll exige le drapeau g',
              code: `let error = 'aucune'
try {
  'a-b'.replaceAll(/-/, '+')
} catch (e) {
  error = e.constructor.name
}
error // → 'TypeError'`,
            },
          ],
          pitfall: 'Le `$` est spécial dans une chaîne de remplacement : `\'prix\'.replace(\'prix\', \'$&!\')` donne `\'prix!\'`. Pour insérer un `$` littéral, écrire `$$` ou passer une fonction.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/replace',
        },
      },
      {
        title: 'Nettoyer / formater',
        code: `'  hi  '.trim() // → 'hi'
'7'.padStart(3, '0') // → '007'
'ab'.padEnd(5, '.') // → 'ab...'
'ab'.repeat(3) // → 'ababab'
'élan'.toUpperCase() // → 'ÉLAN'`,
        detail: {
          signature: 'str.trim() / trimStart() / trimEnd()\nstr.padStart(targetLength, padString = \' \')\nstr.padEnd(targetLength, padString = \' \')\nstr.repeat(count)\nstr.toUpperCase() / toLowerCase()\na.localeCompare(b)',
          returns: 'Une nouvelle chaîne (`localeCompare` : nombre négatif, 0 ou positif)',
          mutates: false,
          explain: `Une chaîne est **immuable** : aucune méthode ne la modifie, toutes renvoient une nouvelle chaîne. Appeler \`s.trim()\` sans récupérer le résultat ne sert à rien.

\`padStart\` complète jusqu'à une **longueur cible** (pas un nombre de caractères ajoutés) : idéal pour les heures, les numéros de facture.

Pour trier des chaînes avec accents, \`localeCompare\` respecte l'ordre alphabétique de la langue ; le \`sort()\` par défaut compare les codes UTF-16.`,
          examples: [
            {
              title: 'Immuabilité',
              code: `const s = '  hi  '
s.trim()
s // → '  hi  '
const clean = s.trim()
clean // → 'hi'`,
            },
            {
              title: 'Formatage et tri',
              code: `const [h, m] = [9, 5]
const time = \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`
time // → '09:05'
'12345'.padStart(3, '0') // → '12345'
const letters = ['é', 'z', 'a']
letters.toSorted() // → [ 'a', 'z', 'é' ]
letters.toSorted((a, b) => a.localeCompare(b)) // → [ 'a', 'é', 'z' ]`,
            },
          ],
          pitfall: '`padStart` ne tronque jamais : si la chaîne est déjà plus longue que la cible, elle est renvoyée telle quelle.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/padStart',
        },
      },
      {
        title: 'Réflexes',
        items: [
          'Chaînes immuables : toujours récupérer le résultat (`s = s.trim()`)',
          'Template literals (backticks) : interpolation `${n}`, multi-ligne sans `\\n`',
          '`String(x)` marche avec `null`/`undefined`, `x.toString()` lève une erreur',
          '`parseInt(\'42px\', 10)` → 42 ; `Number(\'42px\')` → NaN',
          'Longueur réelle avec emojis : `[...s].length`, pas `s.length`',
        ],
      },
    ],
  },
  {
    id: 'numbers',
    title: 'Nombres et Math',
    theme: 'types',
    blocks: [
      {
        title: 'Arrondir : round, floor, ceil, trunc, toFixed',
        code: `Math.round(2.5) // → 3
Math.round(-2.5) // → -2
Math.floor(-1.5) // → -2
Math.trunc(-1.5) // → -1
Math.ceil(1.1) // → 2
const price = 1.005
price.toFixed(2) // → '1.00'`,
        detail: {
          signature: 'Math.round(x) / Math.floor(x) / Math.ceil(x) / Math.trunc(x)\nnum.toFixed(digits)',
          returns: '`Math.*` : un nombre ; `toFixed` : une **chaîne**',
          mutates: false,
          explain: `- \`floor\` : vers le bas (−∞) ; \`ceil\` : vers le haut (+∞) ; \`trunc\` : coupe la partie décimale (vers 0).
- \`round\` : à l'entier le plus proche, les « ,5 » vont vers **+∞** (donc \`-2.5\` donne \`-2\`, pas \`-3\`).
- \`floor\` et \`trunc\` ne diffèrent que pour les négatifs.

\`toFixed\` sert à l'**affichage** : il renvoie une chaîne. Pour arrondir à n décimales en gardant un nombre : \`Math.round(x * 100) / 100\`. Pour un affichage localisé (séparateurs, devise) : \`Intl.NumberFormat\` ou \`toLocaleString\`.`,
          examples: [
            {
              code: `const x = 3.14159
x.toFixed(2) // → '3.14'
typeof x.toFixed(2) // → 'string'
Math.round(x * 100) / 100 // → 3.14
Number(x.toFixed(2)) // → 3.14
x.toFixed(2) + 1 // → '3.141'`,
            },
          ],
          pitfall: '`1.005.toFixed(2)` donne `\'1.00\'` : 1.005 n\'est pas représentable exactement en binaire (il vaut 1.00499…). Pour de l\'argent, travailler en centimes entiers.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/round',
        },
      },
      {
        title: 'Convertir : Number, parseInt, parseFloat',
        code: `Number('42') // → 42
Number('42px') // → NaN
Number('') // → 0
Number(null) // → 0
parseInt('42px', 10) // → 42
parseFloat('3.14abc') // → 3.14`,
        detail: {
          signature: 'Number(value)\nparseInt(string, radix)\nparseFloat(string)',
          returns: 'Un nombre (ou `NaN`)',
          mutates: false,
          explain: `\`Number(x)\` (ou \`+x\`, sauf pour un BigInt : \`+10n\` lève une TypeError) convertit la valeur **entière** : un seul caractère invalide donne \`NaN\`. Les espaces autour sont ignorés, la chaîne vide et \`null\` donnent \`0\`, \`undefined\` donne \`NaN\`.

\`parseInt\` / \`parseFloat\` lisent **le début** de la chaîne et s'arrêtent au premier caractère invalide : pratique pour \`'42px'\`. Toujours passer la base à \`parseInt\` (\`10\`).

\`parseInt\` convertit d'abord son argument en chaîne : ne jamais l'utiliser pour tronquer un nombre, utiliser \`Math.trunc\`.`,
          examples: [
            {
              title: 'Différences',
              code: `Number(' 12 ') // → 12
Number(undefined) // → NaN
Number('1e3') // → 1000
parseInt('1e3', 10) // → 1
parseInt('0x1F') // → 31
parseInt(0.0000005) // → 5`,
            },
            {
              title: 'Le piège map(parseInt)',
              code: `const raw = ['1', '2', '3']
raw.map(parseInt) // → [ 1, NaN, NaN ]
raw.map(Number) // → [ 1, 2, 3 ]`,
            },
          ],
          pitfall: '`[\'1\', \'2\', \'3\'].map(parseInt)` passe l\'index comme base : `parseInt(\'2\', 1)` et `parseInt(\'3\', 2)` donnent `NaN`. Écrire `.map(Number)` ou `.map((s) => parseInt(s, 10))`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/parseInt',
        },
      },
      {
        title: 'Tester : isNaN, isInteger, isFinite',
        code: `Number.isNaN('abc') // → false
isNaN('abc') // → true
Number.isInteger(5.0) // → true
Number.isFinite('5') // → false
isFinite('5') // → true
Number.isSafeInteger(2 ** 53) // → false`,
        detail: {
          signature: 'Number.isNaN(x) / Number.isInteger(x) / Number.isFinite(x) / Number.isSafeInteger(x)',
          returns: 'Un booléen',
          mutates: false,
          explain: `Les versions globales \`isNaN\` et \`isFinite\` **convertissent** d'abord leur argument en nombre, d'où \`isNaN('abc') === true\`. Les versions \`Number.*\` ne convertissent rien : elles répondent \`false\` pour tout ce qui n'est pas un nombre. Toujours préférer \`Number.isNaN\` et \`Number.isFinite\`.

\`NaN\` est la seule valeur différente d'elle-même : \`===\` ne peut pas la détecter. \`Object.is\` et \`includes\` (algorithme SameValueZero) la reconnaissent, \`indexOf\` non.`,
          examples: [
            {
              code: `const n = NaN
n === n // → false
Number.isNaN(n) // → true
Object.is(n, NaN) // → true
const arr = [NaN]
arr.includes(NaN) // → true
arr.indexOf(NaN) // → -1`,
            },
          ],
          pitfall: '`typeof NaN` vaut `\'number\'` : vérifier `typeof x === \'number\'` ne suffit pas à garantir un nombre utilisable, ajouter `Number.isFinite(x)`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN',
        },
      },
      {
        title: 'Précision flottante et BigInt',
        code: `0.1 + 0.2 // → 0.30000000000000004
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // → true
Number.MAX_SAFE_INTEGER // → 9007199254740991
2 ** 53 + 1 // → 9007199254740992
2n ** 53n + 1n // → 9007199254740993n`,
        detail: {
          explain: `Les nombres JS sont des flottants 64 bits (IEEE 754) : beaucoup de décimales (0.1, 0.2) n'ont pas de représentation exacte. On compare donc avec une tolérance (\`Number.EPSILON\`) et on manipule l'argent en **centimes entiers**.

Au-delà de \`Number.MAX_SAFE_INTEGER\` (2^53 − 1), les entiers perdent en précision. \`BigInt\` (suffixe \`n\`) représente des entiers de taille arbitraire, mais :

- on ne mélange pas \`bigint\` et \`number\` dans un calcul (TypeError) ;
- la division est entière ;
- \`Math.*\` ne les accepte pas.`,
          examples: [
            {
              code: `0.1 * 3 // → 0.30000000000000004
const totalCents = 1999 + 1
totalCents / 100 // → 20
typeof 10n // → 'bigint'
5n / 2n // → 2n
Number(10n) + 1 // → 11
let error = 'aucune'
try {
  1n + 1
} catch (e) {
  error = e.constructor.name
}
error // → 'TypeError'`,
            },
          ],
          pitfall: 'Les IDs numériques venant d\'une API (ex. IDs Twitter) dépassent parfois 2^53 : `JSON.parse` les arrondit silencieusement. Les transmettre en chaîne.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON',
        },
      },
      {
        title: 'Math utiles',
        code: `Math.max(3, 7, 1) // → 7
Math.max(...[3, 7, 1]) // → 7
Math.max() // → -Infinity
Math.abs(-4) // → 4
Math.sign(-4) // → -1
2 ** 10 // → 1024
const neg = -7
neg % 3 // → -1`,
        detail: {
          signature: 'Math.max(...values) / Math.min(...values)\nMath.abs(x) / Math.sign(x) / Math.hypot(...xs)\nMath.random()',
          returns: 'Un nombre',
          mutates: false,
          explain: `\`Math.max\` / \`Math.min\` prennent des **arguments**, pas un tableau : étaler avec \`...\`. Sans argument, \`max\` renvoie \`-Infinity\` (l'élément neutre).

\`%\` est un **reste**, pas un modulo : il garde le signe du dividende. Pour un modulo toujours positif (index circulaire), utiliser \`((a % n) + n) % n\`.

\`Math.random()\` renvoie un flottant dans [0, 1[. Les fonctions ci-dessous sont des classiques d'entretien.`,
          examples: [
            {
              title: 'Utilitaires classiques',
              code: `const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const r = randomInt(1, 6)
r >= 1 && r <= 6 && Number.isInteger(r) // → true
const clamp = (x, min, max) => Math.min(Math.max(x, min), max)
clamp(15, 0, 10) // → 10
const mod = (a, n) => ((a % n) + n) % n
mod(-7, 3) // → 2
Math.hypot(3, 4) // → 5`,
            },
          ],
          pitfall: '`Math.max(...bigArray)` peut lever une RangeError au-delà de ~100 000 éléments (trop d\'arguments). Pour de gros tableaux : `arr.reduce((a, b) => Math.max(a, b), -Infinity)`.',
          mdn: 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/max',
        },
      },
      {
        title: 'Réflexes',
        items: [
          '`Number.isNaN` / `Number.isFinite`, jamais les versions globales',
          '`parseInt(s, 10)` : toujours la base',
          'Argent : centimes entiers ; affichage : `Intl.NumberFormat(\'fr-FR\', { style: \'currency\', currency: \'EUR\' })`',
          '`toFixed` renvoie une chaîne',
          '`%` garde le signe : `-7 % 3` → -1',
        ],
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

export const cheatsheet: CheatSection[] = [...jsCheatsheet, ...tsCheatsheet]
