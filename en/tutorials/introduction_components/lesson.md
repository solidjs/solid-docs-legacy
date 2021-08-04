As you build your applications, you will want to break apart your code for better modularity and re-usability. In Solid, the main way of doing that is by creating components.

Components are just functions like the one we've been using in the tutorial so far. Child components can be included via tags in the parent's JSX, which causes the defining function to be called upon first render. After that, the component functions are never called again. All updates instead are applied by Solid's reactive system which we will be covering in the next couple of lessons.

In this example, let's add our `Nested` component to our app. We've defined it in another file, though you can put multiple components in the same file. First we must import it:

```js
import Nested from "./nested";
```

Then we need to add the component to our JSX. In this case, we now have 2 elements we want to return, so we can wrap those in a Fragment:

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
