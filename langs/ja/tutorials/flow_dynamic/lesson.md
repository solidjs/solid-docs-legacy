`<Dynamic>` タグは、データを元にレンダリングするときに便利です。ネイティブ要素を表す文字列やコンポーネント関数を渡して、提供された残りの props でレンダリングできます。

`<Show>` や `<Switch>` コンポーネントをたくさん書くよりコンパクトになることが多いです。

この例では、この `<Switch>` 文を

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

以下に置き換えることができます:

```jsx
<Dynamic component={options[selected()]} />
```
