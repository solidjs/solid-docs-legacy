Solid fournit une API de contexte pour transmettre des données sans compter sur le passage de props. Ceci est utile pour partager des Signaux et des Stores. L'utilisation de Context a l'avantage d'être créée dans le cadre du système réactif et gérée par celui-ci.

Pour commencer, nous créons un objet Context. Cet objet contient un composant `Provider` utilisé pour injecter nos données. Cependant, il est courant d'encapsuler les composants `Provider` et les consommateurs `useContext` avec des versions déjà configurées pour le contexte spécifique.

Et c'est exactement ce que nous avons dans ce tutoriel. Vous pouvez voir la définition d'un Store simple pour notre compteur dans le fichier `counter.tsx`.

Pour utiliser le contexte, encapsulons d'abord notre composant `App` pour le fournir globalement. Nous utiliserons notre `CounterProvider` enveloppé. Dans ce cas, donnons-lui une valeur initiale de `1` pour `count`.

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

Ensuite, nous devons consommer le contexte du compteur dans notre composant `nested.tsx`. Pour ce faire, nous utilisons le consommateur enveloppé `useCounter`.

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```