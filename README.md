# Prépa entretien JavaScript & TypeScript

Application web pour préparer un entretien technique JavaScript et TypeScript (front-end) : cours,
quiz, pièges, katas de live coding et algorithmique. Tout le contenu est en français et **vérifié par
des tests** : chaque sortie affichée, chaque réponse de quiz et chaque solution de kata est
rejouée automatiquement. Le contenu TypeScript passe en plus par **le vrai compilateur** (`typescript`) :
erreurs de type attendues, types inférés annoncés et katas de types sont vérifiés.

Frontend uniquement, sans backend ni compte : la progression est stockée dans le `localStorage`
du navigateur.

## Fonctionnalités

- **Cours** par thème (types et coercition, portée et closures, `this`, prototypes, asynchrone et
  event loop, tableaux et objets, modules, DOM et événements, performance, bases du web…) et une section
  **algorithmique** (Big O, motifs classiques) et une section **TypeScript** (typage structurel,
  narrowing, génériques, types utilitaires, mapped et conditional types, `satisfies`, tsconfig strict,
  `.d.ts`, et TypeScript dans React, Vue et Angular), avec des ancres `#cours/ts-…` ;
- **Quiz** « qu'affiche ce code ? » et questions de cours, avec explication de chaque réponse ; pour
  TypeScript, « ce code compile-t-il ? » et « quel type est inféré ? » ;
- **Pièges** du langage, avec sortie exacte ;
- **Playground** : éditeur CodeMirror et console qui exécute le code dans un Web Worker isolé ;
  bascule **JavaScript / TypeScript** (code conservé par langage) : en TS, diagnostics du compilateur
  au fil de la frappe (soulignés et listés), type inféré au survol, puis exécution du JS transpilé ;
- **Katas** de live coding (utilitaires JS, algorithmique, TypeScript) avec tests cachés, code de
  départ et solution de référence ; les katas TypeScript sont soit « niveau types » (tests
  `Expect<Equal<…>>` qui doivent compiler), soit exécutés et typés à la fois ;
- **Flashcards** avec répétition espacée (système de Leitner) ;
- **Questions d'entretien** (dont React, Vue, Angular) avec ce que l'interlocuteur cherche à
  vérifier et un espace pour rédiger sa réponse ;
- **Lexique**, **cheatsheet** et page **méthode** (comment aborder un exercice de live coding).

## Démarrage rapide

Prérequis : Node.js 20.19 ou plus récent (exigence de Vite 8).

```bash
npm install
npm run dev        # http://localhost:5191
npm test           # vérifie tout le contenu
npm run build      # vérification TypeScript + build de production dans dist/
```

Stack : Vite 8, React 19, TypeScript, Tailwind 4, CodeMirror 6.

## Commandes

```bash
npm install
npm run dev        # http://localhost:5191
npm run build      # vérification TypeScript + build de production dans dist/
npm run preview    # sert dist/ sur le port 5191
npm test           # exécute et vérifie tout le contenu (voir plus bas)
npx tsx scripts/run-snippet.ts fichier.js   # sortie exacte d'un extrait, comme les tests
npx tsx scripts/ts-snippet.ts fichier.ts    # TS : diagnostics, types inférés, sortie du JS transpilé
```

## Structure

```
src/
  App.tsx                 navigation latérale + routage par hash (#page/ancre)
  lib/
    nav.tsx, storage.ts   contexte de navigation, useStored (localStorage)
    sandbox/
      format.ts           formatage des valeurs façon Node (console)
      runtime.ts          cœur partagé : console, minuteurs suivis, attente, runner de katas
      worker.ts           Web Worker du navigateur (indirect eval)
      client.ts           côté page : worker neuf par exécution, timeout → terminate()
      node.ts             même cœur dans un contexte node:vm (tests uniquement)
    ts/
      core.ts             vérificateur TS partagé : config, liste des lib, prélude Equal/Expect,
                          LanguageService sur un système de fichiers virtuel, tests de types, transpile
      worker.ts           Web Worker TS (compilateur + lib .d.ts en ?raw), chargé à la demande
      client.ts           côté page : requêtes au worker TS (diagnostics, survol, katas de types)
      node.ts             même cœur côté Node (tests uniquement)
    contentCheck.ts       vérification des extraits (tests uniquement)
    *.test.ts             suite `npm test`
  data/                   TOUT le contenu (types.ts décrit les règles)
    quiz.ts pieges.ts katas.ts flashcards.ts lexique.ts entretien.ts cours.ts cheatsheet.ts
    coursAlgo.ts          section « Algorithmique » du cours (Big O et motifs, ancres #cours/algo-…)
    katasAlgo.ts          katas algorithmiques (catégorie « algo »), fusionnés dans katas.ts
    *Ts.ts                contenu TypeScript (coursTs, quizTs, piegesTs, katasTs, flashcardsTs,
                          lexiqueTs, entretienTs, cheatsheetTs, playgroundTs), fusionné de même
  pages/                  une page par route
  components/             ui, éditeur CodeMirror, console, texte enrichi
scripts/run-snippet.ts    affiche la sortie exacte d'un extrait (même bac à sable que les tests)
scripts/ts-snippet.ts     extrait TS : diagnostics, types inférés, sortie (même vérificateur que les tests)
```

