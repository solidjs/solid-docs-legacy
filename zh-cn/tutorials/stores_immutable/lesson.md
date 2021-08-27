在 Solid 中，Store 通常使用 Solid 的代理创建。有时我们希望与 Redux、Apollo 或 XState 等不可变库进行交互，并且需要对这些库执行粒度更新。

在示例中，我们有一个 Redux 的简单封装实现。你可以在 `useRedux.tsx` 中看到它的源码。存储和操作的定义在其他文件中。

其核心行为是创建了一个 Store 对象并订阅 Redux Store 以在更新时更新状态。

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(store.getState())
);
```

如果您单击 demo 添加列表项并选中它们，它似乎工作得很好。然而，渲染效率低下不那么容易发现。请注意 `console.log` 不仅在创建时运行，而且在你选中该框时运行。

原因是 Solid 默认没有进行差异比对。它认定新增数据项是全新的并替换它。如果你的数据发生粒度变化，则无需进行差异对比。但你要怎么处理这种情况呢？

Solid 提供了一种差异对比方法 `reconcile`，`reconcile` 改进了 `setStore` 的使用，让我们能够区分来自这些不可变源的数据，只通知粒度更新。

让我们将该代码更新为：

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(reconcile(store.getState()))
);
```

现在这个例子就像你期望的那样运行，只在创建时运行创建代码。这不是解决这个问题的唯一方法，你也许看到过一些框架在它们的模板循环流上有一个 `key` 属性。

问题在于，通过 `key` 作为模板的默认部分，你始终需要运行列表协调，并且始终必须对比所有子项找出潜在更改，即使在已编译的框架中也是如此。以数据为中心的方法不仅使这适用于模板之外，而且是插拔式的。当你认为内部状态管理不需要协调时，这意味着我们默认这样可以达到最佳性能。

当然，在需要时使用 `reconcile` 没有任何问题。有时，一个简单的 reducer 可以很好地帮助我们组织数据更新。这种场景 `reconcile` 能发挥作用，下面制作你自己的 `useReducer` primitive：

```js
const useReducer = (reducer, state) => {
  const [store, setStore] = createStore(state);
  const dispatch = (action) => {
    state = reducer(state, action);
    setStore(reconcile(state));
  }
  return [store, dispatch];
};
```

`reconcile` 的行为是可配置的。可以设置自定义 `key`，并且有一个 `merge` 选项，`reconcile` 还会忽略结构性克隆并且只比较叶子节点。
