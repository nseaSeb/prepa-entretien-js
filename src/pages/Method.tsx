import type { ReactNode } from 'react'
import { Callout, Card, Code, H2, P, PageHeader, C } from '../components/ui'
import { useNav } from '../lib/nav'

const TOC: [string, string][] = [
  ['etat-esprit', "1. L'état d'esprit"],
  ['voix-haute', '2. Penser à voix haute'],
  ['clarifier', '3. Clarifier avant de coder'],
  ['cas-limites', '4. Les cas limites'],
  ['complexite', '5. Parler complexité'],
  ['live-coding', '6. Dérouler un live coding'],
  ['expliquer', '7. Répondre à « explique-moi X »'],
  ['bloque', '8. Quand on bloque'],
  ['sortie', '9. Les questions « qu’affiche ce code ? »'],
  ['fin', "10. Finir l'entretien"],
]

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{n}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </li>
  )
}

function Say({ children }: { children: ReactNode }) {
  return <blockquote className="my-2 border-l-4 border-indigo-400 bg-indigo-50/60 px-4 py-2 text-[15px] text-slate-800 italic dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-slate-200">« {children} »</blockquote>
}

export default function Method() {
  const { go } = useNav()
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Méthode : aborder un entretien JavaScript"
        subtitle="Un entretien technique n'évalue pas seulement ce que tu sais, mais la façon dont tu raisonnes, communiques et réagis face à l'inconnu. Cette page donne une méthode reproductible pour les trois formats classiques : questions de cours, lecture de code et live coding."
      />

      <Card className="mb-8">
        <div className="mb-2 text-sm font-semibold text-slate-500">Sommaire</div>
        <div className="grid gap-1 sm:grid-cols-2">
          {TOC.map(([id, label]) => (
            <button key={id} onClick={() => go('methode', id)} className="text-left text-sm text-indigo-700 hover:underline dark:text-indigo-300">
              {label}
            </button>
          ))}
        </div>
      </Card>

      <H2 id="etat-esprit">1. L'état d'esprit</H2>
      <P>
        Le recruteur cherche avant tout à savoir s'il aura envie de travailler avec toi. Il observe ta façon de comprendre un problème, de le découper, de prendre en compte ses remarques et d'admettre ce que tu ne sais pas. Une solution imparfaite expliquée clairement vaut souvent mieux qu'une solution parfaite sortie en silence.
      </P>
      <P>
        Considère l'entretien comme une séance de travail à deux plutôt que comme un examen. Le recruteur est un collègue qui connaît la réponse : il peut t'aider si tu lui donnes l'occasion de le faire, c'est-à-dire si tu expliques où tu en es.
      </P>
      <Callout tone="tip" title="Les trois choses qu'on retient d'un bon candidat">
        Il a posé de bonnes questions avant de se lancer ; on comprenait ce qu'il faisait à chaque instant ; il a vérifié son code lui-même au lieu d'attendre qu'on lui signale les erreurs.
      </Callout>

      <H2 id="voix-haute">2. Penser à voix haute</H2>
      <P>
        Le silence est l'ennemi : au bout de trente secondes sans un mot, le recruteur ne sait plus si tu réfléchis, si tu bloques ou si tu es parti dans une mauvaise direction. Commente ce que tu fais et surtout <strong>pourquoi</strong> tu le fais. Il ne s'agit pas de lire ton code ligne par ligne, mais d'exposer tes intentions et tes hypothèses.
      </P>
      <Say>Je vais d'abord écrire une version simple qui marche, en O(n²), puis on verra si on peut l'améliorer avec une Map.</Say>
      <Say>Ici, j'hésite entre muter le tableau et en renvoyer une copie. Je pars sur une copie, pour éviter les effets de bord chez l'appelant.</Say>
      <P>Si tu as besoin de réfléchir en silence, annonce-le : « Laisse-moi trente secondes pour réfléchir à la structure. » C'est parfaitement accepté.</P>

      <H2 id="clarifier">3. Clarifier avant de coder</H2>
      <P>
        Un énoncé d'entretien est volontairement incomplet : le recruteur veut voir si tu poses les questions qu'un développeur expérimenté poserait. Reformule le problème avec tes mots, puis précise les entrées, les sorties et les contraintes. Écris un ou deux exemples concrets et fais-les valider : c'est le meilleur moyen de lever les ambiguïtés.
      </P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li>Quel est le type exact des entrées ? Peuvent-elles être vides, <C>null</C>, <C>undefined</C> ?</li>
        <li>Faut-il modifier l'entrée ou renvoyer une nouvelle valeur ?</li>
        <li>L'ordre du résultat a-t-il une importance ? Les doublons sont-ils possibles ?</li>
        <li>La fonction est-elle synchrone ou asynchrone ? Que se passe-t-il en cas d'erreur ?</li>
        <li>Quelle taille de données attend-on : dix éléments ou dix millions ?</li>
      </ul>
      <Say>Si je résume : je reçois un tableau de nombres, éventuellement vide, et je dois renvoyer un nouveau tableau sans doublons, dans l'ordre de première apparition. C'est bien ça ?</Say>

      <H2 id="cas-limites">4. Les cas limites</H2>
      <P>
        Citer les cas limites avant même d'écrire le code montre de la rigueur. Les plus fréquents en JavaScript sont liés aux types et aux valeurs particulières, qui piègent souvent les comparaisons et les conversions.
      </P>
      <div className="my-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Collections', 'tableau vide, un seul élément, tableaux imbriqués, trous dans un tableau, très grandes tailles'],
          ['Valeurs spéciales', 'null, undefined, NaN (NaN !== NaN), -0, chaîne vide, 0 (falsy mais valide)'],
          ['Objets', 'références partagées, références circulaires, clés héritées du prototype, Date, Map, Set'],
          ['Asynchrone', 'promesse rejetée, appels concurrents, ordre de résolution, délai dépassé, annulation'],
        ].map(([t, d]) => (
          <Card key={t}>
            <div className="font-semibold">{t}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</div>
          </Card>
        ))}
      </div>
      <Callout tone="warn" title="Le piège du « falsy »">
        Un test comme <C>if (!value)</C> rejette aussi <C>0</C> et la chaîne vide. Si ces valeurs sont légitimes, préfère <C>value == null</C> (vrai pour <C>null</C> et <C>undefined</C> seulement) ou l'opérateur <C>??</C>.
      </Callout>

      <H2 id="complexite">5. Parler complexité</H2>
      <P>
        Dès que tu as une solution, donne sa complexité en temps et en mémoire, sans attendre qu'on te la demande. Il n'est pas nécessaire d'être formel : identifier la boucle dominante suffit le plus souvent. Pense aussi aux coûts cachés des méthodes natives : <C>includes</C>, <C>indexOf</C>, <C>shift</C> ou <C>splice</C> parcourent le tableau, alors qu'un <C>Set</C> ou une <C>Map</C> répondent en temps constant en moyenne.
      </P>
      <Code
        run={false}
        title="O(n²) puis O(n) : la même idée, deux structures"
        code={`// O(n²) : includes parcourt le résultat à chaque tour
function uniqueSlow(arr) {
  const out = []
  for (const x of arr) if (!out.includes(x)) out.push(x)
  return out
}

// O(n) : le Set répond en temps constant (en moyenne)
const unique = (arr) => [...new Set(arr)]`}
      />
      <Say>Ma première version est en O(n²) à cause du includes dans la boucle. Avec un Set, on passe à O(n) en temps, au prix de O(n) en mémoire.</Say>
      <Callout tone="info" title="Réviser la complexité et les motifs classiques">
        La section <button className="font-semibold underline" onClick={() => go('cours', 'algo-big-o')}>Algorithmique du cours</button> reprend la notation Big O (tableau de croissance, coût des méthodes natives, calcul de la complexité d'une boucle ou d'une récursion) et les motifs à reconnaître dans un énoncé : table de hachage, deux pointeurs, fenêtre glissante, dichotomie, tris, backtracking, piles et files, arbres, graphes, programmation dynamique. Les katas de la catégorie « Algorithmique » permettent de les pratiquer.
      </Callout>

      <H2 id="live-coding">6. Dérouler un live coding</H2>
      <ol className="my-4 space-y-4">
        <Step n={1} title="Reformuler et donner un exemple">Reformule l'énoncé, écris un appel d'exemple avec le résultat attendu, et fais-le valider. Tu as maintenant un test.</Step>
        <Step n={2} title="Annoncer l'approche avant de coder">Décris l'algorithme en deux ou trois phrases, avec sa complexité. Si le recruteur voit un problème, il te le dira maintenant, pas après vingt minutes de code.</Step>
        <Step n={3} title="Écrire la version simple d'abord">Une solution naïve qui fonctionne est un filet de sécurité. On l'optimise ensuite, si le temps le permet et si c'est demandé.</Step>
        <Step n={4} title="Nommer clairement">Des noms explicites (<C>seen</C>, <C>result</C>, <C>timerId</C>) rendent le code lisible pour le recruteur et t'évitent de te perdre.</Step>
        <Step n={5} title="Tester à la main, puis en exécutant">Déroule ton exemple ligne par ligne en annonçant les valeurs des variables, puis les cas limites. Si un environnement d'exécution est disponible, lance le code.</Step>
        <Step n={6} title="Discuter des améliorations">Complexité, lisibilité, gestion d'erreurs, variantes (option leading/trailing pour un debounce, annulation pour un retry). Montre que tu sais ce que tu ferais avec plus de temps.</Step>
      </ol>
      <Callout tone="info" title="Entraîne-toi en conditions réelles">
        Les <button className="font-semibold underline" onClick={() => go('katas')}>katas</button> reprennent les exercices les plus demandés. Lance un chronomètre de 20 à 30 minutes, parle à voix haute (même seul), et ne regarde la solution qu'après avoir fait passer les tests ou épuisé le temps.
      </Callout>

      <H2 id="expliquer">7. Répondre à « explique-moi X »</H2>
      <P>
        Pour une question de cours (closure, event loop, <C>this</C>, prototype…), une structure en cinq temps évite à la fois la réponse trop courte et le monologue. Elle tient en une à deux minutes.
      </P>
      <ol className="my-4 space-y-4">
        <Step n={1} title="Une définition en une phrase">« Une closure, c'est une fonction qui garde accès aux variables de la portée où elle a été créée, même après la fin de l'exécution de cette portée. »</Step>
        <Step n={2} title="Un exemple minimal">Un compteur, un <C>makeAdder</C>… Un exemple vaut mieux qu'une définition abstraite, et montre que tu sais l'écrire.</Step>
        <Step n={3} title="À quoi ça sert concrètement">État privé, fabriques de fonctions, callbacks, debounce, hooks React qui capturent les props du rendu.</Step>
        <Step n={4} title="Le piège ou la limite">La boucle avec <C>var</C> et <C>setTimeout</C>, les closures obsolètes dans un <C>useEffect</C>, la mémoire retenue.</Step>
        <Step n={5} title="Un lien avec ton expérience">« Je l'ai rencontré quand… » : une phrase suffit, et c'est souvent ce qui fait la différence.</Step>
      </ol>
      <Code
        run
        title="L'exemple minimal à savoir écrire de tête"
        code={`function makeCounter() {
  let count = 0 // variable privée, capturée par la closure
  return () => ++count
}

const next = makeCounter()
next()
next()
console.log(next()) // 3`}
        showOutput={false}
      />

      <H2 id="bloque">8. Quand on bloque</H2>
      <P>
        Tout le monde bloque un jour en entretien ; ce qui compte, c'est la façon de s'en sortir. Dis où tu en es et ce qui te bloque précisément. Reviens à un exemple plus petit, résous-le à la main, et cherche le motif. Si tu ne connais pas une API, dis-le et propose une alternative : « Je ne me souviens plus de la signature exacte de <C>Array.from</C>, je vais utiliser une boucle et je vérifierai ensuite. »
      </P>
      <P>
        Un indice du recruteur n'est pas un échec : le prendre au vol et l'exploiter montre justement ta capacité à travailler en équipe. Ce qui est mal perçu, c'est de s'obstiner en silence ou d'inventer une réponse avec aplomb.
      </P>
      <Say>Je ne suis pas sûr de l'ordre exact entre ces deux callbacks. Mon raisonnement : le then est une microtâche, il passe avant le setTimeout qui est une macrotâche. Je vérifierais en l'exécutant.</Say>

      <H2 id="sortie">9. Les questions « qu'affiche ce code ? »</H2>
      <P>
        Ces questions testent ta compréhension du moteur. Ne réponds pas au feeling : déroule l'exécution comme le ferait le moteur, en annonçant chaque étape. Quatre réflexes couvrent la grande majorité des cas.
      </P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li><strong>Hoisting et TDZ</strong> : quelles déclarations sont remontées ? <C>var</C> vaut <C>undefined</C> avant son affectation, <C>let</C> et <C>const</C> lèvent une <C>ReferenceError</C>.</li>
        <li><strong>this</strong> : regarde comment la fonction est appelée, pas où elle est définie (sauf pour les fonctions fléchées).</li>
        <li><strong>Coercition</strong> : <C>+</C> avec une chaîne concatène, les autres opérateurs arithmétiques convertissent en nombre, <C>==</C> applique ses propres règles.</li>
        <li><strong>Event loop</strong> : tout le code synchrone, puis toutes les microtâches (promesses, <C>await</C>), puis une macrotâche (<C>setTimeout</C>), puis de nouveau les microtâches.</li>
      </ul>
      <Callout tone="tip" title="Pour t'entraîner">
        Le catalogue des <button className="font-semibold underline" onClick={() => go('pieges')}>pièges</button> et les questions « Que renvoie ? » de l'<button className="font-semibold underline" onClick={() => go('quiz')}>auto-évaluation</button> reprennent les grands classiques, avec des sorties vérifiées automatiquement.
      </Callout>

      <H2 id="fin">10. Finir l'entretien</H2>
      <P>
        Prépare deux ou trois questions sincères : l'organisation de l'équipe, la façon dont le code est relu et testé, la dette technique, ce qu'on attend de toi dans les trois premiers mois. Elles montrent que tu te projettes dans le poste.
      </P>
      <P>
        Si une question t'a échappé, tu peux y revenir à la fin : « Je repensais à la question sur le prototype, je voudrais préciser ma réponse. » C'est un signal très positif de rigueur et d'honnêteté.
      </P>
    </div>
  )
}
