有时在应用程序的正常顺序之外插入元素是很有用。Z-index 有时不足以处理像模态框类浮动元素的渲染上下文。

Solid 提供一个 `<Portal>` 组件，`<Portal>` 的子内容将被插入到选择的位置。默认情况下，它的元素将在 `document.body` 下的 `<div>` 中呈现。

在示例中，我们看到信息弹出框被截断了。我们可以通过将元素包装在 `<Portal>` 中将其从正常 DOM 顺序中拉出来解决这个问题：

```jsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Some text you might need for something or other.</p>
  </div>
</Portal>
```
