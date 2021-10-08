Zur Bequemlichkeit hat Solid einen `on`-Helfer, der es ermöglicht, ausdrücklich Abhängigkeiten einer Berechnung zu definieren. Das ist hauptsächlich ein Weg, um prägnant zu zeigen, welche Signale verfolgt werden (und andere nicht zu verfolgen). Zusätzlich bietet `on` eine `defer`-Option, die es erlaubt, die initiale Berechnung nicht auszuführen und erst bei der ersten Änderung zu laufen.

Lassen wir unseren Effekt nur laufen, wenn `a` aktualisiert wird und verzögern die Ausführung, bis der Wert sich erstmals ändert:

```js
createEffect(on(a, (a) => {
  console.log(a, b());
}, { defer: true }));
```
