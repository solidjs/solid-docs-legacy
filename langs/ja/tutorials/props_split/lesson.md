私達にできる操作は props をマージするだけではありません。分割代入を使い、一部の props は現在のコンポーネントで使用し、他の props を分割して子コンポーネントに渡すことがよくあります。

この目的のために、Solid には `splitProps` があります。これは、props オブジェクトと、それらの props を受け入れたい各オブジェクトを表すキーの配列を受け取ります。これは、引数ごとの配列に 1 つ加えたものを返します。配列の最後の要素は、残余引数と同様、指定されていない残りの props を持つオブジェクトになります。

今回の例では、`greeting.tsx` 内で分割代入したときにリアクティビティが失われたため、name を変更しても更新されません:
```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

代わりに `splitProps` でリアクティビティを維持できます:
```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```
これで、ボタンは期待通り動作するようになりました。
