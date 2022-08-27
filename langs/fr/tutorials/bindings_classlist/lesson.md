Solid utilise `class` pour définir la propriété `className` sur un élément. Cependant, il est souvent pratique de définir des classes de manière conditionnelle. Pour cette raison, Solid a un attribut JSX intégré `classList` qui prend un objet où la clé est le(s) nom(s) de classe et la valeur est une expression booléenne. Si elle est vraie, la classe est appliquée, et si elle est fausse, elle est supprimée.

Dans cette exemple, on peut remplacer:

```jsx
<button
  class={current() === 'foo' ? 'selected' : ''}
  onClick={() => setCurrent('foo')}
>foo</button>
```

avec:

```jsx
<button
  classList={{selected: current() === 'foo'}}
  onClick={() => setCurrent('foo')}
>foo</button>
```

N'oubliez pas que vous pouvez également appliquer des noms de manière dynamique, comme c'est le cas dans les modules CSS:

```jsx
import { active } from "./style.module.css"

<div classList={{ [active]: isActive() }} />
```
