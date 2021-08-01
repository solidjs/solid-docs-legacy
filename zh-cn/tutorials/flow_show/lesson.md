JSX 允许使用 JavaScript 来控制模板中的逻辑流。然而，如果没有虚拟 DOM，天真地使用诸如 `Array.prototype.map` 之类的东西会在每次更新时很浪费地重新创建所有 DOM 节点。相反，Reactive 库使用模板工具是很常见。在 Solid 中，我们将其封装在组件中。

最基本的控制流是条件。Solid 的编译器足够聪明，可以优化处理三元组 (`a ? b : c`) 和布尔表达式 (`a && b`)。然而，使用 `<Show>` 组件通常更简洁。

要仅显示正确的按钮来展示当前状态，请将 JSX 更新为：

```jsx
<Show
  when={loggedIn()}
  fallback={() => <button onClick={toggle}>Log in</button>}
>
  <button onClick={toggle}>Log out</button>
</Show>
```

`fallback` 属性充当 `else`，在传递给 `when` 的条件不为 `true` 时显示。

现在单击按钮将像你所期望的那样来回更改。
