合并 props 并不是我们唯一要做的操作。我们经常使用解构来在当前组件上使用一些 props，然后将其他 props 分离出来传递给子组件。

为此，Solid 提供了 `splitProps`。它接收一个 props 对象以及一个 props 对象的键数组。返回一个数组，数组第一个元素是与入参键数组对应的对象。数组中的最后一个元素会是一个未指定的键名的 props 对象，，类似于剩余参数。

我们的示例在设置名字时不会更新，因为我们在 `greeting.tsx` 中解构时失去了响应性：

```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

取而代之，我们可以使用 `splitProps` 来保持响应性：

```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```

现在按钮按预期工作。
