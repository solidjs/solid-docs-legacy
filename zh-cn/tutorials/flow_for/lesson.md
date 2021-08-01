如果你想遍历一个列表，`<For>` 组件是遍历任何非原始值数组的最佳方式。它通过引用自动键引用，以便在数据更新时对其进行优化以更新或移动行而不是重新创建它们。`<For>` 的回调函数是非跟踪的，并传递数据项和索引 Signal。

```jsx
<For each={cats()}>
  {(cat, i) => (
    <li>
      <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
        {i() + 1}: {cat.name}
      </a>
    </li>
  )}
</For>
```

`index` 是一个 Signal，因此它可以在移动行时独立更新。数据项不是 Signal，因为更改将意味着新引用并会导致创建新行。进行嵌套更新的方法是创建嵌套 Signal 或使用 Solid 的 Store 代理。

你还可以使用 `<For>` 来迭代其他不是数组的可迭代对象，方法是使用类似 `Object.keys` 的方法或简单地扩展到类似 `[...iterable]` 的数组中。
