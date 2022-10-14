Die meisten Bundler (wie Webpack, Rollup, Parcel, Vite) splitten den Code automatisch, wenn ein dynamischer Import verwendet wird. Solids `lazy`-Methode erlaubt es uns, verzögert nachzuladende Komponenten zu kennzeichnen. Eine solche Komponente kann ganz normal im JSX verwendet werden, außer dass sie intern den unterliegenden Code erst lädt, wenn er zum ersten Mal gerendert wird. Das Rendern wird unterbrochen, bis der Code verfügbar ist.

Um `lazy` zu nutzen, ersetze man die Import-Anweisung:
```js
import Greeting from "./greeting";
```
mit:
```js
const Greeting = lazy(() => import("./greeting"));
```

Das wird vermutlich immer noch zu schnell laden, um den Effekt zu sehen. Aber man kann eine künstliche Verzögerung einbauen, um das Laden sichtbarer zu machen.

```js
const Greeting = lazy(async () => {
  // simulate delay
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
