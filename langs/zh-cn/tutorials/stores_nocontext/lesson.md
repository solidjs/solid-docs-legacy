Context 适合用来做数据存储。Context 处理注入，将所有权与响应图联系起来，自动管理销毁，并且鉴于 Solid 的细粒度渲染，而且没有渲染开销。

但是，你也可以直接将响应式系统用于简单的场景。尽管几乎没有指出的必要，但一个简单的可写 Store 确实就是一个 Signal：

```js
import { createSignal } from 'solid-js';

export default createSignal(0);

// 别的地方的代码
import counter from './counter';
const [count, setCount] = counter;
```

Solid 的响应性是一个普遍的概念。它跟是内部组件还是外部组件都没有关系。全局状态和局部状态没有不同的概念。都是一样的。

唯一的限制是所有计算（Effect/Momo）都需要在响应顶层即 —— `createRoot` 下创建。Solid 的 `render` 会自动执行此操作。

在本教程中，`counter.tsx` 就是这样一个全局 Store。我们可以将 `main.tsx` 中的组件修改为：

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

所以当你使用包含计算的复杂全局 Store 时，一定要调用 `createRoot`。 或者更好的选择是出于为了方便使用 Context。
