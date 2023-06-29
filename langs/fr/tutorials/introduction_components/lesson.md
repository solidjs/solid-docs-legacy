Au fur et à mesure que vous créez vos applications, vous souhaiterez décomposer votre code pour une meilleure modularité et réutilisabilité. Dans Solid, la principale façon de le faire est de créer des composants (ou en anglais, des _components_).

Les composants ne sont que des fonctions comme `HelloWorld()` que nous avons utilisée jusqu'à présent. Ce qui les rend spéciaux, c'est qu'ils renvoient généralement du JSX et peuvent être appelés avec du JSX dans d'autres composants.

Dans cet exemple, ajoutons notre composant `Paragraphe` à notre application. Nous l'avons défini dans un autre fichier, bien que vous puissiez mettre plusieurs composants dans le même fichier. Il faut d'abord l'importer:

```js
import Paragraphe from "./paragraphe";
```

Ensuite, nous devons ajouter le composant à notre JSX. Comme avant, nous avons maintenant plusieurs éléments que nous voulons renvoyer, nous les enveloppons donc dans un "Fragment":

```jsx
function App() {
  return (
    <>
      <h1>Ceci est un Titre</h1>
      <Paragraphe />
    </>
  );
}
```

Lors du premier rendu du composant parent, il exécutera la fonction `Paragraphe()` et ne l'appellera plus jamais. Toutes les mises à jour sont appliquées par le système de réactivité de Solid que nous aborderons dans les prochaines leçons.
