Для случаев, когда в нашей логике есть больше чем два ветвлений мы можем использовать `Switch` и `Match` компоненты. Эти компоненты напоминают [switch](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Statements/switch) в JavaScript.

Компонент `Switch` будет читать условия сверху вниз, и остановится на первом правдивом. Если ни одно из условий не будет выполнено мы зарендерим компонент из `fallback`.

В этом уроке мы можем заменить двойной `Show` следующим образом:

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
