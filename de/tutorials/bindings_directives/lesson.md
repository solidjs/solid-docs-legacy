Solid unterstützt benutzerdefinierte Direktiven im `use:`-namespace. Das ist nur syntaktischer Zucker über `ref`, aber durchaus nützlich insofern, dass es typischen Bindings gleicht und es mehrere solcher Bindings auf dem gleichen Element geben kann, ohne dass dies zu Konflikten führt. Das macht es zu einem besseren Werkzeug für wiederverwendbare DOM-Verhalten.

Benutzerdefinierte Direktiven sind einfache Funktionen, die mit den Parametern `(element, valueAccessor)` aufgerufen werden, wobei `element` das jeweilige DOM-Element mit dem `use:`-Attribut ist und `valueAccessor` eine Getter-Funktion für den Wert, der an das `use:`-Attribut übergeben wird. So lange die Funktion importiert ist, kann man sie mit `use:` verwenden.

> Wichtig: `use:` wird vom Compiler als Transformations-Ziel erkannt und die Funktion muss dafür im Scope sein, also kann sie nicht Teil von spread-Props oder auf eine Komponente angewendet sein.

In diesem Beispiel machen wir einen einfachen Wrapper für ein Klick-außerhalb-Verhalten, um etwa einen Dialog zu schliessen. Zuerst müssen wir die `clickOutside`-Direktive zu unserem Element importieren:

```jsx
<div class="modal" use:clickOutside={() => setShow(false)}>
  Some Modal
</div>
```

In `click-outside.tsx` definieren wir nun unsere benutzerdefinierte Direktive. Diese Direktive erzeugt einen Klick-Handler, der an den body gebunden und am Schluss wieder aufgeräumt wird:

```jsx
export default function clickOutside(el, accessor) {
  const onClick = (e) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
```

Jetzt sollte man in der Lage sein, zwischen Öffnen und Schliessen des Dialogs hin und her zu springen.
