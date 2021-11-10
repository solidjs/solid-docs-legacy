Solid 中只有少量的生命周期，因为一切的存活销毁都由响应系统控制。响应系统是同步创建和更新的，因此唯一的调度就是将逻辑写到更新结束的 Effect 中。

我们发现处理简单任务的开发者通常不会这么想，所以为了让事情变得更容易一些，我们将非跟踪（从不重新运行）`createEffect` 调用取了一个别名 —— `onMount`。它只是一个 Effect 调用，但你可以放心使用它，一旦所有初始渲染完成，它只会在组件中运行一次。

让我们使用 `onMount` 钩子来获取一些照片：

```js
onMount(async () => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/photos?_limit=20`
  );
  setPhotos(await res.json());
});
```

生命周期仅在浏览器中运行，因此将代码放在 `onMount` 中的好处是在 SSR 期间不在服务器上运行。即使我们在这个例子中进行数据获取，通常我们使用 Solid 的 Resource 来实现真正的服务器/浏览器协调。
