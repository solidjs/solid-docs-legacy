Manchmal ist es wünschenswert, Lesezugriffe auf Signale nicht zu verfolgen, selbst innerhalb eines reaktiven Kontexts. Solid bietet dafür den `untrack`-Helfer an, um zu verhindern, dass die umgebende Berechnung durch den Lesezugriff reaktiv auf Änderungen reagiert.

Mal angenommen, wir wollen, dass bei Änderungen von `b` nichts im Log ausgegeben wird. Wir können das `b`-Signal zeitweise entfolgen, indem wir unseren Effekt wie folgt ändern:

```js
createEffect(() => {
  console.log(a(), untrack(b));
});
```
Da Signale Funktionen sind, können sie direkt übergeben werden, aber `untrack` kann auch Funktionen mit komplexerem Verhalten kapseln.

Obwohl `untrack` die Verfolgung von Lesezugriffen unterbindet, hat es keinen Effekt auf Schreibzugriffe, die weiterhin passieren und ihre Beobachter benachrichtigen.
