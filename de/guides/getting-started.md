---
title: Einstieg in Solid
description: Ein Handbuch zum Einstieg in Solid.
sort: 0
---

# Einstieg in Solid

## Solid ausprobieren

Mit Abstand die einfachste Möglichkeit, in Solid einzusteigen, ist, es online auszuprobieren. Unser REPL auf https://playground.solidjs.com ist der perfekte Weg, um Ideen auszuprobieren. Ähnlich gut ist https://codesandbox.io/, wo du jedes [unserer Beispiele](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md) anpassen kannst.

Alternativ kann man auch unsere einfachen [Vite](https://vitejs.dev/)-Vorlagen nutzen, indem man folgende Anweisungen ins Terminal eingibt:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # oder yarn oder pnpm
> npm run dev # oder yarn oder pnpm
```

Oder für TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # oder yarn oder pnpm
> npm run dev # oder yarn oder pnpm
```

## Solid lernen

Bei Solid geht es ganz um kleine zusammenpassende Teile, die als Bausteine für Anwendungen dienen. Diese Teile sind hauptsächlich Funktionen, die oberflächlich viele übergeordnete APIs bilden. Glücklicherweise muss man nicht viel darüber wissen, um mit Solid zu starten.

Die beiden wichtigsten Bausteine, die zur Verfügung stehen, sind Komponenten und reaktive Primitiven.

Komponenten sind Funktionen, die ein Props-Objekt nehmen und JSX-Elemente zurückgeben einschließlich nativer DOM-Elemente und anderer Komponenten. Sie können als JSX-Elemente in PascalCase geschrieben werden:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Komponenten sind insofern leichtgewichtig, als sie nicht selbst Zustand verwalten und keine eigenen Instanzen erzeugen müssen. Stattdessen funktionieren sie als Fabrik-Funktionen für DOM-Elemente und reaktive Primitiven.

Solids feingranulare Reaktivität baut auf 3 einfachen Primitiven auf: Signale, Memos und Effekte. Zusammen formen sie eine Maschine zur automatischen Verfolgung und Synchronisation, die sicherstellt, dass die Ausgabe aktuell bleibt. Reaktive Berechnungen nehmen dabei die Form von in Funktionen gekapselten Ausdrücken, die synchron ausgeführt werden, an.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Es gibt noch mehr über [Solids Reaktivität](#reactivity) und [Solids Rendering](#rendering) zu lernen.

## Solids Philosophie

Das Design von Solid basiert auf Ansichten über bestimmte Prinzipien und Werten, die uns helfen, Webseiten und Anwendungen auf die beste Art zu bauen. Es ist einfacher, zu lernen, Solid zu nutzen, wenn man die Philosophie dahinter kennt.

### 1. Deklarative Daten

Deklarative Daten ist die Praxis, die Beschreibung des Datenverhaltens an dessen Deklaration zu hängen. Das erlaubt eine einfache Zusammenstellung aller Aspekte des Datenverhaltens am gleichen Platz.

### 2. Verwchwindende Komponenten

Es ist schwer genug, Komponenten zu strukturieren, ohne Aktualisierungen zu bedenken. Solids Aktualisierungslogik ist unabhängig von den Komponenten. Componenten-Funktionen werden nur einmal aufgerufen und hören dann auf, zu existieren. Komponenten existieren, um den Code zu organisieren und mehr nicht.

### 3. Trennung von Lesen/Schreiben

Präzise Kontrolle und Vorhersagbarkeit sind die Grundlage für bessere Systeme. Wir brauchen keine völlige Unveränderlichkeit, um unidirektionalen Datenfluss zu erzwingen, sondern nur die Fähigkeit, eine bewusste Entscheidung zu treffen, welche Nutzer schreiben können und welche nicht.

### 4. Einfach ist besser als leicht

Eine schwere Lektion für feingranulare Reaktivität. Explizite und konsistente Konventionen sind selbst dann wertvoll, wenn sie etwas mehr Aufwand erfordern. Das Ziel ist es, minimale Werkzeuge zur Verfügung zu stellen, die zu einer Grundlage werden, auf der man aufbauen kann.

## Web Components

Solid wurde mit dem Wunsch geschaffen, Web Components als Bürger erster Klasse zu behandeln. Mit der Zeit unterlag das Design einer Evolution und die Ziele wurden angepasst. Dennoch ist Solid ein guter Weg, um Web Components zu erstellen. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) erlaubt es, Solid-Komponenten zu schreiben und als kleine und performante Web Components zu verpacken. Innerhalb von Solid-Anwendungen ist Solid Element in der Lage, Solids Context API zu verwenden und Solids Portal-Komponente unterstützt mit Shadow DOM isolierte Styles.

## Server Rendering

Solid hat eine dynamische Serverseitige Render-Lösung die eine wirklich isomorphische Entwicklungserfahrung ermöglicht. Durch die Nutzung unserer Resource-Primitive sind asnychrone Daten-Abfragen einfach gemacht und, noch wichtiger, automatisch zwischen Client und Browser serialisiert und synchronisiert.

Da Solid asynchrones Rendern in Datenströme unterstützt, kann man seinen Code einmal schreiben und auch auf dem Server ausführen. Das heisst, das Fähigkeiten wie [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) und Code-splitting in Solid einfach funktionieren.

Mehr Informationen bietet das [Server Handbuch](#server-side-rendering).

## Keine Kompilation?

Du magst kein JSX? Dich stören etwas mehr manuelle Arbeit beim verpacken von Ausdrücken, schlechtere Performance und größere Bundle-Größen nicht? Man kann alternativ auch Solid-Anwendungen mit Tagged Template Literalen oder HyperScript in nicht-kompilierten Umgebungen verwenden.

Das kann man direkt im Browser mit [Skypack](https://www.skypack.dev/) laufen lassen:

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

Man bedenke, dass man immer noch die dazugehörige DOM Expression Library benötigt, damit das mit TypeScript funktioniert. Man kann Tagged Template Literals mit [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) oder HyperScript mit [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions) benutzen.