Routes : `#accueil`, `#methode`, `#cours/<theme>`, `#lexique`, `#cheatsheet`, `#pieges`,
`#playground`, `#katas/<id>`, `#quiz`, `#flashcards`, `#entretien`.

## Exécution du code (playground et katas)

Le code tourne dans un Web Worker neuf à chaque exécution, évalué comme une balise `<script>`
non stricte (`var` global, `this === globalThis`, alias `window`). La console capture
`log/info/warn/error/...` dans l'ordre, les minuteurs sont suivis et l'exécution attend qu'il
n'en reste plus (3 s maximum), les erreurs non attrapées et les rejets non gérés sont affichés.
Au-delà de 5 s, le worker est terminé et la console affiche « Timeout » : une boucle infinie ne
gèle pas l'onglet. Un `await` au niveau supérieur est accepté.

### TypeScript

Le compilateur officiel (paquet `typescript`, version JS) tourne dans un **worker dédié**, chargé
seulement quand une page ou un éditeur passe en TypeScript : il n'alourdit pas le bundle principal
(chunk séparé de quelques Mo, mis en cache). Configuration unique, partagée avec les tests
(`src/lib/ts/core.ts`) : `strict: true`, target ES2022, lib `es2022` + `dom`, chaque fichier est un
module, aucun `@types` externe. Le worker rend les diagnostics (ligne, colonne, code, message) et les
infobulles de type ; le code est ensuite transpilé (`ts.transpileModule`, types effacés) et exécuté
dans le bac à sable JS habituel. Comme `tsc`, une erreur de type n'empêche pas l'exécution.

## Vérification du contenu (`npm test`)

Les tests rejouent le contenu dans Node avec **le même cœur** que le worker (`runtime.ts`) :

- chaque question de quiz `output` : la sortie réelle doit être exactement `choices[answer]`, et
  aucun autre choix ;
- chaque piège : sortie exacte (`output`), y compris après les minuteurs et microtâches ;
- chaque kata : la solution de référence passe tous les tests cachés, et le code de départ en
  échoue au moins un (sinon les tests ne vérifient rien) ;
- chaque extrait du cours, de la cheatsheet, des flashcards, du lexique et de l'entretien : sortie
  exacte s'il affiche quelque chose, valeurs des commentaires `// →` vérifiées, aucune erreur
  inattendue ; les extraits non exécutables (DOM, modules, JSX) sont marqués `run: false` et ne
  peuvent alors rien affirmer ;
