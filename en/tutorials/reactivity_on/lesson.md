For convenience Solid has an `on` helper that enables setting explicit depenencies for our computations. This is mostly used as a terse way to be even more explicit about which Signals are tracked. However, it also allows the computation not to execute immediately and only run on first change. The `defer` option enables this.

Let's have our Effect only run when `a` updates and defer execution until the value changes.

```js
createEffect(on(a, (a) => {
  console.log(a, b());
}, { defer: true }));
```
