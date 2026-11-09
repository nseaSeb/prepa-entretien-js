import type { EntretienQ } from './types'

/** Questions d'entretien : pistes de réponse à formuler à l'oral. */
export const entretien: EntretienQ[] = [
  // ───────────────────────────── Général ─────────────────────────────
  {
    id: 'g1',
    section: 'general',
    q: 'Explique la différence entre == et ===.',
    answer:
      "`===` est l'égalité stricte : elle compare le type et la valeur, sans aucune conversion. `==` est l'égalité faible : si les types diffèrent, elle applique d'abord des règles de coercition (chaîne vers nombre, booléen vers nombre, objet vers primitive…), ce qui donne des résultats surprenants comme `'' == 0` ou `'0' == false`.\n\nEn pratique, j'utilise toujours `===`, et la plupart des configurations ESLint l'imposent. La seule exception idiomatique est `x == null`, qui teste en une fois `null` et `undefined`.\n\nPour les objets, les deux opérateurs comparent des références : deux objets distincts ne sont jamais égaux, même avec le même contenu. Enfin, `NaN` n'est égal à rien, pas même à lui-même : on utilise `Number.isNaN` ou `Object.is`.",
    attendu: "Le recruteur vérifie que tu connais la coercition implicite, que tu as une règle claire (toujours `===`) et que tu sais que les objets se comparent par référence.",
    code: `'' == 0 // → true
'0' == false // → true
null == undefined // → true
null === undefined // → false
NaN === NaN // → false
Object.is(NaN, NaN) // → true`,
  },
  {
    id: 'g2',
    section: 'general',
    q: "Qu'est-ce qu'une closure ? Donne un cas d'usage.",
    answer:
      "Une closure, c'est une fonction qui garde accès aux variables de la portée dans laquelle elle a été créée, même après que cette portée a fini de s'exécuter. Ce n'est pas une fonctionnalité qu'on active : toute fonction JavaScript capture son environnement lexical.\n\nCas d'usage concrets :\n- encapsuler un état privé (un compteur, un cache) sans l'exposer ;\n- créer des fabriques de fonctions ou faire de l'application partielle ;\n- implémenter `debounce`, `throttle` ou `memoize`, qui gardent un minuteur ou un cache entre les appels ;\n- les gestionnaires d'événements et les hooks React, qui capturent les props et l'état du rendu.\n\nLe piège classique est la boucle avec `var` : toutes les callbacks partagent la même variable, alors qu'avec `let` chaque itération crée une nouvelle liaison.",
    attendu: "Une définition juste (fonction + environnement lexical), un exemple concret et idéalement le piège de la boucle `var` ou des closures périmées.",
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))`,
    output: 'var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2',
  },
  {
    id: 'g3',
    section: 'general',
    q: "Explique l'event loop.",
    answer:
      "JavaScript exécute le code sur un seul thread, avec une seule pile d'appels. Les opérations longues (minuteurs, réseau, événements) sont déléguées à l'environnement (navigateur ou Node), qui place leurs callbacks dans des files d'attente quand elles sont prêtes.\n\nL'event loop tourne en boucle : quand la pile d'appels est vide, elle exécute **toutes** les microtâches en attente (callbacks de promesses, reprises après `await`, `queueMicrotask`), puis le navigateur peut faire un rendu, puis elle prend **une** macrotâche (callback de `setTimeout`, événement…), et recommence.\n\nConséquences pratiques : un `then` s'exécute toujours avant un `setTimeout(…, 0)`, et un calcul synchrone long bloque tout, y compris l'affichage et les clics. Pour un gros calcul, on le découpe ou on le déplace dans un Web Worker.",
    attendu: "Le recruteur veut entendre pile d'appels, files de microtâches et de macrotâches, l'ordre de priorité, et savoir prédire l'ordre d'affichage d'un petit exemple.",
    code: `console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'))
queueMicrotask(() => console.log('5'))
console.log('6')`,
    output: '1\n6\n3\n5\n4\n2',
  },
  {
    id: 'g4',
    section: 'general',
    q: 'Quelles différences entre var, let et const ?',
    answer:
      "Trois différences principales :\n- **la portée** : `var` a une portée de fonction, alors que `let` et `const` ont une portée de bloc ;\n- **le hoisting** : les trois sont remontées, mais `var` est initialisée à `undefined`, tandis que `let` et `const` sont en zone morte temporelle (TDZ) jusqu'à leur déclaration ;\n- **la réaffectation** : `const` interdit de réaffecter la variable, mais ne rend pas la valeur immuable ; on peut toujours modifier un objet ou un tableau déclaré avec `const`.\n\nEn plus, un `var` de niveau global devient une propriété de l'objet global, et peut être redéclaré sans erreur.\n\nMa règle : `const` par défaut, `let` quand une réaffectation est nécessaire, et jamais `var` dans du code moderne.",
    attendu: "Portée de bloc contre portée de fonction, TDZ, et surtout la nuance « const n'est pas immuable ».",
    code: `const user = { role: 'dev' }
