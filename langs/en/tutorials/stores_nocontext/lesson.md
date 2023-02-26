Context is a great tool for stores. It handles injection, ties ownership to the reactive graph, automatically manages disposal, and has no render overhead given Solid's fine-grained rendering.

Sometimes context is overkill, though; an alternative is to use the reactive system directly. For example, we can build a global reactive data store by creating a signal in a global scope, and `export`ing it for other modules to use:

```js
import { createSignal } from 'solid-js';

export default createSignal(0);

// somewhere else:
import counter from './counter';
const [count, setCount] = counter;
```

Solid's reactivity is a universal concept. It doesn't matter if it is inside or outside components. However, computations (Effects/Memos) created in the global scope are rootless, and will exist for the lifetime of the app/tab (rather than being disposed). There is no separate concept for global vs local state. It is all the same thing.


However, sometimes you have state which exists across multiple components, but isn't truly global. Alternatively, you may wish to "override" your state in a certains part of the component tree. We use Context to solve these cases.

In this tutorial `counter.tsx` is such a global store. We can use it by modifying our component in `main.tsx` to:

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

> It is possible to create your own root to hold the global store, instead of using Context, but Context is generally a simpler solution. Additionally, it is important to note that global state should not be used in SSR (server side rendering) solutions, such as Solid Start. On the server, global state is shared across requests, and the lack of data isolation can (and will) lead to bugs, memory leaks and has security implications. It is recommended that application state should always be provided via context instead of relying on global.

> It should be noted that Context is a form of dependency injection, it _is not_ a reactive primitive.
