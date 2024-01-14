# Getting Started

**我们正在开发新文档.** 您可以在 [此处](https://docs.solidjs.com/guides/tutorials/getting-started-with-solid/welcome) 查看我们的新初学者教程，并加入我们在 [Discord](http://discord.com/invite/solidjs) 的频道。

## 了解 Solid

有关 Solid 核心概念的快速视频概述，请查看：

- [100 秒了解 Solid](https://youtu.be/hw3Bx5vxKl0)
- [10 分钟了解 Solid 响应性](https://youtu.be/J70HXl1KhWE)

## 使用 Solid

到目前为止，开始使用 Solid 的最简单方法是在线试用。我们在 https://playground.solidjs.com 上的 REPL 是尝试想法的完美方式。与 https://codesandbox.io/ 一样，您可以在其中修改任何 [我们的示例](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md)。

或者，您可以通过在终端中运行以下命令来使用我们的 [Vite 模板](https://github.com/solidjs/templates)：

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

或者使用 TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

或者您可以在自己的项目中安装依赖项。要将 Solid 与 JSX 一起使用（推荐），您需要安装 `solid-js` NPM 库和 [Solid JSX 编译器](https://github.com/ryansolid/dom-expressions/tree/main/packages/babel-plugin-jsx-dom-expressions) Babel 插件：

```sh
> npm install solid-js babel-preset-solid
```

然后将 `babel-preset-solid` 添加到你的 `.babelrc` 中，或者添加到 `webpack` 或 `rollup` 中的 Babel 配置中：

```json
"presets": ["solid"]
```

对于 TypeScript，将您的 `tsconfig.json` 设置为处理 Solid 的 JSX，如下所示（有关详细信息，请参阅 [TypeScript 指南](https://www.solidjs.com/guides/typescript)）：

```json
"compilerOptions": {
  "jsx": "preserve",
  "jsxImportSource": "solid-js",
}
```

## 学习 Solid

Solid 到处都是可组合的小片段，用这些片段用来构建应用块。这些部分主要由许多 API 的函数组成。幸运的是，你无需了解其中的大部分内容即可开始使用。

您可以使用两种主要类型的构建块是：组件和响应性 API。

组件是接受 props 对象并返回 JSX 元素的函数，包括原生 DOM 元素和其他组件。它们可以用 PascalCase 表示为 JSX 元素：

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

组件是轻量级的，因为它们本身没有状态并且没有实例。相反，它们充当 DOM 元素和响应性 API 的工厂函数。

Solid 的细粒度响应性建立在三个核心 API 之上：signal、memo 和 effect。它们共同构成了一个自动跟踪同步引擎，可确保您的视图保持最新。响应式计算采用同步执行的函数包装表达式的形式。

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

您可以了解更多关于 Solid [响应性](/guides/reactivity) 和 [渲染](/guides/rendering) 的信息。

## Solid 理念

Solid 的设计提出了一些可以帮助我们最好地构建网站和应用程序的原则和价值观。当你了解 Solid 背后的哲学时，学习和使用 Solid 会更容易。

### 1. 声明式数据

声明式数据是将数据行为的描述与其声明联系起来的实践。这允许我们通过将数据行为的所有方面打包在一个地方来轻松组合。

### 2. 消失的组件

在不考虑更新的情况下构建组件已经够难的了。Solid 的组件更新是彼此完全独立的。组件函数被调用一次，然后就不再存在。组件的存在是为了组织你的代码，而不是其他。

### 3. 读/写 分离

精确的控制和可预测性有助于打造更好的系统。我们不需要真正的不变性来强制执行单向数据流，只需要能够有意识到哪些消费者可能会写，哪些可能不会。

### 4. 简单胜于容易

细粒度响应性教会我们：明确且一致的约定即使需要更多努力也是值得的。且有必要提供最少的工具作为构建的基础。

## Web 组件

Solid 生而将 Web 组件作为一等公民。随着时间的推移，它的设计不断发展，目标也发生了变化。然而，Solid 仍然是编写 Web 组件的好选择。[Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) 允许你编写和包装 Solid 的函数组件以生成小型且高性能的 Web 组件。在 Solid 应用程序中，Solid Element 仍然能够利用 Solid 的 Context API，并且 Solid 的 Portals 支持隔离样式的 Shadow DOM 。

## 服务端渲染

Solid 拥有动态的服务器端渲染解决方案，可实现真正的同构开发体验。通过使用我们的 Resource primitive，很容易进行异步数据请求，更重要的是，我们也可以在客户端和浏览器之间自动序列化和同步。

由于 Solid 支持服务器上的异步和流式渲染，因此你可以以一种方式编写代码并让它在服务器上执行。这个特性类似 [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense)，并且代码分割特性也适用于 Solid。

更多信息，请阅读 [服务端渲染指南](#ssr).

## 不使用构建工具

如果您需要或喜欢在非编译环境中使用 Solid，例如纯 HTML 文件、https://codepen.io 等，您可以在普通的 JavaScript 中使用 [` html`` ` Tagged Template Literals](https://github.com/solidjs/solid/tree/main/packages/solid/html) 或 [HyperScript `h()` functions](https://github.com/solidjs/solid/tree/main/packages/solid/h)，而不是 Solid 的编译时优化的 JSX 语法。

您可以使用 [Skypack](https://www.skypack.dev/) 直接从浏览器运行它们，例如：

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
        // or
        return h("div", {}, count);
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

无构建的优势伴随着权衡：

- 表达式必须始终包裹在 getter 函数中，否则它们将不会是响应式的。当 `first` 或 `last` 值更改时，以下内容不会更新，因为在模板内部创建的 effect 内没有访问这些值，因此不会跟踪依赖项：
  ```js
  html` <h1>Hello ${first() + " " + last()}</h1> `;
  // or
  h("h1", {}, "Hello ", first() + " " + last());
  ```
  当 `first` 或 `last` 更改时，以下内容将按预期更新，因为模板将从 effect 中的 getter 读取，并且将跟踪依赖项：
  ```js
  html` <h1>Hello ${() => first() + " " + last()}</h1> `;
  // or
  h("h1", {}, "Hello ", () => first() + " " + last());
  ```
  Solid 的 JSX 没有这个问题，因为它的编译时能力，像 `<h1>Hello {first() + ' ' + last()}</h1>` 这样的表达式将是响应式的。
- 构建时优化不会像 Solid JSX 那样到位，这意味着应用程序启动速度会稍微慢一些，因为每个模板在第一次执行时都会在运行时编译，但对于许多用例来说是难以察觉的。` html`` ` 模板标签启动后的持续速度将与 JSX 相同。`h()` 调用将始终具有较慢的持续速度，因为它们无法在执行之前静态分析整个模板。

您需要相应的 DOM 表达式库才能使它们与 TypeScript 一起使用。您可以将标记模板文字与 [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) 搭配 或 HyperScript 与 [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions) 搭配。
