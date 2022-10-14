Solids Reaktivität ist synchron, was bedeutet, dass das DOM in der nächsten Zeile nach einer Änderung bereits aktualisiert wurde. Und meistens ist das so auch genau richtig, da Solids granulares Rendering nur eine Weiterleitung der Aktualisierungen im reaktiven System ist. Unzusammenhängende Änderungen, die etwas zweimal rendern, sind nicht notwendigerweise verschwendete Arbeit.

Aber was, wenn die Änderungen zusammengehören? Solids `batch`-Helfer erlaubt es uns, mehrere Änderungen zu sammeln, um sie dann alle zusammen auszuführen, bevor die Beobachter benachrichtigt werden.

In diesem Beispiel weisen wir beide Namen beim Klick auf den Button zu und das löst das aktualisierende Rendering zweimal aus. Man kann die Log-Einträge in der Konsole sehen, wenn man den Button drückt. Also packen wir die `set`-Aufrufe in ein `batch`.

```js
 const updateNames = () => {
    console.log("Button Clicked");
    batch(() => {
      setFirstName(firstName() + "n");
      setLastName(lastName() + "!");
    })
  }
```
Und das war’s schon. Jetzt aktualisieren wir nur einmal für beide Änderungen.