user.role = 'lead'
user.role // → 'lead'
try {
  user = {}
} catch (e) {
  console.log(e.name + ': ' + e.message)
}`,
    output: 'TypeError: Assignment to constant variable.',
  },
  {
    id: 'g5',
    section: 'general',
    q: 'Comment fonctionne this ?',
    answer:
      "La valeur de `this` dépend de la façon dont la fonction est **appelée**, pas de l'endroit où elle est définie. Il y a quatre règles, par ordre de priorité :\n- avec `new`, `this` est la nouvelle instance ;\n- avec `call`, `apply` ou `bind`, c'est l'objet passé explicitement ;\n- appelée comme méthode, `obj.method()`, c'est l'objet avant le point ;\n- appel simple, `fn()` : l'objet global en mode non strict, `undefined` en mode strict (donc dans les modules et les classes).\n\nLes fonctions fléchées font exception : elles n'ont pas leur propre `this` et reprennent celui de la portée englobante. C'est pour ça qu'elles sont pratiques dans les callbacks.\n\nLe bug classique est la méthode « détachée » passée en callback, par exemple `setTimeout(obj.method)`, qui perd son `this` ; on corrige avec `bind` ou une fonction fléchée. Dans l'exemple ci-dessous, `detached()` est un appel simple dans un script non strict : `this` est l'objet global, qui n'a pas de propriété `count`, et `++undefined` donne `NaN`.",
    attendu: "Les règles d'appel (new, explicite, implicite, par défaut), le cas des fonctions fléchées et le piège de la méthode détachée.",
    code: `const counter = {
  count: 0,
  increment() { return ++this.count },
}
const detached = counter.increment
counter.increment() // → 1
detached.call(counter) // → 2
detached() // → NaN`,
  },
  {
    id: 'g6',
    section: 'general',
    q: 'Prototype ou classe : quelle différence ?',
    answer:
      "Il n'y a pas d'opposition : JavaScript a un héritage **prototypal**, et les classes ES6 sont une syntaxe plus lisible au-dessus de ce mécanisme. Chaque objet a un prototype ; quand une propriété est absente de l'objet, le moteur la cherche en remontant la chaîne de prototypes.\n\nUne classe est en réalité une fonction constructeur : ses méthodes sont placées sur `Classe.prototype` et partagées par toutes les instances, et `extends` relie les chaînes de prototypes.\n\nLa syntaxe `class` apporte tout de même des choses : le mode strict automatique, l'interdiction d'appeler la classe sans `new`, les champs privés `#`, `static` et un `super` simple à utiliser.",
    attendu: "Comprendre que les classes reposent sur les prototypes et savoir expliquer la chaîne de prototypes.",
    code: `class Animal {
  speak() { return 'bruit' }
}
class Dog extends Animal {}
const rex = new Dog()
rex.speak() // → 'bruit'
Object.getPrototypeOf(Dog.prototype) === Animal.prototype // → true
rex.hasOwnProperty('speak') // → false`,
  },
  {
    id: 'g7',
    section: 'general',
    q: 'Callbacks, promesses, async/await : quelles différences ?',
    answer:
      "Ce sont trois façons de gérer l'asynchrone, chacune construite sur la précédente.\n\nLes **callbacks** sont simples, mais s'imbriquent vite (« callback hell »), la gestion d'erreur doit être faite à chaque niveau, et on confie le contrôle à du code tiers, qui peut appeler la callback zéro ou plusieurs fois.\n\nLes **promesses** représentent un résultat futur avec un état qui ne change qu'une fois. On les enchaîne à plat avec `then`, une seule chaîne `catch` capte les erreurs, et on peut les combiner avec `Promise.all` ou `Promise.race`.\n\n**async/await** est une syntaxe au-dessus des promesses : le code se lit comme du synchrone et les erreurs se gèrent avec `try/catch`. Une fonction `async` renvoie toujours une promesse. Il faut seulement penser à paralléliser ce qui est indépendant avec `Promise.all`, au lieu d'enchaîner des `await` inutilement.",
    attendu: "Les limites des callbacks, ce qu'apporte une promesse (état, chaînage, erreurs) et le fait qu'async/await n'est que du sucre syntaxique au-dessus des promesses.",
    code: `const wait = (ms, v) => new Promise((resolve) => setTimeout(() => resolve(v), ms))
async function sequential() {
  const a = await wait(30, 'a')
  const b = await wait(30, 'b')
  return a + b
}
async function parallel() {
  const [a, b] = await Promise.all([wait(30, 'a'), wait(30, 'b')])
  return a + b
}
parallel().then((r) => console.log('parallèle', r))
sequential().then((r) => console.log('séquentiel', r))`,
    output: 'parallèle ab\nséquentiel ab',
  },
  {
    id: 'g8',
    section: 'general',
    q: 'Comment gérer les erreurs dans du code asynchrone ?',
    answer:
      "Avec async/await, on entoure les `await` d'un `try/catch` ; avec des promesses, on termine la chaîne par un `catch`. Le point important : un `try/catch` ne capte pas une erreur levée plus tard dans une callback de `setTimeout` ou une promesse qui n'est pas attendue.\n\nQuelques bonnes pratiques :\n- toujours `await` ou `return` la promesse, sinon son rejet échappe au `try/catch` ;\n- `Promise.allSettled` quand on veut tous les résultats, même en cas d'échec partiel ;\n- gérer l'erreur au niveau où on sait quoi en faire (afficher un message, réessayer), et la relancer sinon ;\n- un filet global (`unhandledrejection` dans le navigateur) pour journaliser ce qui passerait entre les mailles.\n\nEn React, on pense aussi à l'état d'erreur dans l'UI et aux Error Boundaries, qui elles ne captent pas les erreurs asynchrones.",
    attendu: "La maîtrise de try/catch avec await, le piège de la promesse non attendue, et une vision de la stratégie d'erreur (où et comment la traiter).",
    code: `async function load(ok) {
  if (!ok) throw new Error('échec')
  return 'données'
}
async function main() {
  try {
    console.log(await load(true))
    console.log(await load(false))
  } catch (e) {
    console.log('attrapé :', e.message)
  }
  const results = await Promise.allSettled([load(true), load(false)])
  console.log(results.map((r) => r.status))
}
main()`,
    output: "données\nattrapé : échec\n[ 'fulfilled', 'rejected' ]",
  },
  {
    id: 'g9',
    section: 'general',
    q: 'Debounce ou throttle : quelle différence et quand les utiliser ?',
    answer:
      "Les deux limitent la fréquence d'exécution d'une fonction appelée très souvent, mais de façon différente.\n\nLe **debounce** attend que les appels s'arrêtent pendant un délai donné, puis exécute la fonction une seule fois : chaque nouvel appel relance le minuteur. C'est adapté à une recherche pendant la saisie, à la validation d'un champ ou à la sauvegarde automatique.\n\nLe **throttle** garantit au plus une exécution par intervalle, même si les appels continuent. C'est adapté au défilement, au redimensionnement ou au suivi de la souris, où l'on veut des mises à jour régulières pendant l'action.\n\nLes deux s'implémentent avec une closure qui garde un minuteur ou un horodatage. Pour les animations liées à l'affichage, `requestAnimationFrame` est souvent un meilleur choix.",
    attendu: "Une distinction claire (fin de rafale contre cadence régulière), un cas d'usage pour chacun et idéalement la capacité à en coder un.",
  },
  {
    id: 'g10',
    section: 'general',
    q: 'Copie superficielle ou copie profonde ?',
    answer:
      "Une **copie superficielle** crée un nouvel objet, mais les objets imbriqués sont partagés par référence : modifier `copy.address.city` modifie aussi l'original. Le spread `{ ...obj }`, `Object.assign` et `slice` font des copies superficielles.\n\nUne **copie profonde** duplique récursivement toute la structure. Aujourd'hui, la solution standard est `structuredClone`, qui gère les `Date`, `Map`, `Set` et les références circulaires, mais pas les fonctions. L'astuce `JSON.parse(JSON.stringify(obj))` perd les `undefined` et les fonctions, transforme les dates en chaînes et plante sur une référence circulaire.\n\nEn pratique, avec des mises à jour immuables, on n'a souvent pas besoin de copie profonde : on copie seulement le chemin modifié, avec un spread à chaque niveau.",
    attendu: "Comprendre le partage des références imbriquées, connaître `structuredClone` et les limites de l'astuce JSON.",
    code: `const original = { name: 'Ada', address: { city: 'Paris' } }
const shallow = { ...original }
const deep = structuredClone(original)
shallow.address.city = 'Lyon'
original.address.city // → 'Lyon'
deep.address.city // → 'Paris'`,
  },
  {
    id: 'g11',
    section: 'general',
    q: "Qu'est-ce que la délégation d'événements ?",
    answer:
      "Au lieu d'ajouter un écouteur sur chaque élément d'une liste, on en ajoute un seul sur un parent commun. Grâce à la remontée (bubbling), les clics sur les enfants arrivent jusqu'au parent, et on identifie l'élément concerné avec `event.target`, en général avec `closest()` pour remonter jusqu'au bon élément.\n\nAvantages :\n- un seul écouteur, donc moins de mémoire et moins de code d'initialisation ;\n- les éléments ajoutés dynamiquement sont gérés automatiquement ;\n- pas besoin de retirer les écouteurs quand on supprime des éléments.\n\nLimites : quelques événements ne remontent pas (`focus`, `blur`, on utilise alors `focusin`/`focusout`), et un `stopPropagation` dans un enfant casse le mécanisme. React utilise d'ailleurs ce principe en interne, avec un écouteur à la racine.",
    attendu: "Le lien avec le bubbling, l'usage de `event.target`/`closest` et les avantages sur les éléments dynamiques.",
    code: `document.querySelector('#todos').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]')
  if (!button) return
  removeTodo(button.dataset.id)
})`,
    run: false,
  },
  {
    id: 'g12',
    section: 'general',
    q: 'ESM ou CommonJS : quelles différences ?',
    answer:
      "CommonJS (`require` / `module.exports`) est le système historique de Node. ESM (`import` / `export`) est le standard du langage, supporté par les navigateurs et par Node.\n\nLes différences importantes :\n- **statique contre dynamique** : les `import` ESM sont analysés avant l'exécution, ce qui permet le tree shaking ; `require` est un appel de fonction qu'on peut faire n'importe où ;\n- **chargement** : ESM est asynchrone et supporte le top-level `await`, CommonJS est synchrone ;\n- **liaisons** : un import ESM est un live binding en lecture seule, alors que `require` renvoie une copie de la valeur au moment de l'appel ;\n- ESM est toujours en mode strict, et `this` y vaut `undefined` au niveau supérieur.\n\nPour un nouveau projet, je pars sur ESM ; l'import dynamique `import()` couvre les cas de chargement conditionnel.",
    attendu: "Le caractère statique d'ESM et son lien avec le tree shaking, la différence de chargement et idéalement les live bindings.",
    code: `// ESM
import { readFile } from 'node:fs/promises'
export const parse = (text) => JSON.parse(text)
const { heavy } = await import('./heavy.js')

// CommonJS
const fs = require('node:fs')
module.exports = { parse: (text) => JSON.parse(text) }`,
    run: false,
  },
  {
    id: 'g13',
    section: 'general',
    q: "Qu'est-ce que CORS ?",
    answer:
      "Par défaut, la **same-origin policy** empêche un script de lire la réponse d'une requête vers une autre origine (protocole, domaine ou port différent). CORS est le mécanisme qui permet au **serveur** d'autoriser explicitement certaines origines, avec l'en-tête `Access-Control-Allow-Origin`.\n\nPour les requêtes « non simples » (méthode `PUT` ou `DELETE`, en-tête personnalisé, JSON), le navigateur envoie d'abord une requête `OPTIONS` de pré-vérification (preflight). Pour envoyer des cookies, il faut `credentials: 'include'` côté client et `Access-Control-Allow-Credentials: true` côté serveur, sans joker `*`.\n\nPoint important : CORS est appliqué par le navigateur, pas par le serveur ; un `curl` n'est pas concerné. Une erreur CORS se corrige donc côté serveur, ou avec un proxy en développement, pas en modifiant le code front.",
    attendu: "Comprendre que CORS assouplit la same-origin policy, que c'est le serveur qui autorise, et ce qu'est une requête preflight.",
  },
  {
    id: 'g14',
    section: 'general',
    q: 'Comment prévenir une faille XSS ?',
    answer:
      "Une XSS, c'est l'exécution d'un script injecté dans la page, en général via une donnée utilisateur affichée sans échappement. Le script s'exécute avec les droits de la page et peut voler des données ou agir à la place de l'utilisateur.\n\nLes protections, en couches :\n- **échapper à l'affichage** : utiliser `textContent` plutôt qu'`innerHTML`, et s'appuyer sur l'échappement automatique des frameworks (JSX, `{{ }}` dans Vue et Angular) ;\n- se méfier des échappatoires : `dangerouslySetInnerHTML`, `v-html`, `bypassSecurityTrust…`, les URL en `javascript:` ;\n- si l'on doit afficher du HTML utilisateur, l'**assainir** avec une bibliothèque comme DOMPurify ;\n- mettre en place une **CSP** stricte qui interdit les scripts inline ;\n- stocker les jetons de session dans des cookies `HttpOnly`, inaccessibles au JavaScript.\n\nEt valider les données côté serveur : la validation côté client ne protège de rien.",
    attendu: "Savoir ce qu'est une XSS et citer plusieurs défenses complémentaires : échappement, assainissement, CSP, cookies HttpOnly.",
    code: `const comment = '<img src=x onerror="stealCookies()">'
element.innerHTML = comment // dangereux : le code s'exécute
element.textContent = comment // sûr : affiché comme du texte`,
    run: false,
  },
  {
    id: 'g15',
    section: 'general',
    q: "Qu'est-ce que l'immutabilité, et pourquoi l'utiliser ?",
    answer:
      "L'immutabilité consiste à ne jamais modifier une donnée existante, mais à créer une nouvelle version : spread au lieu d'affectation, `map` et `filter` au lieu de `push` et `splice`, `toSorted` au lieu de `sort`.\n\nLes avantages :\n- **détection des changements** : il suffit de comparer des références (`prev !== next`), au lieu de comparer en profondeur ; React, Redux, `memo` ou `OnPush` dans Angular reposent sur ce principe ;\n- **prévisibilité** : une donnée partagée ne peut pas être modifiée par surprise ailleurs dans le code ;\n- historique et annulation faciles, puisque les anciennes versions restent intactes.\n\nLe coût, ce sont des allocations supplémentaires, en général négligeables ; pour des structures profondes, une bibliothèque comme Immer permet d'écrire du code « mutable » qui produit des copies immuables.",
    attendu: "Le lien entre immutabilité et détection de changement par référence, et la connaissance des méthodes non mutantes.",
    code: `const todos = [{ id: 1, done: false }, { id: 2, done: false }]
const next = todos.map((t) => (t.id === 1 ? { ...t, done: true } : t))
todos[0].done // → false
next[0].done // → true
next[1] === todos[1] // → true`,
  },
  {
    id: 'g16',
    section: 'general',
    q: 'Quelle différence entre map et forEach ?',
    answer:
      "`map` renvoie un **nouveau tableau** de même longueur, contenant le résultat de la callback pour chaque élément ; elle sert à transformer des données et ne doit pas avoir d'effet de bord. `forEach` renvoie toujours `undefined` : elle sert uniquement à exécuter un effet pour chaque élément (journaliser, envoyer, modifier le DOM).\n\nAucune des deux ne s'arrête en cours de route : pour sortir tôt, on utilise une boucle `for…of` avec `break`, ou `some`, `every`, `find`. Aucune des deux n'attend non plus une callback `async` : pour des traitements asynchrones, on combine `map` et `Promise.all`, ou on utilise `for…of` avec `await` pour du séquentiel.\n\nUtiliser `map` sans se servir du résultat est un mauvais signal à la relecture.",
    attendu: "Valeur de retour, intention (transformation contre effet de bord), et le piège des callbacks async dans forEach.",
    code: `const nums = [1, 2, 3]
nums.map((n) => n * 2) // → [ 2, 4, 6 ]
nums.forEach((n) => n * 2) // → undefined
nums // → [ 1, 2, 3 ]`,
  },
  {
    id: 'g17',
    section: 'general',
    q: 'Quelle différence entre null et undefined ?',
    answer:
      "`undefined` signifie « pas de valeur » au sens du langage : c'est la valeur d'une variable déclarée mais non initialisée, d'une propriété absente, d'un paramètre non fourni ou d'une fonction sans `return`. `null` est une absence de valeur **intentionnelle**, affectée explicitement par le développeur.\n\nQuelques différences concrètes :\n- `typeof undefined` vaut `'undefined'`, mais `typeof null` vaut `'object'`, un bug historique ;\n- `null == undefined` est vrai, mais `null === undefined` est faux ;\n- les paramètres par défaut ne s'appliquent que pour `undefined`, pas pour `null` ;\n- `JSON.stringify` supprime les propriétés `undefined` mais conserve les `null`.\n\nLes opérateurs `??` et `?.` traitent les deux de la même façon.",
    attendu: "La nuance entre absence technique et absence intentionnelle, et quelques comportements différents (typeof, paramètres par défaut, JSON).",
    code: `typeof undefined // → 'undefined'
typeof null // → 'object'
const greet = (who = 'inconnu') => who
greet(undefined) // → 'inconnu'
greet(null) // → null
JSON.stringify({ a: undefined, b: null }) // → '{"b":null}'`,
  },
  {
    id: 'g18',
    section: 'general',
    q: "Qu'est-ce que le hoisting ?",
    answer:
      "Avant d'exécuter une portée, le moteur enregistre toutes les déclarations qu'elle contient ; c'est ce qu'on appelle la remontée, ou hoisting. Le code n'est pas déplacé, c'est une conséquence de la phase de création du contexte d'exécution.\n\nLe comportement dépend du type de déclaration :\n- une **déclaration de fonction** est remontée avec son corps : on peut l'appeler avant sa ligne ;\n- une variable `var` est remontée et initialisée à `undefined` ;\n- `let`, `const` et `class` sont remontées mais non initialisées : les lire avant leur déclaration lève une `ReferenceError`, c'est la zone morte temporelle (TDZ) ;\n- une expression de fonction affectée à une variable suit la règle de cette variable.",
    attendu: "Différencier fonctions, var et let/const, et connaître la TDZ.",
    code: `console.log(typeof hoisted, typeof expr)
function hoisted() {}
var expr = function () {}
try {
  console.log(later)
} catch (e) {
  console.log(e.name)
}
let later = 1`,
    output: 'function undefined\nReferenceError',
  },
  {
    id: 'g19',
    section: 'general',
    q: "Qu'est-ce qu'une fonction pure ? Et un effet de bord ?",
    answer:
      "Une fonction pure respecte deux règles : pour les mêmes arguments, elle renvoie toujours le même résultat, et elle n'a aucun effet de bord. Un effet de bord, c'est toute interaction avec l'extérieur : modifier un argument ou une variable globale, écrire dans le DOM, faire une requête, journaliser, lire l'heure ou un nombre aléatoire.\n\nLes fonctions pures sont faciles à tester (pas de mock), à comprendre, à mémoïser et à paralléliser. Mais une application sans effets ne sert à rien : l'objectif est de garder un cœur pur et de **repousser les effets aux bords**, dans des endroits identifiés comme `useEffect`, les gestionnaires d'événements ou les services.\n\nEn React, la fonction de rendu d'un composant et les reducers doivent être purs ; c'est pour cela que le mode strict les appelle deux fois en développement.",
    attendu: "Une définition précise des deux notions et l'intérêt pratique : testabilité, mémoïsation, isolement des effets.",
    code: `const items = [3, 1, 2]
const impureSort = (arr) => arr.sort()
const pureSort = (arr) => [...arr].sort()
pureSort(items) // → [ 1, 2, 3 ]
items // → [ 3, 1, 2 ]
impureSort(items) // → [ 1, 2, 3 ]
items // → [ 1, 2, 3 ]`,
  },
  {
    id: 'g20',
    section: 'general',
    q: 'Comment optimiser une page lente ?',
    answer:
      "D'abord **mesurer** avant d'optimiser : Lighthouse et les Core Web Vitals (LCP pour le chargement, INP pour la réactivité, CLS pour la stabilité visuelle), puis l'onglet Performance des DevTools pour trouver la vraie cause.\n\nEnsuite, selon le diagnostic :\n- **chargement** : réduire le JavaScript (code splitting, lazy loading, tree shaking, suppression de dépendances lourdes), compresser et redimensionner les images (formats modernes, `loading=\"lazy\"`), mettre en cache et utiliser un CDN, envisager le SSR ou le SSG ;\n- **réactivité** : découper les tâches longues qui bloquent le thread principal, utiliser debounce et throttle, déplacer les calculs lourds dans un Web Worker ;\n- **rendu** : éviter le layout thrashing, animer `transform` et `opacity`, virtualiser les longues listes, éviter les re-rendus inutiles dans le framework.\n\nPuis remesurer, pour vérifier que l'optimisation a réellement un effet.",
    attendu: "Une démarche méthodique (mesurer, diagnostiquer, corriger, vérifier) et des techniques classées par type de problème.",
  },
  {
    id: 'g21',
    section: 'general',
    q: 'Quelles sont les causes de fuites mémoire en JavaScript ?',
    answer:
      "Il y a fuite quand des objets inutiles restent **atteignables** : le garbage collector ne libère que ce qui n'est plus référencé.\n\nLes causes classiques :\n- des écouteurs d'événements, `setInterval` ou abonnements (WebSocket, Observable) jamais retirés, par exemple quand un composant est démonté ;\n- des caches ou des tableaux globaux qui grossissent sans limite ;\n- des références à des nœuds DOM déjà retirés de la page ;\n- des closures qui gardent en vie un gros objet dont elles n'ont pas besoin ;\n- des variables globales accidentelles.\n\nPour les éviter : toujours nettoyer dans le cleanup d'un `useEffect`, `onUnmounted` ou `ngOnDestroy` ; utiliser `WeakMap` pour associer des données à des objets ; limiter la taille des caches. Pour les trouver : comparer des instantanés de tas (heap snapshots) dans l'onglet Memory des DevTools.",
    attendu: "Comprendre que la fuite vient de références conservées, citer des causes concrètes et une méthode de diagnostic.",
  },
  {
    id: 'g22',
    section: 'general',
    q: 'Quelle différence entre localStorage, sessionStorage et les cookies ?',
    answer:
      "- **localStorage** : environ 5 Mo par origine, persiste sans limite de durée, accessible uniquement en JavaScript, jamais envoyé au serveur ;\n- **sessionStorage** : même API, mais limité à l'onglet et effacé à sa fermeture ;\n- **cookies** : environ 4 Ko, envoyés automatiquement avec chaque requête vers le domaine, avec une date d'expiration, et éventuellement inaccessibles au JavaScript grâce à `HttpOnly`.\n\nLes deux premiers sont synchrones et ne stockent que des chaînes, d'où l'usage de `JSON.stringify`.\n\nCôté sécurité, un jeton d'authentification dans le `localStorage` est lisible par n'importe quel script injecté (XSS). On préfère souvent un cookie `HttpOnly`, `Secure` et `SameSite`, qui protège du vol par XSS mais impose de se prémunir contre le CSRF. Pour de gros volumes de données côté client, on utilise IndexedDB.",
    attendu: "Capacité, durée de vie, envoi au serveur, et surtout les implications de sécurité pour stocker un jeton.",
  },
  {
    id: 'g23',
    section: 'general',
    q: "Qu'est-ce qu'un polyfill ? Et un transpileur ?",
    answer:
      "Les deux servent à faire tourner du JavaScript moderne sur des environnements plus anciens, mais ils ne traitent pas le même problème.\n\nUn **transpileur** (Babel, SWC, esbuild, `tsc`) réécrit la **syntaxe** : il transforme `?.`, les classes ou les fonctions fléchées en code équivalent compris par d'anciens navigateurs. Il sert aussi à compiler TypeScript ou JSX en JavaScript.\n\nUn **polyfill** ajoute une **API** manquante à l'exécution, comme `Array.prototype.at`, `Promise` ou `structuredClone`, en la définissant seulement si elle n'existe pas déjà. Une syntaxe ne peut pas être polyfillée, et une API ne peut pas être transpilée.\n\nEn pratique, on configure des cibles navigateurs (browserslist) et l'outillage (Babel avec core-js, ou le bundler) n'ajoute que ce qui est nécessaire.",
    attendu: "La distinction syntaxe contre API, et savoir que les deux sont configurés selon des cibles navigateurs.",
    code: `if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
}
Object.hasOwn({ a: 1 }, 'a') // → true`,
  },
  {
    id: 'g24',
    section: 'general',
    q: 'Comment fonctionne le garbage collector ?',
    answer:
      "JavaScript gère la mémoire automatiquement : on alloue en créant des objets, et le garbage collector libère ceux qui ne sont plus **atteignables**.\n\nL'algorithme de base est le **marquage-balayage** (mark-and-sweep) : on part des racines (objet global, pile d'appels, closures actives), on marque tout ce qui est atteignable en suivant les références, puis on libère le reste. Contrairement au simple comptage de références, cela gère correctement les cycles : deux objets qui se référencent mutuellement mais que plus rien n'atteint sont libérés.\n\nV8 est en plus **générationnel** : les objets récents sont collectés souvent et rapidement, car la plupart meurent jeunes, et ceux qui survivent sont promus dans une zone collectée moins souvent. Le travail est en grande partie incrémental et concurrent, pour limiter les pauses. On ne contrôle pas le GC ; notre rôle est de ne pas garder de références inutiles.",
    attendu: "La notion d'atteignabilité depuis des racines, le mark-and-sweep et la gestion des cycles ; le générationnel est un plus.",
  },
  {
    id: 'g25',
    section: 'general',
    q: 'Tests unitaires : que faut-il tester ?',
    answer:
      "Je teste le **comportement observable**, pas l'implémentation : pour une fonction, les sorties selon les entrées ; pour un composant, ce que voit et fait l'utilisateur, avec Testing Library plutôt qu'en inspectant l'état interne. Un bon test doit survivre à un refactoring.\n\nEn priorité :\n- la logique métier et les fonctions pures, faciles et rentables à tester ;\n- les cas limites : tableau vide, `null`, valeurs extrêmes, erreurs ;\n- les bugs corrigés, avec un test de non-régression ;\n- les chemins critiques de l'application.\n\nJe structure chaque test en Arrange / Act / Assert, avec un nom qui décrit le comportement attendu. Je mocke les frontières (réseau, horloge avec des faux minuteurs) mais pas tout. Je vise l'équilibre de la pyramide, ou du « trophée » : beaucoup de tests unitaires et d'intégration, quelques tests end-to-end (Playwright, Cypress) sur les parcours clés. La couverture est un indicateur, pas un objectif.",
    attendu: "Une philosophie claire (comportement plutôt qu'implémentation), des priorités, et la connaissance des différents niveaux de tests.",
  },
  {
    id: 'g26',
    section: 'general',
    q: "Qu'apporte TypeScript ?",
    answer:
      "TypeScript ajoute un système de types statique à JavaScript : le compilateur détecte avant l'exécution des erreurs comme une propriété mal orthographiée, un `undefined` non géré ou un mauvais argument.\n\nLes apports concrets :\n- moins de bugs en production, surtout avec `strict` activé ;\n- une autocomplétion et une navigation bien meilleures dans l'éditeur ;\n- des refactorings sûrs : le compilateur signale tous les endroits impactés ;\n- une documentation vivante des contrats entre modules, très utile en équipe.\n\nSes limites : les types sont effacés à la compilation, donc les données externes (API, formulaires) doivent quand même être validées à l'exécution, par exemple avec Zod. Il y a aussi un coût d'apprentissage pour les types avancés, et la tentation du `any`, qui désactive toute vérification ; je préfère `unknown`, qui oblige à vérifier le type.",
    attendu: "Une vision équilibrée : bénéfices réels (sécurité, outillage, refactoring) et limites (pas de vérification à l'exécution, `any`).",
  },
  {
    id: 'g27',
    section: 'general',
    q: 'Raconte un bug difficile que tu as résolu.',
    answer:
      "Il faut préparer une histoire réelle et la structurer avec la méthode STAR : **Situation**, **Tâche**, **Action**, **Résultat**.\n\n- Le contexte en une phrase : le produit, l'impact du bug (utilisateurs touchés, urgence).\n- La démarche, qui est le cœur de la réponse : comment tu l'as reproduit, isolé (bisect Git, journaux, points d'arrêt, onglet Network), les hypothèses éliminées une à une.\n- La cause racine, expliquée simplement : par exemple une race condition entre deux requêtes, une closure périmée dans un `useEffect`, un problème de fuseau horaire ou un cache mal invalidé.\n- La correction, et ce que tu as mis en place pour que cela ne se reproduise pas : test de non-régression, monitoring, règle de lint.\n\nTermine par ce que tu en as appris. Reste honnête sur ce qui a été difficile : c'est la rigueur du raisonnement qui est évaluée, pas l'héroïsme.",
    attendu: "Une démarche de débogage méthodique, la capacité à expliquer clairement un problème technique, et une prise de recul (prévention, apprentissage).",
  },
  {
    id: 'g28',
    section: 'general',
    q: "Comment abordes-tu un exercice de live coding ?",
    answer:
      "Je commence par **reformuler** l'énoncé et poser des questions : les entrées possibles, les cas limites (tableau vide, doublons, valeurs négatives), les contraintes de performance. Je propose un ou deux exemples avec le résultat attendu pour valider ma compréhension.\n\nEnsuite j'**annonce mon approche** avant de coder : d'abord une solution simple et correcte, même naïve, en indiquant sa complexité, puis une optimisation si on a le temps.\n\nPendant que je code, je **pense à voix haute** : le recruteur évalue le raisonnement autant que le résultat. Je choisis des noms explicites et je découpe en petites fonctions.\n\nÀ la fin, je **teste** mentalement ou en exécutant le code sur mes exemples et les cas limites, je corrige, puis je discute des améliorations possibles. Si je bloque, je le dis et j'explique ce que j'essaie ; accepter un indice n'est pas un échec.",
    attendu: "La communication, une démarche structurée (comprendre, planifier, coder, tester) et la capacité à collaborer face à un blocage.",
  },
  {
    id: 'g29',
    section: 'general',
    q: 'Quelle différence entre call, apply et bind ?',
    answer:
      "Les trois permettent de choisir explicitement la valeur de `this` d'une fonction.\n\n- `call(thisArg, a, b)` appelle la fonction **immédiatement**, avec les arguments listés un par un ;\n- `apply(thisArg, [a, b])` fait la même chose, mais avec les arguments dans un tableau ; aujourd'hui le spread le remplace souvent ;\n- `bind(thisArg, a)` n'appelle **pas** la fonction : il renvoie une nouvelle fonction dont le `this` est fixé définitivement, et dont certains arguments peuvent être pré-remplis.\n\n`bind` sert surtout à passer une méthode en callback sans perdre son `this`. Une fonction déjà liée ne peut pas être reliée à un autre objet, et ces méthodes n'ont aucun effet sur le `this` d'une fonction fléchée.",
    attendu: "Savoir qui exécute immédiatement et qui renvoie une fonction, et à quoi sert concrètement `bind`.",
    code: `function introduce(greeting, punctuation) {
  return greeting + ', je suis ' + this.first + punctuation
}
const ada = { first: 'Ada' }
introduce.call(ada, 'Bonjour', '!') // → 'Bonjour, je suis Ada!'
introduce.apply(ada, ['Salut', '.']) // → 'Salut, je suis Ada.'
const hello = introduce.bind(ada, 'Hello')
hello('?') // → 'Hello, je suis Ada?'`,
  },
  {
    id: 'g30',
    section: 'general',
    q: 'Promise.all, allSettled, race et any : quelles différences ?',
    answer:
      "Les quatre combinent plusieurs promesses lancées en parallèle, mais ne réagissent pas de la même façon :\n- `Promise.all` attend que toutes soient tenues et renvoie leurs valeurs dans l'ordre ; il rejette dès le **premier échec** ;\n- `Promise.allSettled` attend que toutes soient réglées et renvoie un tableau de `{ status, value }` ou `{ status, reason }` ; il ne rejette jamais ;\n- `Promise.race` se règle comme la **première** promesse réglée, succès ou échec ; c'est utile pour un délai d'expiration ;\n- `Promise.any` renvoie la première promesse **tenue**, et ne rejette (avec une `AggregateError`) que si toutes échouent.\n\nAttention : un rejet de `Promise.all` n'annule pas les autres requêtes, qui continuent ; pour cela, il faut un `AbortController`.",
    attendu: "Connaître le comportement de chacun en cas d'échec et un cas d'usage typique (timeout avec race, résultats partiels avec allSettled).",
    code: `const ok = (v, ms) => new Promise((resolve) => setTimeout(() => resolve(v), ms))
const ko = (msg, ms) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
Promise.all([ok('a', 10), ko('panne', 20)]).catch((e) => console.log('all :', e.message))
Promise.race([ok('rapide', 5), ko('lent', 30)]).then((v) => console.log('race :', v))
Promise.any([ko('x', 10), ok('b', 40)]).then((v) => console.log('any :', v))`,
    output: 'race : rapide\nall : panne\nany : b',
  },
  {
    id: 'g31',
    section: 'general',
    q: 'Valeurs primitives et références : quelle différence ?',
    answer:
      "Les primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) sont immuables et comparées par valeur. Les objets, y compris les tableaux et les fonctions, sont manipulés par **référence** : une variable contient une référence vers l'objet, pas l'objet lui-même.\n\nConséquences :\n- affecter un objet à une autre variable ne le copie pas : les deux variables pointent vers le même objet ;\n- `===` entre deux objets compare les références, donc `{} === {}` est faux ;\n- une fonction qui reçoit un objet peut le muter, et la modification est visible par l'appelant ; en revanche, réaffecter le paramètre n'a aucun effet à l'extérieur.\n\nJavaScript passe toujours les arguments par valeur, mais pour un objet cette valeur est une référence. C'est la base pour comprendre les copies, l'immutabilité et les dépendances de `useEffect`.",
    attendu: "La distinction primitive/objet, la comparaison par référence et l'effet d'une mutation dans une fonction.",
    code: `function mutate(obj) { obj.count++ }
function reassign(obj) { obj = { count: 100 } }
const state = { count: 0 }
mutate(state)
reassign(state)
state.count // → 1
const other = { count: 1 }
state === other // → false`,
  },
  {
    id: 'g32',
    section: 'general',
    q: 'Fonction fléchée ou fonction classique : quand utiliser laquelle ?',
    answer:
      "Les fonctions fléchées ne sont pas qu'une syntaxe courte. Elles n'ont pas leur propre `this`, ni `arguments`, ni `prototype`, et ne peuvent pas être utilisées avec `new`.\n\nJe les utilise pour les callbacks (`map`, `then`, gestionnaires dans un composant) et dès que je veux conserver le `this` de la portée englobante, par exemple dans une méthode qui lance un `setTimeout`.\n\nJ'utilise une fonction classique, ou la syntaxe de méthode, quand la fonction doit avoir son propre `this` : méthodes d'objet ou de prototype, gestionnaires DOM qui utilisent `this` comme élément, constructeurs. Les déclarations de fonction ont aussi l'avantage d'être remontées, ce qui permet d'écrire les fonctions utilitaires en bas d'un fichier.",
    attendu: "Les différences de fond (this, arguments, new) et des critères de choix concrets.",
    code: `const user = {
  first: 'Ada',
  arrow: () => typeof this,
  method() { return this.first },
  delayed() { return [1].map(() => this.first) },
}
user.method() // → 'Ada'
user.delayed() // → [ 'Ada' ]
user.arrow() // → 'object'`,
  },

  // ───────────────────────────── React ─────────────────────────────
  {
    id: 'r1',
    section: 'react',
    q: 'Quelles sont les règles des hooks, et pourquoi existent-elles ?',
    answer:
      "Deux règles :\n- appeler les hooks **uniquement au niveau supérieur** du composant, jamais dans une condition, une boucle ou après un `return` anticipé ;\n- les appeler **uniquement** depuis un composant fonction ou un hook personnalisé (une fonction dont le nom commence par `use`).\n\nLa raison : React ne connaît pas les hooks par leur nom, il les identifie par leur **ordre d'appel**. Il stocke l'état de chaque composant dans une liste, et à chaque rendu, le premier `useState` reçoit la première case, le deuxième la deuxième, et ainsi de suite. Si un hook est appelé conditionnellement, l'ordre change d'un rendu à l'autre et les états se mélangent.\n\nLe plugin `eslint-plugin-react-hooks` vérifie ces règles. Pour un comportement conditionnel, on met la condition **à l'intérieur** du hook, ou on extrait un sous-composant.",
    attendu: "Les deux règles et surtout leur justification : l'identification des hooks par ordre d'appel.",
    code: `function Profile({ userId }) {
  // ❌ if (!userId) return null avant les hooks casserait l'ordre
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (!userId) return // ✅ la condition est dans le hook
    fetchUser(userId).then(setUser)
  }, [userId])
  if (!userId) return null
  return <h1>{user?.name}</h1>
}`,
    run: false,
  },
  {
    id: 'r2',
    section: 'react',
    q: 'Comment fonctionne useState : batching et mise à jour fonctionnelle ?',
    answer:
      "`setState` ne modifie pas la variable immédiatement : il **planifie** un nouveau rendu. Pendant le rendu en cours, `count` reste la valeur capturée par ce rendu, c'est un instantané.\n\nDepuis React 18, les mises à jour sont **regroupées** automatiquement (automatic batching), y compris dans les promesses et les `setTimeout` : plusieurs `setState` dans le même gestionnaire donnent un seul rendu.\n\nConséquence : appeler trois fois `setCount(count + 1)` n'ajoute que 1, car les trois appels utilisent le même `count`. La **mise à jour fonctionnelle** `setCount((c) => c + 1)` reçoit la valeur la plus récente en attente et ajoute bien 3. Je l'utilise dès que le nouvel état dépend du précédent, en particulier dans les effets et les callbacks asynchrones, où la valeur capturée peut être périmée.\n\nEnfin, React compare l'ancien et le nouvel état avec `Object.is` : muter un objet puis le repasser ne déclenche pas de rendu, il faut créer une nouvelle référence.",
    attendu: "L'état comme instantané par rendu, le batching, l'intérêt de la forme fonctionnelle et la nécessité de ne pas muter.",
    code: `function Counter() {
  const [count, setCount] = useState(0)
  function addThreeWrong() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1) // résultat : count + 1
  }
  function addThree() {
    setCount((c) => c + 1)
    setCount((c) => c + 1)
    setCount((c) => c + 1) // résultat : count + 3
  }
  return <button onClick={addThree}>{count}</button>
}`,
    run: false,
  },
  {
    id: 'r3',
    section: 'react',
    q: 'Explique useEffect : dépendances, cleanup et closures périmées.',
    answer:
      "`useEffect` sert à **synchroniser** le composant avec un système extérieur (abonnement, minuteur, requête, API du navigateur). Il s'exécute après l'affichage.\n\n- **Dépendances** : l'effet se relance quand une valeur du tableau change (comparaison `Object.is`). Sans tableau, il s'exécute après chaque rendu ; avec `[]`, seulement au montage. Il faut y déclarer toutes les valeurs réactives utilisées, ce que vérifie la règle ESLint `exhaustive-deps`.\n- **Cleanup** : la fonction renvoyée s'exécute avant la prochaine exécution de l'effet et au démontage. Elle sert à se désabonner, annuler un minuteur ou ignorer une réponse obsolète. En mode strict, React monte, démonte puis remonte en développement pour révéler les cleanups manquants.\n- **Closure périmée** : l'effet capture les valeurs du rendu où il a été créé. Si on omet une dépendance, il continue à lire une ancienne valeur. On corrige en ajoutant la dépendance, en utilisant une mise à jour fonctionnelle ou une `ref`.\n\nEnfin, beaucoup d'effets sont inutiles : une valeur dérivée se calcule pendant le rendu, et une réaction à un clic va dans le gestionnaire d'événement.",
    attendu: "Le rôle de synchronisation, le fonctionnement des dépendances et du cleanup, et le piège des closures périmées.",
    code: `useEffect(() => {
  let ignore = false
  fetchResults(query).then((data) => {
    if (!ignore) setResults(data) // évite la race condition
  })
  const id = setInterval(() => setTick((t) => t + 1), 1000)
  return () => {
    ignore = true
    clearInterval(id)
  }
}, [query])`,
    run: false,
  },
  {
    id: 'r4',
    section: 'react',
    q: 'Pourquoi les key sont-elles importantes dans une liste ?',
    answer:
      "Quand une liste change, React doit savoir quel élément correspond à quel élément du rendu précédent. La `key` sert d'**identité** pendant la réconciliation : un élément avec la même clé est conservé et mis à jour, une nouvelle clé crée un élément, une clé disparue le supprime.\n\nUne bonne clé est **stable et unique parmi ses voisins** : en général l'identifiant de la donnée. L'index du tableau ne convient que pour une liste statique, jamais réordonnée ni filtrée. Sinon, après une insertion en tête, chaque élément reçoit l'état et le DOM de son voisin : champ de saisie mal rempli, case cochée sur la mauvaise ligne, animations cassées. Une clé générée aléatoirement à chaque rendu est encore pire : tout est recréé à chaque fois.\n\nAstuce utile : changer volontairement la `key` d'un composant force React à le démonter et le remonter, ce qui réinitialise son état.",
    attendu: "Le rôle de la key dans la réconciliation, pourquoi l'index pose problème, et idéalement l'astuce de réinitialisation.",
    code: `<ul>
  {todos.map((todo) => (
    <TodoItem key={todo.id} todo={todo} />
  ))}
</ul>

<ProfileForm key={userId} userId={userId} />`,
    run: false,
  },
  {
    id: 'r5',
    section: 'react',
    q: 'Quand un composant se re-rend-il ? À quoi servent memo, useMemo et useCallback ?',
    answer:
      "Un composant se re-rend quand son état change, quand un contexte qu'il consomme change, ou quand son **parent se re-rend**, même si ses props n'ont pas changé. Re-rendre ne veut pas dire toucher au DOM : React compare ensuite et n'applique que les différences.\n\nLes outils de mémoïsation :\n- `memo(Component)` évite de re-rendre un enfant si ses props sont égales en comparaison superficielle ;\n- `useMemo` met en cache le **résultat** d'un calcul coûteux entre les rendus ;\n- `useCallback` met en cache une **fonction**, pour garder la même référence.\n\nCes outils fonctionnent ensemble : passer une nouvelle fonction ou un nouvel objet à chaque rendu rend `memo` inutile, d'où `useCallback` et `useMemo` pour stabiliser les références. Mais la mémoïsation a un coût ; je la réserve aux cas mesurés avec le Profiler. Souvent, mieux structurer suffit : descendre l'état au plus près de son usage ou passer des enfants via `children`. Le React Compiler automatise désormais une grande partie de cette mémoïsation.",
    attendu: "Les causes de re-rendu (notamment le parent), la différence entre les trois outils et le recul sur la mémoïsation prématurée.",
    code: `const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.label}</li>
})

function List({ items, filter }) {
  const visible = useMemo(() => items.filter((i) => i.label.includes(filter)), [items, filter])
  const handleSelect = useCallback((id) => console.log('sélection', id), [])
  return visible.map((item) => <Row key={item.id} item={item} onSelect={handleSelect} />)
}`,
    run: false,
  },
  {
    id: 'r6',
    section: 'react',
    q: 'Composant contrôlé ou non contrôlé : quelle différence ?',
    answer:
      "Un champ **contrôlé** reçoit sa valeur de l'état React (`value`) et la met à jour via `onChange` : l'état React est la seule source de vérité. On peut donc valider, formater ou désactiver un bouton à chaque frappe.\n\nUn champ **non contrôlé** garde sa valeur dans le DOM : on donne éventuellement une valeur initiale avec `defaultValue` et on lit la valeur au moment voulu, avec une `ref` ou via `FormData` à la soumission.\n\nLe contrôlé est plus flexible mais provoque un rendu à chaque frappe ; le non contrôlé est plus simple et performant pour de gros formulaires, et c'est l'approche de bibliothèques comme React Hook Form ou des actions de formulaire de React 19. L'erreur à éviter est de passer d'un mode à l'autre, par exemple avec une `value` qui vaut d'abord `undefined` : React affiche alors un avertissement.",
    attendu: "La notion de source de vérité, les avantages de chaque approche et un exemple d'usage.",
    code: `function Controlled() {
  const [email, setEmail] = useState('')
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />
}

function Uncontrolled() {
  const inputRef = useRef(null)
  const submit = () => console.log(inputRef.current.value)
  return <input ref={inputRef} defaultValue="" onBlur={submit} />
}`,
    run: false,
  },
  {
    id: 'r7',
    section: 'react',
    q: "Comment partager de l'état entre composants : remonter l'état, contexte, store ?",
    answer:
      "La première solution est de **remonter l'état** (lifting state up) dans le plus proche ancêtre commun, puis de le passer en props, avec des callbacks pour le modifier. Le flux reste unidirectionnel et explicite.\n\nQuand il faut faire traverser beaucoup de niveaux (prop drilling), le **Context** permet de fournir une valeur à tout un sous-arbre. Il convient bien aux données qui changent peu : thème, utilisateur connecté, langue. Attention : tous les consommateurs se re-rendent quand la valeur change ; on découpe donc en plusieurs contextes et on mémoïse la valeur fournie.\n\nPour un état global riche ou très dynamique, un **store** (Zustand, Redux Toolkit, Jotai) permet des abonnements sélectifs. Et les **données serveur** (cache, chargement, revalidation) sont mieux gérées par TanStack Query ou SWR que par un état global fait main.\n\nMa démarche : état local par défaut, remonter si nécessaire, puis contexte ou store seulement quand le besoin est réel.",
    attendu: "Une progression raisonnée des solutions et la connaissance du coût du contexte (re-rendu des consommateurs).",
  },
  {
    id: 'r8',
    section: 'react',
    q: 'Explique le Virtual DOM et la réconciliation.',
    answer:
      "Un composant React renvoie une description de l'interface : un arbre d'objets JavaScript légers, le **Virtual DOM**. À chaque mise à jour, React produit un nouvel arbre et le compare au précédent : c'est la **réconciliation**. Il calcule les différences et ne modifie dans le vrai DOM que ce qui a changé.\n\nLa comparaison complète de deux arbres serait trop coûteuse ; React utilise donc des heuristiques en temps linéaire :\n- si le type d'un élément change (`div` devient `span`, ou un composant devient un autre), tout le sous-arbre est détruit et recréé, avec perte d'état ;\n- dans une liste, les `key` permettent d'associer les éléments d'un rendu à l'autre.\n\nLe travail se fait en deux phases : la phase de **rendu** (appeler les composants et calculer les différences), interruptible depuis l'architecture Fiber et le rendu concurrent, puis la phase de **commit**, qui applique les changements au DOM de façon synchrone. Le Virtual DOM n'est pas magique : c'est un compromis qui permet un code déclaratif avec des performances correctes.",
    attendu: "Le principe de comparaison d'arbres, les heuristiques (type, key) et la distinction rendu/commit.",
  },

  // ───────────────────────────── Vue ─────────────────────────────
  {
    id: 'v1',
    section: 'vue',
    q: 'Comment fonctionne la réactivité dans Vue 3 ? ref ou reactive ?',
    answer:
      "Vue 3 enveloppe les objets réactifs dans un **Proxy**. Quand un effet (rendu d'un composant, `computed`, `watch`) lit une propriété, Vue enregistre cette dépendance ; quand la propriété est modifiée, Vue relance précisément les effets qui en dépendent. Vue 2 utilisait `Object.defineProperty`, qui ne détectait pas l'ajout de propriétés ni l'affectation par index dans un tableau.\n\n- `reactive(obj)` renvoie un Proxy profond de l'objet. Il ne fonctionne qu'avec des objets, et on perd la réactivité si on le déstructure ou si on remplace l'objet entier.\n- `ref(value)` enveloppe n'importe quelle valeur, y compris une primitive, dans un objet avec une propriété `.value` réactive ; si la valeur est un objet, elle est rendue réactive en profondeur. Dans le template, les refs sont déballées automatiquement.\n\nLa documentation officielle recommande `ref` par défaut, car il est plus explicite et se passe sans perte entre fonctions. Pour déstructurer un objet réactif, on utilise `toRefs`.",
    attendu: "Le principe du suivi des dépendances via Proxy, et les différences pratiques entre ref et reactive (primitives, `.value`, déstructuration).",
    code: `<script setup>
import { ref, reactive, computed } from 'vue'

const count = ref(0)
const user = reactive({ name: 'Ada', skills: [] })
const label = computed(() => user.name + ' : ' + count.value)

function add() {
  count.value++
  user.skills.push('vue')
}
</script>

<template>
  <button @click="add">{{ label }}</button>
</template>`,
    run: false,
  },
  {
    id: 'v2',
    section: 'vue',
    q: 'computed ou watch : quand utiliser lequel ?',
    answer:
      "Un **computed** dérive une valeur d'autres données réactives. Il est **mis en cache** : il n'est recalculé que lorsque l'une de ses dépendances change, et seulement quand on le lit. Il doit rester pur, sans effet de bord, comme une formule de tableur.\n\nUn **watch** exécute un **effet de bord** en réaction à un changement : appel d'API, sauvegarde dans le `localStorage`, navigation, manipulation hors de Vue. Il donne accès à l'ancienne et à la nouvelle valeur, peut être profond ou immédiat (`immediate`), et propose un cleanup avec `onCleanup` pour annuler une requête obsolète. `watchEffect` suit automatiquement ses dépendances, sans les lister.\n\nRègle simple : si je veux **une valeur**, c'est un `computed` ; si je veux **faire quelque chose**, c'est un `watch`. Utiliser un `watch` pour recopier une valeur dérivée dans un `ref` est un anti-pattern.",
    attendu: "La distinction valeur dérivée et mise en cache contre effet de bord, avec un exemple pour chacun.",
    code: `const firstName = ref('Ada')
const lastName = ref('Lovelace')
const fullName = computed(() => firstName.value + ' ' + lastName.value)

const query = ref('')
watch(query, async (q, oldQ, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  results.value = await search(q, { signal: controller.signal })
})`,
    run: false,
  },
  {
    id: 'v3',
    section: 'vue',
    q: 'Quelle différence entre v-if et v-show ?',
    answer:
      "`v-if` est un rendu **conditionnel réel** : quand la condition est fausse, l'élément n'existe pas dans le DOM, et le composant est démonté, avec ses écouteurs et son état. Quand elle redevient vraie, tout est recréé. Il est paresseux : rien n'est rendu tant que la condition est fausse au départ. Il fonctionne avec `v-else` et `v-else-if`.\n\n`v-show` rend toujours l'élément et se contente de basculer `display: none` en CSS. L'état du composant est conservé.\n\nDonc `v-if` a un coût de bascule plus élevé, et `v-show` un coût de rendu initial plus élevé. J'utilise `v-show` pour un élément qui s'affiche et se masque souvent (onglets, menu déroulant), et `v-if` pour une condition qui change rarement ou pour ne pas monter un composant coûteux inutilement.",
    attendu: "Montage/démontage contre bascule CSS, et un critère de choix basé sur la fréquence des changements.",
    code: `<template>
  <AdminPanel v-if="user.isAdmin" />
  <p v-else>Accès refusé</p>
  <DropdownMenu v-show="menuOpen" />
</template>`,
    run: false,
  },
  {
    id: 'v4',
    section: 'vue',
    q: 'Comment communiquent un composant parent et un composant enfant dans Vue ?',
    answer:
      "Le principe est **props down, events up** : le parent transmet des données à l'enfant via des **props**, et l'enfant signale des changements en **émettant des événements**, que le parent écoute avec `@nom`. Les props sont en lecture seule dans l'enfant : les modifier directement provoque un avertissement, car cela casserait le flux de données unidirectionnel.\n\nAvec `<script setup>`, on déclare `defineProps` et `defineEmits`. Le `v-model` sur un composant est un raccourci pour une prop `modelValue` et un événement `update:modelValue` ; depuis Vue 3.4, `defineModel` le simplifie encore.\n\nPour des composants éloignés, on utilise `provide`/`inject` (l'équivalent du contexte React) ou un store **Pinia**, le gestionnaire d'état officiel. Les slots servent, eux, à transmettre du contenu de template.",
    attendu: "Le flux unidirectionnel props/événements, le fonctionnement de v-model sur un composant et les solutions pour les composants éloignés.",
    code: `<!-- Enfant : Rating.vue -->
<script setup>
const props = defineProps({ value: Number })
const emit = defineEmits(['change'])
</script>
<template>
  <button @click="emit('change', props.value + 1)">{{ props.value }} ★</button>
</template>

<!-- Parent -->
<Rating :value="score" @change="score = $event" />`,
    run: false,
  },
  {
    id: 'v5',
    section: 'vue',
    q: 'Composition API ou Options API ?',
    answer:
      "L'**Options API** organise un composant par type d'option : `data`, `computed`, `methods`, `watch`, hooks de cycle de vie, avec `this` pour accéder à tout. Elle est simple à apprendre et très lisible pour de petits composants.\n\nLa **Composition API** (`setup`, et surtout `<script setup>`) organise le code par **fonctionnalité** : on regroupe les `ref`, `computed` et `watch` d'une même préoccupation, et on peut les extraire dans des **composables** (`useFetch`, `useMouse`), l'équivalent des hooks personnalisés de React. Elle offre une bien meilleure inférence TypeScript et évite les mixins, dont l'origine des propriétés était opaque.\n\nLes deux restent supportées et utilisent le même système de réactivité. Pour un nouveau projet, surtout en TypeScript ou avec de la logique réutilisable, je choisis la Composition API avec `<script setup>`. Contrairement aux hooks React, `setup` ne s'exécute qu'une fois par instance, donc pas de règles d'ordre d'appel ni de closures périmées.",
    attendu: "L'organisation par option contre par fonctionnalité, les composables, l'apport TypeScript et idéalement la comparaison avec les hooks React.",
  },

  // ───────────────────────────── Angular ─────────────────────────────
  {
    id: 'a1',
    section: 'angular',
    q: "Comment fonctionne l'injection de dépendances dans Angular ?",
    answer:
      "Une classe ne crée pas elle-même ses dépendances : elle les **déclare**, et Angular les lui fournit. On marque un service avec `@Injectable`, souvent `providedIn: 'root'` pour un singleton partagé dans toute l'application, puis on le récupère avec la fonction `inject()` ou via le constructeur.\n\nLes injecteurs sont **hiérarchiques** : un service peut être fourni au niveau racine, d'une route ou d'un composant (`providers`). Angular cherche le fournisseur en remontant l'arbre, ce qui permet d'avoir une instance par composant si besoin. Les tokens (`InjectionToken`) permettent d'injecter des valeurs qui ne sont pas des classes, comme une configuration.\n\nLes intérêts : un couplage faible, des singletons gérés par le framework, et surtout une **testabilité** facile, puisqu'on remplace un service par un faux dans les tests. Avec `providedIn: 'root'`, un service non utilisé est en plus éliminé par le tree shaking.",
    attendu: "Le principe d'inversion de contrôle, les injecteurs hiérarchiques et les bénéfices (singletons, tests).",
    code: `@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  getUser(id: string) {
    return this.http.get<User>('/api/users/' + id)
  }
}

@Component({ selector: 'app-profile', template: '...' })
export class ProfileComponent {
  private users = inject(UserService)
}`,
    run: false,
  },
  {
    id: 'a2',
    section: 'angular',
    q: 'Comment fonctionne la détection de changements dans Angular ?',
    answer:
      "Historiquement, Angular s'appuie sur **zone.js**, qui patche les API asynchrones du navigateur (événements, minuteurs, requêtes, promesses). Après chacune de ces opérations, Angular est notifié et vérifie l'arbre des composants **de haut en bas**, en comparant les valeurs liées dans les templates pour mettre à jour le DOM. C'est simple pour le développeur, mais cela peut faire beaucoup de vérifications inutiles.\n\nLa stratégie **OnPush** limite ces vérifications : un composant n'est vérifié que si une de ses entrées change de référence, si un événement se produit dans son template, si un pipe `async` émet, ou après un `markForCheck()`. Elle va de pair avec des données immuables.\n\nLes **signals**, introduits dans Angular 16, apportent une réactivité fine : Angular sait exactement quels templates lisent quel signal et ne met à jour que ceux-là. Ils rendent possible le mode **zoneless**, sans zone.js, désormais stable et recommandé pour les nouveaux projets : plus léger, plus prévisible et plus performant.",
    attendu: "Le rôle de zone.js, le fonctionnement d'OnPush et l'évolution vers les signals et le mode zoneless.",
    code: `@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<button (click)="increment()">{{ count() }} / {{ double() }}</button>',
})
export class CounterComponent {
  count = signal(0)
  double = computed(() => this.count() * 2)
  increment() {
    this.count.update((c) => c + 1)
  }
}`,
    run: false,
  },
  {
    id: 'a3',
    section: 'angular',
    q: 'Observables RxJS ou promesses : quelles différences ?',
    answer:
      "Une **promesse** représente une seule valeur future ; elle est **eager** (le travail démarre à sa création), ne peut pas être annulée et est toujours asynchrone.\n\nUn **Observable** représente un **flux** de zéro, une ou plusieurs valeurs dans le temps. Il est **lazy** : rien ne se passe tant qu'on n'y est pas abonné. Il est **annulable** via `unsubscribe()`, et il se compose avec une riche bibliothèque d'opérateurs : `map`, `filter`, `debounceTime`, `switchMap`, `combineLatest`…\n\nDans Angular, `HttpClient`, le routeur et les formulaires réactifs exposent des Observables. Exemple typique : une recherche avec `debounceTime` puis `switchMap`, qui annule automatiquement la requête précédente et évite les race conditions.\n\nLe point de vigilance, ce sont les abonnements jamais terminés, sources de fuites mémoire : on préfère le pipe `async`, `takeUntilDestroyed()` ou la conversion en signal avec `toSignal()`.",
    attendu: "Valeur unique contre flux, eager contre lazy, annulation, opérateurs, et la gestion des désabonnements.",
    code: `this.results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((q) => this.api.search(q)), // annule la requête précédente
)

// dans le template : @for (r of results$ | async; track r.id) { ... }`,
    run: false,
  },
  {
    id: 'a4',
    section: 'angular',
    q: 'Composants, services, modules : comment est structurée une application Angular ?',
    answer:
      "- Les **composants** gèrent l'affichage : une classe TypeScript, un template et des styles, avec des entrées (`input()`) et des sorties (`output()`) pour communiquer avec le parent.\n- Les **services** contiennent la logique métier, l'accès aux données et l'état partagé ; ils sont injectés dans les composants grâce à l'injection de dépendances.\n- Les directives et les pipes complètent le tout pour enrichir et transformer l'affichage.\n\nHistoriquement, tout devait être déclaré dans des **NgModules**, qui regroupaient composants, imports et fournisseurs. Depuis Angular 14, les **composants standalone** déclarent directement leurs propres dépendances dans `imports`, et ils sont le comportement par défaut depuis Angular 19. Les NgModules restent supportés, mais une application moderne n'en a plus besoin : on démarre avec `bootstrapApplication` et on charge les routes à la demande avec `loadComponent`.\n\nLa bonne pratique est de garder des composants légers, centrés sur l'affichage, et de déléguer la logique aux services.",
    attendu: "Le rôle de chaque brique, la séparation affichage/logique et la connaissance du passage aux composants standalone.",
  },
  {
    id: 'a5',
    section: 'angular',
    q: 'Quels sont les principaux hooks de cycle de vie dans Angular ?',
    answer:
      "Dans l'ordre d'appel, les plus utilisés sont :\n- le **constructeur**, réservé à l'injection de dépendances : les entrées ne sont pas encore disponibles ;\n- `ngOnChanges`, appelé quand une entrée change, avec les anciennes et nouvelles valeurs ;\n- `ngOnInit`, appelé une fois après la première affectation des entrées : c'est là qu'on initialise et qu'on charge les données ;\n- `ngAfterViewInit`, quand la vue et les vues enfants sont prêtes : on peut accéder aux `@ViewChild` et au DOM ;\n- `ngOnDestroy`, juste avant la destruction : on y nettoie abonnements, minuteurs et écouteurs.\n\nIl existe aussi `ngDoCheck` et les variantes `AfterContent` et `AfterViewChecked`, appelées à chaque cycle de détection, à utiliser avec prudence. Dans le code récent, on remplace souvent `ngOnDestroy` par `DestroyRef` ou `takeUntilDestroyed()`, et certains usages des hooks par des signals, `computed()` et `effect()`.",
    attendu: "L'ordre et le rôle des hooks principaux, surtout la différence constructeur/ngOnInit et l'importance du nettoyage dans ngOnDestroy.",
    code: `export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  data = input.required<number[]>()
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>
  private timer?: number

  ngOnInit() { this.timer = window.setInterval(() => this.refresh(), 5000) }
  ngAfterViewInit() { this.draw(this.canvas.nativeElement) }
  ngOnDestroy() { clearInterval(this.timer) }
}`,
    run: false,
  },

  // ───────────────────────────── Comparaison ─────────────────────────────
  {
    id: 'c1',
    section: 'comparaison',
    q: 'Virtual DOM, signals, détection par zones : comment les frameworks savent-ils quoi mettre à jour ?',
    answer:
      "Trois grandes approches :\n- **Virtual DOM** (React, et Vue en partie) : à chaque changement d'état, le composant concerné et ses enfants sont ré-exécutés pour produire un nouvel arbre virtuel, comparé au précédent. C'est simple à raisonner (l'UI est une fonction de l'état), mais on recalcule plus que nécessaire, d'où `memo` ou le React Compiler.\n- **Détection par zones** (Angular historique) : zone.js signale la fin de chaque opération asynchrone, et Angular vérifie les liaisons de tout l'arbre de composants, ou d'une partie avec OnPush. Aucun code de notification à écrire, mais beaucoup de vérifications inutiles.\n- **Réactivité fine par signals** (Solid, Vue avec ses refs, Angular récent, Svelte 5, Preact Signals) : chaque valeur réactive connaît précisément les calculs et les nœuds du DOM qui en dépendent, et seuls ceux-là sont mis à jour, sans comparaison d'arbre.\n\nLa tendance du secteur va vers les signals pour leur précision. Vue combine les deux : réactivité fine pour savoir quel composant re-rendre, Virtual DOM pour mettre à jour ce composant.",
    attendu: "Comprendre le mécanisme de chaque approche, leurs compromis, et la convergence actuelle vers les signals.",
  },
  {
    id: 'c2',
    section: 'comparaison',
    q: 'SSR, CSR, SSG : quelles différences ? Qu’est-ce que l’hydratation ?',
    answer:
      "- **CSR** (Client-Side Rendering) : le serveur envoie un HTML presque vide et le JavaScript construit la page dans le navigateur. Navigation fluide ensuite, mais premier affichage plus lent et SEO plus délicat.\n- **SSR** (Server-Side Rendering) : le serveur génère le HTML complet à chaque requête. Affichage rapide et bon SEO, avec un contenu personnalisé et à jour, mais un coût serveur.\n- **SSG** (Static Site Generation) : le HTML est généré au build et servi depuis un CDN. C'est le plus rapide et le moins cher, mais réservé à un contenu qui change peu ; l'ISR permet de régénérer certaines pages périodiquement.\n\nAvec le SSR ou le SSG, la page est visible tout de suite mais pas encore interactive : l'**hydratation** est l'étape où le JavaScript client reprend ce HTML, attache les écouteurs et reconstruit l'état. Elle coûte cher sur une grosse page, et un HTML différent entre serveur et client provoque des erreurs d'hydratation. D'où les approches récentes : îlots (Astro), React Server Components, hydratation progressive ou incrémentale, et resumability (Qwik).\n\nLes méta-frameworks (Next.js, Nuxt, SvelteKit, Angular SSR) permettent de choisir la stratégie page par page.",
    attendu: "Les compromis de chaque mode (performance, SEO, coût, fraîcheur des données) et une explication claire de l'hydratation et de son coût.",
  },
  {
    id: 'c3',
    section: 'comparaison',
    q: "Quelles approches pour la gestion d'état dans une application front ?",
    answer:
      "Je commence par distinguer les **types d'état** :\n- l'**état local** d'un composant (formulaire, menu ouvert) reste dans le composant ;\n- l'**état serveur** (données d'API) a besoin de cache, de revalidation et de gestion du chargement : TanStack Query, SWR, ou les resources d'Angular s'en chargent mieux qu'un store ;\n- l'**état d'URL** (filtres, pagination) va dans l'URL, ce qui le rend partageable ;\n- l'**état global client** (utilisateur, préférences, panier) justifie un store.\n\nPour ce dernier, les approches varient selon l'écosystème : un store centralisé avec actions et immutabilité (Redux Toolkit, NgRx), des stores simples à base de hooks (Zustand), des atomes (Jotai), ou des stores réactifs (Pinia pour Vue, services avec signals pour Angular). Le contexte de React et `provide`/`inject` de Vue servent plutôt à l'injection de dépendances qu'à de l'état très dynamique.\n\nMon critère principal : choisir la solution la plus simple qui couvre le besoin, et ne pas tout mettre dans un store global par réflexe.",
    attendu: "La capacité à catégoriser l'état et à choisir l'outil adapté, plutôt qu'une réponse unique du type « Redux partout ».",
  },
  {
    id: 'c4',
    section: 'comparaison',
    q: 'Comment choisirais-tu un framework pour un nouveau projet ?',
    answer:
      "Il n'y a pas de meilleur framework dans l'absolu ; je pars des **contraintes du projet et de l'équipe** :\n- **les compétences de l'équipe** et la facilité de recrutement : React a le plus grand vivier, Angular est très présent dans les grandes entreprises, Vue est réputé pour sa courbe d'apprentissage douce ;\n- **la nature du produit** : site de contenu avec un fort besoin de SEO (SSG/SSR, Astro, Next.js, Nuxt), application métier complexe (Angular et son cadre complet : routeur, formulaires, injection de dépendances, tests), application interactive très performante (Solid, Svelte) ;\n- **l'écosystème** : bibliothèques de composants, outillage, méta-framework disponible ;\n- **la pérennité** : maturité, soutien, rythme des changements, politique de migration ;\n- **la taille et la structure de l'équipe** : un cadre opinionated comme Angular homogénéise de grosses équipes, React laisse plus de choix mais demande plus de décisions d'architecture.\n\nJe défendrais mon choix avec ces critères, éventuellement en validant par un petit prototype.",
    attendu: "Une réponse argumentée par des critères (équipe, produit, écosystème, pérennité) plutôt qu'une préférence personnelle.",
  },
  {
    id: 'c5',
    section: 'comparaison',
    q: 'Liaison unidirectionnelle ou bidirectionnelle : quelle différence ?',
    answer:
      "Avec la **liaison unidirectionnelle** (one-way data flow), les données descendent du parent vers l'enfant via les props, et l'enfant demande un changement en appelant une callback ou en émettant un événement. Le parent reste propriétaire de l'état. C'est le modèle de React : un champ de formulaire est « contrôlé » avec `value` et `onChange`.\n\nAvec la **liaison bidirectionnelle** (two-way binding), la vue et la donnée sont synchronisées dans les deux sens : `v-model` dans Vue, `[(ngModel)]` ou `model()` dans Angular. C'est moins verbeux pour les formulaires.\n\nDans les frameworks modernes, la liaison bidirectionnelle n'est que du **sucre syntaxique** au-dessus d'un flux unidirectionnel : `v-model` correspond à une prop plus un événement, et `[(x)]` combine `[x]` et `(xChange)`. Le flux de données reste donc traçable. Le problème du two-way binding implicite de l'ancien AngularJS était justement qu'on ne savait plus qui modifiait quoi.",
    attendu: "Comprendre les deux modèles, savoir que le two-way moderne est construit sur du one-way, et en connaître les avantages (traçabilité contre concision).",
    code: `// React : flux unidirectionnel explicite
<input value={name} onChange={(e) => setName(e.target.value)} />

<!-- Vue : v-model = :value + @input -->
<input v-model="name" />

<!-- Angular : [(ngModel)] = [ngModel] + (ngModelChange) -->
<input [(ngModel)]="name" />`,
    run: false,
  },
  {
    id: 'c6',
    section: 'comparaison',
    q: 'Framework compilé (Svelte) ou framework à l’exécution : quelle différence ?',
    answer:
      "Un framework **à l'exécution** comme React embarque dans le bundle un runtime qui interprète les composants dans le navigateur : il exécute les composants, compare les arbres virtuels et applique les changements. C'est très flexible (l'UI est du JavaScript pur), mais il faut télécharger et exécuter ce runtime.\n\nUn framework **compilé** comme Svelte fait l'essentiel du travail au **build** : le compilateur analyse les composants et génère du JavaScript impératif qui met directement à jour les nœuds DOM concernés. Le runtime est minimal, les bundles sont petits et les mises à jour précises. Svelte 5, avec les runes, compile vers un système de signals.\n\nLa frontière est floue : Angular et Vue compilent leurs templates (Vue optimise les nœuds statiques), Solid compile JSX vers une réactivité fine, et le React Compiler ajoute automatiquement de la mémoïsation au build. En contrepartie, une approche compilée impose une syntaxe propre au framework et une magie parfois moins transparente au débogage.",
    attendu: "Où se fait le travail (build contre navigateur), l'impact sur la taille et les performances, et la nuance que la plupart des frameworks mêlent les deux.",
  },
]
