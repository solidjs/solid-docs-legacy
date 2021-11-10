Solid でリアクティビティが細かく設定されている理由の 1 つは、ネストした更新を独立して処理できることです。ユーザーのリストを持っていて、ある名前を更新すると、リスト自体には影響を与えずに DOM 内の 1 箇所だけを更新できます。このようなことができる UI フレームワーク（しかもリアクティブなもの）はほとんどありません。

しかし、どのようにこれを実現するのでしょうか？　この例では、Signal の中に Todo のリストがあります。Todo を完了済みとしてマークするためには、Todo を複製して置き換える必要があります。これは多くのフレームワークが採用している方法ですが、リストの差分を再実行したり、`console.log` に示されているように DOM 要素を再作成したりするので無駄が多いです。

```js
const toggleTodo = (id) => {
  setTodos(
    todos().map((todo) => (todo.id !== id ? todo : { ...todo, completed: !todo.completed })),
  );
};
```

その代わり、Solid のようなきめ細かいライブラリでは、次のようにネストした Signal でデータを初期化します:

```js
const addTodo = (text) => {
  const [completed, setCompleted] = createSignal(false);
  setTodos([...todos(), { id: ++todoId, text, completed, setCompleted }]);
};
```

これで、`setCompleted` を呼び出すことで、追加の差分なしに名前を更新できるようになりました。これは、複雑さをビューではなく、データに移したからです。また、データがどのように変化するかを正確に把握しています。

```js
const toggleTodo = (id) => {
  const index = todos().findIndex((t) => t.id === id);
  const todo = todos()[index];
  if (todo) todo.setCompleted(!todo.completed())
}
```
`todo.completed` の残りの参照を `todo.completed()` に変更すると、この例では Todo を切り替えたときではなく、作成時にのみ `console.log` を実行するようになります。

もちろん、これには手動でのマッピングが必要で、以前はこれが唯一の選択肢でした。しかし今ではプロキシのおかげで、この作業のほとんどを手動で行なうことなく、バックグラウンドで実行できるようになりました。次のチュートリアルに進んで、その方法を確認してください。