- chaque extrait TypeScript (`lang: 'ts'`) : **0 diagnostic** du compilateur (erreurs voulues
  marquées `// @ts-expect-error`, que TypeScript signale si la ligne ne contient pas d'erreur),
  affirmations de type `type R = … // → T` vérifiées par `Expect<Equal<R, T>>`, puis exécution du
  JS transpilé comme ci-dessus ;
- chaque question `compile` : l'ensemble des lignes réellement en erreur est celui de la bonne
  réponse, et d'aucune autre ; chaque question `type` : seule la bonne réponse est `Equal` au type
  demandé, et tous les choix sont des types valides ;
- chaque kata TypeScript : la solution compile en mode strict et passe ses tests de types
  (`typeTests`) et d'exécution ; le code de départ compile mais échoue à au moins un test ;
- le vérificateur lui-même (`tscheck.test.ts`) : une affirmation fausse échoue, `Equal` distingue
  `any`/`unknown`, `?`/`| undefined`, `readonly` ; pas de types Node ; options par extrait…
- la structure : identifiants uniques, thèmes valides, réponses dans les bornes, renvois du lexique.

Ce qui n'est pas vérifié par machine : la justesse des explications en prose, et les extraits
`run: false` (DOM, modules réels, JSX et imports de frameworks dans le cours TypeScript).

Les messages d'erreur attendus suivent la formulation de **V8** (Chrome, Edge, Node). Firefox et
Safari formulent certains messages différemment.

## Ajouter du contenu

Lire d'abord l'en-tête de `src/data/types.ts` (règles de vérification). Écrire l'extrait, obtenir
sa sortie réelle avec `npx tsx scripts/run-snippet.ts`, comprendre pourquoi elle est ce qu'elle
est, puis lancer `npm test`.

**Une question de quiz** (`src/data/quiz.ts`) :

```ts
{
  id: 'q87', theme: 'types', kind: 'output',
  q: "Qu'affiche ce code ?",
  code: `console.log(typeof null)`,
  choices: ['null', 'object', 'undefined'],
  answer: 1,   // la sortie réelle doit être exactement choices[1]
  why: "`typeof null` vaut `'object'` : un héritage de la première implémentation du langage.",
}
```

**Un kata** (`src/data/katas.ts` pour un utilitaire JS, `src/data/katasAlgo.ts` pour un exercice
algorithmique) : `category` (`'utilitaire'` ou `'algo'`, qui alimente le filtre de la page), `statement`, `starter` (doit échouer), `solution`, et des
`tests` dont le `code` est le corps d'une fonction async exécutée après le code du candidat, avec
les aides `assert`, `assertEqual` (égalité profonde), `assertThrows` et `sleep` :

```ts
tests: [
  { name: 'découpe en paquets de 2', code: `assertEqual(chunk([1, 2, 3], 2), [[1, 2], [3]])` },
  { name: 'tableau vide', code: `assertEqual(chunk([], 3), [])` },
  { name: 'taille invalide', code: `assertThrows(() => chunk([1], 0))` },
]
```

Attention à l'insertion automatique de points-virgules : une ligne `// →` qui commence par `[` ou
`(` se colle à la ligne précédente. Terminer la ligne précédente par `;` (avant le commentaire).

Pour les tests liés au temps (debounce, throttle, retry), prévoir des marges larges (environ
trois fois le délai) et ne jamais vérifier de borne haute serrée.

### Contenu TypeScript

Ajouter `lang: 'ts'` à l'extrait (cours, flashcard, lexique, entretien, cheatsheet, piège) et obtenir
diagnostics et types réels avec `npx tsx scripts/ts-snippet.ts`. Conventions :

```ts
type User = { id: number; name: string; email?: string }

// affirmation de type, vérifiée par Expect<Equal<Keys, …>>
type Keys = keyof User // → 'id' | 'name' | 'email'
// la même chose, écrite explicitement
type _t = Expect<Equal<Omit<User, 'email'>, { id: number; name: string }>>

// @ts-expect-error : l'erreur est voulue (et doit exister)
const u: User = { id: 1 }

// valeur d'exécution, comme en JS
const ns = [1, 2]
ns.length // → 2
```

- `// @noUncheckedIndexedAccess: true` (ou `exactOptionalPropertyTypes`, `strictNullChecks`…) sur
  une ligne : option du compilateur propre à l'extrait ;
- `// @filename: legacy.d.ts` : extrait sur plusieurs fichiers (vérifié, non exécuté) ;
- `run: false` n'est accepté en TS que dans les sous-parties « frameworks » du cours (`ts-react`,
  `ts-vue`, `ts-angular`) ;
- quiz `compile` : les choix commencent par « Compile » ou « Erreur ligne N » / « Erreurs lignes
  N et M » ; quiz `type` : un champ `target` (`typeof x`, `R`) et des choix qui sont des types ;
- kata TS : `lang: 'ts'`, `category: 'ts'`, des `typeTests` (lignes `Expect<Equal<…>>` ou
  `// @ts-expect-error`, ajoutées après le code du candidat) et/ou des `tests` d'exécution en JS.

## Contribuer

Les contributions sont bienvenues, en particulier de nouvelles questions, de nouveaux pièges et
de nouveaux katas.

1. Forker le dépôt et créer une branche.
2. Ajouter le contenu dans `src/data/` en suivant les règles de `src/data/types.ts` et les
   exemples de la section « Ajouter du contenu » ci-dessus (identifiant unique, thème existant,
   sortie obtenue avec `npx tsx scripts/run-snippet.ts`).
3. Lancer `npm test` et `npm run build` : les deux doivent passer.
4. Ouvrir une pull request en expliquant ce que le contenu apporte.

Pour signaler une erreur dans une explication, ouvrir une issue avec l'identifiant de l'élément
concerné (par exemple `q87`) et la correction proposée, idéalement avec une source (MDN,
spécification ECMAScript).

## Licence

[MIT](LICENSE)
