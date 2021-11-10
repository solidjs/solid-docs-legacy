某些时候你可能有多个要协调的 `Suspense` 组件。一种方法是将所有内容都放在一个 `Suspense` 下，但这将子组件限制成单一的加载行为。单一的回退状态意味着一切都需要等到最后一件事被加载。所以，Solid 引入了 `SuspenseList` 组件来协调这些组件。

考虑像我们的例子一样有多个 `Suspense` 组件。如果我们将 `SuspenseList` 的 `revealOrder` 属性配置为 `forwards` 来包裹内容，子组件将按照它们在树中出现的顺序呈现，而不管它们加载的顺序。这减少了页面跳转。 你可以将 `revealOrder` 设置为 `backwards` 或 `together`，`backwards` 将反转组件展示顺序，`together` 则会等待所有 Suspense 组件加载完毕。此外，还有一个 `tail` 选项可以设置为 `hidden` 或 `collapsed`。这会覆盖显示所有回退的默认行为，要么不显示，要么显示按照 `revealOrder` 设置的方向显示下一个。

我们的示例目前在加载占位符方面有点混乱。虽然它独立加载所有数据，但我们经常根据加载的订单数据显示多个占位。让我们将 `ProfilePage` 组件的 JSX 包装在 `<SuspenseList>` 中。

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={props.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={props.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={props.trivia} />
  </Suspense>
</SuspenseList>
```
