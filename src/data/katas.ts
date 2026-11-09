import type { Kata } from './types'
import { algoKatas } from './katasAlgo'

/**
 * Katas : exercices de code classiques d'entretien.
 * Les champs de code sont des gabarits : pas d'accent grave, de `${` ni de barre oblique inverse dedans.
 */
const jsKatas: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'debounce',
    title: 'Debounce',
    difficulty: 'moyen',
    theme: 'closures',
    category: 'utilitaire',
    statement: `Écrivez \`debounce(fn, delay)\` qui renvoie une nouvelle fonction. Chaque appel de cette fonction **repousse** l'exécution de \`fn\` : \`fn\` n'est appelée qu'une fois que \`delay\` millisecondes se sont écoulées **sans nouvel appel** (exécution « en fin de rafale », dite *trailing*).

Comportement attendu :

- aucun appel immédiat : \`fn\` s'exécute seulement après le délai ;
- chaque nouvel appel relance le minuteur depuis zéro ;
- \`fn\` reçoit les **arguments du dernier appel** ;
- \`fn\` est appelée avec le **même \`this\`** que le dernier appel (la fonction renvoyée peut servir de méthode) ;
- deux rafales séparées par plus de \`delay\` provoquent deux exécutions.

Exemple : \`const save = debounce(sauvegarder, 300)\`, puis \`save('a')\`, \`save('ab')\`, \`save('abc')\` en moins de 300 ms : \`sauvegarder\` est appelée une seule fois, avec \`'abc'\`, 300 ms après le dernier appel.`,
    starter: `function debounce(fn, delay) {
  // TODO : renvoyer une fonction qui repousse l'appel de fn
}`,
    solution: `function debounce(fn, delay) {
  let timer = null // minuteur en attente, partagé par tous les appels (closure)
  return function (...args) {
    const context = this // on capture le this du dernier appel
    clearTimeout(timer) // chaque appel annule le précédent…
    timer = setTimeout(() => {
      timer = null
      fn.apply(context, args) // …et seul le dernier finit par s'exécuter
    }, delay)
  }
}`,
    tests: [
      {
        name: "n'appelle pas fn immédiatement",
        code: `let calls = 0
const d = debounce(() => calls++, 30)
d()
assertEqual(calls, 0, 'aucun appel synchrone')
await sleep(120)
assertEqual(calls, 1, 'un appel après le délai')`,
      },
      {
        name: 'une rafale d’appels ne déclenche fn qu’une fois',
        code: `let calls = 0
const d = debounce(() => calls++, 40)
d(); d(); d(); d()
await sleep(150)
assertEqual(calls, 1)`,
      },
      {
        name: 'fn reçoit les arguments du dernier appel',
        code: `let received = null
const d = debounce((...args) => { received = args }, 30)
d(1)
d(2, 'b')
d(3, 'c')
await sleep(120)
assertEqual(received, [3, 'c'])`,
      },
      {
        name: 'le this est transmis',
        code: `let seen = null
const obj = { name: 'obj', save: debounce(function () { seen = this && this.name }, 30) }
obj.save()
await sleep(120)
assertEqual(seen, 'obj')`,
      },
      {
        name: 'chaque appel relance le minuteur',
        code: `let calls = 0
const d = debounce(() => calls++, 100)
d()
await sleep(60)
d() // relance : l'exécution est repoussée à environ 160 ms
await sleep(60)
assertEqual(calls, 0, 'le premier minuteur aurait dû être annulé')
await sleep(200)
assertEqual(calls, 1)`,
      },
      {
        name: 'deux rafales séparées donnent deux exécutions',
        code: `let calls = 0
const d = debounce(() => calls++, 30)
d(); d()
await sleep(120)
d(); d()
await sleep(120)
assertEqual(calls, 2)`,
      },
    ],
    hints: [
      'Il faut mémoriser l’identifiant du minuteur entre les appels : une variable dans la closure de `debounce` fait l’affaire.',
      'À chaque appel : `clearTimeout` du minuteur précédent, puis nouveau `setTimeout`.',
      'Pour transmettre `this`, la fonction renvoyée doit être une `function` classique (pas une fléchée) ; utilisez ensuite `fn.apply(this, args)` dans une fléchée à l’intérieur du `setTimeout`.',
    ],
    discussion: `**Complexité** : O(1) par appel, un seul minuteur vivant à la fois.

**Points à évoquer** :

- *leading* vs *trailing* : exécuter au premier appel de la rafale (bouton anti double-clic) ou au dernier (recherche à la frappe). Lodash propose les deux options, plus \`maxWait\` qui garantit une exécution au moins toutes les N ms ;
- ajouter \`cancel()\` (annuler l'appel en attente) et \`flush()\` (l'exécuter tout de suite) : utile au démontage d'un composant ;
- la valeur de retour de \`fn\` est perdue : on peut renvoyer une promesse si l'appelant en a besoin ;
- en React, recréer le debounce à chaque rendu le rend inutile : le stocker dans un \`useRef\` / \`useMemo\` ;
- différence avec **throttle** : debounce attend le calme, throttle garantit un rythme maximal.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'throttle',
    title: 'Throttle',
    difficulty: 'moyen',
    theme: 'perf',
    category: 'utilitaire',
    statement: `Écrivez \`throttle(fn, interval)\` qui renvoie une nouvelle fonction limitant \`fn\` à **une exécution au plus par fenêtre de \`interval\` millisecondes**.

Comportement attendu (version *leading*, sans appel final différé) :

- le premier appel exécute \`fn\` **immédiatement** (de façon synchrone) ;
- les appels suivants qui arrivent pendant les \`interval\` ms qui suivent sont **ignorés** ;
- une fois la fenêtre écoulée, l'appel suivant exécute de nouveau \`fn\` immédiatement et ouvre une nouvelle fenêtre ;
- \`fn\` reçoit les arguments et le \`this\` de l'appel qui la déclenche.

Exemple : \`const onScroll = throttle(majPosition, 100)\` ; si l'événement \`scroll\` arrive 50 fois en 100 ms, \`majPosition\` ne s'exécute qu'une fois sur cette période.`,
    starter: `function throttle(fn, interval) {
  // TODO : renvoyer une fonction qui exécute fn au plus une fois par interval
}`,
    solution: `function throttle(fn, interval) {
  let waiting = false // true pendant la fenêtre où les appels sont ignorés
  return function (...args) {
    if (waiting) return // appel ignoré
    fn.apply(this, args) // exécution immédiate (leading)
    waiting = true
    setTimeout(() => {
      waiting = false // la fenêtre se referme : le prochain appel passera
    }, interval)
  }
}`,
    tests: [
      {
        name: 'le premier appel est immédiat',
        code: `let calls = 0
const t = throttle(() => calls++, 40)
t()
assertEqual(calls, 1)`,
      },
      {
        name: 'les appels pendant la fenêtre sont ignorés',
        code: `let calls = 0
const t = throttle(() => calls++, 40)
t(); t(); t(); t(); t()
assertEqual(calls, 1)
await sleep(150)
assertEqual(calls, 1, 'aucun appel différé en fin de fenêtre')`,
      },
      {
        name: 'un nouvel appel passe après la fenêtre',
        code: `const received = []
const t = throttle((x) => received.push(x), 40)
t('a')
t('ignoré')
await sleep(150)
t('b')
assertEqual(received, ['a', 'b'])`,
      },
      {
        name: 'les arguments et le this sont transmis',
        code: `let seen = null
const obj = { id: 7, run: throttle(function (a, b) { seen = [this && this.id, a, b] }, 30) }
obj.run('x', 'y')
assertEqual(seen, [7, 'x', 'y'])`,
      },
      {
        name: 'les fenêtres successives fonctionnent',
        code: `let calls = 0
const t = throttle(() => calls++, 30)
for (let i = 0; i < 3; i++) {
  t(); t()
  await sleep(120)
}
assertEqual(calls, 3)`,
      },
    ],
    hints: [
      'Un simple booléen dans la closure suffit : « suis-je dans une fenêtre d’attente ? ».',
      'Au moment où `fn` s’exécute, passez le booléen à `true` et programmez un `setTimeout` qui le remet à `false` après `interval`.',
      'Alternative sans minuteur : mémoriser l’horodatage du dernier appel exécuté et comparer avec `Date.now()`.',
    ],
    discussion: `**Complexité** : O(1) par appel.

**Points à évoquer** :

- variante *trailing* : mémoriser les derniers arguments reçus pendant la fenêtre et les exécuter à sa fermeture, pour ne pas perdre l'état final (position de scroll définitive) ;
- version à horodatage (\`Date.now() - last >= interval\`) : pas de minuteur, mais pas de trailing possible sans en rajouter un ;
- pour l'animation liée à l'affichage, \`requestAnimationFrame\` est souvent un meilleur « throttle » (calé sur le rafraîchissement de l'écran) ;
- cas d'usage : scroll, resize, mousemove, envoi de position ; à l'inverse, **debounce** convient à la recherche à la frappe ;
- throttle peut s'écrire avec debounce + \`maxWait\` (c'est ainsi que Lodash l'implémente).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'deep-clone',
    title: 'Copie profonde',
    difficulty: 'difficile',
    theme: 'objects',
    category: 'utilitaire',
    statement: `Écrivez \`deepClone(value)\` qui renvoie une **copie profonde** de \`value\` : modifier la copie, à n'importe quel niveau, ne doit jamais modifier l'original.

À gérer :

- primitives (\`number\`, \`string\`, \`boolean\`, \`null\`, \`undefined\`, \`symbol\`, \`bigint\`) : renvoyées telles quelles ;
- tableaux et objets « simples » imbriqués : copiés récursivement (propriétés propres énumérables) ;
- \`Date\` : nouvelle instance à la même date ;
- \`Map\` et \`Set\` : nouvelles instances, dont les **valeurs** sont elles aussi copiées profondément (les clés de \`Map\` peuvent rester les mêmes) ;
- **références circulaires** : un objet qui se contient lui-même doit donner une copie qui se contient elle-même, sans boucle infinie ;
- fonctions : conservées par référence.

N'utilisez pas \`structuredClone\` ni \`JSON.parse(JSON.stringify(...))\`.

Exemple : \`const b = deepClone({ d: new Date(0), tags: new Set(['x']), list: [[1], [2]] })\` ; \`b.list[0].push(9)\` ne touche pas l'original.`,
    starter: `function deepClone(value) {
  // TODO : copier récursivement tableaux, objets, Date, Map, Set (et les cycles)
  return value
}`,
    solution: `function deepClone(value, seen = new WeakMap()) {
  // Primitives et fonctions : rien à copier
  if (value === null || typeof value !== 'object') return value
  // Déjà copié : on renvoie la copie (gère les cycles et les références partagées)
  if (seen.has(value)) return seen.get(value)

  if (value instanceof Date) return new Date(value.getTime())

  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy) // enregistrer AVANT de descendre, sinon un cycle boucle
    for (const [k, v] of value) copy.set(k, deepClone(v, seen))
    return copy
  }

  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    for (const v of value) copy.add(deepClone(v, seen))
    return copy
  }

  // Tableau ou objet simple (on conserve le prototype)
  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
  seen.set(value, copy)
  for (const key of Object.keys(value)) copy[key] = deepClone(value[key], seen)
  return copy
}`,
    tests: [
      {
        name: 'les primitives sont renvoyées telles quelles',
        code: `assertEqual(deepClone(42), 42)
assertEqual(deepClone('a'), 'a')
assertEqual(deepClone(null), null)
assertEqual(deepClone(undefined), undefined)
assert(Number.isNaN(deepClone(NaN)))`,
      },
      {
        name: 'objets et tableaux imbriqués sont indépendants',
        code: `const src = { a: 1, b: { c: [1, [2, 3]], d: { e: 'x' } } }
const copy = deepClone(src)
assertEqual(copy, src)
assert(copy !== src && copy.b !== src.b && copy.b.c !== src.b.c && copy.b.c[1] !== src.b.c[1], 'les sous-objets doivent être de nouvelles références')
copy.b.c[1].push(4)
copy.b.d.e = 'y'
assertEqual(src, { a: 1, b: { c: [1, [2, 3]], d: { e: 'x' } } }, 'l’original a été modifié')
assert(Array.isArray(copy.b.c), 'un tableau reste un tableau')`,
      },
      {
        name: 'Date est copiée en une nouvelle instance',
        code: `const src = { when: new Date(2020, 0, 15) }
const copy = deepClone(src)
assert(copy.when instanceof Date, 'doit être une Date')
assert(copy.when !== src.when, 'nouvelle instance attendue')
assertEqual(copy.when.getTime(), src.when.getTime())`,
      },
      {
        name: 'Map et Set sont copiés profondément',
        code: `const inner = { n: 1 }
const src = { m: new Map([['k', inner]]), s: new Set([1, inner]) }
const copy = deepClone(src)
assert(copy.m instanceof Map && copy.s instanceof Set, 'types conservés')
assert(copy.m !== src.m && copy.s !== src.s, 'nouvelles instances')
assertEqual(copy.m.get('k'), { n: 1 })
assert(copy.m.get('k') !== inner, 'les valeurs de la Map doivent être copiées')
assertEqual(copy.s.size, 2)
assert(![...copy.s].includes(inner), 'les valeurs du Set doivent être copiées')`,
      },
      {
        name: 'les références circulaires sont reproduites',
        code: `const src = { name: 'racine', list: [] }
src.self = src
src.list.push(src)
const copy = deepClone(src)
assert(copy !== src, 'nouvel objet attendu')
assert(copy.self === copy, 'copy.self doit pointer vers la copie')
assert(copy.list[0] === copy, 'le cycle via le tableau doit pointer vers la copie')`,
      },
      {
        name: 'les fonctions sont conservées par référence',
        code: `const f = () => 1
const copy = deepClone({ f })
assert(copy.f === f)`,
      },
    ],
    hints: [
      'Commencez par le cas de base : si `value` n’est pas un objet (ou vaut `null`), renvoyez-la directement. Puis traitez tableaux et objets récursivement.',
      'Testez les types particuliers avant le cas générique : `instanceof Date`, `instanceof Map`, `instanceof Set`.',
      'Pour les cycles, passez un `WeakMap` original → copie à travers la récursion, et enregistrez la copie **avant** de copier ses enfants.',
    ],
    discussion: `**Complexité** : O(n) en temps et en mémoire (n = nombre de valeurs atteignables), grâce au \`WeakMap\` qui évite de recopier deux fois le même objet.

**Points à évoquer** :

- \`structuredClone\` (natif) gère Date, Map, Set, RegExp, typed arrays et cycles, mais refuse les fonctions et perd les prototypes de classes ;
- \`JSON.parse(JSON.stringify(x))\` : perd \`undefined\`, les fonctions, transforme les Date en chaînes, plante sur les cycles ;
- spread et \`Object.assign\` ne font qu'une copie **superficielle** ;
- le \`WeakMap\` préserve aussi les **références partagées** (deux propriétés pointant vers le même objet restent liées dans la copie) ;
- non gérés ici : RegExp, typed arrays, propriétés symboles ou non énumérables, getters (copiés comme valeurs) ;
- récursion profonde : risque de dépassement de pile sur des structures très profondes, d'où une version itérative avec pile explicite.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'flatten',
    title: 'Aplatir un tableau',
    difficulty: 'facile',
    theme: 'arrays',
    category: 'utilitaire',
    statement: `Écrivez \`flatten(arr, depth = Infinity)\` qui renvoie un **nouveau tableau** dans lequel les sous-tableaux sont aplatis jusqu'à la profondeur \`depth\`.

Contraintes :

- ne pas utiliser \`Array.prototype.flat\` ni \`flatMap\` ;
- ne pas modifier le tableau d'entrée ;
- \`depth = 0\` renvoie une copie superficielle de \`arr\` ;
- un tableau vide donne \`[]\`.

Exemples :

- \`flatten([1, [2, [3, [4]]]])\` donne \`[1, 2, 3, 4]\` ;
- \`flatten([1, [2, [3, [4]]]], 1)\` donne \`[1, 2, [3, [4]]]\` ;
- \`flatten([[1], [[2]]], 0)\` donne \`[[1], [[2]]]\`.`,
    starter: `function flatten(arr, depth = Infinity) {
  // TODO : aplatir arr jusqu'à la profondeur depth
  return arr
}`,
    solution: `function flatten(arr, depth = Infinity) {
  const result = []
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // on descend d'un niveau : la profondeur restante diminue
      result.push(...flatten(item, depth - 1))
    } else {
      result.push(item)
    }
  }
  return result
}`,
    tests: [
      {
        name: 'aplatit complètement par défaut',
        code: `assertEqual(flatten([1, [2, [3, [4, [5]]]], 6]), [1, 2, 3, 4, 5, 6])`,
      },
      {
        name: 'respecte la profondeur demandée',
        code: `assertEqual(flatten([1, [2, [3, [4]]]], 1), [1, 2, [3, [4]]])
assertEqual(flatten([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]])`,
      },
      {
        name: 'depth = 0 renvoie une copie',
        code: `const src = [[1], [[2]]]
const out = flatten(src, 0)
assertEqual(out, [[1], [[2]]])
assert(out !== src, 'un nouveau tableau est attendu')`,
      },
      {
        name: 'tableau vide et sous-tableaux vides',
        code: `assertEqual(flatten([]), [])
assertEqual(flatten([[], [[]], 1]), [1])`,
      },
      {
        name: 'ne modifie pas l’entrée',
        code: `const src = [1, [2, [3]]]
flatten(src)
assertEqual(src, [1, [2, [3]]])`,
      },
      {
        name: 'fonctionne sans Array.prototype.flat',
        code: `const flat = Array.prototype.flat
const flatMap = Array.prototype.flatMap
Array.prototype.flat = undefined
Array.prototype.flatMap = undefined
try {
  assertEqual(flatten([1, [2, [3]]]), [1, 2, 3])
} finally {
  Array.prototype.flat = flat
  Array.prototype.flatMap = flatMap
}`,
      },
    ],
    hints: [
      'Parcourez le tableau : un élément qui n’est pas un tableau est ajouté tel quel au résultat.',
      'Pour un sous-tableau, appelez `flatten` récursivement avec `depth - 1`, tant que `depth > 0`.',
      'Variante concise : `arr.reduce((acc, x) => ..., [])`.',
    ],
    discussion: `**Complexité** : O(n) en temps (n = nombre total d'éléments, tous niveaux confondus) ; la version récursive avec spread crée des tableaux intermédiaires, une pile explicite les évite.

**Points à évoquer** :

- \`Array.isArray\` plutôt que \`instanceof Array\` (fiable entre iframes/realms) ;
- version itérative avec pile : utile pour des imbrications très profondes (pas de dépassement de pile) ;
- \`result.push(...big)\` peut dépasser la limite d'arguments sur de très grands tableaux : préférer une boucle ;
- la méthode native \`flat\` ignore les trous (\`[1, , 2].flat()\` donne \`[1, 2]\`) ;
- immutabilité : on renvoie toujours un nouveau tableau, comme \`map\`/\`filter\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'curry',
    title: 'Curryfication',
    difficulty: 'moyen',
    theme: 'closures',
    category: 'utilitaire',
    statement: `Écrivez \`curry(fn)\` qui renvoie une version **curryfiée** de \`fn\` : on peut lui passer les arguments en une ou plusieurs fois, dans n'importe quel regroupement. Dès que le nombre d'arguments reçus atteint l'arité de \`fn\` (\`fn.length\`), \`fn\` est appelée et son résultat renvoyé ; sinon, on renvoie une fonction qui attend la suite.

Exigences :

- les fonctions intermédiaires sont **réutilisables** : appeler deux fois \`add1\` avec des arguments différents donne deux résultats indépendants ;
- si \`fn.length\` vaut 0, l'appel \`curry(fn)()\` exécute \`fn\`.

Exemple, avec \`const add = (a, b, c) => a + b + c\` et \`const c = curry(add)\` :

- \`c(1)(2)(3)\`, \`c(1, 2)(3)\`, \`c(1)(2, 3)\` et \`c(1, 2, 3)\` valent tous \`6\` ;
- \`const add1 = c(1)\` puis \`add1(2)(3)\` vaut \`6\` et \`add1(10, 20)\` vaut \`31\`.`,
    starter: `function curry(fn) {
  // TODO : accumuler les arguments jusqu'à fn.length
}`,
    solution: `function curry(fn) {
  return function curried(...args) {
    // assez d'arguments : on appelle la fonction d'origine
    if (args.length >= fn.length) return fn.apply(this, args)
    // sinon on renvoie une nouvelle fonction qui concatène les arguments
    // (sans muter args : chaque fonction intermédiaire reste réutilisable)
    return function (...more) {
      return curried.apply(this, [...args, ...more])
    }
  }
}`,
    tests: [
      {
        name: 'un argument à la fois',
        code: `const c = curry((a, b, c) => a + b + c)
assertEqual(c(1)(2)(3), 6)`,
      },
      {
        name: 'regroupements variés',
        code: `const c = curry((a, b, c) => a * 100 + b * 10 + c)
assertEqual(c(1, 2)(3), 123)
assertEqual(c(1)(2, 3), 123)
assertEqual(c(1, 2, 3), 123)`,
      },
      {
        name: 'les fonctions intermédiaires sont réutilisables',
        code: `const c = curry((a, b, c) => a + b + c)
const add1 = c(1)
assertEqual(add1(2)(3), 6)
assertEqual(add1(10, 20), 31)
const add1and2 = add1(2)
assertEqual(add1and2(3), 6)
assertEqual(add1and2(100), 103)`,
      },
      {
        name: 'fonction d’arité 1 et d’arité 0',
        code: `assertEqual(curry((x) => x * 2)(21), 42)
assertEqual(curry(() => 'ok')(), 'ok')`,
      },
      {
        name: 'renvoie une fonction tant qu’il manque des arguments',
        code: `const c = curry((a, b, c) => a + b + c)
assertEqual(typeof c(1), 'function')
assertEqual(typeof c(1)(2), 'function')`,
      },
    ],
    hints: [
      '`fn.length` donne le nombre de paramètres déclarés : c’est le seuil à atteindre.',
      'Écrivez une fonction interne `curried(...args)` : si `args.length >= fn.length`, appelez `fn` ; sinon renvoyez une fonction qui rappelle `curried` avec les arguments concaténés.',
      'Ne mutez pas un tableau d’arguments partagé : créez un nouveau tableau `[...args, ...more]` à chaque étape, sinon `add1` « se souvient » des appels précédents.',
    ],
    discussion: `**Complexité** : chaque appel partiel copie les arguments déjà reçus, O(k) pour k arguments ; négligeable en pratique.

**Points à évoquer** :

- \`fn.length\` ignore les paramètres du reste (\`...args\`) et ceux qui suivent le premier paramètre avec valeur par défaut : pour ces fonctions il faut passer l'arité explicitement (\`curry(fn, n)\`) ;
- curryfication vs **application partielle** (\`fn.bind(null, 1)\`) : la première transforme une fonction n-aire en chaîne de fonctions unaires, la seconde fixe quelques arguments une fois ;
- intérêt : composition (\`pipe\`), configuration progressive (\`log('erreur')('api')(message)\`) ;
- Ramda / Lodash proposent des « placeholders » (\`_\`) pour sauter un argument ;
- la closure capture \`args\` : c'est l'exemple typique pour montrer qu'une closure garde son environnement vivant.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'memoize',
    title: 'Mémoïsation',
    difficulty: 'moyen',
    theme: 'perf',
    category: 'utilitaire',
    statement: `Écrivez \`memoize(fn, resolver)\` qui renvoie une version de \`fn\` **mettant en cache** ses résultats : pour une même clé, \`fn\` n'est exécutée qu'une seule fois, les appels suivants renvoient la valeur mémorisée.

Règles :

- la clé de cache est \`resolver(...args)\` si \`resolver\` est fourni, sinon \`JSON.stringify(args)\` (suffisant pour des arguments primitifs) ;
- \`fn\` est appelée avec le **même \`this\`** et les mêmes arguments que la fonction mémoïsée ;
- un résultat \`undefined\` (ou \`0\`, \`''\`, \`null\`) est lui aussi mis en cache : \`fn\` ne doit pas être rappelée.

Exemple : \`const slowSquare = memoize((n) => { /* calcul long */ return n * n })\` ; \`slowSquare(9)\` calcule \`81\`, un second \`slowSquare(9)\` le renvoie sans recalculer. \`memoize(getUser, (user) => user.id)\` utilise l'identifiant comme clé.`,
    starter: `function memoize(fn, resolver) {
  // TODO : mettre en cache les résultats de fn
  return fn
}`,
    solution: `function memoize(fn, resolver) {
  const cache = new Map() // clé → résultat, conservé dans la closure
  return function (...args) {
    const key = resolver ? resolver.apply(this, args) : JSON.stringify(args)
    // has() et non get() : un résultat undefined doit aussi être servi depuis le cache
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}`,
    tests: [
      {
        name: 'n’exécute fn qu’une fois pour les mêmes arguments',
        code: `let calls = 0
const square = memoize((n) => { calls++; return n * n })
assertEqual(square(9), 81)
assertEqual(square(9), 81)
assertEqual(square(9), 81)
assertEqual(calls, 1)`,
      },
      {
        name: 'des arguments différents donnent des entrées différentes',
        code: `let calls = 0
const sub = memoize((a, b) => { calls++; return a - b })
assertEqual(sub(5, 2), 3)
assertEqual(sub(2, 5), -3)
assertEqual(sub(5, 2), 3)
assertEqual(calls, 2)`,
      },
      {
        name: 'met aussi en cache undefined et les valeurs fausses',
        code: `let calls = 0
const f = memoize((x) => { calls++; return x === 'u' ? undefined : 0 })
f('u'); f('u')
f('z'); f('z')
assertEqual(calls, 2)`,
      },
      {
        name: 'transmet this et les arguments',
        code: `const counter = {
  factor: 3,
  times: memoize(function (n) { return n * this.factor }),
}
assertEqual(counter.times(5), 15)`,
      },
      {
        name: 'utilise le resolver comme clé',
        code: `let calls = 0
const getName = memoize((user) => { calls++; return user.name.toUpperCase() }, (user) => user.id)
assertEqual(getName({ id: 1, name: 'ada' }), 'ADA')
assertEqual(getName({ id: 1, name: 'autre' }), 'ADA', 'même id : valeur du cache')
assertEqual(getName({ id: 2, name: 'bob' }), 'BOB')
assertEqual(calls, 2)`,
      },
    ],
    hints: [
      'Un `Map` dans la closure de `memoize` sert de cache, partagé par tous les appels.',
      'Calculez la clé, puis `cache.has(key)` : si présente, renvoyez `cache.get(key)` ; sinon appelez `fn`, stockez et renvoyez.',
      'Pour transmettre `this`, renvoyez une `function` classique et utilisez `fn.apply(this, args)`.',
    ],
    discussion: `**Complexité** : O(1) en moyenne par appel après calcul de la clé, mais \`JSON.stringify\` coûte O(taille des arguments). Mémoire : O(nombre de clés distinctes), **sans limite**.

**Points à évoquer** :

- le cache grossit indéfiniment : borner sa taille (cache **LRU**) ou lui donner une durée de vie ;
- clés objets : \`JSON.stringify\` ignore les fonctions, ordonne selon l'insertion des clés et plante sur les cycles ; pour un argument objet unique, un \`WeakMap\` indexé par référence évite les fuites mémoire ;
- ne mémoïser que des fonctions **pures** (même entrée, même sortie, pas d'effet de bord) ;
- fonctions asynchrones : mettre en cache la **promesse** déduplique les requêtes concurrentes, mais il faut l'évincer si elle échoue ;
- exemple classique : Fibonacci récursif passe d'exponentiel à linéaire ; en React, \`useMemo\`, \`React.memo\`, \`reselect\` reposent sur la même idée (avec un cache de taille 1).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'promise-all',
    title: 'Polyfill de Promise.all',
    difficulty: 'moyen',
    theme: 'async',
    category: 'utilitaire',
    statement: `Écrivez \`promiseAll(values)\` qui se comporte comme \`Promise.all\`, **sans utiliser** \`Promise.all\`, \`Promise.allSettled\`, \`Promise.any\` ni \`Promise.race\`.

\`values\` est un tableau pouvant mélanger promesses et valeurs ordinaires. La fonction renvoie **une promesse** qui :

- se résout avec le tableau des résultats **dans l'ordre du tableau d'entrée**, quel que soit l'ordre dans lequel les promesses se résolvent ;
- traite une valeur non-promesse comme une promesse déjà résolue ;
- se rejette dès la **première** promesse rejetée (dans le temps), avec sa raison ;
- se résout immédiatement avec \`[]\` si le tableau est vide.

Exemple : \`promiseAll([fetchA(), 42, fetchB()])\` donne \`[a, 42, b]\` ; si \`fetchB()\` échoue, la promesse est rejetée avec l'erreur de \`fetchB\`.`,
    starter: `function promiseAll(values) {
  // TODO : renvoyer une promesse résolue avec tous les résultats, dans l'ordre
}`,
    solution: `function promiseAll(values) {
  return new Promise((resolve, reject) => {
    const results = new Array(values.length)
    let remaining = values.length
    // tableau vide : sinon on n'appellerait jamais resolve
    if (remaining === 0) return resolve(results)

    values.forEach((value, index) => {
      // Promise.resolve gère indifféremment promesses, thenables et valeurs simples
      Promise.resolve(value).then((result) => {
        results[index] = result // on range par index, pas par ordre d'arrivée
        remaining -= 1
        if (remaining === 0) resolve(results)
      }, reject) // le premier rejet l'emporte ; les suivants sont ignorés
    })
  })
}`,
    tests: [
      {
        name: 'renvoie une promesse',
        code: `const p = promiseAll([1])
assert(p && typeof p.then === 'function', 'une promesse est attendue')
await p`,
      },
      {
        name: 'conserve l’ordre d’entrée',
        code: `const delayed = (value, ms) => new Promise((r) => setTimeout(() => r(value), ms))
const out = await promiseAll([delayed('a', 60), delayed('b', 10), delayed('c', 30)])
assertEqual(out, ['a', 'b', 'c'])`,
      },
      {
        name: 'accepte des valeurs non-promesses',
        code: `const out = await promiseAll([1, Promise.resolve(2), 'trois', null])
assertEqual(out, [1, 2, 'trois', null])`,
      },
      {
        name: 'un tableau vide donne []',
        code: `assertEqual(await promiseAll([]), [])`,
      },
      {
        name: 'propage le premier rejet',
        code: `const later = (fn, ms) => new Promise((res, rej) => setTimeout(() => fn(res, rej), ms))
let error = null
try {
  await promiseAll([
    later((res) => res(1), 10),
    later((res, rej) => rej(new Error('lent')), 80),
    later((res, rej) => rej(new Error('rapide')), 30),
  ])
} catch (e) {
  error = e
}
assert(error, 'la promesse aurait dû être rejetée')
assertEqual(error.message, 'rapide')
await sleep(100)`,
      },
      {
        name: 'fonctionne sans Promise.all',
        code: `const saved = { all: Promise.all, allSettled: Promise.allSettled }
Promise.all = Promise.allSettled = () => { throw new Error('interdit') }
try {
  assertEqual(await promiseAll([Promise.resolve('x'), 'y']), ['x', 'y'])
} finally {
  Promise.all = saved.all
  Promise.allSettled = saved.allSettled
}`,
      },
    ],
    hints: [
      'Renvoyez `new Promise((resolve, reject) => ...)` et tenez un compteur des promesses restantes.',
      'Enveloppez chaque élément dans `Promise.resolve(value)` pour traiter valeurs et promesses de la même façon, et rangez le résultat à son **index**.',
      'N’oubliez pas le cas du tableau vide : avec un compteur à zéro, aucun `then` ne déclenchera `resolve`.',
    ],
    discussion: `**Complexité** : O(n) ; toutes les promesses s'exécutent **en parallèle** (elles sont déjà lancées quand on les reçoit), la durée totale est celle de la plus lente.

**Points à évoquer** :

- appeler \`resolve\`/\`reject\` plusieurs fois est sans effet : c'est ce qui rend le « premier rejet gagne » si simple ;
- un rejet n'**annule pas** les autres opérations (pas d'annulation native : \`AbortController\` pour fetch) ;
- variantes : \`allSettled\` (attend tout, renvoie \`{ status, value | reason }\`), \`race\` (première promesse réglée), \`any\` (première résolue, \`AggregateError\` si toutes échouent) ;
- la vraie \`Promise.all\` accepte n'importe quel **itérable** (Set, générateur) : \`Array.from(values)\` au début ;
- erreur fréquente : \`results.push(result)\` au lieu de \`results[index]\`, qui range dans l'ordre d'arrivée ;
- limiter la concurrence (pool de N requêtes à la fois) est une question de suivi classique.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'group-by',
    title: 'groupBy',
    difficulty: 'facile',
    theme: 'arrays',
    category: 'utilitaire',
    statement: `Écrivez \`groupBy(arr, keyOrFn)\` qui regroupe les éléments de \`arr\` dans un **objet simple** : chaque clé correspond à un groupe, et sa valeur est le tableau des éléments de ce groupe, **dans leur ordre d'origine**.

- si \`keyOrFn\` est une **fonction**, la clé d'un élément est \`keyOrFn(element)\` ;
- si c'est une **chaîne**, la clé est \`element[keyOrFn]\` ;
- un tableau vide donne \`{}\` ;
- n'utilisez pas \`Object.groupBy\` ni \`Map.groupBy\`.

Exemples :

- \`groupBy([1.2, 1.8, 2.5], Math.floor)\` donne \`{ 1: [1.2, 1.8], 2: [2.5] }\` ;
- \`groupBy([{ t: 'a' }, { t: 'b' }, { t: 'a' }], 't')\` donne \`{ a: [{ t: 'a' }, { t: 'a' }], b: [{ t: 'b' }] }\`.`,
    starter: `function groupBy(arr, keyOrFn) {
  // TODO : regrouper les éléments par clé
  return {}
}`,
    solution: `function groupBy(arr, keyOrFn) {
  // on normalise : une chaîne devient une fonction d'accès à la propriété
  const getKey = typeof keyOrFn === 'function' ? keyOrFn : (item) => item[keyOrFn]
  const groups = {}
  for (const item of arr) {
    const key = getKey(item)
    // créer le groupe à la première rencontre, puis empiler
    if (!Object.prototype.hasOwnProperty.call(groups, key)) groups[key] = []
    groups[key].push(item)
  }
  return groups
}`,
    tests: [
      {
        name: 'regroupe avec une fonction',
        code: `assertEqual(groupBy([1.2, 1.8, 2.5, 3.1], Math.floor), { 1: [1.2, 1.8], 2: [2.5], 3: [3.1] })`,
      },
      {
        name: 'regroupe par nom de propriété',
        code: `const people = [
  { name: 'Ana', team: 'front' },
  { name: 'Bob', team: 'back' },
  { name: 'Cid', team: 'front' },
]
assertEqual(groupBy(people, 'team'), {
  front: [{ name: 'Ana', team: 'front' }, { name: 'Cid', team: 'front' }],
  back: [{ name: 'Bob', team: 'back' }],
})`,
      },
      {
        name: 'conserve l’ordre des éléments dans chaque groupe',
        code: `const words = ['pomme', 'kiwi', 'poire', 'kaki', 'prune']
assertEqual(groupBy(words, (w) => w[0]), { p: ['pomme', 'poire', 'prune'], k: ['kiwi', 'kaki'] })`,
      },
      {
        name: 'un tableau vide donne un objet vide',
        code: `assertEqual(groupBy([], (x) => x), {})`,
      },
      {
        name: 'fonctionne sans Object.groupBy',
        code: `const saved = Object.groupBy
Object.groupBy = undefined
try {
  assertEqual(groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'impair' : 'pair')), { impair: [1, 3], pair: [2, 4] })
} finally {
  Object.groupBy = saved
}`,
      },
    ],
    hints: [
      'Commencez par transformer `keyOrFn` en fonction : `typeof keyOrFn === "function"` ou un accès `item[keyOrFn]`.',
      'Parcourez le tableau ; si le groupe n’existe pas encore, créez un tableau vide, puis `push`.',
      'Variante en une expression : `arr.reduce((acc, item) => { ... ; return acc }, {})`.',
    ],
    discussion: `**Complexité** : O(n) en temps et en mémoire.

**Points à évoquer** :

- \`Object.groupBy\` (ES2024) renvoie un objet **sans prototype** ; \`Map.groupBy\` garde les clés non-chaînes (objets, nombres) sans les convertir ;
- avec un objet, toutes les clés deviennent des **chaînes** (\`1\` et \`'1'\` fusionnent) ; une \`Map\` évite ce piège ;
- danger d'une clé \`'__proto__'\` sur un objet littéral : \`Object.create(null)\` ou \`Map\` pour des clés venant de l'utilisateur ;
- \`hasOwnProperty\` plutôt que \`groups[key] ||= []\` pour ne pas tomber sur des propriétés héritées comme \`toString\` ;
- variantes : \`countBy\`, \`keyBy\`, \`partition\` (deux groupes selon un prédicat).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'unique',
    title: 'Dédoublonner un tableau',
    difficulty: 'facile',
    theme: 'arrays',
    category: 'utilitaire',
    statement: `Écrivez \`unique(arr)\` qui renvoie un **nouveau tableau** sans doublons, en **conservant l'ordre de première apparition**.

- l'égalité suit l'algorithme *SameValueZero* (celui de \`Set\` et \`includes\`) : \`NaN\` est égal à \`NaN\`, \`0\` et \`-0\` sont égaux ;
- les objets sont comparés **par référence** : deux objets \`{}\` distincts sont tous les deux conservés ;
- le tableau d'entrée n'est pas modifié ; un tableau vide donne \`[]\`.

Exemples :

- \`unique([3, 1, 3, 2, 1])\` donne \`[3, 1, 2]\` ;
- \`unique([NaN, 1, NaN])\` donne \`[NaN, 1]\`.`,
    starter: `function unique(arr) {
  // TODO : supprimer les doublons en gardant l'ordre
  return arr
}`,
    solution: `function unique(arr) {
  // Set utilise SameValueZero (NaN === NaN, 0 === -0) et conserve l'ordre d'insertion
  return [...new Set(arr)]
}`,
    tests: [
      {
        name: 'supprime les doublons en gardant l’ordre',
        code: `assertEqual(unique([3, 1, 3, 2, 1]), [3, 1, 2])
assertEqual(unique(['b', 'a', 'b', 'c', 'a']), ['b', 'a', 'c'])`,
      },
      {
        name: 'NaN n’apparaît qu’une fois',
        code: `const out = unique([NaN, 1, NaN, 2, NaN])
assertEqual(out.length, 3)
assert(Number.isNaN(out[0]) && out[1] === 1 && out[2] === 2)`,
      },
      {
        name: 'distingue les types et compare les objets par référence',
        code: `const o = { a: 1 }
const out = unique([1, '1', o, o, { a: 1 }, null, undefined, null])
assertEqual(out.length, 6)
assert(out[2] === o && out[3] !== o, 'o gardé une fois, l’autre objet conservé')`,
      },
      {
        name: 'tableau vide',
        code: `assertEqual(unique([]), [])`,
      },
      {
        name: 'ne modifie pas l’entrée et renvoie un nouveau tableau',
        code: `const src = [1, 2, 2, 3]
const out = unique(src)
assertEqual(src, [1, 2, 2, 3])
const noDup = [1, 2]
assert(unique(noDup) !== noDup, 'un nouveau tableau est attendu')`,
      },
    ],
    hints: [
      'Une structure native ne garde que des valeurs uniques et conserve l’ordre d’insertion…',
      '`[...new Set(arr)]` répond à tout l’énoncé, y compris `NaN`.',
      'Sans `Set` : `filter` + `indexOf` échoue sur `NaN` (`indexOf` utilise `===`) ; `includes` fonctionne mais en O(n²).',
    ],
    discussion: `**Complexité** : O(n) avec un \`Set\` (insertion et test en O(1) en moyenne), contre O(n²) pour \`arr.filter((x, i) => arr.indexOf(x) === i)\`.

**Points à évoquer** :

- piège \`indexOf(NaN)\` vaut toujours \`-1\` : la version \`filter\`/\`indexOf\` **supprime** tous les NaN ;
- dédoublonner des objets par contenu : utiliser une clé (\`uniqueBy(arr, (u) => u.id)\`) avec un \`Map\` ou un \`Set\` de clés vues ;
- \`Array.from(new Set(arr))\` est équivalent au spread ;
- les trois égalités de JS : \`===\` (NaN ≠ NaN), \`Object.is\` (0 ≠ -0), *SameValueZero* (Set, Map, includes).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'event-emitter',
    title: 'EventEmitter',
    difficulty: 'moyen',
    theme: 'prototypes',
    category: 'utilitaire',
    statement: `Écrivez une classe \`EventEmitter\` (modèle publication / abonnement, comme celui de Node) avec les méthodes suivantes :

- \`on(event, listener)\` : abonne \`listener\` à \`event\` ; renvoie \`this\` pour permettre le chaînage ;
- \`off(event, listener)\` : désabonne ce listener (une seule occurrence) ; renvoie \`this\` ; ne fait rien s'il n'est pas abonné ;
- \`once(event, listener)\` : abonne un listener qui sera **automatiquement retiré** après sa première exécution ; \`off(event, listener)\` avec la fonction d'origine doit aussi pouvoir le retirer avant qu'il ne s'exécute ; renvoie \`this\` ;
- \`emit(event, ...args)\` : appelle les listeners de \`event\` **dans l'ordre d'abonnement** avec \`args\` ; renvoie \`true\` s'il y avait au moins un listener, \`false\` sinon.

Pendant un \`emit\`, la liste des listeners est **figée** : ajouter ou retirer un listener (y compris un \`once\` qui se retire lui-même) n'affecte pas les appels en cours, seulement les émissions suivantes.

Exemple : \`emitter.on('msg', (a, b) => console.log(a + b))\` puis \`emitter.emit('msg', 1, 2)\` affiche \`3\`.`,
    starter: `class EventEmitter {
  on(event, listener) {
    // TODO
  }
  off(event, listener) {
    // TODO
  }
  once(event, listener) {
    // TODO
  }
  emit(event, ...args) {
    // TODO
  }
}`,
    solution: `class EventEmitter {
  constructor() {
    this.listeners = new Map() // nom d'événement → tableau de listeners
  }

  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(listener)
    return this
  }

  off(event, listener) {
    const list = this.listeners.get(event)
    if (!list) return this
    // on retire le listener lui-même, ou l'enveloppe once qui le référence
    const index = list.findIndex((l) => l === listener || l.original === listener)
    if (index !== -1) list.splice(index, 1)
    return this
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper) // se retire avant de s'exécuter
      listener.apply(this, args)
    }
    wrapper.original = listener // permet off(event, listener) avant le premier emit
    return this.on(event, wrapper)
  }

  emit(event, ...args) {
    const list = this.listeners.get(event)
    if (!list || list.length === 0) return false
    // copie : un off() pendant l'émission ne décale pas la boucle
    for (const listener of [...list]) listener.apply(this, args)
    return true
  }
}`,
    tests: [
      {
        name: 'on et emit transmettent les arguments dans l’ordre d’abonnement',
        code: `const e = new EventEmitter()
const log = []
e.on('msg', (a, b) => log.push('1:' + a + b))
e.on('msg', (a, b) => log.push('2:' + a + b))
assertEqual(e.emit('msg', 'x', 'y'), true)
assertEqual(log, ['1:xy', '2:xy'])`,
      },
      {
        name: 'emit renvoie false sans listener',
        code: `const e = new EventEmitter()
assertEqual(e.emit('rien'), false)
const f = () => {}
e.on('a', f)
e.off('a', f)
assertEqual(e.emit('a'), false)`,
      },
      {
        name: 'off retire uniquement le listener visé',
        code: `const e = new EventEmitter()
const log = []
const a = () => log.push('a')
const b = () => log.push('b')
e.on('ev', a).on('ev', b)
e.off('ev', a)
e.off('ev', () => {}) // inconnu : sans effet
e.emit('ev')
assertEqual(log, ['b'])`,
      },
      {
        name: 'once ne s’exécute qu’une fois',
        code: `const e = new EventEmitter()
let count = 0
e.once('ping', (n) => { count += n })
e.emit('ping', 5)
e.emit('ping', 5)
assertEqual(count, 5)`,
      },
      {
        name: 'un once qui se retire ne fait pas sauter le listener suivant',
        code: `const e = new EventEmitter()
const log = []
e.once('ev', () => log.push('once'))
e.on('ev', () => log.push('toujours'))
e.emit('ev')
e.emit('ev')
assertEqual(log, ['once', 'toujours', 'toujours'])`,
      },
      {
        name: 'off pendant un emit n’affecte que les émissions suivantes',
        code: `const e = new EventEmitter()
const log = []
const b = () => log.push('b')
e.on('ev', () => { log.push('a'); e.off('ev', b) })
e.on('ev', b)
e.emit('ev')
e.emit('ev')
assertEqual(log, ['a', 'b', 'a'])`,
      },
      {
        name: 'off avec la fonction d’origine retire un once',
        code: `const e = new EventEmitter()
let called = false
const f = () => { called = true }
const ret = e.once('ev', f)
assert(ret === e, 'once doit renvoyer this')
e.off('ev', f)
e.emit('ev')
assertEqual(called, false)`,
      },
    ],
    hints: [
      'Stockez les abonnements dans un `Map` (ou un objet) : nom d’événement → tableau de fonctions.',
      'Pour `once`, abonnez une fonction enveloppe qui appelle `off` sur elle-même puis le listener ; gardez une référence vers la fonction d’origine (`wrapper.original = listener`) pour que `off` la retrouve.',
      'Dans `emit`, itérez sur une **copie** du tableau (`[...list]`) : sinon un `splice` pendant la boucle décale les index et saute un listener.',
    ],
    discussion: `**Complexité** : \`on\` en O(1), \`off\` et \`emit\` en O(k) pour k listeners de l'événement (la copie dans \`emit\` coûte aussi O(k)).

**Points à évoquer** :

- l'alternative \`on\` renvoyant une fonction de désabonnement (\`const unsubscribe = on(...)\`) est plus pratique en React (\`useEffect\` cleanup) ;
- **fuites mémoire** : un listener jamais retiré garde en vie tout ce que sa closure capture ; Node avertit au-delà de 10 listeners (\`setMaxListeners\`) ;
- gestion d'erreur : un listener qui lève une exception interrompt les suivants ; on peut entourer chaque appel d'un \`try/catch\` ; Node lève si \`'error'\` est émis sans listener ;
- \`EventTarget\` (navigateur, et Node) est l'équivalent standard, avec \`addEventListener\` et l'option \`{ once: true }\` ;
- appels synchrones : \`emit\` exécute les listeners immédiatement, pas en microtâche.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'compose-pipe',
    title: 'compose et pipe',
    difficulty: 'facile',
    theme: 'closures',
    category: 'utilitaire',
    statement: `Écrivez deux fonctions de composition :

