大多数情况下，组合派生 Signal 就足够了。但是，有时缓存值以减少重复工作也很有用。我们可以使用 Memo（一种特殊的 primitive）来存储和访问最后一个缓存的值，而无需重新进行求值，直到它们的依赖关系发生变化才重新求值。通过在读取值时避免重新求值，减少了执行消耗性能的操作（如 DOM 节点创建），特别是在许多地方访问 Signal 的地方，或者说 Signal 被多个 Effect 依赖的情况下尤其有用。

Memo 既是是跟踪计算，类似 Effect，又是只读 Signal。由于知道对应依赖关系及其观察者，Memo 可以确保他们只对任何更改运行一次。 这比注册设置 Signal 的 Effect 更可取。一般来说，能派生出 Signal，就应该派生出 Signal。

创建 Memo 简单到只需要将一个函数传递给 `createMemo`，`createMemo` 可以从 `solid-js` 中导入。在示例中，每次点击重新计算值的性能消耗会越来越高。只需要简单地将逻辑包装在 createMemo 中，每次点击只会重新计算一次。

```jsx
const fib = createMemo(() => fibonacci(count()));
```

如果你想确认，请将 console.log 放在 `fib` 函数中。

```jsx
const fib = createMemo(() => {
  console.log("Calculating Fibonacci");
  return fibonacci(count());
});
```
