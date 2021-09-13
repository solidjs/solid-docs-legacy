---
title: Server
description: Eine Erklärung von Solids serverseitigen Fähigkeiten
sort: 3
---

# Serverseitiges Rendering

Solid handhabt serverseitiges Rendering, indem es JSX-Templates zu extrem effizientem String-anfügendem Code rendert. Das kann mit dem Babel-Plugin erreicht werden, oder indem man `generate: ssr` durchreicht. Sowohl für Client als auch Server muss `hydratable: true` konfiguriert sein, damit mit Hydration kompatibler Code erzeugt wird.

Die `solid-js` und `solid-js/web` Laufzeit-Umgebungen werden mit nicht-reaktiven Entsprechungen getauscht, wenn sie in einer node-Umgebung laufen. Für andere Umgebungen muss man den Server-Code mit conditionalen Exporten auf `node` gesetzt bündeln. Die meisten Code-Bundler haben einen Weg, dies zu tun. Generell empfehlen wir, außerdem die `solid` Export-Konditionen zu benutzen und dass Libraries ihren Code unter dem `solid` export verteilen.

Für SSR zu bauen, benötigt definitiv mehr Konfiguration, da wir 2 separate Bündel bauen. Das Client-Script sollte `hydrate` benutzen:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_Hinweis: Es ist möglich, vom document-Root aus zu rendern und zu hydrieren. Das erlaubt es uns, den gesamten View in JSX zu beschreiben._

Das Server-Script kann eine der vier Render-Methoden verwenden, die von Solid zur Verfügung gestellt werden. Jede erzeugt die Ausgabe und das Script-Tag, das in den Kopf des Dokuments eingefügt wird.

```jsx
import {
  renderToString,
  renderToStringAsync,
  renderToNodeStream,
  renderToWebStream,
} from "solid-js/web";

// Synchrones string rendering
const html = renderToString(() => <App />);

// Asynchrones string rendering
const html = await renderToStringAsync(() => <App />);

// Node Stream API
pipeToNodeWritable(App, res);

// Web Stream API (etwa wie Cloudflare Workers)
const { readable, writable } = new TransformStream();
pipeToWritable(() => <App />, writable);
```

Bequemerweise exportiert `solid-js/web` ein `isServer`-Flag. Das ist nützlich, da viele JS-Bündler in der Lage sind, unbenutzten Code innerhalb von Abfragen dieses Flags mit Tree Shaking zu entfernen und imports, die nur von diesem Code genutzt werden, aus dem Client-Code herauszulassen.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
  // das hier wird nur auf dem Server ausgeführt
} else {
  // das hier wird nur im Browser ausgeführt
}
```

## Hydrations-Script

Um progressiv zu Hydrieren, noch before Solids Laufzeitumgebung geladen ist, muss ein spezielles Script in die Seite eingefügt werden. Es kann entweder generiert und per `generateHydrationScript` eingefügt werden oder als Teil des JSX, indem man das `<HydrationScript />`-Tag benutzt.

```js
import { generateHydrationScript } from "solid-js/web";

const app = renderToString(() => <App />);

const html = `
  <html lang="en">
    <head>
      <title>🔥 Solid SSR 🔥</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      ${generateHydrationScript()}
    </head>
    <body>${app}</body>
  </html>
`;
```

```jsx
import { HydrationScript } from "solid-js/web";

const App = () => {
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <HydrationScript />
      </head>
      <body>{/*... Rest der App*/}</body>
    </html>
  );
};
```

Wenn man vom document aus hydriert, kann das Einfügen von Ressourcen, die noch nicht verfübbar sind, Dinge durcheinander bringen. Solid hat dafür eine `<NoHydration>`-Komponente, deren Kinder ganz normal auf dem Server funktionieren, aber nicht im Browser hydriert werden.

```jsx
<NoHydration>
  {manifest.map((m) => (
    <link rel="modulepreload" href={m.href} />
  ))}
</NoHydration>
```

## Asynchrones und Streaming SSR

Diese Mechanismen bauen auf Solids Wissen darüber auf, wie Deine Anwendung funktioniert. Das macht es, indem Suspense und die Resource-API auf dem Server verwendet wird, statt erst die Ressourcen zu laden und dann erst zu rendern. Solid rendert auf dem Server genauso wie auf dem Client. Dein Code und die Ausführungsmuster sind einfach auf die selbe Weise geschrieben.

Async rendering waits until all Suspense boundaries resolve and then sends the results (or writes them to a file in the case of Static Site Generation).

Streaming starts flushing synchronous content to the browser immediately rendering your Suspense Fallbacks on the server. Then as the async data finishes on the server it sends the data over the same stream to the client to resolve Suspense where the browser finishes the job and replaces the fallback with real content.

The advantage of this approach:

- Server doesn't have to wait for Async data to respond. Assets can start loading sooner in the browser, and the user can start seeing content sooner.
- Compared to client fetching like JAMStack, data loading starts on the server immediately and doesn't have to wait for client JavaScript to load.
- All data is serialized and transported from server to client automatically.

## SSR Caveats

Solids isomorphische SSR-Lösung ist sehr mächtig, so dass man die Anforderungen für beide Umgebungen im gleichen Code ausdrücken kann, der in beiden Umgebungen gleichermaßen läuft. Allerdings führt das zu gewissen Erwartungen in Bezug auf Hydration, vor allem dass der gerenderte View im Client der gleiche ist, der auch auf dem Server gerendert würde. Es muss nicht exakt der gleiche sein, was den Text angeht, aber die Struktur des Markups sollte gleich sein.

Wir benutzen Markierungen, die vom Server gerendert werden, um Elemente und Ressourcen auf dem Server abzugleichen. Aus diesem Grund sollten Server und Client die gleichen Komponenten haben. Das ist normalerweise kein Problem, da Solid auf die gleiche Art auf dem Server und auf dem Client rendert. Aber derzeit gibt es noch keinen Weg, etwas auf dem Server zu rendern, das nicht auf dem Client hydriert wird. Im Moment gibt es keinen Weg, eine ganze Seite nur partiell zu hydrieren und keine Hydrations-Markierungen dafür zu erzeugen. Es ist alles oder nichts. Partielle Hydration ist etwas, was wir in der Zukunft erforschen wollen.

Zuletzt müssen alle Ressourcen innerhalb es `render`-Baums definiert werden. Sie werden dann automatisch serialisiert und im Browser übernommen, aber das funktioniert, weil die `render`- oder `pipeTo`-Methoden den Fortschritt des Renderns überblicken, etwas, das wir innerhalb eines isolierten Kontextes nicht können. Ebenso gibt es keine Reaktivität auf dem Server, also können Signale nicht beim initialen Rendern aktualisiert und weiter nach oben im Baum weitergereicht werden. Während es Suspense-Boundaries gibt, funktioniert Solids SSR von oben nach unten.

## Den Anfang machen mit SSR

SSR-Konfigurationen sind knifflig. Wir haben ein paar Beispiele im Paket [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr).

Zwischenzeitlich hat die Arbeit an einem neuen Starter begonnen, [SolidStart](https://github.com/solidjs/solid-start), in dem wir versuchen, das Arbeiten damit bequemer zu machen.

## Den Anfang mit statischer Seitengenerierung machen

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) hat auch ein Werkzeugt, um statische oder vorgerenderte Seiten zu erzeugen. In der README-Daten finden sich weitere Informationen dazu.
