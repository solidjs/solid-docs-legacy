ほとんどのバンドラー（Webpack, Rollup, Parcel, Vite など）は、動的インポートを使用する際にコード分割を自動的に処理します。Solid の `lazy` メソッドでは、コンポーネントの動的インポートをラップして遅延ロードを行うことができます。出力されるのは、JSX テンプレートで通常どおりに使用できるコンポーネントです。ただし、内部的には、最初にレンダリングされるときに、基となるインポートされたコードを動的にロードし、コードが利用可能になるまでレンダリングのブランチを停止するという例外があります。

`lazy` を使用するには、import 文を置き換えます。

```js
import Greeting from "./greeting";
```
このように:
```js
const Greeting = lazy(() => import("./greeting"));
```

これでもロードが早すぎて見えないかもしれません。しかし、ローディングをより見やすくしたい場合は、偽の遅延を追加します。

```js
const Greeting = lazy(async () => {
  // 遅延をシミュレート
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
