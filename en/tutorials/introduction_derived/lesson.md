We've seen that whenever we access a signal in JSX, it will automatically update the view when that signal changes. But the component function itself only executes once. 

We can create new expressions that depend on&mdash;and will be updated by&mdash;signals by wrapping a signal in a function. A function that accesses a signal is effectively also a signal: its value changes when its wrapped signal changes, and it will in turn update its readers.


Let's update our Counter to count by 2 by introducing a `doubleCount` function:

```jsx
const doubleCount = () => count() * 2;
```

We can then read `doubleCount` just like a signal in our template: 
```jsx
return <div>Count: {doubleCount()}</div>;
```

We call functions like these _derived signals_ because they gain their reactivity from the signal they access.