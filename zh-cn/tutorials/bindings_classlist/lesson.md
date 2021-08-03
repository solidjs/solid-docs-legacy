Solid 支持同时使用 `class` 和 `className` 来设置元素的 `className` 属性。然而，条件设置 class 可以给开发者提供便利。出于这个原因，Solid 提供一个内置的 `classList` JSX 属性，`classList` 接受一个对象，其中键是类名，值是一个布尔表达式。当为 true 时应用该 class，当为 false 时该 class 被移除。

我们可以替换：

```jsx
<button
  class={current() === "foo" ? "selected" : ""}
  onClick={() => setCurrent("foo")}
>
  foo
</button>
```

用下面代码替换:

```jsx
<button
  classList={{ selected: current() === "foo" }}
  onClick={() => setCurrent("foo")}
>
  foo
</button>
```

也不要忘了，你还可以用 CSS 模块中接收到的类名进行动态设置。

```jsx
import { active } from "./style.module.css";

<div classList={{ [active]: isActive() }} />;
```
