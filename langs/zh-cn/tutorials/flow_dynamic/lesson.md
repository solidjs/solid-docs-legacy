`<Dynamic>` 标签处理根据数据渲染时很有用。`<Dynamic>` 可以让你将元素的字符串或组件函数传递给它，并使用提供的其余 props 来渲染组件。

这通常比编写多个 `<Show>` 或 `<Switch>` 组件更简练。

在示例中，我们可以替换 `<Switch>` 语句

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === "red"}>
    <RedThing />
  </Match>
  <Match when={selected() === "green"}>
    <GreenThing />
  </Match>
</Switch>
```

使用以下代码进行替换：

```jsx
<Dynamic component={options[selected()]} />
```
