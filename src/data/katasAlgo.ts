import type { Kata } from './types'

/**
 * Katas algorithmiques (catégorie « algo »), fusionnés dans `katas` (katas.ts).
 * Mêmes règles que katas.ts : pas d'accent grave, de `${` ni de barre oblique inverse dans les champs de code.
 */
export const algoKatas: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`twoSum(nums, target)\` qui renvoie les **indices** \`[i, j]\` de deux éléments **distincts** de \`nums\` dont la somme vaut \`target\`.

- les indices sont renvoyés dans l'ordre croissant (\`i < j\`) ;
- un même élément ne peut pas être utilisé deux fois (mais deux éléments de même valeur, oui) ;
- s'il existe plusieurs solutions, renvoyez celle dont le **second indice \`j\` est le plus petit** (c'est ce que donne naturellement un parcours de gauche à droite) ;
- s'il n'y a aucune solution, renvoyez \`null\` ;
- visez une solution en **O(n)**.

Exemples :

- \`twoSum([2, 7, 11, 15], 9)\` donne \`[0, 1]\` ;
- \`twoSum([3, 3], 6)\` donne \`[0, 1]\` ;
- \`twoSum([1, 2], 7)\` donne \`null\`.`,
    starter: `function twoSum(nums, target) {
  // TODO : renvoyer [i, j] ou null
  return null
}`,
    solution: `function twoSum(nums, target) {
  // valeur déjà vue → son indice
  const seen = new Map()
  for (let j = 0; j < nums.length; j++) {
    const complement = target - nums[j]
    // on cherche le complément AVANT d'enregistrer nums[j] : un élément ne s'apparie pas avec lui-même
    if (seen.has(complement)) return [seen.get(complement), j]
    // on ne garde que le premier indice d'une valeur répétée
    if (!seen.has(nums[j])) seen.set(nums[j], j)
  }
  return null
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(twoSum([2, 7, 11, 15], 9), [0, 1])` },
      { name: 'paire non adjacente', code: `assertEqual(twoSum([3, 2, 4], 6), [1, 2])` },
      { name: 'doublons', code: `assertEqual(twoSum([3, 3], 6), [0, 1])` },
      { name: 'un élément ne compte pas deux fois', code: `assertEqual(twoSum([3, 1], 6), null)` },
      { name: 'nombres négatifs et zéro', code: `assertEqual(twoSum([-4, 0, 5, 4], 0), [0, 3])
assertEqual(twoSum([-1, -2, -3], -5), [1, 2])` },
      { name: 'aucune solution, tableau vide, un seul élément', code: `assertEqual(twoSum([1, 2], 7), null)
assertEqual(twoSum([], 0), null)
assertEqual(twoSum([5], 5), null)` },
      { name: 'plusieurs solutions : plus petit second indice', code: `assertEqual(twoSum([1, 4, 2, 3], 5), [0, 1])` },
    ],
    hints: [
      'La version naïve teste toutes les paires avec deux boucles : O(n²). Comment savoir en O(1) si le complément `target - x` a déjà été vu ?',
      'Une `Map` valeur → indice, remplie au fil du parcours, répond en temps constant en moyenne.',
      'Cherchez le complément **avant** d’ajouter l’élément courant à la `Map`, sinon `[3]` avec `target = 6` s’apparierait avec lui-même.',
    ],
    discussion: `**Complexité** : O(n) en temps (un seul parcours, \`Map.has\`/\`get\` en O(1) en moyenne), O(n) en mémoire pour la \`Map\`.

**Points à évoquer** :

- la version force brute (deux boucles imbriquées) est en O(n²) en temps mais O(1) en mémoire : c'est le compromis temps/mémoire typique ;
- si le tableau est **trié**, la technique des **deux pointeurs** (un à chaque extrémité) donne O(n) en temps et O(1) en mémoire ;
- trier d'abord coûte O(n log n) et fait perdre les indices d'origine (il faudrait trier des paires \`[valeur, indice]\`) ;
- un objet littéral ferait l'affaire, mais ses clés sont des chaînes : la \`Map\` est plus juste pour des nombres ;
- variantes : 3Sum (trier puis deux pointeurs, O(n²)), compter toutes les paires, Two Sum sur un flux.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'valid-parentheses',
    title: 'Parenthèses équilibrées',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`isValid(s)\` qui indique si la chaîne \`s\` est **bien parenthésée** pour les trois paires \`()\`, \`[]\` et \`{}\` :

- chaque ouvrant est fermé par un fermant **du même type** ;
- les paires sont correctement **imbriquées** (\`([)]\` est invalide) ;
- les autres caractères sont ignorés ;
- une chaîne vide est valide.

Exemples :

- \`isValid('({[]})')\` donne \`true\` ;
- \`isValid('(]')\` donne \`false\` ;
- \`isValid('f(a[0]) { return }')\` donne \`true\`.`,
    starter: `function isValid(s) {
  // TODO : utiliser une pile
  let count = 0
  for (const c of s) {
    if (c === '(') count++
    if (c === ')') count--
  }
  return count === 0
}`,
    solution: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') {
      stack.push(c)
    } else if (c in pairs) {
      // un fermant doit correspondre au dernier ouvrant encore ouvert
      if (stack.pop() !== pairs[c]) return false
    }
  }
  // tout ouvrant doit avoir été refermé
  return stack.length === 0
}`,
    tests: [
      { name: 'paires simples et imbriquées', code: `assert(isValid('()'))
assert(isValid('()[]{}'))
assert(isValid('({[]})'))` },
      { name: 'type de fermant incorrect', code: `assert(!isValid('(]'))
assert(!isValid('{)'))` },
      { name: 'mauvaise imbrication', code: `assert(!isValid('([)]'))` },
      { name: 'ouvrant jamais fermé', code: `assert(!isValid('(('))
assert(!isValid('{[]'))` },
      { name: 'fermant sans ouvrant', code: `assert(!isValid(')('))
assert(!isValid(']'))` },
      { name: 'chaîne vide', code: `assert(isValid(''))` },
      { name: 'ignore les autres caractères', code: `assert(isValid('f(a[0]) { return }'))
assert(isValid('abc'))
assert(!isValid('a(b]c'))` },
    ],
    hints: [
      'Un simple compteur ne suffit pas : il ne voit ni le type de parenthèse, ni l’ordre d’imbrication.',
      'Empilez chaque ouvrant ; à chaque fermant, le sommet de la pile doit être l’ouvrant correspondant.',
      'À la fin, la pile doit être vide. Et `pop()` sur une pile vide renvoie `undefined`, ce qui gère naturellement le fermant orphelin.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(n) en mémoire dans le pire cas (que des ouvrants).

**Points à évoquer** :

- c'est **le** problème qui reconnaît la **pile** (LIFO) : le dernier ouvert est le premier à fermer ;
- \`push\` et \`pop\` sont en O(1) (amorti pour \`push\`) ; ne pas utiliser \`shift\`/\`unshift\`, en O(n) ;
- l'objet \`pairs\` fermant → ouvrant évite une cascade de \`if\` ;
- sortie anticipée : une chaîne de longueur impaire (si elle ne contient que des parenthèses) est forcément invalide ;
- variantes : longueur de la plus longue sous-chaîne valide, nombre minimal d'ajouts pour équilibrer, validation de balises HTML.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'is-palindrome',
    title: 'Palindrome',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`isPalindrome(s)\` qui indique si \`s\` se lit de la même façon dans les deux sens, **en ignorant la casse et tous les caractères non alphanumériques**.

On se limite à l'ASCII : on met la chaîne en minuscules, puis on ne garde que les caractères \`a\` à \`z\` et \`0\` à \`9\`. Une chaîne qui ne contient aucun caractère alphanumérique (y compris la chaîne vide) est un palindrome.

Exemples :

- \`isPalindrome('A man, a plan, a canal: Panama')\` donne \`true\` ;
- \`isPalindrome('race a car')\` donne \`false\` ;
- \`isPalindrome('')\` donne \`true\`.

Bonus : une version à **deux pointeurs** en O(1) de mémoire supplémentaire.`,
    starter: `function isPalindrome(s) {
  // TODO : ignorer la casse et les caractères non alphanumériques
  return s === s.split('').reverse().join('')
}`,
    solution: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '')
  // deux pointeurs qui se rapprochent depuis les extrémités
  let left = 0
  let right = clean.length - 1
  while (left < right) {
    if (clean[left] !== clean[right]) return false
    left++
    right--
  }
  return true
}`,
    tests: [
      { name: 'phrase avec ponctuation et majuscules', code: `assert(isPalindrome('A man, a plan, a canal: Panama'))` },
      { name: 'pas un palindrome', code: `assert(!isPalindrome('race a car'))
assert(!isPalindrome('ab'))` },
      { name: 'chaîne vide et un seul caractère', code: `assert(isPalindrome(''))
assert(isPalindrome('x'))` },
      { name: 'uniquement des caractères ignorés', code: `assert(isPalindrome(' .,!? '))` },
      { name: 'chiffres pris en compte', code: `assert(isPalindrome('12321'))
assert(!isPalindrome('0P'))` },
      { name: 'casse ignorée', code: `assert(isPalindrome('Kayak'))
