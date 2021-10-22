Signal 是包装可跟踪值的简单 getter 函数。没有什么特别的。这意味着任何包装访问 Signal 的函数实际上都是一个 Signal 并且也是可跟踪的。放在 JSX 中的任何 JavaScript 表达式也是如此。只要它访问一个 Signal，它就会被更新。

理解 Solid 中的组件只是执行一次的函数非常重要。确保更新的唯一方法是将 Signal 包裹在计算或 JSX 中。但是，你始终可以通过将表达式包装在函数中来将其提升出来。这样就可以重复使用了。

让我们通过引入一个 `doubleCount` 函数来更新我们的 Counter ，将计数乘以 2。

```jsx
const doubleCount = () => count() * 2;
```

然后我们替换读取值位置。

```jsx
return <div>Count: {doubleCount()}</div>;
```

这只是个小示例，展示了 `doubleCount` 可以被内联，然而它说明了如何组合 Signal 以及如何使派生 Signal 可传递。
