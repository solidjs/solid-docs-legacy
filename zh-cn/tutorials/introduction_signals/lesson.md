Signal 是最核心的响应式基本要素（primitive）。Signal 包含随时间变化的值。

要创建 Signal，你可以从 `solid-js` 导入 `createSignal`，并在 Counter 组件调用它，如下所示：

```jsx
const [count, setCount] = createSignal(0);
```

传递给 createSignal 调用的参数是初始值，createSignal 返回一个带有 2 个函数的数组，一个是 getter，一个是 setter。我们可以使用解构随意命名这些参数。根据场景，我们将 getter 命名为 `count` 和 setter 命名为 `setCount`。

需要注意的是，第一个返回值是一个 getter 而不是值本身。这是因为框架需要拦截读取值的任何位置以自动跟踪更改。所以务必记住，访问值的位置很重要。

在本课中，我们将使用 `setInterval` 来创建一个递增计数器。我们可以通过将下面的代码添加到我们的 Counter 组件来实现每一秒更新一次 `count` Signal。

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

读取之前的计数，加 1，然后设置新值。

> Solid 的 Signal 也可以接收一个函数，你可以在其中使用前一个值来设置下一个值。
>
> ```jsx
> setCount((c) => c + 1);
> ```

最后，我们需要在 JSX 代码中读取 Signal。

```jsx
return <div>Count: {count()}</div>;
```