- \`pipe(...fns)\` renvoie une fonction qui applique les fonctions **de gauche à droite** : \`pipe(f, g, h)(x)\` vaut \`h(g(f(x)))\` ;
- \`compose(...fns)\` les applique **de droite à gauche** : \`compose(f, g, h)(x)\` vaut \`f(g(h(x)))\`.

Détails :

- la **première fonction appliquée** peut recevoir plusieurs arguments (\`pipe(Math.max, String)(1, 5, 3)\` vaut \`'5'\`) ; les suivantes reçoivent le résultat précédent ;
- sans aucune fonction, le résultat est la fonction **identité** (elle renvoie son premier argument) ;
- la fonction renvoyée est réutilisable autant de fois que voulu.

Exemple : \`const slug = pipe(trim, toLower, (s) => s.replace(/ /g, '-'))\` ; \`slug('  Hello World ')\` vaut \`'hello-world'\`.`,
    starter: `function compose(...fns) {
  // TODO : appliquer les fonctions de droite à gauche
}

function pipe(...fns) {
  // TODO : appliquer les fonctions de gauche à droite
}`,
    solution: `function pipe(...fns) {
  return function (...args) {
    if (fns.length === 0) return args[0] // identité
    // la première fonction reçoit tous les arguments, les suivantes le résultat
    return fns.slice(1).reduce((acc, fn) => fn(acc), fns[0].apply(this, args))
  }
}

function compose(...fns) {
  // compose, c'est pipe dans l'autre sens (copie pour ne pas inverser fns en place)
  return pipe(...[...fns].reverse())
}`,
    tests: [
      {
        name: 'pipe applique de gauche à droite',
        code: `const add1 = (x) => x + 1
const double = (x) => x * 2
assertEqual(pipe(add1, double)(5), 12)
assertEqual(pipe(double, add1)(5), 11)`,
      },
      {
        name: 'compose applique de droite à gauche',
        code: `const add1 = (x) => x + 1
const double = (x) => x * 2
assertEqual(compose(add1, double)(5), 11)
assertEqual(compose(double, add1)(5), 12)`,
      },
      {
        name: 'la première fonction appliquée reçoit plusieurs arguments',
        code: `assertEqual(pipe(Math.max, String)(1, 5, 3), '5')
assertEqual(compose(String, (a, b) => a + b)(2, 3), '5')`,
      },
      {
        name: 'sans fonction : identité',
        code: `assertEqual(pipe()(42), 42)
assertEqual(compose()('x'), 'x')`,
      },
      {
        name: 'une seule fonction et réutilisation',
        code: `const exclaim = (s) => s + '!'
const f = compose(exclaim)
assertEqual(f('a'), 'a!')
assertEqual(f('b'), 'b!')
const g = pipe(exclaim, exclaim, exclaim)
assertEqual(g('c'), 'c!!!')
assertEqual(g('d'), 'd!!!')`,
      },
    ],
    hints: [
      'La composition est une réduction : on part de la valeur et on applique chaque fonction au résultat précédent.',
      '`fns.reduce((acc, fn) => fn(acc), x)` donne `pipe` pour un seul argument ; `reduceRight` donne `compose`.',
      'Pour plusieurs arguments, appliquez la première fonction à part (`fns[0](...args)`), puis réduisez le reste. Une fois `pipe` écrite, `compose` s’en déduit en inversant une **copie** de `fns`.',
    ],
    discussion: `**Complexité** : O(n) appels pour n fonctions ; la construction est O(1) (ou O(n) pour la copie inversée).

**Points à évoquer** :

- \`pipe\` se lit dans l'ordre d'exécution, \`compose\` suit la notation mathématique (f ∘ g) : Redux exporte \`compose\` pour assembler des middlewares ;
- attention à \`fns.reverse()\` qui **mute** le tableau : bug sournois si la fonction renvoyée est appelée plusieurs fois ;
- version asynchrone : réduire sur des promesses (\`acc.then(fn)\`) ;
- la composition favorise des fonctions **unaires** et pures, d'où le lien avec la curryfication ;
- l'opérateur pipeline \`|>\` est en proposition TC39 depuis des années.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'deep-equal',
    title: 'Égalité profonde',
    difficulty: 'moyen',
    theme: 'objects',
    category: 'utilitaire',
    statement: `Écrivez \`deepEqual(a, b)\` qui renvoie \`true\` si \`a\` et \`b\` sont **structurellement égaux**, \`false\` sinon.

Règles :

- primitives : comparées avec \`Object.is\` (donc \`NaN\` est égal à \`NaN\`) ;
- tableaux : même longueur et éléments égaux deux à deux, **dans le même ordre** ;
- objets : mêmes clés propres énumérables (l'ordre des clés ne compte pas) et valeurs égales récursivement ;
- un tableau n'est **jamais** égal à un objet non-tableau, même avec les mêmes clés ;
- \`null\` n'est égal qu'à \`null\` ; une clé absente n'est pas équivalente à une clé valant \`undefined\`.

Exemples :

- \`deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })\` vaut \`true\` ;
- \`deepEqual([1, 2], { 0: 1, 1: 2 })\` vaut \`false\` ;
- \`deepEqual({ a: undefined }, { b: undefined })\` vaut \`false\`.`,
    starter: `function deepEqual(a, b) {
  // TODO : comparer récursivement
  return a === b
}`,
    solution: `function deepEqual(a, b) {
  // même valeur primitive ou même référence (NaN compris grâce à Object.is)
  if (Object.is(a, b)) return true
  // si l'un des deux n'est pas un objet (ou est null), ils sont différents
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  // un tableau n'égale jamais un objet simple
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false // couvre aussi la longueur des tableaux
  // chaque clé de a doit exister dans b avec une valeur profondément égale
  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]))
}`,
    tests: [
      {
        name: 'primitives et NaN',
        code: `assert(deepEqual(1, 1) && deepEqual('a', 'a') && deepEqual(null, null) && deepEqual(undefined, undefined))
assert(deepEqual(NaN, NaN), 'NaN doit être égal à NaN')
assert(!deepEqual(1, '1'), '1 et "1" sont différents')
assert(!deepEqual(null, undefined), 'null et undefined sont différents')`,
      },
      {
        name: 'objets imbriqués, ordre des clés indifférent',
        code: `assert(deepEqual({ a: 1, b: { c: [1, 2], d: 'x' } }, { b: { d: 'x', c: [1, 2] }, a: 1 }))
assert(!deepEqual({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 3] } }), 'valeur profonde différente')`,
      },
      {
        name: 'tableaux : ordre et longueur comptent',
        code: `assert(deepEqual([1, [2, [3]]], [1, [2, [3]]]))
assert(!deepEqual([1, 2], [2, 1]), 'ordre différent')
assert(!deepEqual([1, 2], [1, 2, 3]), 'longueur différente')
assert(deepEqual([], []))`,
      },
      {
        name: 'un tableau n’est pas un objet',
        code: `assert(!deepEqual([1, 2], { 0: 1, 1: 2 }))
assert(!deepEqual({}, []))
assert(!deepEqual([], {}))`,
      },
      {
        name: 'clés manquantes ou en trop',
        code: `assert(!deepEqual({ a: undefined }, { b: undefined }), 'clés différentes')
assert(!deepEqual({ a: 1 }, { a: 1, b: 2 }), 'clé en trop')
assert(!deepEqual({ a: 1, b: 2 }, { a: 1 }), 'clé manquante')`,
      },
      {
        name: 'null face à un objet',
        code: `assert(!deepEqual(null, {}))
assert(!deepEqual({}, null))
assert(!deepEqual({ a: null }, { a: {} }))
assert(deepEqual({ a: null }, { a: null }))`,
      },
    ],
    hints: [
      'Commencez par `Object.is(a, b)` : il couvre les primitives égales, `NaN` et les références identiques.',
      'Si l’un des deux n’est pas un objet non nul, ils sont différents. Vérifiez ensuite que les deux sont des tableaux, ou aucun des deux.',
      'Comparez les listes de clés (`Object.keys`) : même nombre, et chaque clé de `a` présente dans `b` (`hasOwnProperty`) avec une valeur égale récursivement.',
    ],
    discussion: `**Complexité** : O(n) pour n valeurs comparées ; s'arrête dès la première différence grâce à \`every\`.

**Points à évoquer** :

- \`Object.is\` vs \`===\` : \`Object.is(0, -0)\` vaut \`false\` ; selon le besoin, on peut préférer considérer \`0\` et \`-0\` égaux ;
- **cycles** : sans protection, deux structures circulaires font boucler à l'infini ; on mémorise les paires déjà comparées dans un \`Map\`/\`WeakMap\` ;
- types spéciaux à ajouter : \`Date\` (comparer \`getTime()\`), \`RegExp\`, \`Map\`, \`Set\`, typed arrays ;
- faut-il comparer les **prototypes** ? \`deepEqual(new Point(1, 2), { x: 1, y: 2 })\` : question de spécification à poser au recruteur ;
- \`JSON.stringify(a) === JSON.stringify(b)\` est fragile : dépend de l'ordre des clés, ignore \`undefined\`, transforme \`NaN\` en \`null\` ;
- usages : tests unitaires (\`toEqual\`), mémoïsation, comparaison de props (React compare en **superficiel** pour la performance).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'retry',
    title: 'Retry avec backoff exponentiel',
    difficulty: 'moyen',
    theme: 'async',
    category: 'utilitaire',
    statement: `Écrivez \`retry(fn, { retries = 3, baseDelay = 100 } = {})\` qui appelle la fonction \`fn\` (sans argument) et **réessaie en cas d'échec**, avec un délai qui double à chaque tentative.

Comportement :

- \`fn\` peut renvoyer une promesse ou une valeur, ou lever une exception de façon synchrone : un rejet ou une exception compte comme un échec ;
- \`retry\` renvoie **toujours une promesse**, résolue avec la valeur de la première tentative réussie ;
- après l'échec de la tentative numéro k (k = 0 pour le premier appel), on attend \`baseDelay * 2 ** k\` ms avant de réessayer : \`baseDelay\`, puis \`2 × baseDelay\`, \`4 × baseDelay\`… ;
- il y a au plus \`retries + 1\` appels au total ; si tous échouent, la promesse est rejetée avec **la dernière erreur** ;
- avec \`retries: 0\`, \`fn\` n'est appelée qu'une fois.

Exemple : \`retry(() => fetch(url).then(check), { retries: 3, baseDelay: 200 })\` essaie jusqu'à 4 fois, en attendant 200, 400 puis 800 ms entre les tentatives.`,
    starter: `function retry(fn, { retries = 3, baseDelay = 100 } = {}) {
  // TODO : réessayer fn avec un délai exponentiel
  return Promise.resolve(fn())
}`,
    solution: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function retry(fn, { retries = 3, baseDelay = 100 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // await couvre à la fois les promesses rejetées et les exceptions synchrones
      return await fn()
    } catch (error) {
      lastError = error
      // pas d'attente après la dernière tentative
      if (attempt < retries) await wait(baseDelay * 2 ** attempt)
    }
  }
  throw lastError // toutes les tentatives ont échoué : on propage la dernière erreur
}`,
    tests: [
      {
        name: 'renvoie le résultat sans réessayer si fn réussit',
        code: `let calls = 0
