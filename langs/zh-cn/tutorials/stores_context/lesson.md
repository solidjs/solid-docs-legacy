Solid 提供了一个 Context API 来传递数据，Context 不依赖于 props 传递。这对于共享 Signal 和 Store 很有用。使用 Context 的好处是创建的 Context 是响应式系统的一部分创建并由之管理。

首先，我们创建一个 Context 对象。该对象包含一个用于注入数据的 `Provider` 组件。但是通常的做法是将 `Provider` 组件和 `useContext` 消费者与已经为 Context 设置的数据封装在一起。

这正是我们在本教程中的内容。你可以在 `counter.tsx` 文件中查看简单计数器 Store 的定义。

要使用 Context，我们需要使用 `CounterProvider` 组件包装 App 组件以在全局范围内注入 Context。并在设置初始计数值为 1。

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

接下来我们需要在 `nested.tsx` 组件中消费数据。可以通过使用封装的 `useCounter` 消费者来达到目的。

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```