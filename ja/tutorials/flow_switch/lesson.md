場合によっては、2 つ以上の排他的な結果を持つ条件式を扱う必要があります。このため、JavaScript の `switch`/`case` を大まかにモデル化した `<Switch>` と `<Match>` のコンポーネントを用意しました。

各条件にマッチするかどうかを順に試し、最初に true と評価されたものをレンダリングして停止します。すべてに失敗した場合は、フォールバックをレンダリングします。

ネストした `<Show>` コンポーネントを次のように置き換えることができます:

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
