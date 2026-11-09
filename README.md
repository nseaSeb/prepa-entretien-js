# Prépa entretien JavaScript

Application web pour préparer un entretien technique JavaScript (front-end) : cours, quiz,
pièges, katas de live coding et algorithmique. Tout le contenu est en français et **vérifié par
des tests** : chaque sortie affichée, chaque réponse de quiz et chaque solution de kata est
rejouée automatiquement.

Frontend uniquement, sans backend ni compte : la progression est stockée dans le `localStorage`
du navigateur.

## Fonctionnalités

- **Cours** par thème (types et coercition, portée et closures, `this`, prototypes, asynchrone et
  event loop, tableaux et objets, modules, DOM et événements, performance, bases du web…) et une section
  **algorithmique** (Big O, motifs classiques) ;
- **Quiz** « qu'affiche ce code ? » et questions de cours, avec explication de chaque réponse ;
- **Pièges** du langage, avec sortie exacte ;
- **Playground** : éditeur CodeMirror et console qui exécute le code dans un Web Worker isolé ;
- **Katas** de live coding (utilitaires JS et algorithmique) avec tests cachés, code de départ
  et solution de référence ;
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
    contentCheck.ts       vérification des extraits (tests uniquement)
    *.test.ts             suite `npm test`
  data/                   TOUT le contenu (types.ts décrit les règles)
    quiz.ts pieges.ts katas.ts flashcards.ts lexique.ts entretien.ts cours.ts cheatsheet.ts
    coursAlgo.ts          section « Algorithmique » du cours (Big O et motifs, ancres #cours/algo-…)
    katasAlgo.ts          katas algorithmiques (catégorie « algo »), fusionnés dans katas.ts
  pages/                  une page par route
  components/             ui, éditeur CodeMirror, console, texte enrichi
scripts/run-snippet.ts    affiche la sortie exacte d'un extrait (même bac à sable que les tests)
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
- la structure : identifiants uniques, thèmes valides, réponses dans les bornes, renvois du lexique.

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