const p = retry(() => { calls++; return Promise.resolve('ok') }, { retries: 3, baseDelay: 5 })
assert(p && typeof p.then === 'function', 'retry doit renvoyer une promesse')
assertEqual(await p, 'ok')
assertEqual(calls, 1)`,
      },
      {
        name: 'réessaie jusqu’au succès',
        code: `let calls = 0
const result = await retry(async () => {
  calls++
  if (calls < 3) throw new Error('échec ' + calls)
  return 'enfin'
}, { retries: 5, baseDelay: 5 })
assertEqual(result, 'enfin')
assertEqual(calls, 3)`,
      },
      {
        name: 'abandonne après retries + 1 appels avec la dernière erreur',
        code: `let calls = 0
let error = null
try {
  await retry(() => { calls++; return Promise.reject(new Error('échec ' + calls)) }, { retries: 3, baseDelay: 2 })
} catch (e) {
  error = e
}
assert(error, 'la promesse aurait dû être rejetée')
assertEqual(calls, 4)
assertEqual(error.message, 'échec 4')`,
      },
      {
        name: 'gère les exceptions synchrones',
        code: `let calls = 0
const result = await retry(() => {
  calls++
  if (calls === 1) throw new Error('synchrone')
  return 42
}, { retries: 2, baseDelay: 5 })
assertEqual(result, 42)
assertEqual(calls, 2)`,
      },
      {
        name: 'retries: 0 appelle fn une seule fois',
        code: `let calls = 0
