Большинство сборщиков (таких как Webpack, Rollup, Parcel или Vite) автоматически разобьет на части общий файл с JS кодом (`bundle`) с помощью техники [разделения кода](https://ru.reactjs.org/docs/code-splitting.html), если вы используете [динамический импорт](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Statements/import#%D0%B4%D0%B8%D0%BD%D0%B0%D0%BC%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%B8%D0%BC%D0%BF%D0%BE%D1%80%D1%82). Solid предоставляет метод `lazy`, который позволяет обернуть динамический импорт для [ленивой загрузки](https://developer.mozilla.org/ru/docs/Web/Performance/Lazy_loading). В результате выполнения этого метода мы получим компонент, который можно использовать в [JSX](https://ru.reactjs.org/docs/introducing-jsx.html) как обычно. Главным отличием является то, что теперь код этого компонента будет жить в отдельном файле, который будет загружен по мере необходимости.

Для того, чтобы использовать `lazy`, замените импорт:

```js
import Greeting from "./greeting";
```

на:

```js
const Greeting = lazy(() => import("./greeting"));
```

Скорее всего файл будет загружен слишком быстро, чтобы заметить разницу. Мы можем добавить искусственную задержку, чтобы факт загрузки стал более очевидным.

```js
const Greeting = lazy(async () => {
  // симулируем задержку
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
