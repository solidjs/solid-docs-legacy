Sometimes it doesn't make sense to use referential equality to compare rows. When dealing with primitive values or arrays of arrays, treating the value as the key could cause a lot of unnecessary rendering. For example, if we mapped a list of strings to an `<input>` field that could edit each, every change to that value would cause the `<input>` to be recreated as it is seen as the unique identifier.

In these cases, conceptually, the array index is the actual key to the list. For that we have Solid's `<Index>` component.

`<Index>` has a similar signature to `<For>`, except this time the item is the signal and the index is fixed:

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```
