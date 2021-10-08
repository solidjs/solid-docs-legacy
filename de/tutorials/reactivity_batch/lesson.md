Solids Reaktivität ist synchron, was bedeutet, dass das DOM in der nächsten Zeile nach eine Änderung bereits aktualisiert wurde. Und meistens ist das so auch genau richtig, da Solids granulares Rendering nur eine Weiterleitung der Aktualisierungen im reaktiven System ist. Unzusammenhängende Änderungen, die jeweils etwas rendern sind nicht notwendigerweise verschwendete Mühe.

Aber was, wenn die Änderungen zusammengehören? Solids `batch`-Helfer erlaubt es uns, mehrere Änderungen einzureihen, um sie dann alle zusammen auszuführen, bevor die Beobachter benachrichtig werden. Innerhalb dieser Reihe werden aktualisierte Signale nicht weitergeleitet, bis sie fertig ist.

In diesem Beispiel weisen wir beide Namen beim Klick auf den Knopf zu und das löst das aktualisierte Rendering zwei mal aus. Man kann die Log-Einträge in der Konsole sehen, wenn man den Knopf drückt. Also schachteln wir die `set`-Aufrufe in eine batch.

```js
 const updateNames = () => {
    console.log("Button Clicked");
    batch(() => {
      setFirstName(firstName() + "n");
      setLastName(lastName() + "!");
    })
  }
```
Und das war's schon. Jetzt aktualisieren wir nur noch einmal für beide Änderungen.