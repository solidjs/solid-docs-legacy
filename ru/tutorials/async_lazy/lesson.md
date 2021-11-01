Большинство бандлеров (таких как Webpack, Rollup, Parcel или Vite) автоматически разделят ваш общий бандл (файл с js кодом) на кусочки (`code-splitting`), если вы используете динамический импорт. В Solid есть метод `lazy`, который позволяет обернуть динамический импорт для ленивой загрузки (`lazy loading`). В результате выполнения этого метода мы получим компонент, который можно использовать в jsx как обычно. Главным отличием является то, что теперь код этого компонента будет жить в отдельном бандле, который будет загружен по мере необходимости.

Для того, чтобы использовать `lazy`, замените импорт:
```js
import Greeting from "./greeting";
```
на:
```js
const Greeting = lazy(() => import("./greeting"));
```

Скорее всего бандл будет загружен слишком быстро, чтобы заметить разницу. Мы можем добавить искусственную задержку, чтобы процесс загрузки стал более очевидным.

```js
const Greeting = lazy(async () => {
  // симулируем задержку
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```