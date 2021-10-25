---
title: FAQ
description: Foire aux questions de la communauté.
sort: 5
---

# FAQ

### 1. JSX sans VDOM ? Est-ce que cela n’est pas juste un concept ? J’ai entendu des personnalités comme des auteurs d’autres frameworks dire que c’était impossible.

C’est possible quand nous n’utilisons pas le modèle de mise à jour de React. JSX est un Template DSL comme les autres. Juste un qui est plus flexible sur certains points. Insérer du JavaScript de manière arbitraire peut être un vrai challenge dans certains cas, mais n’est pas différent de supporté les opérateurs spread. Donc non, ce n’est pas juste un concept, mais une approche qui a été prouvé d’être l’un des plus performants.

Le vrai atout vient de l’extensibilité possible. Vous avez le compilateur qui travail pour vous en vous donnant des mises à jour du DOM natifs optimaux, mais vous avez toute la liberté d’une librairie comme React pour écrire des composants en utilisant des techniques de props de rendu et des composants d'ordre supérieur en complément de vos "hooks" réactifs. Vous n’aimez pas le flux de contrôle de Solid ? Écrivez-les vous-même.

### 2. Comment se fait-il que Solid soit aussi performant ?

Nous aurions aimé pouvoir donner une seule raison, mais la réalité est que cela vient surtout d’une combinaison de plusieurs décisions de design importantes :

1. Réactivité explicite pour que seulement les choses qui ont besoin d’être réactive soit traqué.
2. Compile avec la création initiale en tête. Solid utilise un processus heuristique pour réduire la granularité et réduire ainsi le nombre de calculs fait tout en gardant les mises à jour clés flexible et performante.
3. Les expressions réactives sont juste des fonctions. Cela permet d'avoir des composants qui "disparaissent" avec des évaluations faignante de prop qui retire l’enrobage inutile synchronisation non utilisé.

Ce sont actuellement ces techniques uniques combinés qui donne à Solid un avantage par rapport à la compétition.

### 3. Est-ce qu’il y a un React-Compat ?

Non. Et il se pourrait qu’il n’y en aura jamais. Bien que l’API soit similaire et les composants peuvent souvent être converti avec des ajustements mineurs, le système de mise à jour est fondamentalement différent. Les composants de React s’exécute encore et encore donc le code en dehors de Hooks fonctionnent très différemment. Les closures et les règles de hook ne sont pas seulement inutile, mais elles peuvent être utilisées d’une manière qui ne fonctionne pas dans notre cas.

D’autre part, Vue-compat est complètement faisable. Même s’il n’y a pas de plan de l’implémenter actuellement.

### 4. Pourquoi la déstructuration ne fonctionne pas ? Je comprends que je peux régler le problème en enrobant un composant entier dans une fonction.

La réactivité s’exécute lors de l’accès d’une propriété sur les objets Prop et Store. Les référencés en dehors de cette association ou d’un calcul réactif ne permet pas de les traqués. La déstructuration est parfaitement supportée à l’intérieur.

Cependant, enrobé un composant entier dans une fonction n’est pas ce que l’on voudrait faire sans réfléchir. Solid n’a pas de VDOM. Donc n’importe quel changement traqué va réexécuter la fonction entière en recréant tout son contenu. Ne faites pas ça.

### 5. Pouvez-vous ajouter les composants classe ? Je trouve que le cycle de vie sont plus facile à comprendre

Nous n’avons aucune intention d’ajouter les composants classe. Le cycle de vie de Solid est lié à la planification de son système réactive et est artificielle. Théoriquement, vous pouvez créer des classes en dehors de ce système, mais l’efficacité de tout le code qui n’est pas une gestion d’évènements est basiquement exécuté dans le constructeur, en incluant une fonction de rendue. Cela représente juste plus de syntaxe pour moins de contrôle.

Groupez vos données et leurs comportements ensemble plutôt que dans le cycle de vie. C’est une bonne pratiquée du système de réactivité qui a fonctionné depuis plusieurs décennies.

### 6. Je déteste vraiment JSX, puis-je utilise un Template DSL ? Ah, je vois que les Tagged Template Literals/HyperScript sont supporté. Peut-être que j’utiliserai cela...

