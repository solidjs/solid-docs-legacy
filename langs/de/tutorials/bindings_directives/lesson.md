Für benutzerdefinierte Direktiven hat Solid den `use:`-Namensraum. Das ist nur syntaktischer Zucker für `ref`, aber nützlich, da es typischen Bindungen gleicht und es mehrere solcher Bindungen auf dem gleichen Element geben kann, ohne dass dies zu Konflikten führt. Das macht es zu einem besseren Werkzeug für das Verhalten von wiederverwendbaren DOM-Elementen.

Eine benutzerdefinierte Direktive ist eine Funktion, die mit den Argumenten `(element, valueAccessor)` aufgerufen wird, wobei `element` das jeweilige DOM-Element mit dem `use:`-Attribut ist und `valueAccessor` eine Getter-Funktion für den Wert, der an das Attribut übergeben wird. Solange die Funktion importiert ist, kann man sie mit `use:` verwenden.

> Wichtig: `use:` wird vom Compiler transformiert und die Funktion muss dafür im Geltungsbereich sein, also kann es nicht Teil von Spread-Objekten sein, oder auf eine Komponente angewendet werden.

In diesem Beispiel erstellen wir einen einfachen Wrapper für ein Klick-außerhalb-Verhalten, um etwa einen Dialog zu schließen. Zuerst müssen wir die `clickOutside`-Direktive importieren und auf unserem Element anwenden:

```jsx
<div class="modal" use:clickOutside={() => setShow(false)}>
  Some Modal
</div>
```

In `click-outside.tsx` definieren wir nun unsere benutzerdefinierte Direktive. Diese Direktive erzeugt einen Klick-Handler, der an den body-Knoten gebunden und entfernt wird, wenn die Zeit gekommen ist:

```jsx
export default function clickOutside(el, accessor) {
  const onClick = (e) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
```

Jetzt sollte man in der Lage sein, zwischen Öffnen und Schließen des Dialogs hin und her zu springen.
