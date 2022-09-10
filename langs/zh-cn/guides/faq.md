# 常见问题

### 没有虚拟 DOM 的 JSX？这是 [雾件](https://zh.wikipedia.org/wiki/%E9%9C%A7%E4%BB%B6)吗？我听过一些重要的声音说这是不可能的。

当你没有 React 的更新模型时，这是可能的。JSX 是一种类似于 Svelte 或 Vue 中的模板语言——只是在某些方面更灵活。插入任意 JavaScript 有时可能具有挑战性，但与支持扩展运算符没有什么不同。所以不，这不是雾件，而是一种被证明是最高效的方法。

真正的好处在于它的可扩展性。我们有一个编译器为您工作，为您提供最佳的原生 DOM 更新，但您拥有像 React 这样的库的所有自由。您可以使用诸如 [render props](https://reactjs.org/docs/render-props.html) 之类的标准技术和高阶组件以及您的响应性 “hooks” 来编写组件。不喜欢 Solid 的控制流程如何工作？写你自己的。

### Solid 的性能如何？

我希望我只需要指出一件事，但它确实是几个重要设计决策的结合：

1. 显式响应性，因此只跟踪应该反应性的事物。
2. 编译时考虑到初始创建。Solid 使用启发式算法并结合正确的表达式来减少计算次数，同时保持关键更新的粒度和性能。
3. 响应式表达式只是函数。这使得 "消失的组件" 能够通过惰性 props 求值移除不必要的包装器和同步开销。

这些是目前独特的技术组合，使 Solid 在竞争中具有优势。

### 是否有 React 兼容包吗，或者以某种方式在 Solid 中使用我的 React 库？

没有。而且很可能永远不会有。虽然 API 相似，并且组件通常可以通过少量修改来迁移，但更新模型根本不同。React 组件反复渲染，因此 Hooks 之外的代码工作方式非常不同。闭包和钩子规则不仅在 Solid 中是不必要的：它们可以规定在这里不起作用的代码。

Vue 兼容包是可行的，尽管目前还没有实施它的计划。

另一方面，可以在 React 中运行 Solid。[React Solid State](https://github.com/solidjs/react-solid-state) 使 Solid API 在 React 函数组件中可访问。[reactjs-solidjs-bridge](https://github.com/Sawtaytoes/reactjs-solidjs-bridge) 允许您在 Solid 组件中渲染 React 组件，反之亦然，这在逐步移植应用程序时很有用。

### 为什么我不应该在我的模板中使用 `map`，`<For>` 和 `<Index>` 有什么区别？

如果您的数组是静态的，则使用 map 没有任何问题。但是如果你在一个 signal 或 响应属性上循环，`map` 是低效的：如果数组因任何原因发生变化，整个 map 将重新运行，所有节点都将重新创建。

`<For>` 和 `<Index>` 都提供了比这更智能的循环解决方案 它们将每个渲染的节点与数组中的一个元素耦合在一起，因此当数组元素发生变化时，只有相应的节点会重新渲染。

`<Index>` 将通过索引做到这一点：每个节点对应于数组中的一个索引； `<For>` 将通过值来执行此操作：每个节点对应于数组中的一条数据。这就是为什么在回调中，`<Index>` 给你一个 item 的 signal：每个 item 的索引被认为是固定的，但该索引处的数据可以改变。另一方面，`<For>` 给你一个索引 signal：item 的内容被认为是固定的，但如果元素在数组中移动，它可以移动。

例如，如果数组中的两个元素被交换，`<For>` 将重新定位两个对应的 DOM 节点并在此过程中更新它们的 `index()` 信号。`<Index>` 不会重新定位任何 DOM 节点，但会更新两个 DOM 节点的 `item()` 信号并导致它们重新呈现。

有关差异的深入演示，请查看 Ryan 直播的 [这个片段](https://www.youtube.com/watch?v=YxroH_MXuhw&t=2164s)。

### 为什么我在解构 props 时会失去响应？

使用 props 对象，通过跟踪属性访问来启用响应性。如果您在跟踪范围内访问属性，例如 JSX 表达式或 effect，则 JSX 表达式将重新呈现，或者 effect 将在该属性更改时重新运行。

解构时，您可以访问对象的属性。如果这发生在跟踪范围之外，Solid 将不会跟踪并重新运行您的代码。

在此示例中，属性访问发生在 JSX 模板中，因此会对其进行跟踪，并在信号更改时更新 span 内容：

```jsx
function BlueText(props) {
  return (
    <span style="color: blue">{props.text}</span>
  );
}
...
<BlueText text={mySignal()}/>
```

但是这些示例都不会更新 span 文本，因为属性访问发生在模板之外：

```jsx
function BlueText(props) {
  const text = props.text;
  return (
    <span style="color: blue">{text}</span>
  );
}
...
<BlueText text={mySignal()}/>
```

```jsx
function BlueText({text}) {
  return (
    <span style="color: blue">{text}</span>
  );
}
...
<BlueText text={mySignal()}/>
```

但是，如果您更喜欢提前解构的风格，可以使用两种不同的 Babel 转换来使（某些风格的）解构再次具有响应性：[babel-plugin-solid-undestructure](https://github.com/orenelbaum/babel-plugin-solid-undestructure) 和 [Solid Labels object features](https://github.com/LXSMNSYC/solid-labels/blob/main/docs/ctf.md#objects)。

### 为什么我的 `onChange` 事件处理程序没有按时触发？

在某些框架中，输入的 `onChange` 事件会被修改，以便在每次按键时触发。但这不是 `onChange` 事件 [原生工作](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onchange) 的方式：它旨在反映对输入的已提交更改，并且通常会在输入失去焦点时触发。要处理对输入值的所有更改，请使用`onInput`。

### 您可以添加对 class 组件的支持吗？我发现生命周期更容易推理。

我们不打算支持 class 组件。Solid 中组件的生命周期与响应式系统的调度相关，并且是人为的。您可以从中创建一个类，但实际上所有非事件处理程序代码都将在构造函数中运行，包括渲染函数。这只是你不细化数据要求更多语法的借口。

将数据及其行为组合在一起，而不是将生命周期组合在一起。这是一种已经奏效了数十年的响应式最佳实践。

### 我真的不喜欢 JSX，有没有机会使用不同的模板语言？ 哦，我看到有 Tagged Template Literals/HyperScript。也许我会用那些...

我们使用 JSX 就像 Svelte 使用他们的模板一样，来创建优化的 DOM 指令。Tagged Template Literal 和 HyperScript 解决方案本身可能确实令人印象深刻，但除非您有真正的理由，例如不使用构建工具的要求，否则它们在各方面都较差。较大的捆绑包、较慢的性能以及需要手动解决方法包装值。

有选择固然好，但 Solid 的 JSX 确实是这里最好的解决方案。一个模板 DSL 也很好，虽然限制性更强，但是 JSX 免费为我们提供了很多。现有的解析器、语法高亮、Prettier、代码完成，以及 TypeScript。

其他的库一直在添加对这些功能的支持，仍然不完善，并且经常令人头疼。而这些功能在 jsx 中开箱即用，并且完成度非常的高，其他人很难再做出一个比 jsx 更好的模版语言。

### 我什么时候使用 Signal 或者 Store? 它们有何不同?

store 自动包装嵌套值，使其成为深层数据结构，是数据模型的理想选择。对于大多数其他情况，Signal 是轻量级的，并且可以出色地完成工作。

尽管我很想将这些包装在一起作为一个单一的 API，但你不能代理基本数据类型。函数是最简单的接口，任何响应式式表达式（包括状态访问）都可以在传输时包装成一个，如果这提供了一个通用 API。你可以随意命名你的 signal 和状态，并且它保持最小。我想要做的最后一件事是在用户端强制键入 `.get()` `.set()` 或更糟的 `.value`。为了简洁起见，至少前者可以使用别名，而后者只是调用函数的最简单的方法。

### 为什么我不能像在 Vue、Svelte 或 MobX 中那样为 Solid 的 Store 赋值？有双向绑定么？

响应性是一种强大的工具，但也是一种危险的工具。MobX 知道这一点并引入了严格模式和 Action 来限制更新发生的位置/时间。在 Solid 处理整个组件数据树时，我意识到我们可以从 React 中学到一些东西。只要你提供拥有相同约定的方法，你就不需要实际上是不可变的数据。

能够传递更新状态的能力可以说比决定传递状态更重要。因此，能够将其分开很重要，而且只有在读取不可变的情况下才有可能。如果我们仍然可以粒度更新，我们也不需要付出不可变的成本。幸运的是，ImmutableJS 和 Immer 有大量的现有技术。具有讽刺意味的是，Solid 主要用作具有可变内部结构和不可变接口，和 Immer 刚好相反。

### 我可以单独使用 Solid 的响应性吗？

当然。虽然我没有导出一个独立的包，但很容易在没有编译器的情况下安装 Solid，只需使用反应 primitive。粒度响应性的好处之一是它与库无关。就此而言，几乎每个反应式库都是这样工作的。这启发了 [Solid](https://github.com/solidjs/solid) ，Solid 内部使用 [DOM 表达式库](https://github.com/ryansolid/dom-expressions) 并根据纯粹的响应式系统来创建的渲染器。

列出一些可尝试的库: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github.com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https://github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous), 甚至最近的 [Vue](https://github.com/vuejs/vue). 制作响应式库比将其标记到渲染器上工作量要多得多，例如 [lit-html](https://github.com/Polymer/lit-html)，但这有助于帮你找到感觉。

### Solid 有我可以使用的 Next.js 或 Material Components 之类的库吗？

我们正在开发 [SolidStart](https://github.com/solidjs/solid-start)，类似于 Next.js 或 SvelteKit。

对于组件库，我们有用于 Material 的 [SUID](https://suid.io/)、用于类似 Chakra 的解决方案的 [Hope UI](https://hope-ui.com/)、[Solid Bootstrap](https://solid-libs.github.io/solid-bootstrap/) 等等！ 查看我们的快速增长的库和工具 [生态系统](https://www.solidjs.com/ecosystem)。

如果您有兴趣构建自己的生态系统工具或者加入现有的生态系统工作，可以加入我们的 [Discord](https://discord.com/invite/solidjs) 的频道一起讨论。
