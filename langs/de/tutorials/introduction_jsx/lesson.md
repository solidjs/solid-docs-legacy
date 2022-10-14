JSX ist die HTML-artige Syntax, die wir in diesen Beispielen gesehen haben und ist die Grundlage, um Komponenten in Solid zu bauen.
JSX fügt dynamische Ausdrücke hinzu, die es Dir erlauben, Variablen und Funktionen innerhalb des HTML mit der `{ }`-Syntax zu referenzieren.
In diesem Beispiel verwenden wir den String `name` in unserem HTML, indem wir `{name}` in einem div benutzen. Genauso binden wir ein HTML-Element ein, das direkt der `svg`-Variable zugewiesen wurde.

Anders als andere Frameworks, die JSX benutzen, versucht Solid, so nahe wie möglich an HTML-Standards zu bleiben, um einfaches Kopieren und Einfügen von Antworten auf Stack Overflow oder die Nutzung von Template-Buildern durch Designer zu ermöglichen.

Es gibt 3 grundsätzliche Unterschiede zwischen JSX und HTML, die ausschließen, dass es als Obermenge von HTML angesehen werden kann:
1. JSX hat keine void-Elemente. Alle Elemente müssen ein schließendes Tag haben oder sich selbst schließen. Bedenke dies, wenn Du Elemente wie `<input>` oder `<br>` kopierst.
2. JSX muss ein einzelnes Element zurückgeben. Um mehrere Elemente auf oberster Ebene zu repräsentieren, benutze man ein Fragment-Element:

   ```jsx
   <>
     <h1>Title</h1>
     <p>Some Text</p>
   </>
   ```
3. JSX unterstützt keine HTML-Kommentare `<!--... -->` oder spezielle Tags wie `<!DOCTYPE>`.

Aber JSX unterstützt SVG. Versuchen wir, etwas SVG in unsere Komponente zu kopieren:
```jsx
<svg height="300" width="400">
  <defs>
    <linearGradient id="gr1" x1="0%" y1="60%" x2="100%" y2="0%">
      <stop offset="5%" style="stop-color:rgb(255,255,3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <ellipse cx="125" cy="150" rx="100" ry="60" fill="url(#gr1)" />
  Sorry but this browser does not support inline SVG.
</svg>
```
