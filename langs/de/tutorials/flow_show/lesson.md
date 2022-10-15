JSX erlaubt es Dir, JavaScript zu verwenden, um den logischen Ablauf in einem Template zu kontrollieren. Allerdings führt die naive Nutzung von Methoden wie `Array.prototype.map` ohne ein virtuelles DOM dazu, dass verschwenderischer weise bei jeder Aktualisierung alle DOM-Knoten neu erstellt werden. Stattdessen ist es in reaktiven Bibliotheken üblich, Template-Helfer zu verwenden. In Solid packen wir diese in Komponenten.

Der einfachste Kontrollfluss ist die Bedingung. Solids Compiler ist intelligent genug, um ternäre Ausdrücke (`a ? b : c`) und boolesche Ausdrücke (`a && b`) optimal zu handhaben. Allerdings ist es häufig lesbarer, Solids `<Show>`-Komponente zu nutzen.

In dem Beispiel soll nur der Knopf gezeigt werden, der dem gegenwärtigen Zustand (ob der Nutzer eingeloggt ist) entspricht. Ändere das JSX zu:
```jsx
<Show
  when={loggedIn()}
  fallback={() => <button onClick={toggle}>Log in</button>}
>
  <button onClick={toggle}>Log out</button>
</Show>
```
Das `fallback`-Attribut fungiert als `else` und wird angezeigt, wenn die Bedingung, die an `when` übergeben wird, nicht [wahr-artig](https://wiki.selfhtml.org/wiki/JavaScript/Objekte/Boolean#Was_ist_Wahrheit.3F) ist.

Jetzt wird beim Drücken auf den Knopf dessen Zustand wie erwartet geändert.
