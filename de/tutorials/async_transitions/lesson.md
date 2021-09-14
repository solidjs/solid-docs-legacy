`Suspense` erlaubt es uns, einen Platzhalter anzuzeigen, während Daten geladen werden. Das ist toll für das initiale Laden, aber bei folgenden Navigationen ist es meist schlechtere UX, auf einen Platzhalter-Zustand zurückzufallen.

Wir können es vermeiden, in diesen Platzhalter-Zustand zurückzufallen, indem wir `useTransition` verwenden. Es bietet einen Wrapper und einen Lade-Indikator. Der Wrapper steckt alle darunterliegenden Aktualisierungen in eine Transaktion, die nicht ausgeführt wird, bis alle asynchronen Events vollständig sind.

Das heisst, wenn der Kontrollfluss unterbrochen ist, zeigt es weiterhin den gegenwärtigen Zweig, während der nächste außerhalb des Dokuments gerendert wird. Ressourcenzugriffe unter existierenden Boundaries werden zu der Transition hinzugefügt. Allerdings werden alle verschachtelten `Suspense`-Komponenten ihren Platzhalter anzeigen, wenn sie nicht fertig geladen waren, bevor sie gerendert wurden.

Man achte darauf, dass beim Navigieren innerhalb des Beispiels der Inhalt mit einem Lade-Platzhalter wechselt. Fügen wir eine transition zu unserer `App`-Komponente hinzu. Zuerst ersetzen wir die `updateTab`-Funktion:

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
