Most of the time composing derived Signals is sufficient. However, it is sometimes beneficial to cache values in order to reduce duplicated work. We can use Memos, a special primitive, to store and access the last cached value without re-evaluating it until their dependencies change. By preventing re-evaluation when the value is read we reduce work required to access expensive operations like DOM Node creation, particularly when accessed in many places, or as part of Effects that have multiple dependencies.

Memos are both a tracking computation, like an Effect, and a read-only Signal. Since they are aware of both their dependencies and their observers they can ensure that they only run once for any change. This makes them preferable to registering Effects that write to Signals. Generally, what can be derived, should be derived.

Creating a Memo is as simple as passing a function to `createMemo` which can be imported from `solid-js`. In the example recalculating the value gets increasingly more expensive with each click. Simply wrapping it in createMemo only recalculates one per click.

```jsx
const fib = createMemo(() => fibonacci(count()));
```
Place a console.log inside the `fib` function if you want to confirm.
```jsx
const fib = createMemo(() => {
  console.log("Calculating Fibonacci");
  return fibonacci(count());
});
```