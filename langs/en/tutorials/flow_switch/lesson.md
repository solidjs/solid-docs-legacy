Sometimes you need to deal with conditionals with more than 2 mutual exclusive outcomes. For this case, we have the `<Switch>` and `<Match>` components modeled roughly after JavaScript's `switch`/`case`.

The `when` conditions are checked in order and the content of the first `<Match>` component with a matching condition is rendered. If all conditions fail, `fallback` is rendered.

In the example, we can replace our nested `<Show>` components with this:

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
