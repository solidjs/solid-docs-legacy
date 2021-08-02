Solid supports custom directives through the `use:` namespace. This is just a syntactic sugar over `ref` but is useful in that it resembles typical bindings and there can be multiple bindings on the same element without conflict. This makes it better tool for reusable DOM element behavior.

Custom directives are simply functions in the form `(element, valueAccesor)` where `valueAccessor` is a function that retrieves the bindings value. As long as the function is imported in scope you can use it with `use:`.

> Important: `use:` is detected by the compiler to be transformed, and the function is required to be in scope, so it cannot be part of spreads or applied to a component.

In this example we are going to make a simple wrapper for click outside behavior to close a popup or modal. First we need to import and use our `clickOutside` directive on our element.

```jsx
<div class="modal" use:clickOutside={() => setShow(false)}>
  Some Modal
</div>
```

Open `click-outside.tsx` we will be defining our custom directive here. This directive defines a click handler that we bind to the body and cleanup when it is time.

```jsx
export default function clickOutside(el, accessor) {
  const onClick = (e) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
```

Now you should be able to go back and forth between opening and closing the modal.
