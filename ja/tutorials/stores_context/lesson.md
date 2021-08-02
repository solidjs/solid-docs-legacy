Solid は、props を経由せずにデータを渡すための Context API を提供しています。これは、Signal やストアを共有するのに便利です。コンテキストを使うと、リアクティブシステムの一部として作成され、それによって管理されるという利点があります。

まず始めに、Context オブジェクトを作成します。このオブジェクトには、データを注入するために使う `Provider` コンポーネントが含まれています。しかし、`Provider` コンポーネントと `useContext` コンシューマーを、特定のコンテキスト用に設定されたバージョンでラップするのが一般的な方法です。

このチュートリアルでは、まさにそれを実践しています。シンプルなカウンターストアの定義は、`counter.tsx` ファイルで確認できます。

コンテキストを使用するには、まず App コンポーネントをラップしてグローバルに提供します。ラップされた `CounterProvider` を使用します。この場合、初期カウントを 1 にしましょう。

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

次に、それを `nested.tsx` コンポーネントで利用する必要があります。これにはラップされた `useCounter` コンシューマーを使って行います。

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```