let error = null
try {
  await retry(() => { calls++; throw new Error('non') }, { retries: 0, baseDelay: 5 })
} catch (e) {
  error = e
}
assertEqual(calls, 1)
assert(error && error.message === 'non', 'l’erreur doit être propagée')`,
      },
      {
        name: 'le délai double entre les tentatives',
        code: `const times = []
try {
  await retry(() => { times.push(Date.now()); throw new Error('x') }, { retries: 3, baseDelay: 20 })
} catch (e) {}
assertEqual(times.length, 4)
const gaps = [times[1] - times[0], times[2] - times[1], times[3] - times[2]]
assert(gaps[0] >= 15, 'premier délai trop court : ' + gaps[0])
assert(gaps[1] >= 35, 'deuxième délai trop court (attendu environ 40) : ' + gaps[1])
assert(gaps[2] >= 75, 'troisième délai trop court (attendu environ 80) : ' + gaps[2])`,
      },
    ],
    hints: [
      'Une fonction `async` avec une boucle `for` et un `try/catch` autour de `await fn()` est la forme la plus lisible.',
      'Écrivez un petit utilitaire `wait(ms)` qui renvoie `new Promise((r) => setTimeout(r, ms))`, et attendez `baseDelay * 2 ** attempt` après chaque échec.',
      'Gardez la dernière erreur dans une variable et relancez-la (`throw`) après la boucle. Pas besoin d’attendre après la dernière tentative.',
    ],
    discussion: `**Complexité** : au plus \`retries + 1\` appels ; durée totale d'attente \`baseDelay × (2^retries − 1)\`.

**Points à évoquer** :

- **jitter** (aléa ajouté au délai) : évite que mille clients réessaient tous à la même milliseconde après une panne (effet « troupeau ») ;
- plafonner le délai (\`maxDelay\`) et ne réessayer que les erreurs **transitoires** (réseau, 503, 429) : un 400 ou 404 ne se corrigera pas tout seul ; option \`shouldRetry(error)\` ;
- respecter l'en-tête \`Retry-After\` d'une réponse 429 ;
- annulation : accepter un \`AbortSignal\` pour interrompre les tentatives (démontage d'un composant) ;
- **idempotence** : ne réessayer automatiquement qu'une opération sans effet de bord cumulatif (GET, PUT), pas un paiement ;
- \`return await\` dans le \`try\` est indispensable : un simple \`return fn()\` laisserait le rejet échapper au \`catch\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'lru-cache',
    title: 'Cache LRU',
    difficulty: 'difficile',
    theme: 'perf',
    category: 'algo',
    statement: `Écrivez une classe \`LRUCache\` (*Least Recently Used*) de capacité fixe :

- \`new LRUCache(capacity)\` : crée un cache pouvant contenir au plus \`capacity\` entrées (\`capacity\` ≥ 1) ;
- \`get(key)\` : renvoie la valeur associée à \`key\`, ou \`undefined\` si elle est absente ; une lecture réussie rend la clé **la plus récemment utilisée** ;
- \`put(key, value)\` : ajoute ou met à jour la valeur ; la clé devient la plus récemment utilisée ; si l'ajout d'une **nouvelle** clé fait dépasser la capacité, l'entrée **la moins récemment utilisée** est supprimée.

Les deux opérations doivent être en **O(1)**. Les valeurs peuvent être quelconques, y compris \`0\`, \`''\` ou \`null\`.

Exemple avec une capacité de 2 : \`put('a', 1)\`, \`put('b', 2)\`, \`get('a')\` (renvoie \`1\`, « a » devient récent), \`put('c', 3)\` évince « b » ; \`get('b')\` renvoie alors \`undefined\`.`,
    starter: `class LRUCache {
  constructor(capacity) {
    // TODO
  }
  get(key) {
    // TODO
  }
  put(key, value) {
    // TODO
  }
}`,
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    // Une Map conserve l'ordre d'insertion : la première clé est la plus ancienne
    this.map = new Map()
  }

  get(key) {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key)
    // on réinsère la clé pour la placer en fin (= la plus récente)
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key) // mise à jour : on la replace en fin
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      // éviction : la première clé de l'itérateur est la moins récemment utilisée
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
  }
}`,
    tests: [
      {
        name: 'stocke et relit des valeurs',
        code: `const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
