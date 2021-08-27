大多数打包器（如 Webpack、Rollup、Parcel、Vite）在使用动态导入时会自动进行代码分割处理。Solid 的 `lazy` 方法允许包装组件的动态导入来实现延迟加载。然后输出一个可以在 JSX 模板中正常使用的组件，它会在第一次渲染时在内部动态加载底层导入的代码，此时会暂停渲染分支直到代码可用。

使用 `lazy` 替换 import 语句。

```js
import Greeting from "./greeting";
```

用下面的代码替换：

```js
const Greeting = lazy(() => import("./greeting"));
```

但是仍然可能因为加载太快而无法看到效果。但是如果想让加载更明显，你可以添加一个模拟延迟。

```js
const Greeting = lazy(async () => {
  // 模拟延迟
  await new Promise((r) => setTimeout(r, 1000));
  return import("./greeting");
});
```
