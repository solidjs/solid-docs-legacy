La balise `<Dynamic>` est utile lorsque vous effectuez un rendu à partir de données. Il vous permet de passer une chaîne de caractères pour un élément natif ou une fonction de composant et il effectuera le rendu avec le reste des props fournis.

C'est souvent plus compact que d'écrire un certain nombre de composants `<Show>` ou `<Switch>`.

Dans l'exemple, nous pouvons remplacer l'instruction `<Switch>`:

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

avec:

```jsx
<Dynamic component={options[selected()]} />
```
