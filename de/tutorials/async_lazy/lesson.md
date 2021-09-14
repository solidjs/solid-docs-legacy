Die meisten Bundler (wie Webpack, Rollup, Parcel, Vite) splitten den Code automatisch, wenn ein dynamischer Import verwendet wird. Solids `lazy`-Methode erlaubt es uns, den Komponenten-Import für verzögert nachzuladene Komponenten zu kapseln. Die Ausgabe ist eine Komponente, die ganz normal im JSX verwendet werden kann, außer dass sie intern den unterliegenden Code lädt, wenn sie zum ersten Mal gerendert wird und den Render-Zweig unterbricht, bis der Code verfügbar ist.

Um `lazy` zu nutzen, ersetze man die import-Anweisung:
```js
import Greeting from "./greeting";
```
with:
```js
const Greeting = lazy(() => import("./greeting"));
```

Das wird vermutlich immer noch zu schnell laden, um es zu sehen. Aber man kann eine künstliche Verzögerung einbauen, um das Laden sichtbarer zu machen.

```js
const Greeting = lazy(async () => {
  // simulate delay
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
