Signals are the most core reactive primitives. They contain values that change over time.

To create a Signal you can import `createSignal` from `solid-js` and call it from our Counter component like this:
```jsx
const [count, setCount] = createSignal(0);
```

The argument passed to the create call is the initial value and an array is returned with 2 functions, a getter and a setter. Using destructuring we can name these whatever we like. In this case we name the getter `count` and the setter `setCount`.

It is important to notice that the first returned value is a getter and not the value itself. This is because the framework needs to intercept wherever the value is read to automatically track for changes. So keep in mind that where the value is accessed is significant.

In this lesson we will use `setInterval` to create an incrementing counter. We can update our `count` signal every second by adding this code to our Counter component.

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

We read the previous count, add 1, and set the new value.

> Solid's Signals also accept a function form where you can use the previous value to set the next value.
> ```jsx
> setCount(c => c + 1)
> ```

Finally we need to read our signal in our JSX code.

```jsx
return <div>Count: {count()}</div>;
```
