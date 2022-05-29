Props 是一个在函数组件执行时传递进来的对象，其中包含了调用组件时绑定到 JSX 上的所有属性。Props 对象是只读的，并且含有封装为对象 getter 的响应式属性。它们具有一致的形式，无论调用者是使用 Signal、Signal 表达式还是简单值或静态值。 你只需通过 `props.propName` 访问它们。

正因如此，请时刻记住不能直接解构它们，这会导致被解构的值脱离追踪范围从而失去响应性。通常，在 Solid 的 primitive 或 JSX 之外访问 props 对象上的属性可能会失去响应性。除了解构，像是扩展运算以及 `Object.assign` 这样的函数也会导致失去响应性。

Solid 有一些工具函数可以帮助我们处理 props。 第一个 `mergeProps` 函数听起来很像它名字描述得那样合并 props。`mergeProps` 将潜在的响应式对象合并而不会失去响应式性。最常见的情况就是是为组件设置默认 props。

在示例中，在 `greetings.tsx` 中，我们内联了模板中的默认值，但我们也可以使用 `mergeProps` 设置默认值与此同时保持响 props 响应式更新。

```jsx
const merged = mergeProps({ greeting: "Hi", name: "John" }, props);

return <h3>{merged.greeting} {merged.name}</h3>
```
