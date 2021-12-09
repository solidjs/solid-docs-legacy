JSX で Signal にアクセスすると、その Signal が変化したときに自動的にビューが更新されることを見てきました。しかし、コンポーネント関数自体は一度しか実行されません。

Signal を関数でラップすることで、Signal に依存する新しい式を作ることができます。Signal にアクセスする関数は、実質的に Signal でもあります。ラップされた Signal が変化すると、読み込み側も更新されます。

それでは、`doubleCount` 関数を導入して、2 倍カウントするように Counter を更新してみましょう:

```jsx
const doubleCount = () => count() * 2;
```

そして、JSX の中で Signal のように `doubleCount` を呼び出すことができます:
```jsx
return <div>Count: {doubleCount()}</div>;
```

このような関数を「派生 Signal」と呼ぶのは、アクセスする Signal からリアクティビティを得るためです。派生 Signal は、それ自体が値を格納するわけではありません（派生 Signal を作成しても一度も呼び出さなければ、未使用の関数と同様に Solid の出力から取り除かれます）が、派生 Signal に依存する Effect を更新したり、ビューに含まれている場合には再レンダリングをトリガーします。
