Resource は、非同期のロードを処理するために特別に設計された Signal です。その目的は、Solid の分散実行モデルにおいて、非同期の値を簡単に操作できるようにラップすることです。これは、シーケンシャルな実行モデルを提供する `async`/`await` や `generators` とは正反対です。非同期が実行をブロックしたり、コードに色をつけたりしないようにするのを目標としています。

Resource は、Promise を返す非同期データフェッチャー関数にクエリを提供するソース Signal によって駆動できます。フェッチャー関数の内容は何でもかまいません。典型的な REST エンドポイントでも、GraphQL でも、Promise を生成するものであれば何でもいいのです。Resource は、データをロードする手段にはこだわらず、Promise によって駆動されることだけが重要です。

結果として得られる Resource の Signal には、リアクティブな `loading` と `error` プロパティが含まれており、現在のステータスに基づいてビューを簡単に制御できます。

それでは、user の Signal を Resource に置き換えてみましょう。
```js
const [user] = createResource(userId, fetchUser);
```
これは、`userId` Signal によって駆動され、変更があると fetch メソッドを呼び出します。それ以外にはあまりありません。

`createResource` から返ってくる 2 つ目の値には、内部の Signal を直接更新するための `mutate` メソッドと、ソースが変更されていなくても現在のクエリをリロードするための `refetch` メソッドが含まれています。

```js
const [user, { mutate, refetch }] = createResource(userId, fetchUser);
```

`lazy` は、動的インポートを管理するために内部で `createResource` を使用しています。
