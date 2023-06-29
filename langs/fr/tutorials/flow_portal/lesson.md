Parfois, il est avantageux d'insérer des éléments en dehors du flow normal de l'application. Les index Z sont parfois insuffisants pour gérer les contextes de rendu d'éléments flottants tels que des Modals.

Solid a un composant `<Portal>` dont le contenu enfant sera inséré à l'emplacement de votre choix. Par défaut, ses éléments seront rendus dans un `<div>` dans `document.body`.

Dans cet exemple, nous voyons notre popup d'information se couper. Nous pouvons résoudre ce problème en le retirant du flow en enveloppant l'élément dans un `<Portal>`:

```jsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Un texte dont vous pourriez avoir besoin pour quelque chose ou autre.</p>
  </div>
</Portal>
```
