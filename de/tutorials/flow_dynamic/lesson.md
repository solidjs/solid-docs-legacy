Das `<Dynamic>`-Tag ist nützlich, wenn man von Daten abhängig rendert. Es lässt einen entweder einen String für ein natives Element oder eine Komponenten-Funktion übergeben und rendert dieses mit dem Rest der übergebenen Props.

Das ist häufig kompakter als eine Menge an `<Show>`- oder `<Switch>`-Komponenten.

In diesem Beispiel können wir die `Switch`-Anweisung ersetzen:

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

mit:

```jsx
<Dynamic component={options[selected()]} />
```
