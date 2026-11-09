import type { Piege } from './types'
import { tsPieges } from './piegesTs'

const jsPieges: Piege[] = [
  {
    id: 'array-plus-object',
    title: '`[] + {}` et `{} + []`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log([] + {})
console.log({} + [])
console.log(eval('{} + []'))`,
    output: `[object Object]
[object Object]
0`,
    explanation: `L'opérateur \`+\` convertit d'abord ses deux opérandes en primitives (\`ToPrimitive\`, qui appelle \`valueOf\` puis \`toString\`). Un tableau vide devient la chaîne \`''\` et un objet littéral devient \`'[object Object]'\`. Dès qu'un des deux côtés est une chaîne, \`+\` fait une **concaténation** : \`'' + '[object Object]'\` donne \`'[object Object]'\`, dans un sens comme dans l'autre.

Le piège célèbre vient de la console : taper \`{} + []\` seul sur une ligne affiche \`0\`. En position d'instruction, une accolade ouvrante est lue comme un **bloc vide**, pas comme un objet. Il reste \`+[]\`, le plus unaire, qui convertit \`[]\` en nombre : \`''\` puis \`0\`. C'est ce que montre \`eval('{} + []')\`, qui évalue le texte comme un programme. Dans \`console.log({} + [])\`, on est dans un argument, donc dans un contexte d'expression : \`{}\` est bien un objet.

En pratique : ne jamais additionner des objets, convertir explicitement (\`String(x)\`, \`Number(x)\`), et entourer un objet littéral de parenthèses quand il pourrait être lu comme un bloc (par exemple \`() => ({ a: 1 })\`).`,
  },
  {
    id: 'array-loose-equals-not-array',
    title: '`[] == ![]` vaut `true`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log([] == ![])
console.log([] == [])
console.log([] == false)`,
    output: `true
false
true`,
    explanation: `\`![]\` s'évalue en premier : un tableau, même vide, est **truthy**, donc \`![]\` vaut \`false\`. On compare alors \`[] == false\`. L'algorithme d'égalité abstraite (\`IsLooselyEqual\`) convertit le booléen en nombre (\`false\` → \`0\`), puis l'objet en primitive (\`[]\` → \`''\`), puis la chaîne en nombre (\`''\` → \`0\`). Résultat : \`0 == 0\`, donc \`true\`.

\`[] == []\` compare en revanche deux objets : aucune conversion, seules les **références** comptent, et ce sont deux tableaux distincts, donc \`false\`.

Pour éviter tout cela : utiliser \`===\` partout (pas de conversion implicite) et tester explicitement ce qu'on veut savoir, par exemple \`arr.length === 0\` pour un tableau vide.`,
  },
  {
    id: 'float-addition',
    title: '`0.1 + 0.2 !== 0.3`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(0.1 + 0.2)
console.log(0.1 + 0.2 === 0.3)`,
    output: `0.30000000000000004
false`,
    explanation: `Les nombres JavaScript sont des flottants **IEEE 754 double précision** (64 bits, en base 2). Comme 1/3 en base 10, \`0.1\` et \`0.2\` n'ont pas de représentation binaire finie : on stocke la valeur la plus proche. Les deux petites erreurs s'additionnent et le résultat n'est pas le flottant le plus proche de \`0.3\`, d'où \`0.30000000000000004\`. Ce n'est pas un bug de JavaScript : Python, Java ou C donnent la même chose.

Pour comparer des flottants, on tolère un écart (\`Number.EPSILON\` pour des valeurs proches de 1). Pour de l'argent, on calcule en **entiers** (centimes) ou avec \`BigInt\`, et on n'arrondit qu'à l'affichage (\`toFixed\`, \`Intl.NumberFormat\`).`,
    fix: {
      code: `const nearlyEqual = (a, b) => Math.abs(a - b) < Number.EPSILON
console.log(nearlyEqual(0.1 + 0.2, 0.3))
// En centimes : calcul exact sur des entiers
console.log((10 + 20) / 100)`,
      output: `true
0.3`,
    },
  },
  {
    id: 'typeof-null-nan',
    title: '`typeof null` et `typeof NaN`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(typeof null)
console.log(typeof NaN)
console.log(typeof [])
console.log(typeof function () {})`,
    output: `object
number
object
function`,
    explanation: `\`typeof null === 'object'\` est un **bug historique** de la première implémentation (les valeurs étaient étiquetées par quelques bits, et \`null\` partageait l'étiquette des objets). Il n'a jamais été corrigé pour ne pas casser le web. \`null\` est pourtant une primitive.

\`NaN\` (« Not a Number ») est bien une valeur du type **number** : c'est le résultat d'une opération numérique invalide (\`0 / 0\`, \`Number('abc')\`).

Les tableaux sont des objets (\`typeof [] === 'object'\`), et les fonctions sont des objets appelables, pour lesquels \`typeof\` fait une exception et renvoie \`'function'\`.

Bons réflexes : \`x === null\` pour tester \`null\`, \`Array.isArray(x)\` pour un tableau, \`Number.isNaN(x)\` pour \`NaN\`, et \`x !== null && typeof x === 'object'\` pour « est un objet ».`,
  },
  {
    id: 'nan-not-equal-itself',
    title: '`NaN !== NaN` et `Object.is`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(NaN === NaN)
console.log(Object.is(NaN, NaN))
console.log([NaN].indexOf(NaN), [NaN].includes(NaN))
console.log(0 === -0, Object.is(0, -0))`,
    output: `false
true
-1 true
true false`,
    explanation: `Selon IEEE 754, \`NaN\` n'est égal à **rien**, pas même à lui-même : \`NaN === NaN\` et \`NaN == NaN\` valent \`false\`. C'est d'ailleurs la seule valeur telle que \`x !== x\`.

\`Object.is\` implémente l'algorithme **SameValue** : identique à \`===\` sauf sur deux points, \`Object.is(NaN, NaN)\` est \`true\` et \`Object.is(0, -0)\` est \`false\`.

Les méthodes de tableau n'utilisent pas toutes la même égalité : \`indexOf\` utilise \`===\` (donc ne trouve jamais \`NaN\`), tandis que \`includes\`, \`Set\` et \`Map\` utilisent **SameValueZero** (comme SameValue, mais \`0\` et \`-0\` égaux). Pour tester \`NaN\`, utiliser \`Number.isNaN(x)\` plutôt que la globale \`isNaN\`, qui convertit d'abord son argument (\`isNaN('abc')\` vaut \`true\`).`,
  },
  {
    id: 'null-comparison',
    title: '`null >= 0` mais `null != 0`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(null >= 0)
console.log(null > 0)
console.log(null == 0)
console.log(null == undefined)`,
    output: `true
false
false
true`,
    explanation: `Les opérateurs relationnels (\`<\`, \`>\`, \`<=\`, \`>=\`) et l'égalité abstraite \`==\` suivent **deux algorithmes différents**.

Pour \`>\` et \`>=\`, les opérandes sont convertis en nombres : \`null\` devient \`0\`. Donc \`null > 0\` est \`0 > 0\` (\`false\`), et \`null >= 0\` est défini comme « pas \`null < 0\` », soit \`true\`.

Pour \`==\`, \`null\` n'est **jamais converti en nombre** : la spécification dit seulement que \`null == undefined\` est vrai, et que \`null\` n'est égal à rien d'autre. Donc \`null == 0\` vaut \`false\`.

On obtient l'absurdité « supérieur ou égal, mais ni supérieur ni égal ». En pratique, tester \`null\`/\`undefined\` explicitement avant toute comparaison numérique (\`x != null\` ou \`x ?? valeurParDefaut\`).`,
  },
  {
    id: 'string-minus-plus',
    title: "`'5' - 2` contre `'5' + 2`",
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log('5' - 2)
console.log('5' + 2)
console.log('5' * '2')
console.log(+'5' + 2)
console.log(1 + 2 + '3')`,
    output: `3
52
10
7
33`,
    explanation: `\`+\` est **surchargé** : si l'un des opérandes (après conversion en primitive) est une chaîne, il concatène ; sinon il additionne. \`'5' + 2\` donne donc la chaîne \`'52'\`.

Les autres opérateurs arithmétiques (\`-\`, \`*\`, \`/\`, \`%\`) n'existent que pour les nombres : ils convertissent toujours leurs opérandes avec \`ToNumber\`. \`'5' - 2\` vaut \`3\`, \`'5' * '2'\` vaut \`10\`.

Le \`+\` unaire convertit en nombre : \`+'5' + 2\` vaut \`7\`. Enfin, l'évaluation se fait de gauche à droite : \`1 + 2 + '3'\` donne \`3 + '3'\`, soit \`'33'\`.

Dans du vrai code, convertir explicitement les entrées utilisateur (\`Number(input.value)\`) avant tout calcul, et utiliser les template literals pour construire des chaînes.`,
  },
  {
    id: 'var-loop-settimeout',
    title: '`var` dans une boucle avec `setTimeout`',
    theme: 'closures',
    question: "Qu'affiche ce code ?",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}`,
    output: `3
3
3`,
    explanation: `\`var\` a une portée **de fonction** (ici globale) : il n'existe qu'**une seule** variable \`i\`, partagée par les trois callbacks. Les callbacks de \`setTimeout\` ne s'exécutent qu'après la fin du script (ce sont des macrotâches) ; à ce moment, la boucle est terminée et \`i\` vaut \`3\`. Chaque closure lit la valeur **actuelle** de la variable, pas une copie prise au moment de sa création.

Avec \`let\`, la spécification crée une **nouvelle liaison de \`i\` à chaque itération** (copiée depuis la précédente) : chaque callback capture sa propre variable. Avant ES6, on contournait le problème avec une IIFE qui recevait \`i\` en paramètre.`,
    fix: {
      code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}`,
      output: `0
1
2`,
    },
  },
  {
    id: 'this-lost-in-callback',
    title: '`this` perdu dans un callback',
    theme: 'this',
    question: "Qu'affiche ce code (script non strict) ?",
    code: `const counter = {
  count: 0,
  inc() {
    this.count++
    console.log(this.count)
  },
}
counter.inc()
setTimeout(counter.inc, 0)`,
    output: `1
NaN`,
    explanation: `\`this\` n'est pas fixé à la définition d'une méthode : il dépend de **la façon dont la fonction est appelée**. \`counter.inc()\` est un appel de méthode, donc \`this === counter\`.

\`setTimeout(counter.inc, 0)\` ne passe que **la fonction**, détachée de son objet. Elle est ensuite appelée « nue » : en mode non strict, \`this\` vaut alors l'objet global (\`window\`). \`window.count\` est \`undefined\`, et \`undefined++\` donne \`NaN\`. En mode strict (modules, classes), \`this\` serait \`undefined\` et on obtiendrait une \`TypeError\`.

Le même problème survient avec \`const f = obj.method; f()\`, un gestionnaire d'événement, ou une méthode passée à \`map\`. Corrections : une fonction fléchée qui appelle la méthode (\`() => counter.inc()\`), ou \`counter.inc.bind(counter)\`.`,
    fix: {
      code: `const counter = {
  count: 0,
  inc() {
    this.count++
    console.log(this.count)
  },
}
setTimeout(() => counter.inc(), 0)
setTimeout(counter.inc.bind(counter), 0)`,
      output: `1
2`,
    },
  },
  {
    id: 'arrow-as-method',
    title: 'Fonction fléchée comme méthode',
    theme: 'this',
    question: "Qu'affiche ce code ?",
    code: `const user = {
  firstName: 'Ada',
  hello: () => 'Bonjour ' + this.firstName,
  hi() {
    return 'Salut ' + this.firstName
  },
}
console.log(user.hello())
console.log(user.hi())`,
    output: `Bonjour undefined
Salut Ada`,
    explanation: `Une fonction fléchée n'a **pas de \`this\` propre** : elle capture celui de la portée lexicale où elle est **définie**. Un objet littéral ne crée pas de portée : ici, la portée englobante est le script global, où \`this\` est \`window\`. \`window.firstName\` n'existe pas, d'où \`undefined\`. Ni \`.call\`, ni \`.bind\`, ni l'appel \`user.hello()\` ne peuvent changer le \`this\` d'une fléchée.

La méthode raccourcie \`hi() {}\` est une fonction classique : appelée via \`user.hi()\`, elle reçoit \`this === user\`.

Règle pratique : méthodes d'objet et de classe en syntaxe classique ; fonctions fléchées pour les callbacks **à l'intérieur** d'une méthode, justement parce qu'elles réutilisent le \`this\` de la méthode.`,
  },
  {
    id: 'sort-default-lexicographic',
    title: '`sort()` trie des chaînes',
    theme: 'arrays',
    question: "Qu'affiche ce code ?",
    code: `const nums = [10, 9, 1, 100, 25]
console.log(nums.sort())
console.log(nums)`,
    output: `[ 1, 10, 100, 25, 9 ]
[ 1, 10, 100, 25, 9 ]`,
    explanation: `Sans fonction de comparaison, \`Array.prototype.sort\` convertit les éléments en **chaînes** et les compare par ordre des unités UTF-16. \`'10'\` vient avant \`'9'\` car \`'1' < '9'\`, exactement comme dans un dictionnaire.

Deuxième piège : \`sort\` trie **en place** et renvoie le même tableau. \`nums\` est donc modifié, ce qui pose problème si le tableau vient des props ou d'un state (React, Vue).

Corrections : passer un comparateur numérique \`(a, b) => a - b\` (négatif : \`a\` avant \`b\`), et utiliser \`toSorted\` (ES2023) ou \`[...nums].sort(...)\` pour ne pas muter l'original. Pour des chaînes en français, \`localeCompare\` gère accents et casse.`,
    fix: {
      code: `const nums = [10, 9, 1, 100, 25]
const sorted = nums.toSorted((a, b) => a - b)
console.log(sorted)
console.log(nums)`,
      output: `[ 1, 9, 10, 25, 100 ]
[ 10, 9, 1, 100, 25 ]`,
    },
  },
  {
    id: 'map-parseint',
    title: "`['1', '2', '3'].map(parseInt)`",
    theme: 'arrays',
    question: "Qu'affiche ce code ?",
    code: `console.log(['1', '2', '3'].map(parseInt))`,
    output: `[ 1, NaN, NaN ]`,
    explanation: `\`map\` appelle son callback avec **trois arguments** : \`(element, index, array)\`. Et \`parseInt\` accepte un deuxième paramètre, la **base** (radix). On exécute donc :

- \`parseInt('1', 0)\` : base 0 signifie « détecter automatiquement », soit 10, donc \`1\` ;
- \`parseInt('2', 1)\` : la base 1 est invalide (il faut 2 à 36), donc \`NaN\` ;
- \`parseInt('3', 2)\` : \`'3'\` n'est pas un chiffre binaire, donc \`NaN\`.

Leçon générale : ne passez une fonction par référence à \`map\`/\`forEach\`/\`filter\` que si vous connaissez sa signature complète. Écrire \`map((s) => parseInt(s, 10))\` ou \`map(Number)\` (\`Number\` n'utilise que son premier argument).`,
    fix: {
      code: `console.log(['1', '2', '3'].map(Number))
console.log(['1', '2', '3'].map((s) => parseInt(s, 10)))`,
      output: `[ 1, 2, 3 ]
[ 1, 2, 3 ]`,
    },
  },
  {
    id: 'async-foreach',
    title: '`async` dans `forEach` n\'est pas attendu',
    theme: 'async',
    question: "Qu'affiche ce code ?",
    code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function processAll() {
  ;[1, 2, 3].forEach(async (n) => {
    await wait(10)
    console.log('traité', n)
  })
  console.log('terminé')
}
processAll()`,
    output: `terminé
traité 1
traité 2
traité 3`,
    explanation: `\`forEach\` appelle le callback et **ignore sa valeur de retour**. Un callback \`async\` renvoie une promesse : \`forEach\` lance donc les trois traitements et rend la main immédiatement, sans rien attendre. \`'terminé'\` s'affiche avant tout, et \`processAll()\` se résout alors que le travail n'a pas commencé. Une erreur dans un callback deviendrait en plus un rejet non géré.

Selon le besoin :

- **séquentiel** : une boucle \`for...of\` avec \`await\` dedans ;
- **parallèle** : \`await Promise.all(items.map(async (n) => ...))\`.

Même chose pour \`map\` sans \`Promise.all\`, \`filter\` ou \`reduce\` avec un callback \`async\` : ils ne savent pas attendre.`,
    fix: {
      code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function processAll() {
  for (const n of [1, 2, 3]) {
    await wait(10)
    console.log('traité', n)
  }
  console.log('terminé')
}
processAll()`,
      output: `traité 1
traité 2
traité 3
terminé`,
    },
  },
  {
    id: 'promise-executor-sync',
    title: "L'exécuteur d'une promesse est synchrone",
    theme: 'async',
    question: "Dans quel ordre s'affichent les lettres ?",
    code: `console.log('A')
const p = new Promise((resolve) => {
  console.log('B')
  resolve('D')
  console.log('C')
})
p.then((v) => console.log(v))
console.log('E')`,
    output: `A
B
C
E
D`,
    explanation: `La fonction passée à \`new Promise(...)\` (l'**exécuteur**) est appelée **immédiatement et de façon synchrone** par le constructeur. \`'B'\` s'affiche donc juste après \`'A'\`. Appeler \`resolve\` ne stoppe pas l'exécuteur : \`'C'\` s'affiche aussi (\`resolve\` n'est pas un \`return\`).

Ce qui est asynchrone, ce sont les callbacks de \`.then\` : même si la promesse est déjà résolue, ils sont placés dans la file des **microtâches** et ne s'exécutent qu'une fois la pile d'appels vide, donc après \`'E'\`.

Conséquence : une promesse ne rend pas un calcul lourd asynchrone ; il bloque le thread dans l'exécuteur comme ailleurs. Et écrire \`return resolve(x)\` quand on veut vraiment sortir de l'exécuteur.`,
  },
  {
    id: 'microtask-vs-macrotask',
    title: 'Microtâches avant macrotâches',
    theme: 'eventloop',
    question: "Dans quel ordre s'affichent les nombres ?",
    code: `console.log(1)
setTimeout(() => console.log(2), 0)
Promise.resolve().then(() => console.log(3))
queueMicrotask(() => console.log(4))
Promise.resolve()
  .then(() => console.log(5))
  .then(() => console.log(6))
console.log(7)`,
    output: `1
7
3
4
5
6
2`,
    explanation: `L'event loop exécute d'abord tout le code synchrone : \`1\`, puis \`7\`. Ensuite, **avant toute nouvelle macrotâche**, il vide entièrement la file des **microtâches** (callbacks de promesses, \`queueMicrotask\`, \`MutationObserver\`), dans l'ordre d'insertion : \`3\`, \`4\`, \`5\`. Le \`.then\` qui affiche \`6\` n'est ajouté à la file qu'à la résolution de la promesse précédente, mais comme la file est vidée jusqu'au bout, il passe lui aussi avant le minuteur.

Le callback de \`setTimeout(..., 0)\` est une **macrotâche** : il n'est exécuté qu'au tour de boucle suivant, donc en dernier. \`0\` signifie « dès que possible », jamais « immédiatement ».

Conséquence pratique : une chaîne infinie de microtâches bloque le rendu et les minuteurs aussi sûrement qu'une boucle \`while (true)\`.`,
  },
  {
    id: 'async-continuation-order',
    title: "Ce qui suit `await` s'exécute plus tard",
    theme: 'eventloop',
    question: "Dans quel ordre s'affichent les messages ?",
    code: `async function load() {
  console.log('load: début')
  await null
  console.log('load: suite')
}
console.log('script: début')
load()
console.log('script: fin')`,
    output: `script: début
load: début
script: fin
load: suite`,
    explanation: `Une fonction \`async\` s'exécute **de façon synchrone jusqu'au premier \`await\`**. \`'load: début'\` s'affiche donc avant \`'script: fin'\`.

À l'\`await\`, la fonction est suspendue et la suite (la « continuation ») est programmée comme une **microtâche**, même si la valeur attendue n'est pas une promesse (\`await null\` équivaut à \`await Promise.resolve(null)\`). \`load()\` renvoie immédiatement une promesse en attente et le script continue. La continuation ne s'exécute qu'une fois la pile vide, d'où \`'load: suite'\` en dernier.

C'est pour cela qu'il faut \`await load()\` si le code suivant dépend de ce que fait \`load\`.`,
  },
  {
    id: 'asi-return-newline',
    title: '`return` seul sur sa ligne (ASI)',
    theme: 'scope',
    question: "Qu'affiche ce code ?",
    code: `function getConfig() {
  return
  {
    debug: true
  }
}
console.log(getConfig())`,
    output: `undefined`,
    explanation: `L'**insertion automatique de points-virgules** (ASI) a des « productions restreintes » : aucun saut de ligne n'est autorisé entre \`return\` et son expression. Le moteur lit donc \`return;\` et la fonction renvoie \`undefined\`.

Le bloc qui suit n'est même pas une erreur de syntaxe : \`{ debug: true }\` est lu comme un **bloc** contenant un **label** \`debug:\` suivi de l'expression \`true\`. Code mort, mais valide, donc aucun message d'alerte.

La même règle s'applique à \`throw\`, \`break\`, \`continue\`, \`yield\` et aux \`++\`/\`--\` postfixés. Solution : ouvrir l'accolade (ou la parenthèse) sur la même ligne que \`return\`. Prettier et ESLint (\`no-unreachable\`) détectent ce cas.`,
    fix: {
      code: `function getConfig() {
  return {
    debug: true,
  }
}
console.log(getConfig())`,
      output: `{ debug: true }`,
    },
  },
  {
    id: 'hoisting-function-vs-var',
    title: 'Hoisting : fonction et `var` de même nom',
    theme: 'scope',
    question: "Qu'affiche ce code ?",
    code: `console.log(typeof foo)
var foo = 1
function foo() {}
console.log(typeof foo)`,
    output: `function
number`,
    explanation: `Avant d'exécuter le script, le moteur crée toutes les liaisons déclarées (**hoisting**) : la déclaration \`var foo\` (initialisée à \`undefined\`) et la déclaration de fonction \`foo\`, qui est **entièrement** initialisée avec son corps. Quand les deux portent le même nom, la fonction l'emporte au départ : une \`var\` sans affectation ne réécrit pas une liaison existante. D'où \`'function'\` à la première ligne.

Les affectations, elles, restent à leur place : quand l'exécution atteint \`foo = 1\`, la variable devient un nombre. La ligne \`function foo() {}\` ne fait plus rien à l'exécution (elle a déjà été traitée).

Avec \`let\` ou \`const\`, redéclarer le même nom dans la même portée est une \`SyntaxError\` : une bonne raison de ne plus utiliser \`var\`.`,
  },
  {
    id: 'tdz-typeof',
    title: '`typeof` et la zone morte temporelle',
    theme: 'scope',
    question: "Qu'affiche ce code ?",
    code: `console.log(typeof notDeclared)
console.log(typeof later)
let later = 1`,
    output: `undefined
Uncaught ReferenceError: Cannot access 'later' before initialization`,
    explanation: `\`typeof\` sur un identifiant **jamais déclaré** est l'un des rares cas où une variable inexistante ne lève pas d'erreur : il renvoie \`'undefined'\`. C'était le moyen classique de tester l'existence d'une globale.

Mais \`later\` est déclarée avec \`let\` dans la même portée. Les déclarations \`let\`/\`const\`/\`class\` sont bien hissées (la liaison existe dès le début de la portée), mais **pas initialisées** : entre le début de la portée et la ligne de déclaration, la variable est dans la **TDZ** (*temporal dead zone*). Tout accès, y compris par \`typeof\`, lève une \`ReferenceError\`.

La TDZ est voulue : elle transforme en erreur claire ce qui, avec \`var\`, aurait donné un \`undefined\` silencieux. Bon réflexe : déclarer les variables en haut de leur bloc, avant tout usage.`,
  },
  {
    id: 'closures-shared-state',
    title: 'Closures qui partagent le même état',
    theme: 'closures',
    question: "Qu'affiche ce code ?",
    code: `let count = 0
function makeCounter() {
  return () => ++count
}
const a = makeCounter()
const b = makeCounter()
a()
a()
console.log(b())`,
    output: `3`,
    explanation: `Une closure capture **la variable elle-même**, pas sa valeur. Ici, \`count\` est déclarée **à l'extérieur** de \`makeCounter\` : il n'en existe qu'une, et les deux compteurs \`a\` et \`b\` la partagent. Après deux appels de \`a\`, \`count\` vaut 2, et \`b()\` la passe à 3.

Pour que chaque compteur ait son état privé, la variable doit être déclarée **dans** la fonction fabrique : chaque appel de \`makeCounter\` crée alors un nouvel environnement lexical, donc une nouvelle variable \`count\`.

Ce piège se retrouve en vrai code avec un cache ou un état au niveau du module, partagé sans le vouloir entre plusieurs instances (ou entre plusieurs requêtes côté serveur).`,
    fix: {
      code: `function makeCounter() {
  let count = 0
  return () => ++count
}
const a = makeCounter()
const b = makeCounter()
a()
a()
console.log(b())`,
      output: `1`,
    },
  },
  {
    id: 'default-params-call-time',
    title: "Paramètres par défaut évalués à chaque appel",
    theme: 'es6',
    question: "Qu'affiche ce code ?",
    code: `function addItem(item, list = []) {
  list.push(item)
  return list
}
console.log(addItem('a'))
console.log(addItem('b'))

let base = 1
function inc(x = base) {
  return x + 1
}
base = 10
console.log(inc())`,
    output: `[ 'a' ]
[ 'b' ]
11`,
    explanation: `En JavaScript, l'expression d'un paramètre par défaut est évaluée **à chaque appel** où l'argument vaut \`undefined\`, et non une fois à la définition de la fonction. Chaque appel à \`addItem\` reçoit donc un **nouveau** tableau : contrairement à Python, il n'y a pas d'accumulation.

Corollaire : l'expression lit les variables **au moment de l'appel**. \`inc()\` utilise \`base\` tel qu'il vaut à l'appel (10), pas à la déclaration.

Deux autres règles à connaître : la valeur par défaut ne s'applique que pour \`undefined\` (pas pour \`null\`), et un paramètre peut utiliser les paramètres précédents (\`function f(a, b = a * 2)\`).`,
  },
  {
    id: 'const-object-mutable',
    title: '`const` ne rend pas un objet immuable',
    theme: 'es6',
    question: "Qu'affiche ce code ?",
    code: `const user = { age: 30 }
user.age = 31
console.log(user)
user = { age: 32 }`,
    output: `{ age: 31 }
Uncaught TypeError: Assignment to constant variable.`,
    explanation: `\`const\` protège **la liaison** (la variable ne peut pas être réaffectée), pas la valeur. \`user\` désignera toujours le même objet, mais cet objet reste librement modifiable : \`user.age = 31\` est légal. Seule la réaffectation \`user = ...\` lève une \`TypeError\` à l'exécution.

Pour empêcher les modifications de l'objet, utiliser \`Object.freeze\`. Attention, le gel est **superficiel** (les objets imbriqués restent modifiables) et, en mode non strict, une écriture sur un objet gelé échoue **silencieusement** ; en mode strict elle lève une \`TypeError\`.

Dans les frameworks, l'immutabilité est une convention : on crée de nouvelles valeurs (\`{ ...user, age: 31 }\`) au lieu de muter, \`const\` ou pas.`,
    fix: {
      code: `const user = Object.freeze({ age: 30 })
user.age = 31
console.log(user)
const older = { ...user, age: 31 }
console.log(older)`,
      output: `{ age: 30 }
{ age: 31 }`,
    },
  },
  {
    id: 'spread-is-shallow',
    title: 'Le spread fait une copie superficielle',
    theme: 'objects',
    question: "Qu'affiche ce code ?",
    code: `const original = { user: { age: 30 }, tags: ['a'] }
const copy = { ...original }
copy.user.age = 99
copy.tags.push('b')
console.log(original)`,
    output: `{ user: { age: 99 }, tags: [ 'a', 'b' ] }`,
    explanation: `\`{ ...obj }\` (comme \`Object.assign({}, obj)\` ou \`[...arr]\`) crée un nouvel objet de premier niveau, mais copie les propriétés **par valeur** : pour une propriété qui contient un objet, la valeur copiée est **la référence**. \`copy.user\` et \`original.user\` désignent donc le même objet, de même pour \`tags\`. Modifier l'un modifie l'autre.

Solutions :

- copie profonde avec \`structuredClone(obj)\` (gère tableaux, \`Date\`, \`Map\`, \`Set\`, références circulaires, mais pas les fonctions) ;
- mise à jour immuable ciblée : recopier chaque niveau modifié, \`{ ...original, user: { ...original.user, age: 99 } }\`.

\`JSON.parse(JSON.stringify(obj))\` fonctionne aussi, mais perd \`undefined\`, les fonctions et les \`Date\`.`,
    fix: {
      code: `const original = { user: { age: 30 }, tags: ['a'] }
const copy = structuredClone(original)
copy.user.age = 99
copy.tags.push('b')
console.log(original)
console.log(copy)`,
      output: `{ user: { age: 30 }, tags: [ 'a' ] }
{ user: { age: 99 }, tags: [ 'a', 'b' ] }`,
    },
  },
  {
    id: 'json-stringify-drops-values',
    title: '`JSON.stringify` perd des valeurs',
    theme: 'objects',
    question: "Qu'affiche ce code ?",
    code: `const data = {
  a: undefined,
  b: () => 1,
  c: NaN,
  d: Infinity,
  e: [undefined, () => 1],
  f: new Date(0),
}
console.log(JSON.stringify(data))`,
    output: `{"c":null,"d":null,"e":[null,null],"f":"1970-01-01T00:00:00.000Z"}`,
    explanation: `JSON ne connaît que les chaînes, les nombres finis, les booléens, \`null\`, les tableaux et les objets simples. \`JSON.stringify\` adapte le reste :

- dans un **objet**, une propriété qui vaut \`undefined\`, une fonction ou un symbole est **omise** ;
- dans un **tableau**, ces mêmes valeurs deviennent \`null\` (pour conserver les positions) ;
- \`NaN\` et \`Infinity\` deviennent \`null\` ;
- une \`Date\` passe par sa méthode \`toJSON\` et devient une chaîne ISO : \`JSON.parse\` ne la retransformera **pas** en \`Date\`.

S'ajoutent : \`Map\` et \`Set\` deviennent \`{}\`, un \`BigInt\` ou une référence circulaire lève une \`TypeError\`. Pour un aller-retour fidèle, utiliser \`structuredClone\`, ou les paramètres \`replacer\`/\`reviver\` de \`stringify\`/\`parse\`.`,
  },
  {
    id: 'date-month-zero-indexed',
    title: 'Les mois de `Date` commencent à 0',
    theme: 'objects',
    question: "Qu'affiche ce code ?",
    code: `const d = new Date(2024, 1, 30)
console.log(d.getMonth(), d.getDate())
console.log(new Date(2024, 12, 1).getFullYear())`,
    output: `2 1
2025`,
    explanation: `Dans le constructeur \`new Date(année, mois, jour)\` et dans \`getMonth\`/\`setMonth\`, les mois vont de **0 (janvier) à 11 (décembre)**, alors que les jours vont de 1 à 31. \`new Date(2024, 1, 30)\` demande donc le « 30 février 2024 ».

Deuxième piège : \`Date\` ne valide rien et **déborde** silencieusement. 2024 étant bissextile, février a 29 jours : le 30 février devient le **1er mars** (\`getMonth()\` vaut 2). De même, le mois 12 devient janvier de l'année suivante.

Rappels utiles : \`getDay()\` renvoie le jour de la semaine (0 = dimanche), pas le jour du mois (\`getDate()\`). Pour du code sérieux, préférer une bibliothèque (date-fns, Luxon) ou l'API \`Temporal\` à mesure qu'elle se diffuse, qui numérote les mois de 1 à 12.`,
  },
  {
    id: 'array-length-zero',
    title: '`arr.length = 0` vide le tableau partout',
    theme: 'arrays',
    question: "Qu'affiche ce code ?",
    code: `let a = [1, 2, 3]
const b = a
a.length = 0
console.log(a, b)

let c = [1, 2, 3]
const d = c
c = []
console.log(c, d)`,
    output: `[] []
[] [ 1, 2, 3 ]`,
    explanation: `\`length\` d'un tableau est une propriété **modifiable** : lui affecter une valeur plus petite **supprime** les éléments au-delà. \`a.length = 0\` vide donc le tableau **lui-même**, et toutes les variables qui le référencent (\`b\`) voient le changement.

\`c = []\` fait tout autre chose : la variable \`c\` pointe vers un **nouveau** tableau vide, tandis que l'ancien, toujours référencé par \`d\`, est intact.

À l'inverse, augmenter \`length\` crée des **trous** (\`<n empty items>\`). En contexte React/Vue, \`length = 0\` est une mutation : préférer réaffecter un nouveau tableau.`,
  },
  {
    id: 'delete-array-hole',
    title: '`delete arr[i]` laisse un trou',
    theme: 'arrays',
    question: "Qu'affiche ce code ?",
    code: `const arr = ['a', 'b', 'c']
delete arr[1]
console.log(arr)
console.log(arr.length, arr[1], 1 in arr)`,
    output: `[ 'a', <1 empty item>, 'c' ]
3 undefined false`,
    explanation: `\`delete\` supprime une **propriété** d'un objet. Un tableau étant un objet dont les clés sont les indices, \`delete arr[1]\` retire la clé \`'1'\`, sans décaler les éléments suivants ni changer \`length\`. On obtient un **tableau creux** (*sparse*) : lire \`arr[1]\` donne \`undefined\`, mais \`1 in arr\` est \`false\`.

Les trous sont traités de façon incohérente : \`forEach\`, \`map\`, \`filter\` les sautent, alors que \`for...of\`, le spread et \`Array.from\` les lisent comme \`undefined\`.

Pour retirer un élément : \`splice(i, 1)\` (mutation) ou \`filter\`/\`toSpliced\` (nouveau tableau).`,
    fix: {
      code: `const arr = ['a', 'b', 'c']
console.log(arr.toSpliced(1, 1))
console.log(arr.filter((_, i) => i !== 1))
arr.splice(1, 1)
console.log(arr)`,
      output: `[ 'a', 'c' ]
[ 'a', 'c' ]
[ 'a', 'c' ]`,
    },
  },
  {
    id: 'object-equality-reference',
    title: 'Comparer des objets compare des références',
    theme: 'objects',
    question: "Qu'affiche ce code ?",
    code: `console.log({ a: 1 } === { a: 1 })
console.log([1, 2] == [1, 2])
const x = { a: 1 }
const y = x
y.a = 2
console.log(x === y, x.a)
console.log([1, 2] == '1,2')`,
    output: `false
false
true 2
true`,
    explanation: `Pour les objets (y compris tableaux et fonctions), \`==\` et \`===\` comparent **l'identité**, c'est-à-dire la référence : deux littéraux identiques créent deux objets distincts, donc \`false\`. À l'inverse, \`const y = x\` ne copie pas l'objet, il copie la référence : \`x\` et \`y\` sont le même objet, modifier l'un modifie « l'autre ».

Le dernier cas est le piège de \`==\` : quand on compare un objet à une primitive, l'objet est converti en primitive (\`[1, 2]\` → \`'1,2'\`), et l'égalité devient vraie.

Pour comparer des contenus, il faut une comparaison **profonde** (fonction maison, \`util.isDeepStrictEqual\` sous Node, \`isEqual\` de Lodash). C'est aussi pour cela que React détecte un changement par identité : une mutation ne change pas la référence.`,
  },
  {
    id: 'parsefloat-vs-number',
    title: '`parseFloat` contre `Number`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(parseFloat('3.14abc'))
console.log(Number('3.14abc'))
console.log(parseInt('12px'), parseInt('px12'))
console.log(parseFloat('.5'), parseInt('1e3'), Number('1e3'))`,
    output: `3.14
NaN
12 NaN
0.5 1 1000`,
    explanation: `\`parseFloat\` et \`parseInt\` **lisent le début** de la chaîne (après les espaces) et s'arrêtent au premier caractère invalide, en ignorant la suite : \`'3.14abc'\` donne \`3.14\`, \`'12px'\` donne \`12\`. Si la chaîne ne commence pas par un nombre, ils renvoient \`NaN\`. \`parseInt\` ne connaît pas la notation scientifique : il s'arrête au \`e\` de \`'1e3'\`.

\`Number(str)\` (comme le \`+\` unaire) est **strict** : la chaîne entière, espaces de bord exceptés, doit être un nombre valide, sinon \`NaN\`. Il accepte en revanche \`'1e3'\`, \`'0x1F'\`, \`'Infinity'\`.

Choisir selon l'intention : \`parseInt(str, 10)\` ou \`parseFloat\` pour extraire un nombre d'un texte (\`'12px'\`), \`Number\` pour valider une saisie, puis tester \`Number.isNaN\`.`,
  },
  {
    id: 'number-empty-string',
    title: "`Number('')` vaut 0",
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(Number(''), Number('   '), Number('\\n'))
console.log(Number(null), Number(undefined))
console.log(Number([]), Number([7]), Number([1, 2]))
console.log(Number(false), Number(true))`,
    output: `0 0 0
0 NaN
0 7 NaN
0 1`,
    explanation: `\`ToNumber\` sur une chaîne retire les espaces de bord ; une chaîne **vide** (ou ne contenant que des blancs) donne \`0\`, et non \`NaN\`. Résultat : un champ de formulaire vide, converti avec \`Number(input.value)\`, passe pour un zéro valide.

Autres conversions à connaître : \`null\` → \`0\` mais \`undefined\` → \`NaN\` ; un tableau est d'abord converti en chaîne (\`[]\` → \`''\` → \`0\`, \`[7]\` → \`'7'\` → \`7\`, \`[1, 2]\` → \`'1,2'\` → \`NaN\`) ; \`false\` → \`0\`, \`true\` → \`1\`.

Pour valider une saisie numérique, tester d'abord que la chaîne n'est pas vide (\`str.trim() !== ''\`), puis convertir et vérifier avec \`Number.isFinite\`.`,
  },
  {
    id: 'math-max-empty',
    title: '`Math.max()` est plus petit que `Math.min()`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log(Math.max())
console.log(Math.min())
console.log(Math.max() < Math.min())
console.log(Math.max(...[]), Math.max(1, 'a'), Math.max(1, null))`,
    output: `-Infinity
Infinity
true
-Infinity NaN 1`,
    explanation: `\`Math.max\` part d'une valeur initiale et la remplace par tout argument plus grand. Sa valeur de départ doit être plus petite que n'importe quel nombre : c'est \`-Infinity\`, l'**élément neutre** du maximum. Sans argument, elle est renvoyée telle quelle. Symétriquement, \`Math.min()\` vaut \`Infinity\`. C'est le même raisonnement que pour une somme vide qui vaut 0.

Conséquences : \`Math.max(...arr)\` sur un tableau vide renvoie \`-Infinity\` sans erreur. Les arguments sont convertis en nombres : un seul \`NaN\` (\`'a'\`) donne \`NaN\`, et \`null\` compte pour \`0\`.

En vrai code, traiter le tableau vide à part, et pour de très grands tableaux préférer une boucle ou \`reduce\` (le spread peut dépasser la limite d'arguments et lever une \`RangeError\`).`,
  },
  {
    id: 'postfix-vs-prefix-increment',
    title: '`x++` contre `++x`',
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `let x = 1
const a = x++
const b = ++x
console.log(a, b, x)

let n = 0
n = n++
console.log(n)`,
    output: `1 3 3
0`,
    explanation: `Les deux formes incrémentent la variable ; seule la **valeur de l'expression** diffère :

- \`x++\` (postfixé) renvoie l'ancienne valeur, puis incrémente : \`a\` reçoit 1 et \`x\` passe à 2 ;
- \`++x\` (préfixé) incrémente d'abord, puis renvoie la nouvelle valeur : \`x\` passe à 3 et \`b\` reçoit 3.

Le second exemple est un classique : \`n = n++\` lit l'ancienne valeur (0), incrémente \`n\` à 1, puis l'affectation réécrit \`n\` avec la valeur lue, 0. L'incrément est perdu.

En pratique, utiliser \`++\`/\`--\` seuls sur leur ligne (ou \`x += 1\`), jamais au milieu d'une expression plus large : c'est plus lisible et sans surprise.`,
  },
  {
    id: 'string-comparison',
    title: "`'10' < '9'` vaut `true`",
    theme: 'types',
    question: "Qu'affiche ce code ?",
    code: `console.log('10' < '9')
console.log(10 < 9)
console.log('10' < 9)
console.log('a' < 'B', 'Z' < 'a')`,
    output: `true
false
false
false true`,
    explanation: `Quand **les deux** opérandes de \`<\` sont des chaînes, la comparaison est **lexicographique**, caractère par caractère, selon les codes UTF-16 : \`'1'\` (49) est inférieur à \`'9'\` (57), donc \`'10' < '9'\` est vrai, sans même regarder la suite.

Si **un seul** côté est une chaîne, les deux sont convertis en nombres : \`'10' < 9\` devient \`10 < 9\`, faux.

L'ordre des codes réserve d'autres surprises : toutes les majuscules (65 à 90) passent avant les minuscules (97 à 122), et les lettres accentuées viennent après \`z\`. Pour comparer des nombres, les convertir explicitement ; pour trier du texte humain, \`a.localeCompare(b, 'fr')\` ou \`Intl.Collator\` (avec l'option \`numeric: true\` pour que \`'item 10'\` vienne après \`'item 9'\`).`,
    fix: {
      code: `console.log(Number('10') < Number('9'))
console.log('item 10'.localeCompare('item 9', 'fr', { numeric: true }) > 0)`,
      output: `false
true`,
    },
  },
  {
    id: 'array-constructor-vs-of',
    title: '`Array(3)` contre `Array.of(3)`',
    theme: 'arrays',
    question: "Qu'affiche ce code ?",
    code: `console.log(Array(3))
console.log(Array(3, 4))
console.log(Array.of(3))
console.log(Array(3).map((_, i) => i))`,
    output: `[ <3 empty items> ]
[ 3, 4 ]
[ 3 ]
[ <3 empty items> ]`,
    explanation: `Le constructeur \`Array\` change de sens selon ses arguments : avec **un seul argument numérique**, il crée un tableau de cette **longueur**, rempli de **trous** (aucun élément réel) ; avec plusieurs arguments (ou un seul non numérique), il crée un tableau contenant ces éléments. \`Array.of\` a été ajouté en ES6 pour lever l'ambiguïté : il crée toujours un tableau de ses arguments.

Comme \`map\` saute les trous, \`Array(3).map(...)\` ne fait rien et renvoie un tableau tout aussi creux.

Pour générer un tableau de taille donnée : \`Array.from({ length: 3 }, (_, i) => i)\` ou \`Array(3).fill(0)\` (\`fill\` remplit aussi les trous). Et privilégier les littéraux \`[]\` au constructeur.`,
    fix: {
      code: `console.log(Array.from({ length: 3 }, (_, i) => i))
console.log(Array(3).fill(0))`,
      output: `[ 0, 1, 2 ]
[ 0, 0, 0 ]`,
    },
  },
  {
    id: 'finally-overrides-return',
    title: '`finally` peut écraser le `return`',
    theme: 'scope',
    question: "Qu'affiche ce code ?",
    code: `function f() {
  try {
    return 'try'
  } finally {
    console.log('nettoyage')
  }
}
function g() {
  try {
    throw new Error('oups')
  } finally {
    return 'finally'
  }
}
console.log(f())
console.log(g())`,
    output: `nettoyage
try
finally`,
    explanation: `Le bloc \`finally\` s'exécute **toujours**, même quand le \`try\` fait \`return\` ou lève une exception. Dans \`f\`, la valeur \`'try'\` est mise de côté, \`finally\` affiche \`'nettoyage'\`, puis la fonction renvoie la valeur mise de côté.

Mais si \`finally\` contient lui-même un \`return\` (ou un \`throw\`), cette « complétion » **remplace** celle du \`try\`. Dans \`g\`, l'exception est purement et simplement **avalée** : la fonction renvoie \`'finally'\` et l'erreur disparaît sans laisser de trace.

Règle : réserver \`finally\` au nettoyage (fermer une ressource, masquer un loader) et ne jamais y mettre de \`return\`, \`throw\` ou \`break\`. ESLint le signale avec \`no-unsafe-finally\`.`,
  },
]

export const pieges: Piege[] = [...jsPieges, ...tsPieges]
