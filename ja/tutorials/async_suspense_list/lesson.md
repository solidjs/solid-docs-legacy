時々、複数の `Suspense` コンポーネントを連携したい場合があります。1 つのアプローチとして、すべてを単一の `Suspense` の下に置くことが考えられますが、それでは、単一のローディング動作に制限されてしまいます。フォールバックの状態が 1 つということは、最後のものがロードされるまで、すべてのものが常に待つ必要があるということです。その代わりに、Solid は `SuspenseList` コンポーネントを導入して、これを連携します。

今回の例のように、複数の `Suspense` コンポーネントがあるとします。これを `revealOrder` に `forwards` を設定した `SuspenseList` でラップすると、ロードされる順番に関係なく、ツリーに表示される順番にレンダリングされます。これにより、ページのジャンプを減らすことができます。`revealOrder` を `backwards` や `together` に設定すると、この順序を逆にしたり、すべてのサスペンスコンポーネントがロードされるのをそれぞれ待つことができます。さらに、`tail` オプションがあり、`hidden` や `collapsed` に設定できます。これは、すべてのフォールバックを表示するというデフォルトの動作をオーバーライドして、何も表示しないか、または `revealOrder` で設定した方向に次のフォールバックを表示します。

現在の例では、ローディングのプレースホルダーに関しては少し混乱しています。すべてのデータを独立してロードしていますが、データがロードされる順番に応じて、複数のプレースホルダーを表示しています。それでは、`ProfilePage` コンポーネントの JSX を`<SuspenseList>` でラップしてみましょう。

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={props.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={props.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={props.trivia} />
  </Suspense>
</SuspenseList>
```
