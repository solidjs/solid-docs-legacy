Solid 通过 `use:` 命名空间支持自定义指令。但这只是 `ref` 一个有用的语法糖，类似于原生的绑定，并且可以在同一个元素上有多个绑定而不会发生冲突。这可以让我们更好地利用可重用 DOM 元素行为。

自定义指令只是形式为 `(element, valueAccesor)` 的函数，其中 `valueAccessor` 是一个获取绑定值的函数。只要函数是在作用域中导入的，你就可以通过 `use:` 使用它。

> 重要提示：`use:` 需要被编译器检测并进行转换，并且函数需要在作用域内，因此不能作为传值的一部分或在组件上使用。

在这个例子中，我们将为点击外部行为制作一个简单的封装函数来关闭弹出窗口或模态框。首先，我们需要在我们的元素上导入并使用我们的 `clickOutside` 指令。

```jsx
<div class="modal" use:clickOutside={() => setShow(false)}>
  Some Modal
</div>
```

打开 `click-outside.tsx`，我们将在这里定义我们的自定义指令。该指令需要定义了一个单击事件处理程序，将其绑定到 body 并在需要时进行清理。

```jsx
export default function clickOutside(el, accessor) {
  const onClick = (e) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
```

现在你应该能够在打开和关闭模态框之间来回切换。
