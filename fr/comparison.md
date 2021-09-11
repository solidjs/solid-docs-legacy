---
title: Comparaison
description: Comparaison de Solid avec les autres frameworks.
sort: 1
---

---

# Comparaison avec les autres librairies

Cette section sera implicitement biaisée, mais je pense qu’il est important de comprendre où Solid se situe comparé aux autres librairies. Ce n’est pas une question de performance. Pour un aperçu complet des performances, vous pouvez vous référer au [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark)

## React

React a eu une grande influence sur Solid. Son flux unidirectionnel et sa séparation explicite de lecture et écriture dans l’API des Hooks ont influencé l’API de Solid bien plus que l’objectif d’être juste une "librairie de Rendu" au lieu d’un framework. Solid possède des opinions bien arrêtées sur la manière d’approcher la gestion des données dans le développement d’application, mais ne cherche pas à contraindre dans son exécution.

Bien que Solid s’aligne sur la philosophie de React, Solid fonctionne fondamentalement différemment. React utilise un Virtual DOM alors que Solid non. L’abstraction de React est une approche des composants du haut vers le bas en appelant les méthodes de rendu de manière répéter en ensuite en faisant une différence.
Solid calcule le rendu de chaque template une fois dans son ensemble, en construisant une graphique de ses réactivités et n’exécuté seulement les instructions liées aux changements détectés.

### Conseil de migration:

La modèle de mise à jour de Solid n’a rien à voir avec React, ou même React + MobX. À la place de penser aux fonctions composantes comme des fonctions de rendue, il faut les considérer comme des constructeurs. Faites attention à la décomposition ou l’accès prématuré des propriétés réactive. Les primitives de Solid n’ont pas de restrictions comme les Hook donc nous sommes libre de les imbriqué comme bon vous semble. Vous n’avez pas besoin de clés explicites sur les lignes d’une liste pour avec le comportement "keyed" des autres frameworks. Enfin, il n'y a pas de VDOM (Virtual DOM), donc les opérations sur l’API VDOM comme `React.Children` ou `React.cloneElement` n'ont pas de sens. Il est encouragé de trouver différent moyen de résoudre ces problèmes en utilisant qui utilise une approche plus déclarative.

## Vue

Solid n’est pas particulièrement influencé par Vue d’un point de vue design, mais ils utilisent tous les deux des approches comparables. Les deux frameworks utilisent les Proxies dans leurs systèmes de réactivité avec de l’auto-traçabilité basée sur la lecture. Mais c’est là que les similarités s’arrêtent. La détection de dépendances se base sur une approche utilisant un Virtual DOM et un système de composant alors que Solid gardent un plus grand contrôle avec ses mises à jour directement dans sur le DOM.

Vue met en avant la facilité du framework là où Solid préfère une approche plus transparente. Bien que Vue s’aligne sur l’approche de Solid depuis Vue 3, ces librairies pourraient s’aligner de plus en plus avec le temps en fonction de leurs évolutions dans le futur.

### Conseil de migration:

Comme Vue 3 est une autre librairie réactive moderne, la migration devrait être familière. Les composants de Solid ressemble beaucoup à un marquage à la fin de Vue fonction `setup`. Faites attention à ne pas trop enrober vos dérivations d’état avec des calculs, essayer plutôt d’utiliser des fonctions. La réactivité est persuasive. Les proxies dans Solid sont intentionnellement en lecture seule. Ne jugez pas avant d’avoir essayé !

## Svelte

Svelte est le pionnier de l’approche pré-compilé qui permet au framework de disparaître, la même approche que Solid emploi de manière plus ou moins extensible. Les deux librairies sont vraiment réactives et peuvent produire de petit bundle de code d’exécution même si Svelte est le gagnant quand il s’agit de petite démo. Solid demande un peu plus d’explicité dans ses déclarations, se reposant moins sur l’analyse implicite du compilateur, mais cela fait partie des raisons qui permet les performances supérieures de Solid. Solid garde aussi plus de code d’exécution, ce qui permet de meilleure performance dans de larges applications. La démo RealWorld est 25 % plus petite que celle de Svelte.

Les deux librairies visent à aider les développeurs à écrire moins de code, mais avec une approche totalement différente. Svelte 3 se concentre sur l’optimisation de la facilité à des changements locaux en se concentrant sur des objets d’interaction simple et une liaison de données bidirectionnelle. Alors que Solid se concentre sur les flux de données en utilisant délibérément une approche CQRS et une interface immuable. Avec une composition de template fonctionnelle, dans beaucoup de cas, Solid permet aux développeurs d’écrire encore moins de code que Svelte même si la syntaxe de template de Svelte est définitivement plus compact.