assertEqual(c.get('a'), 1)
assertEqual(c.get('b'), 2)
assertEqual(c.get('z'), undefined)`,
      },
      {
        name: 'évince l’entrée la plus ancienne au dépassement',
        code: `const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.put('c', 3)
assertEqual(c.get('a'), undefined, 'a aurait dû être évincée')
assertEqual(c.get('b'), 2)
assertEqual(c.get('c'), 3)`,
      },
      {
        name: 'get rafraîchit la clé',
        code: `const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.get('a') // a devient la plus récente
c.put('c', 3) // b est maintenant la plus ancienne
assertEqual(c.get('b'), undefined, 'b aurait dû être évincée')
assertEqual(c.get('a'), 1)
assertEqual(c.get('c'), 3)`,
      },
      {
        name: 'put sur une clé existante met à jour sans évincer',
        code: `const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.put('a', 10) // mise à jour : a devient la plus récente
assertEqual(c.get('b'), 2, 'aucune éviction lors d’une mise à jour')
c.put('c', 3) // a est maintenant la plus ancienne (b vient d’être lue)
assertEqual(c.get('a'), undefined)
assertEqual(c.get('b'), 2)
assertEqual(c.get('c'), 3)`,
      },
      {
        name: 'capacité 1',
        code: `const c = new LRUCache(1)
