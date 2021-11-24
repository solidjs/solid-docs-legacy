Solid のパフォーマンスが高い理由のひとつは、コンポーネントが基本的に単なる関数呼び出しであることです。更新情報を伝達する方法は、潜在的にリアクティブな式をコンパイラがオブジェクトゲッターでラップすることです。コンパイラが出力する様子を想像してみてください:

```jsx
// この JSX が
<MyComp dynamic={mySignal()}>
  <Child />
</MyComp>

// こうなります
MyComp({
  get dynamic() { return mySignal() },
  get children() { return Child() }
});
```
これは、これらの props が遅延評価されることを意味します。これらのアクセスは、それらが使用されるまで延期されます。これにより、余計なラッパーや同期を導入することなく、リアクティビティを維持できます。しかし、繰り返しアクセスすると、子コンポーネントや要素が再作成される可能性があることを意味します。

ほとんどの場合、props を JSX に挿入するだけなので問題はありません。しかし、子要素を扱う場合は、子要素を何度も作らないように注意する必要があります。

そのため、Solid には `children` ヘルパーが用意されています。このメソッドは、`children` プロパティを囲む Memo を作成し、ネストした子のリアクティブな参照を解決して、子を直接操作できるようにします。

この例では、動的なリストがあり、アイテムの `color` スタイルプロパティを設定したいとします。もし `props.children` を直接操作してしまうと、ノードを何度も作成しなければならないだけでなく、`props.children` も関数であり、`<For>` から返された Memo であることが分かります。

代わりに、`colored-list.tsx` 内で `children` ヘルパーを使ってみましょう:
```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```
それでは、要素を更新するために、Effect を作成してみましょう:
```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
