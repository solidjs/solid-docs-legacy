源自 UI 的 JavaScript 错误不应破坏整个应用程序。错误边界(ErrorBoundary)是一个可以捕获子组件树任何位置产生的 JavaScript 错误，错误边界(ErrorBoundary) 会记录这些错误，并显示回退 UI 而非崩溃的组件树。

示例中，有一个组件使得我们的应用崩溃了。让我们将代码包裹在一个显示错误的错误边界(ErrorBoundary)组件中。

```jsx
<ErrorBoundary fallback={(err) => err}>
  <Broken />
</ErrorBoundary>
```
