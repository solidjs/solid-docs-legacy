`lazy` と `createResource` はそれぞれ単独で使用できますが、Solid は複数の非同期イベントの表示を連携するメカニズムも提供します。`Suspense` は、これらの非同期イベントが解決すると、部分的にロードされたコンテンツの代わりにフォールバックのプレースホルダーを表示できる境界として機能します。

これにより、中間および部分的なローディング状態が多すぎるために発生する視覚的なジャンクを取り除くことで、ユーザーエクスペリエンスを向上させることができます。`Suspense` は、子孫の非同期な読み取りを自動的に検出し、それに応じて動作します。必要な数の `Suspense` コンポーネントをネストでき、ローディング状態が検出されると、最も近い祖先だけがフォールバックに変換されます。

遅延ロードの例に `Suspense` コンポーネントを追加してみましょう。

```jsx
<>
  <h1>Welcome</h1>
  <Suspense fallback={<p>Loading...</p>}>
    <Greeting name="Jake" />
  </Suspense>
</>
```

これで、ローディングのプレースホルダーができました。

重要なのは、`Suspense` をトリガーするのは、非同期派生値の読み取りであるということです。非同期フェッチそのものではありません。Resource の Signal（`lazy` コンポーネントを含む）が `Suspense` の境界の下で読み取られない場合、サスペンドしません。

`Suspense` は多くの意味で、両方のブランチをレンダリングする `Show` コンポーネントに過ぎません。`Suspense` は非同期のサーバーレンダリングには欠かせないものですが、クライアントレンダリングされたコードにすぐに使う必要はありません。Solid のきめ細かなレンダリングは、手動で物事を分割するための追加コストはありません。

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Solid の作業はすべて独立してキューに入っています。Time Slicing のようなものは必要ありません。
