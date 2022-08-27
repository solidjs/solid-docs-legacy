Solid prend en charge les directives personnalisées par le biais du namespace `use:`. Il s'agit juste d'un sucre syntaxique sur `ref`, mais il est utile dans la mesure où il ressemble aux liaisons typiques et où il peut y avoir plusieurs liaisons sur le même élément sans conflit. Cela en fait un meilleur outil pour le comportement réutilisable des éléments DOM.

Une directive personnalisée est une fonction prenant les arguments `(element, valueAccesor)`, où `element` est l'élément DOM avec l'attribut `use:`, et `valueAccessor` est une fonction getter pour la valeur assignée à l'attribut. Tant que la fonction est importée dans la portée, vous pouvez l'utiliser avec `use:`.

> Important: `use:` est détecté par le compilateur pour être transformé, et la fonction doit être dans la portée, donc elle ne peut pas faire partie des spreads ou être appliquée à un composant.

Dans l'exemple, nous allons créer un wrapper pour un comportement basique de click-outside pour fermer une popup ou un modal. Tout d'abord, nous devons importer et utiliser notre directive `clickOutside` sur notre élément:

```jsx
<div class="modal" use:clickOutside={() => setShow(false)}>
  Un Modal
</div>
```

Ouvrez `click-outside.tsx`, où nous allons définir notre directive personnalisée. Cette directive définit un handler de clics que nous lions au corps et que nous détruisons quand il est temps:

```jsx
export default function clickOutside(el, accessor) {
  const onClick = (e) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
```

Vous devriez maintenant être en mesure d'aller et venir entre l'ouverture et la fermeture du modal.
