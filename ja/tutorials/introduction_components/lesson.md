As you build your applications you will want to break apart your code for better modularity and re-usability. In Solid the main way of doing that is by creating components.

Components are just functions like the one we've been using in the tutorial so far. They can be represented as tags in a parent's JSX and upon first render are executed. After that they are never called again. All updates instead are applied by Solid's reactive system which we will be covering in the next couple of lessons.

In this example let's add our `Nested` component to our app. We've defined it in another file but you can put multiple components in the same file. First we must import it.

```js
import Nested from "./nested";
```

Then we need to add it to our JSX. In this case we now have 2 elements we want to return so we can wrap those in a Fragment.

```jsx
function App() {
  return (
    <>
      <h1>This is a Header</h1>
      <Nested />
    </>
  );
}
```
