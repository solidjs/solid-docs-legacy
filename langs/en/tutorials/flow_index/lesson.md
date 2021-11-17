You now know how to render lists in Solid with `<For>`, but Solid also provides the `<Index>` component, which will cause less rerenders in certain situations.

When the array updates, the `<For>` component uses referential equality to compare elements to the last state of the array. But this isn't always desired. 

In JavaScript, primitives (like strings and numbers) are always compared by value. When using `<For>` with primitive values or arrays of arrays, we could cause a lot of unnecessary rendering. if we used `<For>` to map a list of strings to an `<input>` field that could edit it, every change to that value would cause the `<input>` to be recreated. 

The `<Index>` component is provided for these cases. As a rule of thumb, when working with primitives use `<Index>`. 

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```

 It has a similar signature to `<For>`, except this time the item is the signal and the index is fixed. Each rendered node corresponds to a spot in the array. Whenever the data in that spot changes, the signal will update.
 




