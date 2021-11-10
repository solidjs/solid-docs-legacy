JSX erlaubt es uns, JavaScript zu verwenden, um den logischen Ablauf in einem Template zu kontrollieren. Allerdings führt die naive Nutzung von Methoden wie `Array.prototype.map` ohne ein virtuelles DOM dazu, dass verschwenderischerweise bei jeder Aktualisierung alle DOM-Nodes neu erstellt werden. Stattdessen ist es in reaktiven Libraries gängig, Template-Helfer zu verwenden. In Solid sind diese in Komponenten verpackt.

Der einfachste Kontrollfluss ist die Bedingung. Solids Compiler ist intelligent genug, um ternäre Ausdrücke (`a ? b : c`) und bool'sche Ausdrücke (`a && b`) optimal zu handhaben. Allerdings ist es häufig lesbarer, Solids `<Show>`-Komponente zu nutzen.

In dem Beispiel soll nur der Knopf gezeigt werden, der dem gegenwärtigen Zustand (ob der Nutzer eingeloggt ist) entspricht. Ändere das JSX zu:
```jsx
<Show
  when={loggedIn()}
  fallback={() => <button onClick={toggle}>Log in</button>}
>
  <button onClick={toggle}>Log out</button>
</Show>
```
Das `fallback`-Prop fungiert als `else` und wird angezeigt, wenn die Bedingung, die an `when` übergeben wird, keinen `true` entsprechenden Wert enthält.

Jetzt wird das Drücken auf den Knopf dessen Zustand wie erwartet ändern.
