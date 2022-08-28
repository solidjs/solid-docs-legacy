Context est un outil formidable pour les Stores. Il gère l'injection, lie la propriété au graphe réactif, gère automatiquement l'élimination et n'a pas de surcharge de rendu étant donné la finesse du rendu de Solid.

Parfois, un `Context` est excessif, cependant ; une alternative est d'utiliser le système réactif directement. Par exemple, nous pouvons construire un Store de données réactif global en créant un Signal dans une portée globale, et en l'exportant pour que les autres modules puissent l'utiliser:

```js
import { createSignal } from 'solid-js';
export default createSignal(0);

// Dans un autre fichier:
import counter from './counter';
const [count, setCount] = counter;
```

La réactivité de Solid est un concept universel. Peu importe qu'il s'agisse de composants internes ou externes. Il n'y a pas de concept distinct pour l'état global ou local. C'est la même chose.

La seule restriction est que tous les calculs (Effets/Mémos) doivent être créés sous une racine réactive (`createRoot`). Le `render` de Solid le fait automatiquement.

Dans ce tutoriel, `counter.tsx` est un tel Store global. Nous pouvons l'utiliser en modifiant notre composant dans `main.tsx` en:

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

Ainsi, lorsque vous utilisez vos propres Stores globaux plus compliqués qui contiennent des calculs, veillez à créer une racine. Ou mieux encore, faites-vous une faveur et utilisez simplement Context.
