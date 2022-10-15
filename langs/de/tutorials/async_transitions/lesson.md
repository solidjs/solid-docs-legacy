`Suspense` erlaubt es uns, einen Platzhalter anzuzeigen, während Daten geladen werden. Das ist toll für das anfängliche Laden, aber bei folgenden Navigationen ist es meist ein schlechtes Nutzererlebnis, auf einen Platzhalter-Zustand zurückzufallen.

Wir können es vermeiden, in diesen Platzhalter-Zustand zurückzufallen, indem wir `useTransition` verwenden. Es bietet einen Wrapper und einen Lade-Indikator. Der Wrapper steckt alle darunterliegenden Aktualisierungen in eine Transaktion, die nicht ausgeführt wird, bis alle asynchronen Events vollständig geladen sind.

Das heißt, wenn der Kontrollfluss unterbrochen ist, zeigt es weiterhin den gegenwärtigen Zweig, während der nächste versteckt gerendert wird. Ressourcenzugriffe innerhalb der Grenzen werden zu der Transition hinzugefügt. Allerdings werden alle neuen verschachtelten `Suspense`-Komponenten ihren Platzhalter anzeigen, wenn sie nicht fertig geladen waren, bevor sie gerendert wurden.

Man achte darauf, dass beim Navigieren innerhalb des Beispiels der Inhalt mit einem Lade-Platzhalter wechselt. Fügen wir eine Transition zu unserer `App`-Komponente hinzu. Zuerst ersetzen wir die `updateTab`-Funktion:

```js
const [pending, start] = useTransition();
const updateTab = (index) => () => start(() => setTab(index));
```

`useTransition` gibt ein pending-Signal zurück und eine Methode, um die Transition zu starten, in die wir unser Update kapseln.

Wir sollten das pending-Signal benutzen, um eine Ladeanzeige im Benutzerinterface anzuzeigen. Wir können eine pending-Klasse in unser Tab-Container-div schreiben:

```js
<div class="tab" classList={{ pending: pending() }}>
```

Und schon wird das Umschalten zwischen den Tabs viel flüssiger.
