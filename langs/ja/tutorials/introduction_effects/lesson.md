Signal は追跡可能な値ですが、それは方程式の半分に過ぎません。それを補完するのが、追跡可能な値によって更新されるオブザーバーです。Effect はそのようなオブザーバーのひとつで、Signal に依存する副作用を実行します。

Effect は `solid-js` から `createEffect` をインポートして関数を与えることで作成できます。Effect は、関数の実行中に読み込まれたあらゆる Signal を自動的にサブスクライブし、それらのいずれかが変更されると再実行します。

それでは、`count` が変化するたびに再実行される Effect を作成してみましょう:

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

`Count` Signal を更新するために、ボタンにクリックハンドラーをアタッチします。

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

これで、ボタンをクリックするとコンソールに書き込まれます。これは比較的簡単な例ですが、Solid の仕組みを理解するには、JSX 内のすべての式が独立した Effect であり、依存する Signal が変化するたびに再実行されることを想像してください。これが、Solid でのすべてのレンダリングの仕組みです。Solid の視点では、「すべてのレンダリングは、リアクティブシステムの副作用に過ぎない」のです。

> 開発者が `createEffect` で作成した Effect は、レンダリングが完了した後に実行され、主に DOM と相互作用する更新をスケジューリングするために使用されます。早めに DOM を変更したい場合は [`createRenderEffect`](https://www.solidjs.com/docs/latest/api#createrendereffect) を使用してください。
