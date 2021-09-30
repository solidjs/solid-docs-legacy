If you want to iterate over a list, the `<For>` component is the best way for any array of non-primitive values. It is automatically keyed by reference, so as data updates it is optimized to update or move rows rather than recreate them. The callback is non-tracking and passes the item and an index Signal.

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```
The `index` is a Signal so that it can update independently when the row is moved. The item is not a Signal as changing would mean a new reference and cause a new row to be created. The way to do nested updates is to make nested Signals or use Solid's Store proxy.

You can also use `<For>` to iterate over other iterable objects that are not arrays by using methods like `Object.keys` or simple spreading into an array like `[...iterable]`.