在某些时候使用引用相等来比较行没有意义。在处理原始值或二维数组时，将值视为键可能会导致很多不必要的渲染。例如，如果我们将一个字符串列表映射到可以编辑每个字段的 `<input>` 字段，对该值的每次更改都会导致 `<input>` 被重新创建，因为它被视为唯一标识符。

在上述情况下，从概念上讲，数组索引是列表的实际键。为此，我们提供 `<Index>` 组件。

`<Index>` 与 `<For>` 具有相似的签名，除了数据项是 Signal 并且索引是固定的。

```jsx
<Index each={cats()}>
  {(cat, i) => (
    <li>
      <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
        {i + 1}: {cat().name}
      </a>
    </li>
  )}
</Index>
```
