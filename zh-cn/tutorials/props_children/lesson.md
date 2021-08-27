Solid 如此高性能的部分原因是 Solid 的组件基本上只是函数调用。我们通过编译器将潜在的响应式表达式包装在对象 getter 中来传播更新。可以想象编译器输出：

```jsx
// 输入
<MyComp dynamic={mySignal()}>
  <Child />
</MyComp>

// 输出
MyComp({
  get dynamic() { return mySignal() },
  get children() { return Child() }
});
```

这意味着这些 props 会被惰性求值。props 的访问将被推迟到某些地方有用到它们。这保留了响应性，而不会引入无关的封装代码或同步行为。然而，这意味着存在子组件或元素的情况下，重复访问可能会导致重新创建。

大多数情况下，你只是将这些元素插入到 JSX 中，所以不会有问题。但是当你处理 children 时，你需要格外小心。

出于这个原因，Solid 有 `children` 工具函数。此方法既会根据 children 访问创建 memo 缓存，还会处理任何嵌套的子级响应式引用，以便可以直接与 children 交互。

在示例中，我们有一个动态列表，我们希望设置它们的 `color` 样式属性。如果我们直接与 `props.children` 交互，不仅会多次创建节点，还会发现 children 本身是一个从 `<For>` 返回的 Memo 函数。

让我们在 `colored-list.tsx` 中使用 `children` 工具函数：

```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```

现在让我们创建一个 Effect 来更新元素。

```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
