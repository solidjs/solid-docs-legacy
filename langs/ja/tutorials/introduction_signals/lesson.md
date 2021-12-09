「Signal」は Solid のリアクティビティの基礎となるものです。これらには、時間とともに変化する値が含まれており、Signal の値を変更すると、それを使用しているすべてのものが自動的に更新されます。

Signal を作成するには、`solid-js` から `createSignal` をインポートして、以下のように Counter コンポーネントから呼び出しましょう:
```jsx
const [count, setCount] = createSignal(0);
```

create コールに渡される引数は初期値で、戻り値はゲッターとセッターの 2 つの関数を持つ配列です。[分割代入](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)によって、これらの関数に好きな名前を付けることができます。この例ではゲッターを `count`、セッターを `setCount` と名付けています。

ここで重要なのは、最初に返される値がゲッター（現在の値を返す関数）であり、値そのものではないということです。これはフレームワークが、Signal がどこで読み取られたかを追跡し、それに応じて物事を更新する必要があるためです。

このレッスンでは、JavaScript の `setInterval` 関数を使って定期的にインクリメントするカウンターを作成します。以下のコードを Counter コンポーネントに追加することで、1 秒ごとに`count` Signal を更新できます:

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

毎回、前回のカウントを読み、1 を加えて、新しい値を設定します。

> Solid の Signal は、前回の値を使って次の値を設定する関数形式も受け付けています。
> ```jsx
> setCount(c => c + 1);
> ```

最後に、JSX コードで Signal を読み取る必要があります:

```jsx
return <div>Count: {count()}</div>;
```