c.put('x', 1)
c.put('y', 2)
assertEqual(c.get('x'), undefined)
assertEqual(c.get('y'), 2)`,
      },
      {
        name: 'conserve les valeurs fausses',
        code: `const c = new LRUCache(3)
c.put('zero', 0)
c.put('vide', '')
c.put('nul', null)
assertEqual(c.get('zero'), 0)
assertEqual(c.get('vide'), '')
assertEqual(c.get('nul'), null)`,
      },
    ],
    hints: [
      'Une `Map` JavaScript mémorise l’ordre d’insertion de ses clés : elle peut servir à la fois de table de hachage et de liste ordonnée.',
      'Pour marquer une clé comme récente : `delete` puis `set`, elle passe en fin d’ordre.',
      'Pour évincer : `this.map.keys().next().value` donne la première clé, donc la plus ancienne.',
    ],
    discussion: `**Complexité** : \`get\` et \`put\` en O(1) (opérations de \`Map\` en temps constant amorti) ; mémoire O(capacity).

**Points à évoquer** :

- l'implémentation « académique » (et attendue dans d'autres langages) : **table de hachage + liste doublement chaînée**, la table pointant vers les nœuds pour les déplacer en O(1) ; savoir l'expliquer même si la \`Map\` suffit en JS ;
- une version avec un tableau (\`indexOf\` + \`splice\`) est en O(n) : à éviter ;
- utiliser \`has\` et non un test de vérité sur \`get\`, sinon les valeurs \`0\` ou \`null\` sont prises pour des absences ;
- variantes : **LFU** (moins fréquemment utilisé), TTL (expiration), taille mesurée en octets plutôt qu'en nombre d'entrées ;
- usages réels : cache HTTP, cache de requêtes (React Query, SWR), mémoïsation bornée, pages en mémoire d'un système de fichiers.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'chunk',
    title: 'Découper en paquets',
    difficulty: 'facile',
    theme: 'arrays',
    category: 'utilitaire',
    statement: `Écrivez \`chunk(arr, size)\` qui découpe \`arr\` en un tableau de **sous-tableaux de longueur \`size\`**. Le dernier paquet contient les éléments restants et peut donc être plus court.

- \`size\` doit être un **entier strictement positif** ; sinon, levez une \`RangeError\` ;
- un tableau vide donne \`[]\` ;
- le tableau d'entrée n'est pas modifié.

Exemples :

- \`chunk([1, 2, 3, 4, 5], 2)\` donne \`[[1, 2], [3, 4], [5]]\` ;
- \`chunk(['a', 'b'], 5)\` donne \`[['a', 'b']]\` ;
- \`chunk([1, 2], 0)\` lève une \`RangeError\`.`,
    starter: `function chunk(arr, size) {
  // TODO : découper arr en paquets de size éléments
  return [arr]
}`,
    solution: `function chunk(arr, size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError('size doit être un entier strictement positif')
  }
  const result = []
  // on avance de size en size ; slice ne déborde pas et ne modifie pas arr
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}`,
    tests: [
      {
        name: 'découpe avec un dernier paquet plus court',
        code: `assertEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])`,
      },
      {
        name: 'découpe exacte',
        code: `assertEqual(chunk([1, 2, 3, 4, 5, 6], 3), [[1, 2, 3], [4, 5, 6]])
assertEqual(chunk([1, 2, 3], 1), [[1], [2], [3]])`,
      },
      {
        name: 'taille plus grande que le tableau',
        code: `assertEqual(chunk(['a', 'b'], 5), [['a', 'b']])`,
      },
      {
        name: 'tableau vide',
        code: `assertEqual(chunk([], 3), [])`,
      },
      {
        name: 'taille invalide : RangeError',
        code: `for (const bad of [0, -1, 1.5, NaN]) {
  let error = null
  try { chunk([1, 2], bad) } catch (e) { error = e }
  assert(error instanceof RangeError, 'RangeError attendue pour size = ' + bad)
}`,
      },
      {
        name: 'ne modifie pas l’entrée',
        code: `const src = [1, 2, 3]
chunk(src, 2)
assertEqual(src, [1, 2, 3])`,
      },
    ],
    hints: [
      'Validez `size` d’abord : `Number.isInteger(size) && size > 0`.',
      'Une boucle `for` qui avance de `size` en `size` et un `slice(i, i + size)` font tout le travail.',
      '`slice` gère seul le dernier paquet incomplet : un indice de fin trop grand est ramené à la longueur du tableau.',
    ],
    discussion: `**Complexité** : O(n) en temps et en mémoire.

**Points à évoquer** :

- sans validation, \`size = 0\` crée une **boucle infinie** (\`i += 0\`) : c'est le cas limite que le recruteur attend ;
- \`splice\` ferait le même découpage mais **muterait** l'entrée ;
- variante fonctionnelle : \`Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))\` ;
- usages : pagination côté client, envoi par lots à une API (limiter le nombre d'éléments par requête), affichage en grille ;
- variante paresseuse avec un générateur (\`function*\`) pour de très grands flux.`,
  },
]

export const katas: Kata[] = [...jsKatas, ...algoKatas]
