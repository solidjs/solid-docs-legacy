UI で発生した JavaScript エラーがアプリ全体を壊してはいけません。ErrorBoundary は、子コンポーネントツリーの任意の場所で JavaScript エラーをキャッチし、それらのエラーをログに記録し、クラッシュしたコンポーネントツリーの代わりにフォールバックの UI を表示するコンポーネントです。

この例では、コンポーネントがクラッシュしました。これをエラーを表示する ErrorBoundary でラップしましょう。

```jsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```
