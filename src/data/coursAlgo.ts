import type { CoursSection } from './types'

/*
 * Cours « Algorithmique » : Big O puis un motif par sous-partie (ancres #cours/algo-…).
 * Extraits vérifiés par src/lib/snippets.test.ts, comme le reste du cours.
 */
export const algo: CoursSection = {
  id: 'algo',
  title: 'Algorithmique',
  summary: 'La notation Big O, puis les motifs qui résolvent l’immense majorité des exercices d’entretien : table de hachage, deux pointeurs, fenêtre glissante, recherche dichotomique, tris, récursion, pile et file, arbres, graphes et programmation dynamique.',
  blocks: [
    // ───────────── Big O ─────────────
    { h: 'Complexité : la notation Big O', id: 'algo-big-o' },
    {
      p: 'La notation **Big O** décrit comment le coût d’un algorithme **croît** quand la taille `n` de l’entrée augmente, dans le pire cas sauf mention contraire. On garde le terme dominant et on supprime les constantes : `3n² + 5n + 2` s’écrit **O(n²)**, et `2n` s’écrit **O(n)**. Ce n’est pas une mesure en millisecondes, c’est une **tendance** : un algorithme O(n) finit toujours par battre un O(n²) quand `n` devient grand.',
    },
    {
      table: [
        ['Complexité', 'Nom', 'Exemple typique'],
        ['O(1)', 'constante', 'accès `arr[i]`, `map.get(key)`, `push`'],
        ['O(log n)', 'logarithmique', 'recherche dichotomique : on divise le problème par 2 à chaque étape'],
        ['O(n)', 'linéaire', 'un parcours : `for`, `map`, `filter`, `includes`'],
        ['O(n log n)', 'quasi linéaire', 'tri fusion, `Array.prototype.sort`'],
        ['O(n²)', 'quadratique', 'deux boucles imbriquées sur la même entrée'],
        ['O(2ⁿ)', 'exponentielle', 'énumérer tous les sous-ensembles, Fibonacci récursif naïf'],
      ],
    },
    {
      p: 'Ordre de grandeur du nombre d’opérations selon `n` (log en base 2, valeurs arrondies) :',
    },
    {
      table: [
        ['n', 'log n', 'n log n', 'n²', '2ⁿ'],
        ['10', '3,3', '33', '100', '1 024'],
        ['100', '6,6', '664', '10⁴', '≈ 1,3 × 10³⁰'],
        ['1 000', '10', '≈ 10⁴', '10⁶', '≈ 1,1 × 10³⁰¹'],
        ['10⁶', '20', '≈ 2 × 10⁷', '10¹²', 'incalculable'],
      ],
    },
    {
      p: 'Repère pratique : un moteur JavaScript fait de l’ordre de 10⁸ opérations simples par seconde. Pour `n = 10⁶`, O(n log n) répond en quelques dizaines de millisecondes, O(n²) prend des heures. Pour `n = 30`, O(2ⁿ) représente déjà un milliard d’opérations.',
    },
    { h: 'Temps, mémoire et coût amorti' },
    {
      list: [
        '**Complexité en temps** : nombre d’opérations élémentaires. **Complexité en mémoire** (espace) : mémoire **supplémentaire** utilisée, sans compter l’entrée. On échange souvent l’un contre l’autre : un `Set` de n éléments (O(n) en mémoire) transforme une recherche O(n) en O(1).',
        'La pile d’appels compte dans la mémoire : une récursion de profondeur `d` coûte O(d) en espace, même sans tableau.',
        '**Coût amorti** : une opération parfois chère mais rare, dont le coût moyen sur une longue suite reste constant. `push` est **O(1) amorti** : de temps en temps, le moteur réalloue le tableau en doublant sa capacité (O(n)), mais ces copies sont assez rares pour que n `push` coûtent O(n) au total.',
        '**En moyenne** contre **pire cas** : `Set.has` et `Map.get` sont O(1) en moyenne (table de hachage) ; le tri rapide est O(n log n) en moyenne mais O(n²) dans le pire cas.',
      ],
    },
    { h: 'Calculer la complexité d’un code' },
    {
      title: 'Compter les tours de boucle',
      code: `function countOps(n) {
  let single = 0
  for (let i = 0; i < n; i++) single++ // n tours : O(n)

  let nested = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) nested++ // n × n tours : O(n²)
  }

  let halving = 0
  for (let i = n; i > 1; i = Math.floor(i / 2)) halving++ // on divise par 2 : O(log n)

  let triangle = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) triangle++ // n(n-1)/2 tours : toujours O(n²)
  }
  return { single, nested, halving, triangle }
}

countOps(16) // → { single: 16, nested: 256, halving: 4, triangle: 120 }
countOps(1024) // → { single: 1024, nested: 1048576, halving: 10, triangle: 523776 }`,
    },
    {
      list: [
        '**Boucles successives** : on additionne, puis on garde le terme dominant (O(n) + O(n²) = O(n²)).',
        '**Boucles imbriquées** : on multiplie (O(n) × O(m) = O(n × m)). Attention aux deux entrées différentes : ne pas écrire O(n²) quand c’est O(n × m).',
        '**Variable divisée (ou multipliée) par 2 à chaque tour** : O(log n).',
        '**Méthodes natives dans une boucle** : `includes`, `indexOf`, `splice`, `shift` ou le spread `[...arr]` sont eux-mêmes O(n). Une boucle qui les appelle devient O(n²).',
        '**Récursion** : nombre d’appels × travail par appel. Un appel qui se rappelle deux fois sur `n - 1` fait environ 2ⁿ appels : O(2ⁿ). Un appel qui coupe l’entrée en deux et fait un travail linéaire (tri fusion) : log n niveaux de n opérations, O(n log n).',
      ],
    },
    { h: 'Coût des opérations natives en JavaScript' },
    {
      table: [
        ['Opération', 'Complexité', 'Remarque'],
        ['`arr[i]`, `arr.length`', 'O(1)', ''],
        ['`push`, `pop`', 'O(1) amorti', 'travaillent en fin de tableau'],
        ['`shift`, `unshift`', 'O(n)', 'tous les éléments sont réindexés'],
        ['`splice(i, k)`, `slice`, `concat`, `[...arr]`', 'O(n)', 'copie ou décalage'],
        ['`includes`, `indexOf`, `find`, `some`', 'O(n)', 'parcours linéaire'],
        ['`sort`', 'O(n log n)', 'stable depuis ES2019'],
        ['`Set.has/add/delete`, `Map.get/set/has`', 'O(1) en moyenne', 'table de hachage'],
        ['`obj[key]`, `key in obj`', 'O(1) en moyenne', ''],
        ['`str[i]`, `str.length`', 'O(1)', ''],
        ['`str.slice`, `split`, `join`, `indexOf`', 'O(n)', ''],
        ['`s += x` dans une boucle', 'O(n²) en théorie', 'les chaînes sont immuables ; V8 utilise des « ropes » qui rendent `+=` rapide en pratique'],
      ],
    },
    {
      title: 'Construire une chaîne : join est l’idiome sûr',
      code: `const parts = []
for (let i = 0; i < 5; i++) parts.push(i * i)
parts.join('-') // → '0-1-4-9-16'

let s = ''
for (let i = 0; i < 5; i++) s += i * i
s // → '014916'`,
    },
    {
      p: 'En théorie, `s += x` recopie toute la chaîne à chaque tour, donc O(n²) au total. V8 représente les concaténations par des « ropes » (arbres de morceaux) et ne recopie qu’à la lecture : en JavaScript, `+=` est en pratique rapide. Dire les deux en entretien montre qu’on connaît le risque théorique et le comportement réel ; accumuler dans un tableau puis faire `join` reste l’idiome sans surprise.',
    },
    {
      mnemo: '« On garde le plus gros, on jette les constantes. » Diviser par deux = log n ; boucle dans une boucle = n² ; deux appels récursifs sur n - 1 = 2ⁿ.',
      piege: 'Oublier le coût **caché** des méthodes natives : `arr.includes` ou `arr.shift()` dans une boucle font passer un algorithme apparemment linéaire en O(n²). Autre erreur : annoncer O(n²) pour deux entrées différentes au lieu de O(n × m).',
    },

    // ───────────── Hash map ─────────────
    { h: 'Table de hachage et comptage de fréquences', id: 'algo-hash-map' },
    {
      list: [
        '**Signaux dans l’énoncé** : « trouver une paire dont la somme vaut… », « doublons », « anagrammes », « premier caractère unique », « le plus fréquent », « regrouper par… ».',
        '**Idée** : remplacer une recherche linéaire répétée (O(n²)) par une `Map` ou un `Set` qui répond en O(1) en moyenne, au prix de O(n) en mémoire.',
        'Utiliser une `Map` plutôt qu’un objet littéral : les clés peuvent être de n’importe quel type, il n’y a pas de clés héritées (`toString`, `__proto__`) et l’ordre d’insertion est conservé.',
      ],
    },
    {
      title: 'Compter, puis chercher le complément',
      code: `function frequencies(items) {
  const counts = new Map()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
  return counts
}

function twoSum(nums, target) {
  const seen = new Map() // valeur → indice
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (seen.has(complement)) return [seen.get(complement), i]
    seen.set(nums[i], i)
  }
  return null
}

frequencies('banana') // → Map(3) { 'b' => 1, 'a' => 3, 'n' => 2 }
twoSum([2, 7, 11, 15], 9) // → [ 0, 1 ]
twoSum([3, 3], 6) // → [ 0, 1 ]
twoSum([1, 2], 10) // → null`,
    },
    {
      p: '**Complexité** : O(n) en temps (un seul passage, opérations de `Map` en O(1) en moyenne), O(n) en mémoire. La version naïve à deux boucles est O(n²) en temps et O(1) en mémoire : c’est le compromis temps contre mémoire à énoncer.',
    },
    {
      mnemo: '« Si tu cherches dans une boucle, range d’abord dans une Map. » Compter = `counts.set(x, (counts.get(x) ?? 0) + 1)`.',
      piege: 'Dans `twoSum`, ajouter l’élément à la `Map` **avant** de chercher son complément : avec `[3]` et une cible de 6, l’élément se trouve lui-même. Autre piège : `if (counts.get(x))` est faux pour un compteur ou un indice valant `0`, il faut `has`.',
    },

    // ───────────── Two pointers ─────────────
    { h: 'Deux pointeurs', id: 'algo-two-pointers' },
    {
      list: [
        '**Signaux** : tableau **trié**, « paire », « palindrome », « inverser sur place », « supprimer les doublons sans tableau auxiliaire », « déplacer les zéros à la fin », « fusionner deux tableaux triés ».',
        '**Deux variantes** : pointeurs **opposés** (un à chaque bout, ils se rapprochent) ou pointeurs **lent/rapide** (même sens : le rapide lit, le lent écrit).',
        'Chaque pas fait avancer au moins un pointeur, donc au plus n pas : **O(n) en temps, O(1) en mémoire**.',
      ],
    },
    {
      title: 'Pointeurs opposés et pointeurs lent/rapide',
      code: `// Tableau trié : paire de somme target
function pairSumSorted(sorted, target) {
  let left = 0
  let right = sorted.length - 1
  while (left < right) {
    const sum = sorted[left] + sorted[right]
    if (sum === target) return [left, right]
    if (sum < target) left++ // il faut plus grand
    else right-- // il faut plus petit
  }
  return null
}

// Supprimer les doublons d'un tableau trié, sur place
function dedupeSorted(arr) {
  let write = 0
  for (let read = 0; read < arr.length; read++) {
    if (read === 0 || arr[read] !== arr[read - 1]) arr[write++] = arr[read]
  }
  arr.length = write
  return arr
}

pairSumSorted([-3, 1, 4, 6, 9], 10) // → [ 1, 4 ]
pairSumSorted([1, 2, 3], 100) // → null
dedupeSorted([1, 1, 2, 3, 3, 3, 7]) // → [ 1, 2, 3, 7 ]`,
    },
    {
      mnemo: '« Trié + paire = deux pointeurs. » Opposés pour chercher, lent/rapide pour compacter sur place.',
      piege: 'Appliquer les pointeurs opposés à un tableau **non trié** : l’argument « la somme est trop petite, j’avance à gauche » ne vaut que si le tableau est trié. Trier d’abord coûte O(n log n) et perd les indices d’origine.',
    },

    // ───────────── Sliding window ─────────────
    { h: 'Fenêtre glissante', id: 'algo-sliding-window' },
    {
      list: [
        '**Signaux** : « sous-tableau **contigu** » ou « sous-chaîne », « la plus longue / la plus courte… telle que… », « somme maximale de k éléments consécutifs », « au plus k caractères distincts ».',
        '**Fenêtre fixe** de taille k : on ajoute l’élément entrant et on retire l’élément sortant, au lieu de tout recalculer (O(n) au lieu de O(n × k)).',
        '**Fenêtre variable** : on étend à droite ; tant que la fenêtre est invalide, on rétrécit à gauche. Chaque indice entre et sort au plus une fois : **O(n)**.',
      ],
    },
    {
      title: 'Fenêtre fixe et fenêtre variable',
      code: `function maxSumOfK(nums, k) {
  if (k > nums.length) return null
  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += nums[i]
  let best = windowSum
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k] // entre nums[i], sort nums[i - k]
    best = Math.max(best, windowSum)
  }
  return best
}

function longestUniqueSubstring(s) {
  const lastSeen = new Map() // caractère → dernier indice vu
  let start = 0
  let best = 0
  for (let end = 0; end < s.length; end++) {
    const c = s[end]
    // doublon dans la fenêtre : on déplace le début juste après l'occurrence précédente
    if (lastSeen.has(c) && lastSeen.get(c) >= start) start = lastSeen.get(c) + 1
    lastSeen.set(c, end)
    best = Math.max(best, end - start + 1)
  }
  return best
}

maxSumOfK([2, 1, 5, 1, 3, 2], 3) // → 9
maxSumOfK([-1, -2, -3], 2) // → -3
longestUniqueSubstring('abcabcbb') // → 3
longestUniqueSubstring('abba') // → 2
longestUniqueSubstring('') // → 0`,
    },
    {
      p: '**Complexité** : O(n) en temps pour les deux ; mémoire O(1) pour la fenêtre fixe, O(m) pour la variable, où m est la taille de l’alphabet (nombre de caractères distincts).',
    },
    {
      mnemo: '« Contigu = fenêtre. » La droite avance toujours, la gauche ne recule jamais.',
      piege: 'Oublier la condition `lastSeen.get(c) >= start` : sur `\'abba\'`, le second `a` renverrait le début de fenêtre en arrière (vers l’indice 1) et donnerait 3 au lieu de 2. Et la fenêtre glissante ne s’applique pas aux sous-suites **non contiguës**.',
    },

    // ───────────── Binary search ─────────────
    { h: 'Recherche dichotomique', id: 'algo-binary-search' },
    {
      list: [
        '**Signaux** : tableau **trié**, « en O(log n) », « trouver la première / dernière position », « point d’insertion », ou recherche du plus petit `x` qui satisfait une condition **monotone** (faux, faux, …, vrai, vrai).',
        'À chaque étape, on compare l’élément du milieu et on élimine la moitié de l’intervalle : **O(log n) en temps, O(1) en mémoire** en version itérative. Pour un million d’éléments : 20 comparaisons au plus.',
      ],
    },
    {
      title: 'Recherche exacte et borne inférieure',
      code: `function binarySearch(sorted, target) {
  let low = 0
  let high = sorted.length - 1 // intervalle fermé [low, high]
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] === target) return mid
    if (sorted[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return -1
}

// Premier indice dont la valeur est >= target (point d'insertion)
function lowerBound(sorted, target) {
  let low = 0
  let high = sorted.length // intervalle semi-ouvert [low, high)
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] < target) low = mid + 1
    else high = mid
  }
  return low
}

const nums = [1, 3, 5, 5, 5, 8, 13]
binarySearch(nums, 8) // → 5
binarySearch(nums, 4) // → -1
binarySearch([], 1) // → -1
lowerBound(nums, 5) // → 2
lowerBound(nums, 100) // → 7`,
    },
    {
      mnemo: '« Trié + O(log n) = dichotomie. » Choisir un intervalle (fermé `<=` ou semi-ouvert `<`) et s’y tenir partout.',
      piege: 'Les boucles infinies et les erreurs d’un cran : avec `while (low < high)` et `low = mid` (au lieu de `mid + 1`), l’intervalle peut ne plus rétrécir. Avec des doublons, la recherche exacte renvoie **un** indice quelconque de la valeur, pas forcément le premier : utiliser `lowerBound`.',
    },

    // ───────────── Sorting ─────────────
    { h: 'Tris : tri fusion, tri rapide, sort', id: 'algo-sorting' },
    {
      p: 'En entretien, on attend surtout trois choses : savoir écrire un **tri fusion** (ou un tri rapide), connaître leurs complexités et leur **stabilité**, et maîtriser le **comparateur** de `Array.prototype.sort`. Un tri est **stable** s’il conserve l’ordre relatif des éléments égaux : trier des utilisateurs par ville en gardant l’ordre alphabétique déjà établi.',
    },
    {
      title: 'Tri fusion (merge sort)',
      code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))
}

