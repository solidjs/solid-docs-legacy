Merging props is not the only operation we can do. Often we use destructuring to use some of the props on the current component but then split off others to pass through to child components.

For this purpose Solid has `splitProps`. It takes the props object and arrays of keys representing each object we want to accept those props. It returns an array per argument, plus one. The last element in the array will be an object with the rest of the remaining props that weren't specified, similar to the rest parameter.

Our example doesn't update when we set the name because of lost reactivity when we destructred in `greeting.tsx`:
```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

Instead we can maintain reactivity with `splitProps`:
```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```
Now the button works as expected.