### Conseil de migration:

L’expérience développeur est assez différente, bien que les choses soient analogues, c’est une expérience différente. Les composants dans Solid sont assez peu coûteux, donc n’ayez pas peur d’en avoir plus si besoin.

## Knockout.js

Cette librairie doit son existence à Knockout. La modernisation de son modèle pour la détection de dépendance était la motivation de ce projet. Knockout a été publié en 2010 et supportait Microsoft Explorer jusqu’à IE6, bien que Solid ne supporte pas du tout IE.

Les liaisons de données de Knockout ne sont que des chaînes de caractères dans le HTML et qui sont lu lors de l’exécution. Elles se reposent sur un système de clonage de contexte ($parent, etc.). Alors que Solid utilise JSX ou un système de Tagged Template Literals pour son système de templating en se reposant sur l’API JavaScript.

La plus grosse différence est que l’approche de Solid groupe les changements pour s’assurer de la synchronicité alors que Knockout possède `deferUpdates` qui utilise un report de microtask dans la queue.

### Conseil de migration:

Si vous avez utilisé Knockout, les primitives de Solid pourrait paraître étrange de prime abord. La séparation de la lecture et de l’écriture est intentionnelle et n’est pas là pour vous rendre la vie plus difficile. Essayer d’adopter une manière de réfléchir au Flux avec des state/action. Même si la librairie a l’air similaire, elles promouvaient différentes bonnes pratiques.

## Lit & LighterHTML

Ces librairies sont incroyablement similaires et ont eu une influence sur Solid. En majorité, car le code compilé généré par Solid utilise une méthode très similaire pour initialiser de manière performante le rendu du DOM. Cloner les éléments du template et utiliser des commentaires placeholders est un des points commun que Solid et ses librairies partagent.

La plus grosse différence est que bien que ces librairies n’utilise pas de Virtual DOM, elles traitent le rendu de la même manière, du haut vers le bas, en ayant besoin de partitionner les composants pour les rendre gérable. Alors que Solid utilise une approche de Graphique Réactif détaillée qui ne met à jour ce qui a été changé et partage ainsi cette technique avec pour le rendu initial. Cette approche tire avantage de la vitesse du rendu initial seulement disponible aux éléments natifs du DOM et est l’approche la plus performante pour les mises à jour.

### Conseil de migration:

Ces librairies sont très minimales et facile à utiliser. Cependant, garder en tête que `<Comp/>` n’est pas juste un HTMLElement (tableau ou fonction). Essayer de garder votre code dans le template JSX. Le hoisting fonctionne pour la majeure partie, mais il est préférable de penser à celui-ci en tant que librairie de rendue et pas un factory de HTMLElement.

## S.js

Cette librairie a eut la plus grosse influence sur le design du système de réactivité de Solid. Solid a utilisé S.js en interne pendant quelques années avant de diverger. S.js est une des librairies réactive le plus efficace à ce jour. Elle modélise tout sur des étapes en temps synchrone similaire à un circuit numérique et s’assure de la cohérence sans avoir à utiliser de mécanisme plus complexe que l’on peut retrouver dans MobX. Le système de réactivité de Solid est une sorte d’hybride entre S et MobX. Cela lui donne de meilleure performance que la plupart des librairies réactivent (Knockout, MobX, Vue) tout en gardant un modèle mental facile pour les développeurs. Finalement, S.js reste toujours la librairie de réactivité la plus performante même si la différence est presque imperceptible dans la grande majorité des cas.

## RxJS

RxJS est une librairie réactive. Même si Solid a une idée similaire des données Observable, son application du pattern Observer est très différent. Les Signaux sont comme de simple version d’un Observable (seulement le `next`), le pattern de détection automatique de dépendance supplante les centaines d’opérateurs de RxJS. Solid aurait pu adopter cette approche, et à d’ailleurs inclut des opérateurs similaires dans une version antérieure, mais dans la plupart des cas, il est plus simple d’écrire vos propres logiques de transformation dans un calcul. Là où les Observables sont démarrés à froid, monodiffusion et basé sur les push, beaucoup de problème sur le client se prête plutôt à un démarrage à chaud et ont besoin d’être multidiffusion ce qui est exactement le fonctionnement par défaut de Solid.

## Autres

Angular et d’autres librairies populaires sont absent dans cette comparaison dû à un manque d’expérience avec ces librairies qui ne permet pas de faire une comparaison adéquate. Généralement, Solid a très peu en commun avec les frameworks plus large et il est beaucoup plus dur de les comparer.