# Introduction

Ce guide interactif vous guidera à travers les principales fonctionnalités de Solid. Vous pouvez également vous référer à l'API et aux guides pour en savoir plus sur le fonctionnement de Solid.

Vous pouvez également consulter notre nouveau tutoriel pour débutant (en construction!) [ici](https://docs.solidjs.com/tutorials/getting-started-with-solid/).

# C'est quoi Solid ?

Solid est un framework JavaScript pour créer des applications web interactives.
Avec Solid, vous pouvez utiliser vos connaissances HTML et JavaScript existantes pour créer des composants qui peuvent être réutilisés dans votre application.
Solid fournit les outils pour améliorer vos composants avec de la _réactivité_ : code JavaScript déclaratif qui relie l'interface utilisateur aux données qu'elle utilise et crée.

# Anatomie d'une application Solid

Une application Solid est composée de fonctions que nous appelons des composants. Jetez un œil à la fonction `HelloWorld` sur la droite : elle renvoie directement une `div` ! Ce mélange d'HTML et de JavaScript s'appelle JSX. Solid est livré avec un compilateur qui transforme ultérieurement ces balises en nœuds pour le DOM.

JSX vous permet d'utiliser la plupart des éléments HTML dans notre application, mais il vous permet également de créer de nouveaux éléments. Une fois que nous avons déclaré notre fonction `HelloWorld`, nous pouvons l'utiliser comme balise `<HelloWorld>` dans toute notre application.

Le point d'entrée de toute application Solid est la fonction `render`. Elle prend 2 arguments, une fonction enveloppant notre code et un élément existant dans l'HTML où l'on va monter l'application:

```jsx
render(() => <HelloWorld />, document.getElementById("app"));
```

# Tirer parti de ce tutoriel

Chaque leçon de ce tutoriel présente une fonctionnalité de Solid et un scénario pour l'essayer. À tout moment, vous pouvez cliquer sur le bouton "solve" pour voir la solution ou sur "reset" pour recommencer. L'éditeur de code lui-même possède une console et un onglet de sortie où vous pouvez voir la sortie compilée générée par votre code. Regardez-le si vous êtes curieux de voir comment Solid génère du code.

Amusez-vous bien !
