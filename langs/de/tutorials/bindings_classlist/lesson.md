Solid verwendet `class`, um die `className`-Eigenschaft eines Elements zu setzen. Allerdings ist es häufig bequem, Klassen abhängig von Bedingungen zu setzen. Aus diesem Grund hat Solid ein eingebautes `classList`-JSX-Attribut, das ein Objekt entgegennimmt, bei dem die Schlüssel die Klassennamen und die Werte Boolesche Ausdrücke sind. Wenn ein Wert nach wahr auswertet, wird die Klasse gesetzt, ansonsten entfernt.

Im Beispiel können wir folgendes:

```jsx
<button
  class={current() === 'foo' ? 'selected' : ''}
  onClick={() => setCurrent('foo')}
>foo</button>
```

ersetzen mit:

```jsx
<button
  classList={{selected: current() === 'foo'}}
  onClick={() => setCurrent('foo')}
>foo</button>
```

Hinweis: Klassennamen kann man auch dynamisch setzen, etwa solche importiert aus CSS-Modulen:

```jsx
import { active } from "./style.module.css"

<div classList={{ [active]: isActive() }} />
```