assert(isPalindrome('Was it a car or a cat I saw?'))` },
    ],
    hints: [
      'Normalisez d’abord : `toLowerCase()`, puis `replace(/[^a-z0-9]/g, \'\')`.',
      'Comparer avec la chaîne inversée fonctionne mais alloue des copies. Deux indices `left` et `right` qui se rapprochent suffisent.',
    ],
    discussion: `**Complexité** : O(n) en temps. La version ci-dessus alloue une chaîne nettoyée, donc O(n) en mémoire ; une version à deux pointeurs qui **saute** les caractères non alphanumériques directement dans \`s\` (en testant chaque caractère) tombe à O(1) en mémoire supplémentaire.

**Points à évoquer** :

- \`split('').reverse().join('')\` est lisible mais crée trois structures intermédiaires ;
- le motif des **deux pointeurs** (extrémités qui convergent) revient dans beaucoup de problèmes sur tableaux triés ou chaînes ;
- \`split('')\` découpe en unités UTF-16 : un emoji serait coupé en deux, \`[...s]\` découpe par point de code ;
- hors ASCII, on normaliserait les accents avec \`normalize('NFD')\` et on utiliserait une classe Unicode (\`[^\\p{L}\\p{N}]\` avec le drapeau \`u\`) ;
- variantes : palindrome en supprimant au plus un caractère, plus longue sous-chaîne palindrome (expansion autour du centre, O(n²)).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'group-anagrams',
    title: 'Regrouper les anagrammes',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`groupAnagrams(words)\` qui regroupe les mots qui sont **anagrammes** les uns des autres (mêmes lettres, mêmes nombres d'occurrences, ordre quelconque).

Ordre attendu, pour que le résultat soit déterministe :

- les groupes apparaissent dans l'ordre de **première apparition** de leur premier mot ;
- dans un groupe, les mots gardent l'**ordre d'entrée** (doublons compris).

La comparaison est sensible à la casse et on suppose des mots en minuscules. Un tableau vide donne \`[]\`.

Exemple : \`groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])\` donne \`[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]\`.`,
    starter: `function groupAnagrams(words) {
  // TODO : regrouper par signature
  return words.map((w) => [w])
}`,
    solution: `function groupAnagrams(words) {
  // signature (lettres triées) → mots du groupe ; la Map garde l'ordre d'insertion
  const groups = new Map()
  for (const word of words) {
    const key = word.split('').sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(word)
  }
  return [...groups.values()]
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']), [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']])` },
      { name: 'tableau vide', code: `assertEqual(groupAnagrams([]), [])` },
      { name: 'un seul mot', code: `assertEqual(groupAnagrams(['a']), [['a']])` },
      { name: 'chaîne vide', code: `assertEqual(groupAnagrams(['', 'b', '']), [['', ''], ['b']])` },
      { name: 'doublons conservés', code: `assertEqual(groupAnagrams(['ab', 'ba', 'ab']), [['ab', 'ba', 'ab']])` },
      { name: 'mêmes lettres, nombres différents', code: `assertEqual(groupAnagrams(['aab', 'abb', 'bab']), [['aab'], ['abb', 'bab']])` },
    ],
    hints: [
      'Deux anagrammes ont la même **signature** : leurs lettres triées (`\'eat\'` et `\'tea\'` donnent toutes deux `\'aet\'`).',
      'Une `Map` signature → tableau de mots regroupe en un seul parcours, et conserve l’ordre d’insertion des clés.',
    ],
    discussion: `**Complexité** : pour n mots de longueur au plus k, O(n · k log k) en temps (tri de chaque mot), O(n · k) en mémoire.

**Points à évoquer** :

- signature alternative en O(k) : un **comptage des 26 lettres** (\`'1#0#0#…'\`), qui donne O(n · k) au total ;
- comparer chaque paire de mots serait en O(n² · k) ;
- une \`Map\` plutôt qu'un objet : ordre d'insertion garanti et pas de collision avec des clés héritées comme \`constructor\` ;
- \`sort()\` sans comparateur trie par unités UTF-16, ce qui convient pour une signature ;
- variantes : savoir si deux mots sont anagrammes (comptage de fréquences, O(k)), trouver tous les anagrammes d'un motif dans un texte (fenêtre glissante).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'first-unique-char',
    title: 'Premier caractère unique',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`firstUniqChar(s)\` qui renvoie l'**indice** du premier caractère de \`s\` qui n'apparaît **qu'une seule fois**, ou \`-1\` s'il n'y en a pas.

- la comparaison est sensible à la casse (\`'a'\` et \`'A'\` sont différents) ;
- une chaîne vide donne \`-1\`.

Exemples :

- \`firstUniqChar('leetcode')\` donne \`0\` ;
- \`firstUniqChar('loveleetcode')\` donne \`2\` ;
- \`firstUniqChar('aabb')\` donne \`-1\`.`,
    starter: `function firstUniqChar(s) {
  // TODO : compter les occurrences
  return s.length ? 0 : -1
}`,
    solution: `function firstUniqChar(s) {
  // 1er passage : fréquence de chaque caractère
  const counts = new Map()
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1)
  // 2e passage : le premier dont la fréquence vaut 1
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) === 1) return i
  }
  return -1
}`,
    tests: [
      { name: 'premier caractère unique', code: `assertEqual(firstUniqChar('leetcode'), 0)` },
      { name: 'unique au milieu', code: `assertEqual(firstUniqChar('loveleetcode'), 2)` },
      { name: 'aucun unique', code: `assertEqual(firstUniqChar('aabb'), -1)` },
      { name: 'chaîne vide', code: `assertEqual(firstUniqChar(''), -1)` },
      { name: 'un seul caractère', code: `assertEqual(firstUniqChar('z'), 0)` },
      { name: 'unique en dernière position', code: `assertEqual(firstUniqChar('aabbc'), 4)` },
      { name: 'sensible à la casse', code: `assertEqual(firstUniqChar('aA'), 0)
assertEqual(firstUniqChar('aAa'), 1)` },
    ],
    hints: [
      'Deux passages : un pour compter les occurrences de chaque caractère, un pour trouver le premier dont le compte vaut 1.',
      '`s.indexOf(c) === s.lastIndexOf(c)` dans une boucle fonctionne, mais c’est O(n²).',
    ],
    discussion: `**Complexité** : O(n) en temps (deux parcours), O(k) en mémoire où k est le nombre de caractères distincts (borné par la taille de l'alphabet, donc O(1) pour un alphabet fixe).

**Points à évoquer** :

- c'est le motif du **comptage de fréquences** (« hash map ») : dès que l'énoncé parle d'occurrences, de doublons ou d'anagrammes ;
- \`indexOf\`/\`lastIndexOf\` dans une boucle parcourent la chaîne à chaque tour : O(n²) ;
- \`counts.get(c) ?? 0\` plutôt que \`|| 0\` est un bon réflexe (même si ici les deux marchent) ;
- variante sur un **flux** de caractères : une \`Map\` qui conserve l'ordre d'insertion et dont on retire les doublons, pour répondre à tout moment.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`fizzBuzz(n)\` qui renvoie un **tableau de chaînes** pour les entiers de \`1\` à \`n\` inclus :

- \`'FizzBuzz'\` si le nombre est divisible par 3 **et** par 5 ;
- \`'Fizz'\` s'il est divisible par 3 seulement ;
- \`'Buzz'\` s'il est divisible par 5 seulement ;
- sinon le nombre lui-même, **sous forme de chaîne**.

Pour \`n = 0\`, renvoyez \`[]\`.

Exemple : \`fizzBuzz(5)\` donne \`['1', '2', 'Fizz', '4', 'Buzz']\`.`,
    starter: `function fizzBuzz(n) {
  const out = []
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0) out.push('Fizz')
    else if (i % 5 === 0) out.push('Buzz')
    else if (i % 15 === 0) out.push('FizzBuzz')
    else out.push(String(i))
  }
  return out
}`,
    solution: `function fizzBuzz(n) {
  const out = []
  for (let i = 1; i <= n; i++) {
    let word = ''
    if (i % 3 === 0) word += 'Fizz'
    if (i % 5 === 0) word += 'Buzz'
    // chaîne vide (falsy) : ni l'un ni l'autre
    out.push(word || String(i))
  }
  return out
}`,
    tests: [
      { name: 'de 1 à 5', code: `assertEqual(fizzBuzz(5), ['1', '2', 'Fizz', '4', 'Buzz'])` },
      { name: '15 donne FizzBuzz', code: `assertEqual(fizzBuzz(15)[14], 'FizzBuzz')
assertEqual(fizzBuzz(15).length, 15)` },
      { name: 'n = 0', code: `assertEqual(fizzBuzz(0), [])` },
      { name: 'n = 1', code: `assertEqual(fizzBuzz(1), ['1'])` },
      { name: 'des chaînes, pas des nombres', code: `assert(fizzBuzz(2).every((x) => typeof x === 'string'), 'chaque élément doit être une chaîne')` },
      { name: 'séquence complète jusqu’à 15', code: `assertEqual(fizzBuzz(15), ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'])` },
    ],
    hints: [
      'L’ordre des tests compte : si vous testez « divisible par 3 » en premier, 15 donnera `Fizz`.',
      'Astuce élégante : construire le mot par concaténation (`Fizz` puis `Buzz`) et retomber sur le nombre si le mot est vide.',
    ],
    discussion: `**Complexité** : O(n) en temps et en mémoire (le tableau résultat).

**Points à évoquer** :

- le bug classique est l'**ordre des conditions** : tester le cas le plus spécifique (15) en premier, ou concaténer ;
- la version par concaténation s'étend sans réécriture (ajouter \`'Bazz'\` pour 7) : on peut même piloter les règles par un tableau \`[[3, 'Fizz'], [5, 'Buzz']]\` ;
- \`String(i)\` : le recruteur vérifie souvent qu'on respecte le type demandé ;
- ce kata teste surtout la clarté et la capacité à dérouler les cas limites (\`n = 0\`), pas l'algorithmique.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'binary-search',
    title: 'Recherche dichotomique',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`binarySearch(arr, target)\` qui cherche \`target\` dans le tableau \`arr\` **trié par ordre croissant** et renvoie l'indice de sa **première occurrence**, ou \`-1\` s'il est absent.

- complexité attendue : **O(log n)** (pas de \`indexOf\` ni de parcours linéaire) ;
- le tableau peut contenir des doublons : renvoyez le plus petit indice où se trouve \`target\` ;
- un tableau vide donne \`-1\`.

Exemples :

- \`binarySearch([1, 3, 5, 7, 9], 7)\` donne \`3\` ;
- \`binarySearch([1, 2, 2, 2, 3], 2)\` donne \`1\` ;
- \`binarySearch([1, 3, 5], 4)\` donne \`-1\`.`,
    starter: `function binarySearch(arr, target) {
  // TODO : diviser l'intervalle par deux à chaque étape
  return -1
}`,
    solution: `function binarySearch(arr, target) {
  // recherche de la borne inférieure : premier indice dont la valeur est >= target
  let lo = 0
  let hi = arr.length // intervalle semi-ouvert [lo, hi)
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (arr[mid] < target) lo = mid + 1
    else hi = mid // arr[mid] >= target : la réponse est en mid ou à gauche
  }
  return lo < arr.length && arr[lo] === target ? lo : -1
}`,
    tests: [
      { name: 'élément présent', code: `assertEqual(binarySearch([1, 3, 5, 7, 9], 7), 3)
assertEqual(binarySearch([1, 3, 5, 7, 9], 1), 0)
assertEqual(binarySearch([1, 3, 5, 7, 9], 9), 4)` },
      { name: 'élément absent', code: `assertEqual(binarySearch([1, 3, 5], 4), -1)
assertEqual(binarySearch([1, 3, 5], 0), -1)
assertEqual(binarySearch([1, 3, 5], 6), -1)` },
      { name: 'tableau vide', code: `assertEqual(binarySearch([], 1), -1)` },
      { name: 'un seul élément', code: `assertEqual(binarySearch([4], 4), 0)
assertEqual(binarySearch([4], 5), -1)` },
      { name: 'doublons : première occurrence', code: `assertEqual(binarySearch([1, 2, 2, 2, 3], 2), 1)
assertEqual(binarySearch([7, 7, 7, 7], 7), 0)` },
      { name: 'nombres négatifs', code: `assertEqual(binarySearch([-10, -3, 0, 4], -3), 1)` },
      { name: 'grand tableau', code: `const big = Array.from({ length: 100000 }, (_, i) => i * 2)
assertEqual(binarySearch(big, 123456), 61728)
assertEqual(binarySearch(big, 123457), -1)` },
      {
        name: 'n’utilise pas de recherche linéaire',
        code: `const methods = ['indexOf', 'includes', 'findIndex', 'lastIndexOf']
const saved = methods.map((m) => Array.prototype[m])
let result
let error = null
try {
  for (const m of methods) Array.prototype[m] = function () { throw new Error(m + ' interdit') }
  result = binarySearch([1, 2, 3, 4, 5], 4)
} catch (e) {
  error = e
} finally {
  methods.forEach((m, i) => { Array.prototype[m] = saved[i] })
}
assert(error === null, error && error.message)
assertEqual(result, 3)`,
      },
    ],
    hints: [
      'Gardez un intervalle `[lo, hi)` qui contient forcément la réponse ; regardez le milieu et éliminez la moitié qui ne peut pas la contenir.',
      'Pour la **première** occurrence, ne vous arrêtez pas quand `arr[mid] === target` : continuez à gauche (`hi = mid`).',
      'À la fin, `lo` est le premier indice dont la valeur est `>= target` : vérifiez qu’il est dans les bornes et que la valeur est bien `target`.',
    ],
    discussion: `**Complexité** : O(log n) en temps (l'intervalle est divisé par deux à chaque tour), O(1) en mémoire (version itérative ; une version récursive coûte O(log n) de pile).

**Points à évoquer** :

- les bugs classiques : boucle infinie (\`lo = mid\` au lieu de \`mid + 1\`), erreur de borne (\`<=\` contre \`<\` selon l'intervalle fermé ou semi-ouvert), oubli du tableau vide ;
- \`lo + Math.floor((hi - lo) / 2)\` évite le dépassement d'entier dans d'autres langages (en JS les nombres sont des flottants, mais c'est le réflexe attendu) ;
- la recherche de **borne inférieure** (*lower bound*) est plus utile que « un indice quelconque » : elle donne aussi la position d'insertion ;
- prérequis : le tableau **doit être trié** ; trier d'abord coûte O(n log n), rentable seulement pour de nombreuses recherches ;
- le motif se généralise : **recherche sur la réponse** (plus petite capacité qui suffit, racine carrée entière), tableau trié décalé, pic d'un tableau.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'longest-unique-substring',
    title: 'Plus longue sous-chaîne sans répétition',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`lengthOfLongestSubstring(s)\` qui renvoie la **longueur** de la plus longue sous-chaîne **contiguë** de \`s\` dont tous les caractères sont **distincts**.

- une chaîne vide donne \`0\` ;
- les espaces et la ponctuation sont des caractères comme les autres ;
- visez **O(n)**.

Exemples :

- \`lengthOfLongestSubstring('abcabcbb')\` donne \`3\` (\`'abc'\`) ;
- \`lengthOfLongestSubstring('bbbbb')\` donne \`1\` ;
- \`lengthOfLongestSubstring('pwwkew')\` donne \`3\` (\`'wke'\` ; \`'pwke'\` n'est pas contiguë).`,
    starter: `function lengthOfLongestSubstring(s) {
  // TODO : fenêtre glissante
  return new Set(s).size
}`,
    solution: `function lengthOfLongestSubstring(s) {
  // dernière position vue de chaque caractère
  const lastSeen = new Map()
  let start = 0 // début de la fenêtre courante (sans doublon)
  let best = 0
  for (let end = 0; end < s.length; end++) {
    const c = s[end]
    // si c est déjà DANS la fenêtre, on fait sauter le début juste après son ancienne position
    if (lastSeen.has(c) && lastSeen.get(c) >= start) start = lastSeen.get(c) + 1
    lastSeen.set(c, end)
    best = Math.max(best, end - start + 1)
  }
  return best
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(lengthOfLongestSubstring('abcabcbb'), 3)` },
      { name: 'un seul caractère répété', code: `assertEqual(lengthOfLongestSubstring('bbbbb'), 1)` },
      { name: 'sous-chaîne contiguë', code: `assertEqual(lengthOfLongestSubstring('pwwkew'), 3)` },
      { name: 'chaîne vide', code: `assertEqual(lengthOfLongestSubstring(''), 0)` },
      { name: 'un seul caractère et espace', code: `assertEqual(lengthOfLongestSubstring('a'), 1)
assertEqual(lengthOfLongestSubstring(' '), 1)` },
      { name: 'doublon hors de la fenêtre', code: `assertEqual(lengthOfLongestSubstring('abba'), 2)
assertEqual(lengthOfLongestSubstring('tmmzuxt'), 5)` },
      { name: 'tous distincts', code: `assertEqual(lengthOfLongestSubstring('abcdef'), 6)` },
    ],
    hints: [
      'Maintenez une **fenêtre** `[start, end]` sans doublon : on étend `end` à chaque tour, et on avance `start` quand un doublon apparaît.',
      'Une `Map` caractère → dernière position permet de faire sauter `start` directement, sans reculer pas à pas.',
      'Attention à `\'abba\'` : quand on revoit `a`, son ancienne position est déjà **hors** de la fenêtre ; `start` ne doit jamais reculer.',
    ],
    discussion: `**Complexité** : O(n) en temps (chaque indice est visité une fois par \`end\`, et \`start\` ne recule jamais), O(k) en mémoire où k est le nombre de caractères distincts.

**Points à évoquer** :

- c'est le modèle de la **fenêtre glissante** (*sliding window*) : sous-tableau ou sous-chaîne **contigu(ë)**, « le plus long / le plus court tel que… » ;
- force brute : tester toutes les sous-chaînes, O(n²) à O(n³) ;
- variante avec un \`Set\` : on retire \`s[start]\` et on avance \`start\` tant que le doublon est présent, toujours O(n) amorti ;
- le piège \`'abba'\` : sans la condition \`>= start\`, la fenêtre recule et la réponse est fausse ;
- variantes : au plus k caractères distincts, plus petite fenêtre contenant tous les caractères d'un motif.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'max-subarray',
    title: 'Sous-tableau de somme maximale (Kadane)',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`maxSubArray(nums)\` qui renvoie la **plus grande somme** d'un sous-tableau **contigu et non vide** de \`nums\`.

- si tous les nombres sont négatifs, la réponse est le plus grand d'entre eux (le sous-tableau ne peut pas être vide) ;
- si \`nums\` est vide, levez une \`RangeError\` ;
- visez **O(n)** en temps et **O(1)** en mémoire.

Exemples :

- \`maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])\` donne \`6\` (\`[4, -1, 2, 1]\`) ;
- \`maxSubArray([5, 4, -1, 7, 8])\` donne \`23\` ;
- \`maxSubArray([-3, -1, -2])\` donne \`-1\`.`,
    starter: `function maxSubArray(nums) {
  // TODO : algorithme de Kadane
  let best = 0
  let current = 0
  for (const x of nums) {
    current = Math.max(0, current + x)
    best = Math.max(best, current)
  }
  return best
}`,
    solution: `function maxSubArray(nums) {
  if (nums.length === 0) throw new RangeError('le tableau ne doit pas être vide')
  // current : meilleure somme d'un sous-tableau qui SE TERMINE à l'indice courant
  let current = nums[0]
  let best = nums[0]
  for (let i = 1; i < nums.length; i++) {
    // soit on prolonge le sous-tableau précédent, soit on repart de nums[i]
    current = Math.max(nums[i], current + nums[i])
    best = Math.max(best, current)
  }
  return best
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6)` },
      { name: 'tout le tableau', code: `assertEqual(maxSubArray([5, 4, -1, 7, 8]), 23)` },
      { name: 'tous négatifs', code: `assertEqual(maxSubArray([-3, -1, -2]), -1)` },
      { name: 'un seul élément', code: `assertEqual(maxSubArray([7]), 7)
assertEqual(maxSubArray([-7]), -7)` },
      { name: 'zéros', code: `assertEqual(maxSubArray([0, 0]), 0)
assertEqual(maxSubArray([-1, 0, -2]), 0)` },
      { name: 'tableau vide : RangeError', code: `let error = null
try { maxSubArray([]) } catch (e) { error = e }
assert(error instanceof RangeError, 'RangeError attendue')` },
      { name: 'meilleur segment au milieu', code: `assertEqual(maxSubArray([2, -10, 3, 4, -1, 2, -10, 1]), 8)` },
    ],
    hints: [
      'Pour chaque indice, quelle est la meilleure somme d’un sous-tableau qui **se termine** exactement là ? Soit on prolonge le précédent, soit on repart de zéro avec l’élément seul.',
      'Initialisez avec `nums[0]` et non avec `0`, sinon un tableau entièrement négatif renvoie `0` (le sous-tableau vide, interdit).',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- c'est de la **programmation dynamique** minimale : \`best[i] = max(nums[i], best[i - 1] + nums[i])\`, et comme seul l'état précédent sert, deux variables suffisent ;
- force brute : toutes les paires (début, fin) avec somme cumulée, O(n²) ; diviser pour régner, O(n log n) ;
- le piège \`best = 0\` : faux dès que tous les nombres sont négatifs ;
- pour renvoyer aussi les **bornes** du sous-tableau, on mémorise l'indice de départ à chaque « redémarrage » ;
- variantes : produit maximal (garder aussi le minimum, à cause des signes), tableau circulaire, meilleur moment pour acheter et vendre une action (Kadane sur les différences).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'merge-intervals',
    title: 'Fusionner des intervalles',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`mergeIntervals(intervals)\` qui reçoit un tableau d'intervalles fermés \`[start, end]\` (avec \`start <= end\`), **dans un ordre quelconque**, et renvoie un nouveau tableau où les intervalles qui se chevauchent sont **fusionnés**.

- deux intervalles qui se **touchent** fusionnent : \`[1, 2]\` et \`[2, 3]\` donnent \`[1, 3]\` ;
- le résultat est trié par début croissant ;
- le tableau d'entrée et ses intervalles ne sont **pas modifiés** ;
- un tableau vide donne \`[]\`.

Exemples :

- \`mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]])\` donne \`[[1, 6], [8, 10], [15, 18]]\` ;
- \`mergeIntervals([[8, 10], [1, 4], [4, 5]])\` donne \`[[1, 5], [8, 10]]\`.`,
    starter: `function mergeIntervals(intervals) {
  // TODO : trier puis fusionner
  return intervals
}`,
    solution: `function mergeIntervals(intervals) {
  // copie triée par début : on ne touche pas à l'entrée
  const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0])
  const result = []
  for (const current of sorted) {
    const last = result[result.length - 1]
    if (last && current[0] <= last[1]) {
      // chevauchement (ou contact) : on étend le dernier intervalle
      last[1] = Math.max(last[1], current[1])
    } else {
      result.push(current)
    }
  }
  return result
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]])` },
      { name: 'entrée non triée', code: `assertEqual(mergeIntervals([[8, 10], [1, 4], [4, 5]]), [[1, 5], [8, 10]])` },
      { name: 'intervalles qui se touchent', code: `assertEqual(mergeIntervals([[1, 2], [2, 3]]), [[1, 3]])` },
      { name: 'intervalle inclus dans un autre', code: `assertEqual(mergeIntervals([[1, 10], [2, 3], [4, 5]]), [[1, 10]])` },
      { name: 'vide et un seul intervalle', code: `assertEqual(mergeIntervals([]), [])
assertEqual(mergeIntervals([[5, 5]]), [[5, 5]])` },
      { name: 'négatifs et doublons', code: `assertEqual(mergeIntervals([[-5, -1], [-3, 0], [2, 4], [2, 4]]), [[-5, 0], [2, 4]])` },
      { name: 'ne modifie pas l’entrée', code: `const input = [[3, 4], [1, 3]]
mergeIntervals(input)
assertEqual(input, [[3, 4], [1, 3]])` },
      { name: 'tri numérique, pas lexicographique', code: `assertEqual(mergeIntervals([[10, 12], [9, 9], [2, 3]]), [[2, 3], [9, 9], [10, 12]])` },
    ],
    hints: [
      'Triez par début : deux intervalles qui se chevauchent deviennent alors **voisins**.',
      'Parcourez la liste triée : si l’intervalle courant commence avant (ou à) la fin du dernier intervalle gardé, étendez ce dernier ; sinon, ajoutez-le.',
      'Pour ne pas muter l’entrée, triez une **copie** des intervalles (copie de chaque paire, pas seulement du tableau externe). Et `sort` sans comparateur trie comme des chaînes !',
    ],
    discussion: `**Complexité** : O(n log n) en temps, dominé par le tri ; le parcours de fusion est O(n). O(n) en mémoire pour la copie et le résultat.

**Points à évoquer** :

- le réflexe « **trier d'abord** » transforme un problème O(n²) (comparer toutes les paires) en un simple balayage ;
- le comparateur numérique \`(a, b) => a[0] - b[0]\` est indispensable : sans lui, \`[10, …]\` passerait avant \`[9, …]\` ;
- \`Math.max(last[1], current[1])\` gère l'intervalle **inclus** (\`[1, 10]\` puis \`[2, 3]\`) ;
- copier seulement le tableau externe (\`[...intervals]\`) ne suffit pas : modifier \`last[1]\` muterait les paires d'origine ;
- variantes : insérer un intervalle dans une liste triée (O(n)), nombre minimal de salles de réunion (tri des débuts et des fins, ou tas), intersection de deux listes d'intervalles.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'move-zeroes',
    title: 'Déplacer les zéros',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`moveZeroes(nums)\` qui déplace tous les \`0\` à la **fin** du tableau, **en place**, en conservant l'**ordre relatif** des éléments non nuls.

- le tableau reçu est modifié directement (pas de copie), avec O(1) de mémoire supplémentaire ;
- la fonction renvoie **le même tableau** (même référence), pour pouvoir chaîner ;
- un tableau vide reste vide.

Exemples :

- \`moveZeroes([0, 1, 0, 3, 12])\` transforme le tableau en \`[1, 3, 12, 0, 0]\` ;
- \`moveZeroes([0])\` donne \`[0]\`.`,
    starter: `function moveZeroes(nums) {
  // TODO : en place, ordre conservé
  return nums.filter((x) => x !== 0).concat(nums.filter((x) => x === 0))
}`,
    solution: `function moveZeroes(nums) {
  // write : prochaine case où placer un élément non nul
  let write = 0
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      // échange : les non-nuls se tassent à gauche, les zéros glissent à droite
      const tmp = nums[write]
      nums[write] = nums[read]
      nums[read] = tmp
      write++
    }
  }
  return nums
}`,
    tests: [
      { name: 'exemple classique', code: `const a = [0, 1, 0, 3, 12]
moveZeroes(a)
assertEqual(a, [1, 3, 12, 0, 0])` },
      { name: 'renvoie la même référence', code: `const a = [0, 2]
assert(moveZeroes(a) === a, 'le tableau doit être modifié en place et renvoyé')
assertEqual(a, [2, 0])` },
      { name: 'tableau vide et un seul élément', code: `assertEqual(moveZeroes([]), [])
assertEqual(moveZeroes([0]), [0])
assertEqual(moveZeroes([5]), [5])` },
      { name: 'aucun zéro, que des zéros', code: `assertEqual(moveZeroes([1, 2, 3]), [1, 2, 3])
assertEqual(moveZeroes([0, 0, 0]), [0, 0, 0])` },
      { name: 'négatifs et doublons, ordre conservé', code: `assertEqual(moveZeroes([-1, 0, -1, 0, 2, 2]), [-1, -1, 2, 2, 0, 0])` },
      { name: 'longueur inchangée', code: `const a = [0, 0, 1]
moveZeroes(a)
assertEqual(a.length, 3)
assertEqual(a, [1, 0, 0])` },
    ],
    hints: [
      '`filter` puis `concat` crée un nouveau tableau : l’énoncé exige de modifier celui reçu.',
      'Deux pointeurs : `read` parcourt tout le tableau, `write` indique où placer le prochain élément non nul.',
      'Échanger `nums[read]` et `nums[write]` (ou recopier puis remplir la fin de zéros) conserve l’ordre des non-nuls.',
    ],
    discussion: `**Complexité** : O(n) en temps (un seul passage), O(1) en mémoire supplémentaire.

**Points à évoquer** :

- c'est le motif des **deux pointeurs dans le même sens** (lecture / écriture), aussi utilisé pour supprimer les doublons d'un tableau trié en place ;
- variante sans échange : recopier les non-nuls vers \`write\`, puis remplir la fin avec \`fill(0, write)\` ; même complexité, moins d'écritures si beaucoup de zéros ;
- \`splice\` dans une boucle (retirer un zéro puis le \`push\`) est O(n²) à cause de la réindexation, et itérer en modifiant est source de bugs ;
- \`sort((a, b) => (a === 0) - (b === 0))\` marche (le tri est stable depuis ES2019) mais coûte O(n log n) ;
- savoir justifier « en place » : une API qui mute doit le dire, d'où le retour de la même référence.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'best-time-stock',
    title: 'Meilleur moment pour acheter et vendre',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`maxProfit(prices)\` : \`prices[i]\` est le cours d'une action le jour \`i\`. Vous pouvez faire **une seule** transaction : acheter un jour, puis vendre un jour **strictement postérieur**. Renvoyez le bénéfice maximal possible.

- si aucun bénéfice n'est possible (cours toujours en baisse, un seul jour, tableau vide), renvoyez \`0\` ;
- le tableau d'entrée n'est pas modifié ;
- visez une solution en **un seul parcours**, O(n) en temps et O(1) en mémoire.

Exemples :

- \`maxProfit([7, 1, 5, 3, 6, 4])\` donne \`5\` (achat à 1, vente à 6) ;
- \`maxProfit([7, 6, 4, 3, 1])\` donne \`0\` ;
- \`maxProfit([2, 4, 1])\` donne \`2\` : on ne peut pas vendre avant d'acheter.`,
    starter: `function maxProfit(prices) {
  // TODO : bénéfice maximal avec un achat puis une vente
  return Math.max(...prices) - Math.min(...prices)
}`,
    solution: `function maxProfit(prices) {
  let minPrice = Infinity // plus bas cours vu jusqu'ici (meilleur jour d'achat)
  let best = 0
  for (const price of prices) {
    if (price < minPrice) minPrice = price
    else if (price - minPrice > best) best = price - minPrice // vendre aujourd'hui
  }
  return best
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(maxProfit([7, 1, 5, 3, 6, 4]), 5)` },
      { name: 'cours toujours en baisse : 0', code: `assertEqual(maxProfit([7, 6, 4, 3, 1]), 0)` },
      { name: 'on ne vend pas avant d’acheter', code: `assertEqual(maxProfit([2, 4, 1]), 2)
assertEqual(maxProfit([3, 8, 1, 2]), 5)` },
      { name: 'tableau vide et un seul jour', code: `assertEqual(maxProfit([]), 0)
assertEqual(maxProfit([5]), 0)` },
      { name: 'cours constants', code: `assertEqual(maxProfit([3, 3, 3]), 0)` },
      { name: 'le minimum arrive après un premier pic', code: `assertEqual(maxProfit([4, 9, 1, 7]), 6)
assertEqual(maxProfit([2, 1, 2, 1, 0, 1, 2]), 2)` },
    ],
    hints: [
      'Pour chaque jour de vente, le meilleur achat est le **plus bas cours des jours précédents**.',
      'Gardez deux variables en un seul parcours : le minimum vu jusqu’ici et le meilleur bénéfice.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire. La version naïve teste toutes les paires (achat, vente) : O(n²).

**Points à évoquer** :

- \`max - min\` est faux : le minimum peut arriver **après** le maximum (\`[2, 4, 1]\`) ;
- c'est une forme de **programmation dynamique** minimale (on garde le meilleur état passé), proche de l'algorithme de Kadane appliqué aux différences journalières ;
- variantes : transactions illimitées (somme des hausses), au plus k transactions (DP à états), délai de carence ou frais de transaction ;
- tableau vide : \`Math.min()\` vaut \`Infinity\`, d'où l'intérêt de démarrer à \`best = 0\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'merge-sort',
    title: 'Tri fusion',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`mergeSort(arr)\` qui renvoie un **nouveau tableau** contenant les nombres de \`arr\` triés par ordre **croissant**, avec l'algorithme du **tri fusion** :

1. un tableau de 0 ou 1 élément est déjà trié ;
2. sinon, on le coupe en deux moitiés, on trie chaque moitié récursivement ;
3. on **fusionne** les deux moitiés triées en avançant deux indices.

Contraintes :

- \`Array.prototype.sort\` et \`toSorted\` sont **interdits** (un test le vérifie) ;
- le tableau d'entrée n'est **pas modifié** ;
- les doublons et les nombres négatifs sont conservés.

Exemple : \`mergeSort([5, 2, 9, 1, 5, 6])\` donne \`[1, 2, 5, 5, 6, 9]\`.`,
    starter: `function mergeSort(arr) {
  // TODO : diviser, trier chaque moitié, fusionner
  return arr
}`,
    solution: `function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    // <= : à égalité, on prend à gauche d'abord, ce qui rend le tri stable
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  // une des deux moitiés est épuisée : on recopie le reste de l'autre
  while (i < left.length) result.push(left[i++])
  while (j < right.length) result.push(right[j++])
  return result
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr.slice() // copie : on ne renvoie jamais l'entrée
  const mid = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))
}`,
    tests: [
      { name: 'trie des nombres', code: `assertEqual(mergeSort([5, 2, 9, 1, 5, 6]), [1, 2, 5, 5, 6, 9])` },
      { name: 'tableau vide et un seul élément', code: `assertEqual(mergeSort([]), [])
assertEqual(mergeSort([42]), [42])` },
      { name: 'négatifs et ordre numérique (pas lexicographique)', code: `assertEqual(mergeSort([10, -3, 2, 100, -50, 0]), [-50, -3, 0, 2, 10, 100])` },
      { name: 'déjà trié, trié à l’envers, doublons', code: `assertEqual(mergeSort([1, 2, 3, 4]), [1, 2, 3, 4])
assertEqual(mergeSort([4, 3, 2, 1]), [1, 2, 3, 4])
assertEqual(mergeSort([2, 2, 1, 1]), [1, 1, 2, 2])` },
      {
        name: 'ne modifie pas l’entrée et renvoie un nouveau tableau',
        code: `const src = [3, 1, 2]
const out = mergeSort(src)
assertEqual(src, [3, 1, 2])
assert(out !== src, 'il faut renvoyer un nouveau tableau')
const one = [7]
assert(mergeSort(one) !== one, 'même pour un seul élément')`,
      },
      {
        name: 'n’utilise ni sort ni toSorted',
        code: `const input = [8, 3, 5, 1, 9, 2, 7, 4, 6, 0]
const originalSort = Array.prototype.sort
const originalToSorted = Array.prototype.toSorted
let out = null
let error = null
Array.prototype.sort = function () { throw new Error('Array.prototype.sort est interdit') }
Array.prototype.toSorted = function () { throw new Error('Array.prototype.toSorted est interdit') }
try {
  out = mergeSort(input)
} catch (e) {
  error = e
} finally {
  Array.prototype.sort = originalSort
  Array.prototype.toSorted = originalToSorted
}
assert(error === null, error ? error.message : '')
assertEqual(out, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])`,
      },
      {
        name: 'grand tableau',
        code: `const input = []
for (let i = 0; i < 2000; i++) input.push((i * 7919) % 2003)
const out = mergeSort(input)
assertEqual(out.length, 2000)
for (let i = 1; i < out.length; i++) assert(out[i - 1] <= out[i], 'désordre à l’indice ' + i)`,
      },
    ],
    hints: [
      'Commencez par écrire `merge(left, right)` qui fusionne deux tableaux **déjà triés** en avançant deux indices `i` et `j`.',
      'Cas de base : `arr.length <= 1`. Sinon `mid = Math.floor(arr.length / 2)` et deux appels récursifs sur `slice(0, mid)` et `slice(mid)`.',
      'Après la boucle de fusion, n’oubliez pas de recopier le reste de la moitié non épuisée.',
    ],
    discussion: `**Complexité** : O(n log n) en temps dans **tous** les cas (log n niveaux de découpe, O(n) de fusion par niveau) ; O(n) en mémoire supplémentaire pour les tableaux de fusion, plus O(log n) de pile de récursion.

**Points à évoquer** :

- le tri fusion est **stable** (deux éléments égaux gardent leur ordre relatif) grâce au \`<=\` de la fusion : avec \`<\`, il ne l'est plus ;
- comparé au **tri rapide** : quicksort trie en place (O(log n) de pile) et est souvent plus rapide en pratique, mais il est O(n²) dans le pire cas et pas stable ;
- \`Array.prototype.sort\` de V8 utilise **TimSort** (hybride fusion + insertion), stable depuis ES2019 ;
- sans comparateur, \`sort\` compare des **chaînes** : \`[10, 9, 1].sort()\` donne \`[1, 10, 9]\` ;
- usages : tri externe (fichiers trop gros pour la mémoire), listes chaînées (fusion sans mémoire supplémentaire), comptage d'inversions.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'kth-largest',
    title: 'K-ième plus grand élément',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`kthLargest(nums, k)\` qui renvoie le **k-ième plus grand** élément de \`nums\` (k = 1 : le maximum).

- les **doublons comptent** : dans \`[3, 2, 3, 1, 2, 4, 5, 5, 6]\`, le 4e plus grand est \`4\` (ordre décroissant : 6, 5, 5, 4…) ;
- si \`k\` n'est pas un entier compris entre \`1\` et \`nums.length\`, levez une \`RangeError\` (un tableau vide lève donc toujours) ;
- le tableau d'entrée n'est **pas modifié**.

Exemples :

- \`kthLargest([3, 2, 1, 5, 6, 4], 2)\` donne \`5\` ;
- \`kthLargest([-1, -5, -3], 1)\` donne \`-1\`.

Une solution par tri est acceptée ; discutez ensuite du *quickselect* et du tas.`,
    starter: `function kthLargest(nums, k) {
  // TODO : k-ième plus grand élément (doublons compris)
  return Math.max(...nums)
}`,
    solution: `function kthLargest(nums, k) {
  if (!Number.isInteger(k) || k < 1 || k > nums.length) {
    throw new RangeError('k doit être un entier entre 1 et ' + nums.length)
  }
  // Quickselect : partitionner une copie autour d'un pivot jusqu'à tomber sur la bonne position
  const a = nums.slice()
  const target = a.length - k // indice du résultat dans l'ordre croissant
  let lo = 0
  let hi = a.length - 1
  while (true) {
    // pivot au milieu (déterministe) placé en fin, puis partition de Lomuto
    const mid = Math.floor((lo + hi) / 2)
    ;[a[mid], a[hi]] = [a[hi], a[mid]]
    const pivot = a[hi]
    let store = lo
    for (let i = lo; i < hi; i++) {
      if (a[i] < pivot) {
        ;[a[i], a[store]] = [a[store], a[i]]
        store++
      }
    }
    ;[a[store], a[hi]] = [a[hi], a[store]]
    if (store === target) return a[store]
    if (store < target) lo = store + 1
    else hi = store - 1
  }
}`,
    tests: [
      { name: 'exemple simple', code: `assertEqual(kthLargest([3, 2, 1, 5, 6, 4], 2), 5)` },
      { name: 'les doublons comptent', code: `assertEqual(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4)
assertEqual(kthLargest([5, 5, 5], 2), 5)
assertEqual(kthLargest([1, 2, 2], 2), 2)` },
      { name: 'k = 1 (maximum) et k = n (minimum)', code: `assertEqual(kthLargest([7, 10, 4, 3, 20, 15], 1), 20)
assertEqual(kthLargest([7, 10, 4, 3, 20, 15], 6), 3)` },
      { name: 'un seul élément et nombres négatifs', code: `assertEqual(kthLargest([42], 1), 42)
assertEqual(kthLargest([-1, -5, -3], 1), -1)
assertEqual(kthLargest([-1, -5, -3], 3), -5)` },
      { name: 'ordre numérique, pas lexicographique', code: `assertEqual(kthLargest([1, 10, 9, 100], 2), 10)` },
      {
        name: 'k hors bornes : RangeError',
        code: `const cases = [[[1, 2, 3], 0], [[1, 2, 3], 4], [[1, 2, 3], 1.5], [[], 1]]
for (const [nums, k] of cases) {
  let error = null
  try { kthLargest(nums, k) } catch (e) { error = e }
  assert(error instanceof RangeError, 'RangeError attendue pour k = ' + k + ' et ' + nums.length + ' éléments')
}`,
      },
      { name: 'ne modifie pas l’entrée', code: `const src = [3, 1, 2]
kthLargest(src, 1)
assertEqual(src, [3, 1, 2])` },
    ],
    hints: [
      'Solution simple : trier une **copie** par ordre décroissant avec un comparateur numérique `(a, b) => b - a`, puis prendre l’indice `k - 1`.',
      'Sans comparateur, `sort` compare des chaînes : `[1, 10, 9].sort()` donne `[1, 10, 9]`.',
      'Pour faire mieux en moyenne : *quickselect*. Partitionnez autour d’un pivot et ne continuez que du côté qui contient l’indice `n - k`.',
    ],
    discussion: `**Complexité** :

- tri d'une copie : O(n log n) en temps, O(n) en mémoire ;
- **tas min de taille k** (on garde les k plus grands) : O(n log k) en temps, O(k) en mémoire ; idéal pour un flux ou quand k est petit ;
- **quickselect** (solution de référence) : O(n) **en moyenne**, O(n²) dans le pire cas (pivots toujours extrêmes) ; O(n) de mémoire ici à cause de la copie, O(1) en place. Un pivot aléatoire ou la médiane des médianes évite le pire cas.

**Points à évoquer** :

- « doublons comptés » ou « valeurs distinctes » : à faire préciser (pour des valeurs distinctes, dédoublonner d'abord avec un \`Set\`) ;
- JavaScript n'a pas de tas natif : il faut l'écrire (tableau + remontée/descente) ou expliquer qu'on l'écrirait ;
- ne pas trier \`nums\` en place : \`sort\` **mute** le tableau (ou utiliser \`toSorted\`, ES2023).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'permutations',
    title: 'Permutations',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`permutations(items)\` qui renvoie **toutes les permutations** du tableau \`items\`, dont les éléments sont **distincts**. Chaque permutation est un tableau ; le résultat est un tableau de permutations.

- l'**ordre des permutations** dans le résultat n'a pas d'importance (les tests le normalisent) ;
- \`permutations([])\` renvoie \`[[]]\` : il existe exactement une façon d'ordonner zéro élément ;
- le tableau d'entrée n'est pas modifié.

Exemple : \`permutations([1, 2, 3])\` renvoie 6 tableaux : \`[1, 2, 3]\`, \`[1, 3, 2]\`, \`[2, 1, 3]\`, \`[2, 3, 1]\`, \`[3, 1, 2]\`, \`[3, 2, 1]\` (dans n'importe quel ordre).`,
    starter: `function permutations(items) {
  // TODO : retour sur trace (backtracking)
  return [items]
}`,
    solution: `function permutations(items) {
  const result = []
  const current = []
  const used = new Array(items.length).fill(false)

  function backtrack() {
    if (current.length === items.length) {
      result.push(current.slice()) // copie : current continue d'être modifié
      return
    }
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue
      used[i] = true // choisir
      current.push(items[i])
      backtrack() // explorer
      current.pop() // annuler le choix
      used[i] = false
    }
  }

  backtrack()
  return result
}`,
    tests: [
      {
        name: 'trois éléments : 6 permutations',
        code: `const norm = (ps) => ps.map((p) => p.join(',')).sort()
assertEqual(norm(permutations([1, 2, 3])), ['1,2,3', '1,3,2', '2,1,3', '2,3,1', '3,1,2', '3,2,1'])`,
      },
      { name: 'tableau vide : une permutation vide', code: `assertEqual(permutations([]), [[]])` },
      { name: 'un seul élément', code: `assertEqual(permutations(['a']), [['a']])` },
      {
        name: 'deux éléments, chaînes',
        code: `const norm = (ps) => ps.map((p) => p.join(',')).sort()
assertEqual(norm(permutations(['x', 'y'])), ['x,y', 'y,x'])`,
      },
      {
        name: 'quatre éléments : 24 permutations distinctes et complètes',
        code: `const ps = permutations([4, 3, 2, 1])
assertEqual(ps.length, 24)
assertEqual(new Set(ps.map((p) => p.join(','))).size, 24, 'permutations en double')
for (const p of ps) assertEqual(p.slice().sort(), [1, 2, 3, 4])`,
      },
      {
        name: 'permutations indépendantes et entrée intacte',
        code: `const src = [1, 2]
const ps = permutations(src)
assertEqual(src, [1, 2])
assert(ps[0] !== ps[1], 'chaque permutation doit être un tableau distinct')
ps[0].push(99)
assertEqual(ps[1].length, 2)`,
      },
    ],
    hints: [
      'Schéma du **backtracking** : choisir un élément non utilisé, l’ajouter à la permutation courante, explorer récursivement, puis **annuler** le choix.',
      'Quand la permutation courante a la longueur de `items`, ajoutez-en une **copie** au résultat (`current.slice()`).',
      'Un tableau de booléens `used` (ou un `Set` d’indices) indique les éléments déjà placés.',
    ],
    discussion: `**Complexité** : il y a n! permutations, chacune copiée en O(n) : **O(n · n!)** en temps et en mémoire pour le résultat ; O(n) de pile de récursion. Dès n = 10, on dépasse 3,6 millions de permutations.

**Points à évoquer** :

- oublier la **copie** (\`result.push(current)\`) donne n! références au même tableau, vide à la fin ;
- variante par échanges en place (\`swap(i, start)\`, récursion, \`swap\` inverse) : pas de tableau \`used\` ;
- avec des **doublons** dans l'entrée : trier puis sauter un élément égal au précédent non utilisé, pour éviter les permutations répétées ;
- variante **générateur** (\`function*\`) pour produire les permutations une à une sans tout stocker ;
- même gabarit pour les combinaisons, le sudoku, les n reines : choisir, explorer, annuler.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'subsets',
    title: 'Sous-ensembles',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`subsets(items)\` qui renvoie **tous les sous-ensembles** (l'ensemble des parties) du tableau \`items\`, dont les éléments sont **distincts**.

- chaque sous-ensemble est un tableau dont les éléments apparaissent **dans le même ordre que dans \`items\`** ;
- l'**ordre des sous-ensembles** dans le résultat n'a pas d'importance (les tests le normalisent) ;
- le sous-ensemble vide \`[]\` en fait partie : \`subsets([])\` renvoie \`[[]]\` ;
- le tableau d'entrée n'est pas modifié.

Exemple : \`subsets([1, 2, 3])\` renvoie 8 tableaux : \`[]\`, \`[1]\`, \`[2]\`, \`[3]\`, \`[1, 2]\`, \`[1, 3]\`, \`[2, 3]\`, \`[1, 2, 3]\`.`,
    starter: `function subsets(items) {
  // TODO : chaque élément est pris ou non
  return [[], items]
}`,
    solution: `function subsets(items) {
  const result = []
  const current = []

  // à l'indice i, on décide : prendre items[i] ou non
  function backtrack(i) {
    if (i === items.length) {
      result.push(current.slice())
      return
    }
    current.push(items[i]) // avec items[i]
    backtrack(i + 1)
    current.pop() // sans items[i]
    backtrack(i + 1)
  }

  backtrack(0)
  return result
}`,
    tests: [
      {
        name: 'trois éléments : 8 sous-ensembles',
        code: `const norm = (ss) => ss.map((s) => s.join(',')).sort()
assertEqual(norm(subsets([1, 2, 3])), ['', '1', '1,2', '1,2,3', '1,3', '2', '2,3', '3'])`,
      },
      { name: 'tableau vide : seulement l’ensemble vide', code: `assertEqual(subsets([]), [[]])` },
      {
        name: 'un seul élément',
        code: `const norm = (ss) => ss.map((s) => s.join(',')).sort()
assertEqual(norm(subsets(['a'])), ['', 'a'])`,
      },
      {
        name: 'les éléments gardent l’ordre de l’entrée',
        code: `const ss = subsets([3, 1, 2])
const keys = new Set(ss.map((s) => s.join(',')))
assert(keys.has('3,1,2'), '[3, 1, 2] attendu')
assert(keys.has('3,2'), '[3, 2] attendu')
assert(!keys.has('1,3'), '[1, 3] ne respecte pas l’ordre de l’entrée')`,
      },
      {
        name: 'cinq éléments : 32 sous-ensembles distincts',
        code: `const ss = subsets([1, 2, 3, 4, 5])
assertEqual(ss.length, 32)
assertEqual(new Set(ss.map((s) => s.join(','))).size, 32, 'sous-ensembles en double')`,
      },
      { name: 'ne modifie pas l’entrée', code: `const src = [1, 2]
subsets(src)
assertEqual(src, [1, 2])` },
    ],
    hints: [
      'Pour chaque élément, deux choix : il est **dans** le sous-ensemble ou **pas**. Cela donne 2ⁿ sous-ensembles.',
      'Backtracking : `backtrack(i)` ajoute `items[i]`, appelle `backtrack(i + 1)`, retire `items[i]`, rappelle `backtrack(i + 1)`. À `i === items.length`, on enregistre une copie.',
      'Version itérative : partir de `[[]]` et, pour chaque élément, ajouter une copie de chaque sous-ensemble existant complétée par cet élément.',
    ],
    discussion: `**Complexité** : 2ⁿ sous-ensembles de taille moyenne n/2 : **O(n · 2ⁿ)** en temps et en mémoire pour le résultat ; O(n) de pile.

**Points à évoquer** :

- trois approches équivalentes : backtracking « pris / pas pris », construction itérative, et **masque de bits** (l'entier \`mask\` de 0 à 2ⁿ − 1 : le bit i indique si \`items[i]\` est pris) ;
- toujours enregistrer une **copie** de \`current\` ;
- avec doublons dans l'entrée : trier, puis sauter les éléments égaux au même niveau de décision ;
- liens : combinaisons de taille k (élaguer quand \`current.length === k\`), problème du sac à dos par force brute, *subset sum*.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'climb-stairs',
    title: 'Monter un escalier',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Un escalier compte \`n\` marches. À chaque pas, on monte **1 ou 2 marches**. Écrivez \`climbStairs(n)\` qui renvoie le **nombre de façons distinctes** d'atteindre le sommet.

- \`n\` est un entier positif ou nul ;
- \`climbStairs(0)\` vaut \`1\` (une seule façon : ne rien faire) et \`climbStairs(1)\` vaut \`1\` ;
- la fonction doit rester rapide pour \`n = 45\` (résultat : \`1836311903\`) : une récursion naïve sans mémoïsation est **trop lente**.

Exemples :

- \`climbStairs(2)\` donne \`2\` (1 + 1, ou 2) ;
- \`climbStairs(3)\` donne \`3\` (1 + 1 + 1, 1 + 2, 2 + 1).`,
    starter: `function climbStairs(n) {
  // TODO : nombre de façons de monter n marches par pas de 1 ou 2
  return n
}`,
    solution: `function climbStairs(n) {
  // ways(n) = ways(n - 1) + ways(n - 2) : le dernier pas fait 1 ou 2 marches
  let prev = 1 // ways(0)
  let curr = 1 // ways(1)
  for (let i = 2; i <= n; i++) {
    const next = prev + curr
    prev = curr
    curr = next
  }
  return curr
}`,
    tests: [
      { name: 'petites valeurs', code: `assertEqual(climbStairs(1), 1)
assertEqual(climbStairs(2), 2)
assertEqual(climbStairs(3), 3)
assertEqual(climbStairs(4), 5)
assertEqual(climbStairs(5), 8)` },
      { name: 'n = 0 : une façon', code: `assertEqual(climbStairs(0), 1)` },
      { name: 'n = 10', code: `assertEqual(climbStairs(10), 89)` },
      { name: 'n = 45 rapidement (pas de récursion exponentielle)', code: `assertEqual(climbStairs(45), 1836311903)` },
      { name: 'appels répétés indépendants', code: `assertEqual(climbStairs(6), 13)
assertEqual(climbStairs(6), 13)
assertEqual(climbStairs(7), 21)` },
    ],
    hints: [
      'Le dernier pas fait 1 ou 2 marches : le nombre de façons pour `n` est la somme des façons pour `n - 1` et `n - 2`.',
      'La récursion directe recalcule les mêmes valeurs un nombre exponentiel de fois : mémoïsez, ou calculez de bas en haut.',
      'Seules les deux dernières valeurs sont utiles : deux variables suffisent.',
    ],
    discussion: `**Complexité** :

- récursion naïve : O(2ⁿ) en temps (borne supérieure ; plus précisément O(φⁿ) avec φ ≈ 1,618), O(n) de pile ;
- **mémoïsation** (descendante) : O(n) en temps et en mémoire ;
- **tabulation** (ascendante) avec deux variables (solution de référence) : O(n) en temps, **O(1)** en mémoire.

**Points à évoquer** :

- c'est la **suite de Fibonacci** décalée : \`climbStairs(n) = fib(n + 1)\` ;
- illustration type de la **programmation dynamique** : sous-problèmes qui se recouvrent + sous-structure optimale ;
- au-delà de n ≈ 78, le résultat dépasse \`Number.MAX_SAFE_INTEGER\` : passer en \`BigInt\` ;
- variantes : pas de 1, 2 ou 3 marches ; coût par marche (minimiser) ; marches interdites ; calcul en O(log n) par exponentiation de matrice.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'coin-change',
    title: 'Rendu de monnaie',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez \`coinChange(coins, amount)\` qui renvoie le **nombre minimal de pièces** nécessaires pour former exactement \`amount\`. \`coins\` contient des valeurs entières strictement positives (dans n'importe quel ordre) ; chaque valeur est disponible en **quantité illimitée**.

- si le montant ne peut pas être formé, renvoyez \`-1\` ;
- \`coinChange(coins, 0)\` vaut \`0\` ;
- l'algorithme glouton (« toujours la plus grosse pièce ») ne donne pas toujours le minimum : il faut une **programmation dynamique**.

Exemples :

- \`coinChange([1, 2, 5], 11)\` donne \`3\` (5 + 5 + 1) ;
- \`coinChange([2], 3)\` donne \`-1\` ;
- \`coinChange([1, 3, 4], 6)\` donne \`2\` (3 + 3), alors que le glouton prendrait 4 + 1 + 1.`,
    starter: `function coinChange(coins, amount) {
  // TODO : approche gloutonne, fausse dans certains cas
  const sorted = [...coins].sort((a, b) => b - a)
  let count = 0
  for (const coin of sorted) {
    while (amount >= coin) {
      amount -= coin
      count++
    }
  }
  return amount === 0 ? count : -1
}`,
    solution: `function coinChange(coins, amount) {
  // dp[s] = nombre minimal de pièces pour former la somme s (Infinity si impossible)
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let s = 1; s <= amount; s++) {
    for (const coin of coins) {
      if (coin <= s && dp[s - coin] + 1 < dp[s]) dp[s] = dp[s - coin] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
    tests: [
      { name: 'exemple classique', code: `assertEqual(coinChange([1, 2, 5], 11), 3)` },
      { name: 'montant impossible : -1', code: `assertEqual(coinChange([2], 3), -1)
assertEqual(coinChange([5, 10], 3), -1)` },
      { name: 'montant nul : 0', code: `assertEqual(coinChange([1], 0), 0)
assertEqual(coinChange([2, 5], 0), 0)` },
      { name: 'le glouton se trompe', code: `assertEqual(coinChange([1, 3, 4], 6), 2)
assertEqual(coinChange([1, 5, 6, 9], 11), 2)` },
      { name: 'une seule pièce et pièces non triées', code: `assertEqual(coinChange([7], 7), 1)
assertEqual(coinChange([5, 1, 2], 7), 2)` },
      { name: 'grand montant', code: `assertEqual(coinChange([186, 419, 83, 408], 6249), 20)` },
    ],
    hints: [
      'Définissez `dp[s]` : nombre minimal de pièces pour la somme `s`, avec `dp[0] = 0`.',
      'Transition : `dp[s] = min(dp[s - coin] + 1)` pour chaque pièce `coin <= s`.',
      'Initialisez à `Infinity` pour représenter « impossible », et convertissez en `-1` à la fin.',
    ],
    discussion: `**Complexité** : O(amount × c) en temps (c = nombre de valeurs de pièces), O(amount) en mémoire.

**Points à évoquer** :

- le **glouton** n'est optimal que pour certains systèmes monétaires (dits canoniques, comme l'euro) ; contre-exemple : \`[1, 3, 4]\` pour 6 ;
- version descendante : récursion + mémoïsation sur le montant restant, même complexité mais risque de dépassement de pile pour de grands montants ;
- variante « nombre de **façons** » de former le montant : \`dp[s] += dp[s - coin]\`, boucle sur les pièces **à l'extérieur** pour ne pas compter deux fois le même multiensemble ;
- le BFS sur les montants (chaque pièce = une arête) donne aussi le minimum ;
- c'est un cas du **sac à dos non borné**.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'tree-max-depth',
    title: 'Profondeur d’un arbre binaire',
    difficulty: 'facile',
    theme: 'algo',
    category: 'algo',
    statement: `Un arbre binaire est représenté par des nœuds de la forme \`{ value, left, right }\`, où \`left\` et \`right\` sont un autre nœud ou \`null\`. L'arbre vide est \`null\`.

Écrivez \`maxDepth(root)\` qui renvoie la **profondeur maximale** de l'arbre : le nombre de nœuds sur le plus long chemin de la racine à une feuille.

- \`maxDepth(null)\` vaut \`0\` ;
- un nœud seul a une profondeur de \`1\`.

Exemple : pour l'arbre de racine 3, d'enfants 9 et 20, où 20 a pour enfants 15 et 7, la profondeur vaut \`3\`.`,
    starter: `function maxDepth(root) {
  // TODO : 1 + profondeur du plus grand sous-arbre
  return root ? 1 : 0
}`,
    solution: `function maxDepth(root) {
  if (root === null) return 0
  // la profondeur d'un nœud = 1 + la plus grande profondeur de ses deux sous-arbres
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}`,
    tests: [
      {
        name: 'exemple de l’énoncé',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
const tree = node(3, node(9), node(20, node(15), node(7)))
assertEqual(maxDepth(tree), 3)`,
      },
      { name: 'arbre vide : 0', code: `assertEqual(maxDepth(null), 0)` },
      { name: 'un seul nœud : 1', code: `assertEqual(maxDepth({ value: 1, left: null, right: null }), 1)` },
      {
        name: 'arbre déséquilibré à gauche ou à droite',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
assertEqual(maxDepth(node(1, node(2, node(3, node(4))))), 4)
assertEqual(maxDepth(node(1, null, node(2, null, node(3)))), 3)
assertEqual(maxDepth(node(1, node(2), node(3, null, node(4, node(5))))), 4)`,
      },
      {
        name: 'valeurs nulles ou négatives sans importance',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
assertEqual(maxDepth(node(0, node(-1), node(0, node(null)))), 3)`,
      },
      {
        name: 'longue chaîne de 1000 nœuds',
        code: `let root = null
for (let i = 0; i < 1000; i++) root = { value: i, left: root, right: null }
assertEqual(maxDepth(root), 1000)`,
      },
    ],
    hints: [
      'Cas de base : un arbre vide (`null`) a une profondeur de 0.',
      'Sinon : `1 + Math.max(maxDepth(root.left), maxDepth(root.right))`.',
      'Version itérative : un parcours en largeur qui compte les niveaux.',
    ],
    discussion: `**Complexité** : O(n) en temps (chaque nœud est visité une fois) ; O(h) en mémoire pour la pile de récursion, h étant la hauteur : O(log n) pour un arbre équilibré, O(n) pour un arbre dégénéré en liste.

**Points à évoquer** :

- c'est un **DFS** (parcours en profondeur) post-ordre : on combine les résultats des enfants ;
- pour un arbre très profond (des dizaines de milliers de nœuds), la récursion peut faire **déborder la pile** (\`RangeError: Maximum call stack size exceeded\`) : version itérative avec une pile explicite de paires (nœud, profondeur), ou BFS niveau par niveau ;
- variantes : profondeur **minimale** (attention aux nœuds à un seul enfant), arbre équilibré (comparer les hauteurs des sous-arbres), diamètre, symétrie.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'level-order',
    title: 'Parcours en largeur par niveaux',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Avec des nœuds de la forme \`{ value, left, right }\` (\`left\` et \`right\` valent un nœud ou \`null\`), écrivez \`levelOrder(root)\` qui renvoie les valeurs de l'arbre **niveau par niveau**, de gauche à droite : un tableau de tableaux, un par niveau.

- \`levelOrder(null)\` renvoie \`[]\` ;
- l'arbre n'est pas modifié.

Exemple : pour l'arbre de racine 3, d'enfants 9 et 20, où 20 a pour enfants 15 et 7, le résultat est \`[[3], [9, 20], [15, 7]]\`.`,
    starter: `function levelOrder(root) {
  // TODO : parcours en largeur avec une file
  return root ? [[root.value]] : []
}`,
    solution: `function levelOrder(root) {
  if (root === null) return []
  const levels = []
  let level = [root] // nœuds du niveau courant
  while (level.length > 0) {
    levels.push(level.map((node) => node.value))
    const next = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next // pas de shift : on remplace le niveau entier
  }
  return levels
}`,
    tests: [
      {
        name: 'exemple de l’énoncé',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
const tree = node(3, node(9), node(20, node(15), node(7)))
assertEqual(levelOrder(tree), [[3], [9, 20], [15, 7]])`,
      },
      { name: 'arbre vide', code: `assertEqual(levelOrder(null), [])` },
      { name: 'un seul nœud', code: `assertEqual(levelOrder({ value: 'a', left: null, right: null }), [['a']])` },
      {
        name: 'arbre complet sur trois niveaux',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
const tree = node(1, node(2, node(4), node(5)), node(3, node(6), node(7)))
assertEqual(levelOrder(tree), [[1], [2, 3], [4, 5, 6, 7]])`,
      },
      {
        name: 'trous et ordre gauche-droite',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
const tree = node(1, node(2, null, node(5)), node(3, node(6)))
assertEqual(levelOrder(tree), [[1], [2, 3], [5, 6]])`,
      },
      {
        name: 'valeurs fausses et doublons conservés',
        code: `const node = (value, left = null, right = null) => ({ value, left, right })
assertEqual(levelOrder(node(0, node(0), node(-1, null, node(0)))), [[0], [0, -1], [0]])`,
      },
    ],
    hints: [
      'Un parcours **en largeur** (BFS) utilise une **file** : on traite les nœuds dans l’ordre où on les découvre.',
      'Pour séparer les niveaux : traitez tout le niveau courant, en collectant les enfants dans un nouveau tableau qui devient le niveau suivant.',
      'Testez `node.left` et `node.right` avant de les ajouter, pour ne pas mettre de `null` dans la file.',
    ],
    discussion: `**Complexité** : O(n) en temps ; O(w) en mémoire pour la file, w étant la largeur maximale de l'arbre (jusqu'à environ n/2 pour le dernier niveau d'un arbre complet).

**Points à évoquer** :

- une file implémentée avec \`queue.shift()\` coûte O(n) par retrait, donc O(n²) au total dans le pire cas : utiliser un **indice de tête** ou, comme ici, remplacer le niveau entier ;
- alternative en DFS récursif : passer la profondeur et faire \`levels[depth].push(value)\`, même résultat ;
- variantes : parcours en zigzag, vue de droite (dernier élément de chaque niveau), moyenne par niveau, plus court chemin dans un graphe non pondéré (même BFS avec un ensemble \`visited\`).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'number-of-islands',
    title: 'Nombre d’îles',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Une carte est une grille (tableau de lignes) de chaînes \`'1'\` (terre) et \`'0'\` (eau). Une **île** est un groupe de cases de terre reliées **horizontalement ou verticalement** (pas en diagonale). Écrivez \`numIslands(grid)\` qui renvoie le nombre d'îles.

- la grille peut être vide (\`[]\`) : renvoyez \`0\` ;
- la grille **ne doit pas être modifiée** (un test le vérifie) : gardez trace des cases visitées à part ;
- les lignes ont toutes la même longueur.

Exemple :

- \`numIslands([['1', '1', '0'], ['0', '1', '0'], ['0', '0', '1']])\` donne \`2\` ;
- deux cases de terre qui ne se touchent que par un coin forment **deux** îles.`,
    starter: `function numIslands(grid) {
  // TODO : compter les composantes connexes de '1'
  let count = 0
  for (const row of grid) for (const cell of row) if (cell === '1') count++
  return count
}`,
    solution: `function numIslands(grid) {
  const rows = grid.length
  if (rows === 0) return 0
  const cols = grid[0].length
  const visited = grid.map((row) => row.map(() => false))
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let islands = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1' || visited[r][c]) continue
      islands++ // nouvelle île : on marque toute sa terre (DFS itératif, sans risque de pile)
      const stack = [[r, c]]
      visited[r][c] = true
      while (stack.length > 0) {
        const [y, x] = stack.pop()
        for (const [dy, dx] of directions) {
          const ny = y + dy
          const nx = x + dx
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] === '1' && !visited[ny][nx]) {
            visited[ny][nx] = true
            stack.push([ny, nx])
          }
        }
      }
    }
  }
  return islands
}`,
    tests: [
      {
        name: 'une grande île',
        code: `assertEqual(numIslands([
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '0', '0', '0'],
]), 1)`,
      },
      {
        name: 'trois îles',
        code: `assertEqual(numIslands([
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
]), 3)`,
      },
      { name: 'grille vide et sans terre', code: `assertEqual(numIslands([]), 0)
assertEqual(numIslands([['0', '0'], ['0', '0']]), 0)` },
      { name: 'une seule case', code: `assertEqual(numIslands([['1']]), 1)
assertEqual(numIslands([['0']]), 0)` },
      { name: 'les diagonales ne relient pas', code: `assertEqual(numIslands([['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]), 5)` },
      {
        name: 'île en forme de U',
        code: `assertEqual(numIslands([
  ['1', '0', '1'],
  ['1', '0', '1'],
  ['1', '1', '1'],
]), 1)`,
      },
      {
        name: 'ne modifie pas la grille',
        code: `const grid = [['1', '1', '0'], ['0', '1', '0'], ['0', '0', '1']]
const copy = grid.map((row) => row.slice())
assertEqual(numIslands(grid), 2)
assertEqual(grid, copy, 'la grille a été modifiée')`,
      },
      {
        name: 'grande grille 60 × 60 pleine',
        code: `const grid = []
for (let r = 0; r < 60; r++) grid.push(new Array(60).fill('1'))
assertEqual(numIslands(grid), 1)`,
      },
    ],
    hints: [
      'Parcourez toutes les cases. À chaque case de terre **non visitée**, comptez une île de plus puis marquez toute l’île (DFS ou BFS).',
      'Gardez une grille `visited` de booléens de même taille (ou un `Set` de clés `r + \',\' + c`) au lieu d’écraser les `\'1\'`.',
      'Quatre voisins : `[1, 0], [-1, 0], [0, 1], [0, -1]`, avec un test de bornes.',
    ],
    discussion: `**Complexité** : O(R × C) en temps (chaque case est visitée un nombre constant de fois) ; O(R × C) en mémoire pour \`visited\` et, dans le pire cas, pour la pile ou la file.

**Points à évoquer** :

- c'est un comptage de **composantes connexes** dans un graphe implicite (cases = sommets, voisinage = arêtes) ;
- la version classique marque les cases en les remplaçant par \`'0'\` : O(1) de mémoire en plus, mais elle **mute l'entrée** (à proposer seulement si c'est autorisé) ;
- un DFS **récursif** peut déborder la pile sur une très grande île : la pile explicite l'évite ;
- alternative : **Union-Find** (ensembles disjoints), utile si des cases deviennent terre au fil du temps ;
- variantes : surface de la plus grande île, périmètre, voisinage à 8 directions, nombre d'îles de formes distinctes.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'queue',
    title: 'File avec défilement en O(1)',
    difficulty: 'moyen',
    theme: 'algo',
    category: 'algo',
    statement: `Écrivez une classe \`Queue\` (file **FIFO** : premier entré, premier sorti) :

- \`enqueue(value)\` : ajoute \`value\` en fin de file ;
- \`dequeue()\` : retire et renvoie l'élément en tête, ou \`undefined\` si la file est vide ;
- \`peek()\` : renvoie l'élément en tête **sans le retirer**, ou \`undefined\` si la file est vide ;
- \`size\` : un **accesseur** (getter, pas une méthode) qui renvoie le nombre d'éléments.

\`dequeue\` doit être en **O(1)** (amorti) : \`Array.prototype.shift\` est en O(n) car il réindexe tout le tableau, il est donc **interdit** (un test le vérifie). Les valeurs peuvent être quelconques, y compris \`0\`, \`''\` ou \`null\`.

Exemple : \`q.enqueue(1)\`, \`q.enqueue(2)\`, \`q.dequeue()\` renvoie \`1\`, \`q.size\` vaut \`1\`, \`q.peek()\` renvoie \`2\`.`,
    starter: `class Queue {
  constructor() {
    this.items = []
  }
  enqueue(value) {
    // TODO
  }
  dequeue() {
    // TODO : sans shift
  }
  peek() {
    // TODO
  }
  get size() {
    return 0
  }
}`,
    solution: `class Queue {
  constructor() {
    this.items = {} // objet indexé : la suppression en tête ne décale rien
    this.head = 0 // indice du prochain élément à sortir
    this.tail = 0 // indice de la prochaine place libre
  }

  enqueue(value) {
    this.items[this.tail] = value
    this.tail++
  }

  dequeue() {
    if (this.head === this.tail) return undefined
    const value = this.items[this.head]
    delete this.items[this.head] // libère la référence
    this.head++
    if (this.head === this.tail) {
      // file vide : on repart de zéro pour garder des indices petits
      this.head = 0
      this.tail = 0
    }
    return value
  }

  peek() {
    return this.head === this.tail ? undefined : this.items[this.head]
  }

  get size() {
    return this.tail - this.head
  }
}`,
    tests: [
      {
        name: 'ordre FIFO',
        code: `const q = new Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
assertEqual(q.dequeue(), 1)
assertEqual(q.dequeue(), 2)
assertEqual(q.dequeue(), 3)`,
      },
      {
        name: 'file vide : undefined et taille 0',
        code: `const q = new Queue()
assertEqual(q.size, 0)
assertEqual(q.dequeue(), undefined)
assertEqual(q.peek(), undefined)
assertEqual(q.size, 0, 'dequeue sur une file vide ne rend pas la taille négative')`,
      },
      {
        name: 'peek ne retire pas, size suit les opérations',
        code: `const q = new Queue()
q.enqueue('a')
q.enqueue('b')
assertEqual(q.peek(), 'a')
assertEqual(q.peek(), 'a')
assertEqual(q.size, 2)
q.dequeue()
assertEqual(q.size, 1)
assertEqual(q.peek(), 'b')
assert(typeof Object.getOwnPropertyDescriptor(Queue.prototype, 'size').get === 'function', 'size doit être un getter')`,
      },
      {
        name: 'opérations entrelacées et réutilisation après vidage',
        code: `const q = new Queue()
q.enqueue(1)
q.enqueue(2)
assertEqual(q.dequeue(), 1)
q.enqueue(3)
assertEqual(q.dequeue(), 2)
assertEqual(q.dequeue(), 3)
assertEqual(q.dequeue(), undefined)
q.enqueue(4)
assertEqual(q.peek(), 4)
assertEqual(q.size, 1)
assertEqual(q.dequeue(), 4)`,
      },
      {
        name: 'conserve les valeurs fausses',
        code: `const q = new Queue()
q.enqueue(0)
q.enqueue('')
q.enqueue(null)
assertEqual(q.size, 3)
assertEqual(q.dequeue(), 0)
assertEqual(q.peek(), '')
assertEqual(q.dequeue(), '')
assertEqual(q.dequeue(), null)
assertEqual(q.size, 0)`,
      },
      {
        name: 'n’utilise pas Array.prototype.shift (100 000 opérations)',
        code: `const originalShift = Array.prototype.shift
let error = null
let sum = 0
let firstOut = null
let finalSize = -1
Array.prototype.shift = function () { throw new Error('Array.prototype.shift est interdit (O(n))') }
try {
  const q = new Queue()
  for (let i = 0; i < 100000; i++) q.enqueue(i)
  firstOut = q.dequeue()
  sum += firstOut
  for (let i = 1; i < 100000; i++) sum += q.dequeue()
  finalSize = q.size
} catch (e) {
  error = e
} finally {
  Array.prototype.shift = originalShift
}
assert(error === null, error ? error.message : '')
assertEqual(firstOut, 0)
assertEqual(sum, 4999950000)
assertEqual(finalSize, 0)`,
      },
    ],
    hints: [
      'Au lieu de retirer physiquement le premier élément, gardez un **indice de tête** qui avance à chaque `dequeue`.',
      'Avec deux indices `head` et `tail`, la taille est simplement `tail - head`, et la file est vide quand ils sont égaux.',
      'Autre approche classique : **deux piles** (`inbox` pour `enqueue`, `outbox` pour `dequeue`), en reversant `inbox` dans `outbox` (par `pop`) seulement quand `outbox` est vide.',
    ],
    discussion: `**Complexité** : \`enqueue\`, \`dequeue\`, \`peek\` et \`size\` en O(1) ; mémoire O(n).

**Points à évoquer** :

- **pourquoi \`shift\` est un piège** : il décale tous les éléments restants, O(n) par appel ; un BFS qui fait \`queue.shift()\` à chaque nœud devient O(n²) sur un grand graphe ;
- **deux piles** : chaque élément est déplacé au plus une fois de \`inbox\` vers \`outbox\`, d'où un \`dequeue\` en O(1) **amorti** (un appel isolé peut coûter O(n)) ;
- tableau + indice de tête : simple, mais le tableau garde les cases mortes ; on le compacte de temps en temps (par exemple quand \`head\` dépasse la moitié) ;
- **tampon circulaire** de capacité fixe (ou doublée à la demande) : indices modulo la capacité, très économe ;
- liste chaînée (\`head\`, \`tail\`) : O(1) strict, mais une allocation par élément ;
- variantes : **deque** (ajout/retrait aux deux bouts), file de priorité (tas binaire, O(log n)).`,
  },
]
