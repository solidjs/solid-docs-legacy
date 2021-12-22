私達にできる操作は props をマージするだけではありません。分割代入を使い、一部の props は現在のコンポーネントで使用し、他の props を分割して子コンポーネントに渡すことがよくあります。

この目的のために、Solid には `splitProps` があります。これは、props オブジェクトと、独自の props オブジェクトに抽出したいキーの配列を 1 つまたは複数受け取ります。props オブジェクトの配列を返します。指定されたキーの配列ごとに 1 つずつの props オブジェクトと、残余引数と同じように残りのキーを含む 1 つの props オブジェクトが入っています。返されたオブジェクトはすべてリアクティビティを保ちます。

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