Stop, arrêtez-vous tout de suite. Nous utilisons JSX de la même manière que Svelte utilise son template, pour créer des instructions de DOM optimales. Les Tagged Template Literals et HyperScript peuvent être impressionnante de leur propre façon, mais sauf si vous avez de vraie raison comme la contrainte de ne pas utiliser de build, les Tagged Template Literals et HyperScript son inférieur en tout point. Des bundles plus grand, des performances plus lentes et un besoin de manuellement enrober les valeurs avec des solutions de contournement.

C’est bien d’avoir des options, mais le JSX de Solid est vraiment la meilleure solution dans notre cas. Un Template DSL serait super aussi, quoique plus restrictif, mais JSX nous donne tellement sans effort supplémentaire. TypeScript, Parsers existant, coloration syntaxique, TypeScript, Prettier, complétion de code et le meilleur pour la fin, TypeScript.

Les autres librairies ont ajouté le support pour ses fonctionnalités, mais cela représente un effort considérable et est encore imparfait et un problème constant de maintenance. C’est vraiment prendre une position pragmatique.

### 7. Quand j'utilise un Signal au lieu d’un Store ? Pourquoi la différence ?

Les Stores enrobent automatiquement les valeurs imbriquées les rendant idéal pour des structures de données imbriquées, et pour des choses comme des modèles. Pour la plupart des autres cas, les Signaux sont légers et font le travail à la perfection.

Autant, nous aurions aimé les fusionner, mais il est impossible de proxy une primitive. Les fonctions sont l’interface la plus simple et n’importe quelle expression réactive (incluant l’accès au state) peuvent être enrobé dans une fonction ce qui fourni un APi universelle. Vous pouvez nommer vos signaux et vos états comme bon vous semble et ils resteront minimales. La dernière chose que nous voulons est de vous forcer à écrire `.get()`, `.set()` ou encore pire `.value`. Au moins, le premier peut être alias pour être plus bref, alors que le dernier est juste la forme le moins compact d’appeler une fonction.

### 8. Pourquoi je ne peux pas assigner une valeur au Store de Solid comme je peux dans Vue, Svelte ou MobX ? Où est la liaison de données bidirectionnelle ?

La réactivité est un outil très puissant, mais aussi très dangereux. MobX le sait et introduit un mode Strict et les Actions pour limiter où/quand la mise à jour se fait. Solid gère ce problème avec un arbre entier de données de composant, cela devient apparent que nous pouvons tirer quelques leçons de React. Vous n’avez pas besoin de vraiment être immuable tant que vous fournissez une façon d’avoir le même contrat.

Être capable de donner la possibilité de mettre à jour le state est beaucoup plus important que de décider de passer un state. Donc, être capable de les séparer est important et seulement possible si la lecture est immuable. Nous n’avons aussi pas besoin de payer le coût de l’immuabilité si nous pouvons encore mise à jour de manière précise. Heureusement, il existe des tonnes d’options venant d’anciennes solutions comme ImmutableJS et Immer. Ironiquement, Solid agit globalement comme un Immer inversé avec ses mutables en interne et son interface immuable.

### 9. Puis-je utiliser le système de réactivité de Solid tout seul ?

Bien sûr. Bien que nous n’avons pas exporté un package séparé, il est totalement possible d’installer Solid sans le compilateur et juste utiliser les primitives réactives. Un des avantages de la réactivité granulaire est que ce n’est pas dépendant d’une librairie. Pour cela, presque toutes les librairies réactives fonctionne de la même cette manière. C’est cela qui a inspiré [Solid](https://github.com/solidjs/solid) et sa librairie sous-jacente, [librairie DOM Expressions](https://github.com/ryansolid/dom-expressions), de faire un rendu purement basé sur le système de réactivité.

Pour lister quelques essaies: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github.com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https://github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous), et même récemment [Vue](https://github.com/vuejs/vue). Bien plus est requise dans une librairie réactive que de le marquer dans le moteur de rendu comme, [lit-html](https://github.com/Polymer/lit-html) par exemple.

### 10. Est-ce que Solid a un équivalent des librairies Next.js ou Material Components que je peux utiliser ?

Pas à ce que l’on sache. Si vous êtes intéressé d’en construire une, nous sommes disponibles sur notre [Discord](https://discord.com/invite/solidjs) pour vous aider. Nous avons les fondamentaux et avons juste besoin de les construire.