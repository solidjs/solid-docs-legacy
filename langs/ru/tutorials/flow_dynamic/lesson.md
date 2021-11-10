Тег <Dynamic> полезен когда нам нужно определить вид компонента для рендера с помощью данных. Он позволяет передавать либо строку для нативного элемента, либо функцию компонента, и он будет рендерить её вместе с предоставленными (`props`).

Часто при использовании `Dynamic` компонента ваша запись будет более компактной, чем если бы вы использовали `<Show>` или `<Switch>`.

В этом примере мы можем заменить `<Switch>`:

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

на:

```jsx
<Dynamic component={options[selected()]} />
```
