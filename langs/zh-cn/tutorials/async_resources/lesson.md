Resource 是专门设计用于处理异步加载的特殊 Signal。它提供了一种包装异步值方法，使得异步值在 Solid 的分布式执行模型中易于交互。与提供顺序执行模型的 `async`/`await` 或 `generators` 相反。Resource 的目标是让异步不再阻塞执行并且不会给我们的代码染色。

Resource 可以由来源 Signal 驱动，该来源 Signal 向返回 Promise 的异步数据 fetcher 函数提供查询功能。fetcher 函数的内容可以是任意内容。你可以使用传统的 REST 接口或 GraphQL 或其他任何可以产生 Promise 的代码。Resource 不会对加载数据的方式抱有偏见，只要它是由 Promise 驱动的。

生成的 Resource Signal，还包含响应式 `loading` 和 `error` 属性，可以根据当前状态轻松控制我们的视图。

所以我们用 resource 替换我们的用户 signal。

```js
const [user] = createResource(userId, fetchUser);
```

它由 `userId` Signal 驱动，并在发生变化时调用我们的 fetch 方法。没有太多其他的了。

从 createResource 返回的第二个值包含一个 `mutate` 方法，用于直接更新内部 Signal ，另外还有一个 `refetch` 方法，即使源没有改变，也可以用它来重新加载当前查询请求。

```js
const [user, { mutate, refetch }] = createResource(userId, fetchUser);
```

`lazy` 在内部使用 `createResource` 来管理其动态导入。
