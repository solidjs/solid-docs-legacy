Signals are simple getter functions that wrap a trackable value. There is nothing particularly special about them. This means that any function that wraps accessing a Signal is effectively a Signal and is also trackable. The same is true of any JavaScript expression you put in JSX. As long as it accesses a Signal it will update.

It is important to understand that Components in Solid are just functions that execute once. The only way to ensure that anything updates is to be wrapped in a computation or JSX. However you can always hoist an expression out by wrapping it in a function. This way it can be re-used.

Let's update our Counter to count by 2 by introducing a `doubleCount` function.

```jsx
const doubleCount = () => count() * 2;
```

We then replace where it is being read.

```jsx
return <div>Count: {doubleCount()}</div>;
```

This is trivial and `doubleCount` could just be inlined, but it illustrates how to both compose Signals and how to make derived Signals transferable.
