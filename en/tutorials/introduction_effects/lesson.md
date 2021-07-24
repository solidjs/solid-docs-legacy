Signals are trackable values, but they are only one half of the equation. The other half are the observers, also known as computations. The most fundamental computations are called Effects which create side effects – the output of our system.

An Effect can be created by importing `createEffect` from `solid-js`. It takes a function whose execution it watches. It automatically subscribes to any Signal that is read during its execution and re-runs any time one of those Signals value changes.

So let's create an Effect that re-runs whenever `count` changes.

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

To update our `count` Signal we are going to attach a click handler on our button.

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

Now clicking the button should write to the console. This is a relatively simple example but to understand how Solid works you should imagine that every expression in the JSX is potentially a separately wrapped Effect that re-executes whenever its dependent Signals change. This is how all rendering works in Solid. From Solid's perspective `all rendering is just a side effect of the reactive system`.

Effects that developers create with `createEffect` run after rendering has completed and are mostly used for scheduling post render updates that interact with the DOM.