function merge(a, b) {
  const out = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    // <= : à égalité, on prend à gauche d'abord, ce qui rend le tri stable
    if (a[i] <= b[j]) out.push(a[i++])
    else out.push(b[j++])
  }
  while (i < a.length) out.push(a[i++])
  while (j < b.length) out.push(b[j++])
  return out
}

mergeSort([5, -2, 9, 1, 5, 0]) // → [ -2, 0, 1, 5, 5, 9 ]
mergeSort([]) // → []`,
    },
    {
      title: 'Tri rapide (quick sort), version lisible',
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr
  const pivot = arr[Math.floor(arr.length / 2)]
  const less = arr.filter((x) => x < pivot)
  const equal = arr.filter((x) => x === pivot)
  const greater = arr.filter((x) => x > pivot)
  return [...quickSort(less), ...equal, ...quickSort(greater)]
}

quickSort([3, 6, 1, 8, 1, 2]) // → [ 1, 1, 2, 3, 6, 8 ]`,
    },
    {
      table: [
        ['Tri', 'Temps moyen', 'Pire cas', 'Mémoire', 'Stable'],
        ['Tri fusion', 'O(n log n)', 'O(n log n)', 'O(n)', 'oui'],
        ['Tri rapide (partition sur place)', 'O(n log n)', 'O(n²)', 'O(log n) de pile en moyenne', 'non'],
        ['Tri par insertion', 'O(n²)', 'O(n²)', 'O(1)', 'oui (O(n) si presque trié)'],
        ['`Array.prototype.sort` (V8 : TimSort)', 'O(n log n)', 'O(n log n)', 'O(n)', 'oui (garanti depuis ES2019)'],
      ],
    },
    {
      p: 'Le pire cas du tri rapide survient quand le pivot est systématiquement le minimum ou le maximum (par exemple le premier élément d’un tableau déjà trié) : les partitions sont déséquilibrées et la profondeur devient n. Un pivot aléatoire ou « médiane de trois » rend ce cas très improbable. La version lisible ci-dessus crée des tableaux à chaque niveau (O(n) de mémoire supplémentaire) ; la version classique partitionne **sur place** (schéma de Lomuto ou de Hoare).',
    },
    {
      title: 'Le comparateur de sort',
      code: `[10, 9, 1, 100].sort(); // → [ 1, 10, 100, 9 ]
[10, 9, 1, 100].sort((a, b) => a - b); // → [ 1, 9, 10, 100 ]
[10, 9, 1, 100].sort((a, b) => b - a); // → [ 100, 10, 9, 1 ]
['é', 'z', 'a'].sort(); // → [ 'a', 'z', 'é' ]
['é', 'z', 'a'].sort((a, b) => a.localeCompare(b)) // → [ 'a', 'é', 'z' ]

const users = [
  { name: 'Ada', city: 'Lyon' },
  { name: 'Bob', city: 'Paris' },
  { name: 'Cleo', city: 'Lyon' },
]
users.sort((a, b) => a.city.localeCompare(b.city)).map((u) => u.name) // → [ 'Ada', 'Cleo', 'Bob' ]
const original = [3, 1, 2]
const sortedCopy = original.toSorted((a, b) => a - b)
original // → [ 3, 1, 2 ]
sortedCopy // → [ 1, 2, 3 ]`,
    },
    {
      list: [
        'Sans comparateur, `sort` convertit les éléments en **chaînes** et compare leurs unités UTF-16 : `10` passe avant `9`.',
        'Le comparateur doit renvoyer un **nombre** : négatif si `a` vient avant `b`, positif s’il vient après, `0` s’ils sont égaux. `a - b` pour des nombres, `localeCompare` pour du texte.',
        '`sort` **modifie** le tableau et le renvoie ; `toSorted` (ES2023) renvoie une copie triée.',
        'La stabilité (garantie depuis ES2019) permet d’enchaîner les tris : Ada reste avant Cleo dans l’exemple.',
      ],
    },
    {
      mnemo: '« Fusion : stable et sûr, mais il lui faut de la place. Rapide : rapide en moyenne, mais il peut tomber sur un mauvais pivot. » Pour `sort` : « sans comparateur, tout devient chaîne ».',
      piege: 'Un comparateur qui renvoie un **booléen**, comme `(a, b) => a > b` : `true` et `false` deviennent `1` et `0`, le cas « a avant b » n’est jamais signalé et le résultat dépend de l’algorithme interne. Il faut renvoyer un nombre (`a - b`).',
    },

    // ───────────── Recursion & backtracking ─────────────
    { h: 'Récursion et backtracking', id: 'algo-recursion' },
    {
      list: [
        '**Signaux** : « toutes les combinaisons », « toutes les permutations », « tous les sous-ensembles », « générer les parenthésages valides », sudoku, N reines, structure naturellement récursive (arbre, objet imbriqué).',
        'Une fonction récursive a toujours un **cas de base** (qui s’arrête) et un **cas récursif** qui se rapproche du cas de base.',
        'Le **backtracking** construit une solution pas à pas : on **choisit**, on **explore** récursivement, puis on **annule** le choix pour essayer le suivant.',
      ],
    },
    {
      title: 'Sous-ensembles et permutations par backtracking',
      code: `function subsets(items) {
  const result = []
  const current = []
  function explore(start) {
    result.push([...current]) // copie : current continue d'évoluer
    for (let i = start; i < items.length; i++) {
      current.push(items[i]) // choisir
      explore(i + 1) // explorer
      current.pop() // annuler
    }
  }
  explore(0)
  return result
}

function permutations(items) {
  const result = []
  const used = new Array(items.length).fill(false)
  const current = []
  function explore() {
    if (current.length === items.length) return void result.push([...current])
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue
      used[i] = true
      current.push(items[i])
      explore()
      current.pop()
      used[i] = false
    }
  }
  explore()
  return result
}

subsets([1, 2, 3]) // → [ [], [ 1 ], [ 1, 2 ], [ 1, 2, 3 ], [ 1, 3 ], [ 2 ], [ 2, 3 ], [ 3 ] ]
permutations(['a', 'b', 'c']).map((p) => p.join('')) // → [ 'abc', 'acb', 'bac', 'bca', 'cab', 'cba' ]
subsets([]) // → [ [] ]`,
    },
    {
      p: '**Complexité** : il y a 2ⁿ sous-ensembles et n! permutations, et copier chaque solution coûte O(n) : **O(n × 2ⁿ)** et **O(n × n!)** en temps. La mémoire auxiliaire est O(n) (profondeur de récursion et solution en cours), sans compter le résultat. Impossible de faire mieux : la sortie elle-même a cette taille.',
    },
    {
      title: 'La pile d’appels a une limite',
      code: `function depth(n) {
  return n === 0 ? 0 : 1 + depth(n - 1)
}
depth(1000) // → 1000
try {
  depth(1e6)
} catch (e) {
  console.log(e.constructor.name, e.message)
}`,
      output: 'RangeError Maximum call stack size exceeded',
    },
    {
      p: 'Chaque appel occupe une case de la pile ; selon le moteur et la taille des cadres, la limite tombe autour de **10 000 appels** imbriqués. JavaScript ne fait pas d’élimination des appels terminaux en pratique (seul Safari l’implémente). Pour une profondeur qui dépend des données (liste chaînée, arbre dégénéré, grande grille), on passe à une version **itérative** avec une pile explicite.',
    },
    {
      mnemo: '« Choisir, explorer, annuler. » Et toujours écrire le cas de base en premier.',
      piege: 'Pousser `current` au lieu de `[...current]` dans le résultat : toutes les entrées pointent vers le même tableau, vidé à la fin, et l’on obtient une liste de tableaux vides. Autre piège : oublier d’annuler le choix (`pop`, `used[i] = false`), ce qui pollue les branches suivantes.',
    },

    // ───────────── Stack & queue ─────────────
    { h: 'Pile et file', id: 'algo-stack-queue' },
    {
      list: [
        '**Pile** (LIFO, dernier entré premier sorti) : `push` et `pop` sur un tableau, O(1). Signaux : « parenthèses équilibrées », « annuler / rétablir », « évaluer une expression », « élément plus grand suivant », simuler une récursion.',
        '**File** (FIFO, premier entré premier sorti) : signaux « traiter dans l’ordre d’arrivée », « parcours en largeur (BFS) », « plus court chemin en nombre d’étapes », file de tâches.',
        '`arr.shift()` est **O(n)** : il réindexe tout le tableau. Une file construite avec `push` + `shift` rend donc un BFS en O(n²) sur de grandes entrées. On garde plutôt un **indice de tête** qui avance.',
      ],
    },
    {
      title: 'Pile : parenthèses équilibrées',
      code: `function isBalanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') stack.push(c)
    else if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false
    }
  }
  return stack.length === 0
}

isBalanced('{[()()]}') // → true
isBalanced('([)]') // → false
isBalanced('((') // → false
isBalanced('') // → true`,
    },
    {
      title: 'File avec indice de tête : dequeue en O(1)',
      code: `class Queue {
  constructor() {
    this.items = []
    this.head = 0 // indice du prochain élément à sortir
  }
  enqueue(x) {
    this.items.push(x)
  }
  dequeue() {
    if (this.head === this.items.length) return undefined
    const x = this.items[this.head]
    this.items[this.head] = undefined // libère la référence
    this.head++
    // compactage occasionnel : coût amorti O(1)
    if (this.head > 1000 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head)
      this.head = 0
    }
    return x
  }
  get size() {
    return this.items.length - this.head
  }
}

const q = new Queue()
q.enqueue('a')
q.enqueue('b')
q.enqueue('c')
q.dequeue() // → 'a'
q.size // → 2
q.dequeue() // → 'b'
q.dequeue() // → 'c'
q.dequeue() // → undefined`,
    },
    {
      p: '**Complexité** : `enqueue` O(1) amorti, `dequeue` O(1) amorti (le compactage recopie au plus autant d’éléments qu’il en est sorti depuis le dernier). Alternatives : une liste chaînée avec pointeurs de tête et de queue, ou deux piles (on verse la pile d’entrée dans la pile de sortie quand celle-ci est vide).',
    },
    {
      mnemo: '« Pile = assiettes (on prend celle du dessus), file = guichet (premier arrivé, premier servi). » Et « shift décale tout le monde ».',
      piege: 'Implémenter une file avec `push` + `shift` et l’annoncer en O(1) : `shift` est O(n). Pour les parenthèses, oublier de vérifier que la pile est **vide à la fin** (`\'((\'` serait accepté).',
    },

    // ───────────── Trees ─────────────
    { h: 'Arbres : parcours en profondeur et en largeur', id: 'algo-trees' },
    {
      list: [
        '**Signaux** : « arbre binaire », « profondeur », « hauteur », « niveau par niveau », « chemin de la racine à une feuille », « ancêtre commun », DOM, menus imbriqués, systèmes de fichiers.',
        '**DFS** (*Depth-First Search*, en profondeur) : on descend jusqu’au bout d’une branche avant de remonter. Récursif naturellement, ou itératif avec une **pile**. Ordres préfixe (nœud puis enfants), infixe (gauche, nœud, droite : ordre croissant dans un arbre binaire de recherche), suffixe (enfants puis nœud).',
        '**BFS** (*Breadth-First Search*, en largeur) : niveau par niveau, avec une **file**. Idéal pour « par niveau » ou « la feuille la plus proche de la racine ».',
        'Forme de nœud utilisée ici : `{ value, left, right }`, avec `null` pour un enfant absent.',
      ],
    },
    {
      title: 'Profondeur maximale (DFS) et parcours par niveaux (BFS)',
      code: `const node = (value, left = null, right = null) => ({ value, left, right })
//        1
//       / \\
//      2   3
//     / \\    \\
//    4   5    6
const tree = node(1, node(2, node(4), node(5)), node(3, null, node(6)))

function maxDepth(root) {
  if (root === null) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

function preorderIterative(root) {
  const out = []
  const stack = root ? [root] : []
  while (stack.length) {
    const n = stack.pop()
    out.push(n.value)
    if (n.right) stack.push(n.right) // droite d'abord : gauche sortira en premier
    if (n.left) stack.push(n.left)
  }
  return out
}

function levelOrder(root) {
  const levels = []
  let level = root ? [root] : []
  while (level.length) {
    levels.push(level.map((n) => n.value))
    const next = []
    for (const n of level) {
      if (n.left) next.push(n.left)
      if (n.right) next.push(n.right)
    }
    level = next
  }
  return levels
}

maxDepth(tree) // → 3
maxDepth(null) // → 0
preorderIterative(tree) // → [ 1, 2, 4, 5, 3, 6 ]
levelOrder(tree) // → [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ]`,
    },
    {
      p: '**Complexité** : chaque nœud est visité une fois, **O(n) en temps**. En mémoire, le DFS récursif utilise **O(h)**, où h est la hauteur : O(log n) pour un arbre équilibré, O(n) pour un arbre dégénéré en liste (d’où le risque de dépassement de pile). Le BFS stocke un niveau entier : jusqu’à O(n) (environ n/2 feuilles au dernier niveau d’un arbre complet). La version « niveau par niveau » ci-dessus évite `shift` en construisant le niveau suivant dans un nouveau tableau.',
    },
    {
      mnemo: '« Profondeur = pile (ou récursion), largeur = file. » Pour un arbre récursif : « que renvoie la fonction pour `null` ? » est la première question.',
      piege: 'Oublier le cas `null` (racine vide ou enfant absent) et lire `root.left` sur `null` : `TypeError`. En DFS itératif préfixe, empiler la gauche avant la droite inverse l’ordre de visite.',
    },

    // ───────────── Graphs ─────────────
    { h: 'Graphes : liste d’adjacence, BFS, DFS', id: 'algo-graphs' },
    {
      list: [
        '**Signaux** : « réseau », « amis d’amis », « dépendances », « chemin entre A et B », « nombre de composantes », « îles dans une grille », « ordre de compilation » (tri topologique).',
        '**Représentation** : une **liste d’adjacence** (`Map` de nœud vers tableau de voisins) coûte O(V + E) en mémoire, V étant le nombre de sommets et E le nombre d’arêtes. Une matrice d’adjacence coûte O(V²) et ne vaut le coup que pour un graphe dense.',
        'Contrairement à un arbre, un graphe peut contenir des **cycles** : un ensemble `visited` est indispensable pour ne pas boucler indéfiniment.',
        'Une **grille** est un graphe implicite : chaque case a jusqu’à 4 voisins (haut, bas, gauche, droite).',
      ],
    },
    {
      title: 'Plus court chemin (en nombre d’arêtes) par BFS',
      code: `function buildGraph(edges) {
  const graph = new Map()
  for (const [a, b] of edges) {
    if (!graph.has(a)) graph.set(a, [])
    if (!graph.has(b)) graph.set(b, [])
    graph.get(a).push(b)
    graph.get(b).push(a) // non orienté
  }
  return graph
}

function shortestPath(graph, start, goal) {
  const previous = new Map([[start, null]]) // sert aussi d'ensemble visited
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]
    if (current === goal) {
      const path = []
      for (let n = goal; n !== null; n = previous.get(n)) path.unshift(n)
      return path
    }
    for (const next of graph.get(current) ?? []) {
      if (!previous.has(next)) {
        previous.set(next, current) // marqué dès l'ajout à la file
        queue.push(next)
      }
    }
  }
  return null
}

const g = buildGraph([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['F', 'G']])
shortestPath(g, 'A', 'E') // → [ 'A', 'B', 'D', 'E' ]
shortestPath(g, 'A', 'G') // → null
shortestPath(g, 'A', 'A') // → [ 'A' ]`,
    },
    {
      title: 'Compter les composantes par DFS (îles d’une grille)',
      code: `function countIslands(grid) {
  const rows = grid.length
  const cols = rows ? grid[0].length : 0
  const seen = grid.map((row) => row.map(() => false))
  function sink(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return
    if (seen[r][c] || grid[r][c] !== 1) return
    seen[r][c] = true
    sink(r + 1, c)
    sink(r - 1, c)
    sink(r, c + 1)
    sink(r, c - 1)
  }
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && !seen[r][c]) {
        count++
        sink(r, c)
      }
    }
  }
  return count
}

const grid = [
  [1, 1, 0, 0],
  [1, 0, 0, 1],
  [0, 0, 1, 1],
  [0, 0, 0, 0],
]
countIslands(grid) // → 2
countIslands([]) // → 0`,
    },
    {
      p: '**Complexité** : BFS et DFS visitent chaque sommet une fois et chaque arête une fois (deux fois si non orienté) : **O(V + E)** en temps, O(V) en mémoire pour `visited` et la file ou la pile. Sur une grille de R lignes et C colonnes : **O(R × C)**. Le BFS donne le plus court chemin **en nombre d’arêtes** dans un graphe non pondéré ; avec des poids, il faut Dijkstra. La reconstruction du chemin avec `unshift` est O(longueur²), acceptable pour un chemin court ; sinon `push` puis `reverse`.',
    },
    {
      mnemo: '« Graphe = arbre + cycles, donc visited. » Plus court chemin sans poids = BFS ; « existe-t-il un chemin / combien de composantes » = DFS ou BFS.',
      piege: 'Marquer un sommet comme visité **au moment où on le sort** de la file plutôt qu’au moment où on l’y ajoute : il peut être ajouté plusieurs fois, ce qui gonfle la file et fausse les distances. Et un DFS récursif sur une grande grille (1000 × 1000) peut dépasser la pile : version itérative.',
    },

    // ───────────── DP ─────────────
    { h: 'Programmation dynamique', id: 'algo-dp' },
    {
      list: [
        '**Signaux** : « nombre de façons de… », « minimum / maximum de… », « est-il possible de… » avec des choix qui se répètent : escaliers, rendu de monnaie, sac à dos, plus longue sous-séquence commune, distance d’édition.',
        'Deux ingrédients : des **sous-problèmes qui se recoupent** (la récursion naïve recalcule les mêmes valeurs) et une **sous-structure optimale** (la solution se construit à partir des solutions des sous-problèmes).',
        '**Top-down (mémoïsation)** : on écrit la récurrence naturellement, et on met en cache chaque résultat (voir la mémoïsation dans la section Performance).',
        '**Bottom-up (tabulation)** : on remplit un tableau du plus petit sous-problème au plus grand, sans récursion, donc sans risque de dépassement de pile ; on peut souvent ne garder que les dernières valeurs.',
      ],
    },
    {
      title: 'Escaliers : naïf, mémoïsé, tabulé',
      code: `// ways(n) = ways(n - 1) + ways(n - 2) : on arrive par un pas de 1 ou de 2
let naiveCalls = 0
function waysNaive(n) {
  naiveCalls++
  if (n <= 1) return 1
  return waysNaive(n - 1) + waysNaive(n - 2)
}

function waysMemo(n, memo = new Map()) {
  if (n <= 1) return 1
  if (!memo.has(n)) memo.set(n, waysMemo(n - 1, memo) + waysMemo(n - 2, memo))
  return memo.get(n)
}

function waysTab(n) {
  let prev = 1 // ways(0)
  let curr = 1 // ways(1)
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr]
  return curr
}

waysNaive(20) // → 10946
naiveCalls // → 21891
waysMemo(20) // → 10946
waysTab(20) // → 10946
waysTab(0) // → 1
waysTab(50) // → 20365011074`,
    },
    {
      p: 'La version naïve est **O(2ⁿ)** (borne supérieure ; plus précisément O(φⁿ) avec φ ≈ 1,618) : près de 22 000 appels pour n = 20. Mémoïsée : **O(n)** en temps et O(n) en mémoire (cache et pile). Tabulée avec deux variables : **O(n) en temps, O(1) en mémoire**.',
    },
    {
      title: 'Rendu de monnaie : nombre minimal de pièces',
      code: `function coinChange(coins, amount) {
  // best[a] = nombre minimal de pièces pour faire a (Infinity si impossible)
  const best = new Array(amount + 1).fill(Infinity)
  best[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && best[a - coin] + 1 < best[a]) best[a] = best[a - coin] + 1
    }
  }
  return best[amount] === Infinity ? -1 : best[amount]
}

coinChange([1, 2, 5], 11) // → 3
coinChange([2], 3) // → -1
coinChange([1, 3, 4], 6) // → 2
coinChange([7], 0) // → 0`,
    },
    {
      p: '**Complexité** : O(amount × k) en temps, k étant le nombre de pièces, et O(amount) en mémoire. L’exemple `[1, 3, 4]` pour 6 montre pourquoi l’approche **gloutonne** (prendre la plus grosse pièce d’abord : 4 + 1 + 1, soit 3 pièces) échoue, alors que la programmation dynamique trouve 3 + 3.',
    },
    {
      mnemo: '« Récursion + cache = top-down ; tableau rempli de bas en haut = bottom-up. » Méthode : 1) définir l’état, 2) écrire la récurrence, 3) poser les cas de base, 4) choisir l’ordre de calcul.',
      piege: 'Partager un cache par défaut entre appels sans le vouloir, ou au contraire en créer un nouveau à chaque appel récursif (`waysMemo(n - 1)` sans passer `memo`) : la mémoïsation ne sert alors à rien et l’on retombe en O(2ⁿ). Et croire qu’un algorithme glouton suffit pour le rendu de monnaie : ce n’est vrai que pour certains systèmes de pièces.',
    },
  ],
  mnemo: 'Lire l’énoncé comme une liste de signaux : « trié » → dichotomie ou deux pointeurs ; « contigu » → fenêtre glissante ; « déjà vu, doublon, paire » → `Map`/`Set` ; « toutes les combinaisons » → backtracking ; « niveau, plus court chemin » → BFS ; « nombre de façons, minimum » → programmation dynamique.',
  piege: 'Se lancer dans le code sans annoncer la complexité, ou annoncer O(n) pour une boucle qui appelle `includes`, `indexOf`, `shift` ou `splice` (chacun O(n)). Commencer par la solution naïve, donner sa complexité, puis montrer quel motif la fait baisser.',
}
