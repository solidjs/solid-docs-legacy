Solid unterstützt sowohl `class` als auch `className`, um die `className`-Eigenschaft eines Elements zu setzen. Allerdings ist es häufig bequemer, bestimmte Klassen fallweise zu setzen. Aus diesem Grund hat Solid ein eingebautes `classList`-JSX-Attribut, das ein Objekt entgegen nimmt, in dem unter den Klassennamen ein Boolean gespeichert ist. Wenn der Boolean wahr ist, wird die Klasse gesetzt, ansonsten entfernt.

In diesem Beispiel können wir folgendes ersetzen:

```jsx
<button
  class={current() === 'foo' ? 'selected' : ''}
  onClick={() => setCurrent('foo')}
>foo</button>
```

mit:

```jsx
<button
  classList={{selected: current() === 'foo'}}
  onClick={() => setCurrent('foo')}
>foo</button>
```

Hinweis: Klassennamen kann man auch dynamisch setzen, etwa aus CSS-Modulen:

```jsx
import { active } from "./style.module.css"

<div classList={{ [active]: isActive() }} />
```
